import { chromium } from 'playwright';

const DEFAULT_BASE = 'https://iamshahrock.github.io/AsokaToBooda';
const base = (process.env.SITE_BASE_URL || DEFAULT_BASE).replace(/\/$/, '');

const pages = [
  ['01','/king-intelligence/'], ['02','/king-intelligence-2/'], ['03','/king-intelligence-3/'],
  ['04','/king-intelligence-4/'], ['05','/king-intelligence-5/'], ['06','/king-intelligence-6/'],
  ['07','/king-intelligence-7/'], ['08','/king-intelligence-8/'], ['09','/king-intelligence-9/'],
  ['10','/king-intelligence-10/'], ['11','/king-intelligence-11/'], ['12','/king-intelligence-12/'],
  ['13','/king-intelligence-13/'], ['14','/king-intelligence-14/'], ['15','/king-intelligence-15/'],
  ['16','/king-intelligence-16/'], ['17','/king-intelligence-17/'], ['18','/king-intelligence-18/'],
  ['D','/king-intelligence/daily.html'], ['E','/king-intelligence/engine.html'],
  ['M','/master-home.html'],
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
  'M': ['AGAR MAIN KING HOTA', 'BE THE KING', 'CHECK. MATE. FIRE.', 'KING BUZZ', 'ASOKA TO BOODA', 'FAN MADE AI UNIVERSE', 'FAN BILLBOARD'],
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
    if (status !== 200) issues.push(`HTTP ${status}`);
    if (!html.toLowerCase().includes('<html')) issues.push('missing HTML document');
    for (const f of forbidden) if (f.re.test(html)) issues.push(f.label);
    for (const phrase of (required[id] || [])) {
      if (!text.toUpperCase().includes(phrase.toUpperCase())) issues.push(`missing required text: ${phrase}`);
    }
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
