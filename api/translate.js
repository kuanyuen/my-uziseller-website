const TRANSLATION_URL = "https://api.mymemory.translated.net/get";
const CACHE_LIMIT = 1000;
const cache = new Map();
const pending = new Map();
const requestCounts = new Map();

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(body));
}

async function translate(text) {
  if (cache.has(text)) return cache.get(text);
  if (pending.has(text)) return pending.get(text);

  const request = (async () => {
    const url = new URL(TRANSLATION_URL);
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", "autodetect|zh-CN");
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Translation service returned HTTP ${response.status}`);
    const data = await response.json();
    const result = String(data?.responseData?.translatedText || "").trim();
    if (!result || Number(data?.responseStatus) !== 200 || data?.quotaFinished) {
      throw new Error(String(data?.responseDetails || "Translation service returned no translation"));
    }
    cache.set(text, result);
    if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
    return result;
  })();

  pending.set(text, request);
  try {
    return await request;
  } finally {
    pending.delete(text);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { status: "error", msg: "Method not allowed" });

  const now = Date.now();
  const clientIp = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const requestWindow = requestCounts.get(clientIp) || { startedAt: now, count: 0 };
  if (now - requestWindow.startedAt >= 60_000) {
    requestWindow.startedAt = now;
    requestWindow.count = 0;
  }
  if (requestWindow.count >= 20) {
    return json(res, 429, { status: "error", msg: "Translation request limit reached; please retry shortly" });
  }
  requestWindow.count += 1;
  requestCounts.set(clientIp, requestWindow);
  if (requestCounts.size > 5000) {
    for (const [ip, entry] of requestCounts) {
      if (now - entry.startedAt > 60_000) requestCounts.delete(ip);
    }
  }

  const texts = req.body?.texts;
  if (!Array.isArray(texts) || texts.length > 12) {
    return json(res, 400, { status: "error", msg: "Provide up to 12 texts for translation" });
  }

  const cleanTexts = texts.map(text => String(text || "").trim());
  const totalLength = cleanTexts.reduce((total, text) => total + text.length, 0);
  if (cleanTexts.some(text => !text || text.length > 500) || totalLength > 2500) {
    return json(res, 400, { status: "error", msg: "Translation text exceeds the request limits" });
  }

  const translations = await Promise.all(cleanTexts.map(async text => {
    try {
      return { text, translation: await translate(text) };
    } catch (error) {
      console.error("Product translation failed:", error.message);
      return { text, translation: text, error: error.message };
    }
  }));

  const hasErrors = translations.some(item => item.error);
  return json(res, 200, {
    status: hasErrors ? "partial" : "success",
    translations,
    ...(hasErrors ? { warning: "Some text could not be translated; supplier text is shown instead" } : {})
  });
}
