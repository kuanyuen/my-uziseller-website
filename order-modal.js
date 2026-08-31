// SMM order review + checkout modal.
// The browser submits service ID + order inputs only; the server re-reads the
// supplier service/pricing before creating the payment bill.
const UzOrderModal = (() => {
  let overlay, currentService, currentPayload;

  const labels = () => {
    const zh = typeof UzState !== 'undefined' && UzState.lang === 'zh';
    return zh ? {
      review:'确认订单', close:'关闭', service:'服务', link:'链接', links:'个链接', quantity:'每个链接数量',
      comments:'评论', schedule:'预约时间', dripfeed:'Dripfeed', runs:'拆分次数', interval:'间隔',
      name:'姓名', email:'邮箱', pay:'确认并前往付款', creating:'正在创建付款…', fill:'请填写姓名和邮箱。',
      error:'无法创建付款。', price:'总计', supplier:'付款成功后将自动提交至供应商。', empty:'—'
    } : {
      review:'Review order', close:'Close', service:'Service', link:'Link', links:'links', quantity:'Quantity per link',
      comments:'Comments', schedule:'Schedule', dripfeed:'Dripfeed', runs:'Runs', interval:'Interval',
      name:'Name', email:'Email', pay:'Confirm & continue to payment', creating:'Creating payment…', fill:'Please enter your name and email.',
      error:'Unable to create payment.', price:'Total', supplier:'After payment, the order is submitted automatically to the supplier.', empty:'—'
    };
  };

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function formatTotal(){
    const currency=(typeof UzState!=='undefined'&&UzState.currency)||'MYR';
    const qty=Number(currentPayload?.quantity||0), links=(currentPayload?.links||[]).length||1;
    const per=Number(currentService?.prices?.[currency]??currentService?.prices?.MYR??0);
    const total=Math.round((per*qty*links/1000)*100)/100;
    const myrEquivalent=currency==='MYR'?total:total*(CURRENCY[currency]?.toMyr||1);
    return typeof formatPrice==='function'?formatPrice(myrEquivalent,currency):`${currency} ${total.toFixed(2)}`;
  }

  function build(){
    overlay=document.createElement('div'); overlay.className='order-modal-overlay';
    overlay.innerHTML=`<div class="smm-review-modal">
      <button class="order-modal-close" aria-label="Close">×</button>
      <div class="smm-review-kicker">UZISELLER · SMM</div>
      <h3 id="om-title"></h3><div id="om-meta" class="smm-review-meta"></div>
      <div id="om-summary" class="smm-review-summary"></div>
      <div class="smm-review-customer">
        <label><span id="om-name-label"></span><input id="om-name" autocomplete="name" placeholder="Full name"></label>
        <label><span id="om-email-label"></span><input id="om-email" type="email" autocomplete="email" placeholder="you@example.com"></label>
      </div>
      <div class="smm-review-footer"><div><small id="om-total-label"></small><strong id="om-total"></strong></div><button class="btn primary" id="om-submit"></button></div>
      <div class="order-modal-msg" id="om-msg"></div>
    </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
    overlay.querySelector('.order-modal-close').addEventListener('click',close);
    overlay.querySelector('#om-submit').addEventListener('click',submit);
    document.addEventListener('uz:currencychange',refresh);
    document.addEventListener('uz:langchange',refresh);
    refresh();
  }

  function refresh(){
    if(!overlay)return; const l=labels();
    overlay.querySelector('#om-name-label').textContent=l.name;
    overlay.querySelector('#om-email-label').textContent=l.email;
    overlay.querySelector('#om-total-label').textContent=l.price;
    overlay.querySelector('#om-submit').textContent=l.pay;
    overlay.querySelector('#om-total').textContent=formatTotal();
    if(currentService){
      overlay.querySelector('#om-title').textContent=currentService.name;
      overlay.querySelector('#om-meta').textContent=`#${currentService.service} · ${currentService.platformLabel} · ${currentService.category||''}`;
      const p=currentPayload||{}, rows=[];
      rows.push([l.link,`${(p.links||[]).length} ${l.links}`]);
      rows.push([l.quantity,Number(p.quantity||0).toLocaleString()]);
      if(p.comments) rows.push([l.comments,`${p.comments.split(/\r?\n/).filter(Boolean).length} lines`]);
      if(p.schedule) rows.push([l.schedule,p.schedule]);
      if(p.dripfeed) rows.push([l.dripfeed,`${l.runs}: ${p.runs||2} · ${l.interval}: ${p.interval||10} min`]);
      overlay.querySelector('#om-summary').innerHTML=rows.map(([a,b])=>`<div><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join('')+`<p class="smm-review-note">${esc(l.supplier)}</p>`;
    }
  }

  function open(service,payload){
    if(!overlay)build(); currentService=service; currentPayload=payload||{};
    overlay.querySelector('#om-name').value=''; overlay.querySelector('#om-email').value=''; overlay.querySelector('#om-msg').innerHTML='';
    const btn=overlay.querySelector('#om-submit'); btn.disabled=false; overlay.classList.add('open'); refresh();
    if(typeof translateDynamicContent==='function')translateDynamicContent();
  }
  function close(){overlay?.classList.remove('open');}

  async function submit(){
    const l=labels(), btn=overlay.querySelector('#om-submit'), msg=overlay.querySelector('#om-msg');
    const body={serviceId:currentService.service,links:currentPayload.links,quantity:currentPayload.quantity,comments:currentPayload.comments||'',schedule:currentPayload.schedule||'',dripfeed:!!currentPayload.dripfeed,runs:Number(currentPayload.runs)||2,interval:Number(currentPayload.interval)||10,name:overlay.querySelector('#om-name').value.trim(),email:overlay.querySelector('#om-email').value.trim()};
    if(!body.name||!body.email){msg.innerHTML=`<div class="order-modal-error">${esc(l.fill)}</div>`;return;}
    btn.disabled=true;btn.textContent=l.creating;msg.innerHTML='';
    try{
      const r=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const j=await r.json(); if(j.status==='ok'&&j.paymentUrl){
        try {
          const ids=JSON.parse(localStorage.getItem('uz_order_ids')||'[]').filter(Boolean);
          ids.unshift(j.orderId); localStorage.setItem('uz_order_ids',JSON.stringify([...new Set(ids)].slice(0,30)));
        } catch {}
        location.href=j.paymentUrl;return;
      }
      throw new Error(j.msg||l.error);
    }catch(e){msg.innerHTML=`<div class="order-modal-error">${esc(e.message||l.error)}</div>`;btn.disabled=false;btn.textContent=l.pay;}
  }
  return {open,close};
})();
