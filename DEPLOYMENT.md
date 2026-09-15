# UziSeller 部署指南

## 系统概述

UziSeller 是一个完整的数字服务电商平台，包含：
- SMM 社交媒体增长服务
- 数字产品订阅（AI账号、工具等）
- Billplz 支付网关集成
- 后台管理系统
- 订单状态追踪

## 技术栈

- **前端**: 纯 HTML/CSS/JavaScript (无构建步骤)
- **后端**: Vercel Serverless Functions (Node.js 20.x)
- **数据库**: Vercel KV (Redis)
- **支付**: Billplz (马来西亚支付网关)
- **供应商 API**: 
  - SMM.APPMMO.COM (社交媒体服务)
  - SHOP.APPMMO.COM (数字产品)

## 部署步骤

### 1. GitHub 设置

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit: UziSeller platform"

# 连接到 GitHub（替换为你的仓库地址）
git remote add origin https://github.com/your-username/uziseller.git
git branch -M main
git push -u origin main
```

### 2. Vercel 部署

#### 方式 A: 通过 Vercel Dashboard（推荐）

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测配置（vercel.json）
5. 配置环境变量（见下方）
6. 点击 "Deploy"

#### 方式 B: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 3. 配置 Vercel KV (Redis)

1. 在 Vercel Dashboard 中，进入你的项目
2. 转到 "Storage" 标签
3. 点击 "Create Database"
4. 选择 "KV" (Upstash Redis)
5. 创建后，Vercel 会自动注入环境变量：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### 4. 配置环境变量

在 Vercel Dashboard 的 Settings → Environment Variables 中添加：

#### 必需变量

```bash
# Billplz 支付
BILLPLZ_API_KEY=your_billplz_api_key
BILLPLZ_COLLECTION_ID=your_collection_id
BILLPLZ_X_SIGNATURE_KEY=your_x_signature_key

# SMM 供应商
SMM_API_KEY=your_smm_api_key
SMM_API_URL=https://smm.appmmo.com/api/v2

# SHOP 供应商
SHOP_APMMO_API_KEY=your_shop_api_key
SHOP_APMMO_BASE=https://shop.appmmo.com/api

# 后台管理密码
ADMIN_PASSWORD=your_secure_password

# 站点 URL
SITE_URL=https://your-domain.vercel.app
```

#### 可选变量（定价相关）

```bash
# 汇率
VND_TO_MYR_RATE=0.000156
USD_TO_MYR_RATE=4.04
CNY_TO_MYR_RATE=0.60

# 加价百分比
SMM_MARKUP_PERCENT=30
SUBSCRIPTION_MARKUP_PERCENT=30
```

### 5. 配置 Billplz Webhook

1. 登录 Billplz Dashboard
2. 转到 Settings → Webhook
3. 设置 Webhook URL 为：
   ```
   https://your-domain.vercel.app/api/billplz-webhook
   ```
4. 选择 "X Signature" 验证方法
5. 保存配置

### 6. 测试部署

访问以下 URL 测试功能：

- **主页**: `https://your-domain.vercel.app/`
- **订单状态**: `https://your-domain.vercel.app/order-status.html`
- **后台管理**: `https://your-domain.vercel.app/admin/`
- **API 健康检查**: 
  - `https://your-domain.vercel.app/api/smm?action=services`
  - `https://your-domain.vercel.app/api/subscriptions?action=products`

## 文件结构

```
uziseller-ghpages/
├── index.html              # 主页
├── order-status.html       # 订单状态查询页
├── script.js               # SMM 面板 JS
├── subscriptions.js        # 订阅产品 JS
├── order-modal.js          # 订单弹窗
├── tabs.js                 # 标签切换
├── i18n.js                 # 多语言支持
├── styles.css              # 全局样式
├── api/                    # Serverless Functions
│   ├── checkout.js         # SMM 结账
│   ├── subscription-checkout.js  # 订阅结账
│   ├── billplz-webhook.js  # 支付回调
│   ├── order-status.js     # 订单状态查询
│   ├── admin-orders.js     # 后台订单管理
│   ├── smm.js              # SMM 服务 API
│   ├── subscriptions.js    # 订阅产品 API
│   └── apmmo.js            # 供应商代理
├── lib/                    # 共享库
│   ├── billplz.js          # Billplz 客户端
│   ├── smm.js              # SMM 客户端
│   ├── shop-apmmo.js       # SHOP 客户端
│   └── store.js            # KV 存储
├── admin/                  # 后台管理界面
│   ├── index.html          # 订单管理
│   └── shop-api.html       # API 测试工具
├── assets/                 # 静态资源
├── vercel.json             # Vercel 配置
├── package.json            # 项目信息
└── .env.example            # 环境变量示例

```

## 订单流程

### SMM 服务订单

1. **客户选择服务** → 前端 `script.js`
2. **提交订单** → `POST /api/checkout`
   - 验证服务和价格
   - 创建 Billplz 账单
   - 保存订单到 KV (status: `pending_payment`)
3. **客户付款** → Billplz 托管页面
4. **支付回调** → `POST /api/billplz-webhook`
   - 验证签名
   - 标记订单为 `paid`
   - 调用供应商 API (`lib/smm.js`)
   - 更新订单状态为 `processing`
5. **订单完成** → 供应商处理完成

### 订阅产品订单

1. **客户选择产品** → 前端 `subscriptions.js`
2. **提交订单** → `POST /api/subscription-checkout`
   - 查询供应商实时价格
   - 计算加价后价格
   - 创建 Billplz 账单
   - 保存订单到 KV
3. **客户付款** → Billplz 托管页面
4. **支付回调** → `POST /api/billplz-webhook`
   - 验证签名
   - 标记订单为 `paid`
   - 调用供应商购买 API (`lib/shop-apmmo.js`)
   - 提取交付数据
   - 更新订单状态为 `completed`
5. **客户查看** → `/order-status.html` 显示账号信息

## 后台管理

访问 `/admin/` 进入后台管理系统：

### 功能
- 订单列表和筛选
- 订单详情查看
- 订单状态手动更新
- 供应商订单查询
- 统计数据展示

### 登录
使用环境变量 `ADMIN_PASSWORD` 设置的密码

## API 端点

### 公开端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/smm` | GET | 获取 SMM 服务列表 |
| `/api/subscriptions` | GET | 获取订阅产品列表 |
| `/api/checkout` | POST | SMM 服务结账 |
| `/api/subscription-checkout` | POST | 订阅产品结账 |
| `/api/order-status` | GET | 查询订单状态 |
| `/api/billplz-webhook` | POST | Billplz 支付回调 |

### 管理端点（需要密码）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin-orders` | GET | 获取订单列表 |
| `/api/admin-orders` | PATCH | 更新订单 |
| `/api/subscriptions?action=profile` | GET | 查询供应商余额 |
| `/api/subscriptions?action=order` | GET | 查询供应商订单 |

## 安全要点

1. **API Key 保护**
   - 所有供应商 API Key 只存在服务器端
   - 永远不要在前端代码中暴露

2. **Webhook 验证**
   - Billplz webhook 必须验证 X-Signature
   - 只有 webhook 能标记支付成功

3. **幂等性**
   - 订单处理考虑了 Billplz 重试
   - 防止重复提交到供应商

4. **管理密码**
   - 使用强密码
   - 定期更换

## 常见问题

### Q: 如何更新产品价格？
A: 价格从供应商 API 实时获取，加价通过环境变量控制。

### Q: 如何添加新的 SMM 服务？
A: 供应商添加服务后会自动出现在目录中，无需手动添加。

### Q: 订单卡在 pending_payment 怎么办？
A: 检查 Billplz webhook 是否正确配置，查看 Vercel 函数日志。

### Q: 如何处理退款？
A: 在 Billplz Dashboard 处理退款，然后在后台管理更新订单状态。

### Q: 支持哪些支付方式？
A: 通过 Billplz 支持 FPX (网银)、信用卡/借记卡。

## 监控和维护

### Vercel 日志
- Dashboard → Functions → 选择函数 → Logs
- 查看实时日志和错误

### KV 数据库
- Dashboard → Storage → KV
- 查看存储使用情况

### 订单监控
- 使用后台管理系统监控订单状态
- 关注 `needs_manual_review` 状态的订单

## 支持

如有问题，请检查：
1. Vercel 函数日志
2. 供应商 API 状态
3. Billplz webhook 日志
4. 环境变量配置

## 许可证

MIT License
