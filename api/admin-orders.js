// Admin-only order dashboard API.
import { listRecentOrders, updateOrder } from "../lib/store.js";

const KNOWN_STATUSES = new Set([
  "pending_payment",
  "paid",
  "processing",
  "partial_supplier_submission",
  "completed",
  "partial",
  "payment_failed",
  "needs_manual_review",
  "supplier_issue"
]);

function adminAuth(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return req.headers["x-admin-password"] === expected;
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

function clampLimit(value) {
  const n = Number(value || 100);
  if (!Number.isFinite(n)) return 100;
  return Math.max(1, Math.min(500, Math.floor(n)));
}

function searchableText(order) {
  return [
    order.id,
    order.billId,
    order.email,
    order.customerName,
    order.name,
    order.productName,
    order.service,
    order.productId,
    order.link,
    ...(Array.isArray(order.links) ? order.links : []),
    order.supplierOrderId,
    ...(Array.isArray(order.supplierOrderIds) ? order.supplierOrderIds : []),
    order.supplierTransactionId,
    order.status
  ].filter(Boolean).join(" ").toLowerCase();
}

function filterOrders(orders, query = {}) {
  const q = String(query.q || "").trim().toLowerCase();
  const status = String(query.status || "").trim();
  const type = String(query.type || "").trim();

  return orders.filter((order) => {
    if (status && order.status !== status) return false;
    if (type) {
      const orderType = order.type === "subscription" ? "subscription" : "smm";
      if (orderType !== type) return false;
    }
    if (q && !searchableText(order).includes(q)) return false;
    return true;
  });
}

function buildStats(orders) {
  const statusCounts = {};
  let revenueMYR = 0;
  for (const order of orders) {
    statusCounts[order.status || "unknown"] = (statusCounts[order.status || "unknown"] || 0) + 1;
    if (!["pending_payment", "payment_failed"].includes(order.status)) {
      const amount = Number(order.priceMYR || 0);
      if (Number.isFinite(amount)) revenueMYR += amount;
    }
  }
  return {
    total: orders.length,
    revenueMYR: Math.round(revenueMYR * 100) / 100,
    pendingPayment: statusCounts.pending_payment || 0,
    needsAttention: (statusCounts.needs_manual_review || 0) + (statusCounts.supplier_issue || 0) + (statusCounts.partial_supplier_submission || 0),
    statusCounts
  };
}

function splitIds(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value || "")
    .split(/[\n,]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function buildPatch(body = {}) {
  const patch = {};
  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    const status = String(body.status || "").trim();
    if (!KNOWN_STATUSES.has(status)) {
      const err = new Error("Invalid status");
      err.statusCode = 400;
      throw err;
    }
    patch.status = status;
  }
  if (Object.prototype.hasOwnProperty.call(body, "supplierOrderId")) {
    patch.supplierOrderId = String(body.supplierOrderId || "").trim() || null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "supplierOrderIds")) {
    patch.supplierOrderIds = splitIds(body.supplierOrderIds);
    patch.supplierOrderId = patch.supplierOrderIds[0] || patch.supplierOrderId || null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "supplierTransactionId")) {
    patch.supplierTransactionId = String(body.supplierTransactionId || "").trim() || null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "supplierError")) {
    patch.supplierError = String(body.supplierError || "").trim() || null;
  }
  if (Object.prototype.hasOwnProperty.call(body, "internalNote")) {
    patch.internalNote = String(body.internalNote || "").trim();
  }
  return patch;
}

export default async function handler(req, res) {
  if (!adminAuth(req)) {
    return json(res, 401, { status: "error", msg: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      const limit = clampLimit(req.query.limit);
      const recent = await listRecentOrders(500);
      const sorted = recent.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const filtered = filterOrders(sorted, req.query).slice(0, limit);
      return json(res, 200, { status: "ok", stats: buildStats(sorted), orders: filtered });
    }

    if (req.method === "PATCH") {
      const id = String(req.query.id || req.body?.id || "").trim();
      if (!id) return json(res, 400, { status: "error", msg: "Missing order id" });
      const patch = buildPatch(req.body || {});
      if (!Object.keys(patch).length) return json(res, 400, { status: "error", msg: "No editable fields provided" });
      const order = await updateOrder(id, patch);
      if (!order) return json(res, 404, { status: "error", msg: "Order not found" });
      return json(res, 200, { status: "ok", order });
    }

    return json(res, 405, { status: "error", msg: "Method not allowed" });
  } catch (e) {
    return json(res, e.statusCode || 500, { status: "error", msg: e.message });
  }
}
