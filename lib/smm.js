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
    refill: Boolean(s.refill),
    cancel: Boolean(s.cancel),
    dripfeed: Boolean(s.dripfeed),
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
function containsVietnameseIdentity(text) {
  const value = String(text || '').toLowerCase();

  // Vietnamese-specific letters/diacritics. We deliberately check only
  // identity fields, not the supplier description.
  if (/[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(value)) {
    return true;
  }

  // Common Vietnam-specific words/phrases, including unaccented variants.
  const words = [
    'vietnam', 'viet nam', 'viet', 'clone viet',
    'cam xuc', 'cảm xúc',
    'dang', 'đang',
    'tang', 'tăng',
    'toc do', 'tốc độ',
    'loi moi ket ban', 'lời mời kết bạn',
    'ket ban', 'kết bạn',
    'binh luan', 'bình luận',
    'chia se', 'chia sẻ',
    'luot thich', 'lượt thích',
    'luot xem', 'lượt xem',
    'nguoi theo doi', 'người theo dõi',
    'luot theo doi', 'lượt theo dõi',
    'tuong tac', 'tương tác',
    'danh gia', 'đánh giá',
    'chinh hang', 'chính hãng',
    'tu dong', 'tự động',
    'bao hanh', 'bảo hành',
    'don hang', 'đơn hàng',
    'khach hang', 'khách hàng',
    'tai khoan', 'tài khoản',
    'mat khau', 'mật khẩu',
    'thu nghiem', 'thử nghiệm',
    'doc quyen', 'độc quyền',
    'da quoc gia', 'đa quốc gia',
    'dang moi', 'đang mới',
    'gia re', 'giá rẻ',
    'khong tut', 'không tụt',
    'khong can mat khau', 'không cần mật khẩu',
    'khong dat hang', 'không đặt hàng',
    'tang like', 'tăng like',
    'tang follow', 'tăng follow',
    'tang view', 'tăng view',
    'tang comment', 'tăng comment',
    'tang share', 'tăng share',
    'tang sub', 'tăng sub',
    'tang member', 'tăng member',
    'tang tuong tac', 'tăng tương tác',
    'tang cam xuc', 'tăng cảm xúc',
    'tang tim', 'tăng tim',
    'tang luu', 'tăng lưu',
    'tang yeu thich', 'tăng yêu thích',
    'tang vote', 'tăng vote',
    'tang traffic', 'tăng traffic',
    'mat truc tiep', 'mắt trực tiếp'
  ];

  // Match phrases as token sequences, while allowing punctuation such as
  // brackets/hyphens around them.
  return words.some(word => {
    const escaped = word.trim().split(/\s+/).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
    return new RegExp(`(^|[^a-z])${escaped}($|[^a-z])`, 'i').test(value);
  });
}

function isVietnamService(s) {
  // Name is the primary signal. Category/platform are secondary signals.
  const identity = `${s.name} ${s.category} ${s.platform}`;
  return containsVietnameseIdentity(identity);
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
    .filter(s => !isVietnamService(s))
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
