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
    overlay.innerHTML = `
      <div class="uz-account-modal">
        <button class="uz-account-close" aria-label="Close">&times;</button>
        <div class="uz-account-head">
          <div class="uz-account-tabs">
            <button class="uz-tab uz-tab-login active" data-tab="login">${t("登录", "Sign in")}</button>
            <button class="uz-tab uz-tab-register" data-tab="register">${t("注册", "Create account")}</button>
          </div>
        </div>
        <div class="uz-account-body">
          <div class="uz-pane uz-pane-login">
            <a href="order-status.html" class="uz-account-link uz-my-orders" style="display:none">${t("我的订单", "My orders")} →</a>
            <label>${t("邮箱", "Email")}<input class="uz-input" type="email" id="uz-login-email" autocomplete="email" placeholder="you@example.com"></label>
            <label>${t("密码", "Password")}<input class="uz-input" type="password" id="uz-login-password" autocomplete="current-password" placeholder="••••••••"></label>
            <button class="uz-btn" id="uz-login-submit">${t("登录", "Sign in")}</button>
            <p class="uz-account-linkrow"><a href="#" data-uz-forgot class="uz-account-link">${t("忘记密码？", "Forgot password?")}</a></p>
          </div>
          <div class="uz-pane uz-pane-register" style="display:none">
            <label>${t("姓名（可选）", "Name (optional)")}<input class="uz-input" type="text" id="uz-reg-name" autocomplete="name" placeholder="Your name"></label>
            <label>${t("邮箱", "Email")}<input class="uz-input" type="email" id="uz-reg-email" autocomplete="email" placeholder="you@example.com"></label>
            <label>${t("验证码", "Verification code")}<input class="uz-input" type="text" id="uz-reg-code" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"></label>
            <button class="uz-btn uz-btn-ghost" id="uz-reg-sendcode">${t("发送验证码", "Send code")}</button>
            <label>${t("密码（至少6位）", "Password (min 6 chars)")}<input class="uz-input" type="password" id="uz-reg-password" autocomplete="new-password" placeholder="••••••••"></label>
            <button class="uz-btn" id="uz-reg-submit">${t("注册", "Create account")}</button>
          </div>
          <div class="uz-pane uz-pane-reset" style="display:none">
            <p class="uz-account-hint">${t("输入注册邮箱，我们会发送验证码。", "Enter your registered email and we will send a code.")}</p>
            <label>${t("邮箱", "Email")}<input class="uz-input" type="email" id="uz-reset-email" autocomplete="email" placeholder="you@example.com"></label>
            <button class="uz-btn uz-btn-ghost" id="uz-reset-sendcode">${t("发送验证码", "Send code")}</button>
            <label>${t("验证码", "Verification code")}<input class="uz-input" type="text" id="uz-reset-code" inputmode="numeric" autocomplete="one-time-code" placeholder="123456"></label>
            <label>${t("新密码（至少6位）", "New password (min 6 chars)")}<input class="uz-input" type="password" id="uz-reset-password" autocomplete="new-password" placeholder="••••••••"></label>
            <button class="uz-btn" id="uz-reset-submit">${t("重置密码", "Reset password")}</button>
            <p class="uz-account-linkrow"><a href="#" data-uz-back-login class="uz-account-link">${t("← 返回登录", "← Back to sign in")}</a></p>
          </div>
          <div class="uz-account-msg" id="uz-account-msg"></div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    overlay.querySelector(".uz-account-close").addEventListener("click", close);
    overlay.querySelectorAll(".uz-tab").forEach(btn => btn.onclick = () => switchTab(btn.dataset.tab));

    // Bind click events
    overlay.querySelector("#uz-login-submit").onclick = login;
    overlay.querySelector("#uz-reg-submit").onclick = register;
    overlay.querySelector("#uz-reg-sendcode").onclick = () => sendCode("register");
    overlay.querySelector("#uz-reset-sendcode").onclick = () => sendCode("reset");
    overlay.querySelector("#uz-reset-submit").onclick = reset;
    overlay.querySelector("[data-uz-forgot]").onclick = (e) => { e.preventDefault(); switchTab("reset"); };
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

  function switchTab(tab) {
    if (fnSendTimer) { clearTimeout(fnSendTimer); fnSendTimer = null; }

    overlay.querySelectorAll(".uz-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    overlay.querySelector(".uz-pane-login").style.display = tab === "login" ? "" : "none";
    overlay.querySelector(".uz-pane-register").style.display = tab === "register" ? "" : "none";
    overlay.querySelector(".uz-pane-reset").style.display = tab === "reset" ? "" : "none";
    const msg = overlay.querySelector("#uz-account-msg"); msg.innerHTML = "";
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
      msg.innerHTML = `<div class="uz-account-ok">${t("验证码已发送，请查收邮箱。", "Verification code sent. Check your email.")}</div>`;
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
    const code = overlay.querySelector("#uz-reg-code").value.trim();
    const password = overlay.querySelector("#uz-reg-password").value;
    if (!email || !code || password.length < 6) {
      msg.innerHTML = `<div class="uz-account-error">${t("请填写邮箱、验证码和至少6位密码。", "Enter your email, verification code and a password of at least 6 characters.")}</div>`;
      return;
    }
    const btn = overlay.querySelector("#uz-reg-submit"); btn.disabled = true; btn.textContent = t("注册中…", "Creating…");
    try {
      const j = await api("POST", "register", { email, password, name, code });
      if (j.status !== "ok") throw new Error(j.msg || "Registration failed");
      setSession(j.token, j.user?.name || j.user?.email || "", j.user?.email || "");
      msg.innerHTML = `<div class="uz-account-ok">${t("注册成功！", "Account created!")}</div>`;
      setTimeout(() => { close(); refreshNav(); showToast(t("已注册并登录", "Account created & signed in")); }, 700);
    } catch (e) {
      msg.innerHTML = `<div class="uz-account-error">${esc(e.message)}</div>`;
      btn.disabled = false; btn.textContent = t("注册", "Create account");
    }
  }

  function open(tab) { if (!overlay) build(); if (tab) switchTab(tab); overlay.classList.add("open"); }
  function close() { overlay?.classList.remove("open"); }

  function logout() {
    clearSession(); refreshNav(); showToast(t("已退出登录", "Signed out"));
  }

  function refreshNav() {
    document.querySelectorAll("[data-uz-account-loggedin]").forEach(el => { el.style.display = isLoggedIn() ? "" : "none"; });
    overlay?.querySelectorAll?.(".uz-my-orders").forEach(el => { el.style.display = isLoggedIn() ? "" : "none"; });
    document.querySelectorAll("[data-uz-account-loggedout]").forEach(el => { el.style.display = isLoggedIn() ? "none" : ""; });
    document.querySelectorAll("[data-uz-account-name]").forEach(el => { el.textContent = getName() || ""; });
  }

  function init() {
    build();
    refreshNav();
    document.querySelectorAll("[data-uz-account-open]").forEach(el => el.onclick = open);
  }

  return { init, open, close, login, register, reset, logout, isLoggedIn, getToken, getEmail, getEmailFromServer, getName, authHeaders, refreshNav, showToast };
})();

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", UzAccount.init);
  else UzAccount.init();
}
