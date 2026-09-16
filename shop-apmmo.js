const BASE = process.env.SHOP_APMMO_BASE || "https://shop.appmmo.com/api";
async function call(path, form={}) {
  const key=process.env.SHOP_APMMO_API_KEY; if(!key) throw new Error("SHOP_APMMO_API_KEY is not configured");
  const body=new URLSearchParams({api_key:key,...Object.fromEntries(Object.entries(form).map(([k,v])=>[k,String(v??"")]))});
  const r=await fetch(BASE+path,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:body.toString()});
  const text=await r.text(); let data; try{data=JSON.parse(text)}catch{data={status:"error",msg:"Supplier did not return JSON",raw:text};}
  if(!r.ok) throw new Error(data?.msg||`Supplier HTTP ${r.status}`); return data;
}
export async function buyProduct({productId,quantity,coupon=""}) {
  return call("/buy_product",{action:"buyProduct",ID:productId,Amount:quantity,Coupon:coupon});
}
