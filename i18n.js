// Lightweight i18n + currency switcher for the static site.
// Language: swaps textContent/innerHTML/placeholder on elements tagged with
// data-i18n / data-i18n-html / data-i18n-placeholder.
// Currency: converts elements tagged with data-price="<RM amount>" (and an
// optional data-price-old for the struck-through price).

const I18N = {
  'nav.home': { en: 'Home', zh: '首页' },
  'nav.products': { en: 'Products', zh: '商品' },
  'nav.login': { en: 'Sign in', zh: '登录' },
  'nav.account': { en: 'My account', zh: '我的账户' },
  'nav.logout': { en: 'Log out', zh: '退出登录' },

  'eyebrow.hero': { en: 'UZISELLER · PREMIUM DIGITAL SERVICES', zh: 'UZISELLER · 优质数字服务' },
  'eyebrow.about': { en: '01 · WHAT WE DO', zh: '01 · 我们是做什么的' },
  'eyebrow.why': { en: '02 · WHY CHOOSE US', zh: '02 · 为什么选择我们' },
  'eyebrow.agent': { en: '03 · PARTNER PROGRAM', zh: '03 · 代理合作计划' },
  'eyebrow.products': { en: '04 · PRODUCTS', zh: '04 · 商品' },
  'eyebrow.contact': { en: '05 · CONTACT', zh: '05 · 联系我们' },

  'marquee.1': { en: 'AI SERVICES', zh: 'AI 服务' },
  'marquee.1b': { en: 'AI SERVICES', zh: 'AI 服务' },
  'marquee.2': { en: '☁ 5TB STORAGE', zh: '☁ 5TB 存储空间' },
  'marquee.3': { en: '⚡ FAST SUPPORT', zh: '⚡ 快速支持' },
  'marquee.4': { en: '🤝 PARTNER PROGRAM', zh: '🤝 代理合作计划' },

  'contact.waLabel': { en: 'WHATSAPP', zh: 'WHATSAPP' },
  'contact.wcLabel': { en: 'WECHAT', zh: '微信' },
  'footer.copyright': { en: '© 2026 Uziseller. All rights reserved.', zh: '© 2026 Uziseller. 保留所有权利。' },
  'meta.title': { en: 'Uziseller — Digital Growth & Premium Services', zh: 'Uziseller — 数字增长与优质服务' },

  'hero.title': { en: 'Built for Growth.<br><span>Powered by Trust.</span>', zh: '为增长而生。<br><span>值得信赖。</span>' },
  'hero.lead': { en: 'A complete digital-services ecosystem that saves you time and grows your revenue — AI accounts, premium subscriptions, and social-media growth tools, all in one place.', zh: '利用全面的数字化服务生态系统，优化您的时间并提升收益。我们提供优质资源、Claude & ChatGPT 人工智能账户，以及增强社交媒体互动的营销工具。' },
  'hero.explore': { en: 'Explore Products', zh: '查看商品' },
  'hero.partner': { en: 'Become a Partner', zh: '成为代理' },
  'hero.proof1t': { en: 'Fast', zh: '快速' },
  'hero.proof1s': { en: 'Support & delivery', zh: '客服与发货' },
  'hero.proof2t': { en: 'Flexible', zh: '灵活' },
  'hero.proof2s': { en: 'Customer-first service', zh: '以客户为先' },
  'hero.proof3t': { en: 'Growing', zh: '持续扩充' },
  'hero.proof3s': { en: 'More products coming', zh: '更多产品陆续上线' },
  'hero.featured': { en: 'FEATURED PRODUCT', zh: '主打产品' },
  'hero.productTitle': { en: 'Google AI Pro<br><span>+ 5TB Google One</span>', zh: 'Google AI Pro<br><span>+ 5TB Google One</span>' },
  'hero.access': { en: '18-Month Access', zh: '18个月使用权' },
  'hero.save': { en: 'SAVE', zh: '限时优惠' },
  'hero.noHidden': { en: 'One-time payment · No hidden fees', zh: '一次性付款 · 无隐藏费用' },
  'hero.orderWa': { en: 'View & Order', zh: '查看并下单' },

  'about.title': { en: 'A digital ecosystem<br><span>built to save you time.</span>', zh: '数字化生态系统<br><span>为您节省时间。</span>' },
  'about.lead': { en: 'We use a complete digital-services ecosystem to optimize your time and grow your revenue — offering resources, AI accounts, and enhanced social-media engagement.', zh: '利用全面的数字化服务生态系统，优化您的时间并提升收益。我们提供资源、人工智能账户，以及增强社交媒体互动的服务。' },
  'about.cat1title': { en: 'Claude & ChatGPT Store', zh: 'Claude & ChatGPT 订阅商店' },
  'about.cat1lead': { en: 'High-quality, reliable AI accounts and subscriptions for high-efficiency work and creation.', zh: '精选高质量、稳定持久的 Claude 与 ChatGPT 专属订阅服务，助力工作与生产力提升。' },
  'about.cat1b1': { en: 'Premium AI accounts (Claude, ChatGPT Plus & more)', zh: '高级 AI 账户（Claude、ChatGPT 等）' },
  'about.cat1cta': { en: 'Browse Subscriptions →', zh: '浏览 AI 订阅 →' },
  'about.cat2title': { en: 'Professional SMM Panel', zh: '专业社交媒体营销面板' },
  'about.cat2lead': { en: "Boost your brand's credibility and influence across social media platforms.", zh: '提升品牌在社交媒体平台上的信誉度和影响力。' },
  'about.cat2b1': { en: 'Multi-platform (Facebook, TikTok, Instagram and more)', zh: '多平台（Facebook、TikTok、Instagram 等）' },
  'about.cat2b2': { en: 'Automated system — no delay, high security', zh: '自动系统，无延迟，安全性高' },
  'about.cat2b3': { en: 'Ultra-low wholesale pricing for resellers', zh: '为经销商提供超低批发价格' },
  'about.cat2cta': { en: 'Browse SMM Services →', zh: '浏览社媒营销服务 →' },
  'about.cat3title': { en: 'User Dashboard / Client Portal', zh: '客户后台 / 用户面板' },
  'about.cat3lead': { en: 'A dedicated self-service interface allowing customers to log in, place orders, check wallet balance, and track real-time order progress.', zh: '让客户登录后可以自行下单、查看余额、实时追踪订单进度的独立操作界面。' },
  'about.cat3b1': { en: 'Independent customer login & account dashboard', zh: '客户独立登录与专属账户管理' },
  'about.cat3b2': { en: 'Real-time balance inquiry & top-up overview', zh: '实时查看账户余额与资金明细' },
  'about.cat3b3': { en: 'Instant order status & history tracking', zh: '全流程订单进度与历史记录实时追踪' },
  'about.cat3cta': { en: 'Open Dashboard →', zh: '进入客户后台 / 登录 →' },
  'about.cat4title': { en: 'SaaS Self-Service Ordering System', zh: 'SAAS 自助下单系统' },
  'about.cat4lead': { en: 'Zero customer-service dependency — complete automated transactions via <strong>Top-up ➔ Choose Service ➔ Enter Link ➔ Auto Dispatch</strong>.', zh: '客户不需要联系人工客服，全流程在网页上通过<strong>充值 ➔ 选品 ➔ 填链接 ➔ 自动交单</strong>完成自动化交易的系统。' },
  'about.cat4b1': { en: '24/7 automated order submission without delay', zh: '24/7 无需人工介入，秒级全自动交单' },
  'about.cat4b2': { en: '<strong>Top-up ➔ Select ➔ Link ➔ Auto Dispatch</strong>', zh: '<strong>充值 ➔ 选品 ➔ 填链接 ➔ 自动交单</strong> 全自动闭环' },
  'about.cat4b3': { en: 'Direct upstream API sync and live status updates', zh: '一手货源 API 直连与实时状态自动回调' },
  'about.cat4cta': { en: 'Start Self-Service Order →', zh: '立即体验自助下单 →' },

  'why.title': { en: 'Why choose us?', zh: '为什么选择我们？' },
  'why.lead': { en: 'We aim to offer some of the best service in the industry.', zh: '我们致力于提供业内最好的服务。' },
  'why.c1t': { en: 'Round-the-Clock Support', zh: '全天候支持' },
  'why.c1s': { en: 'Our support team is ready to help you, whenever you need it.', zh: '我们的支持团队随时准备为您提供帮助。' },
  'why.c1r1': { en: 'WhatsApp live chat', zh: 'WhatsApp 实时客服' },
  'why.c1r2': { en: '24/7 order support', zh: '24/7 订单支持' },
  'why.c1r3': { en: 'Dedicated reseller support', zh: '代理专属支持' },
  'why.c2t': { en: 'Instant Delivery', zh: '即时送达' },
  'why.c2s': { en: 'Once purchased, your product is ready right away.', zh: '购买后，您的产品即可立即使用。' },
  'why.c3t': { en: 'Clear Instructions', zh: '详细说明' },
  'why.c3s': { en: 'Step-by-step guidance on how to use our products correctly.', zh: '如何正确使用我们产品的分步说明。' },
  'why.c4t': { en: 'No Hidden Fees', zh: '无隐藏费用' },
  'why.c4s': { en: 'Our pricing is simple and transparent — you only pay for the service you use.', zh: '我们的定价方式简单明了：没有隐藏费用，只收取您使用的服务费用。' },
  'why.statNumber': { en: 'Growing daily', zh: '每日成长中' },
  'why.statLabel': { en: 'Orders successfully delivered to happy customers and resellers.', zh: '我们已成功为客户和代理交付订单。' },

  'agent.title': { en: 'Build your business<br><span>with Uziseller.</span>', zh: '与Uziseller<br><span>共建你的事业。</span>' },
  'agent.lead': { en: 'We are building a partner-focused digital services platform. If you have customers, a community or a sales channel, talk to us about reseller cooperation.', zh: '我们正在打造以代理为核心的数字服务平台。如果你有客户、社群或销售渠道，欢迎联系我们洽谈代理合作。' },
  'agent.p1': { en: '✓ Partner pricing', zh: '✓ 代理专属价格' },
  'agent.p2': { en: '✓ Product support', zh: '✓ 产品支持' },
  'agent.p3': { en: '✓ Long-term cooperation', zh: '✓ 长期合作' },
  'agent.cta': { en: 'Become a Partner →', zh: '成为代理 →' },

  'products.title': { en: 'Products', zh: '商品' },
  'products.lead': { en: 'Browse, compare and order — everything your customers and resellers need in one place.', zh: '浏览、比较并下单——满足客户与代理所需的一切。' },
  'products.tab1': { en: 'Google AI Pro', zh: 'Google AI Pro' },
  'products.tab2': { en: 'Claude & ChatGPT', zh: 'Claude & ChatGPT' },
  'products.tab3': { en: 'SMM Panel', zh: '社媒营销面板' },

  'gemini.title': { en: 'Google AI Pro + 5TB Google One', zh: 'Google AI Pro + 5TB云端存储空间' },
  'gemini.badge': { en: '18-Month On-Mail Access', zh: '18个月邮箱直接开通' },
  'gemini.desc': { en: 'Instant 18-month access to Gemini 3.1 Pro AI + 5TB Google Drive storage. Use the provided trial link for auto-activation — no student ID required. Perfect starter option.', zh: '即时获得18个月 Gemini 3.1 Pro AI + 5TB Google Drive 存储空间使用权。使用提供的试用链接自动激活，无需学生证。新手入门首选。' },
  'gemini.f1t': { en: '18 months', zh: '18个月' },
  'gemini.f1s': { en: 'Access period stated for this offer', zh: '本产品的使用期限' },
  'gemini.f2t': { en: '5TB', zh: '5TB' },
  'gemini.f2s': { en: 'Google One storage included', zh: '包含的Google One存储空间' },
  'gemini.f3s': { en: 'Uziseller price', zh: 'Uziseller 价格' },
  'gemini.order': { en: 'Order via WhatsApp', zh: '通过WhatsApp下单' },

  'product.c1t': { en: 'AI Productivity', zh: 'AI 生产力' },
  'product.c1s': { en: 'Use premium AI capabilities for writing, research, coding and creative work.', zh: '使用高级AI能力进行写作、研究、编程和创意工作。' },
  'product.c2t': { en: 'Cloud Storage', zh: '云端存储' },
  'product.c2s': { en: 'Large cloud storage for files, photos and other supported Google services.', zh: '大容量云存储，用于文件、照片及其他支持的Google服务。' },
  'product.c3t': { en: 'Your Own Account', zh: '专属账号' },
  'product.c3s': { en: 'The offer is presented as an activation link rather than a shared account.', zh: '以激活链接形式提供，而非共享账号。' },
  'product.c4t': { en: 'Simple Activation', zh: '简单激活' },
  'product.c4s': { en: 'Purchase → receive link → sign in → activate.', zh: '购买 → 获取链接 → 登录 → 激活。' },

  'steps.importantLabel': { en: 'Important:', zh: '重要提示：' },
  'steps.notice': { en: 'The activation link for this offer is stated to be valid for 12 hours. Please use it promptly. Availability and feature eligibility may depend on the applicable offer and account/region.', zh: '此产品的激活链接有效期为12小时，请尽快使用。可用性及功能资格可能因具体产品和账号/地区而异。' },

  'subs.comingSoon': { en: 'Coming soon — contact us to be notified when this is available.', zh: '即将上线——联系我们以获得上线通知。' },
  'subs.inquire': { en: 'Inquire on WhatsApp', zh: 'WhatsApp 咨询' },
  'subs.note': { en: "Premium Claude & ChatGPT AI accounts. Real-time delivery and dedicated support.", zh: '精选 Claude & ChatGPT 优质账号，全自动即时发货与专属客服保障。' },
  'subs.shopKicker': { en: 'CLAUDE & CHATGPT SUBSCRIPTIONS', zh: 'CLAUDE 与 CHATGPT ��阅' },
  'subs.shopTitle': { en: 'Choose your AI subscription, compare plans, and order', zh: '选择您的 AI 订阅版本、比较套餐并下单' },
  'subs.shopLead': { en: 'Instant live inventory. Clear pricing, product details and fast automated checkout.', zh: '实时现货库存，清晰透明价格与产品说明，支持全自动安全结算。' },
  'subs.search': { en: 'Search Claude or ChatGPT...', zh: '搜索 Claude 或 ChatGPT…' },
  'subs.categories': { en: 'Categories', zh: '产品分类' },

  'subs.products': { en: 'Products', zh: '产品' },
  'subs.digitalProduct': { en: 'Digital Product', zh: '数字产品' },
  'subs.liveProduct': { en: 'Live product', zh: '实时商品' },
  'subs.viewBuy': { en: 'Details & Buy', zh: '详情并购买' },
  'subs.trySearch': { en: 'Try searching "Claude" or "ChatGPT".', zh: '请尝试搜索 “Claude” 或 “ChatGPT”。' },
  'subs.loadingDetails': { en: 'Loading product details…', zh: '正在读取商品详情…' },
  'subs.whatYouGet': { en: 'WHAT YOU GET', zh: '商品说明' },
  'subs.productPurpose': { en: 'Product purpose & details', zh: '产品用途与详细资料' },
  'subs.howToUse': { en: 'HOW TO USE', zh: '使用说明' },
  'subs.instructions': { en: 'Instructions / Notes', zh: '使用方法 / 注意事项' },
  'subs.productInfo': { en: 'PRODUCT INFO', zh: '产品信息' },
  'subs.category': { en: 'Category', zh: '产品分类' },
  'subs.delivery': { en: 'Delivery', zh: '交付方式' },
  'subs.duration': { en: 'Validity', zh: '有效期' },
  'subs.warranty': { en: 'Warranty', zh: '售后/保障' },
  'subs.stock': { en: 'Availability', zh: '库存/可用数量' },
  'subs.type': { en: 'Product type', zh: '产品类型' },
  'subs.quantityRange': { en: 'Quantity range', zh: '购买数量' },
  'subs.sellingPrice': { en: 'Selling price', zh: '销售价' },
  'subs.continueCheckout': { en: 'Continue to checkout', zh: '继续下单' },
  'subs.namePlaceholder': { en: 'Your full name', zh: '您的姓名' },
  'subs.detailError': { en: 'Unable to load full product details', zh: '暂时无法读取完整商品详情' },
  'subs.retry': { en: 'Retry', zh: '重试' },
  'subs.catalogError': { en: 'Subscription catalogue is temporarily unavailable.', zh: '应用订阅目录暂时无法加载。' },

  'smm.loading': { en: 'Loading services…', zh: '正在加载服务…' },
  'smm.search': { en: 'Search services…', zh: '搜索服务…' },
  'smm.orderNow': { en: 'Order Now', zh: '立即下单' },
  'smm.available': { en: 'services available', zh: '项服务可选' },
  'smm.none': { en: 'No services match this filter.', zh: '没有符合筛选条件的服务。' },
  'smm.all': { en: 'All', zh: '全部' },
  'smm.searchBtn': { en: 'Search', zh: '搜索' },
  'smm.clear': { en: 'Clear', zh: '清除' },
  'smm.loadMore': { en: 'Load more services', zh: '加载更多服务' },
  'smm.tryAgain': { en: 'Try another keyword or category.', zh: '请尝试其他关键词或分类。' },
  'smm.searchingFor': { en: 'search', zh: '搜索' },
  'smm.error': { en: 'Unable to load the service catalogue.', zh: '无法加载服务目录。' },

  'card.min': { en: 'Min', zh: '最小' },
  'card.max': { en: 'Max', zh: '最大' },
  'card.refill': { en: 'Refill', zh: '补单' },
  'card.perUnits': { en: '/ 1,000 units', zh: '/ 每千单位' },

  'order.link': { en: 'Link / target (profile or page URL)', zh: '链接 / 目标（主页或页面网址）' },
  'order.quantity': { en: 'Quantity', zh: '数量' },
  'order.name': { en: 'Your name', zh: '您的姓名' },
  'order.email': { en: 'Email (for payment receipt)', zh: '邮箱（用于接收付款收据）' },
  'order.pay': { en: 'Pay with Billplz →', zh: '使用 Billplz 付款 →' },
  'order.creating': { en: 'Creating payment…', zh: '正在创建付款…' },
  'order.fillAll': { en: 'Please fill in all fields.', zh: '请填写所有栏位。' },
  'order.genericError': { en: 'Something went wrong.', zh: '出现了一些问题。' },
  'order.networkError': { en: 'Network error. Please try again.', zh: '网络错误，请重试。' },
  'order.minMax': { en: 'Min {min}, Max {max}', zh: '最小 {min}，最大 {max}' },
  'order.description': { en: 'Service Description', zh: '商品简介' },
  'order.noDescription': { en: 'No service description provided by the supplier.', zh: '供应商暂未提供商品简介。' },
  'order.serviceType': { en: 'Service type', zh: '服务类型' },
  'order.quantityRange': { en: 'Quantity range', zh: '数量范围' },
  'order.refill': { en: 'Refill', zh: '补单' },
  'order.cancel': { en: 'Cancel', zh: '可取消' },
  'order.yes': { en: 'Yes', zh: '是' },
  'order.no': { en: 'No', zh: '否' },
  'order.averageTime': { en: 'Completion time', zh: '完成时间' },

  'contact.title': { en: "Let's grow together.", zh: '一起成长。' },
  'contact.lead': { en: 'Questions, orders or partnership enquiries — reach us directly.', zh: '有任何问题、订单或合作咨询，欢迎直接联系我们。' },

  'footer.tag1': { en: 'Digital Growth & Premium Services', zh: '数字增长与优质服务' },
  'footer.tag2': { en: 'Built for Growth. Powered by Trust.', zh: '为增长而生，值得信赖。' }
};

const SERVICE_TRANSLATIONS = {
  'facebook tăng bình luận': { zh: 'Facebook 增加评论', en: 'Facebook Increase Comments' },
  'facebook tăng like': { zh: 'Facebook 增加点赞', en: 'Facebook Increase Likes' },
  'facebook tăng follow': { zh: 'Facebook 增加粉丝', en: 'Facebook Increase Followers' },
  'facebook tăng view': { zh: 'Facebook 增加观看次数', en: 'Facebook Increase Views' },
  'like post facebook': { zh: 'Facebook 帖子点赞', en: 'Facebook Post Likes' },
  'comment facebook': { zh: 'Facebook 评论', en: 'Facebook Comments' },
  'facebook comment': { zh: 'Facebook 评论', en: 'Facebook Comments' },
  'comment facebook dạng mới': { zh: 'Facebook 评论 · 新版', en: 'Facebook Comments · New Type' },
  'tiktok tăng like': { zh: 'TikTok 增加点赞', en: 'TikTok Increase Likes' },
  'tiktok tăng follow': { zh: 'TikTok 增加粉丝', en: 'TikTok Increase Followers' },
  'tiktok tăng view': { zh: 'TikTok 增加观看次数', en: 'TikTok Increase Views' },
  'instagram tăng like': { zh: 'Instagram 增加点赞', en: 'Instagram Increase Likes' },
  'instagram tăng follow': { zh: 'Instagram 增加粉丝', en: 'Instagram Increase Followers' },
  'youtube tăng view': { zh: 'YouTube 增加观看次数', en: 'YouTube Increase Views' },
  'youtube tăng sub': { zh: 'YouTube 增加订阅', en: 'YouTube Increase Subscribers' },
  'youtube tăng subscriber': { zh: 'YouTube 增加订阅者', en: 'YouTube Increase Subscribers' },
  'youtube comment': { zh: 'YouTube 评论', en: 'YouTube Comments' }
};

function localizePlatformLabel(label, lang) {
  const map = {
    Facebook: { zh: 'Facebook', en: 'Facebook' },
    TikTok: { zh: 'TikTok', en: 'TikTok' },
    Instagram: { zh: 'Instagram', en: 'Instagram' },
    YouTube: { zh: 'YouTube', en: 'YouTube' },
    Threads: { zh: 'Threads', en: 'Threads' },
    Telegram: { zh: 'Telegram', en: 'Telegram' },
    'Twitter/X': { zh: 'Twitter/X', en: 'Twitter/X' },
    Spotify: { zh: 'Spotify', en: 'Spotify' },
    Shopee: { zh: 'Shopee', en: 'Shopee' },
    Zalo: { zh: 'Zalo', en: 'Zalo' },
    LinkedIn: { zh: 'LinkedIn', en: 'LinkedIn' },
    'Website/SEO': { zh: '网站/SEO', en: 'Website/SEO' },
    Others: { zh: '其他', en: 'Others' }
  };
  const item = map[String(label)] || null;
  return item ? (item[lang] || item.en) : localizeServiceText(label, lang);
}

function localizeServiceText(text, lang) {
  let out = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!out) return '';

  const entries = Object.entries(SERVICE_TRANSLATIONS).sort((a, b) => b[0].length - a[0].length);
  for (const [src, vals] of entries) {
    const escaped = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^A-Za-zÀ-ỹĐđ])${escaped}(?=$|[^A-Za-zÀ-ỹĐđ])`, 'gi');
    out = out.replace(re, (m, prefix) => prefix + (vals[lang] || vals.en));
  }
  const hasVietnamese = /[À-ỹĐđ]/.test(out);
  if (hasVietnamese) {
    out = out.replace(/\b[A-Za-zÀ-ỹĐđ]*[À-ỹĐđ][A-Za-zÀ-ỹĐđ]*\b/gi, '').replace(/\s{2,}/g, ' ').trim();
  }
  return out;
}

function localizeServiceDescription(text, lang) {
  let out = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!out) return '';
  const entries = Object.entries(SERVICE_TRANSLATIONS).sort((a, b) => b[0].length - a[0].length);
  for (const [src, vals] of entries) {
    const escaped = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^A-Za-zÀ-ỹĐđ])${escaped}(?=$|[^A-Za-zÀ-ỹĐđ])`, 'gi');
    out = out.replace(re, (m, prefix) => prefix + (vals[lang] || vals.en));
  }
  out = out.replace(/\b[A-Za-zÀ-ỹĐđ]*[À-ỹĐđ][A-Za-zÀ-ỹĐđ]*\b/gi, ' ');
  out = out.replace(/\[[^\]]*[À-ỹĐđ][^\]]*\]/gi, '');
  out = out.replace(/\s{2,}/g, ' ').trim();
  return out;
}

const CURRENCY = {
  MYR: { symbol: 'RM', locale: 'en-MY', toMyr: 1 },
  USD: { symbol: '$', locale: 'en-US', toMyr: 4.04 },
  CNY: { symbol: '¥', locale: 'zh-CN', toMyr: 0.60 }
};

const UzState = {
  lang: localStorage.getItem('uz_lang') || 'en',
  currency: localStorage.getItem('uz_currency') || 'MYR'
};

function formatPrice(amountInMyr, currency) {
  const c = CURRENCY[currency] || CURRENCY.MYR;
  const converted = currency === 'MYR' ? amountInMyr : amountInMyr / c.toMyr;
  return c.symbol + converted.toLocaleString(c.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function t(key, vars) {
  const entry = I18N[key];
  let str = entry ? (entry[UzState.lang] || entry.en) : key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
  return str;
}

function applyLanguage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const entry = I18N[el.getAttribute('data-i18n')];
    if (entry) el.textContent = entry[lang] || entry.en;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const entry = I18N[el.getAttribute('data-i18n-html')];
    if (entry) el.innerHTML = entry[lang] || entry.en;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const entry = I18N[el.getAttribute('data-i18n-placeholder')];
    if (entry) el.placeholder = entry[lang] || entry.en;
  });
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('meta.title');
  document.dispatchEvent(new CustomEvent('uz:langchange', { detail: { lang } }));
}

function applyCurrency(currency) {
  document.querySelectorAll('[data-price]').forEach(el => {
    el.textContent = formatPrice(Number(el.getAttribute('data-price')), currency);
  });
  document.querySelectorAll('[data-price-old]').forEach(el => {
    el.textContent = formatPrice(Number(el.getAttribute('data-price-old')), currency);
  });
  document.dispatchEvent(new CustomEvent('uz:currencychange', { detail: { currency } }));
}

function initSwitchers() {
  const langBtns = document.querySelectorAll('#lang-switcher button');
  const curBtns = document.querySelectorAll('#currency-switcher button');

  langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === UzState.lang);
    btn.addEventListener('click', () => {
      const next = btn.dataset.lang;
      if (next === UzState.lang) return;
      UzState.lang = next;
      localStorage.setItem('uz_lang', UzState.lang);
      langBtns.forEach(b => b.classList.toggle('active', b === btn));
      applyLanguage(next);
    });
  });

  curBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === UzState.currency);
    btn.addEventListener('click', () => {
      UzState.currency = btn.dataset.currency;
      localStorage.setItem('uz_currency', UzState.currency);
      curBtns.forEach(b => b.classList.toggle('active', b === btn));
      applyCurrency(UzState.currency);
    });
  });

  applyLanguage(UzState.lang);
  applyCurrency(UzState.currency);
}

document.addEventListener('DOMContentLoaded', initSwitchers);
