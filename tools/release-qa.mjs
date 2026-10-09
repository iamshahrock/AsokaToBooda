import { chromium } from 'playwright';

const DEFAULT_BASE = 'https://agarmainkinghota.com';
const base = (process.env.SITE_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');

const pages = [
  ['01','/king-intelligence/'], ['02','/king-intelligence-2/'], ['03','/king-intelligence-3/'],
  ['04','/king-intelligence-4/'], ['05','/king-intelligence-5/'], ['06','/king-intelligence-6/'],
  ['07','/king-intelligence-7/'], ['08','/king-intelligence-8/'], ['09','/king-intelligence-9/'],
  ['10','/king-intelligence-10/'], ['11','/king-intelligence-11/'], ['12','/king-intelligence-12/'],
  ['13','/king-intelligence-13/'], ['14','/king-intelligence-14/'], ['15','/king-intelligence-15/'],
  ['16','/king-intelligence-16/'], ['17','/king-intelligence-17/'], ['18','/king-intelligence-18/'],
  ['D','/king-intelligence/daily.html'], ['E','/king-intelligence/engine.html'],
  ['H','/'], ['A','/agarmainkinghota.html'], ['G','/game/'], ['P','/preview/'],
  ['C','/CHESS81.HTML'], ['B','/asoka-to-booda/'], ['U','/fan-made-ai-universe/'], ['F','/fan-billboard/'],
  ['R4','/king-intelligence/2026-10-04.html'], ['R5','/king-intelligence/2026-10-05.html'], ['T','/king-intelligence/top-100-fan-clubs.html'],
];

const forbidden = [
  { label: 'ChatGPT citation debris', re: /turn\d+(search|news|view|fetch)\d+/i },
  { label: 'stray closing tag', re: /(^|\n)\s*\/div>/i },
  { label: 'stale 52-day countdown', re: /\b52\s*DAYS?\b/i },
];

const required = {
  '01': ['KING INTELLIGENCE'], '02': ['KING INTELLIGENCE'],
  '10': ['KING INTELLIGENCE', 'PLATFORM 10'],
  '18': ['KING INTELLIGENCE', 'PLATFORM 18'],
  'D': ['DAILY DATA LEDGER', '06 OCT 2026', '2,933,427', '31.176M', '699,000'],
  'E': ['INTELLIGENCE ENGINE', 'TOP 50 COUNTRY BOARD', 'SENTIMENT', 'KING / RDJ'],
  'G': ['AGAR MAIN KING HOTA', 'CREATE YOUR KING POSTER', 'PLAY FOR 60 SECONDS', 'CREATED & MANAGED BY FANS WHO LOVE YOU KING!'],
  'H': ['AGAR MAIN KING HOTA', 'PLAY THE GAME', 'CHECK. MATE. FIRE.', 'KING BUZZ', 'ASOKA TO BOODA', 'FAN MADE AI UNIVERSE', 'FAN BILLBOARD', 'DAYS TO KING', 'CREATED & MANAGED BY FANS WHO LOVE YOU KING!'],
  'A': ['AGAR MAIN KING HOTA', 'PLAY THE GAME', 'CHECK. MATE. FIRE.', 'KING BUZZ', 'ASOKA TO BOODA', 'FAN MADE AI UNIVERSE', 'FAN BILLBOARD', 'DAYS TO KING', 'CREATED & MANAGED BY FANS WHO LOVE YOU KING!'],
};

const legacyPaths = [
  '/king-intelligence-06/', '/king-intelligence-07/', '/king-intelligence-08/', '/king-intelligence-09/',
  '/king-intelligence-3-live/', '/king-intelligence-command/', '/king-intelligence-command-v2/',
  '/king-intelligence-new/', '/king-intelligence-observatory/', '/king-intelligence-v2.html',
  '/king-intelligence-v2-data.html', '/king-intelligence/index.backup-20261006.html',
  '/archive/RELEASE-5-ARCHIVE.md', '/backend/worker.js', '/Character%20Packs/', '/temp/01.jpg'
];

const browser = await chromium.launch({ headless: true });

// Release 4 architecture checks: the canonical registry and shared platform template must exist.
const registryResponse = await fetch(base + '/data/intelligence-pages.json');
if (!registryResponse.ok) { console.error(`FAIL [ARCH] registry HTTP ${registryResponse.status}`); process.exit(1); }
const registry = await registryResponse.json();
if (!Array.isArray(registry.pages) || registry.pages.length !== 18) { console.error('FAIL [ARCH] canonical registry must contain exactly 18 pages'); process.exit(1); }
const sharedResponse = await fetch(base + '/king-intelligence-shared/platform.html');
if (!sharedResponse.ok) { console.error(`FAIL [ARCH] shared platform template HTTP ${sharedResponse.status}`); process.exit(1); }
const sharedTemplate = await sharedResponse.text();
if (!sharedTemplate.includes('data/platform-pages.json')) { console.error('FAIL [ARCH] shared template is not wired to canonical platform data'); process.exit(1); }
console.log('PASS [ARCH] canonical 18-page registry + shared platform template');
for (const legacyPath of legacyPaths) {
  const legacyResponse = await fetch(base + legacyPath);
  if (legacyResponse.status !== 404) {
    console.error(`FAIL [ARCH] legacy path still publicly exposed: ${legacyPath} — HTTP ${legacyResponse.status}`);
    process.exit(1);
  }
  console.log(`PASS [ARCH] retired path is not publicly exposed: ${legacyPath}`);
}
// Homepage architecture: the site root serves AGAR MAIN KING HOTA directly,
// and the retired master-home.html sends visitors back to the root.
{
  const rootHtml = await (await fetch(base + '/')).text();
  if (/http-equiv=["']refresh/i.test(rootHtml)) { console.error('FAIL [HOME] site root is a redirect, not the homepage'); process.exit(1); }
  const p = await browser.newPage();
  await p.goto(base + '/master-home.html', { waitUntil: 'networkidle', timeout: 30000 });
  const landed = new URL(p.url()).pathname.replace(/index\.html$/, '');
  const expected = new URL(base + '/').pathname;
  await p.close();
  if (landed !== expected) { console.error(`FAIL [HOME] master-home.html should redirect to ${expected}, landed on ${landed}`); process.exit(1); }
  console.log('PASS [HOME] root serves homepage; master-home.html redirects to root');
}
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
let failures = 0;

for (const [id, path] of pages) {
  const url = base + path;
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    const status = response?.status() ?? 0;
    const html = await page.content();
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
    const title = await page.title();
    const issues = [];
    if (Number(id) >= 6 && Number(id) <= 18) {
      if (!html.includes('DATA RULE')) issues.push('shared platform template did not render');
      if (!text.includes('KING INTELLIGENCE')) issues.push('shared platform identity missing');
    }
    // every page carries the shared fan footer (assets/footer.js) with its emblem
    const foot = await page.evaluate(async () => {
      const f = document.getElementById('site-footer'); if (!f) return 'missing';
      const img = f.querySelector('img.sf-mark'); if (img) { img.loading = 'eager'; await img.decode().catch(() => {}); }
      if (!/Created & Managed By Fans Who Love You KING!/.test(f.innerText)) return 'text missing';
      if (!img || !img.naturalWidth) return 'emblem did not load';
      return 'ok';
    });
    if (foot !== 'ok') issues.push('fan footer ' + foot);
    // shared story header (assets/header.js): present, every image loaded, none distorted
    {  // every page carries the story header
      const h = await page.evaluate(async () => {
        const hd = document.getElementById('site-header'); if (!hd) return 'missing';
        const imgs = [...hd.querySelectorAll('img')]; await Promise.all(imgs.map(i => i.decode().catch(() => {})));
        const broken = imgs.filter(i => !i.naturalWidth).map(i => i.src.split('/').pop());
        const bad = imgs.filter(i => { const cs = getComputedStyle(i), w = parseFloat(cs.width), h = parseFloat(cs.height); return w > 2 && h > 2 && Math.abs((w / h) / (i.naturalWidth / i.naturalHeight) - 1) > 0.02; }).map(i => i.src.split('/').pop()); // exact layout size: ignores animation transforms and whole-pixel rounding
        const links = hd.querySelectorAll('.sh-nav a').length;
        if (broken.length) return 'images failed: ' + broken.join(', ');
        if (bad.length) return 'distorted: ' + bad.join(', ');
        if (links !== 6) return 'expected 6 section links, found ' + links;
        return 'ok';
      });
      if (h !== 'ok') issues.push('header ' + h); else console.log(`PASS [${id}] story header: all images loaded, none distorted, 6 section links`);
    }
    // tablet and phone: one header, nothing pushes the page sideways
    for (const width of [900, 390]) {
      const m = await browser.newPage({ viewport: { width, height: 900 } });
      await m.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const r = await m.evaluate(() => ({ n: document.querySelectorAll('#site-header').length, over: document.documentElement.scrollWidth - innerWidth }));
      await m.close();
      if (r.n !== 1) issues.push(`${width}px: expected 1 story header, found ${r.n}`);
      else if (r.over > 0) issues.push(`${width}px: page scrolls sideways by ${r.over}px`);
      else console.log(`PASS [${id}] ${width}px: story header present, no sideways scroll`);
    }
    if (status !== 200) issues.push(`HTTP ${status}`);
    if (!html.toLowerCase().includes('<html')) issues.push('missing HTML document');
    for (const f of forbidden) if (f.re.test(html)) issues.push(f.label);
    for (const phrase of (required[id] || [])) {
      if (!text.toUpperCase().includes(phrase.toUpperCase())) issues.push(`missing required text: ${phrase}`);
    }
    const distorted = await page.evaluate(() => [...document.images].filter(i => i.naturalWidth && i.getBoundingClientRect().width > 2 && getComputedStyle(i).objectFit !== 'contain' && getComputedStyle(i).objectFit !== 'cover').filter(i => { const r = i.getBoundingClientRect(); return Math.abs((r.width / r.height) / (i.naturalWidth / i.naturalHeight) - 1) > 0.02; }).map(i => i.getAttribute('src')));
    // every homepage/game image must actually load (scroll so lazy images fetch)
    if (['H', 'A', 'G'].includes(id)) {
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
      await page.evaluate(() => Promise.all([...document.images].map(i => i.loading === 'lazy' ? (i.loading = 'eager', i.decode().catch(() => {})) : i.decode().catch(() => {}))));
      const broken = await page.evaluate(() => [...document.images].filter(i => i.getAttribute('src') && !i.naturalWidth).map(i => i.getAttribute('src')));
      if (broken.length) issues.push('image(s) failed to load: ' + broken.join(', '));
      else console.log(`PASS [${id}] all ${await page.evaluate(() => document.images.length)} images loaded`);
    }
    // slider must mirror the six section cards: slide N = card N (number, image, destination)
    if (['H', 'A'].includes(id)) {
      const mirror = await page.evaluate(() => {
        const slides = [...document.querySelectorAll('#hero .slide')], cards = [...document.querySelectorAll('.cards .card')];
        const out = [];
        if (slides.length !== 6 || cards.length !== 6) out.push(`expected 6 slides and 6 cards, found ${slides.length} and ${cards.length}`);
        slides.forEach((s, k) => {
          const c = cards[k]; if (!c) return;
          const dest = new URL(c.getAttribute('href'), location.href).pathname;
          const bad = [...s.querySelectorAll('a[href]')].map(a => new URL(a.getAttribute('href'), location.href).pathname).filter(p => !p.startsWith(dest));
          if (bad.length) out.push(`slide ${k + 1} links leave its section (${dest}): ${bad.join(', ')}`);
          const si = s.querySelector('img.art')?.getAttribute('src'), ci = c.querySelector('.pic img')?.getAttribute('src');
          if (si !== ci) out.push(`slide ${k + 1} image ${si} != card image ${ci}`);
          const sn = (s.querySelector('.eyebrow')?.textContent || '').trim().slice(0, 2), cn = (c.querySelector('.num')?.textContent || '').trim();
          if (sn !== cn) out.push(`slide ${k + 1} number ${sn} != card number ${cn}`);
        });
        return out;
      });
      if (mirror.length) issues.push('slider/cards mismatch: ' + mirror.join(' | '));
      else console.log(`PASS [${id}] slider mirrors the six section cards`);
    }
    // game: playable on arrival, and the ZERO artwork pack the poster needs is reachable
    if (id === 'G') {
      const g = await page.evaluate(async () => {
        const out = [];
        if (document.getElementById('movie').value !== 'bauua') out.push('default film is not the playable ZERO pack');
        if (document.getElementById('make').disabled) out.push('Create my poster is disabled on arrival');
        for (const f of ['00-zero-original-poster.jpeg', '06-bauua-surreal-reference.png']) {
          const r = await fetch(new URL('../Bauua%20Raw%20Material/' + f, location.href)); if (!r.ok) out.push('artwork pack file ' + f + ' HTTP ' + r.status);
        }
        return out;
      });
      if (g.length) issues.push('game: ' + g.join('; ')); else console.log('PASS [G] game playable on arrival; ZERO artwork pack reachable');
    }
    if (['H', 'A', 'G'].includes(id) && distorted.length) issues.push('distorted image(s): ' + distorted.join(', '));
    if (issues.length) {
      failures++;
      console.error(`FAIL [${id}] ${url} — ${issues.join('; ')}`);
    } else {
      console.log(`PASS [${id}] ${url} — ${status} — ${title || '(no title)'}`);
    }
    await page.screenshot({ path: `qa-page-${id}.png`, fullPage: true });
  } catch (err) {
    failures++;
    console.error(`FAIL [${id}] ${url} — ${err.message}`);
  }
}
await browser.close();
console.log(`QA COMPLETE — ${pages.length - failures}/${pages.length} pages passed`);
if (failures) process.exit(1);
