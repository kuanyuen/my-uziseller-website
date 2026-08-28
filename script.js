document.querySelectorAll('.btn,.card,.feature-cards article,.steps-grid>div').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');el.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')})});
// Public SMM service catalogue. API credentials remain server-side.
(async function loadSmmCatalogue(){
  const status = document.getElementById('smm-status');
  const platforms = document.getElementById('smm-platforms');
  const search = document.getElementById('smm-search');
  const grid = document.getElementById('smm-services');
  if (!status || !platforms || !grid) return;

  let services = [];
  let activePlatform = 'ALL';

  function escapeHtml(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function visible(){
    const q = (search?.value || '').trim().toLowerCase();
    return services.filter(s => {
      if (activePlatform !== 'ALL' && s.platformLabel !== activePlatform) return false;
      if (q && !(`${s.name} ${s.category}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  function render(){
    const shown = visible();
    const currency = (typeof UzState !== 'undefined' && UzState.currency) || 'MYR';
    window.__uzServices = window.__uzServices || {};
    shown.forEach(s => { window.__uzServices[s.service] = s; });
    grid.innerHTML = shown.slice(0, 150).map(s => `
      <article class="smm-card">
        <div class="smm-meta">#${escapeHtml(s.service)} · ${escapeHtml(s.platformLabel)}</div>
        <h3>${escapeHtml(s.name)}</h3>
        <div class="smm-meta">Min ${s.min.toLocaleString()} · Max ${s.max.toLocaleString()} ${s.refill ? '· Refill' : ''}</div>
        <div class="smm-price">${formatPrice(s.prices[currency] ?? s.prices.MYR, currency)} <small>/ 1,000 units</small></div>
        <button class="btn primary wide smm-order" onclick="UzOrderModal.open(window.__uzServices['${s.service}'])" data-i18n="smm.orderNow">Order Now</button>
      </article>`).join('');
    status.textContent = shown.length
      ? `${shown.length} service${shown.length===1?'':'s'} available`
      : 'No services match this filter.';
    if (typeof applyLanguage === 'function' && typeof UzState !== 'undefined') applyLanguage(UzState.lang);
  }

  function renderPlatformButtons(){
    const counts = {};
    services.forEach(s => { counts[s.platformLabel] = (counts[s.platformLabel]||0) + 1; });
    // Order: common platforms first (if present), then anything else, "Others" last.
    const priority = ['Facebook','TikTok','Instagram','YouTube','Threads','Telegram','Twitter/X'];
    const present = Object.keys(counts);
    const ordered = [
      ...priority.filter(p => present.includes(p)),
      ...present.filter(p => !priority.includes(p) && p !== 'Others').sort(),
      ...(present.includes('Others') ? ['Others'] : [])
    ];
    const all = ['ALL', ...ordered];
    platforms.innerHTML = all.map(p => `
      <button class="smm-cat ${p===activePlatform?'active':''}" data-platform="${escapeHtml(p)}">
        ${p==='ALL' ? `All (${services.length})` : `${escapeHtml(p)} (${counts[p]})`}
      </button>`).join('');
    platforms.querySelectorAll('.smm-cat').forEach(btn => btn.addEventListener('click', () => {
      activePlatform = btn.dataset.platform;
      platforms.querySelectorAll('.smm-cat').forEach(b => b.classList.toggle('active', b === btn));
      render();
    }));
  }

  try {
    const r = await fetch('/api/smm?action=services', { headers: { 'Accept':'application/json' } });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || data.msg || 'Unable to load services');
    services = Array.isArray(data.services) ? data.services : [];
    renderPlatformButtons();
    render();
    search?.addEventListener('input', render);
    document.addEventListener('uz:currencychange', render);
  } catch(e) {
    status.textContent = 'Service catalogue is temporarily unavailable. Please contact us on WhatsApp.';
    grid.innerHTML = '';
    console.error(e);
  }
})();

