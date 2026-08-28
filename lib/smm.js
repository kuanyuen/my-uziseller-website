// Shared client for smm.appmmo.com API v2 + our pricing/cleaning rules.
// Used by api/smm.js (public catalogue), api/checkout.js (server-side price
// lookup) and api/billplz-webhook.js (placing the real supplier order).
const SMM_API_URL = process.env.SMM_API_URL || 'https://smm.appmmo.com/api/v2';

export async function callSmm(form) {
  const apiKey = process.env.SMM_API_KEY;
  if (!apiKey) throw new Error('SMM_API_KEY is not configured');
  const payload = new URLSearchParams();
  payload.set('key', apiKey);
  for (const [k, v] of Object.entries(form || {})) payload.set(k, String(v ?? ''));
  const r = await fetch(SMM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload.toString()
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { data = { error: 'Upstream did not return JSON', raw: text }; }
  return { httpStatus: r.status, data };
}

function normalizeServices(data) {
  const list = Array.isArray(data) ? data : (Array.isArray(data.services) ? data.services : []);
  return list.map(s => ({
    service: String(s.service ?? s.id ?? ''),
    name: String(s.name ?? ''),
    description: String(s.description ?? s.desc ?? ''),
    type: String(s.type ?? 'Default'),
    category: String(s.category ?? 'Other'),
    platform: String(s.platform ?? ''),
    rate: Number(s.rate ?? 0),
    min: Number(s.min ?? 0),
    max: Number(s.max ?? 0),
    refill: Boolean(s.refill),
    cancel: Boolean(s.cancel),
    dripfeed: Boolean(s.dripfeed)
  }));
}

function cleanName(name) {
  return String(name || '').replace(/KingSmm\.VN/gi, '').replace(/\s{2,}/g, ' ').trim();
}

const PLATFORM_RULES = [
  [/facebook|\bfb\b/i, 'Facebook'],
  [/tiktok/i, 'TikTok'],
  [/instagram|\big\b/i, 'Instagram'],
  [/youtube|\byt\b/i, 'YouTube'],
  [/threads/i, 'Threads'],
  [/telegram/i, 'Telegram'],
  [/twitter|\bx\.com\b/i, 'Twitter/X'],
  [/spotify/i, 'Spotify'],
  [/shopee/i, 'Shopee'],
  [/zalo/i, 'Zalo'],
  [/linkedin/i, 'LinkedIn'],
  [/website|seo|traffic/i, 'Website/SEO']
];

function normalizePlatform(s) {
  for (const [re, label] of PLATFORM_RULES) if (re.test(s.platform)) return label;
  for (const [re, label] of PLATFORM_RULES) if (re.test(s.category)) return label;
  for (const [re, label] of PLATFORM_RULES) if (re.test(s.name)) return label;
  return 'Others';
}

function isVietnamOnly(s) {
  const text = `${s.name} ${s.description} ${s.category} ${s.platform}`.toLowerCase();
  const vn = /\bviệt\b|\bvietnam\b|\bviet\b|🇻🇳/.test(text);
  const globalSignals = /global|worldwide|mixed|tây|international|world/.test(text);
  return vn && !globalSignals;
}

export function publicServices(data) {
  // Supplier rates are in VND. Convert to MYR, then derive USD/CNY from MYR.
  // No markup — prices shown/charged are the original supplier cost price.
  const vndToMyr = Number(process.env.VND_TO_MYR_RATE || 0.000156);
  const usdToMyr = Number(process.env.USD_TO_MYR_RATE || 4.04);
  const cnyToMyr = Number(process.env.CNY_TO_MYR_RATE || 0.60);

  return normalizeServices(data)
    .filter(s => s.service && s.name && !isVietnamOnly(s))
    .map(s => {
      const myr = s.rate * vndToMyr;
      return {
        ...s,
        name: cleanName(s.name),
        description: cleanName(s.description),
        category: cleanName(s.category),
        platformLabel: normalizePlatform(s),
        prices: {
          MYR: Math.round(myr * 100) / 100,
          USD: Math.round((myr / usdToMyr) * 100) / 100,
          CNY: Math.round((myr / cnyToMyr) * 100) / 100
        }
      };
    });
}

let cache = null;
let cacheAt = 0;
const CACHE_MS = 60_000; // avoid hammering the supplier on every checkout click

export async function getLiveServices() {
  if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
  const { data } = await callSmm({ action: 'services' });
  cache = publicServices(data);
  cacheAt = Date.now();
  return cache;
}

export async function getServiceById(serviceId) {
  const services = await getLiveServices();
  return services.find(s => s.service === String(serviceId)) || null;
}

// Places a real order with the supplier. Expects { order: <id> } on success.
export async function placeOrder({ service, link, quantity }) {
  const { data } = await callSmm({ action: 'add', service, link, quantity });
  return data;
}
