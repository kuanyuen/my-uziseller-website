# 部署步骤（按顺序执行）

## 1️⃣ GitHub 部署

```bash
# 如果还没有 GitHub 仓库，先创建一个
# 然后运行：

git remote add origin https://github.com/你的用户名/uziseller.git
git branch -M main
git push -u origin main
```

## 2️⃣ Vercel 部署

### 方式 A: 一键部署（推荐）

1. 访问 https://vercel.com/new
2. 选择 "Import Git Repository"
3. 导入你的 GitHub 仓库
4. Vercel 会自动检测配置
5. 点击 "Deploy"

### 方式 B: CLI 部署

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 3️⃣ 配置 Vercel KV (Redis)

1. 进入 Vercel Dashboard → 你的项目
2. 点击 "Storage" → "Create Database"
3. 选择 "KV" (Upstash Redis)
4. 创建后会自动注入这两个环境变量：
   - KV_REST_API_URL
   - KV_REST_API_TOKEN

## 4️⃣ 配置环境变量

在 Vercel Dashboard → Settings → Environment Variables 添加：

```bash
# Billplz 支付（3个必需）
BILLPLZ_API_KEY=你的billplz_api_key
BILLPLZ_COLLECTION_ID=你的collection_id
BILLPLZ_X_SIGNATURE_KEY=你的x_signature_key

# 供应商 API（2个必需）
SMM_API_KEY=你的smm_api_key
SHOP_APMMO_API_KEY=你的shop_api_key

# 后台管理（1个必需）
ADMIN_PASSWORD=设置一个强密码

# 站点 URL（1个必需）
SITE_URL=https://你的项目名.vercel.app

# 可选：汇率（有默认值，可不配置）
VND_TO_MYR_RATE=0.000156
USD_TO_MYR_RATE=4.04
CNY_TO_MYR_RATE=0.60

# 可选：加价百分比（默认30%）
SMM_MARKUP_PERCENT=30
SUBSCRIPTION_MARKUP_PERCENT=30
```

## 5️⃣ 配置 Billplz Webhook

1. 登录 Billplz Dashboard
2. 进入 Settings → Webhook
3. 设置 Webhook URL：
   ```
   https://你的项目名.vercel.app/api/billplz-webhook
   ```
4. 选择 "X Signature" 验证方法
5. 保存并复制 X Signature Key
6. 将 Key 添加到 Vercel 环境变量 `BILLPLZ_X_SIGNATURE_KEY`

## 6️⃣ 测试部署

访问以下 URL 测试：

```bash
# 主页
https://你的项目名.vercel.app/

# API 测试
https://你的项目名.vercel.app/api/smm?action=services
https://你的项目名.vercel.app/api/subscriptions?action=products

# 后台管理
https://你的项目名.vercel.app/admin/
```

## 7️⃣ 完整测试流程

1. **测试 SMM 服务**：
   - 浏览服务目录
   - 选择一个服务
   - 提交订单
   - 完成支付（使用 Billplz 测试模式）
   - 检查订单状态

2. **测试订阅产品**：
   - 浏览产品列表
   - 选择产品
   - 提交订单
   - 完成支付
   - 检查交付信息

3. **测试后台管理**：
   - 使用 ADMIN_PASSWORD 登录
   - 查看订单列表
   - 测试订单搜索
   - 测试供应商 API 工具

## ✅ 部署完成检查清单

- [ ] GitHub 仓库已推送
- [ ] Vercel 项目已部署
- [ ] Vercel KV (Redis) 已创建并连接
- [ ] 7个必需环境变量已配置
- [ ] Billplz webhook 已设置
- [ ] 主页可以正常访问
- [ ] API 端点返回正确数据
- [ ] 后台管理可以登录
- [ ] 完成一笔测试订单

## 🔧 故障排除

### 如果 API 返回 500 错误：
- 检查 Vercel 函数日志
- 确认所有环境变量已正确配置
- 检查供应商 API 是否可访问

### 如果 webhook 不工作：
- 确认 Billplz webhook URL 配置正确
- 检查 X Signature Key 是否正确
- 查看 Vercel 函数日志中的 webhook 请求

### 如果订单卡在 pending_payment：
- 检查 webhook 是否正确触发
- 确认 Billplz 支付已完成
- 在后台管理中手动更新订单状态

## 📞 支持

如有问题，请检查：
1. Vercel Dashboard → Functions → Logs
2. 供应商 API 文档
3. Billplz 开发者文档

---

🎉 部署完成后，你的电商平台就可以开始运营了！
