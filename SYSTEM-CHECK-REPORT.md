# System check

## Production host

The production site is served by the `my-uziseller-website` project in the `uzi-seller` Vercel scope. Check deployment status and project environment variables in Vercel; do not record their values here.

## Safe smoke checks

These read-only routes can be checked without creating orders or exposing customer data:

- `https://www.uziseller.com/`
- `https://www.uziseller.com/order-status.html`
- `https://www.uziseller.com/admin/`
- `https://www.uziseller.com/api/smm?action=services`
- `https://www.uziseller.com/api/subscriptions?action=products`

The order lookup endpoint should reject a request that omits its order ID. Do not use a live payment checkout as a health check.

## Credentials

Keep provider keys, payment secrets, database tokens, and administrator passwords only in the Vercel project's environment-variable settings or a local ignored `.env.local` file.
