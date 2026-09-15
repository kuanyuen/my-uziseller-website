# Uziseller V1 + APMMO API

这是在原 Uziseller V1 静态网站基础上加入的 Vercel Serverless API 测试层。

## 部署前必须设置的 Vercel Environment Variables

在 Vercel 项目 Settings → Environment Variables 添加：

- `APMMO_API_KEY` = 你重新生成的新 APMMO API Key
- `ADMIN_PASSWORD` = 你自己设置的后台测试密码

不要把 API Key 写进 HTML、JavaScript 或 GitHub。

## 测试页面

部署后打开：

`/admin/`

输入 `ADMIN_PASSWORD` 后，可以测试：
- profile
- products
- product
- order
- buy（会真实下单）

## 注意

当前版本主要是“安全的 API 测试层”，还没有数据库、客户账户、付款和正式订单系统。
正式上线自动交付前，应再增加数据库和订单状态处理。
当前版本主要是“安全的 API 测试层”，还没有数据库、客户账户、付款和正式订单系统。
正式上线自动交付前，应再增加数据库和订单状态处理。

## App Subscription API (SHOP.APPMMO.COM)

Add these Vercel Environment Variables:

- `SHOP_APMMO_API_KEY` = the API key for shop.appmmo.com (keep server-side only)
- `SHOP_APMMO_BASE` = `https://shop.appmmo.com/api` (optional)
- `SUBSCRIPTION_MARKUP_PERCENT` = `30` (optional; default 30)
- `USD_TO_MYR` = your current USD/MYR display conversion (optional; default 4.25)
- `CNY_TO_MYR` = your current CNY/MYR display conversion (optional; default 0.59)

The subscription flow is: products.php → UziSeller product list → Billplz payment → Billplz webhook → buy_product → save returned `trans_id` and `data` to the order.

### SHOP.APPMMO API coverage

The storefront uses the supplier endpoints visible in the supplier API documentation:
- `GET /api/profile.php?api_key=...` — supplier account/profile (admin-only proxy)
- `GET /api/products.php?api_key=...` — product/category catalogue
- `GET /api/product.php?api_key=...&product=ID` — full product detail
- `GET /api/order.php?api_key=...` — supplier transaction/order detail (server-side polling)
- `POST /api/buy_product` — supplier purchase submission after successful payment

The browser never receives `SHOP_APMMO_API_KEY`.
### Digital-product auto delivery
After a successful `buy_product` response, UziSeller stores `trans_id` plus each entry in `data[]`. String entries such as `A|B` are preserved as fields without assuming that the fields are specifically an account, password, key, or code. Customers can view and copy the returned delivery values from `order-status.html` after payment.
