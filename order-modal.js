// Order modal — opened from any "Order Now" button on the SMM catalogue.
// Collects link + quantity + contact info, shows a live price in the
// currently selected currency, then posts to /api/checkout and redirects
// to the Billplz payment page it returns.
const UzOrderModal = (() => {
  let overlay, currentService;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'order-modal-overlay';
    overlay.innerHTML = `
      <div class="order-modal">
        <button class="order-modal-close" aria-label="Close">×</button>
        <h3 id="om-title">Order</h3>
        <div class="order-modal-meta" id="om-meta"></div>

        <label id="om-label-link"></label>
        <input id="om-link" placeholder="https://...">

        <label id="om-label-qty"></label>
        <input id="om-qty" type="number">
        <div class="order-modal-hint" id="om-qty-hint"></div>

        <div class="order-modal-total" id="om-total">RM0.00</div>

        <label id="om-label-name"></label>
        <input id="om-name" placeholder="Full name">

        <label id="om-label-email"></label>
        <input id="om-email" type="email" placeholder="you@example.com">

        <button class="btn primary wide" id="om-submit"></button>
        <div class="order-modal-msg" id="om-msg"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.order-modal-close').addEventListener('click', close);
    overlay.querySelector('#om-qty').addEventListener('input', updateTotal);
    overlay.querySelector('#om-submit').addEventListener('click', submit);
    document.addEventListener('uz:currencychange', updateTotal);
    document.addEventListener('uz:langchange', refreshText);
    refreshText();
  }

  // Re-applies every translated string in the modal — called on build,
  // language change, and whenever a service is opened.
  function refreshText() {
    if (!overlay) return;
    overlay.querySelector('#om-label-link').textContent = t('order.link');
    overlay.querySelector('#om-label-qty').textContent = t('order.quantity');
    overlay.querySelector('#om-label-name').textContent = t('order.name');
    overlay.querySelector('#om-label-email').textContent = t('order.email');
    const btn = overlay.querySelector('#om-submit');
    if (!btn.disabled) btn.textContent = t('order.pay');
    if (currentService) {
      overlay.querySelector('#om-meta').textContent =
        `${currentService.platformLabel} · ${t('order.minMax', { min: currentService.min.toLocaleString(), max: currentService.max.toLocaleString() })}`;
      overlay.querySelector('#om-qty-hint').textContent =
        t('order.minMax', { min: currentService.min || 1, max: currentService.max || '—' });
    }
  }

  function updateTotal() {
    if (!currentService) return;
    const currency = (typeof UzState !== 'undefined' && UzState.currency) || 'MYR';
    const qty = Number(overlay.querySelector('#om-qty').value) || 0;
    const unitPrice = currentService.prices[currency] ?? currentService.prices.MYR;
    const total = Math.round((unitPrice * qty / 1000) * 100) / 100;
    // formatPrice expects an MYR base amount and converts internally, so
    // convert our already-per-currency total back to an MYR-equivalent first.
    const asMyrEquivalent = currency === 'MYR' ? total : total * (CURRENCY[currency]?.toMyr || 1);
    overlay.querySelector('#om-total').textContent = formatPrice(asMyrEquivalent, currency);
  }

  function open(service) {
    if (!overlay) build();
    currentService = service;
    overlay.querySelector('#om-title').textContent = service.name;
    const qtyInput = overlay.querySelector('#om-qty');
    qtyInput.value = service.min || 1;
    qtyInput.min = service.min || 1;
    qtyInput.max = service.max || '';
    overlay.querySelector('#om-link').value = '';
    overlay.querySelector('#om-name').value = '';
    overlay.querySelector('#om-email').value = '';
    overlay.querySelector('#om-msg').innerHTML = '';
    const btn = overlay.querySelector('#om-submit');
    btn.disabled = false;
    refreshText();
    updateTotal();
    overlay.classList.add('open');
  }

  function close() {
    overlay?.classList.remove('open');
  }

  async function submit() {
    const msg = overlay.querySelector('#om-msg');
    const btn = overlay.querySelector('#om-submit');
    const body = {
      serviceId: currentService.service,
      link: overlay.querySelector('#om-link').value.trim(),
      quantity: overlay.querySelector('#om-qty').value,
      name: overlay.querySelector('#om-name').value.trim(),
      email: overlay.querySelector('#om-email').value.trim()
    };
    if (!body.link || !body.name || !body.email) {
      msg.innerHTML = `<div class="order-modal-error">${t('order.fillAll')}</div>`;
      return;
    }
    btn.disabled = true;
    btn.textContent = t('order.creating');
    msg.innerHTML = '';
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (j.status === 'ok' && j.paymentUrl) {
        location.href = j.paymentUrl;
      } else {
        msg.innerHTML = `<div class="order-modal-error">${j.msg || t('order.genericError')}</div>`;
        btn.disabled = false;
        btn.textContent = t('order.pay');
      }
    } catch (e) {
      msg.innerHTML = `<div class="order-modal-error">${t('order.networkError')}</div>`;
      btn.disabled = false;
      btn.textContent = t('order.pay');
    }
  }

  return { open, close };
})();
