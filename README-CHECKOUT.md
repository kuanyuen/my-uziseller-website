# Customer checkout flow (Billplz + live smm.appmmo.com catalogue)

## What this adds
- **"Order Now" button** on every service card in the SMM catalogue opens an order modal (link + quantity + name + email, live price total).
- `api/checkout.js` — public endpoint. Looks up the live supplier price itself (never trusts a price from the browser), creates the order record and a Billplz payment link.
- `api/billplz-webhook.js` — Billplz's server-to-server payment callback. Verifies the X Signature, marks the order paid, then automatically places the real order with smm.appmmo.com.
- `order-status.html` + `api/order-status.js` — customer lands here after paying; polls for live status.
- `api/admin-orders.js` + the new panel in `/admin` — see every order and where it's stuck (pending payment / processing / needs manual review).
- `lib/store.js` — order storage via Vercel KV (Upstash Redis).
- `lib/billplz.js` — Bill creation + signature verification.
- `lib/smm.js` — shared supplier client + pricing (also used by `api/smm.js`'s public catalogue).

## One-time setup (in addition to what's already configured)
Environment variables you should already have from earlier setup:
`SMM_API_URL`, `SMM_API_KEY`, `ADMIN_PASSWORD`, `BILLPLZ_API_KEY`, `BILLPLZ_COLLECTION_ID`, `BILLPLZ_X_SIGNATURE_KEY`, `BILLPLZ_SANDBOX`, `SITE_URL`, plus the Redis vars Vercel/Upstash injected automatically (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc — `@vercel/kv` reads these by default, nothing to change).

No new environment variables are required for this step.

## How a purchase flows
1. Customer clicks **Order Now** on any service card → modal opens with that service's live price.
2. They enter their link, quantity, name and email, and click Pay.
3. `POST /api/checkout` re-validates quantity against min/max, re-fetches the live supplier price server-side (a cached copy, refreshed at most once a minute), creates the order (`pending_payment`) and a Billplz Bill, and returns the payment URL.
4. Customer completes payment on Billplz (FPX/card — settles in MYR regardless of which currency they were browsing in).
5. Billplz sends a **server-to-server callback** to `/api/billplz-webhook` — this is the source of truth, not the browser redirect.
6. The webhook verifies the signature, marks the order `paid`, then calls smm.appmmo.com (`action=add`) to place the real order. Success → `processing` + supplier order ID stored. Failure → `needs_manual_review`, visible in `/admin`.
7. Billplz also redirects the browser to `order-status.html`, which polls `/api/order-status` for live status.

## Pricing note
Prices are shown and charged at the **original supplier cost price** (VND converted to MYR/USD/CNY, no markup) — see the note in `README-SMM.md`. If you want a profit margin, add a multiplier back into `publicServices()` in `lib/smm.js`.

## Before going live
- **Test in Billplz sandbox first** if you haven't already run a real end-to-end order.
- **Watch your smm.appmmo.com balance** — if it runs dry, paid orders will pile up as `needs_manual_review` instead of failing silently. `getLiveServices`/`callSmm` in `lib/smm.js` already has a `balance` action wired up in `api/smm.js` for a future low-balance alert.
- **Check `/admin` regularly** for `needs_manual_review` orders — these are cases where the customer paid but the supplier order didn't go through automatically.
- The webhook is idempotent (`order.status !== 'pending_payment'` guard), so Billplz retrying a callback won't double-place an order.
