/* UziSeller AI Subscriptions Store — Fully Optimized Version */
(async function(){
  const root = document.getElementById('subscription-app');
  if (!root) return;

  const lang = () => ((typeof UzState !== 'undefined' && UzState.lang) || 'en');
  const currency = () => ((typeof UzState !== 'undefined' && UzState.currency) || 'MYR');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const first = (o, keys, fb = '') => { for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && String(o[k]).trim() !== '') return o[k]; return fb; };
  const num = (v, fb = 0) => { const n = Number(String(v ?? '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : fb; };

  let products = [];
  let expandedBrand = 'CHATGPT'; // Default: show ChatGPT products on load
  let query = '';
  let sortBy = 'recommended'; // 'recommended' | 'priceAsc' | 'priceDesc' | 'popular'

  // Fallback demo products (if API fails)
  const DEMO_PRODUCTS = [
    {
      id: 'demo-gpt-plus-1m',
      name: 'ChatGPT Plus - 1 Month',
      category: 'ChatGPT',
      description: 'ChatGPT Plus private account with GPT-4o, Canvas, and DALL-E 3 access. Instant delivery.',
      icon: '',
      prices: { MYR: 45, USD: 11, CNY: 75 },
      brand: 'CHATGPT',
      stock: 'In Stock',
      popular: true
    },
    {
      id: 'demo-gpt-plus-3m',
      name: 'ChatGPT Plus - 3 Months',
      category: 'ChatGPT',
      description: 'ChatGPT Plus subscription for 3 months. Best value for regular users.',
      icon: '',
      prices: { MYR: 120, USD: 30, CNY: 200 },
      brand: 'CHATGPT',
      stock: 'In Stock'
    },
    {
      id: 'demo-claude-pro-1m',
      name: 'Claude Pro - 1 Month',
      category: 'Claude',
      description: 'Claude 3.7 Sonnet & Opus access with 200K context window. Perfect for coding and long documents.',
      icon: '',
      prices: { MYR: 85, USD: 21, CNY: 142 },
      brand: 'CLAUDE',
      stock: 'In Stock',
      popular: true
    },
    {
      id: 'demo-claude-pro-3m',
      name: 'Claude Pro - 3 Months',
      category: 'Claude',
      description: 'Claude Pro subscription for 3 months. Ideal for developers and content creators.',
      icon: '',
      prices: { MYR: 240, USD: 60, CNY: 400 },
      brand: 'CLAUDE',
      stock: 'In Stock'
    }
  ];

  function priceFor(p) {
    const cur = currency();
    const per = p?.prices?.[cur] ?? p?.prices?.MYR ?? 0;
    const symbol = cur === 'MYR' ? 'RM' : cur === 'USD' ? '$' : '¥';
    return `${symbol}${per.toFixed(2)}`;
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
      popular: first(p, ['popular', 'featured', 'hot'], false),
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

    // Hide cards with no products
    const showChatGpt = chatGptProducts.length > 0;
    const showClaude = claudeProducts.length > 0;

    root.innerHTML = `
      <div class="uz-ai-store">
        <!-- Store Header -->
        <div class="uz-store-header">
          <div class="uz-store-title">
            <div class="uz-kicker">✦ ${zh ? '官方授权 AI 订阅商城' : 'AUTHORIZED AI SUBSCRIPTIONS MARKETPLACE'}</div>
            <h2>${zh ? '顶级 AI 工具，触手可及' : 'Premium AI Tools, Instantly Yours'}</h2>
            <p>${zh ? '为专业人士与创作者提供 ChatGPT 与 Claude 官方账号 · 秒级发货 · 全程质保 · 私密独享' : 'ChatGPT & Claude official accounts for professionals & creators · Instant delivery · Full warranty · Private & secure'}</p>
          </div>
          <div class="uz-search-box">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M13 13l4 4"/></svg>
            <input id="uz-search" type="search" placeholder="${esc(zh ? '搜索套餐名称…' : 'Search plans…')}" value="${esc(query)}">
          </div>
        </div>

        <!-- Trust Badges (moved to top for visibility) -->
        <div class="uz-trust-section uz-trust-top">
          <div class="uz-trust-item">
            <span class="uz-trust-icon">⚡</span>
            <div>
              <strong>${zh ? '⚡ 闪电发货' : '⚡ Lightning Fast'}</strong>
              <p>${zh ? '支付后 3 秒自动发货，无需等待人工处理' : 'Auto-delivery in 3 seconds after payment, no manual processing'}</p>
            </div>
          </div>
          <div class="uz-trust-item">
            <span class="uz-trust-icon">🛡️</span>
            <div>
              <strong>${zh ? '🛡️ 官方渠道' : '🛡️ Official Source'}</strong>
              <p>${zh ? '100% 官方正品账号，终身质保与快速售后' : '100% official accounts with lifetime warranty & priority support'}</p>
            </div>
          </div>
          <div class="uz-trust-item">
            <span class="uz-trust-icon">🔒</span>
            <div>
              <strong>${zh ? '🔒 隐私保障' : '🔒 Privacy Guaranteed'}</strong>
              <p>${zh ? '专属独立账号，对话记录完全私密，绝不共享' : 'Exclusive single-user accounts, fully private conversations, never shared'}</p>
            </div>
          </div>
        </div>

        <!-- Main Brand Category Cards (AppMMO-style) -->
        <div class="uz-brand-categories">
          ${showChatGpt ? `
          <!-- ChatGPT Category Card -->
          <div class="uz-category-card chatgpt-card ${expandedBrand === 'CHATGPT' ? 'expanded' : ''}" data-brand="CHATGPT">
            <div class="uz-cat-header">
              <div class="uz-cat-icon chatgpt-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div class="uz-cat-info">
                <h3>OpenAI ChatGPT</h3>
                <p>${zh ? '全球最强 AI 对话助手 · 支持 GPT-4o 深度推理、Canvas 协作画布、DALL-E 3 图像生成' : 'World\'s leading AI assistant · GPT-4o advanced reasoning, Canvas collaboration & DALL-E 3 image generation'}</p>
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
              <span>✓ ${zh ? '无限 GPT-4o 对话与深度分析能力' : 'Unlimited GPT-4o conversations & deep analysis'}</span>
              <span>✓ ${zh ? 'Canvas 协作模式：实时编辑文档与代码' : 'Canvas mode: Real-time document & code editing'}</span>
              <span>✓ ${zh ? 'DALL-E 3 AI 绘图：文字秒变精美图像' : 'DALL-E 3 AI art: Text to stunning images instantly'}</span>
            </div>
          </div>
          ` : ''}

          ${showClaude ? `
          <!-- Claude Category Card -->
          <div class="uz-category-card claude-card ${expandedBrand === 'CLAUDE' ? 'expanded' : ''}" data-brand="CLAUDE">
            <div class="uz-cat-header">
              <div class="uz-cat-icon claude-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4l16 16M20 4L4 20M12 2v20M2 12h20"/></svg>
              </div>
              <div class="uz-cat-info">
                <h3>Anthropic Claude</h3>
                <p>${zh ? '程序员与创作者首选 AI · Claude 3.7 Sonnet / Opus 超强推理 · 200K 超长上下文处理整本书' : 'Developer & creator\'s top choice · Claude 3.7 Sonnet / Opus advanced reasoning · 200K context for entire books'}</p>
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
              <span>✓ ${zh ? '200K 超长上下文：一次处理整本书或完整代码库' : '200K context window: Process entire books or codebases'}</span>
              <span>✓ ${zh ? '代码编程专家：准确理解需求，输出高质量代码' : 'Coding expert: Precise requirements, production-quality code'}</span>
              <span>✓ ${zh ? '长文写作利器：学术论文、商业报告、创意小说' : 'Long-form writing: Academic papers, reports, creative fiction'}</span>
            </div>
          </div>
          ` : ''}
        </div>

        <!-- Expanded Products Section -->
        <div id="uz-products-area" class="uz-products-area ${expandedBrand ? 'visible' : 'hidden'}">
          <div class="uz-products-header">
            <h3 id="uz-brand-title"></h3>
            <div class="uz-products-controls">
              <div class="uz-sort-buttons">
                <button class="uz-sort-btn ${sortBy === 'recommended' ? 'active' : ''}" data-sort="recommended">
                  ${zh ? '推荐' : 'Recommended'}
                </button>
                <button class="uz-sort-btn ${sortBy === 'priceAsc' ? 'active' : ''}" data-sort="priceAsc">
                  ${zh ? '价格 ↑' : 'Price ↑'}
                </button>
                <button class="uz-sort-btn ${sortBy === 'priceDesc' ? 'active' : ''}" data-sort="priceDesc">
                  ${zh ? '价格 ↓' : 'Price ↓'}
                </button>
              </div>
              <button class="uz-close-btn" id="uz-close-products" type="button">✕ ${zh ? '收起' : 'Close'}</button>
            </div>
          </div>
          <div id="uz-product-grid" class="uz-product-grid"></div>
        </div>
      </div>
    `;

    // Event Listeners
    const searchInput = document.getElementById('uz-search');
    if (searchInput) {
      searchInput.oninput = e => {
        query = e.target.value.trim().toLowerCase();
        // Auto-expand when searching
        if (query && !expandedBrand) {
          expandedBrand = showChatGpt ? 'CHATGPT' : 'CLAUDE';
        }
        if (expandedBrand) renderProducts();
        else renderStore();
      };
    }

    document.querySelectorAll('.uz-category-card').forEach(card => {
      card.onclick = () => {
        const brand = card.dataset.brand;
        expandedBrand = (expandedBrand === brand) ? null : brand;
        renderStore();
        if (expandedBrand) {
          setTimeout(() => document.getElementById('uz-products-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
      };
    });

    const closeBtn = document.getElementById('uz-close-products');
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        expandedBrand = null;
        query = '';
        renderStore();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    }

    // Sort buttons
    document.querySelectorAll('.uz-sort-btn').forEach(btn => {
      btn.onclick = () => {
        sortBy = btn.dataset.sort;
        renderProducts();
      };
    });

    // Listen for currency/language changes
    document.addEventListener('uz:currencychange', renderStore);
    document.addEventListener('uz:langchange', renderStore);

    if (expandedBrand) renderProducts();
  }

  function renderProducts() {
    const zh = lang() === 'zh';
    const grid = document.getElementById('uz-product-grid');
    const titleEl = document.getElementById('uz-brand-title');
    if (!grid || !titleEl) return;

    let filtered = products.filter(p => p.brand === expandedBrand);

    // Apply search filter
    if (query) {
      filtered = filtered.filter(p => {
        const hay = `${p.name} ${p.description} ${p.category}`.toLowerCase();
        return hay.includes(query);
      });
    }

    // Apply sorting
    const cur = currency();
    if (sortBy === 'priceAsc') {
      filtered.sort((a, b) => (a.prices?.[cur] ?? 0) - (b.prices?.[cur] ?? 0));
    } else if (sortBy === 'priceDesc') {
      filtered.sort((a, b) => (b.prices?.[cur] ?? 0) - (a.prices?.[cur] ?? 0));
    } else if (sortBy === 'recommended') {
      // Popular items first, then by price
      filtered.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return (a.prices?.[cur] ?? 0) - (b.prices?.[cur] ?? 0);
      });
    }

    // Update title with sort buttons staying visible
    titleEl.innerHTML = expandedBrand === 'CHATGPT'
      ? `🟢 ChatGPT ${zh ? '全部套餐' : 'All Plans'} (${filtered.length})`
      : `🟠 Claude ${zh ? '全部套餐' : 'All Plans'} (${filtered.length})`;

    if (!filtered.length) {
      grid.innerHTML = `<div class="uz-empty">
        <div class="uz-empty-icon">🔍</div>
        <p>${zh ? '未找到匹配的套餐' : 'No plans found'}</p>
        ${query ? `<button class="btn ghost" onclick="document.getElementById('uz-search').value='';document.getElementById('uz-search').dispatchEvent(new Event('input'))">${zh ? '清除搜索' : 'Clear search'}</button>` : ''}
      </div>`;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const brandColor = p.brand === 'CHATGPT' ? 'chatgpt' : 'claude';
      const stockBadge = p.stock ? `<span class="uz-stock-badge">${esc(p.stock)}</span>` : '';
      const popularBadge = p.popular ? `<span class="uz-popular-badge">${zh ? '🔥 热门' : '🔥 Popular'}</span>` : '';

      return `
      <div class="uz-product-card ${brandColor}-product" data-product-id="${esc(p.id)}">
        <div class="uz-prod-badges">
          ${popularBadge}
          ${stockBadge}
        </div>
        <div class="uz-prod-header">
          ${p.icon ? `<img src="${esc(p.icon)}" alt="" class="uz-prod-icon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">` : ''}
          <div class="uz-prod-icon-placeholder ${brandColor}-icon" ${p.icon ? 'style="display:none"' : ''}>
            ${p.brand === 'CHATGPT' ? '🤖' : '🧠'}
          </div>
          <div class="uz-prod-info">
            <h4>${esc(p.name)}</h4>
            <p>${esc(p.description.substring(0, 90))}${p.description.length > 90 ? '…' : ''}</p>
          </div>
        </div>
        <div class="uz-prod-footer">
          <div class="uz-prod-price">
            <span class="uz-price-label">${zh ? '售价' : 'Price'}</span>
            <strong>${priceFor(p)}</strong>
          </div>
          <button class="uz-buy-btn ${brandColor}-btn" type="button" onclick="UzSub.openOrder('${esc(p.id)}')">
            ${zh ? '立即购买' : 'Buy Now'}
          </button>
        </div>
      </div>
    `;
    }).join('');
  }

  // Fetch products from API
  async function init() {
    root.innerHTML = `<div class="uz-loading">
      <div class="uz-spinner"></div>
      <p>${lang() === 'zh' ? '正在加载套餐…' : 'Loading subscription plans…'}</p>
    </div>`;

    try {
      // Try the correct API endpoint
      const res = await fetch('/api/subscriptions.js?action=products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.status === 'success' && data.products && data.products.length > 0) {
        products = data.products.map(normalize).filter(p => p.brand);
      } else {
        throw new Error('No products returned');
      }

      // If no AI products found, use demo data
      if (products.length === 0) {
        console.warn('No AI products found in API response, using demo data');
        products = DEMO_PRODUCTS;
      }

      renderStore();
    } catch (err) {
      console.error('Failed to load products from API:', err);
      // Fallback to demo products
      products = DEMO_PRODUCTS;
      renderStore();

      // Show subtle warning
      const warning = document.createElement('div');
      warning.className = 'uz-api-warning';
      warning.innerHTML = `<small>⚠️ ${lang() === 'zh' ? '演示模式（API 未连接）' : 'Demo mode (API not connected)'}</small>`;
      root.insertBefore(warning, root.firstChild);
    }
  }

  // Public API
  window.UzSub = {
    openOrder: (id) => {
      const product = products.find(p => p.id === id);
      if (!product) {
        alert(lang() === 'zh' ? '产品未找到' : 'Product not found');
        return;
      }

      // Check if order modal is available
      if (typeof window.UzOrder !== 'undefined' && window.UzOrder.open) {
        window.UzOrder.open(product.raw || product);
      } else if (typeof window.openSubscriptionCheckout === 'function') {
        window.openSubscriptionCheckout(product.raw || product);
      } else {
        // Fallback: redirect to WhatsApp
        const zh = lang() === 'zh';
        const msg = encodeURIComponent(`Hi, I want to order: ${product.name} (${priceFor(product)})`);
        window.open(`https://wa.me/601163630234?text=${msg}`, '_blank');
      }
    },

    refresh: () => {
      renderStore();
    }
  };

  init();
})();
