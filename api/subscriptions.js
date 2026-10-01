const BASE = process.env.SHOP_APMMO_BASE || "https://shop.appmmo.com/api";

function json(res, status, body, cacheSeconds=0) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  if (cacheSeconds) res.setHeader("Cache-Control", `s-maxage=${cacheSeconds}, stale-while-revalidate=60`);
  return res.end(JSON.stringify(body));
}

async function upstream(path, params = {}, options = {}) {
  const key = process.env.SHOP_APMMO_API_KEY;
  if (!key) throw new Error("SHOP_APMMO_API_KEY is not configured");
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", key);
  for (const [k,v] of Object.entries(params)) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  const fetchOptions = { method: options.method || "GET", headers: options.headers || {} };
  if (options.form) {
    const form = new URLSearchParams();
    for (const [k,v] of Object.entries(options.form)) form.set(k, String(v ?? ""));
    fetchOptions.body = form.toString();
    fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
  }
  const r = await fetch(url, fetchOptions);
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { data = { status:"error", msg:"Upstream did not return JSON", raw:text }; }
  return { status:r.status, data };
}

const isObj = v => v && typeof v === "object" && !Array.isArray(v);
const PRODUCT_IDS = ["id","ID","product_id","productId","productID"];
const PRODUCT_NAMES = ["name","title","product_name","productName","product"];
const PRODUCT_PRICES = ["price","Price","selling_price","sellingPrice","sale_price","salePrice","cost","amount","unit_price","unitPrice","product_price","productPrice","regular_price","current_price"];
const first = (o, keys, fallback="") => {
  for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null && String(o[k]).trim() !== "") return o[k];
  return fallback;
};
const num = (v, fallback=0) => {
  const n=Number(String(v ?? "").replace(/[^0-9.\-]/g,""));
  return Number.isFinite(n) ? n : fallback;
};
function parsePrice(value, currency) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  let text=String(value ?? "").trim().replace(/[^\d,.\-]/g,"");
  if (!text) return 0;
  const lastSeparator=Math.max(text.lastIndexOf(","),text.lastIndexOf("."));
  const fractionLength=lastSeparator<0 ? 0 : text.length-lastSeparator-1;
  const separatorCount=(text.match(/[,.]/g)||[]).length;
  const decimalSeparator=currency!=="VND" && lastSeparator>=0 && fractionLength>0 && fractionLength<=2 && separatorCount===1;
  if (currency!=="VND" && lastSeparator>=0 && fractionLength>0 && fractionLength<=2 && separatorCount>1) {
    text=text.slice(0,lastSeparator).replace(/[,.]/g,"")+"."+text.slice(lastSeparator+1);
  } else if (decimalSeparator) {
    text=text.replace(lastSeparator===text.lastIndexOf(",") ? "," : ".", ".");
  } else {
    text=text.replace(/[,.]/g,"");
  }
  const parsed=Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}
const isAdmin = (req) => !!process.env.ADMIN_PASSWORD && req.headers["x-admin-password"] === process.env.ADMIN_PASSWORD;
const looksLikeProduct = node =>
  isObj(node) &&
  PRODUCT_IDS.some(key => node[key] !== undefined) &&
  PRODUCT_NAMES.some(key => node[key] !== undefined) &&
  PRODUCT_PRICES.some(key => node[key] !== undefined && node[key] !== null && String(node[key]).trim() !== "");

// APPMMO has used a few response shapes over time. Walk the response instead of
// assuming that products are always data[] or products[]. Categories can have
// IDs and names too, so require a price field before treating a node as a product.
function collectProducts(node, inheritedCategory="", out=[]) {
  if (Array.isArray(node)) {
    for (const item of node) collectProducts(item, inheritedCategory, out);
    return out;
  }
  if (!isObj(node)) return out;

  if (looksLikeProduct(node)) {
    out.push({ ...node, category: first(node,["category","category_name","categoryName","group","group_name"],inheritedCategory || "Other") });
    return out;
  }

  const categoryHere = first(node,["category","category_name","categoryName","group","group_name","name"],inheritedCategory);
  for (const [key,value] of Object.entries(node)) {
    if (["api_key","token","password","secret"].includes(key.toLowerCase())) continue;
    let nextCategory = inheritedCategory;
    if (/category|group/i.test(key) && typeof value === "string") nextCategory = value;
    else if (isObj(value) || Array.isArray(value)) nextCategory = categoryHere;
    collectProducts(value, nextCategory, out);
  }
  return out;
}

function normalizeProduct(p, index) {
  const id = String(first(p,["id","ID","product_id","productId","productID"], index+1));
  const currency = String(first(p,["currency","currency_code","currencyCode","price_currency"],"VND")).toUpperCase();
  const rawPrice = parsePrice(first(p,["price","Price","selling_price","sellingPrice","sale_price","salePrice","cost","amount","unit_price","unitPrice","product_price","productPrice","regular_price","current_price"],0),currency);
  const vndToMyr = Number(process.env.SHOP_VND_TO_MYR_RATE || process.env.VND_TO_MYR_RATE || process.env.VND_TO_MYR || 0.000156);
  const usdToMyr = Number(process.env.SHOP_USD_TO_MYR_RATE || process.env.USD_TO_MYR_RATE || process.env.USD_TO_MYR || 4.04);
  const cnyToMyr = Number(process.env.SHOP_CNY_TO_MYR_RATE || process.env.CNY_TO_MYR_RATE || process.env.CNY_TO_MYR || 0.60);
  const markupPercent = Number(process.env.SUBSCRIPTION_MARKUP_PERCENT || 30);
  const rates = { MYR: 1, VND: vndToMyr, USD: usdToMyr, CNY: cnyToMyr };
  const basePriceMYR = rawPrice * (rates[currency] || rates.VND);
  const markedMyr = Math.round(basePriceMYR * (1 + markupPercent / 100) * 100) / 100;
  return {
    id,
    name: String(first(p,["name","title","product_name","productName","product"],`Product ${id}`)),
    category: String(first(p,["category","category_name","categoryName","group","group_name","category_title"],"Other")),
    description: String(first(p,["description","desc","content","detail","details","product_description","productDescription","short_description","shortDescription","info","intro"],"")),
    icon: String(first(p,["icon","icon_url","iconUrl","image","image_url","imageUrl","logo","logo_url","thumbnail","thumb"],"")),
    price: rawPrice,
    currency,
    basePriceMYR: Math.round(basePriceMYR * 100) / 100,
    markupPercent,
    prices: {
      MYR: markedMyr,
      USD: Math.round((markedMyr / usdToMyr) * 100) / 100,
      CNY: Math.round((markedMyr / cnyToMyr) * 100) / 100
    },
    min: Math.max(1,num(first(p,["min","minimum","min_amount","min_qty","min_quantity"],1),1)),
    max: Math.max(1,num(first(p,["max","maximum","max_amount","max_qty","max_quantity"],1),1))
  };
}

function findProductPayload(node) {
  if (Array.isArray(node)) {
    for (const item of node) { const found=findProductPayload(item); if (found) return found; }
    return null;
  }
  if (!isObj(node)) return null;
  if (looksLikeProduct(node)) return node;
  for (const key of ["data","product","result","item","product_info","productInfo"]) {
    if (node[key]!==undefined) { const found=findProductPayload(node[key]); if(found) return found; }
  }
  for (const value of Object.values(node)) { const found=findProductPayload(value); if(found) return found; }
  return null;
}

export default async function handler(req,res) {
  try {
    const action=String(req.query.action||"products");
    if (req.method !== "GET") return json(res,405,{status:"error",msg:"Method not allowed"});

    if (action === "products") {
      const r=await upstream("/products.php");
      if (r.status>=400 || r.data?.status === "error") return json(res,r.status>=400?r.status:502,r.data);
      const source=collectProducts(r.data);
      const seen=new Set();
      const products=source.map(normalizeProduct).filter(p=>p.id&&p.name).filter(p=>{
        if(seen.has(p.id)) return false; seen.add(p.id); return true;
      });
      return json(res,200,{status:"success",products},60);
    }

    if (action === "profile") {
      // Supplier account/balance is admin-only. Never expose this to customers.
      if (!isAdmin(req)) {
        return json(res, 401, { status: "error", msg: "Unauthorized" });
      }
      const r = await upstream("/profile.php");
      return json(res, r.status, { status: "success", data: r.data });
    }

    if (action === "order") {
      if (!isAdmin(req)) {
        return json(res, 401, { status: "error", msg: "Unauthorized" });
      }
      const ref = String(req.query.order || req.query.trans_id || "").trim();
      if (!ref) return json(res,400,{status:"error",msg:"Missing order reference"});
      const firstTry = await upstream("/order.php", { trans_id: ref });
      if (firstTry.status < 400 && firstTry.data?.status !== "error") {
        return json(res, firstTry.status, { status:"success", data:firstTry.data });
      }
      const secondTry = await upstream("/order.php", { order: ref });
      return json(res, secondTry.status, { status: secondTry.status < 400 && secondTry.data?.status !== "error" ? "success" : "error", data: secondTry.data });
    }

    if (action === "product") {
      if (!req.query.product) return json(res,400,{status:"error",msg:"Missing product"});
      const r=await upstream("/product.php",{product:req.query.product});
      if (r.status>=400 || r.data?.status === "error") return json(res,r.status,r.data);
      const product=findProductPayload(r.data);
      if(!product) return json(res,502,{status:"error",msg:"Supplier returned an unrecognized product response"});
      return json(res,r.status,{status:"success",product:normalizeProduct(product,0)},30);
    }

    return json(res,400,{status:"error",msg:"Unknown action"});
  } catch(e) { return json(res,500,{status:"error",msg:e.message}); }
}
