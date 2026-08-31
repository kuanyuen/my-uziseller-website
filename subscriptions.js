/* UziSeller App Subscriptions — APPMMO direct catalogue/detail storefront. */
(async function(){
  const root=document.getElementById('subscription-app'); if(!root) return;
  const lang=()=>((typeof UzState!=='undefined'&&UzState.lang)||'en');
  const t2=(en,zh)=>lang()==='zh'?zh:en;
  const rates={USD:Number(window.USD_TO_MYR||4.25),CNY:Number(window.CNY_TO_MYR||.59),MYR:1};
  const currency=()=>((typeof UzState!=='undefined'&&UzState.currency)||'MYR');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const text=v=>{if(v===null||v===undefined)return '';if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return String(v);return JSON.stringify(v,null,2)};
  const first=(o,keys,fb='')=>{for(const k of keys)if(o&&o[k]!==undefined&&o[k]!==null&&String(o[k]).trim()!=='')return o[k];return fb};
  const num=(v,fb=0)=>{const n=Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:fb};

  let products=[], active='ALL', query='';
  const priceFor=(p,qty=1)=>{
    const supplierCur=String(p.currency||'USD').toUpperCase();
    const base=num(p.price,0)*(rates[supplierCur]||1)*1.3*qty;
    const cur=currency(); const out=cur==='MYR'?base:cur==='USD'?base/rates.USD:base/rates.CNY;
    return `${cur==='MYR'?'RM':cur==='USD'?'$':'¥'}${out.toFixed(2)}`;
  };
  const iconFor=p=>{
    const raw=first(p,['icon','icon_url','iconUrl','image','image_url','imageUrl','logo','logo_url','thumbnail','thumb'],first(p.raw||{},['icon','icon_url','image','image_url','logo','thumbnail'],''));
    return raw?`<img src="${esc(raw)}" alt="" loading="lazy" onerror="this.style.display='none'">`:`<span class="apmmo-icon-fallback">${esc((p.name||'P').trim().slice(0,1).toUpperCase())}</span>`;
  };
  const normalize=p=>({
    id:String(first(p,['id','ID','product_id','productId'],'')),name:String(first(p,['name','title','product_name','productName'],'Product')),
    category:String(first(p,['category','category_name','categoryName','group','group_name'],'Other')),
    description:String(first(p,['description','desc','content','detail','details','product_description','productDescription','short_description','shortDescription','info','intro'],'')),
    icon:String(first(p,['icon','icon_url','iconUrl','image','image_url','imageUrl','logo','logo_url','thumbnail','thumb'],'')),
    price:num(first(p,['price','Price','selling_price','sale_price','cost','amount','unit_price'],0)),currency:String(first(p,['currency','unit','currency_code'],'USD')),
    min:Math.max(1,num(first(p,['min','minimum','min_amount','min_qty','min_quantity'],1),1)),max:Math.max(1,num(first(p,['max','maximum','max_amount','max_qty','max_quantity'],1),1)),raw:p
  });

  function renderShell(){
    root.innerHTML=`<div class="apmmo-market">
      <div class="apmmo-topbar"><div><b>${esc(t2('App Subscriptions','应用订阅'))}</b><span>${esc(t2('Live products from supplier','供应商实时商品目录'))}</span></div><label class="apmmo-search"><span>⌕</span><input id="apmmo-search" type="search" placeholder="${esc(t2('Search products...','搜索商品...'))}"></label></div>
      <div class="apmmo-body"><aside class="apmmo-sidebar"><div class="apmmo-sidebar-title">${esc(t2('Categories','商品分类'))}</div><div id="apmmo-cats"></div></aside><main class="apmmo-content"><div class="apmmo-content-head"><strong>${esc(t2('Products','商品'))}</strong><span id="apmmo-count"></span></div><div id="apmmo-list"></div></main></div></div>`;
    document.getElementById('apmmo-search').oninput=e=>{query=e.target.value.trim().toLowerCase();renderList()};
  }
  function categories(){
    const map=new Map();products.forEach(p=>map.set(p.category,(map.get(p.category)||0)+1));const cats=[...map.entries()].sort((a,b)=>a[0].localeCompare(b[0]));
    document.getElementById('apmmo-cats').innerHTML=`<button class="apmmo-cat ${active==='ALL'?'active':''}" data-cat="ALL"><span>⌂</span><b>${esc(t2('All','全部'))}</b><em>${products.length}</em></button>`+cats.map(([c,n])=>`<button class="apmmo-cat ${active===c?'active':''}" data-cat="${esc(c)}"><span>•</span><b>${esc(c)}</b><em>${n}</em></button>`).join('');
    document.querySelectorAll('.apmmo-cat').forEach(b=>b.onclick=()=>{active=b.dataset.cat;categories();renderList()});
  }
  function filtered(){return products.filter(p=>{const ok=active==='ALL'||p.category===active;const hay=`${p.name} ${p.category} ${p.description}`.toLowerCase();return ok&&(!query||hay.includes(query))})}
  function renderList(){
    const list=filtered();document.getElementById('apmmo-count').textContent=`${list.length} ${t2('products available','项产品可选')}`;
    document.getElementById('apmmo-list').innerHTML=list.map(p=>`<article class="apmmo-product-row"><div class="apmmo-product-main"><div class="apmmo-product-icon">${iconFor(p)}</div><div class="apmmo-product-copy"><div class="apmmo-product-id">#${esc(p.id)}</div><h3>${esc(p.name)}</h3><p>${esc(p.description||t2('Click View Details to read the supplier information before buying.','点击「查看详情」，先看完整商品资料再购买。'))}</p><div class="apmmo-meta">${esc(p.category)} · ${esc(p.min)}–${esc(p.max)} ${esc(t2('units','件'))}</div></div></div><div class="apmmo-product-buy"><div class="apmmo-price"><small>${esc(t2('Selling price','销售价'))}</small><strong>${priceFor(p)}</strong><span>${esc(t2('Supplier price + 30%','供应商价格 +30%'))}</span></div><button data-id="${esc(p.id)}">${esc(t2('View details','查看详情'))} <b>→</b></button></div></article>`).join('')||`<div class="apmmo-empty"><strong>${esc(t2('No products found.','没有找到商品。'))}</strong><p>${esc(t2('Try another category or keyword.','请尝试其他分类或关键词。'))}</p></div>`;
    document.querySelectorAll('.apmmo-product-buy button').forEach(b=>b.onclick=()=>openDetail(products.find(p=>String(p.id)===String(b.dataset.id))));
  }

  const labelMap={name:['Product name','商品名称'],title:['Title','标题'],description:['Description','商品简介'],desc:['Description','商品简介'],content:['Content','商品内容'],detail:['Details','商品详情'],details:['Details','商品详情'],instructions:['Instructions','使用说明'],instruction:['Instructions','使用说明'],usage:['Usage','使用方法'],use:['Usage','使用方法'],notice:['Notice','注意事项'],notes:['Notes','注意事项'],note:['Note','备注'],delivery:['Delivery','交付方式'],delivery_method:['Delivery method','交付方式'],duration:['Duration','有效期'],period:['Period','周期'],days:['Days','天数'],validity:['Validity','有效期'],warranty:['Warranty','保障'],guarantee:['Guarantee','保证'],refund:['Refund policy','退款政策'],after_sales:['After-sales','售后'],stock:['Stock','库存'],inventory:['Inventory','库存'],quantity:['Quantity','数量'],type:['Product type','产品类型'],product_type:['Product type','产品类型'],price:['Price','价格'],currency:['Currency','货币'],min:['Minimum quantity','最少数量'],max:['Maximum quantity','最大数量'],category:['Category','分类'],url:['URL','链接'],link:['Link','链接']};
  const prettyKey=k=>{const m=labelMap[String(k).toLowerCase()];return m?t2(m[0],m[1]):String(k).replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())};
  function findProductPayload(raw){
    const seen=new Set();
    function walk(node){
      if(!node||typeof node!=='object'||seen.has(node))return null;seen.add(node);
      if(Array.isArray(node)){for(const x of node){const f=walk(x);if(f)return f}return null}
      const hasId=['id','ID','product_id','productId'].some(k=>node[k]!==undefined);
      const hasProductField=['name','title','product_name','productName','description','desc','content','detail','details','product_description','productDescription'].some(k=>node[k]!==undefined);
      if(hasId&&hasProductField)return node;
      for(const k of ['data','product','result','item','product_info','productInfo'])if(node[k]!==undefined){const f=walk(node[k]);if(f)return f}
      for(const v of Object.values(node)){const f=walk(v);if(f)return f}return null;
    }
    return walk(raw)||{};
  }
  function scalarText(v){if(v===null||v===undefined||v==='')return '';if(typeof v==='string')return v;if(typeof v==='number'||typeof v==='boolean')return String(v);if(Array.isArray(v))return v.map(scalarText).filter(Boolean).join('\n');return JSON.stringify(v,null,2)}
  function findDescription(d,p){
    const keys=['description','desc','content','detail','details','product_description','productDescription','full_description','fullDescription','info','intro','instruction','instructions','usage','notice','notes','note'];
    for(const k of keys){const v=d?.[k];if(v!==undefined&&v!==null&&String(v).trim()!=='')return scalarText(v)}
    // Some supplier responses put the useful copy under arbitrary keys. Build a
    // readable description from all text-like fields before declaring it empty.
    const blocks=[];for(const [k,v] of Object.entries(d||{})){if(/api_key|token|password|secret|price|currency|icon|image|logo/i.test(k))continue;const s=scalarText(v);if(s&&s.length>8&&typeof v!=='object')blocks.push(`${prettyKey(k)}\n${s}`)}
    return blocks.join('\n\n')||p.description||'';
  }
  function safeRich(v){
    const s=String(v||'').trim();if(!s)return '';
    if(!/<[a-z][\s\S]*>/i.test(s))return esc(s).replace(/\n/g,'<br>');
    const box=document.createElement('div');box.innerHTML=s;box.querySelectorAll('script,style,iframe,object,embed,form,link,meta').forEach(x=>x.remove());
    box.querySelectorAll('*').forEach(el=>{for(const a of [...el.attributes]){const n=a.name.toLowerCase();if(n.startsWith('on')||n==='style'||n==='srcdoc'||n==='href'&&/^javascript:/i.test(a.value))el.removeAttribute(a.name)}});return box.innerHTML;
  }
  function flatten(obj,prefix='',out=[]){if(!obj||typeof obj!=='object')return out;for(const [k,v] of Object.entries(obj)){if(/^(api_key|token|password|secret)$/i.test(k)||v===null||v===undefined||v==='')continue;const key=prefix?`${prefix}.${k}`:k;if(typeof v==='object')flatten(v,key,out);else out.push([key,scalarText(v)])}return out}
  function detailRows(d){
    const skip=new Set(['name','title','product_name','productName','description','desc','content','detail','details','product_description','productDescription','full_description','fullDescription','info','intro','instruction','instructions','usage','notice','notes','note','icon','image','logo','thumbnail','price','currency','api_key']);
    const rows=flatten(d).filter(([k,v])=>!skip.has(k.split('.')[0]));
    return rows.map(([k,v])=>`<div class="apmmo-detail-row"><span>${esc(prettyKey(k))}</span><b>${esc(v)}</b></div>`).join('')||`<div class="apmmo-no-detail">${esc(t2('All available product information is shown in the description above.','供应商返回的可用商品资料已显示在上方。'))}</div>`;
  }

  async function openDetail(p){
    if(!p)return;const ov=document.createElement('div');ov.className='apmmo-detail-overlay';ov.innerHTML=`<div class="apmmo-detail-modal"><button class="apmmo-close">×</button><div class="apmmo-loading"><i></i><strong>${esc(t2('Loading complete product information…','正在读取完整商品资料…'))}</strong></div></div>`;document.body.appendChild(ov);
    const close=()=>ov.remove();ov.querySelector('.apmmo-close').onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
    try{
      const r=await fetch(`/api/subscriptions?action=product&product=${encodeURIComponent(p.id)}`,{headers:{Accept:'application/json'}});const j=await r.json();if(!r.ok||j.status==='error')throw new Error(j.msg||'Product details unavailable');
      const d=findProductPayload(j.data),name=String(first(d,['name','title','product_name','productName'],p.name)),desc=findDescription(d,p);
      const iconProduct={...p,...d},min=Math.max(1,num(first(d,['min','minimum','min_qty','min_amount','min_quantity'],p.min),p.min)),max=Math.max(min,num(first(d,['max','maximum','max_qty','max_amount','max_quantity'],p.max),p.max));
      ov.querySelector('.apmmo-detail-modal').innerHTML=`<button class="apmmo-close">×</button><div class="apmmo-detail-head"><div class="apmmo-detail-icon">${iconFor(iconProduct)}</div><div><small>#${esc(p.id)}</small><h2>${esc(name)}</h2><span>${esc(String(first(d,['category','category_name','categoryName','group'],p.category)))}</span></div></div>
      <section class="apmmo-detail-section"><div class="apmmo-section-title">01 · ${esc(t2('PRODUCT DESCRIPTION','商品说明'))}</div><h3>${esc(t2('What you are buying','你购买的是什么'))}</h3><div class="apmmo-rich">${safeRich(desc||t2('The supplier returned no text description for this product.','供应商的 API 没有返回文字简介。'))}</div></section>
      <section class="apmmo-detail-section"><div class="apmmo-section-title">02 · ${esc(t2('PRODUCT INFORMATION','商品详细资料'))}</div><div class="apmmo-detail-grid">${detailRows(d)}</div></section>
      <section class="apmmo-order-panel"><div><small>${esc(t2('Selling price','销售价'))}</small><strong id="apmmo-total">${priceFor({...p,...d,min,max},min)}</strong><span>${esc(t2('Supplier price + 30%','供应商价格 +30%'))}</span></div><label>${esc(t2('Quantity','数量'))}<input id="apmmo-qty" type="number" min="${min}" max="${max}" value="${min}"></label><button id="apmmo-checkout">${esc(t2('Continue to checkout','继续下单'))} →</button></section>
      <div class="apmmo-customer"><label>${esc(t2('Your name','您的姓名'))}<input id="apmmo-name" placeholder="${esc(t2('Full name','姓名'))}"></label><label>${esc(t2('Email (for payment receipt)','邮箱（用于接收付款收据）'))}<input id="apmmo-email" type="email" placeholder="you@example.com"></label></div><div id="apmmo-msg"></div>`;
      ov.querySelector('.apmmo-close').onclick=close;const q=ov.querySelector('#apmmo-qty'),total=ov.querySelector('#apmmo-total');q.oninput=()=>{const n=Math.max(min,Math.min(max,num(q.value,min)));q.value=n;total.textContent=priceFor({...p,...d,min,max},n)};
      ov.querySelector('#apmmo-checkout').onclick=async()=>{const msg=ov.querySelector('#apmmo-msg'),btn=ov.querySelector('#apmmo-checkout'),name=ov.querySelector('#apmmo-name').value.trim(),email=ov.querySelector('#apmmo-email').value.trim();if(!name||!email){msg.innerHTML=`<div class="apmmo-error">${esc(t2('Please fill in your name and email.','请填写姓名和邮箱。'))}</div>`;return}btn.disabled=true;btn.textContent=t2('Creating payment…','正在创建付款…');try{const rr=await fetch('/api/subscription-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:p.id,quantity:Number(q.value),name,email})});const jj=await rr.json();if(jj.status==='ok'&&jj.paymentUrl)location.href=jj.paymentUrl;else throw new Error(jj.msg||'Checkout failed')}catch(e){msg.innerHTML=`<div class="apmmo-error">${esc(e.message)}</div>`;btn.disabled=false;btn.textContent=t2('Continue to checkout','继续下单')}};
    }catch(e){ov.querySelector('.apmmo-detail-modal').innerHTML=`<button class="apmmo-close">×</button><div class="apmmo-error-page"><strong>${esc(t2('Unable to load product details','无法读取商品详情'))}</strong><p>${esc(e.message)}</p><button id="apmmo-retry">${esc(t2('Retry','重新读取'))}</button></div>`;ov.querySelector('.apmmo-close').onclick=close;ov.querySelector('#apmmo-retry').onclick=()=>{ov.remove();openDetail(p)}}
  }

  renderShell();
  try{const r=await fetch('/api/subscriptions?action=products',{headers:{Accept:'application/json'}}),j=await r.json();if(!r.ok||j.status==='error')throw new Error(j.msg||'Catalogue unavailable');products=(j.products||[]).map(normalize).filter(p=>p.id&&p.name);categories();renderList();document.addEventListener('uz:currencychange',renderList);document.addEventListener('uz:langchange',()=>{renderShell();categories();renderList()});}
  catch(e){document.getElementById('apmmo-list').innerHTML=`<div class="apmmo-error-page"><strong>${esc(t2('Catalogue temporarily unavailable','商品目录暂时无法加载'))}</strong><p>${esc(e.message)}</p></div>`;console.error(e)}
})();
