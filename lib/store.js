// Order persistence using Vercel KV (Upstash Redis under the hood).
// Vercel injects KV_REST_API_URL / KV_REST_API_TOKEN automatically once the
// Redis integration is connected — @vercel/kv reads those by default.
import { kv } from "@vercel/kv";

export async function saveOrder(order) {
  await kv.set(`order:${order.id}`, order);
  if (order.billId) await kv.set(`bill:${order.billId}`, order.id);
  return order;
}

export async function getOrder(id) {
  if (!id) return null;
  return (await kv.get(`order:${id}`)) || null;
}

export async function updateOrder(id, patch = {}) {
  const current = await getOrder(id);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    id: current.id,
    updatedAt: new Date().toISOString()
  };
  await saveOrder(next);
  return next;
}

export async function getOrderByBillId(billId) {
  if (!billId) return null;
  const orderId = await kv.get(`bill:${billId}`);
  if (!orderId) return null;
  return getOrder(orderId);
}

export async function trackOrderId(id) {
  await kv.lpush("order:index", id);
  await kv.ltrim("order:index", 0, 499);
}

export async function listRecentOrders(limit = 50) {
  const ids = await kv.lrange("order:index", 0, limit - 1);
  if (!ids || ids.length === 0) return [];
  const orders = await Promise.all(ids.map((id) => kv.get(`order:${id}`)));
  return orders.filter(Boolean);
}
