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
await lp.click('#cTabs button[data-id=den]'); await lp.waitForTimeout(800);
log.push('LAIRS CARDS: ' + JSON.stringify(await lp.evaluate(() => ({ art: [...document.querySelectorAll('.lair .lair-art')].filter(i => i.naturalWidth > 0 && getComputedStyle(i).opacity === '1').length, home: !!document.querySelector('#site-header .sh-home'), cursor: getComputedStyle(document.querySelector('.lair')).cursor }))));
const tp = await browser.newPage({ viewport: { width: 1366, height: 900 } }); await tp.goto(base + '/asoka-to-booda/?t=' + Date.now(), { waitUntil: 'networkidle' });
log.push('THESIS: ' + JSON.stringify(await tp.evaluate(() => ({ second: /Second draft/.test(document.body.innerText), fansAct: !!document.getElementById('act-fans'), summary: !!document.getElementById('summary'), act3: /not a single fan outside Mannat/.test(document.body.innerText), lessons: document.querySelectorAll('.lessons li').length, toc: document.querySelectorAll('.toc li').length })))); await tp.close();
log.push('LAIRS CINEMA: ' + JSON.stringify(await lp.evaluate(() => ({ tabs: document.querySelectorAll('#cTabs button').length, plate: document.getElementById('cImg').src.split('/').pop(), plateLoaded: document.getElementById('cImg').naturalWidth, tools: document.querySelectorAll('.ctool').length, prompt: document.getElementById('cPrompt').value.length, gallery: document.getElementById('cGal').textContent.slice(0, 30) }))));
const cl = await lp.request.post('https://asokatobooda.iamshahrock.workers.dev/lairs/claim', { headers: { Origin: 'https://agarmainkinghota.com', 'Content-Type': 'application/json' }, data: { device: '0000000000000000e2e0' } });
log.push('LAIRS CLAIM api: ' + cl.status() + ' ' + (await cl.text()).slice(0, 120));
await lp.goto(base + '/CHESS81.HTML?t=' + Date.now(), { waitUntil: 'networkidle' });
const hp = await browser.newPage({ viewport: { width: 390, height: 844 } }); await hp.goto(base + '/?t=' + Date.now(), { waitUntil: 'networkidle' });
log.push('home slider (phone): ' + JSON.stringify(await hp.evaluate(() => { const sl = document.querySelector('.slide.on'), c = sl.querySelector('.copy').getBoundingClientRect(), a = sl.querySelector('.art').getBoundingClientRect(); return { slides: document.querySelectorAll('#hero .slide').length, dots: document.querySelectorAll('#dots .dot').length, arrows: document.querySelectorAll('#hero .arrow').length, sideBySide: a.left > c.left + c.width / 2 && a.top < c.bottom }; })));
await hp.goto(base + '/asoka-to-booda/?t=' + Date.now(), { waitUntil: 'networkidle' });
await hp.evaluate(() => document.getElementById('act8').scrollIntoView()); await hp.waitForTimeout(1500);
log.push('thesis DOOM to KING (phone): ' + JSON.stringify(await hp.evaluate(() => ({ doomThumb: (document.querySelector('.yt img') || {}).naturalWidth || 0, kingArt: (document.querySelector('.dk-king img') || {}).naturalWidth || 0, overflow: document.documentElement.scrollWidth - innerWidth }))));
await hp.screenshot({ path: 'e2e-out/thesis-doom-phone.png' });
await hp.goto(base + '/king-intelligence/?t=' + Date.now(), { waitUntil: 'networkidle' });
log.push('KING Buzz: ' + JSON.stringify(await hp.evaluate(() => ({ sectionsVisible: [...document.querySelectorAll('.ki-panel')].filter(x => x.offsetHeight > 0).length, platformTiles: document.querySelectorAll('#platforms .ki-tile').length, icons: document.querySelectorAll('#platforms .ki-tile svg').length, commandCentre: !!document.querySelector('#platforms .ki-cc') }))));
await hp.goto(base + '/lairs/?t=' + Date.now(), { waitUntil: 'networkidle' });
log.push('Lairs chapters open: ' + await hp.evaluate(() => [...document.querySelectorAll('.lair')].filter(x => !x.disabled).length) + ' of 6');
const dk = await browser.newPage({ viewport: { width: 390, height: 844 } }); dk.on('pageerror', e => log.push('d2k pageerror ' + e.message));
const r2 = await dk.goto(base + '/doom-to-king/?t=' + Date.now(), { waitUntil: 'networkidle' }); await dk.waitForTimeout(1500);
log.push('DOOM to KING page: HTTP ' + r2.status() + ' ' + JSON.stringify(await dk.evaluate(() => ({ rounds: document.querySelectorAll('.round').length, pledgeCounter: document.getElementById('pn').textContent, doomThumb: (document.querySelector('.yt img') || {}).naturalWidth || 0, overflow: document.documentElement.scrollWidth - innerWidth }))));
log.push('d2k API: ' + JSON.stringify(await dk.evaluate(async () => { const r = await fetch('https://asokatobooda.iamshahrock.workers.dev/d2k', { cache: 'no-store' }); return { status: r.status, keys: Object.keys(await r.json()) }; })));
await dk.screenshot({ path: 'e2e-out/d2k-phone.png', fullPage: false });
await dk.close();
const hm = await browser.newPage({ viewport: { width: 1440, height: 900 } }); await hm.goto(base + '/?t=' + Date.now(), { waitUntil: 'networkidle' });
log.push('home: ' + JSON.stringify(await hm.evaluate(() => ({ slides: document.querySelectorAll('#hero .slide').length, banner: !!document.querySelector('.doors .d2k-banner'), inquilabBanner: !!document.querySelector('.doors .iq-banner'), headerLinks: document.querySelectorAll('#site-header .sh-nav a').length }))));
await hm.evaluate(() => document.querySelector('.d2k-banner').scrollIntoView({ block: 'center' })); await hm.waitForTimeout(800); await hm.screenshot({ path: 'e2e-out/home-banner-desktop.png' }); await hm.close();
await hp.goto(base + '/king-intelligence/?t=' + Date.now(), { waitUntil: 'networkidle' }); await hp.waitForTimeout(800);
log.push('AI creator signal: ' + JSON.stringify(await hp.evaluate(() => ({ works: document.querySelector('#ao-kpis [data-k=items]').textContent, views: document.querySelector('#ao-kpis [data-k=views]').textContent, topRows: document.querySelectorAll('#ao-top tr').length }))));
await hp.goto(base + '/fan-made-ai-universe/?t=' + Date.now(), { waitUntil: 'networkidle' }); await hp.waitForTimeout(800);
log.push('Fan AI gallery: ' + JSON.stringify(await hp.evaluate(() => ({ cards: document.querySelectorAll('#dd-grid .ai-card').length, thumbsLoaded: [...document.querySelectorAll('#dd-grid img')].filter(i => i.naturalWidth > 0).length, overflow: document.documentElement.scrollWidth - innerWidth }))));
await hp.goto(base + '/inquilab/?t=' + Date.now(), { waitUntil: 'networkidle' }); await hp.waitForTimeout(1200);
log.push('INQUILAB (phone): ' + JSON.stringify(await hp.evaluate(() => ({ poemHasDacoiti: document.getElementById('poem').innerText.includes('AI se karli dacoiti saari'), heroLine: document.querySelector('.iq-hero .couplet').innerText.includes('Aao aao'), joinedCounter: document.getElementById('j-num').textContent, works: document.getElementById('c-works').textContent, recent: document.querySelectorAll('#recent a').length, headlineFits: document.getElementById('h1').scrollWidth <= document.getElementById('h1').clientWidth, overflow: document.documentElement.scrollWidth - innerWidth }))));
await hp.screenshot({ path: 'e2e-out/inquilab-phone.png' });
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
