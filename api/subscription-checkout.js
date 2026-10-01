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
  const isObject=value=>value&&typeof value==="object"&&!Array.isArray(value);
  const looksLikeProduct=value=>isObject(value)&&
    ["id","ID","product_id","productId","productID"].some(k=>value[k]!==undefined)&&
    ["name","title","product_name","productName","product","price","Price","selling_price","sale_price","cost","amount","unit_price","product_price"].some(k=>value[k]!==undefined);
  function findProduct(value){
    if(Array.isArray(value)){for(const item of value){const found=findProduct(item);if(found)return found;}return null;}
    if(!isObject(value))return null;
    if(looksLikeProduct(value))return value;
    for(const key of ["data","product","result","item","product_info","productInfo"]){
      const found=findProduct(value[key]);
      if(found)return found;
    }
    return null;
  }
  const product=findProduct(d);
  if(!product) throw new Error("Supplier returned an unrecognized product response");
  const returnedId=product.id??product.ID??product.product_id??product.productId??product.productID;
  if(returnedId!==undefined&&String(returnedId).trim()!==String(id).trim()) throw new Error("Supplier returned a different product");
  return product;
}
function num(v,fb=0){const n=Number(String(v).replace(/[^0-9.\-]/g,""));return Number.isFinite(n)?n:fb}
function priceOf(p,currency){
  const value=p?.price ?? p?.Price ?? p?.selling_price ?? p?.sellingPrice ?? p?.sale_price ?? p?.salePrice ?? p?.cost ?? p?.amount ?? p?.unit_price ?? p?.unitPrice ?? p?.product_price ?? p?.productPrice ?? p?.regular_price ?? p?.current_price;
  if(typeof value==="number") return Number.isFinite(value)?value:0;
  let text=String(value??"").trim().replace(/[^\d,.\-]/g,"");
  if(!text)return 0;
  const lastSeparator=Math.max(text.lastIndexOf(","),text.lastIndexOf("."));
  const fractionLength=lastSeparator<0?0:text.length-lastSeparator-1;
  const separatorCount=(text.match(/[,.]/g)||[]).length;
  if(currency!=="VND"&&lastSeparator>=0&&fractionLength>0&&fractionLength<=2&&separatorCount>1) text=text.slice(0,lastSeparator).replace(/[,.]/g,"")+"."+text.slice(lastSeparator+1);
  else if(currency!=="VND"&&lastSeparator>=0&&fractionLength>0&&fractionLength<=2&&separatorCount===1) text=text.replace(lastSeparator===text.lastIndexOf(",")?",":".",".");
  else text=text.replace(/[,.]/g,"");
  const parsed=Number(text);
  return Number.isFinite(parsed)?parsed:0;
}
function currencyOf(p){return String(p?.currency||p?.currency_code||p?.currencyCode||p?.unit||"VND").toUpperCase()}
function toMyr(amount,currency){const rates={MYR:1,VND:Number(process.env.SHOP_VND_TO_MYR_RATE||process.env.VND_TO_MYR_RATE||process.env.VND_TO_MYR||0.000156),USD:Number(process.env.SHOP_USD_TO_MYR_RATE||process.env.USD_TO_MYR_RATE||process.env.USD_TO_MYR||4.04),CNY:Number(process.env.SHOP_CNY_TO_MYR_RATE||process.env.CNY_TO_MYR_RATE||process.env.CNY_TO_MYR||0.60)};return amount*(rates[currency]||1)}
export default async function handler(req,res){
  if(req.method!=="POST") return json(res,405,{status:"error",msg:"Method not allowed"});
  try{
    const {productId,quantity=1,email,name,coupon=""}=req.body||{};
    if(!productId||!email||!name) return json(res,400,{status:"error",msg:"productId, email and name are required"});
    const p=await getProduct(productId);
    const qty=num(quantity,1); const min=Math.max(1,num(p?.min??p?.minimum??p?.min_qty??p?.min_quantity,1)); const max=Math.max(min,num(p?.max??p?.maximum??p?.max_qty??p?.max_quantity,1));
    if(!Number.isInteger(qty)||qty<min||qty>max) return json(res,400,{status:"error",msg:`Quantity must be between ${min} and ${max}`});
    const supplierCurrency=currencyOf(p);
    const supplierUnit=priceOf(p,supplierCurrency); if(!(supplierUnit>0)) return json(res,400,{status:"error",msg:"Supplier product has no valid price"});
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