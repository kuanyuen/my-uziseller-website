# UziSeller SMM API integration

## Vercel Environment Variables

Set these on the Vercel project (Production, and Preview if you want to test there):

- `SMM_API_URL` = `https://smm.appmmo.com/api/v2`
- `SMM_API_KEY` = your real SMM API key

Do not put the API key in `index.html`, `script.js`, GitHub, or any public file.

## What is connected

- `GET /api/smm?action=services` → calls SMM `action=services` and returns a cleaned public catalogue.
- `POST /api/smm?action=add` → server-side order creation.
- `POST /api/smm?action=status` → server-side order status lookup.
- `GET /api/smm?action=balance` → server-side balance lookup.

The public catalogue removes clearly Vietnam-only services and removes the literal `KingSmm.VN` string from displayed text. It applies the current UziSeller +30% markup to the supplier rate.

## Important

The frontend currently uses WhatsApp for the actual customer order button. This is intentional for the quick customer-visible launch. The server-side `add` endpoint is present for the next payment-confirmed automation step.

Before enabling automatic paid ordering, protect the `add`, `status`, and `balance` routes with your order/payment system and store orders in a database (for example Vercel KV/Redis or another database).
