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
  for (const path of ['/v2/', '/v2/play/', '/v2/crown/', '/v2/know/']) {
    const r = await p.goto(base + path + '?t=' + Date.now(), { waitUntil: 'networkidle' });
    log.push(`${name} ${path} HTTP ${r.status()}`);
    await p.screenshot({ path: `e2e-out/${name}${path.replace(/\//g, '_')}.png`, fullPage: true });
  }
  await p.close();
}
const p = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
p.on('pageerror', e => log.push(`studio pageerror ${e.message}`));
const r = await p.goto(base + '/v2/create/?film=21&t=' + Date.now(), { waitUntil: 'networkidle' });
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
if (log.some(l => /FAILED|pageerror|HTTP [45]/.test(l))) process.exit(1);
