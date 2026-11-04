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
    '#site-footer .sf-map{max-width:1100px;margin:0 auto 34px;padding-bottom:30px;border-bottom:1px solid #2a1c1c;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:20px 24px;text-align:left}',
    '#site-footer .sf-map h4{margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#ff4a4f}',
    '#site-footer .sf-map a{display:block;padding:4px 0;font-size:14px;color:#cfc4bb;text-decoration:none}',
    '#site-footer .sf-map a:hover{color:#fff}',
    '@media (max-width:1000px){#site-footer .sf-map{grid-template-columns:repeat(3,minmax(0,1fr))}}@media (max-width:700px){#site-footer .sf-map{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '#site-footer .sf-mark{width:64px!important;height:64px!important}',
    '#site-footer .sf-disc{margin:18px 0 0;font-size:12px;line-height:1.6;color:#8f837c;max-width:640px}',
    '#site-footer .sf-cred{margin:26px auto 0;width:min(360px,100%);display:flex;flex-direction:column;align-items:center;gap:10px}',
    '#site-footer .sf-cred h5{margin:0;font-size:14px;font-weight:700;letter-spacing:.16em;color:#fff}',
    '#site-footer .sf-cred hr{width:100%;border:0;border-top:1px solid #3a2626;margin:2px 0}',
    '#site-footer .sf-cred .k{margin:0;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#ff4a4f}',
    '#site-footer .sf-cred .lg{background:#fff;border-radius:4px;padding:3px 5px;line-height:0}',
    '#site-footer .sf-cred .lg img{width:60px!important;height:auto!important;display:block}',
    '#site-footer .sf-cred .n{margin:0;font-size:14px;color:#e6dcd4}'
  ].join('\n');
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
  if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Cormorant"]')) {
    var fl = document.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Cormorant+Garamond:ital,wght@1,600&display=swap';
    document.head.appendChild(fl);
  }

  var f = document.createElement('footer'); f.id = 'site-footer';
  // site map: every section in five groups, the same as the header menu
  var root = new URL('..', base).href;
  var map = document.createElement('nav'); map.className = 'sf-map'; map.setAttribute('aria-label', 'Site map');
  [
    // same groups as the header (owner, 4 Nov 2026: 'Yes, match it')
    ['SRK DAILY & KING Buzz', [['srk-daily/', 'SRK DAILY'], ['king-intelligence/', 'KING Buzz'], ['doom-to-king/', 'DOOM to KING'], ['ramayana-to-king/', 'RAMAYANA to KING']]],
    ['Games', [['create/', 'Make Your Poster'], ['lairs/', 'Rescue Your Face'], ['chess81/', 'Chess81'], ['baahein-khol/', 'Pose Game · BAAHEIN KHOL']]],
    ['The Archive', [['gallery/videos/', 'Gallery'], ['on-the-record/video-interviews/', 'On The Record'], ['asoka-to-booda/', 'Asoka to Boo-Da · the book'], ['king-studies/', 'KING University'], ['srk-characters/', 'Alter Egos']]],
    ['FANVERSE', [['inquilab/', 'Inquilaab King Ke Saath'], ['fan-made-ai-universe/', 'Fan Universe'], ['fans-king/', 'Fan videos'], ['fan-billboard/', 'Billboard & STARKS'], ['merch/', 'Merch']]],
    ['About', [['', 'Home'], ['vision/', 'Vision & Mission'], ['about/', 'About Us'], ['contact/', 'Contact'], ['faq/', 'FAQ']]]
  ].forEach(function (g) {
    var col = document.createElement('div'), h = document.createElement('h4'); h.textContent = g[0]; col.appendChild(h);
    g[1].forEach(function (l) { var a = document.createElement('a'); a.href = root + l[0]; a.textContent = l[1]; col.appendChild(a); });
    map.appendChild(col);
  });
  f.appendChild(map);
  var inner = document.createElement('div'); inner.className = 'sf-in';
  var img = document.createElement('img');
  img.className = 'sf-mark'; img.src = base + 'fan-emblem.png'; img.width = 160; img.height = 160; img.alt = 'Shah Rock Jaan fan emblem'; img.loading = 'lazy';
  inner.appendChild(img);
  [
    ['sf-line1', 'Picture Toh Abhi Shuru Bhi Nahin Hui Hain Dost'],
    ['sf-line2', 'Many Happy Returns Of The Second ACT Shah Rukh Jaan!'],
    ['sf-line3', 'Love Shah Rock.']
  ].forEach(function (l) { var p = document.createElement('p'); p.className = l[0]; p.textContent = l[1]; inner.appendChild(p); });
  // credits: the anthem's research & development partner
  var cred = document.createElement('div'); cred.className = 'sf-cred';
  cred.innerHTML = '<h5>INQUILAAB - KING KE SAATH</h5><hr><p class="k">Research &amp; Development</p>' +
    '<span class="lg"><img src="' + base + 'about/logo-dome.png" alt="DOME A.I. WORLD" width="60" height="37" loading="lazy"></span>' +
    '<p class="n">Dome Entertainment Group</p><hr>';
  inner.appendChild(cred);
  f.appendChild(inner);
  document.body.appendChild(f);

  // Fan Wall on the section pages (fanwall.js decides which); same version stamp as this file
  var q = me && me.src.indexOf('?') > 0 ? me.src.slice(me.src.indexOf('?')) : '';
  var fw = document.createElement('script'); fw.src = base + 'fanwall.js' + q; fw.defer = true; document.body.appendChild(fw);
})();
