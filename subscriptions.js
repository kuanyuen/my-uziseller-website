/* UziSeller Product Marketplace */
(async function(){
  const root = document.getElementById('subscription-app');
  if (!root) return;

  const lang = () => ((typeof UzState !== 'undefined' && UzState.lang) || 'en');
  const currency = () => ((typeof UzState !== 'undefined' && UzState.currency) || 'MYR');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const first = (o, keys, fb = '') => { for (const k of keys) if (o && o[k] !== undefined && o[k] !== null && String(o[k]).trim() !== '') return o[k]; return fb; };
  const num = (v, fb = 0) => { const n = Number(String(v ?? '').replace(/[^0-9.\-]/g, '')); return Number.isFinite(n) ? n : fb; };

  let products = [];
  let query = '';
  let selectedCategory = '';
  let sortBy = 'recommended';
  let displayLimit = 48;
  const translationCache = loadTranslationCache();
  const translating = new Set();
  let translationObserver;

  function loadTranslationCache() {
    try {
      const saved = JSON.parse(localStorage.getItem('uz_catalog_zh_translations') || '{}');
      return new Map(Object.entries(saved).filter(([source, translated]) =>
        source && typeof translated === 'string' && translated
      ));
    } catch (error) {
      console.warn('Unable to read cached product translations:', error);
      return new Map();
    }
  }

  function saveTranslation(source, translated) {
    translationCache.set(source, translated);
    while (translationCache.size > 1000) {
      translationCache.delete(translationCache.keys().next().value);
    }
    try {
      localStorage.setItem('uz_catalog_zh_translations', JSON.stringify(Object.fromEntries(translationCache)));
    } catch (error) {
      console.warn('Unable to cache product translation:', error);
    }
  }

  function needsChineseTranslation(text) {
    const containsJapaneseOrKorean = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(text);
    return /\p{L}/u.test(text) && (!/\p{Script=Han}/u.test(text) || containsJapaneseOrKorean);
  }

  function priceFor(p) {
    const cur = currency();
    const per = p?.prices?.[cur] ?? p?.prices?.MYR ?? 0;
    const symbol = cur === 'MYR' ? 'RM' : cur === 'USD' ? '$' : '¥';
    return `${symbol}${per.toFixed(2)}`;
  }

  const normalize = p => {
    return {
      id: String(first(p, ['id', 'ID', 'product_id', 'productId', 'productID'], '')),
      name: String(first(p, ['name', 'title', 'product_name', 'productName', 'product'], 'Digital Product')),
      category: String(first(p, ['category', 'category_name', 'categoryName', 'group', 'group_name'], 'Other products')),
      description: String(first(p, ['description', 'desc', 'content'], '')),
      icon: String(first(p, ['icon', 'icon_url', 'iconUrl', 'image', 'image_url', 'logo', 'thumbnail'], '')),
      price: num(first(p, ['price', 'Price', 'selling_price', 'sellingPrice', 'sale_price', 'salePrice', 'cost', 'amount', 'unit_price', 'unitPrice', 'product_price', 'productPrice', 'regular_price', 'current_price'], 0)),
      prices: first(p, ['prices'], null),
      currency: String(first(p, ['currency', 'currency_code'], 'VND')).toUpperCase(),
      min: Math.max(1, num(first(p, ['min', 'minimum', 'min_qty', 'min_quantity'], 1), 1)),
      max: Math.max(1, num(first(p, ['max', 'maximum', 'max_qty', 'max_quantity'], 1), 1)),
      stock: first(p, ['stock', 'inventory'], ''),
      popular: first(p, ['popular', 'featured', 'hot'], false),
    };
  };

  const categoryIconRules = [
    [/\bchat\s*gpt\b|openai/, '✳️'],
    [/claude|anthropic/, '🟠'],
    [/gemini|google ai/, '♊'],
    [/kling/, '🎬'],
    [/grok|twitter|x\s*\(/, '𝕏'],
    [/\bveo\b|runway|midjourney/, '🎥'],
    [/tiktok/, '🎵'],
    [/gmail|google mail/, '✉️'],
    [/instagram/, '📸'],
    [/youtube/, '▶️'],
    [/facebook|fanpage|page\b/, '📘'],
    [/telegram/, '✈️'],
    [/discord/, '🎮'],
    [/threads/, '🧵'],
    [/spotify/, '🎧'],
    [/vpn|proxy/, '🛡️'],
    [/canva/, '🎨'],
    [/capcut/, '✂️'],
    [/steam/, '🕹️'],
    [/netflix/, '🍿'],
    [/adobe/, '🅰️'],
    [/microsoft|office/, '🪟'],
    [/duolingo/, '🦉'],
    [/hotmail|email|mail\b/, '📧'],
    [/cloud|storage|drive/, '☁️'],
    [/profile|account|tài khoản|acc\b/, '👤'],
  ];
  const categoryIconFallbacks = [
    '🌟', '🔑', '💎', '🚀', '🧩', '📱', '💻', '🛒', '🎁', '📦',
    '🪙', '💳', '🧰', '🔧', '⚙️', '🧪', '📡', '🌐', '🔒', '🧲',
    '🪄', '📷', '🎯', '🧠', '📝', '📊', '🗂️', '🗝️', '🏷️', '🧸',
    '🌈', '🔥', '💡', '🪐', '🧭', '🛍️', '🪪', '🎟️', '🎼', '🪁',
    '🌙', '☀️', '🍀', '🪷', '🐼', '🦊', '🐬', '🦋', '🌸', '🍉',
    '🥝', '🍓', '🧋', '☕', '🍰', '🧃', '🥇', '🏆', '🏁', '🧿',
    '🪬', '🔮', '🕰️', '📍', '🗺️', '🪙', '💬', '📣', '🔔', '🪄',
  ];

  function getCategoryIcons(categories) {
    const used = new Set(['▦']);
    let fallbackIndex = 0;
    return new Map(categories.map(category => {
      const rule = categoryIconRules.find(([pattern]) => pattern.test(category.toLowerCase()));
      let icon = rule?.[1];
      if (!icon || used.has(icon)) {
        while (fallbackIndex < categoryIconFallbacks.length && used.has(categoryIconFallbacks[fallbackIndex])) {
          fallbackIndex += 1;
        }
        icon = categoryIconFallbacks[fallbackIndex] || '◈';
        fallbackIndex += 1;
      }
      used.add(icon);
      return [category, icon];
    }));
  }

  function renderStore() {
    const zh = lang() === 'zh';
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const aiCategoryPattern = /\bai\b|artificial intelligence|chatgpt|openai|\bgpt\b|claude|anthropic|gemini|google ai|midjourney|perplexity|copilot|deepseek|qwen|llama|mistral|grok|kimi|glm|minimax|suno|runway|ideogram|cursor/i;
    const categoryCounts = new Map(categories.map(category => [category, products.filter(p => p.category === category).length]));
    categories.sort((a, b) => {
      const aAi = aiCategoryPattern.test(a);
      const bAi = aiCategoryPattern.test(b);
      if (aAi !== bAi) return aAi ? -1 : 1;
      return categoryCounts.get(b) - categoryCounts.get(a) || a.localeCompare(b);
    });
    const categoryIcons = getCategoryIcons(categories);

    root.innerHTML = `
      <div class="uz-ai-store">
        <div class="uz-store-header">
          <div class="uz-store-title">
            <div class="uz-kicker">✦ ${zh ? '供应商商品目录' : 'SUPPLIER PRODUCT CATALOGUE'}</div>
            <h2>${zh ? '按分类浏览商品' : 'Browse Products by Category'}</h2>
            <p>${zh ? '实时同步供应商商品与价格，选择分类快速查找所需商品。' : 'Browse live supplier products and prices. Choose a category to find what you need.'}</p>
          </div>
          <div class="uz-search-box">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="6"/><path d="M13 13l4 4"/></svg>
            <input id="uz-search" type="search" placeholder="${esc(zh ? '搜索商品或分类…' : 'Search products or categories…')}" value="${esc(query)}">
          </div>
        </div>

        <div class="uz-catalog-categories" aria-label="${zh ? '商品分类' : 'Product categories'}">
          <button class="uz-category-chip ${selectedCategory === '' ? 'active' : ''}" type="button" data-category="" aria-pressed="${selectedCategory === ''}">
            <span class="uz-category-icon" aria-hidden="true">▦</span><span class="uz-category-name">${zh ? '所有产品' : 'All products'}</span><small>${products.length}</small>
          </button>
          ${categories.map(category => `
            <button class="uz-category-chip ${selectedCategory === category ? 'active' : ''}" type="button" data-category="${esc(category)}" aria-pressed="${selectedCategory === category}">
              <span class="uz-category-icon" aria-hidden="true">${categoryIcons.get(category)}</span><span class="uz-category-name">${esc(translationCache.get(category) || category)}</span><small>${categoryCounts.get(category)}</small>
            </button>
          `).join('')}
        </div>

        <div id="uz-products-area" class="uz-products-area visible">
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
            </div>
          </div>
          <p class="uz-translation-notice" id="uz-translation-status" role="status" hidden></p>
          <div id="uz-product-grid" class="uz-product-grid"></div>
          <div class="uz-load-more-wrap" id="uz-load-more-wrap"></div>
        </div>
      </div>
    `;

    translationObserver?.disconnect();
    translationObserver = new IntersectionObserver(entries => {
      const jobs = [];
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        translationObserver.unobserve(entry.target);
        if (entry.target.matches('.uz-category-chip[data-category]')) {
          const category = entry.target.dataset.category;
          const target = entry.target.querySelector('.uz-category-name');
          if (category && target) jobs.push({ source: category, target });
          return;
        }
        const product = products.find(item => item.id === entry.target.dataset.productId);
        if (product) {
          jobs.push(
            { source: product.name, target: entry.target.querySelector('[data-translate="name"]') },
            { source: product.description.substring(0, 90), target: entry.target.querySelector('[data-translate="description"]') }
          );
        }
      });
      translateTexts(jobs);
    }, { rootMargin: '180px 0px' });
    root.querySelectorAll('.uz-category-chip[data-category]').forEach(button => translationObserver.observe(button));

    const searchInput = document.getElementById('uz-search');
    if (searchInput) {
      searchInput.oninput = e => {
        query = e.target.value.trim().toLowerCase();
        displayLimit = 48;
        renderProducts();
      };
    }

    renderProducts();
  }

  function renderProducts() {
    const zh = lang() === 'zh';
    const grid = document.getElementById('uz-product-grid');
    const titleEl = document.getElementById('uz-brand-title');
    if (!grid || !titleEl) return;

    translationObserver?.disconnect();
    root.querySelectorAll('.uz-category-chip[data-category]').forEach(button => translationObserver?.observe(button));

    let filtered = products.filter(p => !selectedCategory || p.category === selectedCategory);

    if (query) {
      filtered = filtered.filter(p => {
        const hay = `${p.name} ${p.description} ${p.category} ${translationCache.get(p.name) || ''} ${translationCache.get(p.description.substring(0, 90)) || ''} ${translationCache.get(p.category) || ''}`.toLowerCase();
        return hay.includes(query);
      });
    }

    const cur = currency();
    if (sortBy === 'priceAsc') {
      filtered.sort((a, b) => (a.prices?.[cur] ?? a.prices?.MYR ?? 0) - (b.prices?.[cur] ?? b.prices?.MYR ?? 0));
    } else if (sortBy === 'priceDesc') {
      filtered.sort((a, b) => (b.prices?.[cur] ?? b.prices?.MYR ?? 0) - (a.prices?.[cur] ?? a.prices?.MYR ?? 0));
    }

    const selectedLabel = selectedCategory || (zh ? '所有产品' : 'All products');
    titleEl.innerHTML = `<span>${esc(translationCache.get(selectedLabel) || selectedLabel)}</span> <small>(${filtered.length})</small>`;
    if (zh && selectedCategory && needsChineseTranslation(selectedCategory) && !translationCache.has(selectedCategory)) {
      translateTexts([{ source: selectedCategory, target: titleEl.querySelector('span') }]);
    }

    if (!filtered.length) {
      grid.innerHTML = `<div class="uz-empty">
        <div class="uz-empty-icon">🔍</div>
        <p>${zh ? '此分类中没有匹配商品' : 'No matching products in this category'}</p>
        ${query ? `<button class="btn ghost" onclick="document.getElementById('uz-search').value='';document.getElementById('uz-search').dispatchEvent(new Event('input'))">${zh ? '清除搜索' : 'Clear search'}</button>` : ''}
      </div>`;
      document.getElementById('uz-load-more-wrap').innerHTML = '';
      return;
    }

    const visible = filtered.slice(0, displayLimit);
    grid.innerHTML = visible.map(p => {
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
            ${esc(p.category.slice(0, 1).toUpperCase())}
          </div>
          <div class="uz-prod-info">
            <h4 data-translate="name">${esc(translationCache.get(p.name) || p.name)}</h4>
            <p data-translate="description">${esc(translationCache.get(p.description.substring(0, 90)) || p.description.substring(0, 90))}${p.description.length > 90 ? '…' : ''}</p>
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
    grid.querySelectorAll('.uz-product-card').forEach(card => translationObserver?.observe(card));

    const loadMore = document.getElementById('uz-load-more-wrap');
    loadMore.innerHTML = filtered.length > displayLimit
      ? `<button type="button" class="uz-load-more" data-load-more>${zh ? `显示更多商品（${visible.length}/${filtered.length}）` : `Show more products (${visible.length}/${filtered.length})`}</button>`
      : `<p class="uz-results-count">${zh ? `已显示全部 ${filtered.length} 件商品` : `Showing all ${filtered.length} products`}</p>`;
  }

  async function translateTexts(jobs) {
    if (lang() !== 'zh') return;
    const sources = [...new Set(jobs
      .filter(job => job.target && needsChineseTranslation(job.source) && !translationCache.has(job.source) && !translating.has(job.source))
      .map(job => job.source))];

    for (const source of sources) translating.add(source);
    for (let offset = 0; offset < sources.length; offset += 12) {
      const batch = sources.slice(offset, offset + 12);
      try {
        const response = await fetch('/api/subscriptions?action=translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: batch })
        });
        if (!response.ok) throw new Error(`Translation service returned HTTP ${response.status}`);
        const data = await response.json();
        if (!['success', 'partial'].includes(data.status) || !Array.isArray(data.translations)) {
          throw new Error(data.msg || 'Translation service returned an invalid response');
        }
        if (data.status === 'partial') {
          showTranslationNotice('部分商品暂时无法翻译，当前显示供应商原文。');
          console.warn(data.warning || 'Some product text could not be translated.');
        }

        for (const item of data.translations) {
          if (item.translation && item.translation !== item.text) saveTranslation(item.text, item.translation);
          jobs.filter(job => job.source === item.text).forEach(job => {
            if (job.target.isConnected && job.target.textContent.startsWith(item.text)) {
              job.target.textContent = `${item.translation}${job.target.dataset.translate === 'description' && job.source.length >= 90 ? '…' : ''}`;
            }
          });
        }
      } catch (error) {
        console.warn('Unable to translate supplier product text:', error);
        showTranslationNotice('翻译服务暂时不可用，部分商品信息将显示供应商原文。');
        break;
      } finally {
        batch.forEach(source => translating.delete(source));
      }
    }
    sources.forEach(source => translating.delete(source));
  }

  function showTranslationNotice(message) {
    const notice = document.getElementById('uz-translation-status');
    if (notice) {
      notice.hidden = false;
      notice.textContent = message;
    }
  }

  root.addEventListener('click', event => {
    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) {
      selectedCategory = categoryButton.dataset.category;
      displayLimit = 48;
      root.querySelectorAll('.uz-category-chip').forEach(button => {
        const active = button === categoryButton;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      renderProducts();
      return;
    }

    const sortButton = event.target.closest('[data-sort]');
    if (sortButton) {
      sortBy = sortButton.dataset.sort;
      root.querySelectorAll('.uz-sort-btn').forEach(button => button.classList.toggle('active', button === sortButton));
      renderProducts();
      return;
    }

    if (event.target.closest('[data-load-more]')) {
      displayLimit += 48;
      renderProducts();
    }
  });

  function showUnavailable(message) {
    const zh = lang() === 'zh';
    root.innerHTML = `<div class="uz-api-warning" role="alert">
      <strong>${zh ? '暂时无法加载商品目录' : 'Product catalogue is temporarily unavailable'}</strong>
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
        <h3 id="uz-sub-checkout-title">${esc(translationCache.get(product.name) || product.name)}</h3>
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
      <p>${lang() === 'zh' ? '正在加载商品目录…' : 'Loading product catalogue…'}</p>
    </div>`;

    try {
      // Try the correct API endpoint
      const res = await fetch('/api/subscriptions?action=products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.status === 'success' && data.products && data.products.length > 0) {
        products = data.products.map(normalize);
      } else {
        throw new Error('No products returned');
      }

      products = products.filter(p => p.price > 0 && p.prices && Number.isFinite(p.prices.MYR) && p.prices.MYR > 0);
      if (products.length === 0) {
        showUnavailable(lang() === 'zh' ? '供应商暂未返回价格有效的可售商品。' : 'The supplier did not return products with valid prices.');
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

  document.addEventListener('uz:currencychange', () => {
    if (products.length) renderStore();
  });
  document.addEventListener('uz:langchange', () => {
    if (products.length) renderStore();
  });
  init();
})();
