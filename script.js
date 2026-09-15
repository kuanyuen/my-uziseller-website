// UziSeller SMM storefront — customer UI modeled closely on the supplier's
// order flow while keeping UziSeller branding, pricing, and checkout.
(async function loadSmmPanel(){
  const root = document.getElementById('tab-smm');
  if (!root) return;

  const $ = id => document.getElementById(id);
  const els = {
    status: $('smm-status'), search: $('smm-search'), searchBtn: $('smm-search-btn'), clearBtn: $('smm-clear-btn'),
    platforms: $('smm-platforms'), platformSelect: $('smm-platform-select'), categorySelect: $('smm-category-select'),
    serviceSelect: $('smm-service-select'), detail: $('smm-service-detail'), link: $('smm-link'), linkHint: $('smm-link-hint'),
    multiToggle: $('smm-multi-toggle'), commentsWrap: $('smm-comments-wrap'), comments: $('smm-comments'),
    qty: $('smm-qty'), qtyHint: $('smm-qty-hint'), scheduleToggle: $('smm-schedule-toggle'), schedule: $('smm-schedule'),
    dripToggle: $('smm-dripfeed-toggle'), dripCap: $('smm-dripfeed-cap'), dripOptions: $('smm-dripfeed-options'),
    runs: $('smm-runs'), interval: $('smm-interval'), total: $('smm-total'), review: $('smm-review-btn'),
    resultCount: $('smm-result-count'), list: $('smm-services'), loadMore: $('smm-load-more')
  };
  if (!els.serviceSelect || !els.list) return;

  let services = [];
  let activePlatform = 'ALL';
  let activeCategory = 'ALL';
  let selectedServiceId = '';
  let query = '';
  let visibleLimit = 40;
  let multiMode = false;

  const L = {
    en: {
      all:'All', searchPlaceholder:'Enter service name or ID to search quickly', searching:'Searching', loading:'Loading services…',
      available:'services available', platform:'Platform', category:'Category', service:'Service', rate1000:'Price / 1000', markup:'Markup', selectPlatform:'Select platform',
      selectCategory:'Select category', selectService:'Select service', orderTitle:'Quick order', minMax:'Min {min} · Max {max}',
      noDescription:'The supplier did not return a description for this service.', type:'Type', avg:'Average time', refill:'Refill',
      cancel:'Cancel', dripfeed:'Dripfeed', yes:'Yes', no:'No', notSupported:'Not supported', orderNow:'Order now', choose:'Choose',
      link:'Link to boost', singleLink:'One link', multiLink:'Multiple links', linkHintOne:'Paste one target URL.',
      linkHintMany:'One target URL per line. Each link will use the same quantity and be charged separately.', comments:'Comments',
      commentsHint:'For comment services, enter one comment per line.', quantity:'Quantity', schedule:'Schedule', optional:'Optional',
      scheduleHint:'Only use when this service/provider accepts scheduled orders.', drip:'Split order (Dripfeed)', runs:'Number of runs',
      interval:'Interval (minutes)', orderValue:'Order value', tax:'No extra display-page tax', review:'Review & continue to payment',
      catalogue:'Service catalogue', catalogueHint:'Click a service to select it and fill the order form.', loadMore:'Load more services',
      count:'{n} shown · {total} total', noResult:'No services found', try:'Try another platform, category, or keyword.',
      details:'Service details', searchBtn:'Search', clear:'Clear', noticeTitle:'How to order', notice1:'Choose platform → category → service, then review the full service details.',
      notice2:'Payment is settled in MYR.', notice3:'After payment is confirmed, the order is submitted automatically to the supplier.',
      orderStatus:'Order status', support:'Support', backProducts:'Products',
      serviceInfoKicker:'SERVICE INFO', serviceInfoTitle:'Service information', serviceInfoLive:'LIVE API',
      selectServiceHint:'Select a service to view its full details.', serviceId:'Service ID', serviceName:'Service name',
      serviceType:'Service type', completion:'Completion time', limits:'Quantity limits', pricePer1000:'Price / 1000',
      capabilities:'Capabilities', global:'Global service'
    },
    zh: {
      all:'全部', searchPlaceholder:'输入服务名称或 ID 进行快速搜索', searching:'搜索中', loading:'正在加载服务…',
      available:'项服务可选', platform:'平台', category:'分类', service:'服务', rate1000:'每 1000 价格', markup:'加价', selectPlatform:'选择平台',
      selectCategory:'选择分类', selectService:'选择服务', orderTitle:'快速下单', minMax:'最低 {min} · 最高 {max}',
      noDescription:'供应商没有返回该服务的简介。', type:'服务类型', avg:'平均完成时间', refill:'补充', cancel:'取消',
      dripfeed:'Dripfeed', yes:'支持', no:'不支持', notSupported:'不支持', orderNow:'立即下单', choose:'选择',
      link:'需要增加互动的链接', singleLink:'单个链接', multiLink:'多个链接', linkHintOne:'请输入一个目标链接。',
      linkHintMany:'每行一个目标链接；每个链接使用相同数量，系统按链接数量计算订单金额。', comments:'评论内容',
      commentsHint:'评论类服务请每行输入一条评论。', quantity:'数量', schedule:'预约执行', optional:'可选',
      scheduleHint:'仅在该服务/供应商支持预约时使用。', drip:'拆分订单（Dripfeed）', runs:'拆分成多少单',
      interval:'每单间隔（分钟）', orderValue:'订单金额', tax:'展示页不另外收取税费', review:'确认订单并继续付款',
      catalogue:'服务目录', catalogueHint:'点击服务即可选中并自动填入上方下单表单。', loadMore:'加载更多服务',
      count:'显示 {n} / 共 {total}', noResult:'没有找到符合条件的服务', try:'请更换平台、分类或关键词。', details:'服务详情',
      searchBtn:'搜索', clear:'清除', noticeTitle:'下单说明', notice1:'选择平台 → 分类 → 服务，然后查看完整服务详情。',
      notice2:'付款统一按 MYR 结算。', notice3:'付款确认后，系统会自动将订单提交到上游供应商。',
      orderStatus:'订单查询', support:'客服', backProducts:'商品',
      serviceInfoKicker:'SERVICE INFO', serviceInfoTitle:'服务信息', serviceInfoLive:'实时 API',
      selectServiceHint:'请选择一个服务查看详细资料。', serviceId:'服务 ID', serviceName:'服务名称',
      serviceType:'服务类型', completion:'完成时间', limits:'数量限制', pricePer1000:'每千元价格',
      capabilities:'服务功能', global:'全球服务'
    }
  };
  const lang = () => (typeof UzState !== 'undefined' && UzState.lang === 'zh') ? 'zh' : 'en';
  const t = k => L[lang()][k] || L.en[k] || k;
  const tf = (k, vars={}) => String(t(k)).replace(/\{(\w+)\}/g,(_,x)=>vars[x] ?? '');
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = v => String(v || '').trim().toLowerCase();
  const currentCurrency = () => (typeof UzState !== 'undefined' && UzState.currency) || 'MYR';
  const platformIcon = p => ({Facebook:'f',TikTok:'♪',Instagram:'◎',YouTube:'▶',Threads:'@',Telegram:'✈', 'Twitter/X':'X',Spotify:'●',Shopee:'S', 'Website/SEO':'⌁'}[p] || '•');

  function visible(){
    const q = normalize(query);
    return services.filter(s => {
      if (activePlatform !== 'ALL' && s.platformLabel !== activePlatform) return false;
      if (activeCategory !== 'ALL' && s.category !== activeCategory) return false;
      if (!q) return true;
      return normalize(`${s.service} ${s.name} ${s.category} ${s.platformLabel} ${s.description} ${s.type}`).includes(q);
    });
  }

  function serviceById(id){ return services.find(s => String(s.service) === String(id)) || null; }

  function categoriesForPlatform(platform){
    const set = new Map();
    services.forEach(s => {
      if (platform !== 'ALL' && s.platformLabel !== platform) return;
      const c = s.category || 'Other'; set.set(c, (set.get(c)||0)+1);
    });
    return [...set.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
  }

  function localizeText(text){
    if (typeof localizeServiceText === 'function') return localizeServiceText(text, lang());
    return String(text ?? '').replace(/\s+/g,' ').trim();
  }
  function localizeDesc(text){
    if (typeof localizeServiceDescription === 'function') return localizeServiceDescription(text, lang());
    return localizeText(text);
  }
  function localizePlatform(text){
    if (typeof localizePlatformLabel === 'function') return localizePlatformLabel(text, lang());
    return String(text ?? '');
  }

  function rebuildSelect(select, options, placeholder, selected){
    select.innerHTML = [`<option value="ALL">${esc(placeholder)}</option>`, ...options.map(([value,count])=>`<option value="${esc(value)}">${esc(localizeText(value))} (${count})</option>`)].join('');
    if (selected && options.some(x=>x[0]===selected)) select.value = selected; else select.value = 'ALL';
  }

  function renderPlatformSide(){
    const counts = {}; services.forEach(s=>counts[s.platformLabel]=(counts[s.platformLabel]||0)+1);
    const priority = ['Facebook','TikTok','Instagram','YouTube','Threads','Telegram','Twitter/X','Shopee','Spotify','Website/SEO'];
    const ordered = [...priority.filter(p=>counts[p]), ...Object.keys(counts).filter(p=>!priority.includes(p)).sort()];
    const all = [['ALL',services.length], ...ordered.map(p=>[p,counts[p]])];
    els.platforms.innerHTML = all.map(([p,c]) => `<button type="button" class="smm-platform ${activePlatform===p?'active':''}" data-platform="${esc(p)}"><span>${p==='ALL'?'⌂':platformIcon(p)}</span><b>${esc(p==='ALL'?t('all'):localizePlatform(p))}</b><em>${c}</em></button>`).join('');
    els.platforms.querySelectorAll('.smm-platform').forEach(btn=>btn.addEventListener('click',()=>{
      activePlatform = btn.dataset.platform; activeCategory='ALL'; selectedServiceId='';
      rebuildSelect(els.platformSelect, ordered.map(p=>[p,counts[p]]), t('selectPlatform'), activePlatform);
      rebuildSelect(els.categorySelect, categoriesForPlatform(activePlatform), t('selectCategory'), 'ALL');
      rebuildServiceSelect(); renderList(); resetFormForSelection();
    }));

    const platformOptions = [['Facebook',counts.Facebook],['TikTok',counts.TikTok],['Instagram',counts.Instagram],['YouTube',counts.YouTube],['Threads',counts.Threads],['Telegram',counts.Telegram],['Twitter/X',counts['Twitter/X']],['Shopee',counts.Shopee],['Spotify',counts.Spotify],['Website/SEO',counts['Website/SEO']], ...Object.keys(counts).filter(p=>!priority.includes(p)).sort().map(p=>[p,counts[p]])].filter(x=>x[1]);
    rebuildSelect(els.platformSelect, platformOptions, t('selectPlatform'), activePlatform);
    rebuildSelect(els.categorySelect, categoriesForPlatform(activePlatform), t('selectCategory'), activeCategory);
  }

  function rebuildServiceSelect(){
    const pool = services.filter(s => (activePlatform==='ALL'||s.platformLabel===activePlatform) && (activeCategory==='ALL'||s.category===activeCategory));
    const byName = pool.slice().sort((a,b)=>String(a.name).localeCompare(String(b.name)));
    els.serviceSelect.innerHTML = [`<option value="">${esc(t('selectService'))}</option>`, ...byName.map(s=>`<option value="${esc(s.service)}">#${esc(s.service)} · ${esc(localizeText(s.name))}</option>`)].join('');
    if (selectedServiceId && byName.some(s=>String(s.service)===String(selectedServiceId))) els.serviceSelect.value = selectedServiceId;
  }

  function serviceDescription(service){
    if (!service) return `<div class="smm-detail-empty">${esc(t('selectServiceHint'))}</div>`;
    const currency = currentCurrency();
    const price = service.prices?.[currency] ?? service.prices?.MYR ?? 0;
    const type = service.type || 'Default';
    const min = Number(service.min || 0);
    const max = Number(service.max || 0);
    const avg = service.averageTime || '—';
    const capabilities = [];
    if (service.refill) capabilities.push(t('refill'));
    if (service.cancel) capabilities.push(t('cancel'));
    if (service.dripfeed) capabilities.push(t('dripfeed'));
    if (!capabilities.length) capabilities.push(t('global'));
    return `<div class="smm-side-service-title">
        <div class="smm-detail-icon">${esc(platformIcon(service.platformLabel))}</div>
        <div class="smm-side-service-copy">
          <small>#${esc(service.service)} · ${esc(localizePlatform(service.platformLabel))} · ${esc(localizeText(service.category))}</small>
          <h4>${esc(localizeText(service.name))}</h4>
        </div>
      </div>
      <div class="smm-side-rows">
        <div class="smm-side-row"><span>${esc(t('serviceId'))}</span><b>${esc(service.service)}</b></div>
        <div class="smm-side-row"><span>${esc(t('serviceName'))}</span><b>${esc(localizeText(service.name))}</b></div>
        <div class="smm-side-row"><span>${esc(t('serviceType'))}</span><b><em class="smm-type-pill">${esc(localizeText(type))}</em></b></div>
        <div class="smm-side-row"><span>${esc(t('completion'))}</span><b class="smm-green">${esc(localizeText(avg))}</b></div>
        <div class="smm-side-row"><span>${esc(t('limits'))}</span><b>${min.toLocaleString()} - ${max.toLocaleString()}</b></div>
        <div class="smm-side-row smm-price-row"><span>${esc(t('pricePer1000'))}</span><b>${esc(formatCustomerPrice(price, currency))}</b></div>
      </div>
      <div class="smm-side-cap-wrap">
        <span>${esc(t('capabilities'))}</span>
        <div class="smm-badges">${capabilities.map(x=>`<span class="smm-badge good">${esc(x)}</span>`).join('')}</div>
      </div>
      <div class="smm-detail-desc"><strong>${esc(t('details'))}</strong><p>${esc(localizeDesc(service.description || t('noDescription')) || t('noDescription'))}</p></div>`;
  }

  function formatCustomerPrice(amount, currency){
    const cur = currency || currentCurrency();
    if (cur === 'MYR') return `RM ${Number(amount||0).toLocaleString('en-MY',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
    if (cur === 'USD') return `$ ${Number(amount||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
    if (cur === 'CNY') return `¥ ${Number(amount||0).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
    return `${cur} ${Number(amount||0).toFixed(2)}`;
  }

  function formatPricePer1000(service){
    const cur = currentCurrency();
    const n = Number(service?.prices?.[cur] ?? service?.prices?.MYR ?? 0);
    return typeof formatPrice==='function' ? formatPrice(cur==='MYR'?n:n*(CURRENCY[cur]?.toMyr||1),cur) : `${cur} ${n.toFixed(2)}`;
  }

  function totalFor(service){
    if (!service) return 0;
    const qty = Math.max(0, Number(els.qty.value)||0);
    const count = multiMode ? els.link.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).length : 1;
    const per1000 = Number(service.prices?.[currentCurrency()] ?? 0);
    return Math.round((per1000 * qty * count / 1000) * 100) / 100;
  }

  function displayTotal(service){
    const cur=currentCurrency(); const total=totalFor(service);
    const myrEquivalent = cur==='MYR'?total:total*(CURRENCY[cur]?.toMyr||1);
    els.total.textContent = typeof formatPrice==='function' ? formatPrice(myrEquivalent,cur) : `${cur} ${total.toFixed(2)}`;
  }

  function isCommentService(service){
    return /comment|评论|reply|回复/i.test(`${service?.name||''} ${service?.category||''} ${service?.type||''}`);
  }

  function resetFormForSelection(){
    const s = serviceById(selectedServiceId);
    if (!s) { els.detail.innerHTML = `<div class="smm-detail-empty">${esc(t('selectServiceHint'))}</div>`; return; }
    els.detail.innerHTML = serviceDescription(s);
    const min=Number(s.min||1), max=Number(s.max||0);
    els.qty.min=min; if(max) els.qty.max=max; els.qty.value=min;
    els.qtyHint.textContent=tf('minMax',{min:min.toLocaleString(),max:max?max.toLocaleString():'—'});
    els.commentsWrap.hidden=!isCommentService(s);
    const supported=!!s.dripfeed; els.dripToggle.disabled=!supported; els.dripCap.textContent=supported?t('yes'):t('notSupported');
    if(!supported){els.dripToggle.checked=false;els.dripOptions.hidden=true;}
    els.linkHint.textContent = multiMode?t('linkHintMany'):t('linkHintOne');
    displayTotal(s);
  }

  function renderList(){
    const pool=visible();
    els.resultCount.textContent=tf('count',{n:Math.min(visibleLimit,pool.length),total:pool.length});
    els.status.textContent=`${pool.length} ${t('available')}${query?` · ${t('searching')} “${esc(query)}”`:''}`;
    const page=pool.slice(0,visibleLimit);
    els.list.innerHTML=page.map(s=>`<article class="smm-service-row ${String(s.service)===String(selectedServiceId)?'selected':''}" data-id="${esc(s.service)}">
      <div class="smm-row-main"><div class="smm-row-icon">${esc(platformIcon(s.platformLabel))}</div><div class="smm-row-copy"><small>#${esc(s.service)} · ${esc(localizePlatform(s.platformLabel))} · ${esc(localizeText(s.category))}</small><h4>${esc(localizeText(s.name))}</h4><p>${esc(localizeDesc(s.description||t('noDescription'))||t('noDescription'))}</p><div class="smm-row-meta"><span>${esc(t('minMax'))}: ${Number(s.min||0).toLocaleString()}–${Number(s.max||0).toLocaleString()}</span>${s.refill?`<span>${esc(t('refill'))}</span>`:''}${s.cancel?`<span>${esc(t('cancel'))}</span>`:''}${s.dripfeed?`<span>${esc(t('dripfeed'))}</span>`:''}</div></div></div>
      <div class="smm-row-price"><small>${esc(t('orderValue'))}/1000</small><strong>${esc(formatPricePer1000(s))}</strong><button type="button" class="smm-row-btn" data-id="${esc(s.service)}">${esc(t('choose'))} →</button></div>
    </article>`).join('') || `<div class="smm-empty"> <strong>${esc(t('noResult'))}</strong><span>${esc(t('try'))}</span></div>`;
    els.list.querySelectorAll('[data-id]').forEach(node=>node.addEventListener('click',()=>selectService(node.dataset.id)));
    els.loadMore.hidden=pool.length<=visibleLimit;
    els.loadMore.textContent=`${t('loadMore')} (${Math.max(0,Math.min(40,pool.length-visibleLimit))})`;
  }

  function selectService(id){
    const s=serviceById(id); if(!s) return;
    selectedServiceId=String(s.service); activePlatform=s.platformLabel; activeCategory=s.category; query='';
    els.search.value='';
    renderPlatformSide(); rebuildServiceSelect(); els.serviceSelect.value=selectedServiceId; resetFormForSelection(); renderList();
    els.detail.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function applySearch(){ query=(els.search.value||'').trim(); activePlatform='ALL'; activeCategory='ALL'; selectedServiceId=''; renderPlatformSide(); rebuildServiceSelect(); els.serviceSelect.value=''; resetFormForSelection(); renderList(); els.list.scrollIntoView({behavior:'smooth',block:'nearest'}); }

  function refreshText(){
    root.querySelectorAll('[data-smm]').forEach(node=>{const key=node.dataset.smm; if(L.en[key]||L.zh[key]) node.textContent=t(key);});
    els.search.placeholder=t('searchPlaceholder'); els.comments.placeholder=lang()==='zh'?'每行一条评论':'One comment per line';
    els.link.placeholder='https://...'; els.linkHint.textContent=multiMode?t('linkHintMany'):t('linkHintOne');
    renderPlatformSide(); rebuildServiceSelect(); resetFormForSelection(); renderList();
  }

  // Events
  els.platformSelect.addEventListener('change',()=>{
    activePlatform=els.platformSelect.value; activeCategory='ALL'; selectedServiceId='';
    rebuildSelect(els.categorySelect,categoriesForPlatform(activePlatform),t('selectCategory'),'ALL'); rebuildServiceSelect(); resetFormForSelection(); renderPlatformSide(); renderList();
  });
  els.categorySelect.addEventListener('change',()=>{
    activeCategory=els.categorySelect.value; selectedServiceId=''; rebuildServiceSelect(); resetFormForSelection(); renderPlatformSide(); renderList();
  });
  els.serviceSelect.addEventListener('change',()=>{selectedServiceId=els.serviceSelect.value;resetFormForSelection();renderList();});
  els.qty.addEventListener('input',()=>displayTotal(serviceById(selectedServiceId)));
  els.link.addEventListener('input',()=>displayTotal(serviceById(selectedServiceId)));
  els.searchBtn.addEventListener('click',applySearch);
  els.search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();applySearch();}});
  els.clearBtn.addEventListener('click',()=>{els.search.value='';query='';activePlatform='ALL';activeCategory='ALL';selectedServiceId='';renderPlatformSide();rebuildServiceSelect();resetFormForSelection();renderList();els.search.focus();});
  els.loadMore.addEventListener('click',()=>{visibleLimit+=40;renderList();});
  els.multiToggle.addEventListener('click',()=>{multiMode=!multiMode;els.multiToggle.classList.toggle('active',multiMode);els.multiToggle.textContent=multiMode?t('singleLink'):t('multiLink');els.linkHint.textContent=multiMode?t('linkHintMany'):t('linkHintOne');displayTotal(serviceById(selectedServiceId));});
  els.scheduleToggle.addEventListener('change',()=>{els.schedule.disabled=!els.scheduleToggle.checked;});
  els.dripToggle.addEventListener('change',()=>{els.dripOptions.hidden=!els.dripToggle.checked;});
  [els.runs,els.interval,els.schedule].forEach(el=>el.addEventListener('input',()=>displayTotal(serviceById(selectedServiceId))));
  els.review.addEventListener('click',()=>{
    const s=serviceById(selectedServiceId); if(!s){alert(lang()==='zh'?'请先选择服务。':'Please select a service first.');return;}
    const links=els.link.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const qty=Number(els.qty.value);
    if(!links.length){alert(lang()==='zh'?'请输入目标链接。':'Please enter a target link.');return;}
    if(!multiMode && links.length>1){alert(lang()==='zh'?'单链接模式只能输入一个链接。':'Single-link mode accepts one link only.');return;}
    if(!Number.isFinite(qty)||qty<Number(s.min||1)||(s.max&&qty>Number(s.max))){alert(tf('minMax',{min:Number(s.min||1).toLocaleString(),max:Number(s.max||0).toLocaleString()}));return;}
    if(els.dripToggle.checked && !s.dripfeed){alert(t('notSupported'));return;}
    UzOrderModal.open(s,{links,quantity:qty,comments:els.comments.value.trim(),schedule:els.scheduleToggle.checked?els.schedule.value:'',dripfeed:els.dripToggle.checked,runs:Number(els.runs.value)||2,interval:Number(els.interval.value)||10});
  });

  document.addEventListener('uz:currencychange',()=>{resetFormForSelection();renderList();});
  document.addEventListener('uz:langchange',refreshText);

  try{
    const r=await fetch('/api/smm?action=services',{headers:{Accept:'application/json'}});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||data.msg||'Unable to load services');
    services=Array.isArray(data.services)?data.services:[];
    if(!services.length) throw new Error('The supplier returned no services');
    refreshText();
  }catch(e){
    els.status.textContent=`${t('noResult')}: ${e.message}`;
    els.list.innerHTML=`<div class="smm-empty"><strong>${esc(t('noResult'))}</strong><span>${esc(e.message||'')}</span></div>`;
    els.loadMore.hidden=true;
    console.error(e);
  }
})();
