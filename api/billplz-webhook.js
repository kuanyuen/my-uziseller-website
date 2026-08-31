// Billplz server-to-server payment callback (X Signature variant).
// This is the ONLY place that should trust "payment succeeded" — never the
// browser redirect, which is best-effort UX only.
import { verifyXSignature } from "../lib/billplz.js";
import { getOrderByBillId, saveOrder } from "../lib/store.js";
import { placeOrder } from "../lib/smm.js";
import { buyProduct } from "../lib/shop-apmmo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).end(); return; }

  const payload = req.body || {};

  if (!verifyXSignature(payload)) {
    res.status(401).json({ status: "error", msg: "Invalid signature" });
    return;
  }

  const billId = payload.id;
  const paid = payload.paid === "true" || payload.paid === true;

  const order = await getOrderByBillId(billId);
  if (!order) {
    res.status(200).json({ status: "ok" });
    return;
  }

  // Idempotency guard: Billplz retries callbacks, and the redirect + webhook
  // can race — only act once per order.
  if (order.status !== "pending_payment") {
    res.status(200).json({ status: "ok" });
    return;
  }

  if (!paid) {
    order.status = "payment_failed";
    order.updatedAt = new Date().toISOString();
    await saveOrder(order);
    res.status(200).json({ status: "ok" });
    return;
  }

  order.status = "paid";
  order.paidAt = new Date().toISOString();
  // Persist before calling the supplier. Billplz retries callbacks if the
  // handler is slow; saving here prevents duplicate supplier orders.
  await saveOrder(order);

  try {
    if (order.type === "subscription") {
      const supplierResult = await buyProduct({
        productId: order.productId,
        quantity: order.quantity,
        coupon: order.coupon || ""
      });
      if (supplierResult?.status === "success") {
        order.status = "completed";
        order.supplierTransactionId = supplierResult.trans_id || null;
        order.deliveryData = supplierResult.data || [];
        order.supplierResponse = supplierResult;
      } else {
        order.status = "needs_manual_review";
        order.supplierResponse = supplierResult;
      }
    } else {
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
        order.status = "processing";
        order.supplierOrderIds = supplierOrders;
        order.supplierOrderId = supplierOrders[0] || null;
      } else if (supplierOrders.length) {
        order.status = "partial_supplier_submission";
        order.supplierOrderIds = supplierOrders;
        order.supplierFailures = failures;
      } else {
        order.status = "needs_manual_review";
        order.supplierFailures = failures;
      }
    }
  } catch (e) {
    order.status = "needs_manual_review";
    order.supplierError = e.message;
  }

  order.updatedAt = new Date().toISOString();
  await saveOrder(order);
  res.status(200).json({ status: "ok" });
}
