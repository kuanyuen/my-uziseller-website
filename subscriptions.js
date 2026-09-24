/* UziSeller AI Subscriptions Store — AppMMO-Inspired Clear Category Layout */
(async function(){
  const root = document.getElementById('subscription-app');
  if (!root) return;

  const lang = () => ((typeof UzState !== 'undefined' && UzState.lang) || 'en');
  const currency = () => ((typeof UzState !== 'undefined' && UzState.currency) || 'MYR');
  const t2 = (en, zh) => lang() === 'zh' ? zh : en;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const first = (o, keys, fb = '') => { for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && String(o[k]).trim() !== '') return o[k]; return fb; };
  const num = (v, fb = 0) => { const n = Number(String(v ?? '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : fb; };

  let products = [];
  let expandedBrand = null; // null | 'CHATGPT' | 'CLAUDE'
  let query = '';

  function priceFor(p) {
    const cur = currency();
    const per = p?.prices?.[cur] ?? p?.prices?.MYR ?? 0;
    return `${cur === 'MYR' ? 'RM' : cur === 'USD' ? '$' : '¥'}${per.toFixed(2)}`;
  }

  function getBrand(p) {
    const hay = `${p.category || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
    if (hay.includes('claude')) return 'CLAUDE';
    if (hay.includes('gpt') || hay.includes('chatgpt') || hay.includes('openai')) return 'CHATGPT';
    return null;
  }

  const normalize = p => {
    const brand = getBrand(p);
    return {
      id: String(first(p, ['id', 'ID', 'product_id'], '')),
      name: String(first(p, ['name', 'title', 'product_name'], 'AI Product')),
      category: brand === 'CLAUDE' ? 'Claude' : 'ChatGPT',
      description: String(first(p, ['description', 'desc', 'content'], '')),
      icon: String(first(p, ['icon', 'icon_url', 'image', 'logo'], '')),
      price: num(first(p, ['price', 'Price'], 0)),
      prices: first(p, ['prices'], null),
      currency: String(first(p, ['currency'], 'VND')).toUpperCase(),
      min: Math.max(1, num(first(p, ['min', 'minimum'], 1), 1)),
      max: Math.max(1, num(first(p, ['max', 'maximum'], 1), 1)),
      stock: first(p, ['stock', 'inventory'], ''),
      raw: p,
      brand: brand
    };
  };

  function renderStore() {
    const zh = lang() === 'zh';
    const chatGptProducts = products.filter(p => p.brand === 'CHATGPT');
    const claudeProducts = products.filter(p => p.brand === 'CLAUDE');
    const curSymbol = currency() === 'MYR' ? 'RM' : (currency() === 'USD' ? '$' : '¥');

    const gptMinPrice = chatGptProducts.length ? Math.min(...chatGptProducts.map(p => p.prices?.[currency()] ?? 999)) : 0;
    const claudeMinPrice = claudeProducts.length ? Math.min(...claudeProducts.map(p => p.prices?.[currency()] ?? 999)) : 0;

    root.innerHTML = `
      <div class="uz-ai-store">
        <!-- Store Header -->
        <div class="uz-store-header">
          <div class="uz-store-title">
            <div class="uz-kicker">✦ ${zh ? '官方 AI 订阅商城' : 'OFFICIAL AI SUBSCRIPTIONS STORE'}</div>
            <h2>${zh ? 'ChatGPT 与 Claude 订阅中心' : 'ChatGPT & Claude Subscription Hub'}</h2>
            <p>${zh ? '官方正品保障 · 全自动秒级发货 · 独享私密账号与专属售后支持' : 'Official accounts · Instant delivery · Private access · Dedicated warranty support'}</p>
          </div>
          <div class="uz-search-box">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M13 13l4 4"/></svg>
            <input id="uz-search" type="search" placeholder="${esc(zh ? '搜索套餐名称…' : 'Search plans…')}" value="${esc(query)}">
          </div>
        </div>

        <!-- Main Brand Category Cards (AppMMO-style) -->
        <div class="uz-brand-categories">
          <!-- ChatGPT Category Card -->
          <div class="uz-category-card chatgpt-card ${expandedBrand === 'CHATGPT' ? 'expanded' : ''}" data-brand="CHATGPT">
            <div class="uz-cat-header">
              <div class="uz-cat-icon chatgpt-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div class="uz-cat-info">
                <h3>OpenAI ChatGPT</h3>
                <p>${zh ? 'ChatGPT Plus 独享账号 · GPT-4o · Canvas · DALL-E 3' : 'ChatGPT Plus Accounts · GPT-4o · Canvas · DALL-E 3'}</p>
                <div class="uz-cat-meta">
                  <span class="uz-badge">${chatGptProducts.length} ${zh ? '个套餐' : 'Plans'}</span>
                  <span class="uz-price-tag">${zh ? '起步价' : 'From'} ${curSymbol}${gptMinPrice.toFixed(2)}</span>
                </div>
              </div>
              <button class="uz-expand-btn" type="button">
                ${expandedBrand === 'CHATGPT' ? '▲' : '▼'}
              </button>
            </div>
            <div class="uz-cat-features">
              <span>✓ ${zh ? '支持 GPT-4o 深度推理与图像生成' : 'GPT-4o reasoning & DALL-E image gen'}</span>
              <span>✓ ${zh ? '独享账号私密对话与数据安全' : 'Private accounts & secure conversations'}</span>
              <span>✓ ${zh ? '即时发货与全周期质保售后' : 'Instant delivery & full-term warranty'}</span>
            </div>
          </div>

          <!-- Claude Category Card -->
          <div class="uz-category-card claude-card ${expandedBrand === 'CLAUDE' ? 'expanded' : ''}" data-brand="CLAUDE">
            <div class="uz-cat-header">
              <div class="uz-cat-icon claude-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4l16 16M20 4L4 20M12 2v20M2 12h20"/></svg>
              </div>
              <div class="uz-cat-info">
                <h3>Anthropic Claude</h3>
                <p>${zh ? 'Claude 3.7 Sonnet / Opus 独享账号 · 200K 长上下文 · 代码编程首选' : 'Claude 3.7 Sonnet / Opus · 200K Context · Best for Coding'}</p>
                <div class="uz-cat-meta">
                  <span class="uz-badge">${claudeProducts.length} ${zh ? '个套餐' : 'Plans'}</span>
                  <span class="uz-price-tag">${zh ? '起步价' : 'From'} ${curSymbol}${claudeMinPrice.toFixed(2)}</span>
                </div>
              </div>
              <button class="uz-expand-btn" type="button">
                ${expandedBrand === 'CLAUDE' ? '▲' : '▼'}
              </button>
            </div>
            <div class="uz-cat-features">
              <span>✓ ${zh ? 'Claude 3.7 Sonnet / Opus 超长上下文' : 'Claude 3.7 Sonnet / Opus 200K context'}</span>
              <span>✓ ${zh ? '代码编程与长文档分析首选' : 'Best for coding & long document analysis'}</span>
              <span>✓ ${zh ? '官方正品账号与独立隔离环境' : 'Official accounts & isolated environment'}</span>
            </div>
          </div>
        </div>

        <!-- Expanded Products Section -->
        <div id="uz-products-area" class="uz-products-area ${expandedBrand ? 'visible' : 'hidden'}">
          <div class="uz-products-header">
            <h3 id="uz-brand-title"></h3>
            <button class="uz-close-btn" id="uz-close-products" type="button">✕ ${zh ? '收起' : 'Close'}</button>
          </div>
          <div id="uz-product-grid" class="uz-product-grid"></div>
        </div>

        <!-- Trust Badges -->
        <div class="uz-trust-section">
          <div class="uz-trust-item">
            <span class="uz-trust-icon">⚡</span>
            <div>
              <strong>${zh ? '全自动即时发货' : 'Instant Auto Delivery'}</strong>
              <p>${zh ? '支付完成后系统自动秒级派发账号' : 'Automated dispatch within seconds'}</p>
            </div>
          </div>
          <div class="uz-trust-item">
            <span class="uz-trust-icon">🛡️</span>
            <div>
              <strong>${zh ? '官方正品质保' : 'Official Warranty'}</strong>
              <p>${zh ? '正规渠道开通，支持全周期售后' : 'Authorized provision with full support'}</p>
            </div>
          </div>
          <div class="uz-trust-item">
            <span class="uz-trust-icon">🔒</span>
            <div>
              <strong>${zh ? '独享账号私密' : 'Private Accounts'}</strong>
              <p>${zh ? '一人一号独立使用，数据完全隔离' : 'Single-user access with data isolation'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event Listeners
    document.getElementById('uz-search').oninput = e => {
      query = e.target.value.trim().toLowerCase();
      if (expandedBrand) renderProducts();
    };

    document.querySelectorAll('.uz-category-card').forEach(card => {
      card.onclick = () => {
        const brand = card.dataset.brand;
        expandedBrand = (expandedBrand === brand) ? null : brand;
        renderStore();
        if (expandedBrand) {
          setTimeout(() => document.getElementById('uz-products-area')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      };
    });

    const closeBtn = document.getElementById('uz-close-products');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        expandedBrand = null;
        renderStore();
      };
    }

    if (expandedBrand) renderProducts();
  }

  function renderProducts() {
    const zh = lang() === 'zh';
    const grid = document.getElementById('uz-product-grid');
    const titleEl = document.getElementById('uz-brand-title');
    if (!grid || !titleEl) return;

    let filtered = products.filter(p => p.brand === expandedBrand);
    if (query) {
      filtered = filtered.filter(p => {
        const hay = `${p.name} ${p.description}`.toLowerCase();
        return hay.includes(query);
      });
    }

    titleEl.innerHTML = expandedBrand === 'CHATGPT'
      ? `🟢 ChatGPT ${zh ? '全部套餐' : 'All Plans'} (${filtered.length})`
      : `🟠 Claude ${zh ? '全部套餐' : 'All Plans'} (${filtered.length})`;

    if (!filtered.length) {
      grid.innerHTML = `<div class="uz-empty">${zh ? '未找到匹配的套餐' : 'No plans found'}</div>`;
      return;
    }

    grid.innerHTML = filtered.map(p => `
      <div class="uz-product-card" data-product-id="${esc(p.id)}">
        <div class="uz-prod-header">
          ${p.icon ? `<img src="${esc(p.icon)}" alt="" class="uz-prod-icon">` : '<div class="uz-prod-icon-placeholder">✦</div>'}
          <div class="uz-prod-info">
            <h4>${esc(p.name)}</h4>
            <p>${esc(p.description.substring(0, 80))}${p.description.length > 80 ? '...' : ''}</p>
          </div>
        </div>
        <div class="uz-prod-footer">
          <div class="uz-prod-price">
            <span class="uz-price-label">${zh ? '售价' : 'Price'}</span>
            <strong>${priceFor(p)}</strong>
          </div>
          <button class="uz-buy-btn" type="button" onclick="UzSub.openOrder('${esc(p.id)}')">
            ${zh ? '立即购买' : 'Buy Now'}
          </button>
        </div>
      </div>
    `).join('');
  }

  // Fetch products from API
  async function init() {
    try {
      const res = await fetch('/api/appmmo-products.php');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      products = (data.data || data.products || []).map(normalize).filter(p => p.brand);
      renderStore();
    } catch (err) {
      console.error('Failed to load products:', err);
      root.innerHTML = `<div style="text-align:center;padding:40px;color:#ff6b6b;">Failed to load products. Please refresh the page.</div>`;
    }
  }

  // Public API
  window.UzSub = {
    openOrder: (id) => {
      const product = products.find(p => p.id === id);
      if (product && typeof window.UzOrder !== 'undefined' && window.UzOrder.open) {
        window.UzOrder.open(product.raw);
      } else {
        alert('Order system not available');
      }
    }
  };

  init();
})();
