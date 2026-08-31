# UziSeller — APPMMO Direct Marketplace Layout

This version changes the App Subscriptions storefront to an APPMMO-style marketplace layout instead of the previous UziSeller card design.

## Data flow
- `/api/subscriptions?action=products` -> `https://shop.appmmo.com/api/products.php`
- `/api/subscriptions?action=product&product=ID` -> `https://shop.appmmo.com/api/product.php?product=ID`
- Supplier API key is read only from `SHOP_APPMMO_API_KEY` on the server.
- Product detail view renders the supplier's returned structured fields, including unknown fields, instead of hard-coding a single description field.
- Checkout continues through `/api/subscription-checkout`.

## Vercel
The required variable name is exactly:

`SHOP_APPMMO_API_KEY`

Set it for Production, Preview and Development as needed, then redeploy.

## 2026-08 marketplace refinement
- The customer storefront now mirrors the supplier shop's information architecture more closely: category sidebar, product list, live search, sorting, recent-order shortcut, payment/help shortcuts, right-side account/order panel, and detailed product modal.
- Supplier product IDs/details remain dynamic; customer-facing names/categories use UziSeller localization rules.
- SHOP product prices default to VND when the supplier response omits a currency, then convert using `VND_TO_MYR` and apply `SUBSCRIPTION_MARKUP_PERCENT`.
- Customer prices never expose supplier cost.
