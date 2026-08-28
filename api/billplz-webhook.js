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
      const supplierResult = await placeOrder({
        service: order.service,
        link: order.link,
        quantity: order.quantity
      });

      if (supplierResult && supplierResult.order) {
        order.status = "processing";
        order.supplierOrderId = supplierResult.order;
      } else {
        order.status = "needs_manual_review";
        order.supplierResponse = supplierResult;
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
