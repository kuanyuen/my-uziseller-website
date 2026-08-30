// Public, read-only order status lookup — returns only what a customer
// needs to see, never internal fields like email/link.
import { getOrder } from "../lib/store.js";

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) { res.status(400).json({ status: "error", msg: "Missing id" }); return; }

  const order = await getOrder(id);
  if (!order) { res.status(404).json({ status: "error", msg: "Order not found" }); return; }

  res.status(200).json({
    status: "ok",
    order: {
      id: order.id,
      name: order.name || order.productName || "Order",
      quantity: order.quantity,
      priceMYR: order.priceMYR,
      status: order.status,
      supplierOrderId: order.supplierOrderId || null,
      createdAt: order.createdAt
    }
  });
}
