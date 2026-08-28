// Public checkout endpoint — no login required, customers call this directly
// from the "Order Now" button on any SMM catalogue card.
// Server looks up the live supplier price itself; the client only sends a
// service ID + quantity, never a price (never trust a client-submitted price).
import { randomUUID } from "crypto";
import { getServiceById } from "../lib/smm.js";
import { createBill } from "../lib/billplz.js";
import { saveOrder, trackOrderId } from "../lib/store.js";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { status: "error", msg: "Method not allowed" });

  try {
    const { serviceId, link, quantity, email, name } = req.body || {};
    if (!serviceId || !link || !quantity || !email || !name) {
      return json(res, 400, { status: "error", msg: "serviceId, link, quantity, email and name are required" });
    }

    const service = await getServiceById(serviceId);
    if (!service) return json(res, 404, { status: "error", msg: "Service not found (it may no longer be offered by the supplier)" });

    const qty = Number(quantity);
    const min = service.min || 1;
    const max = service.max || Number.MAX_SAFE_INTEGER;
    if (!Number.isFinite(qty) || qty < min || qty > max) {
      return json(res, 400, { status: "error", msg: `Quantity must be between ${min} and ${max}` });
    }

    // Billplz (FPX/card) settles in MYR regardless of which currency the
    // customer was browsing in — that's just a display preference.
    const totalMYR = Math.round(((service.prices.MYR * qty) / 1000) * 100) / 100;
    const amountCents = Math.round(totalMYR * 100);
    if (amountCents < 100) {
      return json(res, 400, { status: "error", msg: "Order amount too small (minimum RM1.00)" });
    }

    const orderId = randomUUID();
    const siteUrl = process.env.SITE_URL || `https://${req.headers.host}`;

    const bill = await createBill({
      amountCents,
      name,
      email,
      description: `${service.name} x${qty}`,
      callbackUrl: `${siteUrl}/api/billplz-webhook`,
      redirectUrl: `${siteUrl}/order-status.html?order=${orderId}`,
      referenceId: orderId
    });

    const order = {
      id: orderId,
      service: service.service,
      name: service.name,
      platformLabel: service.platformLabel,
      link,
      quantity: qty,
      priceMYR: totalMYR,
      email,
      customerName: name,
      status: "pending_payment",
      billId: bill.id,
      billUrl: bill.url,
      createdAt: new Date().toISOString()
    };
    await saveOrder(order);
    await trackOrderId(orderId);

    return json(res, 200, { status: "ok", orderId, paymentUrl: bill.url });
  } catch (e) {
    return json(res, 500, { status: "error", msg: e.message });
  }
}
