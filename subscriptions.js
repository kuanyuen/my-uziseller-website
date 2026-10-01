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
  let expandedBrand = 'AI';
  let query = '';
  let sortBy = 'recommended'; // 'recommended' | 'priceAsc' | 'priceDesc' | 'popular'

  function priceFor(p) {
    const cur = currency();
    const per = p?.prices?.[cur] ?? p?.prices?.MYR ?? 0;
    const symbol = cur === 'MYR' ? 'RM' : cur === 'USD' ? '$' : '¥';
    return `${symbol}${per.toFixed(2)}`;
  }

  function getBrand(p) {
    const hay = `${p.category || ''} ${p.name || ''} ${p.description || ''}`.toLowerCase();
    if (/facebook|instagram|tiktok|youtube|telegram|twitter|smm|social media/.test(hay)) return null;
    return /\bai\b|artificial intelligence|language model|large language model|\bllm\b|generative|chatgpt|openai|\bgpt\b|claude|anthropic|gemini|google ai|midjourney|perplexity|copilot|deepseek|\bqwen\b|\bllama\b|mistral|grok|\bkimi\b|\bglm\b|minimax|suno|runway|ideogram|leonardo ai|cursor ai|windsurf/.test(hay) ? 'AI' : null;
  }

  const normalize = p => {
    const brand = getBrand(p);
    return {
      id: String(first(p, ['id', 'ID', 'product_id', 'productId', 'productID'], '')),
      name: String(first(p, ['name', 'title', 'product_name'], 'AI Product')),
      category: String(first(p, ['category', 'category_name', 'categoryName', 'group', 'group_name'], 'Artificial Intelligence')),
      description: String(first(p, ['description', 'desc', 'content'], '')),
      icon: String(first(p, ['icon', 'icon_url', 'iconUrl', 'image', 'image_url', 'logo', 'thumbnail'], '')),
      price: num(first(p, ['price', 'Price', 'selling_price', 'sellingPrice', 'sale_price', 'salePrice', 'cost', 'amount', 'unit_price', 'unitPrice', 'product_price', 'productPrice', 'regular_price', 'current_price'], 0)),
      prices: first(p, ['prices'], null),
      currency: String(first(p, ['currency', 'currency_code'], 'VND')).toUpperCase(),
      min: Math.max(1, num(first(p, ['min', 'minimum', 'min_qty', 'min_quantity'], 1), 1)),
      max: Math.max(1, num(first(p, ['max', 'maximum', 'max_qty', 'max_quantity'], 1), 1)),
      stock: first(p, ['stock', 'inventory'], ''),
      popular: first(p, ['popular', 'featured', 'hot'], false),
      brand: brand
    };
  };

  function renderStore() {
    const zh = lang() === 'zh';
    const aiProducts = products;
    const curSymbol = currency() === 'MYR' ? 'RM' : (currency() === 'USD' ? '$' : '¥');
    const minPrice = Math.min(...aiProducts.map(p => p.prices?.[currency()] ?? Infinity));

    root.innerHTML = `
      <div class="uz-ai-store">
        <!-- Store Header -->
        <div class="uz-store-header">
          <div class="uz-store-title">
            <div class="uz-kicker">✦ ${zh ? '人工智能商品与订阅' : 'ARTIFICIAL INTELLIGENCE MARKETPLACE'}</div>
            <h2>${zh ? '探索人工智能商品与订阅' : 'Explore AI Products and Subscriptions'}</h2>
            <p>${zh ? '汇集多种人工智能工具与订阅服务 · 实时商品 · 安全结账' : 'Explore AI tools and subscriptions from multiple providers · Live products · Secure checkout'}</p>
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
              <strong>${zh ? '⚡ 付款后自动提交' : '⚡ Automatic Submission'}</strong>
              <p>${zh ? '付款确认后，系统会自动向供应商提交订单' : 'Orders are submitted to the supplier after payment is confirmed'}</p>
            </div>
          </div>
          <div class="uz-trust-item">
            <span class="uz-trust-icon">🛡️</span>
            <div>
              <strong>${zh ? '🛡️ 安全付款' : '🛡️ Secure Payment'}</strong>
              <p>${zh ? '通过 Billplz 安全付款页面完成结账' : 'Checkout is handled through the Billplz payment page'}</p>
            </div>
          </div>
          <div class="uz-trust-item">
            <span class="uz-trust-icon">🔒</span>
            <div>
              <strong>${zh ? '🔒 订单可查询' : '🔒 Order Tracking'}</strong>
              <p>${zh ? '可在订单页面查看付款与交付状态' : 'View payment and delivery status on the order page'}</p>
            </div>
          </div>
        </div>

        <!-- Artificial intelligence category -->
        <div class="uz-brand-categories">
          <div class="uz-category-card ai-card ${expandedBrand === 'AI' ? 'expanded' : ''}" data-brand="AI">
            <div class="uz-cat-header">
              <div class="uz-cat-icon ai-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48 2.12 2.12m0-12.72-2.12 2.12m-8.48 8.48-2.12 2.12"/><circle cx="12" cy="12" r="5"/></svg>
              </div>
              <div class="uz-cat-info">
                <h3>${zh ? '人工智能' : 'Artificial Intelligence'}</h3>
                <p>${zh ? '浏览供应商提供的 AI 工具、模型、账号与订阅套餐。' : 'Browse AI tools, models, accounts and subscription plans from the supplier.'}</p>
                <div class="uz-cat-meta">
                  <span class="uz-badge">${aiProducts.length} ${zh ? '个商品' : 'Products'}</span>
                  ${Number.isFinite(minPrice) ? `<span class="uz-price-tag">${zh ? '起步价' : 'From'} ${curSymbol}${minPrice.toFixed(2)}</span>` : ''}
                </div>
              </div>
              <button class="uz-expand-btn" type="button">
                ${expandedBrand === 'AI' ? '▲' : '▼'}
              </button>
            </div>
            <div class="uz-cat-features">
              <span>✓ ${zh ? '供应商实时商品目录' : 'Live supplier product catalogue'}</span>
              <span>✓ ${zh ? '下单时重新核对价格与库存规则' : 'Price and quantity limits checked at checkout'}</span>
              <span>✓ ${zh ? '付款确认后自动提交订阅订单' : 'Orders submitted after payment confirmation'}</span>
            </div>
          </div>
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
          expandedBrand = 'AI';
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

    let filtered = products.filter(p => p.brand === 'AI');

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
    titleEl.textContent = `${zh ? '人工智能商品' : 'AI Products'} (${filtered.length})`;

    if (!filtered.length) {
      grid.innerHTML = `<div class="uz-empty">
        <div class="uz-empty-icon">🔍</div>
        <p>${zh ? '未找到匹配的套餐' : 'No plans found'}</p>
        ${query ? `<button class="btn ghost" onclick="document.getElementById('uz-search').value='';document.getElementById('uz-search').dispatchEvent(new Event('input'))">${zh ? '清除搜索' : 'Clear search'}</button>` : ''}
      </div>`;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const brandColor = 'ai';
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
            ✨
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
          <button class="uz-buy-btn ${brandColor}-btn" type="button" data-buy-product-id="${esc(p.id)}">
            ${zh ? '立即购买' : 'Buy Now'}
          </button>
        </div>
      </div>
    `;
    }).join('');
  }

  function showUnavailable(message) {
    const zh = lang() === 'zh';
    root.innerHTML = `<div class="uz-api-warning" role="alert">
      <strong>${zh ? '暂时无法加载 AI 套餐' : 'AI plans are temporarily unavailable'}</strong>
      <p>${esc(message || (zh ? '请稍后重试，或联系客服。' : 'Please try again later or contact support.'))}</p>
      <button type="button" class="uz-buy-btn" id="uz-sub-retry">${zh ? '重试' : 'Retry'}</button>
    </div>`;
    root.querySelector('#uz-sub-retry')?.addEventListener('click', init);
  }

  function closeCheckout(overlay) {
    overlay?.remove();
    document.removeEventListener('keydown', onCheckoutEscape);
  }

  let activeCheckout = null;
  function onCheckoutEscape(event) {
    if (event.key === 'Escape' && activeCheckout) {
      const overlay = activeCheckout;
      activeCheckout = null;
      closeCheckout(overlay);
    }
  }

  function openCheckout(product) {
    const zh = lang() === 'zh';
    const account = window.UzAccount;
    const accountName = account && typeof account.getName === 'function' ? account.getName() : '';
    const accountEmail = account && typeof account.getEmail === 'function' ? account.getEmail() : '';
    const overlay = document.createElement('div');
    overlay.className = 'order-modal-overlay uz-sub-checkout-overlay open';
    overlay.innerHTML = `
      <section class="smm-review-modal uz-sub-checkout" role="dialog" aria-modal="true" aria-labelledby="uz-sub-checkout-title">
        <button class="uz-sub-checkout-close" type="button" aria-label="${zh ? '关闭' : 'Close'}">×</button>
        <span class="smm-review-kicker">${zh ? '安全结账' : 'SECURE CHECKOUT'}</span>
        <h3 id="uz-sub-checkout-title">${esc(product.name)}</h3>
        <p class="smm-review-meta">${zh ? '付款确认后将自动向供应商提交订单。' : 'Your order is sent to the supplier after payment is confirmed.'}</p>
        <form id="uz-sub-checkout-form">
          <div class="smm-review-customer">
            <label><span>${zh ? '姓名' : 'Name'}</span><input name="name" autocomplete="name" required maxlength="120" value="${esc(accountName)}"></label>
            <label><span>${zh ? '电子邮箱' : 'Email'}</span><input name="email" type="email" autocomplete="email" required maxlength="254" value="${esc(accountEmail)}"></label>
          </div>
          <div class="uz-sub-checkout-options">
            <label><span>${zh ? '数量' : 'Quantity'}</span><input name="quantity" type="number" inputmode="numeric" min="${product.min}" max="${product.max}" value="${product.min}" required></label>
            <label><span>${zh ? '优惠码（选填）' : 'Coupon (optional)'}</span><input name="coupon" maxlength="100" autocomplete="off"></label>
          </div>
          <div class="uz-sub-checkout-error" role="alert" hidden></div>
          <div class="smm-review-footer">
            <div><small>${zh ? '页面显示参考价，最终价格以结账验证为准。' : 'Displayed price is indicative; checkout verifies the final price.'}</small><strong>${esc(priceFor(product))}</strong></div>
            <button class="btn" type="submit">${zh ? '前往付款' : 'Continue to payment'}</button>
          </div>
        </form>
      </section>`;
    document.body.appendChild(overlay);
    activeCheckout = overlay;

    const form = overlay.querySelector('#uz-sub-checkout-form');
    const submit = form.querySelector('[type="submit"]');
    const error = form.querySelector('.uz-sub-checkout-error');
    const close = () => {
      closeCheckout(overlay);
      if (activeCheckout === overlay) activeCheckout = null;
    };
    overlay.addEventListener('click', event => {
      if (event.target === overlay) close();
    });
    overlay.querySelector('.uz-sub-checkout-close').addEventListener('click', close);
    document.addEventListener('keydown', onCheckoutEscape);
    form.addEventListener('submit', async event => {
      event.preventDefault();
      error.hidden = true;
      submit.disabled = true;
      submit.textContent = zh ? '正在创建账单…' : 'Creating payment…';
      try {
        const values = Object.fromEntries(new FormData(form).entries());
        const response = await fetch('/api/subscription-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity: Number(values.quantity),
            name: String(values.name || '').trim(),
            email: String(values.email || '').trim(),
            coupon: String(values.coupon || '').trim()
          })
        });
        const result = await response.json();
        if (!response.ok || result.status !== 'ok' || !result.paymentUrl) {
          throw new Error(result.msg || (zh ? '无法创建付款账单，请重试。' : 'Could not create payment. Please try again.'));
        }
        window.location.assign(result.paymentUrl);
      } catch (err) {
        error.textContent = err.message || (zh ? '结账失败，请稍后重试。' : 'Checkout failed. Please try again.');
        error.hidden = false;
        submit.disabled = false;
        submit.textContent = zh ? '重试付款' : 'Retry payment';
      }
    });
    form.querySelector('[name="name"]').focus();
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-buy-product-id]');
    if (button) window.UzSub?.openOrder(button.dataset.buyProductId);
  });

  // Fetch products from API
  async function init() {
    root.innerHTML = `<div class="uz-loading">
      <div class="uz-spinner"></div>
      <p>${lang() === 'zh' ? '正在加载套餐…' : 'Loading subscription plans…'}</p>
    </div>`;

    try {
      // Try the correct API endpoint
      const res = await fetch('/api/subscriptions?action=products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.status === 'success' && data.products && data.products.length > 0) {
        products = data.products.map(normalize).filter(p => p.brand && isAiSubscription(p));
      } else {
        throw new Error('No products returned');
      }

      function isAiSubscription(product) {
        const text = `${product.name} ${product.description} ${product.category || ''}`.toLowerCase();
        if (/facebook|instagram|tiktok|youtube|telegram|twitter|account aged|smm|social media/.test(text)) return false;
        return product.brand === 'AI';
      }

      products = products.filter(p => p.price > 0 && p.prices && Number.isFinite(p.prices.MYR) && p.prices.MYR > 0);
      if (products.length === 0) {
        showUnavailable(lang() === 'zh' ? '供应商暂未返回可售且价格有效的 AI 商品。' : 'The supplier did not return AI products with valid prices.');
        return;
      }

      renderStore();
    } catch (err) {
      console.error('Failed to load products from API:', err);
      showUnavailable(lang() === 'zh' ? '供应商 API 暂时无法连接，请稍后重试。' : 'The supplier API could not be reached. Please try again later.');
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
      openCheckout(product);
    },

    refresh: () => {
      renderStore();
    }
  };

  init();
})();
