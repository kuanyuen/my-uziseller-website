// Admin endpoint to retry automated fulfillment for orders that failed or need manual review.
import { getOrder, updateOrder } from "../lib/store.js";
import { placeOrder } from "../lib/smm.js";
import { buyProduct } from "../lib/shop-apmmo.js";

function adminAuth(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return req.headers["x-admin-password"] === expected;
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { status: "error", msg: "Method not allowed" });
  }

  if (!adminAuth(req)) {
    return json(res, 401, { status: "error", msg: "Unauthorized" });
  }

  const { orderId } = req.body || {};
  if (!orderId) {
    return json(res, 400, { status: "error", msg: "Missing orderId" });
  }

  const order = await getOrder(orderId);
  if (!order) {
    return json(res, 404, { status: "error", msg: "Order not found" });
  }

  try {
    if (order.type === "subscription") {
      const supplierResult = await buyProduct({
        productId: order.productId,
        quantity: order.quantity,
        coupon: order.coupon || ""
      });
      const supplierOk = supplierResult?.status === "success" || supplierResult?.success === true || supplierResult?.ok === true;
      if (supplierOk) {
        const tx = supplierResult.trans_id || supplierResult.transaction_id || supplierResult.order_id || supplierResult.order || supplierResult.id || supplierResult.data?.trans_id || supplierResult.data?.transaction_id || supplierResult.data?.order_id || supplierResult.data?.order || null;
        const rawDelivery = Array.isArray(supplierResult.data)
          ? supplierResult.data
          : (Array.isArray(supplierResult.result) ? supplierResult.result : (Array.isArray(supplierResult.data?.items) ? supplierResult.data.items : []));

        const deliveryData = rawDelivery.map((item) => {
          if (typeof item !== "string") return { raw: item };
          const text = item.trim();
          const parts = text.split("|");
          return parts.length >= 2
            ? { raw: text, fields: parts.map((v) => String(v).trim()) }
            : { raw: text, fields: [text] };
        });

        const patch = {
          status: "completed",
          supplierTransactionId: tx ? String(tx) : null,
          deliveryData,
          deliveryAvailable: deliveryData.length > 0,
          supplierResponse: supplierResult,
          supplierError: null,
          updatedAt: new Date().toISOString()
        };
        const updated = await updateOrder(order.id, patch);
        return json(res, 200, { status: "ok", msg: "Auto-delivery succeeded", order: updated });
      } else {
        const patch = {
          status: "needs_manual_review",
          supplierResponse: supplierResult,
          supplierError: supplierResult?.msg || supplierResult?.message || "Supplier purchase returned failure",
          updatedAt: new Date().toISOString()
        };
        const updated = await updateOrder(order.id, patch);
        return json(res, 200, { status: "error", msg: "Supplier returned error", order: updated });
      }
    } else {
      // SMM Order retry
      const links = Array.isArray(order.links) && order.links.length ? order.links : [order.link];
      const supplierOrders = [];
      const failures = [];
      for (const targetLink of links) {
        try {
          const supplierResult = await placeOrder({
            service: order.service,
            link: targetLink,
            quantity: order.quantity,
            comments: order.comments || '',
            schedule: order.schedule || '',
            dripfeed: !!order.dripfeed,
            runs: order.runs || 2,
            interval: order.interval || 10
          });
          if (supplierResult && supplierResult.order) supplierOrders.push(String(supplierResult.order));
          else failures.push(supplierResult);
        } catch (err) {
          failures.push({ error: err.message });
        }
      }

      if (supplierOrders.length === links.length) {
        const patch = {
          status: "processing",
          supplierOrderIds: supplierOrders,
          supplierOrderId: supplierOrders[0] || null,
          supplierFailures: null,
          supplierError: null,
          updatedAt: new Date().toISOString()
        };
        const updated = await updateOrder(order.id, patch);
        return json(res, 200, { status: "ok", msg: "SMM auto-order placed", order: updated });
      } else if (supplierOrders.length) {
        const patch = {
          status: "partial_supplier_submission",
          supplierOrderIds: supplierOrders,
          supplierFailures: failures,
          updatedAt: new Date().toISOString()
        };
        const updated = await updateOrder(order.id, patch);
        return json(res, 200, { status: "partial", msg: "Partially placed", order: updated });
      } else {
        const patch = {
          status: "needs_manual_review",
          supplierFailures: failures,
          supplierError: failures[0]?.error || "Failed to place SMM order with supplier",
          updatedAt: new Date().toISOString()
        };
        const updated = await updateOrder(order.id, patch);
        return json(res, 200, { status: "error", msg: "Failed to place with supplier", order: updated });
      }
    }
  } catch (e) {
    const patch = {
      status: "needs_manual_review",
      supplierError: e.message,
      updatedAt: new Date().toISOString()
    };
    await updateOrder(order.id, patch);
    return json(res, 500, { status: "error", msg: e.message });
  }
}
