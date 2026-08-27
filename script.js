document.querySelectorAll('.btn,.card,.feature-cards article,.steps-grid>div').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');el.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')})});

// Public SMM service catalogue. API credentials remain server-side.
(async function loadSmmCatalogue(){
  const status = document.getElementById('smm-status');
  const categories = document.getElementById('smm-categories');
  const grid = document.getElementById('smm-services');
  if (!status || !categories || !grid) return;

  let services = [];
  let activePlatform = 'ALL';
  let search = '';
  const money = new Intl.NumberFormat('en-MY', { style:'currency', currency:'MYR', minimumFractionDigits:2 });

  function escapeHtml(v){ return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  function filtered(){
    const q = search.trim().toLowerCase();
    return services.filter(s => {
      const platformOk = activePlatform === 'ALL' || s.platform === activePlatform;
      const text = `${s.name} ${s.description} ${s.category} ${s.platform} ${s.service}`.toLowerCase();
      return platformOk && (!q || text.includes(q));
    });
  }

  function render(){
    const shown = filtered();
    grid.innerHTML = shown.map(s => `
      <article class="smm-card">
        <div class="smm-meta">${escapeHtml(s.platform || 'SMM Service')} · #${escapeHtml(s.service)} · ${escapeHtml(s.type)}</div>
        <h3>${escapeHtml(s.name)}</h3>
        ${s.description ? `<p class="smm-desc">${escapeHtml(s.description)}</p>` : ''}
        <div class="smm-meta">${escapeHtml(s.category || 'Other')} · Min ${Number(s.min).toLocaleString()} · Max ${Number(s.max).toLocaleString()} ${s.refill ? '· Refill' : ''}</div>
        <div class="smm-price">${money.format(Number(s.customerRate || 0))} <small>/ 1,000 units</small></div>
        <a class="btn primary wide smm-order" target="_blank" rel="noopener" href="https://wa.me/601163630234?text=${encodeURIComponent('Hi Uziseller, I want to order service #' + s.service + ': ' + s.name)}">Order via WhatsApp</a>
      </article>`).join('');
    status.textContent = shown.length ? `Showing ${shown.length.toLocaleString()} services` : 'No matching services found.';
  }

  try {
    const r = await fetch('/api/smm?action=services', { headers: { 'Accept':'application/json' } });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || data.msg || 'Unable to load services');
    services = Array.isArray(data.services) ? data.services : [];

    // Show every available platform instead of only Facebook or the first 120 services.
    const platforms = [...new Set(services.map(s => s.platform).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    categories.innerHTML = `<button class="smm-cat active" data-platform="ALL">All Platforms (${services.length})</button>` +
      platforms.map(p => `<button class="smm-cat" data-platform="${escapeHtml(p)}">${escapeHtml(p)} (${services.filter(s=>s.platform===p).length})</button>`).join('');

    categories.querySelectorAll('.smm-cat').forEach(btn => btn.addEventListener('click', () => {
      activePlatform = btn.dataset.platform;
      categories.querySelectorAll('.smm-cat').forEach(b => b.classList.toggle('active', b === btn));
      render();
    }));

    // Add a customer-friendly search box for the full catalogue.
    const searchWrap = document.createElement('div');
    searchWrap.className = 'smm-search-wrap';
    searchWrap.innerHTML = '<input id="smm-search" class="smm-search" type="search" placeholder="Search Facebook, TikTok, YouTube, Instagram, service name..." aria-label="Search SMM services">';
    categories.parentNode.insertBefore(searchWrap, categories.nextSibling);
    document.getElementById('smm-search').addEventListener('input', e => { search = e.target.value; render(); });

    render();
  } catch(e) {
    status.textContent = 'Service catalogue is temporarily unavailable. Please contact us on WhatsApp.';
    grid.innerHTML = '';
    console.error(e);
  }
})();
