# Production configuration

## Hosting

- Vercel project: `my-uziseller-website` in the `uzi-seller` scope
- Domains: `https://www.uziseller.com` and `https://uziseller.com`
- Runtime configuration and secrets: manage in the Vercel project settings

Use this existing project for production releases. Do not copy credentials into source files, reports, screenshots, or chat messages.

## Production smoke check

Verified on 2026-10-02:

- `/` returned HTTP 200
- `/order-status.html` returned HTTP 200
- `/admin/` returned HTTP 200
- `/api/smm?action=services` returned HTTP 200 with JSON
- `/api/subscriptions?action=products` returned HTTP 200 with JSON
- `/api/order-status` without an order ID returned HTTP 400, as expected for invalid input
