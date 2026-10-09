/* Agar Main King Hota — the one shared footer for every page.
   Each page includes: <script src="(path to)/assets/footer.js" defer></script>
   Edit the text here and every page updates. */
(function () {
  if (document.getElementById('site-footer')) return;
  var me = document.currentScript || document.querySelector('script[src*="assets/footer.js"]');
  var base = new URL('.', me ? me.src : location.href).href; // the /assets/ folder, wherever the page lives

  var css = [
    '#site-footer{border-top:1px solid #2a1c1c;background:#070505;color:#f4efe9;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;text-align:center;padding:48px 16px 40px;margin-top:0;clear:both}',
    /* reset anything an older page's own footer/p/img rules might impose */
    '#site-footer{text-transform:none;letter-spacing:normal;font-size:16px;line-height:1.5;box-sizing:border-box;width:100%}',
    '#site-footer p{padding:0;max-width:none;color:inherit;text-transform:none;letter-spacing:normal;font-weight:400}',
    '#site-footer img{max-width:none;border:0;border-radius:0}',
    '#site-footer .sf-in{max-width:760px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:10px}',
    '#site-footer .sf-mark{width:96px;height:96px;display:block;margin:0 0 8px}',
    '#site-footer .sf-line1{margin:0;font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-weight:600;font-size:clamp(22px,3vw,30px);line-height:1.2}',
    '#site-footer .sf-line2{margin:0;font-size:clamp(15px,1.8vw,18px);line-height:1.5;color:#e6dcd4}',
    '#site-footer .sf-line3{margin:6px 0 0;font-size:13px;font-weight:600;letter-spacing:.2em;text-transform:none;color:#ff4a4f}',
    '#site-footer .sf-line4{margin:0;font-size:14px;line-height:1.5;color:#b8aca4}',
    '#site-footer .sf-disc{margin:18px 0 0;font-size:12px;line-height:1.6;color:#8f837c;max-width:640px}'
  ].join('\n');
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Cormorant"]')) {
    var fl = document.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Cormorant+Garamond:ital,wght@1,600&display=swap';
    document.head.appendChild(fl);
  }

  var f = document.createElement('footer'); f.id = 'site-footer';
  var inner = document.createElement('div'); inner.className = 'sf-in';
  var img = document.createElement('img');
  img.className = 'sf-mark'; img.src = base + 'fan-emblem.png'; img.width = 160; img.height = 160; img.alt = 'Shah Rock Jaan fan emblem'; img.loading = 'lazy';
  inner.appendChild(img);
  [
    ['sf-line1', 'Picture Toh Abhi Shuru Bhi Nahin Hui Hain Dost'],
    ['sf-line2', 'Many Happy Returns Of The Second ACT Shah Rukh Jaan!'],
    ['sf-line3', 'SHAH ROCK JAAN - Remember ME ! ;-)'],
    ['sf-line4', 'Created & Managed By Fans Who Love You KING!']
  ].forEach(function (l) { var p = document.createElement('p'); p.className = l[0]; p.textContent = l[1]; inner.appendChild(p); });
  f.appendChild(inner);
  document.body.appendChild(f);
})();
