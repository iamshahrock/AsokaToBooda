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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    const reply = (status, body, extra = {}) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, ...JSON_HEADERS, ...extra } });

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const path = new URL(request.url).pathname;
    if (path === "/billboard") return billboard(request, env, reply, origin);
    if (path === "/starks/earn" || path === "/starks/me") return starks(request, env, reply, origin, path);
    if (path === "/track") return track(request, env, reply, origin);
    if (path === "/stats") return stats(request, env, reply);
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
        await bump(env, day, "poster_failed");
        return reply(response.status >= 500 ? 502 : response.status, { error: message });
      }
      const image = data?.data?.[0]?.b64_json;
      if (!image) return reply(502, { error: "The image service returned no image. Please try again." });
      await bump(env, day, "posters");
      return reply(200, { image, revised_prompt: data.data[0].revised_prompt || null }, { "Cache-Control": "no-store" });
    } catch (error) {
      return reply(500, { error: "Poster request failed. Check your connection and try again." });
    }
  }
};

// ---------------- Platform data (D1: DB) ----------------
// The Worker is the source of truth for STARKS: every award is checked against
// the same rules the site shows (amount ceiling and daily count per reason).
// Visitor numbers are counted with a random per-browser id (no IP, no cookies).
const RULES = {
  visit: [10, 1], poster: [100, 5], share: [50, 1], lair: [1000, 18], firstclear: [100, 6],
  throne: [400, 3], flush: [1000, 3], allsix: [500, 1], chess: [500, 5],
  chapter: [250, 12], verdict: [750, 2]
};
const CARRY_MAX = 3000;
const BB_TIERS = [[0, "Fan"], [500, "Rebel"], [1500, "Prince"], [4000, "King"], [10000, "Royal Flush"]];
const BB_BLOCK = /(fuck|shit|bitch|chut|madarch|bhench|behench|randi|gaand|lund|porn|sex|nazi)/i;
function bbTier(n) { let t = "Fan"; for (const [at, name] of BB_TIERS) if (n >= at) t = name; return t; }
function bbName(raw) {
  const name = String(raw || "").replace(/[^\p{L}\p{N} ._-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 18);
  if (name.length < 2 || BB_BLOCK.test(name)) return null;
  return name;
}
const okDevice = d => /^[a-f0-9]{16,40}$/.test(String(d || ""));
async function bump(env, day, metric, by = 1) {
  if (!env.DB) return;
  try { await env.DB.prepare("INSERT INTO daily(day,metric,n) VALUES(?1,?2,?3) ON CONFLICT(day,metric) DO UPDATE SET n=n+?3").bind(day, metric, by).run(); } catch (e) {}
}
async function readBody(request) { try { return JSON.parse(await request.text()); } catch (e) { return null; } }
async function burst(env, key) {
  if (!env.EARN_BURST) return true;
  const { success } = await env.EARN_BURST.limit({ key }); return success;
}
async function topBoard(env, limit = 50) {
  const r = await env.DB.prepare("SELECT name, balance FROM players WHERE joined=1 AND balance>0 ORDER BY balance DESC, updated ASC LIMIT ?1").bind(limit).all();
  return (r.results || []).map((e, i) => ({ rank: i + 1, name: e.name, starks: e.balance, tier: bbTier(e.balance) }));
}
async function player(env, device) {
  return await env.DB.prepare("SELECT device,name,joined,balance FROM players WHERE device=?1").bind(device).first();
}
async function ensurePlayer(env, device, carry) {
  let p = await player(env, device);
  if (p) return p;
  const now = Date.now(), start = Math.max(0, Math.min(CARRY_MAX, Math.floor(Number(carry) || 0)));
  await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO players(device,name,joined,balance,created,updated) VALUES(?1,'',0,?2,?3,?3)").bind(device, start, now),
    ...(start ? [env.DB.prepare("INSERT INTO ledger(device,reason,amount,note,ts) VALUES(?1,'carry',?2,'Carried over from this device',?3)").bind(device, start, now)] : [])
  ]);
  return await player(env, device);
}

// GET /billboard -> top 50 joined players.  POST /billboard {device, name} -> join / rename.
async function billboard(request, env, reply, origin) {
  if (!env.DB) return reply(503, { error: "The Billboard is not configured yet." });
  if (request.method === "GET") {
    const [top, cnt] = await Promise.all([topBoard(env), env.DB.prepare("SELECT COUNT(*) AS n FROM players WHERE joined=1").first()]);
    return reply(200, { top, players: cnt ? cnt.n : 0, updated: Date.now() }, { "Cache-Control": "no-store" });
  }
  if (request.method !== "POST") return reply(405, { error: "Use GET or POST." });
  if (!ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "This website is not authorized to use the Billboard." });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await burst(env, "bb:" + ip))) return reply(429, { error: "Too many Billboard updates. Try again in a minute." });
  const body = await readBody(request);
  if (!body) return reply(400, { error: "Send JSON." });
  if (!okDevice(body.device)) return reply(400, { error: "Unknown device." });
  const leave = body.leave === true;
  const name = leave ? "" : bbName(body.name);
  if (!leave && !name) return reply(400, { error: "Choose a name of 2 to 18 letters (no bad words)." });
  await ensurePlayer(env, body.device, body.carry ?? body.starks);
  await env.DB.prepare("UPDATE players SET name=CASE WHEN ?2='' THEN name ELSE ?2 END, joined=?3, updated=?4 WHERE device=?1").bind(body.device, name, leave ? 0 : 1, Date.now()).run();
  const p = await player(env, body.device);
  const rank = p.joined ? (await env.DB.prepare("SELECT COUNT(*) AS n FROM players WHERE joined=1 AND balance>?1").bind(p.balance).first()).n + 1 : null;
  return reply(200, { rank, starks: p.balance, tier: bbTier(p.balance), name: p.name, joined: !!p.joined, top: await topBoard(env) });
}

// POST /starks/earn {device, reason, amount, note, once, carry} -> {awarded, balance}
// GET  /starks/me?device=… -> {balance, tier, name, joined, rank, history}
async function starks(request, env, reply, origin, path) {
  if (!env.DB) return reply(503, { error: "STARKS are not configured yet." });
  if (path === "/starks/me") {
    const device = new URL(request.url).searchParams.get("device");
    if (!okDevice(device)) return reply(400, { error: "Unknown device." });
    const p = await player(env, device);
    if (!p) return reply(200, { balance: null }, { "Cache-Control": "no-store" });
    const [h, r] = await Promise.all([
      env.DB.prepare("SELECT reason,amount,note,ts FROM ledger WHERE device=?1 ORDER BY ts DESC LIMIT 30").bind(device).all(),
      p.joined ? env.DB.prepare("SELECT COUNT(*) AS n FROM players WHERE joined=1 AND balance>?1").bind(p.balance).first() : null
    ]);
    return reply(200, { balance: p.balance, tier: bbTier(p.balance), name: p.name, joined: !!p.joined, rank: r ? r.n + 1 : null, history: h.results || [] }, { "Cache-Control": "no-store" });
  }
  if (request.method !== "POST") return reply(405, { error: "Use POST." });
  if (!ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "This website is not authorized to award STARKS." });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await burst(env, "earn:" + ip))) return reply(429, { error: "Too many awards at once. Try again in a minute." });
  const body = await readBody(request);
  if (!body || !okDevice(body.device)) return reply(400, { error: "Unknown device." });
  const rule = RULES[body.reason];
  if (!rule) return reply(400, { error: "Unknown reason." });
  const amount = Math.max(0, Math.min(rule[0], Math.round(Number(body.amount) || 0)));
  if (!amount) return reply(400, { error: "Nothing to award." });
  const p = await ensurePlayer(env, body.device, body.carry);
  const day = istDay(), now = Date.now();
  const used = await env.DB.prepare("SELECT n FROM earn_day WHERE device=?1 AND day=?2 AND reason=?3").bind(body.device, day, body.reason).first();
  if (used && used.n >= rule[1]) return reply(200, { awarded: 0, reason: "daily-cap", balance: p.balance, tier: bbTier(p.balance) });
  const once = body.once ? String(body.once).slice(0, 60) : null;
  if (once && await env.DB.prepare("SELECT 1 AS x FROM once_awards WHERE device=?1 AND once_id=?2").bind(body.device, once).first()) {
    return reply(200, { awarded: 0, reason: "already", balance: p.balance, tier: bbTier(p.balance) });
  }
  const note = String(body.note || "").replace(/[<>]/g, "").slice(0, 80);
  const stmts = [
    env.DB.prepare("INSERT INTO earn_day(device,day,reason,n,pts) VALUES(?1,?2,?3,1,?4) ON CONFLICT(device,day,reason) DO UPDATE SET n=n+1, pts=pts+?4").bind(body.device, day, body.reason, amount),
    env.DB.prepare("UPDATE players SET balance=balance+?2, updated=?3 WHERE device=?1").bind(body.device, amount, now),
    env.DB.prepare("INSERT INTO ledger(device,reason,amount,note,ts) VALUES(?1,?2,?3,?4,?5)").bind(body.device, body.reason, amount, note, now),
    env.DB.prepare("INSERT INTO daily(day,metric,n) VALUES(?1,?2,1) ON CONFLICT(day,metric) DO UPDATE SET n=n+1").bind(day, "earn:" + body.reason),
    env.DB.prepare("INSERT INTO daily(day,metric,n) VALUES(?1,'starks',?2) ON CONFLICT(day,metric) DO UPDATE SET n=n+?2").bind(day, amount)
  ];
  if (once) stmts.push(env.DB.prepare("INSERT OR IGNORE INTO once_awards(device,once_id,ts) VALUES(?1,?2,?3)").bind(body.device, once, now));
  await env.DB.batch(stmts);
  const after = p.balance + amount;
  return reply(200, { awarded: amount, balance: after, tier: bbTier(after) });
}

// POST /track {vid, path} (sent with sendBeacon as text/plain) -> 204
async function track(request, env, reply, origin) {
  if (request.method !== "POST") return reply(405, { error: "Use POST." });
  if (!env.DB || (origin && !ALLOWED_ORIGINS.has(origin))) return new Response(null, { status: 204 });
  const body = await readBody(request);
  if (!body || !okDevice(body.vid)) return new Response(null, { status: 204 });
  let path = String(body.path || "/").split("?")[0].split("#")[0].slice(0, 80) || "/";
  path = path.replace(/\/index\.html$/i, "/").replace(/agarmainkinghota\.html$/i, "");
  if (!path.startsWith("/")) path = "/" + path;
  const day = istDay();
  try {
    const seen = await env.DB.prepare("INSERT OR IGNORE INTO visitors(day,vid) VALUES(?1,?2)").bind(day, body.vid).run();
    const stmts = [
      env.DB.prepare("INSERT INTO pages(day,path,n) VALUES(?1,?2,1) ON CONFLICT(day,path) DO UPDATE SET n=n+1").bind(day, path),
      env.DB.prepare("INSERT INTO daily(day,metric,n) VALUES(?1,'pageviews',1) ON CONFLICT(day,metric) DO UPDATE SET n=n+1").bind(day),
      env.DB.prepare("INSERT OR IGNORE INTO first_seen(vid,day) VALUES(?1,?2)").bind(body.vid, day)
    ];
    if (seen.meta && seen.meta.changes) stmts.push(env.DB.prepare("INSERT INTO daily(day,metric,n) VALUES(?1,'visitors',1) ON CONFLICT(day,metric) DO UPDATE SET n=n+1").bind(day));
    await env.DB.batch(stmts);
  } catch (e) {}
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": origin || "*" } });
}

// GET /stats -> aggregated platform numbers (no personal data)
async function stats(request, env, reply) {
  if (!env.DB) return reply(503, { error: "Stats are not configured yet." });
  const today = istDay(), d7 = istDay(Date.now() - 6 * 864e5), d30 = istDay(Date.now() - 29 * 864e5);
  const q = (sql, ...b) => env.DB.prepare(sql).bind(...b);
  const [days, totals, uniq, first, pages, players, u7] = await env.DB.batch([
    q("SELECT day, metric, n FROM daily WHERE day>=?1 ORDER BY day", d30),
    q("SELECT metric, SUM(n) AS n FROM daily GROUP BY metric"),
    q("SELECT COUNT(*) AS n FROM first_seen"),
    q("SELECT MIN(day) AS d FROM first_seen"),
    q("SELECT path, SUM(n) AS n FROM pages WHERE day>=?1 GROUP BY path ORDER BY n DESC LIMIT 12", d30),
    q("SELECT COUNT(*) AS all_players, SUM(joined) AS joined, COALESCE(SUM(balance),0) AS starks FROM players"),
    q("SELECT COUNT(DISTINCT vid) AS n FROM visitors WHERE day>=?1", d7)
  ]);
  const byDay = {};
  for (const r of days.results || []) (byDay[r.day] = byDay[r.day] || { day: r.day })[r.metric] = r.n;
  const tot = {}; for (const r of totals.results || []) tot[r.metric] = r.n;
  const pl = (players.results || [])[0] || {};
  const t = byDay[today] || {};
  return reply(200, {
    asOf: new Date().toISOString(), timezone: "Asia/Kolkata", trackingSince: (first.results[0] || {}).d || null,
    today: { visitors: t.visitors || 0, pageviews: t.pageviews || 0, posters: t.posters || 0 },
    last7: { visitors: (u7.results[0] || {}).n || 0 },
    total: {
      visitors: (uniq.results[0] || {}).n || 0, pageviews: tot.pageviews || 0, posters: tot.posters || 0,
      shares: tot["earn:share"] || 0, lairClears: tot["earn:lair"] || 0, thrones: tot["earn:throne"] || 0,
      chessWins: tot["earn:chess"] || 0, storyChapters: tot["earn:chapter"] || 0, starksAwarded: tot.starks || 0,
      players: pl.all_players || 0, billboardNames: pl.joined || 0
    },
    days: Object.values(byDay),
    topPages: pages.results || []
  }, { "Cache-Control": "public, max-age=60" });
}
