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
const first = (o, keys, fallback="") => {
  for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null && String(o[k]).trim() !== "") return o[k];
  return fallback;
};
const num = (v, fallback=0) => {
  const n=Number(String(v ?? "").replace(/[^0-9.\-]/g,""));
  return Number.isFinite(n) ? n : fallback;
};

// APPMMO has used a few response shapes over time. Walk the response instead of
// assuming that products are always data[] or products[].
function collectProducts(node, inheritedCategory="", out=[]) {
  if (Array.isArray(node)) {
    for (const item of node) collectProducts(item, inheritedCategory, out);
    return out;
  }
  if (!isObj(node)) return out;

  const looksLikeProduct = ["id","ID","product_id","productId"].some(k => node[k] !== undefined) &&
    ["name","title","product_name","productName"].some(k => node[k] !== undefined);
  if (looksLikeProduct) {
    out.push({ ...node, category: first(node,["category","category_name","categoryName","group","group_name"],inheritedCategory || "Other") });
    return out;
  }

  const categoryHere = first(node,["category","category_name","categoryName","group","group_name","name"],inheritedCategory);
  for (const [key,value] of Object.entries(node)) {
    if (["api_key","token","password","secret"].includes(key.toLowerCase())) continue;
    let nextCategory = inheritedCategory;
    if (/category|group/i.test(key) && typeof value === "string") nextCategory = value;
    else if (isObj(value) && /categories?|groups?/i.test(key)) nextCategory = categoryHere;
    collectProducts(value, nextCategory, out);
  }
  return out;
}

function normalizeProduct(p, index) {
  const id = String(first(p,["id","ID","product_id","productId"], index+1));
  const rawPrice = num(first(p,["price","Price","selling_price","sale_price","cost","amount","unit_price"],0));
  return {
    id,
    name: String(first(p,["name","title","product_name","productName"],`Product ${id}`)),
    category: String(first(p,["category","category_name","categoryName","group","group_name"],"Other")),
    description: String(first(p,["description","desc","content","detail","details","product_description","productDescription","short_description","shortDescription","info","intro"],"")),
    icon: String(first(p,["icon","icon_url","iconUrl","image","image_url","imageUrl","logo","logo_url","thumbnail","thumb"],"")),
    price: rawPrice,
    currency: String(first(p,["currency","unit","currency_code"],"USD")),
    min: Math.max(1,num(first(p,["min","minimum","min_amount","min_qty","min_quantity"],1),1)),
    max: Math.max(1,num(first(p,["max","maximum","max_amount","max_qty","max_quantity"],1),1)),
    raw:p
  };
}

function findProductPayload(node) {
  if (Array.isArray(node)) {
    for (const item of node) { const found=findProductPayload(item); if (found) return found; }
    return null;
  }
  if (!isObj(node)) return null;
  if (["id","ID","product_id","productId"].some(k=>node[k]!==undefined) &&
      ["name","title","product_name","productName","description","desc","content","detail","details"].some(k=>node[k]!==undefined)) return node;
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
      return json(res,200,{status:"success",products,raw:r.data},60);
    }

    if (action === "product") {
      if (!req.query.product) return json(res,400,{status:"error",msg:"Missing product"});
      const r=await upstream("/product.php",{product:req.query.product});
      if (r.status>=400 || r.data?.status === "error") return json(res,r.status,r.data);
      // Return the complete upstream payload. The browser will extract all fields,
      // including fields that were not known when this storefront was written.
      return json(res,r.status,{status:"success",data:r.data},30);
    }

    return json(res,400,{status:"error",msg:"Unknown action"});
  } catch(e) { return json(res,500,{status:"error",msg:e.message}); }
}
