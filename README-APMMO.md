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
