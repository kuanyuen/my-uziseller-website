// Customer-facing App Subscription shop. Data stays live from SHOP.APPMMO.COM.
(async function loadSubscriptions(){
  const root=document.getElementById('subscription-app'); if(!root) return;
  const status=document.getElementById('subscription-status');
  const cats=document.getElementById('subscription-categories');
  const search=document.getElementById('subscription-search');
  const grid=document.getElementById('subscription-products');
  const count=document.getElementById('subscription-result-count');
  let products=[], active='ALL';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lang=()=>((typeof UzState!=='undefined'&&UzState.lang)||'en');
  const rates={USD:Number(window.USD_TO_MYR||4.25),CNY:Number(window.CNY_TO_MYR||.59),MYR:1};
  function currency(){return (typeof UzState!=='undefined'&&UzState.currency)||'MYR';}
  function money(p, qty=1){
    const cur=currency(); const supplierCur=String(p.currency||'USD').toUpperCase();
    const base=Number(p.price||0)*(rates[supplierCur]||1)*1.3*qty;
    const out=cur==='MYR'?base:cur==='USD'?base/rates.USD:base/rates.CNY;
    return `${cur==='MYR'?'RM':cur==='USD'?'$':'¥'}${out.toFixed(2)}`;
  }
  function visible(){
    const q=(search.value||'').trim().toLowerCase();
    return products.filter(p=>(active==='ALL'||p.category===active)&&(!q||`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)));
  }
  function iconFor(p){
    const raw=p.icon||p.image||p.logo||p.icon_url||p.image_url||p.thumbnail||p.raw?.icon||p.raw?.image||p.raw?.logo||'';
    if(raw) return `<img src="${esc(raw)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('icon-fallback');this.remove()">`;
    const n=String(p.name||'').toLowerCase();
    const emoji=n.includes('chatgpt')?'💬':n.includes('canva')?'🎨':n.includes('gemini')?'✦':n.includes('youtube')?'▶':n.includes('netflix')?'N':n.includes('spotify')?'♫':n.includes('vpn')?'🛡':n.includes('claude')?'◌':'◈';
    return `<span class="subscription-icon-text">${emoji}</span>`;
  }
  function renderCats(){
    const counts={}; products.forEach(p=>counts[p.category]=(counts[p.category]||0)+1);
    const list=Object.keys(counts).sort((a,b)=>a.localeCompare(b));
    cats.innerHTML=`<button class="subscription-cat ${active==='ALL'?'active':''}" data-cat="ALL"><span>⌂</span><b>${t('smm.all')}</b><em>${products.length}</em></button>`+
      list.map(c=>`<button class="subscription-cat ${active===c?'active':''}" data-cat="${esc(c)}"><span>•</span><b>${esc(c)}</b><em>${counts[c]}</em></button>`).join('');
    cats.querySelectorAll('.subscription-cat').forEach(b=>b.onclick=()=>{active=b.dataset.cat;renderCats();render();});
  }
  function render(){
    const list=visible();
    count.textContent=`${list.length} ${t('smm.available')}`;
    grid.innerHTML=list.slice(0,150).map(p=>`<article class="subscription-product-card">
      <div class="subscription-card-top"><div class="subscription-icon">${iconFor(p)}</div><span class="subscription-id">#${esc(p.id)}</span></div>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.description||t('order.noDescription'))}</p>
      <div class="subscription-card-meta">${p.min===p.max?'':`${esc(p.min)}–${esc(p.max)} ${t('order.quantity')}`} </div>
      <div class="subscription-card-bottom"><div><small>${t('card.price')||'Price'}</small><strong>${money(p)}</strong><span>${t('card.perProduct')||'/ product'}</span></div><button class="subscription-buy" data-id="${esc(p.id)}">${t('smm.orderNow')} <span>→</span></button></div>
    </article>`).join('') || `<div class="subscription-empty">${t('smm.none')}</div>`;
    grid.querySelectorAll('.subscription-buy').forEach(b=>b.onclick=()=>openProduct(products.find(p=>p.id===b.dataset.id)));
    status.textContent=list.length?`${list.length} ${t('smm.available')}`:t('smm.none');
    if(typeof translateDynamicContent==='function')translateDynamicContent();
  }
  function openProduct(p){
    if(!p)return;
    const ov=document.createElement('div'); ov.className='order-modal-overlay open';
    ov.innerHTML=`<div class="order-modal subscription-order-modal"><button class="order-modal-close" aria-label="Close">×</button><div class="subscription-modal-brand"><div class="subscription-icon large">${iconFor(p)}</div><div><div class="subscription-modal-id">#${esc(p.id)}</div><h3>${esc(p.name)}</h3><div class="order-modal-meta">${esc(p.category)}</div></div></div><div class="order-modal-description-wrap"><div class="order-modal-description-title">${t('order.description')}</div><div class="order-modal-description">${esc(p.description||t('order.noDescription'))}</div><div class="order-modal-details">${p.min} – ${p.max} ${t('order.quantity')}</div></div><label>${t('order.quantity')}</label><input id="sub-qty" type="number" min="${p.min}" max="${p.max}" value="${p.min}"><div class="order-modal-total" id="sub-total">${money(p,p.min)}</div><label>${t('order.name')}</label><input id="sub-name" placeholder="Full name"><label>${t('order.email')}</label><input id="sub-email" type="email" placeholder="you@example.com"><button class="btn primary wide" id="sub-pay">${t('order.pay')}</button><div class="order-modal-msg" id="sub-msg"></div></div>`;
    document.body.appendChild(ov);
    const close=()=>ov.remove(); ov.querySelector('.order-modal-close').onclick=close; ov.onclick=e=>{if(e.target===ov)close()};
    const qty=ov.querySelector('#sub-qty'), total=ov.querySelector('#sub-total');
    qty.oninput=()=>{let n=Math.max(Number(p.min)||1,Math.min(Number(p.max)||1e9,Number(qty.value)||Number(p.min)||1));qty.value=n;total.textContent=money(p,n)};
    ov.querySelector('#sub-pay').onclick=async()=>{const msg=ov.querySelector('#sub-msg'),btn=ov.querySelector('#sub-pay');const name=ov.querySelector('#sub-name').value.trim(),email=ov.querySelector('#sub-email').value.trim();if(!name||!email){msg.innerHTML=`<div class="order-modal-error">${t('order.fillAll')}</div>`;return}btn.disabled=true;btn.textContent=t('order.creating');try{const r=await fetch('/api/subscription-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:p.id,quantity:Number(qty.value),name,email})});const j=await r.json();if(j.status==='ok')location.href=j.paymentUrl;else throw new Error(j.msg||'Checkout failed')}catch(e){msg.innerHTML=`<div class="order-modal-error">${esc(e.message)}</div>`;btn.disabled=false;btn.textContent=t('order.pay')}};
  }
  try{
    const r=await fetch('/api/subscriptions?action=products',{headers:{Accept:'application/json'}}),j=await r.json();
    if(!r.ok||j.status==='error')throw new Error(j.msg||'Unable to load products');
    products=j.products||[]; renderCats(); render(); search.oninput=render;
    document.addEventListener('uz:currencychange',render);
    document.addEventListener('uz:langchange',()=>{renderCats();render()});
  }catch(e){status.textContent='Subscription catalogue is temporarily unavailable.';console.error(e)}
})();
