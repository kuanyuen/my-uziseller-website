/* UziSeller Digital Store — APPMMO-inspired marketplace, UziSeller branded. */
(async function(){
  const root=document.getElementById('subscription-app'); if(!root) return;
  const lang=()=>((typeof UzState!=='undefined'&&UzState.lang)||'en');
  const currency=()=>((typeof UzState!=='undefined'&&UzState.currency)||'MYR');
  const t2=(en,zh)=>lang()==='zh'?zh:en;
  const rates={MYR:1,USD:Number(window.USD_TO_MYR||4.04),CNY:Number(window.CNY_TO_MYR||.60),VND:Number(window.VND_TO_MYR||.000156)};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const first=(o,keys,fb='')=>{for(const k of keys)if(o&&o[k]!==undefined&&o[k]!==null&&String(o[k]).trim()!=='')return o[k];return fb};
  const num=(v,fb=0)=>{const n=Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?n:fb};
  const stripHtml=v=>String(v??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();

  const GROUPS=[
    {key:'AI', zh:'AI 工具', en:'AI Tools', icon:'✦', words:['ai','chat gpt','chatgpt','gemini','grok','claude','veo','kling','cursor']},
    {key:'SUPPORT', zh:'实用工具', en:'Support Utilities', icon:'▦', words:['capcut','canva','google one','zoom','adobe','microsoft','office']},
    {key:'ENT', zh:'娱乐订阅', en:'Entertainment', icon:'▶', words:['youtube premium','netflix','spotify','sportify']},
    {key:'VPN', zh:'VPN / 代理', en:'VPN / Proxy', icon:'◈', words:['vpn','proxy','hma','express','pia','surfshark','hotspot']},
    {key:'LEARN', zh:'学习工具', en:'Learning', icon:'▤', words:['quizlet','duolingo','learning']},
    {key:'FB', zh:'Facebook / MMO', en:'Facebook / MMO', icon:'f', words:['facebook','fanpage','bm ','clone','profile','ads','page']},
    {key:'SOCIAL', zh:'社交媒体', en:'Social', icon:'◎', words:['youtube','tiktok','instagram','twitter','telegram','discord','social']},
    {key:'MAIL', zh:'邮箱 / 邮件', en:'Mail', icon:'✉', words:['hotmail','gmail','mail','email','domain']},
    {key:'OTHER', zh:'其他', en:'Other', icon:'•', words:[]}
  ];
  const groupFor=p=>{const hay=`${p.category} ${p.name}`.toLowerCase(); for(const g of GROUPS){if(g.words.some(w=>hay.includes(w))) return g.key;} return 'OTHER';};
  const groupLabel=k=>{const g=GROUPS.find(x=>x.key===k)||GROUPS.at(-1);return lang()==='zh'?g.zh:g.en};
  const groupIcon=k=>(GROUPS.find(x=>x.key===k)||GROUPS.at(-1)).icon;

  const commonMap={
    'công cụ ai':['AI 工具','AI Tools'],'tiện ích hỗ trợ':['实用工具','Support Utilities'],'tiện ích giải trí':['娱乐订阅','Entertainment'],
    'fake ip - vpn - proxy':['VPN / 代理','VPN / Proxy'],'tiện ích học tập':['学习工具','Learning'],'tiện ích fb':['Facebook / MMO','Facebook / MMO'],
    'tiện ích social':['社交媒体','Social'],'tiện ích mail':['邮箱 / 邮件','Mail'],'khác':['其他','Other'],
    'youtube premium':['YouTube Premium','YouTube Premium'],'netflix':['Netflix','Netflix'],'spotify':['Spotify','Spotify'],
    'sportify':['Spotify','Spotify'],'tiktok':['TikTok','TikTok'],'instagram':['Instagram','Instagram'],
    'facebook':['Facebook','Facebook'],'telegram':['Telegram','Telegram'],'discord':['Discord','Discord'],'gmail':['Gmail','Gmail'],
    'hotmail':['Hotmail','Hotmail'],'gmail edu':['Gmail Edu','Gmail Edu'],'gmail domain':['Gmail Domain','Gmail Domain'],
    'chat gpt':['ChatGPT','ChatGPT'],'gemini pro/ultra':['Gemini Pro / Ultra','Gemini Pro / Ultra'],'super grok':['Super Grok','Super Grok'],
    'claude':['Claude','Claude'],'veo 3 ai':['Veo 3 AI','Veo 3 AI'],'kling ai':['Kling AI','Kling AI'],'cursor ai':['Cursor AI','Cursor AI'],
    'capcut pro':['CapCut Pro','CapCut Pro'],'canva pro/edu':['Canva Pro / Edu','Canva Pro / Edu'],'google one':['Google One','Google One'],
    'microsoft office':['Microsoft Office','Microsoft Office'],'youtube':['YouTube','YouTube'],'tiktok v1':['TikTok V1','TikTok V1'],'tiktok vn':['TikTok VN','TikTok VN'],
    'twitter (x )':['Twitter (X)','Twitter (X)'],'hma vpn':['HMA VPN','HMA VPN'],'express vpn':['Express VPN','Express VPN'],
    'pia vpn':['PIA VPN','PIA VPN'],'surfshark vpn':['Surfshark VPN','Surfshark VPN'],'hotspot shield vpn':['Hotspot Shield VPN','Hotspot Shield VPN'],
    'quizlet':['Quizlet','Quizlet'],'duolingo':['Duolingo','Duolingo'],'fanpage':['主页','Fanpage'],'bm':['BM','BM'],
    'clone việt':['越南账号','Vietnam Account'],'clone vip sale':['VIP账号','VIP Account'],'acc toàn cầu':['全球账号','Global Account'],
    'acc việt nam':['越南账号','Vietnam Account'],'acc global':['全球账号','Global Account'],'profile':['个人主页','Profile'],
    'xu trao đổi sub':['兑换订阅币','Exchange Sub Credits'],'xu tương tác chéo':['互动兑换币','Cross-engagement Credits']
  };
  function localize(v){
    let s=String(v??'').replace(/\s+/g,' ').trim(); if(!s) return '';
    const low=s.toLowerCase();
    for(const [k,val] of Object.entries(commonMap)) if(low.includes(k)) {
      s=s.replace(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),lang()==='zh'?val[0]:val[1]);
    }
    const dict=[
      ['tăng bình luận','增加评论'],['tăng like','增加点赞'],['tăng follow','增加粉丝'],['tăng view','增加观看次数'],['tăng sub','增加订阅'],
      ['tăng subscriber','增加订阅者'],['bình luận','评论'],['lượt xem','观看次数'],['lượt thích','点赞'],['người theo dõi','粉丝'],
      ['bài viết','帖子'],['đánh giá','评价'],['độc quyền','独家'],['giá rẻ','价格便宜'],['dạng mới','新版'],['thử nghiệm','测试'],['chính hãng','官方'],
      ['tự động','自动'],['bảo hành','保修'],['toàn cầu','全球'],['quốc tế','国际'],['việt nam','越南'],['tài khoản','账号'],['liên kết','链接']
    ];
    if(lang()==='zh') for(const [a,b] of dict) s=s.replace(new RegExp(a,'ig'),b);
    else {
      const en={'tăng bình luận':'Increase Comments','tăng like':'Increase Likes','tăng follow':'Increase Followers','tăng view':'Increase Views','tăng sub':'Increase Subscribers','tăng subscriber':'Increase Subscribers','bình luận':'Comments','lượt xem':'Views','lượt thích':'Likes','người theo dõi':'Followers','bài viết':'Post','đánh giá':'Reviews','độc quyền':'Exclusive','giá rẻ':'Budget','dạng mới':'New Type','thử nghiệm':'Test','chính hãng':'Official','tự động':'Automatic','bảo hành':'Warranty','toàn cầu':'Global','quốc tế':'International','việt nam':'Vietnam','tài khoản':'Account','liên kết':'Link'};
      for(const [a,b] of Object.entries(en)) s=s.replace(new RegExp(a,'ig'),b);
    }
    return s.replace(/\s{2,}/g,' ').trim();
  }

  let products=[],active='ALL',query='',sort='default',visibleLimit=24;
  function priceFor(p,qty=1){
    const supplierCur=String(p.currency||'VND').toUpperCase();
    const r=rates[supplierCur]||rates.VND;
    const myr=num(p.price,0)*r*(1+Number(window.SUBSCRIPTION_MARKUP_PERCENT||30)/100)*qty;
    const cur=currency();
    const out=cur==='MYR'?myr:cur==='USD'?myr/rates.USD:myr/rates.CNY;
    return `${cur==='MYR'?'RM':cur==='USD'?'$':'¥'}${out.toLocaleString(cur==='CNY'?'zh-CN':'en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  }
  function iconFor(p){const raw=first(p,['icon','icon_url','iconUrl','image','image_url','imageUrl','logo','logo_url','thumbnail','thumb'],first(p.raw||{},['icon','icon_url','image','image_url','logo','thumbnail'],'')); return raw?`<img src="${esc(raw)}" alt="" loading="lazy" onerror="this.remove()">`:`<span>${esc((localize(p.name)||'P').trim().slice(0,1).toUpperCase())}</span>`;}
  const normalize=p=>({id:String(first(p,['id','ID','product_id','productId'],'')),name:String(first(p,['name','title','product_name','productName'],'Product')),category:String(first(p,['category','category_name','categoryName','group','group_name'],'Other')),description:String(first(p,['description','desc','content','detail','details','product_description','productDescription','short_description','shortDescription','info','intro'],'')),icon:String(first(p,['icon','icon_url','iconUrl','image','image_url','imageUrl','logo','logo_url','thumbnail','thumb'],'')),price:num(first(p,['price','Price','selling_price','sale_price','cost','amount','unit_price'],0)),currency:String(first(p,['currency','currency_code','unit'],'VND')).toUpperCase(),min:Math.max(1,num(first(p,['min','minimum','min_amount','min_qty','min_quantity'],1),1)),max:Math.max(1,num(first(p,['max','maximum','max_amount','max_qty','max_quantity'],1),1)),raw:p,group:groupFor(p)});

  function savedOrderIds(){try{return JSON.parse(localStorage.getItem('uz_order_ids')||'[]').filter(Boolean)}catch{return []}}
  function renderShell(){
    const zh=lang()==='zh';
    root.innerHTML=`<div class="shop-market">
      <div class="shop-topbar">
        <div class="shop-brand"><span class="shop-brand-mark">U</span><div><b>UziSeller</b><small>${zh?'数字商品与服务商城':'Digital products & services store'}</small></div></div>
        <div class="shop-top-search"><span>⌕</span><input id="shop-search" type="search" placeholder="${esc(zh?'搜索商品、AI、VPN、Premium、Facebook…':'Search products, AI, VPN, Premium, Facebook…')}" value="${esc(query)}"></div>
        <div class="shop-top-actions"><a href="#products" data-shopnav="products">${zh?'商品':'Products'}</a><a href="order-status.html" data-shopnav="orders">${zh?'我的订单':'My Orders'}</a><a href="https://wa.me/601163630234?text=Hi%20Uziseller" target="_blank" rel="noopener" data-shopnav="support">${zh?'客服':'Support'}</a></div>
      </div>
      <div class="shop-utilitybar">
        <button class="shop-tool active" data-tool="products">▣ <span>${zh?'全部商品':'All Products'}</span></button>
        <button class="shop-tool" data-tool="orders">◷ <span>${zh?'订单查询':'Order History'}</span></button>
        <button class="shop-tool" data-tool="topup">＋ <span>${zh?'付款方式':'Payment'}</span></button>
        <button class="shop-tool" data-tool="affiliate">↗ <span>${zh?'代理合作':'Partner / Agent'}</span></button>
        <button class="shop-tool" data-tool="faq">? <span>FAQ</span></button>
      </div>
      <div class="shop-main-grid">
        <aside class="shop-sidebar"><div class="shop-sidebar-title">${zh?'商品分类':'PRODUCT CATEGORIES'}</div><div id="shop-cats"></div>
          <div class="shop-sidebar-note"><b>${zh?'如何下单':'How to order'}</b><span>${zh?'选择分类 → 查看商品 → 查看详情 → 输入数量 → 付款':'Choose category → view details → select quantity → pay'}</span></div>
        </aside>
        <main class="shop-content">
          <div class="shop-content-toolbar"><div><strong>${zh?'商品':'Products'}</strong><span id="shop-count"></span></div><div class="shop-sort"><button class="shop-sort-btn active" data-sort="default">${zh?'推荐':'Recommended'}</button><button class="shop-sort-btn" data-sort="priceAsc">${zh?'价格低→高':'Price ↑'}</button><button class="shop-sort-btn" data-sort="priceDesc">${zh?'价格高→低':'Price ↓'}</button></div></div>
          <div class="shop-feature-strip"><div><b>${zh?'实时供应商商品目录':'Live supplier catalogue'}</b><span>${zh?'商品资料与库存按照 API 数据更新':'Products and details are synced from supplier API'}</span></div><span class="shop-live-dot">LIVE API</span></div>
          <div id="shop-list"></div>
          <button id="shop-more" class="shop-more">${zh?'加载更多':'Load more'}</button>
        </main>
        <aside class="shop-account"><div class="shop-account-card"><div class="shop-account-head"><span class="shop-account-avatar">U</span><div><b>${zh?'UziSeller 会员中心':'UziSeller Customer'}</b><small>${zh?'访客结算模式':'Guest checkout'}</small></div></div>
          <div class="shop-account-stat"><span>${zh?'订单记录':'Saved orders'}</span><strong id="shop-order-count">0</strong></div>
          <div class="shop-account-actions"><a href="order-status.html">${zh?'查看我的订单':'View my orders'} →</a><a href="https://wa.me/601163630234?text=Hi%20Uziseller" target="_blank" rel="noopener">${zh?'联系客服':'Contact support'} →</a></div>
        </div>
        <div class="shop-info-card"><b>${zh?'付款说明':'Payment'}</b><p>${zh?'下单后通过安全付款页面完成付款。付款成功后系统按订单流程处理。':'Complete payment through the secure checkout page. Orders are processed after payment confirmation.'}</p><span>${zh?'价格包含供应商成本 + 30% 加价':'Customer price includes supplier cost + 30% markup'}</span></div>
        </aside>
      </div>
    </div>`;
    document.getElementById('shop-search').oninput=e=>{query=e.target.value.trim().toLowerCase();visibleLimit=24;renderList()};
    document.querySelectorAll('.shop-sort-btn').forEach(b=>b.onclick=()=>{sort=b.dataset.sort;document.querySelectorAll('.shop-sort-btn').forEach(x=>x.classList.toggle('active',x===b));renderList()});
    document.querySelectorAll('.shop-tool').forEach(b=>b.onclick=()=>handleTool(b.dataset.tool));
    document.getElementById('shop-more').onclick=()=>{visibleLimit+=24;renderList()};
    document.getElementById('shop-order-count').textContent=String(savedOrderIds().length);
  }
  function handleTool(tool){
    if(tool==='products'){document.querySelector('.shop-content')?.scrollIntoView({behavior:'smooth'});return;}
    if(tool==='orders'){location.href='order-status.html';return;}
    if(tool==='affiliate'){location.hash='agent';return;}
    if(tool==='faq'){alert(t2('Please contact UziSeller support for product-specific questions.','如需了解商品详情、保修或购买方式，请联系 UziSeller 客服。'));return;}
    if(tool==='topup'){alert(t2('Payment is completed after checkout through the secure payment page.','付款会在确认订单后通过安全付款页面完成。'));}
  }
  function buildCategories(){
    const counts={}; products.forEach(p=>counts[p.group]=(counts[p.group]||0)+1);
    const all=GROUPS.filter(g=>counts[g.key]).map(g=>[g.key,counts[g.key]]);
    document.getElementById('shop-cats').innerHTML=`<button class="shop-cat ${active==='ALL'?'active':''}" data-cat="ALL"><span>⌂</span><b>${esc(t2('All Products','全部商品'))}</b><em>${products.length}</em></button>`+all.map(([k,n])=>`<button class="shop-cat ${active===k?'active':''}" data-cat="${k}"><span>${esc(groupIcon(k))}</span><b>${esc(groupLabel(k))}</b><em>${n}</em></button>`).join('');
    document.querySelectorAll('.shop-cat').forEach(b=>b.onclick=()=>{active=b.dataset.cat;visibleLimit=24;buildCategories();renderList()});
  }
  function filtered(){
    let list=products.filter(p=>{const ok=active==='ALL'||p.group===active; const hay=`${p.name} ${p.category} ${p.description}`.toLowerCase(); return ok&&(!query||hay.includes(query)||localize(p.name).toLowerCase().includes(query)||localize(p.category).toLowerCase().includes(query));});
    if(sort==='priceAsc') list.sort((a,b)=>Number(a.price)-Number(b.price));
    if(sort==='priceDesc') list.sort((a,b)=>Number(b.price)-Number(a.price));
    return list;
  }
  function renderList(){
    const list=filtered(), shown=list.slice(0,visibleLimit);
    document.getElementById('shop-count').textContent=`${shown.length} / ${list.length} ${t2('available','可选')}`;
    document.getElementById('shop-more').hidden=shown.length>=list.length||!list.length;
    document.getElementById('shop-list').innerHTML=shown.map(p=>`<article class="shop-product-row" data-id="${esc(p.id)}"><div class="shop-product-main"><div class="shop-product-icon">${iconFor(p)}</div><div class="shop-product-copy"><small>#${esc(p.id)} · ${esc(groupLabel(p.group))}</small><h3>${esc(localize(p.name))}</h3><p>${esc(stripHtml(localize(p.description))||t2('Click “View details” to read full product information.','点击「查看详情」读取完整商品资料。'))}</p><div class="shop-meta"><span>${esc(localize(p.category))}</span><span>${esc(p.min)}–${esc(p.max)} ${esc(t2('units','件'))}</span></div></div></div><div class="shop-buy"><div><small>${esc(t2('Selling price','销售价'))}</small><strong>${esc(priceFor(p))}</strong><span>${esc(t2('Supplier + 30%','供应商 +30%'))}</span></div><button data-id="${esc(p.id)}">${esc(t2('View details','查看详情'))} <b>→</b></button></div></article>`).join('')||`<div class="shop-empty"><strong>${esc(t2('No products found.','没有找到商品。'))}</strong><p>${esc(t2('Try another category or keyword.','请尝试其他分类或关键词。'))}</p></div>`;
    document.querySelectorAll('.shop-product-row').forEach(row=>row.onclick=e=>{if(e.target.closest('button'))return;openDetail(products.find(x=>String(x.id)===String(row.dataset.id)))});
    document.querySelectorAll('.shop-buy button').forEach(b=>b.onclick=e=>{e.stopPropagation();openDetail(products.find(x=>String(x.id)===String(b.dataset.id)))});
  }

  const labelMap={name:['Product name','商品名称'],title:['Title','标题'],description:['Description','商品简介'],desc:['Description','商品简介'],content:['Content','商品内容'],detail:['Details','商品详情'],details:['Details','商品详情'],instructions:['Instructions','使用说明'],instruction:['Instructions','使用说明'],usage:['Usage','使用方法'],notice:['Notice','注意事项'],notes:['Notes','备注'],delivery:['Delivery','交付方式'],duration:['Duration','有效期'],period:['Period','周期'],days:['Days','天数'],validity:['Validity','有效期'],warranty:['Warranty','保修'],refund:['Refund policy','退款政策'],after_sales:['After-sales','售后'],stock:['Stock','库存'],inventory:['Inventory','库存'],quantity:['Quantity','数量'],type:['Product type','产品类型'],price:['Price','价格'],currency:['Currency','货币'],min:['Minimum quantity','最少数量'],max:['Maximum quantity','最多数量'],category:['Category','分类'],url:['URL','链接'],link:['Link','链接']};
  const prettyKey=k=>{const m=labelMap[String(k).toLowerCase()];return m? t2(m[0],m[1]) : String(k).replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())};
  function findPayload(raw){const seen=new Set();const walk=n=>{if(!n||typeof n!=='object'||seen.has(n))return null;seen.add(n);if(Array.isArray(n)){for(const x of n){const f=walk(x);if(f)return f}return null} if(['id','ID','product_id','productId'].some(k=>n[k]!==undefined)&&['name','title','product_name','productName','description','desc','content','detail','details'].some(k=>n[k]!==undefined))return n; for(const k of ['data','product','result','item','product_info','productInfo'])if(n[k]!==undefined){const f=walk(n[k]);if(f)return f} for(const v of Object.values(n)){const f=walk(v);if(f)return f}return null};return walk(raw)||{}}
  function rich(v){const s=String(v??'').trim(); if(!s)return ''; if(!/<[a-z][\s\S]*>/i.test(s))return esc(localize(s)).replace(/\n/g,'<br>'); const box=document.createElement('div');box.innerHTML=s;box.querySelectorAll('script,style,iframe,object,embed,form,link,meta').forEach(x=>x.remove());box.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(a=>{const n=a.name.toLowerCase();if(n.startsWith('on')||n==='srcdoc'||(n==='href'&&/^javascript:/i.test(a.value)))el.removeAttribute(a.name)})); return box.innerHTML}
  function flatten(o,p='',out=[]){if(!o||typeof o!=='object')return out;for(const [k,v] of Object.entries(o)){if(/^(api_key|token|password|secret)$/i.test(k)||v===null||v===undefined||v==='')continue;const key=p?`${p}.${k}`:k;if(typeof v==='object')flatten(v,key,out);else out.push([key,String(v)])}return out}
  const skipFields=new Set(['name','title','product_name','productName','description','desc','content','detail','details','product_description','productDescription','full_description','fullDescription','info','intro','instruction','instructions','usage','notice','notes','note','icon','image','logo','thumbnail','price','currency','api_key']);
  function detailRows(d){const rows=flatten(d).filter(([k])=>!skipFields.has(k.split('.')[0]));return rows.map(([k,v])=>`<div class="shop-detail-row"><span>${esc(prettyKey(k))}</span><b>${esc(localize(v))}</b></div>`).join('')||`<div class="shop-no-detail">${esc(t2('Available product information is shown above.','供应商返回的可用商品资料已显示在上方。'))}</div>`}

  async function openDetail(p){
    if(!p)return;
    const ov=document.createElement('div');ov.className='shop-detail-overlay';ov.innerHTML=`<div class="shop-detail-modal"><button class="shop-close">×</button><div class="shop-loading">${esc(t2('Loading product details…','正在读取商品详情…'))}</div></div>`;document.body.appendChild(ov);
    const close=()=>ov.remove();ov.querySelector('.shop-close').onclick=close;ov.onclick=e=>{if(e.target===ov)close()};
    try{
      const r=await fetch(`/api/subscriptions?action=product&product=${encodeURIComponent(p.id)}`,{headers:{Accept:'application/json'}});const j=await r.json();if(!r.ok||j.status==='error')throw new Error(j.msg||'Product details unavailable');
      const d=findPayload(j.data), name=String(first(d,['name','title','product_name','productName'],p.name)), desc=first(d,['description','desc','content','detail','details','product_description','productDescription','full_description','fullDescription','info','intro','instruction','instructions','usage','notice','notes','note'],p.description);
      const data={...p,...d}, min=Math.max(1,num(first(d,['min','minimum','min_qty','min_amount','min_quantity'],p.min),p.min)), max=Math.max(min,num(first(d,['max','maximum','max_qty','max_amount','max_quantity'],p.max),p.max));
      ov.querySelector('.shop-detail-modal').innerHTML=`<button class="shop-close">×</button><div class="shop-detail-hero"><div class="shop-detail-icon">${iconFor(data)}</div><div><small>#${esc(p.id)} · ${esc(groupLabel(p.group))}</small><h2>${esc(localize(name))}</h2><span>${esc(localize(p.category))}</span></div></div>
        <div class="shop-detail-section"><div class="shop-detail-kicker">01 · ${esc(t2('PRODUCT DESCRIPTION','商品说明'))}</div><div class="shop-rich">${rich(desc||t2('No description was returned by the supplier.','供应商没有返回该商品的文字简介。'))}</div></div>
        <div class="shop-detail-section"><div class="shop-detail-kicker">02 · ${esc(t2('PRODUCT INFORMATION','商品详细资料'))}</div><div class="shop-detail-grid">${detailRows(d)}</div></div>
        <div class="shop-buy-panel"><div><small>${esc(t2('Selling price','销售价'))}</small><strong id="shop-total">${esc(priceFor({...p,...d,min,max},min))}</strong><span>${esc(t2('Supplier cost + 30% markup','供应商成本 + 30% 加价'))}</span></div><label>${esc(t2('Quantity','数量'))}<input id="shop-qty" type="number" min="${min}" max="${max}" value="${min}"></label><button id="shop-checkout">${esc(t2('Buy now','立即购买'))} →</button></div>
        <div class="shop-customer"><label>${esc(t2('Your name','您的姓名'))}<input id="shop-name" placeholder="${esc(t2('Full name','姓名'))}"></label><label>${esc(t2('Email','邮箱'))}<input id="shop-email" type="email" placeholder="you@example.com"></label></div><div id="shop-msg"></div>`;
      ov.querySelector('.shop-close').onclick=close;
      const q=ov.querySelector('#shop-qty'), total=ov.querySelector('#shop-total');q.oninput=()=>{const n=Math.max(min,Math.min(max,num(q.value,min)));q.value=n;total.textContent=priceFor({...p,...d,min,max},n)};
      ov.querySelector('#shop-checkout').onclick=async()=>{const btn=ov.querySelector('#shop-checkout'),msg=ov.querySelector('#shop-msg'),name=ov.querySelector('#shop-name').value.trim(),email=ov.querySelector('#shop-email').value.trim();if(!name||!email){msg.innerHTML=`<div class="shop-error">${esc(t2('Please fill in your name and email.','请填写姓名和邮箱。'))}</div>`;return}btn.disabled=true;btn.textContent=t2('Creating payment…','正在创建付款…');try{const rr=await fetch('/api/subscription-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:p.id,quantity:Number(q.value),name,email})});const jj=await rr.json();if(jj.status==='ok'&&jj.paymentUrl){try{const ids=savedOrderIds();ids.unshift(jj.orderId);localStorage.setItem('uz_order_ids',JSON.stringify([...new Set(ids)].slice(0,50)))}catch{} location.href=jj.paymentUrl;return;}throw new Error(jj.msg||t2('Checkout failed','创建付款失败'));}catch(e){msg.innerHTML=`<div class="shop-error">${esc(e.message||t2('Checkout failed','创建付款失败'))}</div>`;btn.disabled=false;btn.textContent=t2('Buy now','立即购买')}};
    }catch(e){ov.querySelector('.shop-detail-modal').innerHTML=`<button class="shop-close">×</button><div class="shop-empty"><strong>${esc(t2('Unable to load product details','无法读取商品详情'))}</strong><p>${esc(e.message)}</p><button class="shop-retry">${esc(t2('Retry','重新读取'))}</button></div>`;ov.querySelector('.shop-close').onclick=close;ov.querySelector('.shop-retry').onclick=()=>{ov.remove();openDetail(p)}}
  }

  renderShell();
  try{
    const r=await fetch('/api/subscriptions?action=products',{headers:{Accept:'application/json'}}),j=await r.json();if(!r.ok||j.status==='error')throw new Error(j.msg||'Catalogue unavailable');products=(j.products||[]).map(normalize).filter(p=>p.id&&p.name);
    buildCategories();renderList();
    document.addEventListener('uz:currencychange',renderList);
    document.addEventListener('uz:langchange',()=>{active='ALL';renderShell();buildCategories();renderList()});
  }catch(e){document.getElementById('shop-list').innerHTML=`<div class="shop-empty"><strong>${esc(t2('Catalogue temporarily unavailable','商品目录暂时无法加载'))}</strong><p>${esc(e.message)}</p></div>`;console.error(e)}
})();
