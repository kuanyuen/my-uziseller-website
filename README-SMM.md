# UziSeller SMM API integration

## Vercel Environment Variables

Set these on the Vercel project (Production, and Preview if you want to test there):

- `SMM_API_URL` = `https://smm.appmmo.com/api/v2`
- `SMM_API_KEY` = your real SMM API key
- `VND_TO_MYR_RATE` = optional, defaults to `0.000156`. The supplier's `rate` field is in **Vietnamese Dong** — this converts it to MYR for display.
- `SMM_MARKUP_PERCENT` = optional, defaults to `30`. The same markup is applied to every public SMM service price.
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
- Removes only products whose PRODUCT NAME explicitly identifies Vietnam as the target region. Vietnamese-language wording by itself is NOT a reason for removal.
- The Vietnam filter checks ONLY the product name, not category, platform, or description.
- Keeps supplier data unchanged internally, while the customer-facing layer localizes service names, categories, descriptions, service types and completion-time text into English/Chinese.
- Converts the supplier's VND rate to MYR/USD/CNY and applies the configured customer markup to every service.
- Tags every service with a normalized `platformLabel` (Facebook / TikTok / Instagram / YouTube / Threads / Telegram / Twitter-X / Others) derived from the supplier's Vietnamese platform/category text, so the storefront can show platform filter buttons.

## Frontend (index.html / script.js)

The `#smm` section on the homepage:
- Fetches `/api/smm?action=services` on load.
- Renders platform filter buttons (auto-generated from whatever platforms are actually present in the data, with counts).
- Has a real search control: typing filters live, the Search button runs the search, and Enter works on mobile/desktop keyboards.
- Search covers Service ID, service name, category, platform, description and service type.
- Shows 40 matching services at a time with a Load More control, so the full catalogue remains reachable without rendering all 1,000+ cards at once.
- Each card shows the service description, price, min/max, and an Order Now button that opens the detailed order modal.

## Language & currency switcher

- Top-right of the header: `EN / 中文` toggle and `RM / $ / ¥` toggle.
- Language covers both static site copy and dynamic SMM catalogue content. Supplier Service IDs/API fields stay unchanged; only customer-facing labels are localized.
- Currency covers both the SMM catalogue (server computes MYR/USD/CNY per service) and the fixed-price Gemini offer (converted client-side from its RM base price using the same rates as the switcher).
- Both choices persist in the visitor's browser (`localStorage`) across visits.
- To add more site copy in the future, tag the element with `data-i18n="key"` (plain text), `data-i18n-html="key"` (text containing HTML like `<span>` or `<br>`), or `data-i18n-placeholder="key"` (input placeholders), then add the `en`/`zh` pair to the `I18N` dictionary in `i18n.js`.

## Important

The frontend currently uses WhatsApp for the actual customer order button — this is intentional so your agents/resellers can browse the live catalogue immediately. The server-side `add` endpoint is present for the next step (automatic checkout), which we'll wire up to a payment gateway + order storage when you're ready.

Before enabling automatic paid ordering, protect the `add`, `status`, and `balance` routes with your order/payment system and store orders in a database (for example Vercel KV/Redis or another database).



## Customer-facing panel update

The SMM tab is now structured around the same ordering flow as the supplier storefront: quick service search, platform/category/service selection, service information, target link(s), quantity, comments when applicable, scheduled execution, Dripfeed when supported, order total, review step, payment, and customer order-status tracking.

The catalogue is also presented as a compact service list so customers can compare ID, platform, category, min/max, refill/cancel/Dripfeed availability, and customer price before selecting a service.

Bulk links are supported by the checkout flow as separate supplier orders under one UziSeller payment. Supplier status is re-checked from the customer order-status page after submission.
