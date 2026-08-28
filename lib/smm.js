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
    dripfeed: Boolean(s.dripfeed),
    averageTime: String(s.average_time ?? s.averageTime ?? s.completion_time ?? s.time ?? s.duration ?? '')
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

// Remove supplier services that contain Vietnamese wording. The owner wants
// the live catalogue to remain in the supplier's original language so it is
// easy to identify Vietnam-specific products, but Vietnam/Vietnamese services
// themselves must not be offered or shown to customers. We therefore filter
// them at the server before the catalogue reaches the browser.
function containsVietnamese(text) {
  const value = String(text || '').toLowerCase();

  // Vietnamese-specific letters/diacritics. This catches names such as
  // "Cảm Xúc", "Đang", "Tốc Độ", "Lời Mời Kết Bạn", etc.
  if (/[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(value)) return true;

  // Also catch Vietnamese words that can be written without diacritics.
  // Word boundaries prevent ordinary English words from being removed.
  const words = [
    'vietnam', 'viet', 'viet nam', 'clone viet', 'viet nam',
    'cam xuc', 'dang', 'tang', 'toc do', 'loi moi ket ban', 'ket ban',
    'binh luan', 'chia se', 'luot thich', 'luot xem', 'nguoi theo doi',
    'luot theo doi', 'tuong tac', 'danh gia', 'chinh hang', 'tu dong',
    'bao hanh', 'don hang', 'khach hang', 'tai khoan', 'mat khau',
    'thu nghiem', 'doc quyen', 'da quoc gia', 'dang moi', 'gia re',
    'khong tut', 'khong can mat khau', 'khong dat hang', 'tang like',
    'tang follow', 'tang view', 'tang comment', 'tang share', 'tang sub',
    'tang member', 'tang tuong tac', 'tang cam xuc', 'tang tim',
    'tang luu', 'tang yeu thich', 'tang vote', 'tang traffic', 'mat truc tiep'
  ];
  return words.some(word => new RegExp(`(^|[^a-z])${word.replace(/ /g, '\\\\s+')}($|[^a-z])`, 'i').test(value));
}

function isVietnamOnly(s) {
  const text = `${s.name} ${s.description} ${s.category} ${s.platform}`;
  return containsVietnamese(text);
}

export function publicServices(data) {
  // Supplier rates are in VND. Convert to MYR, then derive USD/CNY from MYR.
  // Apply a 30% markup to the supplier cost. Prices are rounded to 2 decimals.
  const vndToMyr = Number(process.env.VND_TO_MYR_RATE || 0.000156);
  const usdToMyr = Number(process.env.USD_TO_MYR_RATE || 4.04);
  const cnyToMyr = Number(process.env.CNY_TO_MYR_RATE || 0.60);
  const MARKUP = 1.30;

  return normalizeServices(data)
    // Show the supplier catalogue in its original language for now.
    // This is intentional: the owner needs to identify Vietnam-specific
    // services before deciding which service IDs should be removed.
    .filter(s => s.service && s.name)
    // Do not expose or allow checkout for services containing Vietnamese
    // wording. This is deliberately done server-side so hidden services are
    // also unavailable through getServiceById().
    .filter(s => !isVietnamOnly(s))
    .map(s => {
      const myr = s.rate * vndToMyr;
      const markedMyr = Math.round(myr * MARKUP * 100) / 100;
      const markedUsd = Math.round((markedMyr / usdToMyr) * 100) / 100;
      const markedCny = Math.round((markedMyr / cnyToMyr) * 100) / 100;
      return {
        ...s,
        // Keep supplier wording exactly as returned by the API so Vietnamese
        // services can be identified and removed deliberately.
        name: s.name,
        description: s.description,
        category: s.category,
        platformLabel: normalizePlatform(s),
        prices: {
          MYR: markedMyr,
          USD: markedUsd,
          CNY: markedCny
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
