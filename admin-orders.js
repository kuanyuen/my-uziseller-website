// Admin-only: list recent orders for monitoring the checkout flow.
import { listRecentOrders } from "../lib/store.js";

function adminAuth(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return req.headers["x-admin-password"] === expected;
}

export default async function handler(req, res) {
  if (!adminAuth(req)) {
    res.status(401).json({ status: "error", msg: "Unauthorized" });
    return;
  }
  try {
    const orders = await listRecentOrders(50);
    res.status(200).json({ status: "ok", orders });
  } catch (e) {
    res.status(500).json({ status: "error", msg: e.message });
  }
}
