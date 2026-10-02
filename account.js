// UziSeller customer account UI — login/register modal + session helpers.
const UzAccount = (() => {
  let overlay;
  let fnSendTimer;
  const TOKEN_KEY = "uz_account_token";
  const NAME_KEY = "uz_account_name";
  const EMAIL_KEY = "uz_account_email";

  function t(zh, en) {
    return (typeof UzState !== "undefined" && UzState.lang === "zh") ? zh : en;
  }
  const authCopy = {
    "auth.login": ["登录", "Sign in"],
    "auth.register": ["创建账户", "Create account"],
    "auth.email": ["电子邮件", "Email"],
    "auth.password": ["密码", "Password"],
    "auth.forgotPassword": ["忘记密码？", "Forgot password?"],
    "auth.resetSent": ["如果该邮箱已注册，验证码将发送到邮箱。", "If an account exists for that email, a verification code will be sent."],
    "auth.name": ["姓名（可选）", "Name (optional)"],
    "auth.passwordHint": ["密码至少 6 位", "Password (min 6 chars)"],
    "auth.resetHint": ["输入注册邮箱，我们会发送验证码。", "Enter your registered email and we will send a code."],
    "auth.sendCode": ["发送验证码", "Send code"],
    "auth.verificationCode": ["验证码", "Verification code"],
    "auth.newPassword": ["新密码（至少 6 位）", "New password (min 6 chars)"],
    "auth.resetPassword": ["重置密码", "Reset password"],
    "auth.backLogin": ["← 返回登录", "← Back to sign in"],
    "auth.loginNote": ["注册后即可查看充值和订单记录。", "Create an account to view your top-ups and orders."],
    "auth.customerZone": ["UZISELLER · 客户中心", "UZISELLER · CUSTOMER ZONE"],
    "auth.sideTitle": ["让每一次订单都更有掌控感", "Everything for your growth, in one place."],
    "auth.sideDescription": ["安全管理账户、充值余额和订单记录，随时掌握服务进度。", "Manage your account, balance and orders with a clear, secure customer space."],
    "auth.orders": ["订单与账户同步", "Orders in sync"],
    "auth.ordersNote": ["登录后快速查看历史订单和状态。", "See order history and live status after signing in."],
    "auth.securePayments": ["安全付款体验", "Secure payments"],
    "auth.securePaymentsNote": ["充值和付款流程由安全支付系统处理。", "Top-ups and payments are handled securely."],
    "auth.online": ["系统在线 · 支持快速响应", "System online · Fast support"],
    "auth.stepAccount": ["账户", "Account"],
    "auth.stepSecurity": ["安全", "Security"],
    "auth.stepReady": ["完成", "Ready"]
  };
  function copy(key) {
    const value = authCopy[key];
    if (!value) return key;
    return value[typeof UzState !== "undefined" && UzState.lang === "zh" ? 0 : 1];
  }
  function esc(v) { return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }

  function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; } }
  function getEmail() { try { return localStorage.getItem(EMAIL_KEY) || ""; } catch { return ""; } }
  function getName() { try { return localStorage.getItem(NAME_KEY) || ""; } catch { return ""; } }
  function isLoggedIn() { return !!getToken(); }

  function setSession(token, name, email) {
    try { localStorage.setItem(TOKEN_KEY, token || ""); localStorage.setItem(NAME_KEY, name || ""); localStorage.setItem(EMAIL_KEY, email || ""); } catch {}
  }
  function clearSession() {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(NAME_KEY); localStorage.removeItem(EMAIL_KEY); } catch {}
  }

  async function getEmailFromServer() {
    try {
      const r = await fetch("/api/account?action=me", { headers: authHeaders() });
      const j = await r.json();
      if (j.status === "ok" && j.user?.email) {
        setSession(getToken(), j.user?.name || j.user?.email || "", j.user?.email || "");
        return { email: j.user.email, name: j.user.name };
      }
    } catch {}
    return {};
  }

  function authHeaders(extra) {
    const base = { "Content-Type": "application/json", ...(extra || {}) };
    const token = getToken();
    if (token) base["Authorization"] = "Bearer " + token;
    return base;
  }

  function showToast(msg) {
    let el = document.getElementById("uz-account-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "uz-account-toast";
      el.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#20231f;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.25);transition:opacity .3s ease;";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(el._timer);
    el._timer = setTimeout(() => { el.style.opacity = "0"; }, 3000);
  }

  function build() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "uz-account-overlay";
    overlay.style.display = "none";
    overlay.innerHTML = `
      <div class="uz-account-modal">
        <button class="uz-account-close" aria-label="Close">&times;</button>
        <div class="uz-account-form-side">
        <a class="uz-auth-brand" href="#top" aria-label="UziSeller home"><img src="assets/logo-mark.png" alt=""><span>Uzi<span>Seller</span></span></a>
        <div class="uz-auth-intro">
          <h1 data-auth-title>${t("登录您的账户", "Welcome back")}</h1>
          <p data-auth-subtitle>${t("登录后即可查看余额、充值记录与订单进度。", "Sign in to manage your balance, top-ups and orders.")}</p>
        </div>
        <div class="uz-auth-steps" aria-hidden="true">
          <span class="active"><i>1</i><b data-auth-copy="auth.stepAccount">${copy("auth.stepAccount")}</b></span><em></em>
          <span><i>2</i><b data-auth-copy="auth.stepSecurity">${copy("auth.stepSecurity")}</b></span><em></em>
          <span><i>3</i><b data-auth-copy="auth.stepReady">${copy("auth.stepReady")}</b></span>
        </div>
        <div class="uz-account-head">
          <div class="uz-account-tabs">
            <button class="uz-tab uz-tab-login active" data-tab="login" data-auth-copy="auth.login">${copy("auth.login")}</button>
            <button class="uz-tab uz-tab-register" data-tab="register" data-auth-copy="auth.register">${copy("auth.register")}</button>
          </div>
        </div>
        <div class="uz-account-body">
          <div class="uz-pane uz-pane-login">
            <a href="order-status.html" class="uz-account-link uz-my-orders" style="display:none">${t("我的订单", "My orders")} →</a>
            <label><span data-auth-copy="auth.email">${copy("auth.email")}</span><input class="uz-input" type="email" id="uz-login-email" autocomplete="email" placeholder="you@example.com"></label>
            <label><span data-auth-copy="auth.password">${copy("auth.password")}</span><input class="uz-input" type="password" id="uz-login-password" autocomplete="current-password" placeholder="••••••••"></label>
            <p class="uz-account-forgot-row"><a href="#" class="uz-account-link" data-uz-forgot-password data-auth-copy="auth.forgotPassword">${copy("auth.forgotPassword")}</a></p>
            <button class="uz-btn" id="uz-login-submit" data-auth-copy="auth.login">${copy("auth.login")}</button>
            <p class="uz-account-note" data-auth-copy="auth.loginNote">${copy("auth.loginNote")}</p>
          </div>
          <div class="uz-pane uz-pane-register" style="display:none">
            <label><span data-auth-copy="auth.name">${copy("auth.name")}</span><input class="uz-input" type="text" id="uz-reg-name" autocomplete="name" placeholder="Your name"></label>
            <label><span data-auth-copy="auth.email">${copy("auth.email")}</span><input class="uz-input" type="email" id="uz-reg-email" autocomplete="email" placeholder="you@example.com"></label>
            <label><span data-auth-copy="auth.passwordHint">${copy("auth.passwordHint")}</span><input class="uz-input" type="password" id="uz-reg-password" autocomplete="new-password" placeholder="••••••••"></label>
            <button class="uz-btn" id="uz-reg-submit" data-auth-copy="auth.register">${copy("auth.register")}</button>
          </div>
          <div class="uz-pane uz-pane-reset" style="display:none">
            <p class="uz-account-hint" data-auth-copy="auth.resetHint">${copy("auth.resetHint")}</p>
            <label><span data-auth-copy="auth.email">${copy("auth.email")}</span><input class="uz-input" type="email" id="uz-reset-email" autocomplete="email" placeholder="you@example.com"></label>
            <button class="uz-btn uz-btn-ghost" id="uz-reset-sendcode" data-auth-copy="auth.sendCode">${copy("auth.sendCode")}</button>
            <label><span data-auth-copy="auth.verificationCode">${copy("auth.verificationCode")}</span><input class="uz-input" type="text" id="uz-reset-code" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"></label>
            <label><span data-auth-copy="auth.newPassword">${copy("auth.newPassword")}</span><input class="uz-input" type="password" id="uz-reset-password" autocomplete="new-password" placeholder="••••••••"></label>
            <button class="uz-btn" id="uz-reset-submit" data-auth-copy="auth.resetPassword">${copy("auth.resetPassword")}</button>
            <p class="uz-account-linkrow"><a href="#" data-uz-back-login class="uz-account-link" data-auth-copy="auth.backLogin">${copy("auth.backLogin")}</a></p>
          </div>
          <div class="uz-account-msg" id="uz-account-msg"></div>
        </div>
        </div>
        <aside class="uz-account-side">
          <div class="uz-account-side-orb"></div>
          <span class="uz-account-side-kicker" data-auth-copy="auth.customerZone">${copy("auth.customerZone")}</span>
          <h2 data-auth-copy="auth.sideTitle">${copy("auth.sideTitle")}</h2>
          <p data-auth-copy="auth.sideDescription">${copy("auth.sideDescription")}</p>
          <div class="uz-account-benefit"><span>✦</span><div><b data-auth-copy="auth.orders">${copy("auth.orders")}</b><small data-auth-copy="auth.ordersNote">${copy("auth.ordersNote")}</small></div></div>
          <div class="uz-account-benefit"><span>◈</span><div><b data-auth-copy="auth.securePayments">${copy("auth.securePayments")}</b><small data-auth-copy="auth.securePaymentsNote">${copy("auth.securePaymentsNote")}</small></div></div>
          <div class="uz-account-signal"><i></i><span data-auth-copy="auth.online">${copy("auth.online")}</span></div>
        </aside>
      </div>`;
    document.body.appendChild(overlay);
    const dashboard = document.createElement("div");
    dashboard.className = "uz-account-dashboard";
    dashboard.innerHTML = `
      <div class="uz-dashboard-card">
        <button class="uz-dashboard-close" aria-label="Close">&times;</button>
        <div class="uz-dashboard-heading">
          <div class="uz-dashboard-avatar"><span data-dashboard-initial>U</span></div>
          <div><span class="uz-dashboard-kicker">${t("客户中心", "CUSTOMER CENTRE")}</span><h2 data-dashboard-name>${t("我的账户", "My account")}</h2><p data-dashboard-email></p></div>
        </div>
        <div class="uz-wallet-summary">
          <div><span>${t("账户余额", "Available balance")}</span><strong data-wallet-balance>RM0.00</strong></div>
          <button class="uz-topup-button" data-wallet-topup>${t("充值", "Top up")}</button>
        </div>
        <div class="uz-topup-options" hidden>
          <span>${t("选择充值金额", "Choose top-up amount")}</span>
          <div class="uz-topup-grid">${[10, 30, 50, 100].map(amount => `<button data-topup-amount="${amount}">RM${amount}</button>`).join("")}</div>
          <div class="uz-topup-custom"><input type="number" min="1" max="10000" step="0.01" placeholder="RM custom amount"><button data-topup-custom>${t("继续付款", "Continue")}</button></div>
          <small>${t("付款将通过 Billplz 安全处理，成功后余额自动到账。", "Payment is securely processed by Billplz and credited automatically after confirmation.")}</small>
        </div>
        <div class="uz-dashboard-columns">
          <section><div class="uz-dashboard-section-title"><h3>${t("充值记录", "Top-up history")}</h3><span data-wallet-total>RM0.00</span></div><div data-wallet-history class="uz-dashboard-list"></div></section>
          <section><div class="uz-dashboard-section-title"><h3>${t("我的订单", "My orders")}</h3><a href="order-status.html">${t("查看全部", "View all")} →</a></div><div data-account-orders class="uz-dashboard-list"></div></section>
        </div>
        <button class="uz-dashboard-logout" data-dashboard-logout>${t("退出登录", "Sign out")}</button>
      </div>`;
    document.body.appendChild(dashboard);
    dashboard.addEventListener("click", e => { if (e.target === dashboard || e.target.closest(".uz-dashboard-close")) dashboard.classList.remove("open"); });
    dashboard.querySelector("[data-dashboard-logout]").onclick = () => { dashboard.classList.remove("open"); logout(); };
    dashboard.querySelector("[data-wallet-topup]").onclick = () => {
      const options = dashboard.querySelector(".uz-topup-options");
      options.hidden = !options.hidden;
    };
    dashboard.querySelectorAll("[data-topup-amount]").forEach(button => button.onclick = () => startTopup(Number(button.dataset.topupAmount)));
    dashboard.querySelector("[data-topup-custom]").onclick = () => startTopup(Number(dashboard.querySelector(".uz-topup-custom input").value));
    dashboard._load = () => loadDashboard(dashboard);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    overlay.querySelector(".uz-account-close").addEventListener("click", close);
    overlay.querySelectorAll(".uz-tab").forEach(btn => btn.onclick = () => switchTab(btn.dataset.tab));
    document.addEventListener("uz:langchange", refreshAuthLanguage);

    // Bind click events
    overlay.querySelector("#uz-login-submit").onclick = login;
    overlay.querySelector("#uz-reg-submit").onclick = register;
    overlay.querySelector("#uz-reset-sendcode").onclick = () => sendCode("reset");
    overlay.querySelector("#uz-reset-submit").onclick = reset;
    overlay.querySelector("[data-uz-forgot-password]").onclick = (e) => {
      e.preventDefault();
      overlay.querySelector("#uz-reset-email").value = overlay.querySelector("#uz-login-email").value.trim();
      switchTab("reset");
    };
    overlay.querySelector("[data-uz-back-login]").onclick = (e) => { e.preventDefault(); switchTab("login"); };

    // Support pressing Enter key in input fields to submit automatically
    overlay.querySelectorAll(".uz-pane-login input").forEach(input => {
      input.addEventListener("keydown", e => { if (e.key === "Enter") login(); });
    });
    overlay.querySelectorAll(".uz-pane-register input").forEach(input => {
      input.addEventListener("keydown", e => { if (e.key === "Enter") register(); });
    });
    overlay.querySelectorAll(".uz-pane-reset input").forEach(input => {
      input.addEventListener("keydown", e => { if (e.key === "Enter") reset(); });
    });

    document.addEventListener("click", e => {
      if (e.target.closest("[data-uz-account-logout]")) logout();
    });
  }

  async function startTopup(amountMYR) {
    if (!Number.isFinite(amountMYR) || amountMYR < 1 || amountMYR > 10000) {
      showToast(t("充值金额必须是 RM1 至 RM10,000。", "Top-up amount must be between RM1 and RM10,000."));
      return;
    }
    try {
      const response = await fetch("/api/wallet", { method: "POST", headers: authHeaders(), body: JSON.stringify({ amountMYR }) });
      const result = await response.json();
      if (!response.ok || result.status !== "ok") throw new Error(result.msg || "Unable to create payment");
      window.location.href = result.paymentUrl;
    } catch (error) {
      showToast(error.message || t("无法创建充值付款。", "Unable to create top-up payment."));
    }
  }

  async function loadDashboard(dashboard) {
    if (!isLoggedIn()) return;
    const [walletResponse, ordersResponse] = await Promise.all([
      fetch("/api/account?action=me", { headers: authHeaders() }),
      fetch("/api/account?action=orders", { headers: authHeaders() })
    ]);
    const wallet = await walletResponse.json();
    const orders = await ordersResponse.json();
    if (!walletResponse.ok || wallet.status !== "ok") {
      clearSession(); refreshNav(); return;
    }
    const balance = Number(wallet.wallet?.balanceMYR || 0);
    const transactions = wallet.wallet?.transactions || [];
    const paidTotal = transactions.filter(item => item.status === "paid").reduce((sum, item) => sum + Number(item.amountMYR || 0), 0);
    dashboard.querySelector("[data-wallet-balance]").textContent = `RM${balance.toFixed(2)}`;
    dashboard.querySelector("[data-wallet-total]").textContent = `${t("累计", "Total")} RM${paidTotal.toFixed(2)}`;
    dashboard.querySelector("[data-dashboard-name]").textContent = wallet.user?.name || wallet.user?.email || "";
    dashboard.querySelector("[data-dashboard-email]").textContent = wallet.user?.email || "";
    dashboard.querySelector("[data-dashboard-initial]").textContent = (wallet.user?.name || wallet.user?.email || "U").charAt(0).toUpperCase();
    dashboard.querySelector("[data-wallet-history]").innerHTML = transactions.length ? transactions.slice(0, 6).map(item =>
      `<div class="uz-dashboard-row"><span><b>+ RM${Number(item.amountMYR || 0).toFixed(2)}</b><small>${formatDate(item.createdAt)}</small></span><em class="is-${esc(item.status)}">${esc(item.status)}</em></div>`
    ).join("") : `<div class="uz-dashboard-empty">${t("还没有充值记录。", "No top-up history yet.")}</div>`;
    const orderList = orders.orders || [];
    dashboard.querySelector("[data-account-orders]").innerHTML = orderList.length ? orderList.slice(0, 6).map(order =>
      `<a class="uz-dashboard-row uz-order-row" href="order-status.html?order=${encodeURIComponent(order.id)}"><span><b>${esc(order.name || order.service || "Order")}</b><small>RM${Number(order.priceMYR || 0).toFixed(2)} · ${formatDate(order.createdAt)}</small></span><em>${esc(order.status || "pending")}</em></a>`
    ).join("") : `<div class="uz-dashboard-empty">${t("还没有订单记录。", "No orders yet.")}</div>`;
  }

  function formatDate(value) {
    if (!value) return "";
    try { return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); } catch { return ""; }
  }

  function switchTab(tab) {
    if (fnSendTimer) { clearTimeout(fnSendTimer); fnSendTimer = null; }

    overlay.querySelectorAll(".uz-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    overlay.querySelector(".uz-pane-login").style.display = tab === "login" ? "" : "none";
    overlay.querySelector(".uz-pane-register").style.display = tab === "register" ? "" : "none";
    overlay.querySelector(".uz-pane-reset").style.display = tab === "reset" ? "" : "none";
    const titles = {
      login: [t("登录您的账户", "Welcome back"), t("登录后即可查看余额、充值记录与订单进度。", "Sign in to manage your balance, top-ups and orders.")],
      register: [t("创建您的账户", "Create your account"), t("几分钟即可完成注册，开始管理您的服务。", "Create your account and start managing your services.")],
      reset: [t("重置您的密码", "Reset your password"), t("验证邮箱后即可设置新密码。", "Verify your email to choose a new password.")]
    };
    const [title, subtitle] = titles[tab] || titles.login;
    overlay.querySelector("[data-auth-title]").textContent = title;
    overlay.querySelector("[data-auth-subtitle]").textContent = subtitle;
    overlay.querySelector(".uz-auth-steps").classList.toggle("is-registering", tab === "register");
    const msg = overlay.querySelector("#uz-account-msg"); msg.innerHTML = "";
  }

  function refreshAuthLanguage() {
    if (!overlay) return;
    overlay.querySelectorAll("[data-auth-copy]").forEach(el => {
      el.textContent = copy(el.dataset.authCopy);
    });
    const activePane = ["login", "register", "reset"].find(tab =>
      overlay.querySelector(`.uz-pane-${tab}`).style.display !== "none"
    ) || "login";
    switchTab(activePane);
  }

  async function api(path, action, body) {
    const r = await fetch(`/api/account?action=${encodeURIComponent(action)}`, {
      method: path,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined
    });
    return r.json();
  }

  async function login() {
    const msg = overlay.querySelector("#uz-account-msg");
    const email = overlay.querySelector("#uz-login-email").value.trim();
    const password = overlay.querySelector("#uz-login-password").value;
    if (!email || !password) { msg.innerHTML = `<div class="uz-account-error">${t("请输入邮箱和密码。", "Please enter your email and password.")}</div>`; return; }
    const btn = overlay.querySelector("#uz-login-submit"); btn.disabled = true; btn.textContent = t("登录中…", "Signing in…");
    try {
      const j = await api("POST", "login", { email, password });
      if (j.status !== "ok") throw new Error(j.msg || "Login failed");
      setSession(j.token, j.user?.name || j.user?.email || "", j.user?.email || "");
      msg.innerHTML = `<div class="uz-account-ok">${t("登录成功！", "Signed in successfully!")}</div>`;
      setTimeout(() => { close(); refreshNav(); showToast(t("已登录", "Signed in")); }, 700);
    } catch (e) {
      msg.innerHTML = `<div class="uz-account-error">${esc(e.message)}</div>`;
      btn.disabled = false; btn.textContent = t("登录", "Sign in");
    }
  }

  async function sendCode(purpose) {
    const msg = overlay.querySelector("#uz-account-msg");
    const emailInput = purpose === "reset" ? overlay.querySelector("#uz-reset-email") : overlay.querySelector("#uz-reg-email");
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.innerHTML = `<div class="uz-account-error">${t("请输入有效邮箱。", "Enter a valid email address.")}</div>`;
      return;
    }
    const btn = purpose === "reset" ? overlay.querySelector("#uz-reset-sendcode") : overlay.querySelector("#uz-reg-sendcode");
    const original = btn.textContent;
    const started = Date.now();
    fnSendTimer = null;
    btn.disabled = true;
    btn.textContent = t("发送中…", "Sending…");
    try {
      const j = await api("POST", "send-code", { email, purpose });
      if (j.status !== "ok") throw new Error(j.msg || t("发送失败", "Failed to send"));
      msg.innerHTML = `<div class="uz-account-ok">${copy("auth.resetSent")}</div>`;
      const SECOND = 1000;
      const tick = () => {
        const left = Math.max(0, 60 - Math.floor((Date.now() - started) / SECOND));
        btn.textContent = left > 0 ? original + " (" + left + "s)" : original;
        if (left > 0) { fnSendTimer = setTimeout(tick, SECOND); } else { btn.disabled = false; }
      };
      tick();
    } catch (e) {
      msg.innerHTML = `<div class="uz-account-error">${esc(e.message)}</div>`;
      btn.disabled = false;
      btn.textContent = original;
    }
  }

  async function reset() {
    const msg = overlay.querySelector("#uz-account-msg");
    const email = overlay.querySelector("#uz-reset-email").value.trim();
    const code = overlay.querySelector("#uz-reset-code").value.trim();
    const password = overlay.querySelector("#uz-reset-password").value;
    if (!email || !code || password.length < 6) {
      msg.innerHTML = `<div class="uz-account-error">${t("请填写邮箱、验证码和至少6位新密码。", "Enter your email, the verification code and a new password of at least 6 characters.")}</div>`;
      return;
    }
    const btn = overlay.querySelector("#uz-reset-submit");
    btn.disabled = true;
    btn.textContent = t("重置中…", "Resetting…");
    try {
      const j = await api("POST", "reset", { email, code, password });
      if (j.status !== "ok") throw new Error(j.msg || "Reset failed");
      setSession(j.token, j.user?.name || j.user?.email || "", j.user?.email || "");
      msg.innerHTML = `<div class="uz-account-ok">${t("密码已重置并登录。", "Password reset and signed in.")}</div>`;
      setTimeout(() => { close(); refreshNav(); showToast(t("密码已重置", "Password reset")); }, 700);
    } catch (e) {
      msg.innerHTML = `<div class="uz-account-error">${esc(e.message)}</div>`;
      btn.disabled = false;
      btn.textContent = t("重置密码", "Reset password");
    }
  }

  async function register() {
    const msg = overlay.querySelector("#uz-account-msg");
    const name = overlay.querySelector("#uz-reg-name").value.trim();
    const email = overlay.querySelector("#uz-reg-email").value.trim();
    const password = overlay.querySelector("#uz-reg-password").value;
    if (!email || password.length < 6) {
      msg.innerHTML = `<div class="uz-account-error">${t("请填写邮箱和至少6位密码。", "Enter your email and a password of at least 6 characters.")}</div>`;
      return;
    }
    const btn = overlay.querySelector("#uz-reg-submit"); btn.disabled = true; btn.textContent = t("注册中…", "Creating…");
    try {
      const j = await api("POST", "register", { email, password, name });
      if (j.status !== "ok") throw new Error(j.msg || "Registration failed");
      setSession(j.token, j.user?.name || j.user?.email || "", j.user?.email || "");
      msg.innerHTML = `<div class="uz-account-ok">${t("注册成功！", "Account created!")}</div>`;
      setTimeout(() => { close(); refreshNav(); showToast(t("已注册并登录", "Account created & signed in")); }, 700);
    } catch (e) {
      msg.innerHTML = `<div class="uz-account-error">${esc(e.message)}</div>`;
      btn.disabled = false; btn.textContent = t("注册", "Create account");
    }
  }

  function open(tab) {
    if (!overlay) build();
    if (isLoggedIn() && !tab) {
      const dashboard = document.querySelector(".uz-account-dashboard");
      dashboard?.classList.add("open");
      dashboard?._load?.();
      return;
    }
    if (tab) switchTab(tab);
    overlay.style.display = "flex";
    overlay.classList.add("open");
  }
  function close() { if (overlay) { overlay.classList.remove("open"); overlay.style.display = "none"; } }

  function logout() {
    clearSession(); refreshNav(); showToast(t("已退出登录", "Signed out"));
  }

  function refreshNav() {
    document.querySelectorAll("[data-uz-account-loggedin]").forEach(el => { el.style.display = isLoggedIn() ? "" : "none"; });
    overlay?.querySelectorAll?.(".uz-my-orders").forEach(el => { el.style.display = isLoggedIn() ? "" : "none"; });
    document.querySelectorAll("[data-uz-account-loggedout]").forEach(el => { el.style.display = isLoggedIn() ? "none" : ""; });
    const name = getName() || getEmail().split("@")[0] || "U";
    document.querySelectorAll("[data-uz-account-name]").forEach(el => { el.textContent = name; });
    document.querySelectorAll("[data-uz-account-initial]").forEach(el => { el.textContent = name.trim().charAt(0).toUpperCase() || "U"; });
  }

  function init() {
    build();
    refreshNav();
    document.querySelectorAll("[data-uz-account-open]").forEach(el => el.onclick = () => open());
  }

  return { init, open, close, login, register, reset, logout, isLoggedIn, getToken, getEmail, getEmailFromServer, getName, authHeaders, refreshNav, showToast };
})();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", UzAccount.init);
  else UzAccount.init();
}
