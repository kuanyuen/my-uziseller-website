# UziSeller + SHOP.APPMMO API

网站通过 Vercel Serverless Functions 安全连接 SHOP.APPMMO，并支持订阅商品付款和自动交付。

## 必须设置的 Vercel 环境变量

在 Vercel 项目 Settings → Environment Variables 中设置：

- `SHOP_APMMO_API_KEY` = SHOP.APPMMO API Key
- `SHOP_APMMO_BASE` = `https://shop.appmmo.com/api`（可选，默认使用此地址）

不要把 API Key 写进 HTML、前端 JavaScript、公开文档或 GitHub。更新变量后，需重新部署 Vercel。

## App Subscription API (SHOP.APPMMO.COM)

Add these Vercel Environment Variables:

- `SHOP_APMMO_API_KEY` = the API key for shop.appmmo.com (keep server-side only)
- `SHOP_APMMO_BASE` = `https://shop.appmmo.com/api` (optional)
- `SUBSCRIPTION_MARKUP_PERCENT` = `30` (optional; default 30)
- `USD_TO_MYR` = your current USD/MYR display conversion (optional; default 4.25)
- `CNY_TO_MYR` = your current CNY/MYR display conversion (optional; default 0.59)

The digital-product purchase flow is: products.php → UziSeller product catalogue → Billplz payment → Billplz webhook → buy_product → save returned `trans_id` and `data` to the order.

### SHOP.APPMMO API coverage

The storefront uses the supplier endpoints visible in the supplier API documentation:
- `GET /api/profile.php?api_key=...` — supplier account/profile (admin-only proxy)
- `GET /api/products.php?api_key=...` — product/category catalogue
- `GET /api/product.php?api_key=...&product=ID` — full product detail
- `GET /api/order.php?api_key=...` — supplier transaction/order detail (server-side polling)
- `POST /api/buy_product` — supplier purchase submission after successful payment

The browser never receives `SHOP_APMMO_API_KEY`.

The customer-facing product marketplace displays all sellable supplier categories and products, with category filters, search, price sorting, and progressive loading. Products with invalid prices are not shown as purchasable. Purchases use a dedicated checkout: the browser posts the product ID and customer details to `/api/subscription-checkout`; the server validates the current supplier product and price, creates a Billplz bill, and the payment webhook submits the supplier purchase. The supplier purchase form uses `action=buyProduct`, `ID`, `Amount`, and `Coupon`.

The catalogue proxy distinguishes sellable products from category headings by requiring an ID, name, and positive price, then recursively walks nested category/product groups (including zero-priced category placeholders). Product detail responses are normalized before being sent to the browser.
### Digital-product auto delivery
After a successful `buy_product` response, UziSeller stores `trans_id` plus each entry in `data[]`. String entries such as `A|B` are preserved as fields without assuming that the fields are specifically an account, password, key, or code. Customers can view and copy the returned delivery values from `order-status.html` after payment.
