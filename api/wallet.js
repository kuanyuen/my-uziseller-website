import crypto from "crypto";
import { getAccountFromRequest, getWalletBalanceCents, toPublicAccount } from "../lib/accounts.js";
import { createBill } from "../lib/billplz.js";
import {
  createRecharge,
  failRecharge,
  listRechargeTransactions,
  saveRechargeBill
} from "../lib/wallet.js";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  try {
    const account = await getAccountFromRequest(req);
    if (!account) return json(res, 401, { status: "error", msg: "Authentication required" });

    if (req.method === "GET") {
      const [balanceCents, transactions] = await Promise.all([
        getWalletBalanceCents(account.id),
        listRechargeTransactions(account.id)
      ]);
      return json(res, 200, {
        status: "ok",
        wallet: { balanceCents, balanceMYR: balanceCents / 100, currency: "MYR", transactions }
      });
    }
    if (req.method !== "POST") {
      return json(res, 405, { status: "error", msg: "Method not allowed" });
    }

    const amountMYR = Number(req.body?.amountMYR);
    const amountCents = Math.round(amountMYR * 100);
    if (!Number.isFinite(amountMYR) || amountCents < 100 || amountCents > 1_000_000 ||
        Math.abs(amountMYR * 100 - amountCents) > 0.000001) {
      return json(res, 400, { status: "error", msg: "Top-up amount must be RM1.00 to RM10,000.00 in whole sen" });
    }

    const rechargeId = crypto.randomUUID();
    await createRecharge({ id: rechargeId, accountId: account.id, amountCents });
    const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;
    let bill;
    try {
      bill = await createBill({
        amountCents,
        name: toPublicAccount(account).name,
        email: account.email,
        description: `Wallet top-up RM${(amountCents / 100).toFixed(2)}`,
        callbackUrl: `${siteUrl}/api/billplz-webhook`,
        referenceId: rechargeId,
        referenceLabel: "Wallet Top-up ID"
      });
    } catch (error) {
      await failRecharge(rechargeId);
      console.error("Wallet top-up bill creation failed:", error);
      return json(res, 502, { status: "error", msg: error.message || "Could not create top-up bill" });
    }

    await saveRechargeBill(rechargeId, bill);
    return json(res, 200, {
      status: "ok",
      rechargeId,
      paymentUrl: bill.url,
      amountCents,
      amountMYR: amountCents / 100
    });
  } catch (error) {
    console.error("Wallet API error:", error);
    return json(res, 500, { status: "error", msg: "Wallet request failed" });
  }
}
