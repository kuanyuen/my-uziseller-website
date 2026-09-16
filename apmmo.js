const APMMO_BASE = "https://shop.appmmo.com/api";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

function auth(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return req.headers["x-admin-password"] === expected;
}

async function callUpstream(path, options = {}) {
  const apiKey = process.env.APMMO_API_KEY;
  if (!apiKey) throw new Error("APMMO_API_KEY is not configured");

  const url = new URL(APMMO_BASE + path);
  if (options.params) {
    for (const [k, v] of Object.entries(options.params)) url.searchParams.set(k, String(v));
  }

  const fetchOptions = {
    method: options.method || "GET",
    headers: options.headers || {}
  };

  if (options.form) {
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(options.form)) form.set(k, String(v ?? ""));
    fetchOptions.body = form.toString();
    fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const r = await fetch(url, fetchOptions);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { data = { status: "error", msg: "Upstream did not return JSON", raw: text }; }

  return { httpStatus: r.status, data };
}

export default async function handler(req, res) {
  if (!auth(req)) return json(res, 401, { status: "error", msg: "Unauthorized" });

  try {
    const action = String(req.query.action || "");

    if (req.method === "GET" && action === "profile") {
      const r = await callUpstream("/profile.php", { params: { api_key: process.env.APMMO_API_KEY }});
      return json(res, r.httpStatus, r.data);
    }

    if (req.method === "GET" && action === "products") {
      const r = await callUpstream("/products.php", { params: { api_key: process.env.APMMO_API_KEY }});
      return json(res, r.httpStatus, r.data);
    }

    if (req.method === "GET" && action === "product") {
      const product = req.query.product;
      if (!product) return json(res, 400, { status: "error", msg: "Missing product" });
      const r = await callUpstream("/product.php", {
        params: { api_key: process.env.APMMO_API_KEY, product }
      });
      return json(res, r.httpStatus, r.data);
    }

    if (req.method === "GET" && action === "order") {
      const order = req.query.order;
      if (!order) return json(res, 400, { status: "error", msg: "Missing order" });
      const r = await callUpstream("/order.php", {
        params: { api_key: process.env.APMMO_API_KEY, order }
      });
      return json(res, r.httpStatus, r.data);
    }

    if (req.method === "POST" && action === "buy") {
      const { ID, Amount, Coupon = "" } = req.body || {};
      if (!ID || !Amount) return json(res, 400, { status: "error", msg: "ID and Amount are required" });

      const r = await callUpstream("/buy_product", {
        method: "POST",
        form: {
          action: "buyProduct",
          ID,
          Amount,
          Coupon,
          api_key: process.env.APMMO_API_KEY
        }
      });
      return json(res, r.httpStatus, r.data);
    }

    return json(res, 400, { status: "error", msg: "Unknown action" });
  } catch (e) {
    return json(res, 500, { status: "error", msg: e.message });
  }
}
