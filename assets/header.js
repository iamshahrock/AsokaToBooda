/* Agar Main King Hota — the one shared header for every page.
   Include it as the FIRST thing inside <body>, without defer:
     <script src="(path to)/assets/header.js"></script>
   It renders in place (no layout jump):
   - the story banner: Bauua (ZERO) 'AGAR MAIN KING HOTA' in KING lettering · ZERO to ONE (crown drops) ·
     the King (KING) 'AGAR MAIN FAN HOTA' in FAN lettering
   - a section bar under it that pins to the top on scroll (compact brand appears)
   - on phones: the middle of the story + a burger menu */
(function () {
  if (document.getElementById('site-header')) return;
  var me = document.currentScript;
  var assets = new URL('.', me.src).href;          // .../assets/
  var root = new URL('..', assets).href;           // site root
  // Google Analytics 4 (owner, 22 Oct 2026). Paste the Measurement ID (G-XXXXXXXXXX) here and every page starts reporting.
  var GA_ID = 'G-J8LKDFNPQS';
  if (GA_ID && !window.gtag) {
    var gs = document.createElement('script'); gs.async = true; gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID; document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', GA_ID);
  }
  var A = function (p) { return assets + 'header/' + p; };

  // Six sections (remapped 10 Oct 2026) + utility links.
  var home = root;
  var LINKS = [
    // order set by the owner, 28 Oct 2026
    ['create/', 'Make Your Poster', ['make-your-poster/']],
    ['chess81/', 'Chess81', ['CHESS81.HTML']],
    ['inquilab/', 'Inquilaab King Ke Saath', ['king-fever/']],
    ['lairs/', 'Rescue Your Face'],
    ['king-intelligence/', 'KING Buzz'],
    ['merch/', 'Merch'],
    ['fan-made-ai-universe/', 'Fan Universe', ['fans-king/']],
    ['asoka-to-booda/', 'Asoka to Boo-Da'],
    ['gallery/videos/', 'Gallery', ['gallery/']],
    ['on-the-record/video-interviews/', 'On The Record', ['on-the-record/']],
    ['doom-to-king/', 'DOOM to KING']
  ];
  var UTIL = [['about/', 'About Us'], ['fan-billboard/', 'Billboard']];
  var MORE = [['contact/', 'Contact'], ['faq/', 'FAQ']];
  // Sub-pages: a slim tab row under the bar on every page of that section, so fans always know where they are.
  var SUB = {
    'create/': [['create/', 'Kingmaker studio'], ['', 'Be King · coming soon']],
    'lairs/': [['lairs/', 'The 12 games'], ['lairs/#cinema', 'Lairs Cinema']],
    'chess81/': [['chess81/', 'Overview'], ['CHESS81.HTML', 'Play the full game'], ['chess81/rapid-fire/', 'Rapid Fire']],
    // Fan Universe = every fan creation + the fan videos (was FAN'S KING; owner, 28 Oct 2026). Not part of Billboard.
    'fan-made-ai-universe/': [['fan-made-ai-universe/', 'All fan creations'], ['fans-king/', 'Fan videos on YouTube']],
    'gallery/videos/': [['gallery/videos/', 'Videos'], ['gallery/', 'Images']],
    'on-the-record/video-interviews/': [['on-the-record/branded/', 'Branded'], ['on-the-record/video-interviews/', 'Video Interviews'], ['on-the-record/king-in-print/', 'King In Print']],
    'inquilab/': [['inquilab/', 'The anthem'], ['inquilab/revolution/', 'The Revolution Starts Now']],
    'asoka-to-booda/': [['asoka-to-booda/', 'Contents'], ['asoka-to-booda/manuscript/prologue.html', 'Prologue'], ['asoka-to-booda/manuscript/chapter-01.html', 'Part I'], ['asoka-to-booda/manuscript/chapter-39.html', 'The Royal Flush'], ['asoka-to-booda/manuscript/addendum-a.html', 'Academic Addendum'], ['asoka-to-booda/manuscript/final-frame.html', 'The Final Frame']]
  };
  // the shared polish layer (sizes, spacing, one type scale) loads after each page's own styles
  if (!document.querySelector('link[href*="assets/polish.css"]')) {
    var pl = document.createElement('link'); pl.rel = 'stylesheet'; pl.href = assets + 'polish.css' + (me.src.split('?')[1] ? '?' + me.src.split('?')[1] : '');
    document.head.appendChild(pl);
  }

  if (!document.querySelector('link[href*="fonts.googleapis.com"][href*="Anton"]')) {
    var fl = document.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@500;600&display=swap';
    document.head.appendChild(fl);
  }

  var css = [
    '#site-header{--sh-bone:#f1e9df;--sh-red:#e3242b;--sh-redtext:#ff4a4f;--sh-ground:#050303;display:contents;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;text-transform:none;letter-spacing:normal;line-height:1.2}',
    '#site-header *{box-sizing:border-box}',
    '#site-header img{display:block;max-width:none;border:0}',
    '#site-header a{text-decoration:none}',
    /* shield from page-level element rules (e.g. a page that styles every nav as a sticky bar) */
    '#site-header nav,#site-header div,#site-header span,#site-header a,#site-header button{position:static;top:auto;z-index:auto;float:none;margin:0;background:none;-webkit-backdrop-filter:none;backdrop-filter:none;border:0;box-shadow:none;filter:none;opacity:1;transform:none;min-height:0;max-width:none}',
    /* banner */
    '#site-header .sh-banner{display:block;position:relative;z-index:40;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;background:var(--sh-ground);overflow:hidden;border-bottom:1px solid #2a1c1c}',
    '#site-header .sh-frame-box{position:relative;max-width:1600px;margin:0 auto;aspect-ratio:2000/240;overflow:hidden}',
    '#site-header .sh-stage{position:absolute;top:0;left:0;width:100%;height:100%;container-type:inline-size}',
    '#site-header .sh-el{position:absolute;height:auto}',
    '#site-header .sh-boy{left:24.6%;top:1%;width:5.9%}',
    '#site-header .sh-zero{left:31.6%;top:33.98%;width:15%}',
    /* TO in KING lettering, small, with equal gaps to ZERO and ONE (measured from their visible edges) */
    '#site-header .sh-to{left:48.23%;top:48.21%;height:1.9cqw;width:auto}',
    '#site-header .sh-one{left:53.8%;top:8.02%;width:12.9%}',
    '#site-header .sh-one img{width:100%;height:auto}',
    '#site-header .sh-one .sh-crown,#site-header .sh-one .sh-drip{position:absolute;left:0;top:0}',
    /* crown split at the drip line: the crown lands, then the blood runs down */
    '#site-header .sh-one .sh-crown{clip-path:inset(0 0 48.97% 0)}',
    '#site-header .sh-one .sh-drip{clip-path:inset(51.03% 0 0 0)}',
    '#site-header .sh-man{left:67.6%;top:2%;width:6.3%}',
    '#site-header .sh-mirror{position:absolute;top:0;bottom:0;width:23%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:.7cqw}',
    '#site-header .sh-mirror.sh-l{left:1.2%}#site-header .sh-mirror.sh-r{left:75.8%}',
    '#site-header .sh-agar{height:2.6cqw;width:auto}',
    '#site-header .sh-row{display:flex;align-items:flex-end;gap:.9cqw}',






    '#site-header .sh-word{height:3.6cqw;width:auto}',
    '#site-header .sh-hota{height:2.1cqw;width:auto}',
    /* phones: the two titles sit in the bar beside STARKS and the menu (one row) */
    '#site-header .sh-btitles{display:none}',
    /* section bar */
    '#site-header .sh-bar{position:sticky;top:0;z-index:60;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;background:rgba(10,7,7,.95);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid #2a1c1c}',
    '#site-header .sh-bar-in{max-width:1440px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:12px 28px;min-height:52px;padding:0 clamp(16px,3vw,34px)}',
    '#site-header .sh-brand{display:none;align-items:center;gap:10px;margin-right:auto;color:#f4efe9}',
    '#site-header .sh-brand img{height:28px;width:auto}',
    '#site-header .sh-brand span{font-family:Anton,Impact,sans-serif;font-size:16px;letter-spacing:.04em;white-space:nowrap}',
    '#site-header .sh-brand b{color:var(--sh-red);font-weight:400}',
    '#site-header.sh-stuck .sh-brand{display:flex}',
    '#site-header .sh-home{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:36px;height:36px;padding:0;border:1px solid #4a2c2c;color:#f4efe9;font-size:12px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;cursor:pointer}',
    '#site-header .sh-home:hover,#site-header .sh-home:focus-visible{border-color:var(--sh-red);background:var(--sh-red);color:#fff}',
    '#site-header .sh-home svg{flex:0 0 auto}',
    'a[href],button:not(:disabled),[role=button],summary,select,label.btn,label[for],input[type=checkbox],input[type=radio],input[type=file],input[type=range],input[type=submit],input[type=button],[onclick],[data-step]{cursor:pointer}',
    '#site-header .sh-nav{display:flex;flex-wrap:nowrap;justify-content:center;gap:2px 20px;white-space:nowrap}',
    '#site-header .sh-nav a{position:relative;display:inline-block;padding:17px 1px;font-size:12px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:#d9cfc7;cursor:pointer}',
    '#site-header .sh-nav a:hover,#site-header .sh-nav a:focus-visible,#site-header .sh-nav a[aria-current="page"]{color:var(--sh-redtext)}',
    '#site-header .sh-nav a:hover::after,#site-header .sh-nav a[aria-current="page"]::after{content:"";position:absolute;left:0;right:0;bottom:9px;height:2px;background:var(--sh-red)}',
    '#site-header .sh-burger{display:none;width:48px;height:48px;margin-left:auto;background:transparent;border:1px solid #3a2626;color:#f4efe9;align-items:center;justify-content:center;cursor:pointer}',
    '#site-header .sh-burger:hover,#site-header .sh-burger:focus-visible{border-color:var(--sh-redtext);color:var(--sh-redtext)}',
    '#site-header .sh-util{display:flex;align-items:center;gap:2px 16px;margin-left:auto;padding-left:18px;border-left:1px solid #2a1c1c}',
    '#site-header .sh-util a{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#a99d95;padding:16px 0;white-space:nowrap}',
    '#site-header .sh-util a:hover,#site-header .sh-util a[aria-current="page"]{color:var(--sh-redtext)}',
    '#site-header .sh-util a.sh-stats{font-size:17px;letter-spacing:0;line-height:1;padding:8px 2px;filter:saturate(.9)}',
    '#site-header .sh-starks{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #3a2626;color:#f4efe9;font-size:12px;font-weight:700;letter-spacing:.08em;white-space:nowrap}',
    '#site-header .sh-starks b{font-family:Anton,Impact,sans-serif;font-weight:400;font-size:16px;color:var(--sh-redtext);letter-spacing:.02em}',
    '#site-header .sh-drawer .sh-dutil{display:flex;flex-wrap:wrap;gap:6px 22px;padding:18px 0}',
    '#site-header .sh-drawer .sh-dutil a{font-family:Archivo,Arial,sans-serif;font-size:15px;border:0;padding:6px 0;text-transform:uppercase;letter-spacing:.1em;color:#b8aca4}',
    '#site-header .sh-drawer{position:fixed;left:0;right:0;bottom:0;top:57px;z-index:70;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;background:rgba(5,3,3,.98);display:none;flex-direction:column;padding:12px 22px 40px;overflow:auto}',
    '#site-header .sh-drawer.open{display:flex}',
    '#site-header .sh-drawer a{display:flex;align-items:baseline;gap:14px;padding:13px 0;border-bottom:1px solid #2a1c1c;font-family:Anton,Impact,sans-serif;font-size:22px;line-height:1.05;text-transform:uppercase;color:#f4efe9}',
    '#site-header .sh-drawer a small{font-family:Anton,Impact,sans-serif;font-size:13px;color:var(--sh-redtext);min-width:26px}',
    '#site-header .sh-drawer a:hover,#site-header .sh-drawer a:focus-visible,#site-header .sh-drawer a[aria-current="page"]{color:var(--sh-redtext)}',
    /* phone: show the middle of the story, burger menu */
    /* desktop: everything on one line */
    '@media (min-width:1200px){#site-header .sh-bar-in{max-width:none;gap:12px 22px}#site-header.sh-stuck .sh-brand span{display:none}#site-header .sh-util{margin-left:0}#site-header .sh-brand{margin-right:0}}',
    '@media (min-width:1200px) and (max-width:1599px){#site-header .sh-bar-in{gap:12px 6px}#site-header .sh-nav{gap:2px 3px}#site-header .sh-nav a{font-size:12px;letter-spacing:0}#site-header .sh-util{gap:2px 7px;padding-left:7px}#site-header .sh-util a{font-size:11px;letter-spacing:.02em}#site-header .sh-sw{display:none}}',
    '@media (min-width:1600px) and (max-width:1919px){#site-header .sh-nav{gap:2px 7px}#site-header .sh-nav a{font-size:12px;letter-spacing:.05em}#site-header .sh-util{gap:2px 14px}}',
    '@media (min-width:1200px) and (max-width:1359px){#site-header .sh-nav{gap:2px 2px}#site-header .sh-nav a{font-size:11px;letter-spacing:0;padding-left:0;padding-right:0}#site-header .sh-util{gap:2px 6px;padding-left:6px}#site-header .sh-util a{font-size:10.5px;letter-spacing:.01em}#site-header .sh-bar-in{gap:8px 3px;padding:0 4px}}',
    /* tablet and phone: the menu button holds every link, Home included */
    '@media (max-width:1199px){#site-header .sh-nav{display:none}#site-header .sh-home{display:none}#site-header .sh-util{border:0;padding:0;margin-left:auto}#site-header .sh-util a:not(.sh-starks):not(.sh-stats){display:none}#site-header .sh-burger{display:inline-flex}#site-header .sh-brand{display:flex}#site-header .sh-brand img{flex-shrink:0}#site-header .sh-bar-in{justify-content:flex-start;gap:8px}}',
    '@media (max-width:760px){',
    '  #site-header .sh-frame-box{aspect-ratio:1040/240}',
    '  #site-header .sh-stage{width:192.3%;left:-45.6%}',
    '  #site-header .sh-mirror{display:none}',
    '  #site-header .sh-btitles{display:flex;flex:1 1 auto;min-width:0;justify-content:space-evenly;align-items:center;gap:3%;padding:6px 0;container-type:inline-size}',
    '  #site-header .sh-btitles .sh-mirror{display:flex;position:static;width:auto;align-items:center;gap:min(1cqw,5px)}',
    '  #site-header .sh-btitles .sh-agar{height:min(5.3cqw,24px)}',
    '  #site-header .sh-btitles .sh-row{gap:min(.8cqw,5px)}',
    '  #site-header .sh-btitles .sh-word{height:min(7.4cqw,34px)}',
    '  #site-header .sh-btitles .sh-hota{height:min(4.3cqw,20px)}',
    '  #site-header .sh-util{margin-left:0}',
    '  #site-header .sh-nav{display:none}',
    '  #site-header .sh-util{border:0;padding:0;margin-left:auto}',
    '  #site-header .sh-util a:not(.sh-starks):not(.sh-stats){display:none}',
    '  #site-header .sh-brand img{flex-shrink:0}',
    '  #site-header .sh-starks{padding:4px 8px;font-size:10px;gap:4px}',
    '  #site-header .sh-starks b{font-size:14px}',
    '  #site-header .sh-sw{display:none}',
    '  #site-header .sh-bar-in{gap:8px}',
    '  #site-header .sh-burger{display:inline-flex}',
    /* phones: no ONE + title in the bar (the titles already sit in the strip above); bar keeps only STARKS and the menu */
    '  #site-header .sh-brand{display:none!important}',
    '}',
    '@media (max-width:430px){#site-header .sh-brand span{font-size:14px}#site-header .sh-brand img{height:28px}#site-header .sh-bar-in{gap:6px;padding:0 10px}#site-header .sh-burger{width:42px;height:42px}}',
    '@media (max-width:380px){#site-header .sh-brand span{display:none}}',
    /* first-visit intro: ~3 seconds, once per session */
    '@media (prefers-reduced-motion:no-preference){',
    '  #site-header.sh-intro .sh-boy{animation:sh-in-l .7s cubic-bezier(.2,.8,.2,1) both}',
    '  #site-header.sh-intro .sh-zero{animation:sh-fade .6s .35s both}',
    '  #site-header.sh-intro .sh-to{animation:sh-fade .4s .75s both}',
    '  #site-header.sh-intro .sh-one .sh-base{animation:sh-rise .55s .9s cubic-bezier(.2,.8,.2,1) both}',
    '  #site-header.sh-intro .sh-crown{animation:sh-crown .9s 1.35s cubic-bezier(.3,1.5,.5,1) both}',
    '  #site-header.sh-intro .sh-drip{animation:sh-drip 1.6s 2.2s cubic-bezier(.55,0,.75,.4) both}',
    '  #site-header.sh-intro .sh-man{animation:sh-in-r .7s 1.75s cubic-bezier(.2,.8,.2,1) both}',
    '  #site-header.sh-intro .sh-mirror{animation:sh-fade .7s 2.2s both}',
    '}',
    /* off the home page the story banner rests; the bar carries the brand */
    '#site-header.sh-inner .sh-brand{display:flex}',
    /* section tabs */
    '#site-header .sh-sub{position:sticky;top:52px;z-index:55;background:rgba(14,10,10,.96);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid #2a1c1c}',
    '#site-header .sh-sub-in{max-width:1440px;margin:0 auto;display:flex;align-items:center;gap:4px 22px;min-height:40px;padding:0 clamp(16px,3vw,34px);overflow-x:auto;scrollbar-width:none;white-space:nowrap}',
    '#site-header .sh-sub-in::-webkit-scrollbar{display:none}',
    '#site-header .sh-sub b{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sh-redtext);margin-right:6px}',
    '#site-header .sh-sub a,#site-header .sh-sub span{position:relative;display:inline-block;padding:11px 0;font-size:13px;font-weight:500;color:#cfc4bb}',
    '#site-header .sh-sub span{color:#7d716a}',
    '#site-header .sh-sub a:hover,#site-header .sh-sub a[aria-current="page"]{color:#fff}',
    '#site-header .sh-sub a[aria-current="page"]::after{content:"";position:absolute;left:0;right:0;bottom:6px;height:2px;background:var(--sh-red)}',
    /* back to top */
    '.sh-top{position:fixed;right:18px;bottom:18px;z-index:80;width:44px;height:44px;border-radius:50%;border:1px solid #4a2c2c;background:rgba(10,7,7,.92);color:#f4efe9;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .2s,transform .2s,visibility .2s,background .2s;box-shadow:0 6px 18px rgba(0,0,0,.45)}',
    '.sh-top.on{opacity:1;visibility:visible;transform:none}',
    '.sh-top:hover,.sh-top:focus-visible{background:#c3121a;border-color:#c3121a;color:#fff}',
    '@media print{.sh-top,#site-header{display:none!important}}',
    '@keyframes sh-in-l{from{opacity:0;transform:translateX(-60%)}to{opacity:1;transform:none}}',
    '@keyframes sh-in-r{from{opacity:0;transform:translateX(60%)}to{opacity:1;transform:none}}',
    '@keyframes sh-fade{from{opacity:0;filter:blur(6px)}to{opacity:1;filter:none}}',
    '@keyframes sh-rise{from{opacity:0;transform:translateY(30%)}to{opacity:1;transform:none}}',
    '@keyframes sh-drip{from{clip-path:inset(51.03% 0 48.97% 0)}to{clip-path:inset(51.03% 0 0 0)}}',
    '@keyframes sh-crown{0%{opacity:0;transform:translateY(-140%) rotate(-12deg)}55%{opacity:1}100%{opacity:1;transform:none}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    for (var k in (attrs || {})) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
    return e;
  }
  function img(src, w, h, cls, alt) { return el('img', { src: src, width: w, height: h, class: cls || '', alt: alt || '' }); }

  // Left: Bauua (ZERO) dreams "Agar main KING hota" in KING lettering.
  // Right: the King (KING) answers "Agar main FAN hota" in FAN lettering. No swapping.
  function mirror(side, film) {
    var s = film === 'king'
      ? { agar: ['agar-king.webp', 1907, 220], word: ['king-word-cap.webp', 1000, 274], hota: ['hota-king.webp', 935, 220] }
      : { agar: ['agar-fan.webp', 1910, 220], word: ['fan-word-cap.webp', 807, 234], hota: ['hota-fan.webp', 936, 220] };
    return el('div', { class: 'sh-mirror ' + side, 'aria-hidden': 'true' }, [
      img(A(s.agar[0]), s.agar[1], s.agar[2], 'sh-agar'),
      el('div', { class: 'sh-row' }, [img(A(s.word[0]), s.word[1], s.word[2], 'sh-word'), img(A(s.hota[0]), s.hota[1], s.hota[2], 'sh-hota')])
    ]);
  }

  var here = location.pathname.replace(/index\.html$/, '');
  function isHere(path) { var p = new URL(path, root).pathname; return here === p || (p.length > 1 && here.indexOf(p) === 0 && p !== new URL(root).pathname); }

  var banner = el('a', { class: 'sh-banner', href: home, 'aria-label': 'Agar Main King Hota — Agar Main Fan Hota. From ZERO to ONE. Home' }, [
    el('div', { class: 'sh-frame-box' }, [
      el('div', { class: 'sh-stage' }, [
        mirror('sh-l', 'king'),
        img(A('boy.webp'), 452, 900, 'sh-el sh-boy'),
        img(A('zero.webp'), 972, 349, 'sh-el sh-zero'),
        img(A('to-king.webp'), 442, 220, 'sh-el sh-to'),
        el('div', { class: 'sh-el sh-one' }, [img(A('one.webp'), 900, 584, 'sh-base'), img(A('crown.webp'), 900, 584, 'sh-crown'), img(A('crown.webp'), 900, 584, 'sh-drip')]),
        img(A('king-man.webp'), 499, 900, 'sh-el sh-man'),
        mirror('sh-r', 'fan')
      ])
    ])
  ]);

  var nav = el('nav', { class: 'sh-nav', 'aria-label': 'Sections' });
  var drawer = el('div', { class: 'sh-drawer', id: 'sh-drawer', role: 'dialog', 'aria-label': 'Menu' });
  drawer.appendChild(el('a', { href: home }, [el('small', { text: '00' }), document.createTextNode('Home')]));
  var section = null;
  LINKS.forEach(function (l, i) {
    var a1 = el('a', { href: root + l[0], text: l[1] }), a2 = el('a', { href: root + l[0] }, [el('small', { text: (i < 9 ? '0' : '') + (i + 1) }), document.createTextNode(l[1])]);
    if (isHere(l[0]) || (l[2] || []).some(isHere)) { a1.setAttribute('aria-current', 'page'); a2.setAttribute('aria-current', 'page'); section = l; }
    nav.appendChild(a1); drawer.appendChild(a2);
  });
  var util = el('div', { class: 'sh-util' });
  var dutil = el('div', { class: 'sh-dutil' });
  UTIL.forEach(function (l) {
    var u1 = el('a', { href: root + l[0], text: l[1] }), u2 = el('a', { href: root + l[0], text: l[1] });
    if (isHere(l[0]) || (l[2] || []).some(isHere)) { u1.setAttribute('aria-current', 'page'); u2.setAttribute('aria-current', 'page'); if (!section) section = l; }
    util.appendChild(u1); dutil.appendChild(u2);
  });
  // 📊 Site analytics (owner, 22 Oct 2026): next to Billboard, login page for the owner, her admin team and SRK
  var statsIcon = el('a', { class: 'sh-stats', href: root + 'analytics/', 'aria-label': 'Site analytics', title: 'Site analytics', text: '\uD83D\uDCCA' });
  if (isHere('analytics/')) statsIcon.setAttribute('aria-current', 'page');
  util.appendChild(statsIcon);
  dutil.appendChild(el('a', { href: root + 'analytics/', text: '\uD83D\uDCCA Analytics' }));
  MORE.forEach(function (l) { dutil.appendChild(el('a', { href: root + l[0], text: l[1] })); });
  var starks = el('a', { class: 'sh-starks', href: root + 'fan-billboard/', 'aria-label': 'Your STARKS' });
  function paintStarks() {
    var n = 0; try { n = (JSON.parse(localStorage.getItem('amkh-starks') || '{}').balance) || 0; } catch (e) {}
    starks.innerHTML = '★ <b>' + Number(n).toLocaleString('en-IN') + '</b><span class="sh-sw"> STARKS</span>';
  }
  paintStarks(); document.addEventListener('starks', paintStarks);
  util.appendChild(starks);
  drawer.appendChild(dutil);
  var burger = el('button', { class: 'sh-burger', type: 'button', 'aria-label': 'Open menu', 'aria-expanded': 'false', 'aria-controls': 'sh-drawer' });
  burger.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var brand = el('a', { class: 'sh-brand', href: home, 'aria-label': 'Agar Main King Hota — home' }, [
    img(A('one-full.webp'), 900, 584, '', ''),
    el('span', {}, [document.createTextNode('AGAR MAIN '), el('b', { text: 'KING' }), document.createTextNode(' HOTA')])
  ]);
  // a plain Home button on every page except the home page itself
  var atHome = here === new URL(root).pathname || /\/agarmainkinghota\.html$/i.test(here);
  var homeBtn = el('a', { class: 'sh-home', href: home, 'aria-label': 'Home' });
  homeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>';
  // phones only: both titles live in the bar, so titles + STARKS + menu share one row
  // KING title -> Vision & Mission; FAN title -> Agar Main Fan Hota (the King's Playroom)
  var FANHOTA = root + 'agar-main-fan-hota/';
  var VISION = root + 'vision/'; // KING title -> Vision & Mission (owner, 23 Oct 2026); Home button goes home
  var btitles = el('div', { class: 'sh-btitles' }, [
    el('a', { href: VISION, 'aria-label': 'Agar Main King Hota — Vision & Mission', style: 'display:flex' }, [mirror('sh-l', 'king')]),
    el('a', { href: FANHOTA, 'aria-label': 'Agar Main Fan Hota — the King\'s Playroom', style: 'display:flex' }, [mirror('sh-r', 'fan')])
  ]);
  // big banner (desktop): the FAN title opens the Playroom too
  var bannerFan = banner.querySelector('.sh-r');
  if (bannerFan) { bannerFan.style.cursor = 'pointer'; bannerFan.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); location.href = FANHOTA; }); }
  var bannerKing = banner.querySelector('.sh-l');
  if (bannerKing) { bannerKing.style.cursor = 'pointer'; bannerKing.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); location.href = VISION; }); }
  var barKids = atHome ? [brand, btitles, nav, util, burger] : [brand, btitles, homeBtn, nav, util, burger];
  var bar = el('div', { class: 'sh-bar' }, [el('div', { class: 'sh-bar-in' }, barKids)]);

  // section tabs: the sub-pages of the section you are in
  var sub = null, tabs = section && SUB[section[0]];
  if (tabs) {
    var subIn = el('div', { class: 'sh-sub-in' }, [el('b', { text: section[1] })]);
    var exact = location.pathname.replace(/index\.html$/, '') + location.hash;
    var best = null;
    tabs.forEach(function (t) {
      if (!t[0]) { subIn.appendChild(el('span', { text: t[1] })); return; }
      var a = el('a', { href: root + t[0], text: t[1] }); subIn.appendChild(a);
      var u = new URL(t[0], root), key = u.pathname + u.hash;
      if (exact === key || (!u.hash && here.indexOf(u.pathname) === 0 && (!best || u.pathname.length > best.len))) {
        if (exact === key) best = { a: a, len: 1e9 }; else best = { a: a, len: u.pathname.length };
      }
    });
    if (best) best.a.setAttribute('aria-current', 'page');
    sub = el('nav', { class: 'sh-sub', 'aria-label': section[1] + ' pages' }, [subIn]);
  }

  // the ZERO to ONE story banner tops every page (it links home); the bar pins under it
  var header = el('header', { id: 'site-header' }, [banner, bar, sub, drawer]);
  me.parentNode.insertBefore(header, me);

  // burger menu
  function setOpen(open) {
    if (open) drawer.style.top = Math.max(0, bar.getBoundingClientRect().bottom) + 'px';
    drawer.classList.toggle('open', open); burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.innerHTML = open
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setOpen(!drawer.classList.contains('open')); });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) { setOpen(false); burger.focus(); } });

  // back to top: appears once you have scrolled a screen down, on every page
  var topBtn = el('button', { class: 'sh-top', type: 'button', 'aria-label': 'Back to top', title: 'Back to top' });
  topBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  function paintTop() { topBtn.classList.toggle('on', (window.scrollY || document.documentElement.scrollTop) > Math.max(500, innerHeight * 0.8)); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('scroll', paintTop, { passive: true });
  function addTop() { document.body.appendChild(topBtn); paintTop(); }
  if (document.body) addTop(); else document.addEventListener('DOMContentLoaded', addTop);

  // compact brand in the bar once the banner scrolls away
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { header.classList.toggle('sh-stuck', !es[0].isIntersecting); }).observe(banner);
  }

  // pages with their own sticky bar sit it under ours: top: var(--sh-bar-h)
  function barH() {
    if (sub) sub.style.top = bar.offsetHeight + 'px';
    document.documentElement.style.setProperty('--sh-bar-h', (bar.offsetHeight + (sub ? sub.offsetHeight : 0)) + 'px');
  }
  barH(); window.addEventListener('resize', barH);

  // first view of the session plays the intro; later pages appear still
  var seen = false;
  try { seen = sessionStorage.getItem('amkh-intro') === '1'; sessionStorage.setItem('amkh-intro', '1'); } catch (e) { }
  if (!seen && !reduce) {
    header.classList.add('sh-intro');
  }
})();

/* Visitor numbers: one anonymous page-view ping per page load.
   A random id kept in this browser (no cookies, no IP stored) lets the site count unique visitors. */
(function () {
  try {
    if (navigator.webdriver || !/agarmainkinghota\.com$|github\.io$/.test(location.hostname)) return;
    var k = 'amkh-vid', v = localStorage.getItem(k);
    if (!v) { v = Array.from(crypto.getRandomValues(new Uint8Array(12))).map(function (b) { return b.toString(16).padStart(2, '0'); }).join(''); localStorage.setItem(k, v); }
    var body = JSON.stringify({ vid: v, path: location.pathname });
    var url = 'https://asokatobooda.iamshahrock.workers.dev/track';
    if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
    else fetch(url, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' });
  } catch (e) {}
})();
