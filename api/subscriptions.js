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
  let data; try { data = JSON.parse(text); } catch { data = { status:"error", msg:"Upstream did not return JSON", raw:text }; }
  return { status:r.status, data };
}

function arrFrom(data) {
  if (Array.isArray(data)) return data;
  const direct = ["data","products","items","result","results"];
  for (const k of direct) {
    if (Array.isArray(data?.[k])) return data[k];
    if (data?.[k] && typeof data[k] === "object") {
      const nested=[];
      for (const [category, value] of Object.entries(data[k])) {
        if (Array.isArray(value)) value.forEach(item => nested.push({...item, category: item?.category ?? item?.category_name ?? category}));
      }
      if (nested.length) return nested;
    }
  }
  if (data && typeof data === "object") {
    const nested=[];
    for (const [category,value] of Object.entries(data)) {
      if (Array.isArray(value)) value.forEach(item => nested.push({...item, category: item?.category ?? item?.category_name ?? category}));
    }
    if (nested.length) return nested;
  }
  return [];
}
function first(o, keys, fallback="") { for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null && o?.[k] !== "") return o[k]; return fallback; }
function num(v, fallback=0) { const n=Number(String(v).replace(/[^0-9.\-]/g,"")); return Number.isFinite(n)?n:fallback; }
function normalizeProduct(p, index) {
  const id = String(first(p,["id","ID","product_id","productId"], index+1));
  const rawPrice = num(first(p,["price","Price","selling_price","sale_price","cost","amount"],0));
  return {
    id,
    name: String(first(p,["name","title","product_name","productName"],`Product ${id}`)),
    category: String(first(p,["category","category_name","categoryName","group"],"Other")),
    description: String(first(p,["description","desc","content","detail","details"],"")),
    icon: String(first(p,["icon","icon_url","iconUrl","image","image_url","imageUrl","logo","logo_url","thumbnail","thumb"],"")),
    price: rawPrice,
    currency: String(first(p,["currency","unit"],"USD")),
    min: Math.max(1,num(first(p,["min","minimum","min_amount","min_qty"],1),1)),
    max: Math.max(1,num(first(p,["max","maximum","max_amount","max_qty"],1),1)),
    raw:p
  };
}

export default async function handler(req,res) {
  try {
    const action=String(req.query.action||"products");
    if (req.method !== "GET") return json(res,405,{status:"error",msg:"Method not allowed"});
    if (action === "products") {
      const r=await upstream("/products.php");
      if (r.status>=400) return json(res,r.status,r.data);
      const source=arrFrom(r.data);
      const products=source.map(normalizeProduct).filter(p=>p.id && p.name);
      return json(res,200,{status:"success",products,raw:r.data},120);
    }
    if (action === "product") {
      if (!req.query.product) return json(res,400,{status:"error",msg:"Missing product"});
      const r=await upstream("/product.php",{product:req.query.product});
      return json(res,r.status,r.data,30);
    }
    return json(res,400,{status:"error",msg:"Unknown action"});
  } catch(e) { return json(res,500,{status:"error",msg:e.message}); }
}
