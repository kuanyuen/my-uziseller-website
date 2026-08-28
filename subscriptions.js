// UziSeller App Subscription storefront — live SHOP.APPMMO catalogue.
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
  const tr=(key,en,zh)=> typeof t==='function' ? t(key) : (lang()==='zh'?zh:en);
  const rates={USD:Number(window.USD_TO_MYR||4.25),CNY:Number(window.CNY_TO_MYR||.59),MYR:1};
  function currency(){return (typeof UzState!=='undefined'&&UzState.currency)||'MYR'}
  function money(p,qty=1){
    const cur=currency(), supplierCur=String(p.currency||'USD').toUpperCase();
    const base=Number(p.price||0)*(rates[supplierCur]||1)*1.3*qty;
    const out=cur==='MYR'?base:cur==='USD'?base/rates.USD:base/rates.CNY;
    return `${cur==='MYR'?'RM':cur==='USD'?'$':'¥'}${out.toFixed(2)}`;
  }
  function visible(){
    const q=(search.value||'').trim().toLowerCase();
    return products.filter(p=>(active==='ALL'||p.category===active)&&(!q||`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)));
  }
  function iconFor(p,large=false){
    const raw=p.icon||p.image||p.logo||p.icon_url||p.image_url||p.thumbnail||p.raw?.icon||p.raw?.image||p.raw?.logo||'';
    if(raw) return `<img src="${esc(raw)}" alt="" loading="lazy" onerror="this.parentElement.classList.add('icon-fallback');this.remove()">`;
    const n=String(p.name||'').toLowerCase();
    const emoji=n.includes('chatgpt')?'◉':n.includes('canva')?'◈':n.includes('gemini')?'✦':n.includes('youtube')?'▶':n.includes('netflix')?'N':n.includes('spotify')?'♫':n.includes('vpn')?'🛡':n.includes('claude')?'◌':'◈';
    return `<span class="subscription-icon-text">${emoji}</span>`;
  }
  function renderCats(){
    const set=[...new Set(products.map(p=>String(p.category||'').trim()).filter(Boolean))];
    const list=set.sort((a,b)=>a.localeCompare(b));
    cats.innerHTML=`<button class="subscription-chip ${active==='ALL'?'active':''}" data-cat="ALL">${esc(tr('smm.all','All','全部'))}<em>${products.length}</em></button>`+
      list.map(c=>`<button class="subscription-chip ${active===c?'active':''}" data-cat="${esc(c)}">${esc(c)}<em>${products.filter(p=>p.category===c).length}</em></button>`).join('');
    cats.querySelectorAll('.subscription-chip').forEach(b=>b.onclick=()=>{active=b.dataset.cat;renderCats();render();});
  }
  function render(){
    const list=visible();
    count.textContent=`${list.length} ${tr('smm.available','products available','项产品可选')}`;
    grid.innerHTML=list.slice(0,150).map(p=>{
      const desc=String(p.description||'').trim();
      const range=p.min||p.max ? `${esc(p.min||1)}${p.max&&p.max!==p.min?`–${esc(p.max)}`:''} ${esc(tr('order.quantity','quantity','数量'))}` : '';
      return `<article class="subscription-product-card">
        <div class="subscription-card-top"><div class="subscription-icon">${iconFor(p)}</div><span class="subscription-id">#${esc(p.id)}</span></div>
        <div class="subscription-card-category">${esc(p.category||tr('subs.digitalProduct','Digital Product','数字产品'))}</div>
        <h3>${esc(p.name)}</h3>
        <p class="subscription-card-description">${esc(desc||tr('order.noDescription','Product details are available after opening the product.','点击查看详情获取完整商品资料。'))}</p>
        <div class="subscription-card-facts">${range?`<span>▣ ${range}</span>`:''}<span>✓ ${esc(tr('subs.liveProduct','Live product','实时商品'))}</span></div>
        <div class="subscription-card-bottom"><div><small>${esc(tr('card.price','Selling price','销售价'))}</small><strong>${money(p)}</strong><span>${esc(tr('subs.afterMarkup','30% margin included','已含30%加价'))}</span></div><button class="subscription-buy" data-id="${esc(p.id)}">${esc(tr('subs.viewBuy','Details & Buy','详情并购买'))} <b>→</b></button></div>
      </article>`;
    }).join('') || `<div class="subscription-empty"><div>⌕</div><strong>${esc(tr('smm.none','No products found.','没有找到符合条件的产品。'))}</strong><p>${esc(tr('subs.trySearch','Try another keyword or category.','请尝试其他关键词或分类。'))}</p></div>`;
    grid.querySelectorAll('.subscription-buy').forEach(b=>b.onclick=()=>openProduct(products.find(p=>String(p.id)===String(b.dataset.id))));
    status.textContent=`${list.length} ${tr('smm.available','products available','项产品可选')}`;
  }
  function pick(obj,keys,fb=''){for(const k of keys){if(obj&&obj[k]!==undefined&&obj[k]!==null&&String(obj[k]).trim()!=='')return obj[k]}return fb}
  function normalizeDetail(raw,p){
    let d=raw?.data??raw?.product??raw;
    if(Array.isArray(d)) d=d[0]||{};
    if(!d||typeof d!=='object') d={};
    return {
      name:String(pick(d,['name','title','product_name','productName'],p.name)),
      description:String(pick(d,['description','desc','content','details','detail','product_description','info'],p.description||'')),
      instructions:String(pick(d,['instructions','instruction','how_to_use','usage','use','notice','notes','note'],'')),
      delivery:String(pick(d,['delivery','delivery_method','deliver','delivery_type'],'')),
      duration:String(pick(d,['duration','period','days','validity','valid_for'],'')),
      warranty:String(pick(d,['warranty','guarantee','refund','after_sales'],'')),
      stock:String(pick(d,['stock','inventory','available','quantity'],'')),
      type:String(pick(d,['type','product_type','service_type'],'')),
      min:pick(d,['min','minimum','min_qty','min_amount'],p.min),
      max:pick(d,['max','maximum','max_qty','max_amount'],p.max),
      price:Number(pick(d,['price','Price','selling_price','sale_price','cost','amount'],p.price))||p.price,
      raw:d
    };
  }
  function detailRow(label,value){return value!==undefined&&value!==null&&String(value).trim()!==''?`<div class="subscription-detail-row"><span>${esc(label)}</span><b>${esc(value)}</b></div>`:''}
  async function openProduct(p){
    if(!p)return;
    const ov=document.createElement('div'); ov.className='order-modal-overlay open subscription-detail-overlay';
    ov.innerHTML=`<div class="order-modal subscription-detail-modal"><button class="order-modal-close" aria-label="Close">×</button><div class="subscription-detail-loading"><div class="subscription-spinner"></div><strong>${esc(tr('subs.loadingDetails','Loading product details…','正在读取商品详情…'))}</strong></div></div>`;
    document.body.appendChild(ov);
    const close=()=>ov.remove(); ov.querySelector('.order-modal-close').onclick=close; ov.onclick=e=>{if(e.target===ov)close()};
    try{
      const r=await fetch(`/api/subscriptions?action=product&product=${encodeURIComponent(p.id)}`,{headers:{Accept:'application/json'}}); const j=await r.json();
      if(!r.ok||j.status==='error')throw new Error(j.msg||'Unable to load product details');
      const d=normalizeDetail(j,p);
      const description=d.description||tr('order.noDescription','The supplier did not provide a full description. Please contact us before ordering if you need clarification.','供应商没有提供完整简介。如需确认产品用途，请在下单前联系我们。');
      const details=[detailRow(tr('subs.category','Category','产品分类'),p.category),detailRow(tr('subs.delivery','Delivery','交付方式'),d.delivery),detailRow(tr('subs.duration','Validity','有效期'),d.duration),detailRow(tr('subs.warranty','Warranty','售后/保障'),d.warranty),detailRow(tr('subs.stock','Availability','库存/可用数量'),d.stock),detailRow(tr('subs.type','Product type','产品类型'),d.type)].join('');
      const range=`${esc(d.min||1)}${d.max&&String(d.max)!==String(d.min)?` – ${esc(d.max)}`:''}`;
      ov.querySelector('.subscription-detail-modal').innerHTML=`
        <button class="order-modal-close" aria-label="Close">×</button>
        <div class="subscription-detail-hero"><div class="subscription-icon large">${iconFor(p)}</div><div><div class="subscription-modal-id">#${esc(p.id)}</div><h2>${esc(d.name)}</h2><div class="subscription-detail-category">${esc(p.category||tr('subs.digitalProduct','Digital Product','数字产品'))}</div></div></div>
        <section class="subscription-detail-section"><div class="subscription-section-label">01 · ${esc(tr('subs.whatYouGet','WHAT YOU GET','商品说明'))}</div><h3>${esc(tr('subs.productPurpose','Product purpose & details','产品用途与详细资料'))}</h3><div class="subscription-description-rich">${esc(description).replace(/\n/g,'<br>')}</div></section>
        ${d.instructions?`<section class="subscription-detail-section"><div class="subscription-section-label">02 · ${esc(tr('subs.howToUse','HOW TO USE','使用说明'))}</div><h3>${esc(tr('subs.instructions','Instructions / Notes','使用方法 / 注意事项'))}</h3><div class="subscription-description-rich">${esc(d.instructions).replace(/\n/g,'<br>')}</div></section>`:''}
        <section class="subscription-detail-section"><div class="subscription-section-label">${d.instructions?'03':'02'} · ${esc(tr('subs.productInfo','PRODUCT INFO','产品信息'))}</div><div class="subscription-detail-grid">${details}${detailRow(tr('subs.quantityRange','Quantity range','购买数量'),range)}</div></section>
        <section class="subscription-buy-panel"><div><small>${esc(tr('subs.sellingPrice','Selling price','销售价'))}</small><strong id="sub-total">${money(p,p.min||1)}</strong><span>${esc(tr('subs.markupNote','Supplier price + 30%','供应商价格 +30%'))}</span></div><div class="subscription-qty"><label>${esc(tr('order.quantity','Quantity','数量'))}</label><input id="sub-qty" type="number" min="${esc(p.min||1)}" max="${esc(p.max||999999)}" value="${esc(p.min||1)}"></div><button class="subscription-confirm-buy" id="sub-pay">${esc(tr('subs.continueCheckout','Continue to checkout','继续下单'))} →</button></section>
        <div class="subscription-customer-form"><div><label>${esc(tr('order.name','Your name','您的姓名'))}</label><input id="sub-name" placeholder="${esc(tr('subs.namePlaceholder','Your full name','您的姓名'))}"></div><div><label>${esc(tr('order.email','Email (for payment receipt)','邮箱（用于接收付款收据）'))}</label><input id="sub-email" type="email" placeholder="you@example.com"></div></div><div class="order-modal-msg" id="sub-msg"></div>`;
      ov.querySelector('.order-modal-close').onclick=close;
      const qty=ov.querySelector('#sub-qty'), total=ov.querySelector('#sub-total');
      qty.oninput=()=>{let n=Math.max(Number(p.min)||1,Math.min(Number(p.max)||999999,Number(qty.value)||Number(p.min)||1));qty.value=n;total.textContent=money(p,n)};
      ov.querySelector('#sub-pay').onclick=async()=>{const msg=ov.querySelector('#sub-msg'),btn=ov.querySelector('#sub-pay');const name=ov.querySelector('#sub-name').value.trim(),email=ov.querySelector('#sub-email').value.trim();if(!name||!email){msg.innerHTML=`<div class="order-modal-error">${esc(tr('order.fillAll','Please fill in all fields.','请填写所有栏位。'))}</div>`;return}btn.disabled=true;btn.textContent=tr('order.creating','Creating payment…','正在创建付款…');try{const r=await fetch('/api/subscription-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:p.id,quantity:Number(qty.value),name,email})});const j=await r.json();if(j.status==='ok')location.href=j.paymentUrl;else throw new Error(j.msg||'Checkout failed')}catch(e){msg.innerHTML=`<div class="order-modal-error">${esc(e.message)}</div>`;btn.disabled=false;btn.textContent=tr('subs.continueCheckout','Continue to checkout','继续下单')}};
    }catch(e){ov.querySelector('.subscription-detail-modal').innerHTML=`<button class="order-modal-close" aria-label="Close">×</button><div class="subscription-detail-error"><strong>${esc(tr('subs.detailError','Unable to load full product details','暂时无法读取完整商品详情'))}</strong><p>${esc(e.message)}</p><button class="btn primary" id="detail-retry">${esc(tr('subs.retry','Retry','重试'))}</button></div>`;ov.querySelector('.order-modal-close').onclick=close;ov.querySelector('#detail-retry').onclick=()=>{ov.remove();openProduct(p)}}
  }
  try{
    const r=await fetch('/api/subscriptions?action=products',{headers:{Accept:'application/json'}}),j=await r.json();
    if(!r.ok||j.status==='error')throw new Error(j.msg||'Unable to load products');
    products=j.products||[]; renderCats(); render(); search.oninput=render;
    document.addEventListener('uz:currencychange',render); document.addEventListener('uz:langchange',()=>{renderCats();render()});
  }catch(e){status.textContent=tr('subs.catalogError','Subscription catalogue is temporarily unavailable.','应用订阅目录暂时无法加载。');console.error(e)}
})();
