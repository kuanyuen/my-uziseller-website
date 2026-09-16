# 修复 uziseller.com DNS 配置指南

## 🔍 问题说明

当前 DNS 配置指向 Cloudflare，导致 uziseller.com 的 API 无法正常工作。

**当前状态**:
- NS 服务器: Cloudflare (ariadne.ns.cloudflare.com, tanner.ns.cloudflare.com)
- 需要改为: Vercel (ns1.vercel-dns.com, ns2.vercel-dns.com)

---

## ⚡ 快速解决方案（推荐）

**不修复 DNS，直接使用 Vercel 域名**

优点：
- ✅ 立即可用，无需等待
- ✅ 不需要修改 DNS
- ✅ 功能完全正常

在 Billplz 配置 Webhook 时使用：
```
https://uziseller-uzi-seller.vercel.app/api/billplz-webhook
```

前端页面继续使用 uziseller.com 即可！

---

## 🔧 彻底修复方案（可选）

如果你想让 uziseller.com 的 API 也能正常工作，需要修改 DNS 配置。

### 方法 A: 修改 DNS NS 记录（完全迁移到 Vercel）

#### 步骤 1: 登录域名注册商

在你购买 uziseller.com 的地方登录：
- Namecheap
- GoDaddy
- Google Domains
- 或其他注册商

#### 步骤 2: 找到 DNS 设置

通常在：
- Domain Management
- DNS Settings
- Nameservers

#### 步骤 3: 修改 Nameservers

**从**:
```
ariadne.ns.cloudflare.com
tanner.ns.cloudflare.com
```

**改为**:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### 步骤 4: 保存并等待

- 保存修改
- 等待 DNS 生效（通常 5-30 分钟，最多 48 小时）

---

### 方法 B: 在 Cloudflare 添加 CNAME（保留 Cloudflare）

如果你想继续使用 Cloudflare（例如使用 CDN），可以只添加 CNAME 记录。

#### 步骤 1: 登录 Cloudflare

访问: https://dash.cloudflare.com

#### 步骤 2: 选择 uziseller.com 域名

在域名列表中点击 uziseller.com

#### 步骤 3: 进入 DNS 设置

点击左侧菜单 **DNS** → **Records**

#### 步骤 4: 添加/修改记录

**根域名 (@)**:
```
Type: A
Name: @
Content: 76.76.21.21
Proxy status: DNS only（关闭橙色云朵）
TTL: Auto
```

**www 子域名**:
```
Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy status: DNS only（关闭橙色云朵）
TTL: Auto
```

⚠️ **重要**: 必须关闭 Cloudflare 代理（橙色云朵变成灰色）

#### 步骤 5: 保存并等待

- 保存修改
- 等待 5-10 分钟生效

---

## 🧪 验证 DNS 是否修复

### 方法 1: 使用命令行

```bash
# 检查 NS 记录
nslookup -type=NS uziseller.com

# 检查 A 记录
nslookup uziseller.com
```

**正确结果应显示**:
- NS: ns1.vercel-dns.com, ns2.vercel-dns.com
- 或 A: 76.76.21.21

### 方法 2: 在线工具

访问: https://www.whatsmydns.net/#A/uziseller.com

应该显示: `76.76.21.21`

### 方法 3: 测试 API

```bash
curl -s https://uziseller.com/api/smm?action=services
```

**成功**: 返回 JSON 数据  
**失败**: 返回 404 或重定向

---

## ⏱️ DNS 生效时间

| 修改类型 | 预计时间 |
|---------|---------|
| NS 记录修改 | 5 分钟 - 48 小时 |
| A/CNAME 记录 | 5-30 分钟 |
| Vercel 自动检测 | 即时 |

---

## 🔄 两种方案对比

### 方案 A: 使用 Vercel 域名（推荐）

✅ **优点**:
- 立即可用
- 无需修改 DNS
- 无等待时间
- 功能完全正常

❌ **缺点**:
- Webhook URL 稍长
- 不是自定义域名

**适合**: 想快速上线，不想等待 DNS

---

### 方案 B: 修复 DNS

✅ **优点**:
- 使用自定义域名
- URL 更简洁
- 更专业

❌ **缺点**:
- 需要等待 DNS 生效
- 需要修改配置
- 可能影响现有服务

**适合**: 有时间等待，追求完美

---

## 🎯 我的推荐

**阶段 1: 立即上线（现在）**
- 使用 Vercel 域名配置 Webhook
- 前端继续用 uziseller.com
- 开始接单运营

**阶段 2: 优化升级（有空时）**
- 修复 DNS 配置
- 更新 Webhook URL
- 使用自定义域名

---

## 📝 修改 DNS 后需要做什么

1. **更新 Webhook URL**
   - 登录 Billplz Dashboard
   - 修改 Webhook URL 为: `https://uziseller.com/api/billplz-webhook`

2. **测试 API**
   ```bash
   curl https://uziseller.com/api/smm?action=services
   curl https://uziseller.com/api/subscriptions?action=products
   ```

3. **提交测试订单**
   - 验证完整支付流程
   - 确认 Webhook 正常工作

---

## ❓ 常见问题

### Q: 修改 DNS 会影响现有网站吗？
**A**: 不会。主页和静态资源不受影响，只是 API 会正常工作。

### Q: DNS 修改后多久生效？
**A**: 
- 最快: 5-10 分钟
- 通常: 30 分钟 - 2 小时
- 最慢: 48 小时（极少见）

### Q: 如何检查 DNS 是否生效？
**A**: 访问 https://uziseller.com/api/smm?action=services
- 返回 JSON = ✅ 生效
- 返回 404 = ❌ 未生效

### Q: 可以同时使用两个域名吗？
**A**: 可以！
- uziseller.com - 给客户看
- uziseller-uzi-seller.vercel.app - 配置 Webhook

### Q: 必须修改 DNS 吗？
**A**: 不必须！使用 Vercel 域名完全可以正常运营。

---

## 📞 需要帮助？

如果修改 DNS 遇到问题：

1. **检查域名注册商**
   - 确认在哪里购买的域名
   - 登录控制面板

2. **查看当前配置**
   ```bash
   nslookup -type=NS uziseller.com
   ```

3. **联系支持**
   - 域名注册商支持
   - Vercel 支持: https://vercel.com/support
   - Cloudflare 支持: https://support.cloudflare.com

---

**建议**: 先使用 Vercel 域名快速上线，有空再慢慢优化 DNS！🚀
