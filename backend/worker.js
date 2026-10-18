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
    if (path === "/d2k") return d2k(request, env, reply, origin);
    if (path === "/ai-submit") return aiSubmit(request, env, reply, origin);
    if (path === "/inquilab") return inquilab(request, env, reply, origin);
    if (path === "/lairs/claim") return lairsClaim(request, env, reply, origin);
    if (path === "/comments" || path.startsWith("/comments/")) return comments(request, env, reply, origin, path);
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
  chapter: [250, 12], verdict: [750, 2], pledge: [50, 1], vote: [10, 6], inquilab: [50, 1],
  clipsubmit: [50, 3], comment: [10, 3]
};
// Awarded only by the Worker itself, after a clip is approved in data/lairs-cinema.json
const SERVER_RULES = { clip: [500, 3], sotw: [2000, 1] };
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

// ---------------- DOOM to KING: fan votes and the "watching both" pledge ----------------
// GET  /d2k -> { rounds: { "1": {doom, both, king}, ... }, pledges }
// POST /d2k {device, round (1-6), pick: doom|both|king}  or  {device, pledge: true}
async function d2kState(env) {
  const [v, p] = await env.DB.batch([
    env.DB.prepare("SELECT round, pick, COUNT(*) AS n FROM d2k_votes GROUP BY round, pick"),
    env.DB.prepare("SELECT COUNT(*) AS n FROM d2k_pledges")
  ]);
  const rounds = {};
  for (let r = 1; r <= 6; r++) rounds[r] = { doom: 0, both: 0, king: 0 };
  for (const row of v.results || []) if (rounds[row.round] && row.pick in rounds[row.round]) rounds[row.round][row.pick] = row.n;
  return { rounds, pledges: ((p.results || [])[0] || {}).n || 0 };
}
async function d2k(request, env, reply, origin) {
  if (!env.DB) return reply(503, { error: "Not configured yet." });
  if (request.method === "GET") return reply(200, await d2kState(env), { "Cache-Control": "no-store" });
  if (request.method !== "POST") return reply(405, { error: "Use GET or POST." });
  if (!ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "This website is not authorized." });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await burst(env, "d2k:" + ip))) return reply(429, { error: "Too many votes at once. Try again in a minute." });
  const body = await readBody(request);
  if (!body || !okDevice(body.device)) return reply(400, { error: "Unknown device." });
  const now = Date.now(), day = istDay();
  if (body.pledge === true) {
    const r = await env.DB.prepare("INSERT OR IGNORE INTO d2k_pledges(device, ts) VALUES(?1, ?2)").bind(body.device, now).run();
    if (r.meta && r.meta.changes) await bump(env, day, "d2k_pledge");
  } else {
    const round = Number(body.round), pick = String(body.pick || "");
    if (!(round >= 1 && round <= 6) || !["doom", "both", "king"].includes(pick)) return reply(400, { error: "Choose a round and a side." });
    await env.DB.prepare("INSERT INTO d2k_votes(device, round, pick, ts) VALUES(?1, ?2, ?3, ?4) ON CONFLICT(device, round) DO UPDATE SET pick=?3, ts=?4").bind(body.device, round, pick, now).run();
    await bump(env, day, "d2k_vote");
  }
  return reply(200, await d2kState(env));
}

// ---------------- Fan AI work submissions (reviewed by the daily scan) ----------------
// POST /ai-submit {url, handle, note, device} -> stored as pending
// GET  /ai-submit -> { pending: [{id, url, platform, handle, note, ts}] }  (public links only)
const AI_HOSTS = [["youtube", /(^|\.)youtube\.com$|(^|\.)youtu\.be$/], ["instagram", /(^|\.)instagram\.com$/], ["x", /(^|\.)x\.com$|(^|\.)twitter\.com$/], ["facebook", /(^|\.)facebook\.com$|(^|\.)fb\.watch$/]];
async function aiSubmit(request, env, reply, origin) {
  if (!env.DB) return reply(503, { error: "Not configured yet." });
  if (request.method === "GET") {
    const r = await env.DB.prepare("SELECT id, url, platform, handle, note, ts FROM ai_submissions WHERE status='pending' ORDER BY ts ASC LIMIT 200").all();
    return reply(200, { pending: r.results || [] }, { "Cache-Control": "no-store" });
  }
  if (request.method !== "POST") return reply(405, { error: "Use GET or POST." });
  if (!ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "This website is not authorized." });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await burst(env, "ai:" + ip))) return reply(429, { error: "Too many submissions. Try again in a minute." });
  const body = await readBody(request);
  let u; try { u = new URL(String(body && body.url || "")); } catch (e) { return reply(400, { error: "Paste the full link to your post." }); }
  if (u.protocol !== "https:") return reply(400, { error: "Paste the full https:// link to your post." });
  const host = u.hostname.toLowerCase(), plat = AI_HOSTS.find(h => h[1].test(host));
  if (!plat) return reply(400, { error: "Links from YouTube, Instagram, X or Facebook only." });
  const url = u.origin + u.pathname + (plat[0] === "youtube" && u.searchParams.get("v") ? "?v=" + u.searchParams.get("v") : "");
  const handle = String(body.handle || "").replace(/[<>]/g, "").trim().slice(0, 40);
  const note = String(body.note || "").replace(/[<>]/g, "").trim().slice(0, 140);
  const r = await env.DB.prepare("INSERT OR IGNORE INTO ai_submissions(url, platform, handle, note, device, ts, status) VALUES(?1, ?2, ?3, ?4, ?5, ?6, 'pending')").bind(url, plat[0], handle, note, okDevice(body.device) ? body.device : "", Date.now()).run();
  if (r.meta && r.meta.changes) await bump(env, istDay(), "ai_submission");
  return reply(200, { ok: true, duplicate: !(r.meta && r.meta.changes), platform: plat[0] });
}

// ---------------- INQUILAAB: fans joining the revolt (#FreeMyFace) ----------------
// GET /inquilab -> { joined }   POST /inquilab {device} -> { joined, added }
async function inquilab(request, env, reply, origin) {
  if (!env.DB) return reply(503, { error: "Not configured yet." });
  const count = async () => ((await env.DB.prepare("SELECT COUNT(*) AS n FROM inquilab_joins").first()) || {}).n || 0;
  if (request.method === "GET") return reply(200, { joined: await count() }, { "Cache-Control": "no-store" });
  if (request.method !== "POST") return reply(405, { error: "Use GET or POST." });
  if (!ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "This website is not authorized." });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await burst(env, "inq:" + ip))) return reply(429, { error: "Too many requests. Try again in a minute." });
  const body = await readBody(request);
  if (!body || !okDevice(body.device)) return reply(400, { error: "Unknown device." });
  const r = await env.DB.prepare("INSERT OR IGNORE INTO inquilab_joins(device, ts) VALUES(?1, ?2)").bind(body.device, Date.now()).run();
  const added = !!(r.meta && r.meta.changes);
  if (added) await bump(env, istDay(), "inquilab_join");
  return reply(200, { joined: await count(), added });
}


// ---------------- Lairs Cinema: STARKS for approved fan clips ----------------
// Fans make a clip on their own Kling / Gemini / Wan account, post it, and submit the link
// (/ai-submit, note starts "#lair:<chapter>"). The daily review approves clips by adding them
// to data/lairs-cinema.json on the site. POST /lairs/claim {device} pays 500 STARKS once per
// approved clip (3 a day) and 2,000 once for a Scene of the week.
const CINEMA_URL = "https://agarmainkinghota.com/data/lairs-cinema.json";
async function grant(env, device, reason, amount, note, once) {
  const rule = SERVER_RULES[reason]; if (!rule) return 0;
  amount = Math.max(0, Math.min(rule[0], Math.round(amount)));
  const day = istDay(), now = Date.now();
  const used = await env.DB.prepare("SELECT n FROM earn_day WHERE device=?1 AND day=?2 AND reason=?3").bind(device, day, reason).first();
  if (used && used.n >= rule[1]) return 0;
  if (await env.DB.prepare("SELECT 1 AS x FROM once_awards WHERE device=?1 AND once_id=?2").bind(device, once).first()) return 0;
  await env.DB.batch([
    env.DB.prepare("INSERT INTO earn_day(device,day,reason,n,pts) VALUES(?1,?2,?3,1,?4) ON CONFLICT(device,day,reason) DO UPDATE SET n=n+1, pts=pts+?4").bind(device, day, reason, amount),
    env.DB.prepare("UPDATE players SET balance=balance+?2, updated=?3 WHERE device=?1").bind(device, amount, now),
    env.DB.prepare("INSERT INTO ledger(device,reason,amount,note,ts) VALUES(?1,?2,?3,?4,?5)").bind(device, reason, amount, String(note).slice(0, 80), now),
    env.DB.prepare("INSERT INTO daily(day,metric,n) VALUES(?1,?2,1) ON CONFLICT(day,metric) DO UPDATE SET n=n+1").bind(day, "earn:" + reason),
    env.DB.prepare("INSERT INTO daily(day,metric,n) VALUES(?1,'starks',?2) ON CONFLICT(day,metric) DO UPDATE SET n=n+?2").bind(day, amount),
    env.DB.prepare("INSERT OR IGNORE INTO once_awards(device,once_id,ts) VALUES(?1,?2,?3)").bind(device, once, now)
  ]);
  return amount;
}
async function lairsClaim(request, env, reply, origin) {
  if (!env.DB) return reply(503, { error: "Not configured yet." });
  if (request.method !== "POST") return reply(405, { error: "Use POST." });
  if (!ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "This website is not authorized." });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await burst(env, "claim:" + ip))) return reply(429, { error: "Too many checks. Try again in a minute." });
  const body = await readBody(request);
  if (!body || !okDevice(body.device)) return reply(400, { error: "Unknown device." });
  const mine = (await env.DB.prepare("SELECT id, url FROM ai_submissions WHERE device=?1 ORDER BY ts DESC LIMIT 100").bind(body.device).all()).results || [];
  const pending = mine.length;
  if (!pending) return reply(200, { awarded: 0, approved: 0, submitted: 0 });
  let list = [];
  try {
    const r = await fetch(CINEMA_URL, { cf: { cacheTtl: 300, cacheEverything: true } });
    if (r.ok) { const j = await r.json(); list = Array.isArray(j.clips) ? j.clips : []; }
  } catch (e) {}
  const byId = new Map(mine.map(m => [Number(m.id), m.url]));
  const urls = new Set(mine.map(m => m.url));
  const ok = list.filter(c => c && (byId.has(Number(c.sub_id)) || urls.has(c.url)));
  await ensurePlayer(env, body.device);
  let awarded = 0;
  for (const c of ok) {
    const key = String(c.sub_id || c.url).slice(0, 50);
    awarded += await grant(env, body.device, "clip", 500, "Lairs Cinema clip approved", "clip:" + key);
    if (c.sotw) awarded += await grant(env, body.device, "sotw", 2000, "Lairs Cinema · Scene of the week", "sotw:" + key);
  }
  const p = await player(env, body.device);
  return reply(200, { awarded, approved: ok.length, submitted: pending, balance: p ? p.balance : 0, tier: bbTier(p ? p.balance : 0) }, { "Cache-Control": "no-store" });
}


// ---------------- Fan Wall: comments and reactions on every section page ----------------
// No word filter, by the owner's choice. Safeguards: per-visitor rate limits, a daily cap per
// device, links held for review, and community reports (3 reports hide a comment for review).
// GET  /comments?page=/lairs/&sort=new|top        -> { comments, reactions, mine }
// POST /comments          {device, page, body, name, parent?}
// POST /comments/react    {device, page, kind}     kind: crown | fire | heart (toggle)
// POST /comments/crown    {device, id}             toggle a crown on a comment
// POST /comments/report   {device, id}
const WALL_PAGES = new Set(["/create/", "/lairs/", "/CHESS81.HTML", "/fan-billboard/", "/king-intelligence/", "/asoka-to-booda/", "/doom-to-king/", "/inquilab/", "/fan-made-ai-universe/"]);
const WALL_REACT = ["crown", "fire", "heart"];
function wallPage(raw) {
  let p = String(raw || "").split("?")[0].split("#")[0].replace(/index\.html$/i, "");
  if (!p.startsWith("/")) p = "/" + p;
  return WALL_PAGES.has(p) ? p : null;
}
function wallName(raw) {
  const n = String(raw || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return n.length >= 2 ? n : null;
}
async function wallState(env, page, device, sort) {
  const order = sort === "top" ? "crowns DESC, ts DESC" : "ts DESC";
  const [c, r, mineR, mineC] = await Promise.all([
    env.DB.prepare(`SELECT id, parent, name, body, ts, crowns FROM comments WHERE page=?1 AND status='live' ORDER BY ${order} LIMIT 300`).bind(page).all(),
    env.DB.prepare("SELECT kind, COUNT(*) AS n FROM page_reactions WHERE page=?1 GROUP BY kind").bind(page).all(),
    device ? env.DB.prepare("SELECT kind FROM page_reactions WHERE page=?1 AND device=?2").bind(page, device).all() : { results: [] },
    device ? env.DB.prepare("SELECT v.comment_id AS id FROM comment_votes v JOIN comments c ON c.id=v.comment_id WHERE c.page=?1 AND v.device=?2 AND v.kind='crown'").bind(page, device).all() : { results: [] }
  ]);
  const reactions = { crown: 0, fire: 0, heart: 0 };
  for (const x of r.results || []) reactions[x.kind] = x.n;
  return { comments: c.results || [], reactions, mine: { reactions: (mineR.results || []).map(x => x.kind), crowns: (mineC.results || []).map(x => x.id) } };
}
async function comments(request, env, reply, origin, path) {
  if (!env.DB) return reply(503, { error: "Not configured yet." });
  const url = new URL(request.url);
  if (request.method === "GET" && path === "/comments") {
    const page = wallPage(url.searchParams.get("page"));
    if (!page) return reply(400, { error: "Unknown page." });
    const device = okDevice(url.searchParams.get("device")) ? url.searchParams.get("device") : null;
    return reply(200, await wallState(env, page, device, url.searchParams.get("sort")), { "Cache-Control": "no-store" });
  }
  if (request.method !== "POST") return reply(405, { error: "Use GET or POST." });
  if (!ALLOWED_ORIGINS.has(origin)) return reply(403, { error: "This website is not authorized." });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!(await burst(env, "wall:" + ip))) return reply(429, { error: "Slow down a little. Try again in a minute." });
  const body = await readBody(request);
  if (!body || !okDevice(body.device)) return reply(400, { error: "Unknown device." });
  const now = Date.now(), day = istDay();
  if (path === "/comments") {
    const page = wallPage(body.page);
    if (!page) return reply(400, { error: "Unknown page." });
    const text = String(body.body || "").replace(/\r/g, "").trim();
    if (text.length < 2) return reply(400, { error: "Write something first." });
    if (text.length > 555) return reply(400, { error: "Keep it to 555 characters." });
    const name = wallName(body.name);
    if (!name) return reply(400, { error: "Add a name of at least 2 characters." });
    const today = await env.DB.prepare("SELECT COUNT(*) AS n FROM comments WHERE device=?1 AND ts>?2").bind(body.device, now - 864e5).first();
    if (today && today.n >= 30) return reply(429, { error: "That's 30 comments today. Come back tomorrow." });
    const dup = await env.DB.prepare("SELECT 1 AS x FROM comments WHERE device=?1 AND body=?2 AND ts>?3").bind(body.device, text, now - 36e5).first();
    if (dup) return reply(400, { error: "You just posted that." });
    let parent = null;
    if (body.parent) {
      const pr = await env.DB.prepare("SELECT id, parent FROM comments WHERE id=?1 AND page=?2 AND status='live'").bind(Number(body.parent), page).first();
      if (!pr) return reply(400, { error: "That comment is gone." });
      parent = pr.parent || pr.id;
    }
    const held = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|net|org|io|ly|co|me|gg|xyz)\b)/i.test(text);
    await env.DB.prepare("INSERT INTO comments(page,parent,device,name,body,ts,status) VALUES(?1,?2,?3,?4,?5,?6,?7)").bind(page, parent, body.device, name, text, now, held ? "held" : "live").run();
    await bump(env, day, "comment");
    return reply(200, { ok: true, held, ...(await wallState(env, page, body.device, body.sort)) });
  }
  if (path === "/comments/react") {
    const page = wallPage(body.page), kind = String(body.kind);
    if (!page || !WALL_REACT.includes(kind)) return reply(400, { error: "Unknown reaction." });
    const had = await env.DB.prepare("SELECT 1 AS x FROM page_reactions WHERE page=?1 AND device=?2 AND kind=?3").bind(page, body.device, kind).first();
    if (had) await env.DB.prepare("DELETE FROM page_reactions WHERE page=?1 AND device=?2 AND kind=?3").bind(page, body.device, kind).run();
    else await env.DB.prepare("INSERT INTO page_reactions(page,device,kind,ts) VALUES(?1,?2,?3,?4)").bind(page, body.device, kind, now).run();
    return reply(200, await wallState(env, page, body.device, body.sort));
  }
  if (path === "/comments/crown" || path === "/comments/report") {
    const c = await env.DB.prepare("SELECT id, page, status FROM comments WHERE id=?1").bind(Number(body.id)).first();
    if (!c || c.status !== "live") return reply(400, { error: "That comment is gone." });
    const kind = path === "/comments/crown" ? "crown" : "report";
    const had = await env.DB.prepare("SELECT 1 AS x FROM comment_votes WHERE comment_id=?1 AND device=?2 AND kind=?3").bind(c.id, body.device, kind).first();
    if (kind === "crown") {
      if (had) await env.DB.batch([
        env.DB.prepare("DELETE FROM comment_votes WHERE comment_id=?1 AND device=?2 AND kind='crown'").bind(c.id, body.device),
        env.DB.prepare("UPDATE comments SET crowns=MAX(0,crowns-1) WHERE id=?1").bind(c.id)]);
      else await env.DB.batch([
        env.DB.prepare("INSERT INTO comment_votes(comment_id,device,kind,ts) VALUES(?1,?2,'crown',?3)").bind(c.id, body.device, now),
        env.DB.prepare("UPDATE comments SET crowns=crowns+1 WHERE id=?1").bind(c.id)]);
    } else if (!had) {
      await env.DB.batch([
        env.DB.prepare("INSERT INTO comment_votes(comment_id,device,kind,ts) VALUES(?1,?2,'report',?3)").bind(c.id, body.device, now),
        env.DB.prepare("UPDATE comments SET reports=reports+1, status=CASE WHEN reports+1>=3 THEN 'hidden' ELSE status END WHERE id=?1").bind(c.id)]);
      await bump(env, day, "comment_report");
    }
    return reply(200, { ok: true, ...(await wallState(env, c.page, body.device, body.sort)) });
  }
  return reply(404, { error: "Unknown." });
}
