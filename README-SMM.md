# UziSeller SMM API integration

## Vercel Environment Variables

Set these on the Vercel project (Production, and Preview if you want to test there):

- `SMM_API_URL` = `https://smm.appmmo.com/api/v2`
- `SMM_API_KEY` = your real SMM API key
- `VND_TO_MYR_RATE` = optional, defaults to `0.000156`. The supplier's `rate` field is in **Vietnamese Dong** — this converts it to MYR for display.
- `USD_TO_MYR_RATE` = optional, defaults to `4.04` (1 USD ≈ 4.04 MYR).
- `CNY_TO_MYR_RATE` = optional, defaults to `0.60` (1 CNY ≈ 0.60 MYR).

All three exchange rates move over time — update them occasionally (check a currency converter) to keep displayed prices accurate.

Do not put the API key in `index.html`, `script.js`, GitHub, or any public file.

**The API key shown in your screenshot (`2738de4d...`) has now been visible in chat/screenshots — treat it as potentially exposed and rotate it in the smm.appmmo.com dashboard before going live**, then only ever put the new one in the Vercel env var.

## What is connected

- `GET /api/smm?action=services` → calls SMM `action=services` and returns a cleaned public catalogue.
- `POST /api/smm?action=add` → server-side order creation (not yet wired to a payment flow — see "Next step" below).
- `POST /api/smm?action=status` → server-side order status lookup.
- `GET /api/smm?action=balance` → server-side balance lookup.

The public catalogue:
- Removes clearly Vietnam-only services (keeps global/mixed ones).
- Removes the literal `KingSmm.VN` string from displayed text.
- Converts the supplier's VND rate to MYR/USD/CNY. No markup is applied — prices shown are the original supplier cost price. (If you later want a margin, reintroduce a multiplier in `api/smm.js`'s `publicServices` function.)
- Tags every service with a normalized `platformLabel` (Facebook / TikTok / Instagram / YouTube / Threads / Telegram / Twitter-X / Others) derived from the supplier's Vietnamese platform/category text, so the storefront can show platform filter buttons.

## Frontend (index.html / script.js)

The `#smm` section on the homepage:
- Fetches `/api/smm?action=services` on load.
- Renders platform filter buttons (auto-generated from whatever platforms are actually present in the data, with counts).
- Has a search box that filters by name/category.
- Shows up to 150 matching services as cards with price, min/max, and a WhatsApp order button.

## Language & currency switcher

- Top-right of the header: `EN / 中文` toggle and `RM / $ / ¥` toggle.
- Language covers all static site copy (`index.html`) via `i18n.js` (dictionary of every translatable string). Product names/descriptions coming live from the supplier API are shown as-is (Vietnamese/English mix from the source) since they can't be reliably auto-translated.
- Currency covers both the SMM catalogue (server computes MYR/USD/CNY per service) and the fixed-price Gemini offer (converted client-side from its RM base price using the same rates as the switcher).
- Both choices persist in the visitor's browser (`localStorage`) across visits.
- To add more site copy in the future, tag the element with `data-i18n="key"` (plain text), `data-i18n-html="key"` (text containing HTML like `<span>` or `<br>`), or `data-i18n-placeholder="key"` (input placeholders), then add the `en`/`zh` pair to the `I18N` dictionary in `i18n.js`.

## Important

The frontend currently uses WhatsApp for the actual customer order button — this is intentional so your agents/resellers can browse the live catalogue immediately. The server-side `add` endpoint is present for the next step (automatic checkout), which we'll wire up to a payment gateway + order storage when you're ready.

Before enabling automatic paid ordering, protect the `add`, `status`, and `balance` routes with your order/payment system and store orders in a database (for example Vercel KV/Redis or another database).

