// Billplz payment gateway integration (Bill creation + X Signature verification).
// Docs: https://support.billplz.com/api
import crypto from "crypto";

function base() {
  return process.env.BILLPLZ_SANDBOX === "true"
    ? "https://www.billplz-sandbox.com/api"
    : "https://www.billplz.com/api";
}

function authHeader() {
  const key = process.env.BILLPLZ_API_KEY;
  if (!key) throw new Error("BILLPLZ_API_KEY is not configured");
  return "Basic " + Buffer.from(key + ":").toString("base64");
}

export async function createBill({ amountCents, name, email, description, callbackUrl, redirectUrl, referenceId }) {
  const collectionId = process.env.BILLPLZ_COLLECTION_ID;
  if (!collectionId) throw new Error("BILLPLZ_COLLECTION_ID is not configured");

  const form = new URLSearchParams();
  form.set("collection_id", collectionId);
  form.set("email", email);
  form.set("name", name);
  form.set("amount", String(amountCents));
  form.set("description", description.slice(0, 200));
  form.set("callback_url", callbackUrl);
  if (redirectUrl) form.set("redirect_url", redirectUrl);
  if (referenceId) {
    form.set("reference_1_label", "Order ID");
    form.set("reference_1", referenceId);
  }

  const r = await fetch(`${base()}/v3/bills`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });

  const data = await r.json();
  if (!r.ok) {
    const msg = data?.error?.message?.join(", ") || `Billplz create bill failed (HTTP ${r.status})`;
    throw new Error(msg);
  }
  return data; // { id, url, ... }
}

// Verifies the X Signature on an incoming callback payload
// (req.body from the server-to-server POST, application/x-www-form-urlencoded).
export function verifyXSignature(payload) {
  const key = process.env.BILLPLZ_X_SIGNATURE_KEY;
  if (!key || !payload) return false;

  const { x_signature, ...rest } = payload;
  if (!x_signature) return false;

  const sourceString = Object.keys(rest)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}${rest[k] ?? ""}`)
    .join("|");

  const computed = crypto.createHmac("sha256", key).update(sourceString).digest("hex");

  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(String(x_signature), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
