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


## API parity implemented

The UziSeller storefront now proxies the supplier API operations that were visible in the provider documentation/screenshots:

- `profile.php` — supplier account/profile (administrator only)
- `products.php` — full product/category catalogue
- `product.php` — full product details for a selected product
- `order.php` — supplier transaction/order detail for post-purchase status checks
- `buy_product` — supplier purchase after Billplz confirms payment

Supplier API keys remain server-side. No browser code receives the key or calls the supplier directly.

Features such as Affiliate statistics, balance history, withdrawal methods, and supplier-side top-up screens are not fabricated as API endpoints because the public documentation screenshot does not establish endpoint contracts for them. UziSeller provides its own customer-facing order/payment/support navigation for those workflows.
