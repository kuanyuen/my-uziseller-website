// Lightweight i18n + currency switcher for the static site.
// Language: swaps textContent/innerHTML/placeholder on elements tagged with
// data-i18n / data-i18n-html / data-i18n-placeholder.
// Currency: converts elements tagged with data-price="<RM amount>" (and an
// optional data-price-old for the struck-through price).

const I18N = {
  'nav.home': { en: 'Home', zh: '首页' },
  'nav.products': { en: 'Products', zh: '商品' },

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
  'hero.lead': { en: 'A complete digital-services ecosystem that saves you time and grows your revenue — AI accounts, premium subscriptions, and social-media growth tools, all in one place.', zh: '利用全面的数字化服务生态系统，优化您的时间并提升收益。我们提供优质资源、人工智能账户，以及增强社交媒体互动的营销工具。' },
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
  'about.cat1title': { en: 'Resources & AI Store', zh: '资源与人工智能商店' },
  'about.cat1lead': { en: 'A comprehensive library of high-quality digital resources for work and content creation.', zh: '一个包含高质量数字资源的综合库，助力工作和内容创作。' },
  'about.cat1b1': { en: 'Premium accounts (ChatGPT, Canva and more)', zh: '高级账户（ChatGPT、Canva 等）' },
  'about.cat1cta': { en: 'Browse Subscriptions →', zh: '浏览订阅商品 →' },
  'about.cat2title': { en: 'Professional SMM Panel', zh: '专业社交媒体营销面板' },
  'about.cat2lead': { en: "Boost your brand's credibility and influence across social media platforms.", zh: '提升品牌在社交媒体平台上的信誉度和影响力。' },
  'about.cat2b1': { en: 'Multi-platform (Facebook, TikTok, Instagram and more)', zh: '多平台（Facebook、TikTok、Instagram 等）' },
  'about.cat2b2': { en: 'Automated system — no delay, high security', zh: '自动系统，无延迟，安全性高' },
  'about.cat2b3': { en: 'Ultra-low wholesale pricing for resellers', zh: '为经销商提供超低批发价格' },
  'about.cat2cta': { en: 'Browse SMM Services →', zh: '浏览社媒营销服务 →' },

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
  'products.tab2': { en: 'App Subscriptions', zh: '应用订阅' },
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
  'subs.note': { en: "More premium app subscriptions are being added regularly. Message us on WhatsApp if there's a specific app you'd like to see.", zh: '我们会持续新增更多高级应用订阅。如果您想要某个特定应用，欢迎通过WhatsApp告诉我们。' },

  'smm.loading': { en: 'Loading services…', zh: '正在加载服务…' },
  'smm.search': { en: 'Search services…', zh: '搜索服务…' },
  'smm.costNote': { en: 'Prices shown are the original supplier cost price — no markup applied.', zh: '所显示价格为供应商原始成本价，未加价。' },
  'smm.orderNow': { en: 'Order Now', zh: '立即下单' },
  'smm.available': { en: 'services available', zh: '项服务可选' },
  'smm.none': { en: 'No services match this filter.', zh: '没有符合筛选条件的服务。' },
  'smm.all': { en: 'All', zh: '全部' },

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

  'contact.title': { en: "Let's grow together.", zh: '一起成长。' },
  'contact.lead': { en: 'Questions, orders or partnership enquiries — reach us directly.', zh: '有任何问题、订单或合作咨询，欢迎直接联系我们。' },

  'footer.tag1': { en: 'Digital Growth & Premium Services', zh: '数字增长与优质服务' },
  'footer.tag2': { en: 'Built for Growth. Powered by Trust.', zh: '为增长而生，值得信赖。' }
};


// SMM service-name localization.
// Supplier names are often returned in Vietnamese. We keep the original
// service ID/name for ordering, but localize only what customers see.
const SERVICE_TRANSLATIONS = {
  // common phrases (longest phrases should be listed first)
  'giá rẻ': { zh: '便宜', en: 'Cheap' },
  'đa quốc gia': { zh: '多国', en: 'Global' },
  'quốc gia': { zh: '国家', en: 'Country' },
  'dạng mới': { zh: '新版', en: 'New Type' },
  'thử nghiệm': { zh: '测试', en: 'Test' },
  'không tụt': { zh: '不掉粉', en: 'No Drop' },
  'tài khoản': { zh: '账号', en: 'Account' },
  'người theo dõi': { zh: '粉丝', en: 'Followers' },
  'lượt thích': { zh: '点赞', en: 'Likes' },
  'lượt xem': { zh: '观看次数', en: 'Views' },
  'lượt theo dõi': { zh: '关注', en: 'Follows' },
  'bình luận': { zh: '评论', en: 'Comments' },
  'tương tác': { zh: '互动', en: 'Engagement' },
  'đánh giá': { zh: '评价', en: 'Reviews' },
  '5 sao': { zh: '5星', en: '5 Stars' },
  'chính hãng': { zh: '官方', en: 'Official' },
  'tự động': { zh: '自动', en: 'Automatic' },
  'chất lượng cao': { zh: '高质量', en: 'High Quality' },
  'thời gian': { zh: '时间', en: 'Time' },
  'mỗi ngày': { zh: '每天', en: 'Daily' },
  'mỗi giờ': { zh: '每小时', en: 'Hourly' },
  'thanh toán': { zh: '付款', en: 'Payment' },
  'bảo hành': { zh: '保修', en: 'Warranty' },
  'đơn hàng': { zh: '订单', en: 'Order' },
  'khách hàng': { zh: '客户', en: 'Customer' },

  // common SMM words
  'like': { zh: '点赞', en: 'Likes' },
  'likes': { zh: '点赞', en: 'Likes' },
  'like post': { zh: '帖子点赞', en: 'Post Likes' },
  'like comment': { zh: '评论点赞', en: 'Comment Likes' },
  'post': { zh: '帖子', en: 'Post' },
  'comment': { zh: '评论', en: 'Comment' },
  'comments': { zh: '评论', en: 'Comments' },
  'follow': { zh: '关注', en: 'Follows' },
  'followers': { zh: '粉丝', en: 'Followers' },
  'view': { zh: '观看', en: 'Views' },
  'views': { zh: '观看次数', en: 'Views' },
  'share': { zh: '分享', en: 'Shares' },
  'sub': { zh: '订阅', en: 'Subscriptions' },
  'subscribe': { zh: '订阅', en: 'Subscribe' },
  'subscriber': { zh: '订阅者', en: 'Subscribers' },
  'member': { zh: '成员', en: 'Members' },
  'group': { zh: '群组', en: 'Group' },
  'page': { zh: '页面', en: 'Page' },
  'story': { zh: '快拍', en: 'Story' },
  'video': { zh: '视频', en: 'Video' },
  'live': { zh: '直播', en: 'Live' },
  'channel': { zh: '频道', en: 'Channel' },
  'traffic': { zh: '流量', en: 'Traffic' },
  'rating': { zh: '评分', en: 'Rating' },
  'review': { zh: '评价', en: 'Review' },
  'reviews': { zh: '评价', en: 'Reviews' },
  'vip': { zh: 'VIP', en: 'VIP' },
  'premium': { zh: '高级', en: 'Premium' },
  'organic': { zh: '自然', en: 'Organic' },
  'global': { zh: '全球', en: 'Global' },
  'worldwide': { zh: '全球', en: 'Worldwide' },
  'mixed': { zh: '混合', en: 'Mixed' },
  'new': { zh: '新', en: 'New' },
  'test': { zh: '测试', en: 'Test' },
  'cheap': { zh: '便宜', en: 'Cheap' },
  'fast': { zh: '快速', en: 'Fast' },
  'stable': { zh: '稳定', en: 'Stable' },
  'quality': { zh: '质量', en: 'Quality' },

  // Vietnamese words
  'facebook': { zh: 'Facebook', en: 'Facebook' },
  'tiktok': { zh: 'TikTok', en: 'TikTok' },
  'instagram': { zh: 'Instagram', en: 'Instagram' },
  'youtube': { zh: 'YouTube', en: 'YouTube' },
  'threads': { zh: 'Threads', en: 'Threads' },
  'telegram': { zh: 'Telegram', en: 'Telegram' },
  'twitter': { zh: 'Twitter', en: 'Twitter' },
  'spotify': { zh: 'Spotify', en: 'Spotify' },
  'shopee': { zh: 'Shopee', en: 'Shopee' },
  'website': { zh: '网站', en: 'Website' },
  'seo': { zh: 'SEO', en: 'SEO' },
  'giá': { zh: '价格', en: 'Price' },
  'rẻ': { zh: '便宜', en: 'Cheap' },
  'mới': { zh: '新', en: 'New' },
  'quốc': { zh: '国家', en: 'Country' },
  'comment': { zh: '评论', en: 'Comment' },
  'bình': { zh: '评论', en: 'Comment' },
  'luận': { zh: '评论', en: 'Comment' },
  'thích': { zh: '点赞', en: 'Likes' },
  'xem': { zh: '观看', en: 'Views' },
  'theo': { zh: '关注', en: 'Follow' },
  'dõi': { zh: '关注', en: 'Follow' },
  'người': { zh: '用户', en: 'Users' },
  'dùng': { zh: '用户', en: 'Users' },
  'tăng': { zh: '增加', en: 'Increase' },
  'giảm': { zh: '减少', en: 'Decrease' },
  'tương': { zh: '互动', en: 'Engagement' },
  'tác': { zh: '互动', en: 'Engagement' },
  'đông': { zh: '东', en: 'East' },
  'nam': { zh: '南', en: 'South' },
  'việt': { zh: '越南', en: 'Vietnam' },
  'nội': { zh: '本地', en: 'Local' },
  'địa': { zh: '本地', en: 'Local' },
  'tây': { zh: '西方', en: 'Western' },
  'thật': { zh: '真人', en: 'Real' },
  'ảo': { zh: '虚拟', en: 'Virtual' },
  'bot': { zh: '机器人', en: 'Bot' },
  'quảng cáo': { zh: '广告', en: 'Ads' },
  'kênh': { zh: '频道', en: 'Channel' },
  'ngày': { zh: '天', en: 'Days' },
  'giờ': { zh: '小时', en: 'Hours' },
  'phút': { zh: '分钟', en: 'Minutes' },
  'tuần': { zh: '周', en: 'Weeks' },
  'tháng': { zh: '月', en: 'Months' },
  'năm': { zh: '年', en: 'Years' },
  'không': { zh: '无', en: 'No' },
  'có': { zh: '有', en: 'With' },
  'với': { zh: '与', en: 'With' },
  'cho': { zh: '用于', en: 'For' },
  'từ': { zh: '从', en: 'From' },
  'đến': { zh: '至', en: 'To' },
  'trên': { zh: '在', en: 'On' },
  'bằng': { zh: '通过', en: 'By' },
  'chỉ': { zh: '仅', en: 'Only' },
  'tất cả': { zh: '全部', en: 'All' },
  'nhanh': { zh: '快速', en: 'Fast' },
  'chậm': { zh: '慢速', en: 'Slow' },
  'ổn định': { zh: '稳定', en: 'Stable' },
  'cao': { zh: '高', en: 'High' },
  'thấp': { zh: '低', en: 'Low' },
  'tốt': { zh: '优质', en: 'Good' },
  'đặc biệt': { zh: '特别', en: 'Special' },
  'chuyên nghiệp': { zh: '专业', en: 'Professional' },
  'dịch vụ': { zh: '服务', en: 'Service' },
  'mục tiêu': { zh: '目标', en: 'Target' },
  'liên kết': { zh: '链接', en: 'Link' },
  'trang': { zh: '页面', en: 'Page' },
  'tài khoản': { zh: '账号', en: 'Account' },
  'mua': { zh: '购买', en: 'Buy' },
  'bán': { zh: '销售', en: 'Sell' }
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
  let out = String(text ?? '');
  // Normalize common separators/spacing without changing service IDs.
  out = out.replace(/\s+/g, ' ').trim();
  const entries = Object.entries(SERVICE_TRANSLATIONS)
    .sort((a, b) => b[0].length - a[0].length);
  for (const [src, vals] of entries) {
    const re = new RegExp(`(^|[^A-Za-zÀ-ỹĐđ])${src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^A-Za-zÀ-ỹĐđ])`, 'gi');
    out = out.replace(re, (m, prefix) => prefix + (vals[lang] || vals.en));
  }
  // Vietnamese punctuation/diacritics left in names should not leak through
  // as mixed-language labels. Keep brand names and IDs intact.
  return out.replace(/\s*-\s*/g, ' - ').replace(/\s{2,}/g, ' ').trim();
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
  // Let other scripts (e.g. the SMM catalogue / order modal) know so they
  // can re-render any text they built themselves via template strings.
  document.dispatchEvent(new CustomEvent('uz:langchange', { detail: { lang } }));
}

function applyCurrency(currency) {
  document.querySelectorAll('[data-price]').forEach(el => {
    el.textContent = formatPrice(Number(el.getAttribute('data-price')), currency);
  });
  document.querySelectorAll('[data-price-old]').forEach(el => {
    el.textContent = formatPrice(Number(el.getAttribute('data-price-old')), currency);
  });
  // Let other scripts (e.g. the SMM catalogue) know the currency changed.
  document.dispatchEvent(new CustomEvent('uz:currencychange', { detail: { currency } }));
}

function initSwitchers() {
  const langBtns = document.querySelectorAll('#lang-switcher button');
  const curBtns = document.querySelectorAll('#currency-switcher button');

  langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === UzState.lang);
    btn.addEventListener('click', () => {
      UzState.lang = btn.dataset.lang;
      localStorage.setItem('uz_lang', UzState.lang);
      langBtns.forEach(b => b.classList.toggle('active', b === btn));
      applyLanguage(UzState.lang);
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
