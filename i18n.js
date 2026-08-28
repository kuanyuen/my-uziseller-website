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


// SMM service-name localization.
// Supplier names are often returned in Vietnamese. We keep the original
// service ID/name for ordering, but localize only what customers see.
const SERVICE_TRANSLATIONS = {
  // common phrases (longest phrases should be listed first)
  // Vietnamese phrases frequently used by the supplier (including phrases
  // that were not covered by the original word-by-word dictionary).
  'cảm xúc': { zh: '情绪互动', en: 'Emotions' },
  'đang': { zh: '正在', en: 'Currently' },
  'tăng độ': { zh: '提升等级', en: 'Increase Level' },
  'tốc độ': { zh: '速度', en: 'Speed' },
  'độ': { zh: '等级', en: 'Level' },
  'lời mời kết bạn': { zh: '好友邀请', en: 'Friend Requests' },
  'kết bạn': { zh: '加好友', en: 'Add Friends' },
  'mắt trực tiếp': { zh: '直播观看', en: 'Live Viewers' },
  'trực tiếp': { zh: '直播', en: 'Live' },
  'xúc': { zh: '情绪', en: 'Emotion' },
  'cảm': { zh: '情绪', en: 'Emotion' },
  'sale': { zh: '销售', en: 'Sale' },
  '增加': { zh: '增加', en: 'Increase' },
  '分享': { zh: '分享', en: 'Shares' },
  '评论': { zh: '评论', en: 'Comments' },
  '测试': { zh: '测试', en: 'Test' },
  '稳定': { zh: '稳定', en: 'Stable' },
  '便宜': { zh: '便宜', en: 'Cheap' },
  '直播': { zh: '直播', en: 'Live' },
  '观看': { zh: '观看', en: 'Views' },
  '观看次数': { zh: '观看次数', en: 'Views' },
  '快速': { zh: '快速', en: 'Fast' },
  '正在': { zh: '正在', en: 'Currently' },
  '销售': { zh: '销售', en: 'Sale' },
  '規看': { zh: '观看', en: 'Views' },
  '快抛': { zh: '快速', en: 'Fast' },
  '帖子点赞': { zh: '帖子点赞', en: 'Post Likes' },
  '评论点赞': { zh: '评论点赞', en: 'Comment Likes' },
  '好友邀请': { zh: '好友邀请', en: 'Friend Requests' },
  'giá rẻ': { zh: '便宜', en: 'Cheap' },
  'độc quyền': { zh: '独家', en: 'Exclusive' },
  'độc': { zh: '独家', en: 'Exclusive' },
  'quyền': { zh: '权利', en: 'Rights' },
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

  // Expanded Vietnamese SMM vocabulary. Keep phrase entries before single-word
  // entries so supplier names are translated as natural phrases instead of
  // becoming awkward word-by-word mixtures.
  'cảm xúc tuỳ chọn': { zh: '可选表情', en: 'Optional Reactions' },
  'cảm xúc tùy chọn': { zh: '可选表情', en: 'Optional Reactions' },
  'ẩn kẹp hiện': { zh: '隐藏显示', en: 'Hidden/Shown' },
  'ẩn hiện': { zh: '隐藏/显示', en: 'Hidden/Shown' },
  'không order': { zh: '不可下单', en: 'Do Not Order' },
  'không đặt hàng': { zh: '不可下单', en: 'Do Not Order' },
  'không cần mật khẩu': { zh: '无需密码', en: 'No Password Required' },
  'mật khẩu': { zh: '密码', en: 'Password' },
  'trung bình': { zh: '中速', en: 'Medium' },
  'tốc độ tùy chọn': { zh: '可选速度', en: 'Optional Speed' },
  'tốc độ tuỳ chọn': { zh: '可选速度', en: 'Optional Speed' },
  'tốc độ ổn định': { zh: '速度稳定', en: 'Stable Speed' },
  'giá rẻ': { zh: '价格便宜', en: 'Cheap Price' },
  'giá tốt': { zh: '优惠价格', en: 'Good Price' },
  'giá sỉ': { zh: '批发价', en: 'Wholesale Price' },
  'giá bán': { zh: '销售价格', en: 'Selling Price' },
  'tăng like': { zh: '增加点赞', en: 'Increase Likes' },
  'tăng lượt thích': { zh: '增加点赞', en: 'Increase Likes' },
  'tăng follow': { zh: '增加关注', en: 'Increase Followers' },
  'tăng người theo dõi': { zh: '增加粉丝', en: 'Increase Followers' },
  'tăng view': { zh: '增加观看次数', en: 'Increase Views' },
  'tăng lượt xem': { zh: '增加观看次数', en: 'Increase Views' },
  'tăng comment': { zh: '增加评论', en: 'Increase Comments' },
  'tăng bình luận': { zh: '增加评论', en: 'Increase Comments' },
  'tăng share': { zh: '增加分享', en: 'Increase Shares' },
  'tăng lượt chia sẻ': { zh: '增加分享', en: 'Increase Shares' },
  'tăng sub': { zh: '增加订阅', en: 'Increase Subscribers' },
  'tăng subscriber': { zh: '增加订阅者', en: 'Increase Subscribers' },
  'tăng member': { zh: '增加成员', en: 'Increase Members' },
  'tăng tương tác': { zh: '增加互动', en: 'Increase Engagement' },
  'tăng cảm xúc': { zh: '增加表情互动', en: 'Increase Reactions' },
  'tăng tim': { zh: '增加爱心', en: 'Increase Hearts' },
  'tăng lượt lưu': { zh: '增加收藏', en: 'Increase Saves' },
  'tăng yêu thích': { zh: '增加收藏', en: 'Increase Favorites' },
  'tăng đánh giá': { zh: '增加评价', en: 'Increase Reviews' },
  'tăng vote': { zh: '增加投票', en: 'Increase Votes' },
  'tăng traffic': { zh: '增加流量', en: 'Increase Traffic' },
  'tăng kết bạn': { zh: '增加好友', en: 'Increase Friends' },
  'tăng độ uy tín': { zh: '提升信誉度', en: 'Increase Credibility' },
  'tăng trưởng': { zh: '增长', en: 'Growth' },
  'tăng tốc': { zh: '加速', en: 'Speed Up' },
  'lượt thích': { zh: '点赞次数', en: 'Likes' },
  'lượt xem': { zh: '观看次数', en: 'Views' },
  'lượt chia sẻ': { zh: '分享次数', en: 'Shares' },
  'lượt bình luận': { zh: '评论次数', en: 'Comments' },
  'lượt theo dõi': { zh: '关注次数', en: 'Follows' },
  'lượt lưu': { zh: '收藏次数', en: 'Saves' },
  'lượt truy cập': { zh: '访问次数', en: 'Visits' },
  'người theo dõi': { zh: '粉丝', en: 'Followers' },
  'người đăng ký': { zh: '订阅者', en: 'Subscribers' },
  'thành viên': { zh: '成员', en: 'Members' },
  'thành viên nhóm': { zh: '群组成员', en: 'Group Members' },
  'thành viên kênh': { zh: '频道成员', en: 'Channel Members' },
  'bài viết': { zh: '帖子', en: 'Post' },
  'bài đăng': { zh: '帖子', en: 'Post' },
  'bình luận': { zh: '评论', en: 'Comments' },
  'chia sẻ bài viết': { zh: '分享帖子', en: 'Post Shares' },
  'chia sẻ video': { zh: '分享视频', en: 'Video Shares' },
  'thả tim': { zh: '点赞', en: 'Like' },
  'tim': { zh: '爱心', en: 'Hearts' },
  'cảm xúc': { zh: '表情互动', en: 'Reactions' },
  'yêu thích': { zh: '收藏', en: 'Favorites' },
  'lưu bài': { zh: '收藏帖子', en: 'Save Post' },
  'lưu video': { zh: '收藏视频', en: 'Save Video' },
  'đăng lại': { zh: '转发', en: 'Repost' },
  'trả lời': { zh: '回复', en: 'Replies' },
  'khảo sát': { zh: '投票调查', en: 'Poll' },
  'đáp án': { zh: '选项', en: 'Answers' },
  'bình chọn': { zh: '投票', en: 'Votes' },
  'mắt xem live': { zh: '直播观看人数', en: 'Live Viewers' },
  'mắt live': { zh: '直播观看人数', en: 'Live Viewers' },
  'mắt trực tiếp': { zh: '直播观看人数', en: 'Live Viewers' },
  'xem trực tiếp': { zh: '直播观看', en: 'Live Views' },
  'view trực tiếp': { zh: '直播观看', en: 'Live Views' },
  'người xem': { zh: '观看者', en: 'Viewers' },
  'truy cập website': { zh: '网站访问', en: 'Website Traffic' },
  'website traffic': { zh: '网站流量', en: 'Website Traffic' },
  'fanpage': { zh: '主页', en: 'Fanpage' },
  'trang cá nhân': { zh: '个人主页', en: 'Profile' },
  'trang facebook': { zh: 'Facebook 主页', en: 'Facebook Page' },
  'trang cá nhân hoặc trang': { zh: '个人主页或页面', en: 'Profile or Page' },
  'reel': { zh: 'Reels视频', en: 'Reel' },
  'video': { zh: '视频', en: 'Video' },
  'story': { zh: '快拍', en: 'Story' },
  'kênh': { zh: '频道', en: 'Channel' },
  'nhóm': { zh: '群组', en: 'Group' },
  'địa điểm': { zh: '地点', en: 'Location' },
  'đánh giá địa điểm': { zh: '地点评价', en: 'Location Reviews' },
  'đánh giá fanpage': { zh: '主页评价', en: 'Fanpage Reviews' },
  'đánh giá 5 sao': { zh: '5星评价', en: '5-Star Reviews' },
  'chất lượng': { zh: '质量', en: 'Quality' },
  'chất lượng cao': { zh: '高质量', en: 'High Quality' },
  'ổn định': { zh: '稳定', en: 'Stable' },
  'khởi động': { zh: '启动', en: 'Start' },
  'bắt đầu': { zh: '开始', en: 'Start' },
  'nhanh': { zh: '快速', en: 'Fast' },
  'chậm': { zh: '慢速', en: 'Slow' },
  'trung bình': { zh: '中速', en: 'Medium' },
  'tự nhiên': { zh: '自然', en: 'Natural' },
  'thật': { zh: '真人', en: 'Real' },
  'ảo': { zh: '虚拟', en: 'Virtual' },
  'bảo hành': { zh: '保修', en: 'Warranty' },
  'không tụt': { zh: '不掉量', en: 'No Drop' },
  'tụt': { zh: '下降', en: 'Drop' },
  'không hoàn tiền': { zh: '不退款', en: 'No Refund' },
  'hoàn tiền': { zh: '退款', en: 'Refund' },
  'tự động': { zh: '自动', en: 'Automatic' },
  'tự động hoàn thành': { zh: '自动完成', en: 'Auto Complete' },
  'không giới hạn': { zh: '无限制', en: 'Unlimited' },
  'không cần': { zh: '无需', en: 'No Need' },
  'cần keyword': { zh: '需要关键词', en: 'Keyword Required' },
  'từ khóa': { zh: '关键词', en: 'Keyword' },
  'liên kết': { zh: '链接', en: 'Link' },
  'link': { zh: '链接', en: 'Link' },
  'mục tiêu': { zh: '目标', en: 'Target' },
  'tài khoản': { zh: '账号', en: 'Account' },
  'profile': { zh: '个人主页', en: 'Profile' },
  'tên người dùng': { zh: '用户名', en: 'Username' },
  'khách hàng': { zh: '客户', en: 'Customer' },
  'doanh nghiệp': { zh: '企业', en: 'Business' },
  'cá nhân': { zh: '个人', en: 'Personal' },
  'chuyên nghiệp': { zh: '专业', en: 'Professional' },
  'đặc biệt': { zh: '特别', en: 'Special' },
  'chính hãng': { zh: '官方', en: 'Official' },
  'quốc tế': { zh: '国际', en: 'International' },
  'toàn cầu': { zh: '全球', en: 'Global' },
  'đa quốc gia': { zh: '多国', en: 'Global' },
  'nhiều quốc gia': { zh: '多国', en: 'Multiple Countries' },
  'nội địa': { zh: '本地', en: 'Local' },
  'việt nam': { zh: '越南', en: 'Vietnam' },
  'miễn phí': { zh: '免费', en: 'Free' },
  'thử nghiệm': { zh: '测试', en: 'Test' },
  'dạng mới': { zh: '新版', en: 'New Type' },
  'mới': { zh: '新', en: 'New' },
  'giá': { zh: '价格', en: 'Price' },
  'rẻ': { zh: '便宜', en: 'Cheap' },
  'độc quyền': { zh: '独家', en: 'Exclusive' },
  'quyền': { zh: '权利', en: 'Rights' },
  'độc': { zh: '独家', en: 'Exclusive' },
  'đang': { zh: '正在', en: 'Currently' },
  'tăng': { zh: '增加', en: 'Increase' },
  'giảm': { zh: '减少', en: 'Decrease' },
  'tốc độ': { zh: '速度', en: 'Speed' },
  'tốc độ nhanh': { zh: '快速速度', en: 'Fast Speed' },
  'tốc độ ổn định': { zh: '稳定速度', en: 'Stable Speed' },
  'tốc độ cao': { zh: '高速', en: 'High Speed' },
  'độ': { zh: '程度', en: 'Level' },
  'tăng độ': { zh: '提升程度', en: 'Increase Level' },
  'tăng độ ổn định': { zh: '提升稳定性', en: 'Increase Stability' },
  'lời mời kết bạn': { zh: '好友邀请', en: 'Friend Requests' },
  'mời kết bạn': { zh: '好友邀请', en: 'Friend Requests' },
  'kết bạn': { zh: '加好友', en: 'Add Friends' },
  'trực tiếp': { zh: '直播', en: 'Live' },
  'cảm': { zh: '情绪', en: 'Emotion' },
  'xúc': { zh: '情绪', en: 'Emotion' },
  'bình': { zh: '评论', en: 'Comment' },
  'luận': { zh: '评论', en: 'Comment' },
  'thích': { zh: '点赞', en: 'Likes' },
  'xem': { zh: '观看', en: 'Views' },
  'theo': { zh: '关注', en: 'Follow' },
  'dõi': { zh: '关注', en: 'Follow' },
  'người': { zh: '用户', en: 'Users' },
  'dùng': { zh: '使用', en: 'Use' },
  'tương': { zh: '互动', en: 'Engagement' },
  'tác': { zh: '互动', en: 'Engagement' },
  'đăng': { zh: '发布', en: 'Post' },
  'bài': { zh: '帖子', en: 'Post' },
  'chia': { zh: '分享', en: 'Share' },
  'sẻ': { zh: '分享', en: 'Share' },
  'lưu': { zh: '收藏', en: 'Save' },
  'đổi': { zh: '更换', en: 'Change' },
  'chọn': { zh: '选择', en: 'Choose' },
  'tuỳ': { zh: '可选', en: 'Optional' },
  'tùy': { zh: '可选', en: 'Optional' },
  'hiện': { zh: '显示', en: 'Shown' },
  'ẩn': { zh: '隐藏', en: 'Hidden' },
  'có': { zh: '有', en: 'With' },
  'không': { zh: '无', en: 'No' },
  'cần': { zh: '需要', en: 'Need' },
  'mật': { zh: '密码', en: 'Password' },
  'khẩu': { zh: '密码', en: 'Password' },
  'ngày': { zh: '天', en: 'Days' },
  'giờ': { zh: '小时', en: 'Hours' },
  'phút': { zh: '分钟', en: 'Minutes' },
  'tuần': { zh: '周', en: 'Weeks' },
  'tháng': { zh: '月', en: 'Months' },
  'năm': { zh: '年', en: 'Years' },
  'quảng cáo': { zh: '广告', en: 'Ads' },
  'dịch vụ': { zh: '服务', en: 'Service' },
  'thanh toán': { zh: '付款', en: 'Payment' },
  'đơn hàng': { zh: '订单', en: 'Order' },
  'mua': { zh: '购买', en: 'Buy' },
  'bán': { zh: '销售', en: 'Sell' },
  'cho': { zh: '用于', en: 'For' },
  'với': { zh: '与', en: 'With' },
  'từ': { zh: '从', en: 'From' },
  'đến': { zh: '至', en: 'To' },
  'trên': { zh: '在', en: 'On' },
  'bằng': { zh: '通过', en: 'By' },
  'chỉ': { zh: '仅', en: 'Only' },
  'tất cả': { zh: '全部', en: 'All' },
  'cao': { zh: '高', en: 'High' },
  'thấp': { zh: '低', en: 'Low' },
  'tốt': { zh: '优质', en: 'Good' },
  'nam': { zh: '男', en: 'Male' },
  'nữ': { zh: '女', en: 'Female' },
  'tuổi': { zh: '年龄', en: 'Age' },
  'ngôn ngữ': { zh: '语言', en: 'Language' },
  'tiếng việt': { zh: '越南语', en: 'Vietnamese' },

  // Additional Vietnamese words/phrases found in supplier-style service names.
  'kém': { zh: '较差', en: 'Low Quality' },
  'tốt nhất': { zh: '最佳', en: 'Best' },
  'rất nhanh': { zh: '非常快速', en: 'Very Fast' },
  'nhanh chóng': { zh: '快速', en: 'Quickly' },
  'đơn': { zh: '订单', en: 'Order' },
  'hàng': { zh: '订单', en: 'Order' },
  'đặt hàng': { zh: '下单', en: 'Place Order' },
  'đặt': { zh: '下单', en: 'Order' },
  'số lượng': { zh: '数量', en: 'Quantity' },
  'nhập': { zh: '输入', en: 'Enter' },
  'chọn': { zh: '选择', en: 'Choose' },
  'tùy chọn': { zh: '可选', en: 'Optional' },
  'tuỳ chọn': { zh: '可选', en: 'Optional' },
  'có thể': { zh: '可以', en: 'Can' },
  'hoặc': { zh: '或', en: 'Or' },
  'và': { zh: '和', en: 'And' },
  'về': { zh: '关于', en: 'About' },
  'tại': { zh: '在', en: 'At' },
  'trong': { zh: '在', en: 'In' },
  'ngoài': { zh: '之外', en: 'Outside' },
  'sau': { zh: '之后', en: 'After' },
  'trước': { zh: '之前', en: 'Before' },
  'mỗi': { zh: '每', en: 'Each' },
  'khu vực': { zh: '地区', en: 'Region' },
  'khu vực quốc tế': { zh: '国际地区', en: 'International Region' },
  'hỗ trợ': { zh: '支持', en: 'Support' },
  'hệ thống': { zh: '系统', en: 'System' },
  'bảo đảm': { zh: '保障', en: 'Guaranteed' },
  'đảm bảo': { zh: '保障', en: 'Guaranteed' },
  'chính thức': { zh: '官方', en: 'Official' },
  'ngẫu nhiên': { zh: '随机', en: 'Random' },
  'thường': { zh: '通常', en: 'Usually' },
  'đặc biệt': { zh: '特别', en: 'Special' },
  'mới nhất': { zh: '最新', en: 'Latest' },
  'cũ': { zh: '旧', en: 'Old' },
  'thấp': { zh: '低', en: 'Low' },
  'cao': { zh: '高', en: 'High' },
  'miễn phí': { zh: '免费', en: 'Free' },
  'phí': { zh: '费用', en: 'Fee' },
  'thời gian': { zh: '时间', en: 'Time' },
  'bắt đầu': { zh: '开始', en: 'Start' },
  'hoàn tất': { zh: '完成', en: 'Complete' },
  'hoàn thành': { zh: '完成', en: 'Completed' },
  'tiến độ': { zh: '进度', en: 'Progress' },
  'kết quả': { zh: '结果', en: 'Results' },
  'tỷ lệ': { zh: '比例', en: 'Rate' },
  'tỉ lệ': { zh: '比例', en: 'Rate' },
  'phản hồi': { zh: '反馈', en: 'Response' },
  'nội dung': { zh: '内容', en: 'Content' },
  'tương tác': { zh: '互动', en: 'Engagement' },
  'tiếp cận': { zh: '触达', en: 'Reach' },
  'hiển thị': { zh: '展示', en: 'Impressions' },
  'tiếp cận tự nhiên': { zh: '自然触达', en: 'Organic Reach' },
  'tìm kiếm': { zh: '搜索', en: 'Search' },
  'từ khóa': { zh: '关键词', en: 'Keyword' },
  'mô tả': { zh: '说明', en: 'Description' },
  'nội dung bình luận': { zh: '评论内容', en: 'Comment Content' },
  'bình luận tùy chỉnh': { zh: '自定义评论', en: 'Custom Comments' },
  'comment tùy chỉnh': { zh: '自定义评论', en: 'Custom Comments' },
  'ngôn ngữ': { zh: '语言', en: 'Language' },
  'tiếng anh': { zh: '英语', en: 'English' },
  'tiếng việt': { zh: '越南语', en: 'Vietnamese' },
  'giới tính': { zh: '性别', en: 'Gender' },
  'nam': { zh: '男性', en: 'Male' },
  'nữ': { zh: '女性', en: 'Female' },
  'độ tuổi': { zh: '年龄范围', en: 'Age Range' },
  'tuổi': { zh: '年龄', en: 'Age' },
  'thành phố': { zh: '城市', en: 'City' },
  'quốc gia': { zh: '国家', en: 'Country' },
  'toàn cầu': { zh: '全球', en: 'Global' },
  'quốc tế': { zh: '国际', en: 'International' },
  'nhiều quốc gia': { zh: '多国', en: 'Multiple Countries' },
  'khách hàng': { zh: '客户', en: 'Customers' },
  'người dùng': { zh: '用户', en: 'Users' },
  'người thật': { zh: '真人', en: 'Real Users' },
  'người dùng thật': { zh: '真实用户', en: 'Real Users' },
  'tài khoản thật': { zh: '真人账号', en: 'Real Accounts' },
  'tài khoản hoạt động': { zh: '活跃账号', en: 'Active Accounts' },
  'tài khoản chất lượng': { zh: '高质量账号', en: 'Quality Accounts' },
  'bài viết công khai': { zh: '公开帖子', en: 'Public Post' },
  'trang công khai': { zh: '公开页面', en: 'Public Page' },
  'không mật khẩu': { zh: '无需密码', en: 'No Password' },
  'không đăng nhập': { zh: '无需登录', en: 'No Login Required' },
  'không bảo hành': { zh: '无保修', en: 'No Warranty' },
  'có bảo hành': { zh: '提供保修', en: 'Warranty Included' },
  'refill': { zh: '补单', en: 'Refill' },
  'bù': { zh: '补单', en: 'Refill' },
  'giảm giá': { zh: '折扣', en: 'Discount' },
  'khuyến mãi': { zh: '促销', en: 'Promotion' },
  'ưu đãi': { zh: '优惠', en: 'Special Offer' },
  'độc quyền': { zh: '独家', en: 'Exclusive' },
  'chất lượng cao': { zh: '高质量', en: 'High Quality' },
  'giá tốt': { zh: '优惠价格', en: 'Good Price' },
  'giá sỉ': { zh: '批发价', en: 'Wholesale Price' },

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
  // Supplier names stay exactly as returned by the API. The page-level
  // translator handles the visible translation when the customer selects 中文.
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}


// Localize supplier-provided descriptions while keeping useful technical
// English/brand terms. Vietnamese is never allowed to leak into the customer UI.
function localizeServiceDescription(text, lang) {
  let out = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!out) return '';

  const entries = Object.entries(SERVICE_TRANSLATIONS)
    .sort((a, b) => b[0].length - a[0].length);
  for (const [src, vals] of entries) {
    const escaped = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^A-Za-zÀ-ỹĐđ])${escaped}(?=$|[^A-Za-zÀ-ỹĐđ])`, 'gi');
    out = out.replace(re, (m, prefix) => prefix + (vals[lang] || vals.en));
  }

  // Never show Vietnamese in the description. If a supplier introduces a
  // phrase that is not yet in the dictionary, remove that word rather than
  // exposing Vietnamese to customers.
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

function getGoogleTranslateSelect(){
  return document.querySelector('.goog-te-combo');
}

function setGooglePageLanguage(target){
  const code = target === 'zh' ? 'zh-CN' : 'en';
  document.cookie = `googtrans=/auto/${code};path=/`;
  document.cookie = `googtrans=/auto/${code};path=/;domain=${location.hostname}`;
  const select = getGoogleTranslateSelect();
  if (select) {
    select.value = code;
    select.dispatchEvent(new Event('change'));
  } else {
    // The Google translator may still be loading. Retry briefly.
    let tries = 0;
    const timer = setInterval(() => {
      const s = getGoogleTranslateSelect();
      if (s) {
        clearInterval(timer);
        s.value = code;
        s.dispatchEvent(new Event('change'));
      } else if (++tries > 30) clearInterval(timer);
    }, 200);
  }
}

function resetGoogleTranslation(){
  document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${location.hostname}`;
  // Google Translate changes many DOM nodes itself. A reload is the cleanest
  // way to restore the original API wording without touching service data.
  location.reload();
}

function translateDynamicContent(){
  if (UzState.lang !== 'zh') return;
  // Re-trigger Google Translate after live SMM cards/modal content is added.
  setTimeout(() => setGooglePageLanguage('zh'), 250);
}

function initSwitchers() {
  const langBtns = document.querySelectorAll('#lang-switcher button');
  const curBtns = document.querySelectorAll('#currency-switcher button');

  langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === UzState.lang);
    btn.addEventListener('click', () => {
      const next = btn.dataset.lang;
      if (next === UzState.lang && next === 'zh') {
        translateDynamicContent();
        return;
      }
      UzState.lang = next;
      localStorage.setItem('uz_lang', UzState.lang);
      langBtns.forEach(b => b.classList.toggle('active', b === btn));
      if (next === 'zh') {
        // First render our own static Chinese strings, then let Google Translate
        // translate the complete page, including Vietnamese supplier content.
        applyLanguage('zh');
        translateDynamicContent();
      } else {
        resetGoogleTranslation();
      }
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
  if (UzState.lang === 'zh') translateDynamicContent();
}

document.addEventListener('DOMContentLoaded', initSwitchers);
