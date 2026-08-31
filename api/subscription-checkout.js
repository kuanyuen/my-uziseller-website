import { randomUUID } from "crypto";
import { createBill } from "../lib/billplz.js";
import { saveOrder, trackOrderId } from "../lib/store.js";

const BASE = process.env.SHOP_APMMO_BASE || "https://shop.appmmo.com/api";
function json(res,status,body){res.status(status).setHeader("Content-Type","application/json; charset=utf-8");return res.end(JSON.stringify(body));}
async function getProduct(id){
  const key=process.env.SHOP_APMMO_API_KEY; if(!key) throw new Error("SHOP_APMMO_API_KEY is not configured");
  const u=new URL(BASE+"/product.php"); u.searchParams.set("api_key",key); u.searchParams.set("product",String(id));
  const r=await fetch(u); const text=await r.text(); let d; try{d=JSON.parse(text)}catch{throw new Error("Supplier product API returned invalid JSON")}
  if(!r.ok || d?.status==="error") throw new Error(d?.msg||"Product unavailable");
  const p=d?.data && !Array.isArray(d.data) ? d.data : (d?.product || d?.data?.[0] || d);
  return p;
}
function num(v,fb=0){const n=Number(String(v).replace(/[^0-9.\-]/g,""));return Number.isFinite(n)?n:fb}
function priceOf(p){return num(p?.price ?? p?.Price ?? p?.selling_price ?? p?.sale_price ?? p?.cost ?? p?.amount,0)}
function currencyOf(p){return String(p?.currency||p?.unit||"VND").toUpperCase()}
function toMyr(amount,currency){const rates={MYR:1,VND:Number(process.env.VND_TO_MYR||0.000156),USD:Number(process.env.USD_TO_MYR||4.04),CNY:Number(process.env.CNY_TO_MYR||0.60)};return amount*(rates[currency]||1)}
export default async function handler(req,res){
  if(req.method!=="POST") return json(res,405,{status:"error",msg:"Method not allowed"});
  try{
    const {productId,quantity=1,email,name,coupon=""}=req.body||{};
    if(!productId||!email||!name) return json(res,400,{status:"error",msg:"productId, email and name are required"});
    const p=await getProduct(productId);
    const qty=num(quantity,1); const min=Math.max(1,num(p?.min??p?.minimum??p?.min_qty,1)); const max=Math.max(min,num(p?.max??p?.maximum??p?.max_qty,1));
    if(!Number.isInteger(qty)||qty<min||qty>max) return json(res,400,{status:"error",msg:`Quantity must be between ${min} and ${max}`});
    const supplierUnit=priceOf(p); if(!(supplierUnit>0)) return json(res,400,{status:"error",msg:"Supplier product has no valid price"});
    const supplierCurrency=currencyOf(p);
    const totalSupplier= supplierUnit*qty;
    const markup=Number(process.env.SUBSCRIPTION_MARKUP_PERCENT||30)/100;
    const totalMyr=Math.round(toMyr(totalSupplier,supplierCurrency)*(1+markup)*100)/100;
    const amountCents=Math.round(totalMyr*100); if(amountCents<100) return json(res,400,{status:"error",msg:"Order amount too small"});
    const orderId=randomUUID(); const siteUrl=process.env.SITE_URL||`https://${req.headers.host}`;
    const bill=await createBill({amountCents,name,email,description:`${String(p.name||`Product ${productId}`)} x${qty}`,callbackUrl:`${siteUrl}/api/billplz-webhook`,redirectUrl:`${siteUrl}/order-status.html?order=${orderId}`,referenceId:orderId});
    const order={id:orderId,type:"subscription",productId:String(productId),productName:String(p.name||`Product ${productId}`),quantity:qty,email,customerName:name,coupon, supplierUnitPrice:supplierUnit,supplierCurrency,totalSupplier,status:"pending_payment",priceMYR:totalMyr,billId:bill.id,billUrl:bill.url,createdAt:new Date().toISOString()};
    await saveOrder(order); await trackOrderId(orderId);
    return json(res,200,{status:"ok",orderId,paymentUrl:bill.url,totalMYR:totalMyr});
  }catch(e){return json(res,500,{status:"error",msg:e.message});}
}
