// Live browser test of the poster studio on agarmainkinghota.com: picks DDLJ, uploads a test photo,
// makes one real poster through the Worker and saves screenshots. Uses one of the day's poster allowance.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.SITE || 'https://agarmainkinghota.com';
await mkdir('e2e-out', { recursive: true });
const browser = await chromium.launch();
const log = [];
for (const [name, vw, vh] of [['desktop', 1440, 1000], ['phone', 390, 844]]) {
  const p = await browser.newPage({ viewport: { width: vw, height: vh } });
  p.on('pageerror', e => log.push(`${name} pageerror ${e.message}`));
  for (const path of ['/', '/lairs/', '/CHESS81.HTML', '/fan-billboard/', '/about/', '/contact/', '/faq/', '/asoka-to-booda/']) {
    const r = await p.goto(base + path + '?t=' + Date.now(), { waitUntil: 'networkidle' });
    log.push(`${name} ${path} HTTP ${r.status()}`);
    await p.screenshot({ path: `e2e-out/${name}${(path.replace(/\//g, '_') || '_')}.png`, fullPage: true });
  }
  await p.close();
}
const bbp = await browser.newPage();
await bbp.goto(base + '/fan-billboard/?t=' + Date.now(), { waitUntil: 'networkidle' });
const bb = await bbp.evaluate(async () => {
  const g = await fetch('https://asokatobooda.iamshahrock.workers.dev/billboard', { cache: 'no-store' });
  const gj = await g.json().catch(() => ({}));
  const bad = await fetch('https://asokatobooda.iamshahrock.workers.dev/billboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device: 'abcdef0123456789', name: 'x', starks: 10 }) });
  return { get: g.status, entries: (gj.top || []).length, badPost: bad.status };
});
log.push(`billboard GET ${bb.get} (${bb.entries} entries), invalid POST rejected with ${bb.badPost}`);
await bbp.close();
const lp = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
lp.on('pageerror', e => log.push(`lairs pageerror ${e.message}`));
await lp.goto(base + '/lairs/?t=' + Date.now(), { waitUntil: 'networkidle' });
await lp.click('.lair >> nth=0'); await lp.click('#sc .choice >> nth=0'); await lp.click('#srow .btn'); await lp.click('#deal'); await lp.waitForTimeout(300);
for (let k = 0; k < 4; k++) { if (await lp.$('#check')) { await lp.click('#check'); await lp.waitForTimeout(100); } }
log.push('lairs casino: ' + (await lp.textContent('#cmsg')) + ' · story art: ' + (await lp.evaluate(() => [...document.querySelectorAll('img')].filter(i => i.src.includes('/lairs/') && i.naturalWidth > 0).length)) + ' images loaded');
await lp.goto(base + '/CHESS81.HTML?t=' + Date.now(), { waitUntil: 'networkidle' });
const hp = await browser.newPage({ viewport: { width: 390, height: 844 } }); await hp.goto(base + '/?t=' + Date.now(), { waitUntil: 'networkidle' });
log.push('home slider (phone): ' + JSON.stringify(await hp.evaluate(() => { const sl = document.querySelector('.slide.on'), c = sl.querySelector('.copy').getBoundingClientRect(), a = sl.querySelector('.art').getBoundingClientRect(); return { slides: document.querySelectorAll('#hero .slide').length, dots: document.querySelectorAll('#dots .dot').length, arrows: document.querySelectorAll('#hero .arrow').length, sideBySide: a.left > c.left + c.width / 2 && a.top < c.bottom }; })));
await hp.close();
log.push('asset versions: ' + JSON.stringify(await lp.evaluate(() => [...document.querySelectorAll('link[rel=stylesheet][href*="assets/"], script[src*="assets/"]')].map(e => (e.href || e.src).split('/').pop()))));
const sqs = await lp.evaluate(() => { const c = [...document.querySelectorAll('.sq')].map(x => x.getBoundingClientRect()); return c.length + ' squares, ' + [...new Set(c.map(r => r.width.toFixed(1) + 'x' + r.height.toFixed(1)))].join(','); });
await lp.evaluate(() => window.CHESS81.move('O2', 'O4'));
await lp.waitForFunction(() => window.CHESS81.state().turn === 'red', null, { timeout: 20000 }).catch(() => {});
log.push('chess81: ' + sqs + ' · moves ' + JSON.stringify((await lp.evaluate(() => window.CHESS81.state())).moves));
await lp.screenshot({ path: 'e2e-out/lairs-casino.png', fullPage: true });
await lp.close();
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
p.on('pageerror', e => log.push(`studio pageerror ${e.message}`));
const r = await p.goto(base + '/create/?film=21&t=' + Date.now(), { waitUntil: 'networkidle' });
log.push(`studio HTTP ${r.status()}`);
await p.setInputFiles('#photoInput', 'assets/studio/shahrock-dreaming.jpg');
await p.fill('#name', 'Shah Rock');
await p.fill('#line', 'Picture abhi baaki hai, mere dost');
await p.check('#consent');
await p.waitForTimeout(800);
await p.screenshot({ path: 'e2e-out/studio-before.png', fullPage: false });
const t0 = Date.now();
await p.click('#make');
try {
  await p.waitForSelector('#afterActions:not([hidden])', { timeout: 150000 });
  log.push(`studio poster OK in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
} catch (e) { log.push('studio poster FAILED: ' + (await p.textContent('#status'))); }
await p.screenshot({ path: 'e2e-out/studio-after.png', fullPage: false });
const dataUrl = await p.evaluate(() => document.getElementById('canvas').toDataURL('image/jpeg', 0.9));
await writeFile('e2e-out/final-poster.jpg', Buffer.from(dataUrl.split(',')[1], 'base64'));
await browser.close();
await writeFile('e2e-out/log.txt', log.join('\n'));
for (const l of log) console.log(`::notice title=v2-live::${l}`);
if (log.some(l => /FAILED|pageerror|HTTP [45]|billboard GET [^2]/.test(l))) process.exit(1);
