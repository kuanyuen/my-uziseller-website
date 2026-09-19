// Admin endpoint to check upstream supplier balances and health status
import { getProfile as getShopProfile } from "../lib/shop-apmmo.js";
import { getBalance as getSmmBalance } from "../lib/smm.js";

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
  if (req.method !== "GET") {
    return json(res, 405, { status: "error", msg: "Method not allowed" });
  }

  if (!adminAuth(req)) {
    return json(res, 401, { status: "error", msg: "Unauthorized" });
  }

  const result = {
    status: "ok",
    timestamp: new Date().toISOString(),
    suppliers: {
      shopApmmo: { status: "unknown", balance: null, currency: "VND", error: null },
      smmApmmo: { status: "unknown", balance: null, currency: "USD", error: null }
    }
  };

  // 1. Check APMMO Shop Profile / Balance
  try {
    const shopData = await getShopProfile();
    const balance = shopData?.balance ?? shopData?.money ?? shopData?.user?.balance ?? shopData?.data?.balance ?? null;
    result.suppliers.shopApmmo = {
      status: "online",
      balance: balance !== null ? Number(balance) : "N/A",
      currency: "VND",
      raw: shopData
    };
  } catch (e) {
    result.suppliers.shopApmmo = {
      status: "error",
      balance: null,
      currency: "VND",
      error: e.message
    };
  }

  // 2. Check SMM Balance
  try {
    const smmData = await getSmmBalance();
    const balance = smmData?.balance ?? smmData?.money ?? smmData?.data?.balance ?? null;
    const currency = smmData?.currency || "USD";
    result.suppliers.smmApmmo = {
      status: "online",
      balance: balance !== null ? Number(balance) : "N/A",
      currency,
      raw: smmData
    };
  } catch (e) {
    result.suppliers.smmApmmo = {
      status: "error",
      balance: null,
      currency: "USD",
      error: e.message
    };
  }

  return json(res, 200, result);
}
