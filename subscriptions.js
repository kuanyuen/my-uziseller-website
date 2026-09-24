/* UziSeller AI Subscriptions Store — ChatGPT & Claude Dedicated Marketplace */
(async function(){
  const root = document.getElementById('subscription-app');
  if (!root) return;

  const lang = () => ((typeof UzState !== 'undefined' && UzState.lang) || 'en');
  const currency = () => ((typeof UzState !== 'undefined' && UzState.currency) || 'MYR');
  const t2 = (en, zh) => lang() === 'zh' ? zh : en;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const first = (o, keys, fb = '') => { for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && String(o[k]).trim() !== '') return o[k]; return fb; };
  const num = (v, fb = 0) => { const n = Number(String(v ?? '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : fb; };
  const stripHtml = v => String(v ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  // Keyword and translation dictionaries for clean brand representation
  const commonMap = {
    "công cụ ai": ["AI 工具", "AI Tools"],
    "chat gpt": ["ChatGPT", "ChatGPT"],
    "chatgpt": ["ChatGPT", "ChatGPT"],
    "claude": ["Claude", "Claude"],
    "claude ai": ["Claude AI", "Claude AI"],
    "openai": ["OpenAI", "OpenAI"],
    "tài khoản": ["账号", "Account"],
    "chính hãng": ["官方正品", "Official"],
    "tự động": ["全自动发货", "Auto Delivery"],
    "bảo hành": ["包含质保", "With Warranty"],
    "toàn cầu": ["全球通用", "Global"],
    "quốc tế": ["国际版", "International"],
    "tháng": ["个月", "Month(s)"],
    "ngày": ["天", "Day(s)"],
    "dạng mới": ["最新版本", "Latest Version"],
    "thử nghiệm": ["体验版", "Trial"],
    "độc quyền": ["独家供应", "Exclusive"],
    "giá rẻ": ["特惠专享", "Special Offer"]
  };

  const dictZh = [
    ["tài khoản", "账号"], ["chính hãng", "官方正品"], ["tự động", "全自动"], ["bảo hành", "质保"],
    ["toàn cầu", "全球"], ["quốc tế", "国际"], ["tháng", "个月"], ["ngày", "天"],
    ["dạng mới", "新版"], ["thử nghiệm", "测试"], ["độc quyền", "独家"], ["giá rẻ", "特惠"]
  ];

  const enMap = [
    ["tài khoản", "Account"], ["chính hãng", "Official"], ["tự động", "Automatic"], ["bảo hành", "Warranty"], ["toàn cầu", "Global"]
  ];

  function escRe(str) { return str.replace(/[.*+?^()|[\]{}\\]/g, "\\$&").replace(/\$/g, "\\$"); }

  function localize(v) {
    let s = String(v ?? "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    const low = s.toLowerCase();
    for (const [k, val] of Object.entries(commonMap)) {
      if (low.includes(k)) {
        s = s.replace(new RegExp(escRe(k), "ig"), lang() === "zh" ? val[0] : val[1]);
      }
    }
    if (lang() === "zh") {
      for (const [a, b] of dictZh) s = s.replace(new RegExp(escRe(a), "ig"), b);
    } else {
      for (const [a, b] of enMap) s = s.replace(new RegExp(escRe(a), "ig"), b);
    }
    return s.replace(/\s{2,}/g, " ").trim();
  }

  let products = [];
  let activeBrand = 'ALL'; // 'ALL' | 'CHATGPT' | 'CLAUDE'
  let query = '';
  let sort = 'default';

  function priceFor(p, qty = 1) {
    const cur = currency();
    const per = p?.prices?.[cur] ?? p?.prices?.MYR ?? 0;
    const total = per * qty;
    return `${cur === 'MYR' ? 'RM' : cur === 'USD' ? '$' : '¥'}${total.toLocaleString(cur === 'CNY' ? 'zh-CN' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function getBrand(p) {
    const hay = `${p.category || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
    if (hay.includes('claude')) return 'CLAUDE';
    if (hay.includes('gpt') || hay.includes('chat') || hay.includes('openai')) return 'CHATGPT';
    return null;
  }

  const normalize = p => {
    const brand = getBrand(p);
    return {
      id: String(first(p, ['id', 'ID', 'product_id', 'productId'], '')),
      name: String(first(p, ['name', 'title', 'product_name', 'productName'], 'AI Product')),
      category: brand === 'CLAUDE' ? 'Claude' : 'ChatGPT',
      description: String(first(p, ['description', 'desc', 'content', 'detail', 'details', 'product_description', 'productDescription', 'short_description', 'shortDescription', 'info', 'intro'], '')),
      icon: String(first(p, ['icon', 'icon_url', 'iconUrl', 'image', 'image_url', 'imageUrl', 'logo', 'logo_url', 'thumbnail', 'thumb'], '')),
      price: num(first(p, ['price', 'Price', 'selling_price', 'sale_price', 'cost', 'amount', 'unit_price'], 0)),
      prices: first(p, ['prices'], null),
      currency: String(first(p, ['currency', 'currency_code', 'unit'], 'VND')).toUpperCase(),
      min: Math.max(1, num(first(p, ['min', 'minimum', 'min_amount', 'min_qty', 'min_quantity'], 1), 1)),
      max: Math.max(1, num(first(p, ['max', 'maximum', 'max_amount', 'max_qty', 'max_quantity'], 1), 1)),
      stock: first(p, ['stock', 'inventory', 'available', 'quantity_available', 'qty'], ''),
      raw: p,
      brand: brand
    };
  };

  function savedOrderIds() {
    try { return JSON.parse(localStorage.getItem('uz_order_ids') || '[]').filter(Boolean); } catch { return []; }
  }

  function renderStore() {
    const zh = lang() === 'zh';
    const chatGptProducts = products.filter(p => p.brand === 'CHATGPT');
    const claudeProducts = products.filter(p => p.brand === 'CLAUDE');

    const gptMinPrice = chatGptProducts.length ? Math.min(...chatGptProducts.map(p => p.prices?.[currency()] ?? p.prices?.MYR ?? 999)) : 0;
    const claudeMinPrice = claudeProducts.length ? Math.min(...claudeProducts.map(p => p.prices?.[currency()] ?? p.prices?.MYR ?? 999)) : 0;
    const curSymbol = currency() === 'MYR' ? 'RM' : (currency() === 'USD' ? '$' : '¥');

    root.innerHTML = `
      <div class="ai-shop-wrapper">
        <!-- AI Store Top Header -->
        <div class="ai-shop-header">
          <div class="ai-shop-title-wrap">
            <div class="ai-kicker">✦ ${zh ? '官方专享 AI 订阅专区' : 'OFFICIAL AI SUBSCRIPTIONS'}</div>
            <h2>${zh ? 'ChatGPT 与 Claude 订阅中心' : 'ChatGPT & Claude Subscriptions'}</h2>
            <p>${zh ? '官方正品保障 · 全自动秒级发货 · 独享账号与专属支持' : 'Official accounts, instant automated delivery, dedicated warranty & support.'}</p>
          </div>
          <div class="ai-shop-search-bar">
            <span>⌕</span>
            <input id="ai-search-input" type="search" placeholder="${esc(zh ? '搜索 ChatGPT 或 Claude 套餐…' : 'Search ChatGPT or Claude plans…')}" value="${esc(query)}">
          </div>
        </div>

        <!-- Brand Showcase Cards (AppMMO-inspired Category Explorer) -->
        <div class="ai-brand-grid">
          <!-- ChatGPT Brand Card -->
          <div class="ai-brand-card brand-chatgpt ${activeBrand === 'CHATGPT' ? 'active-brand' : ''}" data-brand-target="CHATGPT">
            <div class="ai-brand-top">
              <div class="ai-brand-logo logo-gpt">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div class="ai-brand-meta">
                <span class="ai-brand-badge">${chatGptProducts.length} ${zh ? '个可用套餐' : 'Plans Available'}</span>
                <h3>OpenAI ChatGPT</h3>
                <p>${zh ? 'ChatGPT Plus 独享账号 · GPT-4o · 深度推理' : 'ChatGPT Plus Private Accounts · GPT-4o · Canvas'}</p>
              </div>
            </div>
            <div class="ai-brand-features">
              <span>✓ ${zh ? '支持 GPT-4o 与 DALL-E' : 'GPT-4o & DALL-E 3'}</span>
              <span>✓ ${zh ? '全天候极速稳定' : 'Fast & High Stability'}</span>
              <span>✓ ${zh ? '即时发货与售后保障' : 'Instant Delivery & Warranty'}</span>
            </div>
            <div class="ai-brand-footer">
              <div>
                <small>${zh ? '起步售价' : 'Starting From'}</small>
                <strong>${curSymbol}${gptMinPrice.toFixed(2)}</strong>
              </div>
              <button class="ai-brand-btn" type="button">
                ${activeBrand === 'CHATGPT' ? (zh ? '已选中 ▾' : 'Selected ▾') : (zh ? '查看全部套餐 →' : 'View Plans →')}
              </button>
            </div>
          </div>

          <!-- Claude Brand Card -->
          <div class="ai-brand-card brand-claude ${activeBrand === 'CLAUDE' ? 'active-brand' : ''}" data-brand-target="CLAUDE">
            <div class="ai-brand-top">
              <div class="ai-brand-logo logo-claude">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>
              </div>
              <div class="ai-brand-meta">
                <span class="ai-brand-badge">${claudeProducts.length} ${zh ? '个可用套餐' : 'Plans Available'}</span>
                <h3>Anthropic Claude</h3>
                <p>${zh ? 'Claude 3.7 Sonnet / Opus 独享账号 · 200K 长上下文' : 'Claude 3.7 Sonnet / Opus Accounts · 200K Context'}</p>
              </div>
            </div>
            <div class="ai-brand-features">
              <span>✓ ${zh ? 'Claude 3.7 Sonnet / Opus' : 'Sonnet 3.7 & Opus Model'}</span>
              <span>✓ ${zh ? '超长上下文长文档分析' : '200K Long Context Window'}</span>
              <span>✓ ${zh ? '代码编程与长文写作首选' : 'Best for Coding & Writing'}</span>
            </div>
            <div class="ai-brand-footer">
              <div>
                <small>${zh ? '起步售价' : 'Starting From'}</small>
                <strong>${curSymbol}${claudeMinPrice.toFixed(2)}</strong>
              </div>
              <button class="ai-brand-btn" type="button">
                ${activeBrand === 'CLAUDE' ? (zh ? '已选中 ▾' : 'Selected ▾') : (zh ? '查看全部套餐 →' : 'View Plans →')}
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Navigation Tabs -->
        <div class="ai-filter-nav">
          <div class="ai-tabs">
            <button class="ai-tab-btn ${activeBrand === 'ALL' ? 'active' : ''}" data-brand="ALL">
              <span>✦</span> ${zh ? '全部 AI 套餐' : 'All Plans'} (${products.length})
            </button>
            <button class="ai-tab-btn ${activeBrand === 'CHATGPT' ? 'active' : ''}" data-brand="CHATGPT">
              <span class="dot gpt-dot"></span> ChatGPT (${chatGptProducts.length})
            </button>
            <button class="ai-tab-btn ${activeBrand === 'CLAUDE' ? 'active' : ''}" data-brand="CLAUDE">
              <span class="dot claude-dot"></span> Claude (${claudeProducts.length})
            </button>
          </div>
          <div class="ai-sort-select">
            <button class="ai-sort-btn ${sort === 'default' ? 'active' : ''}" data-sort="default">${zh ? '推荐排序' : 'Recommended'}</button>
            <button class="ai-sort-btn ${sort === 'priceAsc' ? 'active' : ''}" data-sort="priceAsc">${zh ? '价格从低到高' : 'Price ↑'}</button>
            <button class="ai-sort-btn ${sort === 'priceDesc' ? 'active' : ''}" data-sort="priceDesc">${zh ? '价格从高到低' : 'Price ↓'}</button>
          </div>
        </div>

        <!-- Product List Section -->
        <div class="ai-products-section">
          <div class="ai-section-heading">
            <div>
              <h3 id="ai-current-category-title">
                ${activeBrand === 'CHATGPT' ? (zh ? '🟢 ChatGPT 订阅与账号套餐' : '🟢 ChatGPT Subscriptions') :
                  (activeBrand === 'CLAUDE' ? (zh ? '🟠 Claude 订阅与账号套餐' : '🟠 Claude Subscriptions') :
                  (zh ? '✦ 全部精选 AI 订阅套餐' : '✦ All AI Subscriptions'))}
              </h3>
              <span id="ai-product-count-text"></span>
            </div>
            ${activeBrand !== 'ALL' ? `<button class="ai-reset-brand" id="ai-reset-btn">${zh ? '← 显示全部品牌' : '← Show all brands'}</button>` : ''}
          </div>

          <div id="ai-product-grid" class="ai-product-grid"></div>
        </div>

        <!-- Trust & Purchase Guarantee Box -->
        <div class="ai-guarantee-banner">
          <div class="ai-guarantee-item">
            <span class="ai-g-icon">⚡</span>
            <div>
              <strong>${zh ? '全自动即时发货' : 'Instant Automated Delivery'}</strong>
              <p>${zh ? '支付完成后系统自动派发账号，无需繁琐等待。' : 'Accounts are dispatched immediately after checkout.'}</p>
            </div>
          </div>
          <div class="ai-guarantee-item">
            <span class="ai-g-icon">🛡️</span>
            <div>
              <strong>${zh ? '官方质保与专属售后' : 'Official Warranty & Support'}</strong>
              <p>${zh ? '正规渠道开通，支持全周期质保与客服随时解答。' : 'Official channel provision with full-term warranty support.'}</p>
            </div>
          </div>
          <div class="ai-guarantee-item">
            <span class="ai-g-icon">🔒</span>
            <div>
              <strong>${zh ? '独享私密与安全性' : 'Private & Secure'}</strong>
              <p>${zh ? '一人一号独立使用，数据与对话记录完全私密隔离。' : 'Private single-user accounts with total data confidentiality.'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind Event Listeners
    document.getElementById('ai-search-input').oninput = e => {
      query = e.target.value.trim().toLowerCase();
      renderProductList();
    };

    document.querySelectorAll('.ai-brand-card').forEach(card => {
      card.onclick = () => {
        const target = card.dataset.brandTarget;
        activeBrand = (activeBrand === target) ? 'ALL' : target;
        renderStore();
        document.querySelector('.ai-filter-nav')?.scrollIntoView({ behavior: 'smooth' });
      };
    });

    document.querySelectorAll('.ai-tab-btn').forEach(btn => {
      btn.onclick = () => {
        activeBrand = btn.dataset.brand;
        renderStore();
      };
    });

    document.querySelectorAll('.ai-sort-btn').forEach(btn => {
      btn.onclick = () => {
        sort = btn.dataset.sort;
        document.querySelectorAll('.ai-sort-btn').forEach(x => x.classList.toggle('active', x === btn));
        renderProductList();
      };
    });

    const resetBtn = document.getElementById('ai-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        activeBrand = 'ALL';
        renderStore();
      };
    }

    renderProductList();
  }

  function getFilteredList() {
    let list = products.filter(p => {
      if (activeBrand !== 'ALL' && p.brand !== activeBrand) return false;
      if (!query) return true;
      const hay = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      return hay.includes(query) || localize(p.name).toLowerCase().includes(query);
    });

    if (sort === 'priceAsc') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'priceDesc') list.sort((a, b) => Number(b.price) - Number(a.price));
    return list;
  }

  function renderProductList() {
    const list = getFilteredList();
    const zh = lang() === 'zh';
    const grid = document.getElementById('ai-product-grid');
    const countEl = document.getElementById('ai-product-count-text');
    if (countEl) countEl.textContent = `${list.length} ${zh ? '个套餐可选' : 'plans available'}`;

    if (!list.length) {
      grid.innerHTML = `
        <div class="ai-empty-state">
          <div class="ai-empty-icon">⌕</div>
          <h4>${zh ? '没有找到相关套餐' : 'No plans found'}</h4>
          <p>${zh ? '请尝试更换搜索词或选择其他品牌分类。' : 'Try searching another keyword or select another category.'}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(p => {
      const isClaude = p.brand === 'CLAUDE';
      const brandTag = isClaude ? 'Claude' : 'ChatGPT';
      const brandTheme = isClaude ? 'claude-theme' : 'gpt-theme';
      const cleanName = localize(p.name);
      const cleanDesc = stripHtml(localize(p.description)) || (zh ? '点击查看详细配置与购买说明。' : 'Click to view configuration & details.');

      return `
        <div class="ai-product-card ${brandTheme}" data-product-id="${esc(p.id)}">
          <div class="ai-card-badge-row">
            <span class="ai-pill ${isClaude ? 'pill-claude' : 'pill-gpt'}">${brandTag}</span>
            ${p.stock !== '' ? `<span class="ai-stock-pill">${zh ? '库存充足' : 'In Stock'}</span>` : ''}
          </div>

          <div class="ai-card-body">
            <h4 class="ai-card-title">${esc(cleanName)}</h4>
            <p class="ai-card-desc">${esc(cleanDesc)}</p>
          </div>

          <div class="ai-card-meta-list">
            <div class="ai-meta-tag">⚡ ${zh ? '即时发货' : 'Instant Delivery'}</div>
            <div class="ai-meta-tag">🛡️ ${zh ? '官方质保' : 'Warranty'}</div>
            <div class="ai-meta-tag">👤 ${zh ? '独享私密' : 'Private'}</div>
          </div>

          <div class="ai-card-footer">
            <div class="ai-card-price-wrap">
              <small>${zh ? '单价' : 'Price'}</small>
              <strong class="ai-card-price">${esc(priceFor(p))}</strong>
            </div>
            <button class="ai-buy-btn" data-btn-id="${esc(p.id)}" type="button">
              ${zh ? '查看详情 & 下单' : 'Details & Buy'} →
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.ai-product-card').forEach(card => {
      card.onclick = e => {
        const id = card.dataset.productId;
        const target = products.find(x => String(x.id) === String(id));
        if (target) openDetailModal(target);
      };
    });
  }

  function findPayload(raw) {
    const seen = new Set();
    const walk = n => {
      if (!n || typeof n !== 'object' || seen.has(n)) return null;
      seen.add(n);
      if (Array.isArray(n)) { for (const x of n) { const f = walk(x); if (f) return f; } return null; }
      if (['id', 'ID', 'product_id', 'productId'].some(k => n[k] !== undefined) && ['name', 'title', 'product_name', 'productName', 'description', 'desc', 'content', 'detail', 'details'].some(k => n[k] !== undefined)) return n;
      for (const k of ['data', 'product', 'result', 'item', 'product_info', 'productInfo']) if (n[k] !== undefined) { const f = walk(n[k]); if (f) return f; }
      for (const v of Object.values(n)) { const f = walk(v); if (f) return f; }
      return null;
    };
    return walk(raw) || {};
  }

  function rich(v) {
    const s = String(v ?? '').trim();
    if (!s) return '';
    if (!/<[a-z][\s\S]*>/i.test(s)) return esc(localize(s)).replace(/\n/g, '<br>');
    const box = document.createElement('div');
    box.innerHTML = s;
    box.querySelectorAll('script,style,iframe,object,embed,form,link,meta').forEach(x => x.remove());
    box.querySelectorAll('*').forEach(el => [...el.attributes].forEach(a => {
      const n = a.name.toLowerCase();
      if (n.startsWith('on') || n === 'srcdoc' || (n === 'href' && /^javascript:/i.test(a.value))) el.removeAttribute(a.name);
    }));
    return box.innerHTML;
  }

  // Beautiful Modal matching Uziseller Glass Theme
  async function openDetailModal(p) {
    if (!p) return;
    const zh = lang() === 'zh';
    const isClaude = p.brand === 'CLAUDE';

    const ov = document.createElement('div');
    ov.className = 'ai-modal-overlay';
    ov.innerHTML = `
      <div class="ai-modal-box">
        <button class="ai-modal-close" aria-label="Close">×</button>
        <div class="ai-modal-loading">${zh ? '正在读取套餐详情…' : 'Loading details…'}</div>
      </div>
    `;
    document.body.appendChild(ov);

    const closeModal = () => ov.remove();
    ov.querySelector('.ai-modal-close').onclick = closeModal;
    ov.onclick = e => { if (e.target === ov) closeModal(); };

    try {
      const r = await fetch(`/api/subscriptions?action=product&product=${encodeURIComponent(p.id)}`, { headers: { Accept: 'application/json' } });
      const j = await r.json();
      if (!r.ok || j.status === 'error') throw new Error(j.msg || 'Product details unavailable');

      const d = findPayload(j.data);
      const name = String(first(d, ['name', 'title', 'product_name', 'productName'], p.name));
      const desc = first(d, ['description', 'desc', 'content', 'detail', 'details', 'product_description', 'productDescription', 'full_description', 'fullDescription', 'info', 'intro', 'instruction', 'instructions', 'usage', 'notice', 'notes', 'note'], p.description);
      const data = { ...p, ...d };
      const min = Math.max(1, num(first(d, ['min', 'minimum', 'min_qty', 'min_amount', 'min_quantity'], p.min), p.min));
      const max = Math.max(min, num(first(d, ['max', 'maximum', 'max_qty', 'max_amount', 'max_quantity'], p.max), p.max));

      ov.querySelector('.ai-modal-box').innerHTML = `
        <button class="ai-modal-close" aria-label="Close">×</button>

        <div class="ai-modal-header ${isClaude ? 'modal-claude' : 'modal-gpt'}">
          <div class="ai-modal-badge">${isClaude ? 'Anthropic Claude' : 'OpenAI ChatGPT'}</div>
          <h2>${esc(localize(name))}</h2>
          <div class="ai-modal-submeta">
            <span>⚡ ${zh ? '自动发货' : 'Instant'}</span>
            <span>🛡️ ${zh ? '官方质保' : 'Warranty'}</span>
            <span>👤 ${zh ? '独享使用' : 'Private'}</span>
          </div>
        </div>

        <div class="ai-modal-body">
          <div class="ai-modal-section">
            <div class="ai-sec-title">01 · ${zh ? '套餐与使用说明' : 'PRODUCT DESCRIPTION'}</div>
            <div class="ai-modal-rich-desc">
              ${rich(desc || (zh ? '官方正品账号，付款后自动发货。请妥善保存登录凭据并遵守官方使用规范。' : 'Official accounts with instant delivery.'))}
            </div>
          </div>

          <div class="ai-modal-section">
            <div class="ai-sec-title">02 · ${zh ? '购买信息填写' : 'ORDER DETAILS'}</div>
            <div class="ai-input-group">
              <label>
                <span>${zh ? '您的姓名' : 'Your Name'}</span>
                <input id="ai-modal-name" type="text" autocomplete="name" placeholder="${zh ? '请输入您的姓名' : 'Full name'}">
              </label>
              <label>
                <span>${zh ? '接收邮箱 (用于接收账号与订单)' : 'Email (for delivery receipt)'}</span>
                <input id="ai-modal-email" type="email" autocomplete="email" placeholder="you@example.com">
              </label>
            </div>
          </div>
        </div>

        <div class="ai-modal-checkout-bar">
          <div class="ai-qty-stepper">
            <span>${zh ? '购买数量' : 'Quantity'}</span>
            <div class="stepper-wrap">
              <button id="ai-qty-minus" type="button">-</button>
              <input id="ai-modal-qty" type="number" min="${min}" max="${max}" value="${min}">
              <button id="ai-qty-plus" type="button">+</button>
            </div>
          </div>

          <div class="ai-checkout-total">
            <small>${zh ? '订单总额' : 'Total Price'}</small>
            <strong id="ai-modal-total">${esc(priceFor(data, min))}</strong>
          </div>

          <button id="ai-modal-pay-btn" class="ai-pay-action-btn" type="button">
            ${zh ? '立即结算付款' : 'Pay Now'} →
          </button>
        </div>

        <div id="ai-modal-msg" class="ai-modal-msg"></div>
      `;

      // Prefill user details if logged in
      if (typeof UzAccount !== 'undefined' && UzAccount.isLoggedIn()) {
        (async () => {
          let email = typeof UzAccount.getEmail === 'function' ? UzAccount.getEmail() : '';
          let name = typeof UzAccount.getName === 'function' ? UzAccount.getName() : '';
          if (!email && typeof UzAccount.getEmailFromServer === 'function') {
            try { const info = await UzAccount.getEmailFromServer(); email = info.email || ''; name = info.name || name; } catch {}
          }
          const emailInput = ov.querySelector('#ai-modal-email');
          const nameInput = ov.querySelector('#ai-modal-name');
          if (emailInput && email) emailInput.value = email;
          if (nameInput && name) nameInput.value = name;
        })();
      }

      ov.querySelector('.ai-modal-close').onclick = closeModal;

      const qtyInput = ov.querySelector('#ai-modal-qty');
      const totalEl = ov.querySelector('#ai-modal-total');
      const minusBtn = ov.querySelector('#ai-qty-minus');
      const plusBtn = ov.querySelector('#ai-qty-plus');

      const updateQty = (val) => {
        let n = Math.max(min, Math.min(max, num(val, min)));
        qtyInput.value = n;
        totalEl.textContent = priceFor(data, n);
      };

      minusBtn.onclick = () => updateQty(Number(qtyInput.value) - 1);
      plusBtn.onclick = () => updateQty(Number(qtyInput.value) + 1);
      qtyInput.oninput = () => updateQty(qtyInput.value);

      const payBtn = ov.querySelector('#ai-modal-pay-btn');
      const msgEl = ov.querySelector('#ai-modal-msg');

      payBtn.onclick = async () => {
        const nameVal = ov.querySelector('#ai-modal-name').value.trim();
        const emailVal = ov.querySelector('#ai-modal-email').value.trim();
        if (!nameVal || !emailVal) {
          msgEl.innerHTML = `<div class="ai-err-msg">${zh ? '请填写姓名和接收邮箱。' : 'Please enter your name and email.'}</div>`;
          return;
        }

        payBtn.disabled = true;
        payBtn.textContent = zh ? '正在创建安全支付…' : 'Creating payment…';
        msgEl.innerHTML = '';

        try {
          const headers = { 'Content-Type': 'application/json' };
          if (typeof UzAccount !== 'undefined' && UzAccount.isLoggedIn()) {
            headers['Authorization'] = 'Bearer ' + UzAccount.getToken();
          }

          const rr = await fetch('/api/subscription-checkout', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              productId: p.id,
              quantity: Number(qtyInput.value),
              name: nameVal,
              email: emailVal
            })
          });

          const jj = await rr.json();
          if (jj.status === 'ok' && jj.paymentUrl) {
            try {
              const ids = savedOrderIds();
              ids.unshift(jj.orderId);
              localStorage.setItem('uz_order_ids', JSON.stringify([...new Set(ids)].slice(0, 50)));
            } catch {}
            location.href = jj.paymentUrl;
            return;
          }
          throw new Error(jj.msg || (zh ? '创建支付订单失败' : 'Checkout failed'));
        } catch (err) {
          msgEl.innerHTML = `<div class="ai-err-msg">${esc(err.message || (zh ? '创建付款失败，请稍后重试。' : 'Checkout failed. Please retry.'))}</div>`;
          payBtn.disabled = false;
          payBtn.textContent = zh ? '立即结算付款 →' : 'Pay Now →';
        }
      };
    } catch (e) {
      ov.querySelector('.ai-modal-box').innerHTML = `
        <button class="ai-modal-close">×</button>
        <div class="ai-empty-state">
          <h4>${zh ? '无法读取套餐详情' : 'Unable to load details'}</h4>
          <p>${esc(e.message)}</p>
          <button class="ai-brand-btn" id="ai-retry-btn">${zh ? '重试' : 'Retry'}</button>
        </div>
      `;
      ov.querySelector('.ai-modal-close').onclick = closeModal;
      ov.querySelector('#ai-retry-btn').onclick = () => { ov.remove(); openDetailModal(p); };
    }
  }

  // Initialize
  renderStore();

  try {
    const r = await fetch('/api/subscriptions?action=products', { headers: { Accept: 'application/json' } });
    const j = await r.json();
    if (!r.ok || j.status === 'error') throw new Error(j.msg || 'Catalogue unavailable');

    // Filter strictly for ChatGPT and Claude
    products = (j.products || []).map(normalize).filter(p => p.id && p.name && p.brand !== null);

    renderStore();

    document.addEventListener('uz:currencychange', () => { renderStore(); });
    document.addEventListener('uz:langchange', () => { renderStore(); });
  } catch (e) {
    root.innerHTML = `
      <div class="ai-empty-state">
        <h4>${t2('Catalogue temporarily unavailable', '商品目录暂时无法加载')}</h4>
        <p>${esc(e.message)}</p>
      </div>
    `;
    console.error(e);
  }
})();
