<<<<<<< HEAD
# UziSeller

完整的数字服务电商平台，支持 SMM 社交媒体服务和数字产品订阅。

## 功能特点

- 🚀 **SMM 社交媒体服务** - 多平台粉丝、点赞、浏览量等服务
- 📦 **数字产品订阅** - AI 工具账号、在线服务等
- 💳 **Billplz 支付集成** - 支持 FPX 和信用卡支付
- 📊 **后台管理系统** - 订单管理、统计报表
- 🌍 **多语言支持** - 英文 / 中文
- 💱 **多货币显示** - MYR / USD / CNY

## 技术架构

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **后端**: Vercel Serverless Functions (Node.js 20)
- **数据库**: Vercel KV (Redis)
- **支付**: Billplz Payment Gateway
- **供应商**: SMM.APPMMO.COM, SHOP.APPMMO.COM

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/uziseller.git
cd uziseller
```

### 2. 配置环境变量

复制 `.env.example` 并配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 填入你的 API 密钥。

### 3. 部署到 Vercel

点击下方按钮一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/uziseller)

或使用 CLI：

```bash
npm i -g vercel
vercel login
vercel --prod
```

### 4. 配置 Vercel KV

1. 在 Vercel Dashboard 创建 KV 数据库
2. 连接到你的项目
3. 环境变量会自动注入

### 5. 配置 Billplz Webhook

在 Billplz 设置 webhook URL：
```
https://your-domain.vercel.app/api/billplz-webhook
```

## 文档

- [完整部署指南](./DEPLOYMENT.md)
- [API 文档](./API.md) (待创建)
- [故障排除](./TROUBLESHOOTING.md) (待创建)

## 环境变量

### 必需

- `BILLPLZ_API_KEY` - Billplz API 密钥
- `BILLPLZ_COLLECTION_ID` - Billplz 收款账户 ID
- `BILLPLZ_X_SIGNATURE_KEY` - Webhook 签名密钥
- `SMM_API_KEY` - SMM 供应商 API 密钥
- `SHOP_APMMO_API_KEY` - SHOP 供应商 API 密钥
- `ADMIN_PASSWORD` - 后台管理密码
- `SITE_URL` - 站点完整 URL

### 可选

- `SMM_MARKUP_PERCENT` - SMM 服务加价百分比 (默认: 30)
- `SUBSCRIPTION_MARKUP_PERCENT` - 订阅产品加价百分比 (默认: 30)
- `VND_TO_MYR_RATE` - 越南盾到马币汇率 (默认: 0.000156)
- `USD_TO_MYR_RATE` - 美元到马币汇率 (默认: 4.04)
- `CNY_TO_MYR_RATE` - 人民币到马币汇率 (默认: 0.60)

## 项目结构

```
uziseller-ghpages/
├── index.html              # 主页
├── order-status.html       # 订单查询
├── api/                    # API 端点
│   ├── checkout.js
│   ├── subscription-checkout.js
│   ├── billplz-webhook.js
│   ├── order-status.js
│   ├── admin-orders.js
│   ├── smm.js
│   └── subscriptions.js
├── lib/                    # 共享库
│   ├── billplz.js
│   ├── smm.js
│   ├── shop-apmmo.js
│   └── store.js
├── admin/                  # 后台管理
│   ├── index.html
│   └── shop-api.html
└── assets/                 # 静态资源
```

## 主要功能

### 客户端

- ✅ 服务浏览和搜索
- ✅ 多平台筛选
- ✅ 实时价格计算
- ✅ 安全支付流程
- ✅ 订单状态追踪
- ✅ 多语言切换

### 后台管理

- ✅ 订单列表和筛选
- ✅ 订单详情查看
- ✅ 手动状态更新
- ✅ 供应商订单查询
- ✅ 统计报表

## API 端点

### 公开 API

- `GET /api/smm?action=services` - 获取 SMM 服务列表
- `GET /api/subscriptions?action=products` - 获取订阅产品
- `POST /api/checkout` - SMM 服务下单
- `POST /api/subscription-checkout` - 订阅产品下单
- `GET /api/order-status?id={order_id}` - 查询订单状态

### 管理 API（需密码）

- `GET /api/admin-orders` - 订单列表
- `PATCH /api/admin-orders?id={order_id}` - 更新订单
- `GET /api/subscriptions?action=profile` - 供应商账户信息
- `GET /api/subscriptions?action=order&order={ref}` - 供应商订单详情

## 订单状态

- `pending_payment` - 等待付款
- `paid` - 已付款
- `processing` - 处理中
- `completed` - 已完成
- `partial` - 部分完成
- `payment_failed` - 付款失败
- `needs_manual_review` - 需人工处理
- `supplier_issue` - 供应商异常

## 安全特性

- ✅ 所有 API 密钥仅存储在服务器端
- ✅ Webhook 签名验证
- ✅ 订单幂等性处理
- ✅ 管理端点密码保护
- ✅ 输入验证和清理
- ✅ 安全 HTTP 头部

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- WhatsApp: +60 11-6363 0234
- 网站: https://your-domain.vercel.app

---

Built with ❤️ by UziSeller Team
=======
# Uziseller V1

Static landing page for Uziseller.

## Deploy with Vercel
1. Upload this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Deploy with the default settings.
4. In Vercel project settings, add `uziseller.com` as a domain.
5. In Cloudflare DNS, use the DNS records Vercel shows for the domain.

## Contact
WhatsApp: +60 11-6363 0234
WeChat: UziShopeeseller

## Notes
Product claims and pricing in this demo are based on the information supplied for the project and should be verified before public sale.
>>>>>>> a3a2d46aeb260bd121ff39a4d160af3c344c177b
