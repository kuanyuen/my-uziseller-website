// Public, read-only order status lookup — returns only what a customer
// needs to see, never internal fields like email/link.
import { getOrder, saveOrder } from "../lib/store.js";
import { getSupplierOrderStatus } from "../lib/smm.js";
import { getOrder as getShopOrder } from "../lib/shop-apmmo.js";

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) { res.status(400).json({ status: "error", msg: "Missing id" }); return; }

  const order = await getOrder(id);
  if (!order) { res.status(404).json({ status: "error", msg: "Order not found" }); return; }

  // Keep customer-facing status current by checking the supplier when an
  // order has already been paid/submitted. This is read-only from the user's
  // perspective; the API key remains server-side.
  // Keep customer-facing digital-product orders current through SHOP.APPMMO.
  // Supplier transaction details are read server-side only.
  if (order.type === "subscription" && order.supplierTransactionId && ["completed","processing","paid"].includes(order.status)) {
    try {
      const supplier = await getShopOrder(order.supplierTransactionId);
      order.supplierOrderStatus = supplier?.status || supplier?.data?.status || null;
      order.supplierOrderResponse = supplier;
      // We only downgrade/upgrade when the supplier clearly signals a terminal state.
      const text = JSON.stringify(supplier).toLowerCase();
      if (/cancel|failed|refund|error/.test(text) && !/success|completed/.test(text)) order.status = "supplier_issue";
      else if (/complete|success|delivered|finish/.test(text)) order.status = "completed";
      else order.status = "processing";
      order.updatedAt = new Date().toISOString();
      await saveOrder(order);
    } catch (e) {
      // Keep the previous local status if the supplier order endpoint is unavailable.
    }
  }

  const ids = Array.isArray(order.supplierOrderIds) && order.supplierOrderIds.length
    ? order.supplierOrderIds
    : (order.supplierOrderId ? [order.supplierOrderId] : []);
  if (ids.length && ['processing','partial_supplier_submission'].includes(order.status)) {
    try {
      const results = await Promise.all(ids.slice(0, 20).map(getSupplierOrderStatus));
      const statuses = results.map(r => String(r?.status || '').toLowerCase()).filter(Boolean);
      if (statuses.length) {
        if (statuses.every(s => ['completed','complete','success','done'].includes(s))) order.status = 'completed';
        else if (statuses.some(s => ['canceled','cancelled','refunded','failed'].includes(s))) order.status = 'supplier_issue';
        else if (statuses.some(s => ['partial','partially completed'].includes(s))) order.status = 'partial';
        else order.status = 'processing';
        order.supplierStatuses = results;
        order.updatedAt = new Date().toISOString();
        await saveOrder(order);
      }
    } catch (e) {
      // Do not fail the customer status page when the supplier status service
      // is temporarily unavailable. The last local status remains visible.
    }
  }

  res.status(200).json({
    status: "ok",
    order: {
      id: order.id,
      type: order.type || null,
      name: order.name || order.productName || "Order",
      quantity: order.quantity,
      priceMYR: order.priceMYR,
      status: order.status,
      supplierOrderId: order.supplierOrderId || null,
      supplierOrderIds: order.supplierOrderIds || [],
      supplierTransactionId: order.supplierTransactionId || null,
      linksCount: Array.isArray(order.links) ? order.links.length : 1,
      schedule: order.schedule || null,
      dripfeed: !!order.dripfeed,
      createdAt: order.createdAt,
      deliveryAvailable: !!order.deliveryAvailable,
      deliveryData: order.type === "subscription" && Array.isArray(order.deliveryData) ? order.deliveryData : []
    }
  });
}
