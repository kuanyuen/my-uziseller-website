// Shared client for smm.appmmo.com API v2 + our pricing/cleaning rules.
// API credentials remain server-side.
const SMM_API_URL = process.env.SMM_API_URL || 'https://smm.appmmo.com/api/v2';

export async function callSmm(form) {
  const apiKey = process.env.SMM_API_KEY;
  if (!apiKey) throw new Error('SMM_API_KEY is not configured');
  const payload = new URLSearchParams();
  payload.set('key', apiKey);
  for (const [k, v] of Object.entries(form || {})) payload.set(k, String(v ?? ''));
  const r = await fetch(SMM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: payload.toString()
  });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); }
  catch { data = { error: 'Upstream did not return JSON', raw: text }; }
  return { httpStatus: r.status, data };
}

function toBool(v) {
  if (typeof v === 'boolean') return v;
  const x = String(v ?? '').trim().toLowerCase();
  return ['1','true','yes','y'].includes(x);
}

function normalizeServices(data) {
  // SMM API v2 normally returns an array. Some compatible providers wrap it
  // in {services:[...]}; support both forms.
  const list = Array.isArray(data)
    ? data
    : (Array.isArray(data?.services) ? data.services : []);
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
    refill: toBool(s.refill),
    cancel: toBool(s.cancel),
    dripfeed: toBool(s.dripfeed),
    averageTime: String(s.average_time ?? s.averageTime ?? s.completion_time ?? s.time ?? s.duration ?? '')
  }));
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

/*
 * IMPORTANT:
 * Only the PRODUCT IDENTITY fields are used for Vietnam filtering:
 *   - name
 *   - category
 *   - platform
 *
 * We intentionally DO NOT inspect description. The supplier can attach a
 * Vietnamese description to a global service; using description here was
 * causing the entire catalogue to be filtered out and the frontend showed
 * "All (0)".
 *
 * A product is removed when its identity contains Vietnamese diacritics or
 * clear Vietnam-specific wording. English/global products remain visible.
 */
function containsVietnameseRegionMarker(text) {
  const value = String(text || '').toLowerCase();

  // IMPORTANT: Vietnamese language is NOT a reason to remove a service.
  // We remove only services whose PRODUCT NAME explicitly identifies Vietnam
  // as the target market/region. Categories, platform labels and descriptions
  // are intentionally ignored for this rule.
  const patterns = [
    /\bvietnam\b/i,
    /\bviet\s+nam\b/i,
    /\bviệt\s+nam\b/i,
    /\bclone\s+việt\b/i,
    /\bclone\s+viet\b/i,
    /\bacc\s+việt\b/i,
    /\bacc\s+viet\b/i,
    /\bprofile\s+việt\b/i,
    /\bprofile\s+viet\b/i,
    /\bfacebook\s+vn\b/i,
    /\btiktok\s+vn\b/i,
    /\binstagram\s+vn\b/i,
    /\byoutube\s+vn\b/i,
    /\bvn\s+(?:account|acc|clone|profile|traffic|followers?|likes?|views?|comments?)\b/i,
    /\b(?:account|acc|clone|profile|traffic|followers?|likes?|views?|comments?)\s+vn\b/i
  ];

  return patterns.some(re => re.test(value));
}

function isVietnamService(s) {
  // Per the owner's rule: inspect ONLY the product name.
  return containsVietnameseRegionMarker(s.name);
}

function isTestService(s) {
  const text = String(s.name || '').toLowerCase();
  return /\btest(?:ing)?\b|\b测试\b|\bthử\s*nghiệm\b/i.test(text);
}

function shouldRemoveService(s) {
  if (isVietnamService(s)) return true;
  // Existing UziSeller rule: TikTok/Instagram keep usable production services,
  // not supplier test/testing entries. Do not remove legitimate global entries.
  const platform = normalizePlatform(s);
  if ((platform === 'TikTok' || platform === 'Instagram') && isTestService(s)) return true;
  return false;
}

export function publicServices(data) {
  const vndToMyr = Number(process.env.VND_TO_MYR_RATE || 0.000156);
  const usdToMyr = Number(process.env.USD_TO_MYR_RATE || 4.04);
  const cnyToMyr = Number(process.env.CNY_TO_MYR_RATE || 0.60);
  const MARKUP = 1.30;

  return normalizeServices(data)
    .filter(s => s.service && s.name)
    // Remove only Vietnam-specific service identities. Descriptions are not
    // used, so global services are not accidentally removed.
    .filter(s => !shouldRemoveService(s))
    .map(s => {
      const myr = s.rate * vndToMyr;
      const markedMyr = Math.round(myr * MARKUP * 100) / 100;
      const markedUsd = Math.round((markedMyr / usdToMyr) * 100) / 100;
      const markedCny = Math.round((markedMyr / cnyToMyr) * 100) / 100;
      return {
        ...s,
        name: s.name,
        description: s.description,
        category: s.category,
        platformLabel: normalizePlatform(s),
        prices: { MYR: markedMyr, USD: markedUsd, CNY: markedCny }
      };
    });
}

let cache = null;
let cacheAt = 0;
const CACHE_MS = 60_000;

export async function getLiveServices() {
  if (cache && Date.now() - cacheAt < CACHE_MS) return cache;
  const { data } = await callSmm({ action: 'services' });
  // If the upstream returns a JSON error object, do not silently turn it into
  // an empty catalogue. Surface the upstream error to the API caller.
  if (!Array.isArray(data) && !Array.isArray(data?.services)) {
    if (data?.error || data?.message || data?.msg) {
      throw new Error(String(data.error || data.message || data.msg));
    }
  }
  cache = publicServices(data);
  cacheAt = Date.now();
  return cache;
}

export async function getServiceById(serviceId) {
  const services = await getLiveServices();
  return services.find(s => s.service === String(serviceId)) || null;
}

export async function placeOrder({ service, link, quantity }) {
  const { data } = await callSmm({ action: 'add', service, link, quantity });
  return data;
}
