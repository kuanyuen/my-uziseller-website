const SMM_API_URL = process.env.SMM_API_URL || 'https://smm.appmmo.com/api/v2';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

async function callSmm(form) {
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

function isVietnamOnly(s) {
  const text = `${s.name} ${s.description} ${s.category} ${s.platform}`.toLowerCase();
  const vn = /\bviệt\b|\bvietnam\b|\bviet\b|🇻🇳/.test(text);
  const globalSignals = /global|worldwide|mixed|tây|international|world/.test(text);
  return vn && !globalSignals;
}

function publicServices(data) {
  return normalizeServices(data)
    .filter(s => s.service && s.name && !isVietnamOnly(s))
    .map(s => ({
      ...s,
      name: cleanName(s.name),
      description: cleanName(s.description),
      category: cleanName(s.category),
      // UziSeller pricing rule: supplier rate + 30%.
      customerRate: Math.round(s.rate * 1.3 * 100) / 100
    }));
}

export default async function handler(req, res) {
  try {
    const action = String(req.query.action || 'services');

    // Public catalogue endpoint. The API key never leaves the server.
    if (req.method === 'GET' && action === 'services') {
      const r = await callSmm({ action: 'services' });
      if (r.httpStatus >= 400) return json(res, r.httpStatus, r.data);
      return json(res, 200, { services: publicServices(r.data) });
    }

    // These endpoints are intentionally server-side only and should be protected before production use.
    if (req.method === 'POST' && action === 'add') {
      const body = req.body || {};
      const required = ['service', 'link', 'quantity'];
      for (const k of required) if (!body[k]) return json(res, 400, { error: `Missing ${k}` });
      const r = await callSmm({ action: 'add', service: body.service, link: body.link, quantity: body.quantity, runs: body.runs || '', interval: body.interval || '', comments: body.comments || '' });
      return json(res, r.httpStatus, r.data);
    }

    if (req.method === 'POST' && action === 'status') {
      if (!req.body?.order) return json(res, 400, { error: 'Missing order' });
      const r = await callSmm({ action: 'status', order: req.body.order });
      return json(res, r.httpStatus, r.data);
    }

    if (req.method === 'GET' && action === 'balance') {
      const r = await callSmm({ action: 'balance' });
      return json(res, r.httpStatus, r.data);
    }

    return json(res, 400, { error: 'Unknown action' });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
