// AGAR MAIN KING HOTA — poster generation Worker.
//
// Browser -> this Worker -> OpenAI images. The OpenAI key lives only in the
// Worker secret OPENAI_API_KEY. Because the Origin header can be faked by any
// script, the origin check is NOT a security boundary on its own; spend is
// bounded by the usage limits below.
//
// Required bindings (see backend/wrangler.toml):
//   OPENAI_API_KEY  secret     OpenAI key (set in Cloudflare, never in Git)
//   POSTER_USAGE    KV         per-visitor and site-wide daily counters
// Optional bindings:
//   POSTER_BURST    ratelimit  short-window burst limiter per visitor
//   PER_VISITOR_DAILY_LIMIT, SITE_DAILY_LIMIT, MAX_UPLOAD_MB   plain vars
//
// If POSTER_USAGE is missing the Worker refuses to generate (fails closed),
// so an unbounded deploy cannot happen by accident.

const ALLOWED_ORIGINS = new Set([
  "https://agarmainkinghota.com",
  "https://www.agarmainkinghota.com",
  "https://iamshahrock.github.io",
  "http://localhost:8788",
  "http://127.0.0.1:8788"
]);
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const DEFAULTS = { PER_VISITOR_DAILY_LIMIT: 5, SITE_DAILY_LIMIT: 100, MAX_UPLOAD_MB: 25 };
const DAY_TTL_SECONDS = 60 * 60 * 36; // counters expire on their own after the IST day ends

function intVar(env, name) {
  const n = Number.parseInt(env[name], 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULTS[name];
}

// Day key on Mumbai time so limits reset at IST midnight.
function istDay(now = Date.now()) {
  return new Date(now + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

// Visitor key: SHA-256 of IP + day. The raw IP is never stored, and the hash
// changes every day so visitors cannot be tracked across days.
async function visitorKey(ip, day) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${ip}|${day}`));
  return [...new Uint8Array(bytes)].slice(0, 16).map(b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://iamshahrock.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    const reply = (status, body, extra = {}) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, ...JSON_HEADERS, ...extra } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return reply(405, { error: "Use POST to generate a poster." });
    if (!ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "This website is not authorized to use the poster service." });
    if (!env.OPENAI_API_KEY) return reply(503, { error: "The poster service is not configured yet. Add the OPENAI_API_KEY secret in Cloudflare." });
    if (!env.POSTER_USAGE) return reply(503, { error: "The poster service is paused: usage limits are not configured." });

    // Reject oversized bodies before reading them.
    const maxBytes = intVar(env, "MAX_UPLOAD_MB") * 1024 * 1024;
    const declared = Number(request.headers.get("Content-Length") || 0);
    if (declared > maxBytes) return reply(413, { error: `Upload is too large (maximum ${intVar(env, "MAX_UPLOAD_MB")} MB in total).` });

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    // Burst limiter: blocks rapid repeat clicks and scripted floods.
    if (env.POSTER_BURST) {
      const { success } = await env.POSTER_BURST.limit({ key: ip });
      if (!success) return reply(429, { error: "Too many requests. Please wait a minute and try again." }, { "Retry-After": "60" });
    }

    // Daily limits. KV is eventually consistent, so under heavy parallel load
    // the counts can briefly undercount; they still bound spend to roughly
    // the configured numbers rather than leaving it open-ended.
    const day = istDay();
    const siteKey = `site:${day}`;
    const visKey = `visitor:${day}:${await visitorKey(ip, day)}`;
    const [siteUsed, visUsed] = await Promise.all([
      env.POSTER_USAGE.get(siteKey).then(v => Number(v) || 0),
      env.POSTER_USAGE.get(visKey).then(v => Number(v) || 0)
    ]);
    if (siteUsed >= intVar(env, "SITE_DAILY_LIMIT")) {
      return reply(429, { error: "Today's poster limit for the site has been reached. Come back after midnight IST." });
    }
    if (visUsed >= intVar(env, "PER_VISITOR_DAILY_LIMIT")) {
      return reply(429, { error: `You have made ${visUsed} posters today, the daily maximum. Come back after midnight IST.` });
    }

    try {
      const incoming = await request.formData();
      const prompt = incoming.get("prompt");
      if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 12000) {
        return reply(400, { error: "A poster prompt is required (maximum 12,000 characters)." });
      }
      const outgoing = new FormData();
      outgoing.append("model", "gpt-image-2");
      outgoing.append("prompt", prompt);
      outgoing.append("size", "1024x1536");
      outgoing.append("quality", "medium");
      outgoing.append("output_format", "png");
      outgoing.append("n", "1");
      let count = 0;
      let total = 0;
      for (const value of incoming.getAll("image")) {
        if (!(value instanceof File)) continue;
        if (!["image/png", "image/jpeg", "image/webp"].includes(value.type)) continue;
        if (value.size > 15 * 1024 * 1024) return reply(413, { error: "Each reference image must be smaller than 15 MB." });
        total += value.size;
        if (total > maxBytes) return reply(413, { error: `Upload is too large (maximum ${intVar(env, "MAX_UPLOAD_MB")} MB in total).` });
        outgoing.append("image[]", value, value.name || `reference-${count + 1}.png`);
        count++;
        if (count >= 8) break;
      }
      if (count === 0) return reply(400, { error: "Upload your photo and include at least one reference image." });

      // Count the attempt before calling OpenAI, so repeated failing or
      // aborted requests still use up the allowance.
      await Promise.all([
        env.POSTER_USAGE.put(siteKey, String(siteUsed + 1), { expirationTtl: DAY_TTL_SECONDS }),
        env.POSTER_USAGE.put(visKey, String(visUsed + 1), { expirationTtl: DAY_TTL_SECONDS })
      ]);

      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}` },
        body: outgoing
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message || "OpenAI could not generate the image. Please try again.";
        return reply(response.status >= 500 ? 502 : response.status, { error: message });
      }
      const image = data?.data?.[0]?.b64_json;
      if (!image) return reply(502, { error: "The image service returned no image. Please try again." });
      return reply(200, { image, revised_prompt: data.data[0].revised_prompt || null }, { "Cache-Control": "no-store" });
    } catch (error) {
      return reply(500, { error: "Poster request failed. Check your connection and try again." });
    }
  }
};
