// Public SMM catalogue endpoint + server-side admin actions.
// The API key never leaves the server.
import { getLiveServices } from '../lib/smm.js';

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

    // Supplier order/status/balance actions are deliberately NOT exposed as public HTTP endpoints.
    // Real customer orders go through /api/checkout -> Billplz webhook -> lib/smm.js.
    // This prevents visitors from spending supplier balance or probing supplier data.
    return json(res, 400, { error: 'Unknown action' });
  } catch (e) {
    return json(res, 500, { error: e.message });
  }
}
