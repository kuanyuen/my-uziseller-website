// Order modal — opened from any "Order Now" button on the SMM catalogue.
// Collects link + quantity + contact info, shows a live price in the
// currently selected currency, then posts to /api/checkout and redirects
// to the Billplz payment page it returns.
const UzOrderModal = (() => {
  let overlay, panel, currentService;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'order-modal-overlay';
    overlay.innerHTML = `
      <div class="order-modal">
        <button class="order-modal-close" aria-label="Close">×</button>
        <h3 id="om-title">Order</h3>
        <div class="order-modal-meta" id="om-meta"></div>

        <label data-i18n="order.link">Link / target (profile or page URL)</label>
        <input id="om-link" placeholder="https://...">

        <label data-i18n="order.quantity">Quantity</label>
        <input id="om-qty" type="number">
        <div class="order-modal-hint" id="om-qty-hint"></div>

        <div class="order-modal-total" id="om-total">RM0.00</div>

        <label data-i18n="order.name">Your name</label>
        <input id="om-name" placeholder="Full name">

        <label data-i18n="order.email">Email (for payment receipt)</label>
        <input id="om-email" type="email" placeholder="you@example.com">

        <button class="btn primary wide" id="om-submit" data-i18n="order.pay">Pay with Billplz →</button>
        <div class="order-modal-msg" id="om-msg"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.order-modal-close').addEventListener('click', close);
    overlay.querySelector('#om-qty').addEventListener('input', updateTotal);
    overlay.querySelector('#om-submit').addEventListener('click', submit);
    document.addEventListener('uz:currencychange', updateTotal);
    if (typeof applyLanguage === 'function' && typeof UzState !== 'undefined') applyLanguage(UzState.lang);
  }

  function updateTotal() {
    if (!currentService) return;
    const currency = (typeof UzState !== 'undefined' && UzState.currency) || 'MYR';
    const qty = Number(overlay.querySelector('#om-qty').value) || 0;
    const unitPrice = currentService.prices[currency] ?? currentService.prices.MYR;
    const total = Math.round((unitPrice * qty / 1000) * 100) / 100;
    overlay.querySelector('#om-total').textContent =
      (typeof formatPrice === 'function' ? formatPrice(total * (currency === 'MYR' ? 1 : (CURRENCY[currency]?.toMyr || 1)), currency) : `${currency} ${total.toFixed(2)}`);
  }

  function open(service) {
    if (!overlay) build();
    currentService = service;
    overlay.querySelector('#om-title').textContent = service.name;
    overlay.querySelector('#om-meta').textContent = `${service.platformLabel} · Min ${service.min.toLocaleString()} · Max ${service.max.toLocaleString()}`;
    const qtyInput = overlay.querySelector('#om-qty');
    qtyInput.value = service.min || 1;
    qtyInput.min = service.min || 1;
    qtyInput.max = service.max || '';
    overlay.querySelector('#om-qty-hint').textContent = `Min ${service.min || 1}, Max ${service.max || '—'}`;
    overlay.querySelector('#om-link').value = '';
    overlay.querySelector('#om-name').value = '';
    overlay.querySelector('#om-email').value = '';
    overlay.querySelector('#om-msg').innerHTML = '';
    const btn = overlay.querySelector('#om-submit');
    btn.disabled = false;
    btn.textContent = (typeof I18N !== 'undefined' && typeof UzState !== 'undefined') ? (I18N['order.pay'][UzState.lang] || I18N['order.pay'].en) : 'Pay with Billplz →';
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
      msg.innerHTML = '<div class="order-modal-error">Please fill in all fields.</div>';
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Creating payment…';
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
        msg.innerHTML = `<div class="order-modal-error">${j.msg || 'Something went wrong.'}</div>`;
        btn.disabled = false;
        btn.textContent = 'Pay with Billplz →';
      }
    } catch (e) {
      msg.innerHTML = '<div class="order-modal-error">Network error. Please try again.</div>';
      btn.disabled = false;
      btn.textContent = 'Pay with Billplz →';
    }
  }

  return { open, close };
})();
