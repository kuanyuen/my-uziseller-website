import {
  authenticateAccount,
  createAccount,
  createSession,
  getAccountFromRequest,
  getWalletBalanceCents,
  isValidEmail,
  normalizeEmail,
  toPublicAccount
} from "../lib/accounts.js";
import { listRechargeTransactions } from "../lib/wallet.js";
import { listRecentOrders } from "../lib/store.js";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  const action = String(req.query?.action || req.body?.action || "").toLowerCase();

  try {
    if (req.method === "GET" && action === "me") {
      const account = await getAccountFromRequest(req);
      if (!account) return json(res, 401, { status: "error", msg: "Authentication required" });

      const [balanceCents, transactions] = await Promise.all([
        getWalletBalanceCents(account.id),
        listRechargeTransactions(account.id)
      ]);
      return json(res, 200, {
        status: "ok",
        user: toPublicAccount(account),
        wallet: { balanceCents, balanceMYR: balanceCents / 100, currency: "MYR", transactions }
      });
    }

    if (req.method === "GET" && action === "orders") {
      const account = await getAccountFromRequest(req);
      if (!account) return json(res, 401, { status: "error", msg: "Authentication required" });
      const orders = (await listRecentOrders(500))
        .filter(order => String(order.email || "").toLowerCase() === account.email)
        .slice(0, 30)
        .map(({ id, service, name, priceMYR, status, createdAt, deliveryAvailable }) => ({
          id, service, name, priceMYR, status, createdAt, deliveryAvailable: !!deliveryAvailable
        }));
      return json(res, 200, { status: "ok", orders });
    }

    if (req.method !== "POST") {
      return json(res, 405, { status: "error", msg: "Method not allowed" });
    }

    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail) || typeof password !== "string" || !password || password.length > 1024) {
      return json(res, 400, { status: "error", msg: "A valid email and password are required" });
    }

    if (action === "register") {
      if (password.length < 6) {
        return json(res, 400, { status: "error", msg: "Password must be at least 6 characters" });
      }
      const account = await createAccount({ name: req.body?.name, email: normalizedEmail, password });
      if (!account) return json(res, 409, { status: "error", msg: "An account with that email already exists" });
      const token = await createSession(account.id);
      return json(res, 201, { status: "ok", token, user: toPublicAccount(account) });
    }

    if (action === "login") {
      const account = await authenticateAccount(normalizedEmail, password);
      if (!account) return json(res, 401, { status: "error", msg: "Invalid email or password" });
      const token = await createSession(account.id);
      return json(res, 200, { status: "ok", token, user: toPublicAccount(account) });
    }

    return json(res, 400, { status: "error", msg: "Unsupported account action" });
  } catch (error) {
    console.error("Account API error:", error);
    return json(res, 500, { status: "error", msg: "Account request failed" });
  }
}
