// Public SMM service catalogue. API credentials remain server-side.
(async function loadSmmCatalogue(){
  const status = document.getElementById('smm-status');
  const platforms = document.getElementById('smm-platforms');
  const search = document.getElementById('smm-search');
  const searchBtn = document.getElementById('smm-search-btn');
  const clearBtn = document.getElementById('smm-clear-btn');
  const grid = document.getElementById('smm-services');
  const loadMoreBtn = document.getElementById('smm-load-more');
  if (!status || !platforms || !grid) return;

  let services = [];
  let activePlatform = 'ALL';
  let visibleLimit = 60;
  let committedQuery = '';

  function escapeHtml(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function getQuery(){ return (search?.value || '').trim().toLowerCase(); }

  // Vietnam filtering is already performed server-side in lib/smm.js.
  // Do NOT repeat a language/diacritics filter in the browser: many legitimate
  // global services have Vietnamese supplier descriptions/categories, and that
  // old duplicate filter was the reason Facebook showed "72" but rendered 0.
  function visible(){
    const q = committedQuery;
    return services.filter(s => {
      if (activePlatform !== 'ALL' && s.platformLabel !== activePlatform) return false;
      if (q) {
        const hay = `${s.service} ${s.name} ${s.category} ${s.platformLabel} ${s.description} ${s.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function render(){
    const shown = visible();
    const currency = (typeof UzState !== 'undefined' && UzState.currency) || 'MYR';
    window.__uzServices = window.__uzServices || {};
    shown.forEach(s => { window.__uzServices[s.service] = s; });

    const page = shown.slice(0, visibleLimit);
    grid.innerHTML = page.map(s => `
      <article class="smm-card">
        <div class="smm-meta">#${escapeHtml(s.service)} · ${escapeHtml(s.platformLabel)}</div>
        <h3>${escapeHtml(s.name)}</h3>
        <p class="smm-description">${escapeHtml(s.description || t('order.noDescription'))}</p>
        <div class="smm-meta">${t('card.min')} ${Number(s.min||0).toLocaleString()} · ${t('card.max')} ${Number(s.max||0).toLocaleString()} ${s.refill ? '· ' + t('card.refill') : ''}</div>
        <div class="smm-price">${formatPrice(s.prices[currency] ?? s.prices.MYR, currency)} <small>${t('card.perUnits')}</small></div>
        <button class="btn primary wide smm-order" data-service-id="${escapeHtml(s.service)}">${t('smm.orderNow')}</button>
      </article>`).join('');

    grid.querySelectorAll('.smm-order').forEach(btn => {
      btn.addEventListener('click', () => UzOrderModal.open(window.__uzServices[btn.dataset.serviceId]));
    });

    if (!shown.length) {
      grid.innerHTML = `<div class="smm-empty"><strong>${t('smm.none')}</strong><span>${t('smm.tryAgain')}</span></div>`;
    }

    status.textContent = `${shown.length} ${t('smm.available')}${committedQuery ? ` · ${t('smm.searchingFor')} “${committedQuery}”` : ''}`;
    if (loadMoreBtn) {
      loadMoreBtn.hidden = shown.length <= visibleLimit;
      loadMoreBtn.textContent = `${t('smm.loadMore')} (${Math.min(60, shown.length-visibleLimit) > 0 ? Math.min(60, shown.length-visibleLimit) : 0})`;
    }
    if (typeof translateDynamicContent === 'function') translateDynamicContent();
  }

  function renderPlatformButtons(){
    const counts = {};
    services.forEach(s => { counts[s.platformLabel] = (counts[s.platformLabel]||0) + 1; });
    const priority = ['Facebook','TikTok','Instagram','YouTube','Threads','Telegram','Twitter/X'];
    const present = Object.keys(counts);
    const ordered = [
      ...priority.filter(p => present.includes(p)),
      ...present.filter(p => !priority.includes(p) && p !== 'Others').sort(),
      ...(present.includes('Others') ? ['Others'] : [])
    ];
    platforms.innerHTML = ['ALL', ...ordered].map(p => `
      <button class="smm-cat ${p===activePlatform?'active':''}" data-platform="${escapeHtml(p)}">
        ${p==='ALL' ? `${t('smm.all')} (${services.length})` : `${escapeHtml(p)} (${counts[p]})`}
      </button>`).join('');
    platforms.querySelectorAll('.smm-cat').forEach(btn => btn.addEventListener('click', () => {
      activePlatform = btn.dataset.platform;
      visibleLimit = 60;
      renderPlatformButtons();
      render();
    }));
  }

  function runSearch(){
    committedQuery = getQuery();
    visibleLimit = 60;
    render();
    grid.scrollIntoView({behavior:'smooth', block:'nearest'});
  }

  try {
    const r = await fetch('/api/smm?action=services', { headers: { 'Accept':'application/json' } });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || data.msg || 'Unable to load services');
    services = Array.isArray(data.services) ? data.services : [];
    if (!services.length) throw new Error('The supplier returned no services');

    renderPlatformButtons();
    render();

    search?.addEventListener('input', () => {
      // Keep typing responsive while the explicit Search button remains useful.
      committedQuery = getQuery();
      visibleLimit = 60;
      render();
    });
    search?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } });
    searchBtn?.addEventListener('click', runSearch);
    clearBtn?.addEventListener('click', () => {
      if (search) search.value = '';
      committedQuery = '';
      visibleLimit = 60;
      activePlatform = 'ALL';
      renderPlatformButtons();
      render();
      search?.focus();
    });
    loadMoreBtn?.addEventListener('click', () => { visibleLimit += 60; render(); });
    document.addEventListener('uz:currencychange', render);
    document.addEventListener('uz:langchange', () => { renderPlatformButtons(); render(); });
  } catch(e) {
    status.textContent = (e && e.message) ? `Service catalogue unavailable: ${e.message}` : 'Service catalogue is temporarily unavailable. Please contact us on WhatsApp.';
    grid.innerHTML = `<div class="smm-empty"><strong>${t('smm.error')}</strong><span>${escapeHtml(e?.message || '')}</span></div>`;
    if (loadMoreBtn) loadMoreBtn.hidden = true;
    console.error(e);
  }
})();
