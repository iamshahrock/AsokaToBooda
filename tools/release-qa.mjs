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
};

const browser = await chromium.launch({ headless: true });
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
