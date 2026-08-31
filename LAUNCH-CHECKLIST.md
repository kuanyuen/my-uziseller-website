# UziSeller launch checklist

## Before production
- Set all variables in `.env.example` in Vercel Production.
- Use production Billplz credentials with `BILLPLZ_SANDBOX=false`.
- Enable Billplz X Signature and set `BILLPLZ_X_SIGNATURE_KEY`.
- Set callback URL to `https://uziseller.com/api/billplz-webhook`.
- Set `SITE_URL=https://uziseller.com`.
- Set `SMM_API_KEY` and `SHOP_APMMO_API_KEY`; keep them server-side only.
- Connect Vercel KV/Redis so order storage works.
- Set a strong `ADMIN_PASSWORD` if the admin page is used.

## Smoke test after deployment
1. Home page loads on mobile.
2. Google AI Pro shows RM60.
3. App Subscriptions loads products, categories, search, detail and checkout.
4. SMM loads services.
5. Facebook category shows its services instead of zero results.
6. Search button and mobile Enter both work.
7. Load More exposes services beyond the first 60.
8. SMM order creates a Billplz payment page.
9. Billplz callback updates the order and supplier submission happens once.
10. Order status page shows both SMM and subscription orders.

- SMM storefront review: verify platform/category/service selectors, single-link orders, multi-link orders, comments, scheduled orders, Dripfeed, price calculation, Billplz checkout, webhook submission, and order-status polling.
