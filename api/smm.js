// Public SMM catalogue endpoint + server-side admin actions.
// The API key never leaves the server.
import { callSmm, getLiveServices, placeOrder } from '../lib/smm.js';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  try {
    const action = String(req.query.action || 'services');

    if (req.method === 'GET' && action === 'services') {
      const services = await getLiveServices();
      return json(res, 200, { services });
    }

    // These endpoints are intentionally server-side only and should be
    // protected before production use (admin password, etc.) — the checkout
    // flow places real orders through lib/smm.js from the payment webhook
    // instead of calling this endpoint directly.
    if (req.method === 'POST' && action === 'add') {
      const body = req.body || {};
      const required = ['service', 'link', 'quantity'];
      for (const k of required) if (!body[k]) return json(res, 400, { error: `Missing ${k}` });
      const data = await placeOrder({ service: body.service, link: body.link, quantity: body.quantity });
      return json(res, 200, data);
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
