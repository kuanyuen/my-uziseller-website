# Billplz Webhook 配置指南

## 🎯 快速配置（推荐）

使用 Vercel 提供的默认域名，无需修改 DNS，立即可用！

### Webhook URL
```
https://uziseller-uzi-seller.vercel.app/api/billplz-webhook
```

---

## 📋 配置步骤

### 1. 登录 Billplz Dashboard

访问: https://www.billplz.com/enterprise/settings/webhooks

或者直接从主菜单：
- 点击右上角头像
- 选择 **Settings**
- 左侧菜单选择 **Webhooks**

### 2. 创建新 Webhook

点击 **"Add Webhook"** 或 **"Create New Webhook"** 按钮

### 3. 填写配置信息

**Step 1: Webhook URL**
```
https://uziseller-uzi-seller.vercel.app/api/billplz-webhook
```
⚠️ 注意：必须是 `https://` 开头

**Step 2: 签名验证方法**
- 选择: ☑️ **X Signature** (推荐)
- 不要选择 "None"

**Step 3: 选择触发事件**
- ☑️ **bill.paid** - 支付成功时触发
- ☑️ **bill.failed** - 支付失败时触发
- ☐ bill.deleted - 不需要勾选

**Step 4: Collection（可选）**
- 如果有选项，选择你的 Collection ID: `0uklil7m`
- 如果没有这个选项，跳过即可

### 4. 测试 Webhook

点击 **"Test Webhook"** 按钮

**预期结果**:
- ✅ 状态码: `200 OK` 或 `401 Unauthorized`
- ✅ 响应: `{"status":"ok"}` 或 `{"status":"error","msg":"Invalid signature"}`

⚠️ 注意：返回 401 是正常的！这表示 Webhook 端点正常工作，只是测试请求没有正确的签名。

### 5. 保存配置

点击 **"Save"** 或 **"Create"** 按钮保存配置。

---

## ✅ 验证配置

### 方法 1: 提交测试订单

1. 访问: https://uziseller.com
2. 选择任意 SMM 服务或订阅产品
3. 填写信息并提交订单
4. 完成支付（可以使用 Billplz 沙盒模式）
5. 检查订单状态: https://uziseller.com/order-status.html

**如果配置正确**:
- 支付成功后，订单状态会自动从 "pending_payment" 变为 "paid" 或 "processing"

### 方法 2: 查看 Vercel 日志

1. 访问: https://vercel.com/uzi-seller/uziseller/functions
2. 点击 `api/billplz-webhook.js`
3. 查看 "Logs" 标签
4. 应该能看到来自 Billplz 的请求

### 方法 3: 检查后台管理

1. 访问: https://uziseller.com/admin/
2. 登录密码: `admin123456`
3. 刷新订单列表
4. 查看测试订单的状态是否已更新

---

## 📸 配置界面参考

```
┌───────────────────────────────────────────────────┐
│ Create Webhook                                    │
├───────────────────────────────────────────────────┤
│                                                   │
│ Webhook URL *                                     │
│ ┌───────────────────────────────────────────────┐ │
│ │ https://uziseller-uzi-seller.vercel.app/...  │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ Signature Verification *                          │
│ ○ None                                            │
│ ● X Signature (Recommended)                       │
│                                                   │
│ Events to receive *                               │
│ ☑ bill.paid      Payment completed               │
│ ☑ bill.failed    Payment failed                  │
│ ☐ bill.deleted   Bill deleted                    │
│                                                   │
│ Collection (Optional)                             │
│ ┌───────────────────────────────────────────────┐ │
│ │ 0uklil7m                                      │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ [ Test Webhook ]    [ Cancel ]    [ Save ]        │
└───────────────────────────────────────────────────┘
```

---

## 🔐 安全说明

你的系统已经配置了安全验证：

**X Signature Key**: 已在 Vercel 配置
```
BILLPLZ_X_SIGNATURE_KEY = 8a255a5402d7b5905192eae577c90ff5...
```

这意味着：
- ✅ 只有来自 Billplz 的合法请求才会被处理
- ✅ 伪造的请求会被自动拒绝（返回 401）
- ✅ 订单状态更新安全可靠

---

## ⚠️ 常见问题

### Q1: Webhook URL 填哪个？
**A**: 使用 Vercel 域名:
```
https://uziseller-uzi-seller.vercel.app/api/billplz-webhook
```
不要使用 uziseller.com（DNS 配置问题）

### Q2: 测试 Webhook 返回 401 错误？
**A**: 这是正常的！表示：
- ✅ Webhook 端点正常工作
- ✅ 签名验证功能正常
- 测试请求没有正确的签名（预期行为）

### Q3: 测试 Webhook 返回 404 错误？
**A**: 检查 URL 是否正确：
- ✅ 正确: `https://uziseller-uzi-seller.vercel.app/api/billplz-webhook`
- ❌ 错误: `https://uziseller.com/api/billplz-webhook`（DNS 问题）

### Q4: 需要填写 X Signature Key 吗？
**A**: 不需要！Billplz 会自动使用你账号关联的签名密钥。

### Q5: 可以同时配置多个 Webhook 吗？
**A**: 可以，但通常不需要。一个 Webhook 可以处理所有 Collection。

### Q6: 配置后多久生效？
**A**: 立即生效！下一笔订单就会使用新配置。

### Q7: 如何知道 Webhook 工作正常？
**A**: 提交测试订单，支付成功后：
- 订单状态自动更新 = ✅ 正常
- 订单状态不变 = ❌ 有问题

---

## 🚀 配置后的下一步

### 立即测试（必须）

1. **提交测试订单**
   - 访问: https://uziseller.com
   - 选择最便宜的服务测试
   - 使用真实邮箱

2. **完成支付**
   - 使用 Billplz 沙盒模式（如果可用）
   - 或支付小额测试

3. **验证结果**
   - 订单状态页面: https://uziseller.com/order-status.html
   - 后台管理: https://uziseller.com/admin/
   - 检查订单状态是否自动更新

### 如果测试失败

1. **检查 Vercel 日志**
   - https://vercel.com/uzi-seller/uziseller/functions
   - 查看 billplz-webhook.js 的日志

2. **检查 Billplz 日志**
   - Billplz Dashboard → Webhooks
   - 查看 webhook 调用历史

3. **常见原因**
   - Webhook URL 错误
   - 没有选择 X Signature
   - 环境变量配置错误

---

## 📞 需要帮助？

如果遇到问题：

1. **检查环境变量**
   ```bash
   在 Vercel Dashboard 确认已配置：
   - BILLPLZ_API_KEY
   - BILLPLZ_COLLECTION_ID
   - BILLPLZ_X_SIGNATURE_KEY
   ```

2. **查看日志**
   ```
   Vercel: vercel.com/uzi-seller/uziseller/functions
   Billplz: billplz.com/enterprise/webhooks
   ```

3. **联系支持**
   - Billplz: https://www.billplz.com/contact
   - Vercel: https://vercel.com/support

---

## ✅ 配置完成检查清单

完成配置后，确认以下项目：

- [ ] Webhook URL 正确填写（Vercel 域名）
- [ ] 选择了 X Signature 验证
- [ ] 启用了 bill.paid 和 bill.failed 事件
- [ ] 测试 Webhook（返回 200 或 401 都正常）
- [ ] 保存了配置
- [ ] 提交了测试订单
- [ ] 订单状态自动更新

---

**配置完成后，你的支付系统就完全运行了！** 🎉

客户下单 → 支付 → 自动提交供应商 → 自动更新状态

全程自动化，无需人工干预！
