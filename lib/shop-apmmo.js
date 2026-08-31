// SHOP.APPMMO.COM server-side client.
// The supplier API key stays server-side and is never sent to the browser.
const BASE = process.env.SHOP_APMMO_BASE || "https://shop.appmmo.com/api";

async function call(path, { method = "GET", params = {}, form = {} } = {}) {
  const key = process.env.SHOP_APMMO_API_KEY;
  if (!key) throw new Error("SHOP_APMMO_API_KEY is not configured");

  const url = new URL(BASE + path);
  if (method === "GET") {
    url.searchParams.set("api_key", key);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && String(v) !== "") url.searchParams.set(k, String(v));
    }
  }

  const options = {
    method,
    headers: { Accept: "application/json" }
  };

  if (method !== "GET") {
    const body = new URLSearchParams({ api_key: key });
    for (const [k, v] of Object.entries(form)) {
      if (v !== undefined && v !== null) body.set(k, String(v));
    }
    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.body = body.toString();
  }

  const response = await fetch(url, options);
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); }
  catch { data = { status: "error", msg: "Supplier did not return JSON", raw: text }; }

  if (!response.ok) {
    const error = new Error(data?.msg || data?.message || `Supplier HTTP ${response.status}`);
    error.httpStatus = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export function getProfile() {
  return call("/profile.php");
}

export function getProducts() {
  return call("/products.php");
}

export function getProduct(productId) {
  return call("/product.php", { params: { product: productId } });
}

// APPMMO's order-detail endpoint has appeared with different parameter names
// in deployments. Query the transaction reference first; if the supplier
// explicitly rejects it, retry with the alternate `order` parameter.
export async function getOrder(orderRef) {
  const ref = String(orderRef || "").trim();
  if (!ref) throw new Error("Missing supplier order reference");
  try {
    return await call("/order.php", { params: { trans_id: ref } });
  } catch (firstError) {
    try {
      return await call("/order.php", { params: { order: ref } });
    } catch (secondError) {
      secondError.firstError = firstError.message;
      throw secondError;
    }
  }
}

export function buyProduct({ productId, quantity, coupon = "" }) {
  return call("/buy_product", {
    method: "POST",
    form: { action: "buyProduct", ID: productId, Amount: quantity, Coupon: coupon }
  });
}
