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

  // Remove ONLY services whose PRODUCT NAME indicates the Vietnam market.
  // Do not inspect category, platform, description, or Vietnamese letters in
  // general: a global service may simply have a Vietnamese-language name.
  function isVietnameseService(s){
    const name = String(s.name || '').toLowerCase();
    const patterns = [
      /\bvietnam\b/i,
      /\bviet\s*nam\b/i,
      /\bviệt\s*nam\b/i,
      /\bvn\b/i,
      /\bviệt\b/i,
      /\bviet\b/i,
      /\bcho\s+(?:người\s+)?việt\b/i,
      /\bdành\s+cho\s+(?:người\s+)?việt\b/i,
      /\btại\s+việt\b/i,
      /\bở\s+việt\b/i,
      /\bngười\s+việt\b/i,
      /\bkhách\s+việt\b/i,
      /\bacc\s+việt\b/i,
      /\bclone\s+việt\b/i,
      /\bprofile\s+việt\b/i,
      /\btài\s+khoản\s+việt\b/i,
      /\bfacebook\s+vn\b/i,
      /\btiktok\s+vn\b/i,
      /\byoutube\s+vn\b/i,
      /\binstagram\s+vn\b/i
    ];
    return patterns.some(re => re.test(name));
  }

  function visible(){
    const q = (search?.value || '').trim().toLowerCase();
    return services.filter(s => {
      if (isVietnameseService(s)) return false;
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
        <div class="smm-meta">${t('card.min')} ${s.min.toLocaleString()} · ${t('card.max')} ${s.max.toLocaleString()} ${s.refill ? '· ' + t('card.refill') : ''}</div>
        <div class="smm-price">${formatPrice(s.prices[currency] ?? s.prices.MYR, currency)} <small>${t('card.perUnits')}</small></div>
        <button class="btn primary wide smm-order" onclick="UzOrderModal.open(window.__uzServices['${s.service}'])">${t('smm.orderNow')}</button>
      </article>`).join('');
    status.textContent = shown.length
      ? `${shown.length} ${t('smm.available')}`
      : t('smm.none');
    if (typeof translateDynamicContent === 'function') translateDynamicContent();
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
        ${p==='ALL' ? `${t('smm.all')} (${services.length})` : `${escapeHtml(p)} (${counts[p]})`}
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
    document.addEventListener('uz:langchange', () => { renderPlatformButtons(); render(); });
  } catch(e) {
    status.textContent = 'Service catalogue is temporarily unavailable. Please contact us on WhatsApp.';
    grid.innerHTML = '';
    console.error(e);
  }
})();

