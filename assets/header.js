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
  var A = function (p) { return assets + 'header/' + p; };

  // One journey, four doors (live from 10 Oct 2026).
  var home = root;
  var LINKS = [
    ['create/', 'Create'],
    ['play/', 'Play'],
    ['crown/', 'The Crown'],
    ['know/', 'Know']
  ];
  var OLD_LINKS = [
    ['game/', 'Agar Main King Hota'],
    ['CHESS81.HTML', 'Check. Mate. Fire.'],
    ['king-intelligence/', 'KING Buzz'],
    ['asoka-to-booda/', 'Asoka to Booda'],
    ['fan-made-ai-universe/', 'Fan Universe'],
    ['fan-billboard/', 'Billboard']
  ];

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
    /* section bar */
    '#site-header .sh-bar{position:sticky;top:0;z-index:60;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;background:rgba(10,7,7,.95);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid #2a1c1c}',
    '#site-header .sh-bar-in{max-width:1440px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:12px 28px;min-height:56px;padding:0 clamp(16px,3vw,34px)}',
    '#site-header .sh-brand{display:none;align-items:center;gap:10px;margin-right:auto;color:#f4efe9}',
    '#site-header .sh-brand img{height:34px;width:auto}',
    '#site-header .sh-brand span{font-family:Anton,Impact,sans-serif;font-size:19px;letter-spacing:.03em;white-space:nowrap}',
    '#site-header .sh-brand b{color:var(--sh-red);font-weight:400}',
    '#site-header.sh-stuck .sh-brand{display:flex}',
    '#site-header .sh-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 26px}',
    '#site-header .sh-nav a{position:relative;display:inline-block;padding:16px 2px;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#f4efe9;cursor:pointer}',
    '#site-header .sh-nav a:hover,#site-header .sh-nav a:focus-visible,#site-header .sh-nav a[aria-current="page"]{color:var(--sh-redtext)}',
    '#site-header .sh-nav a:hover::after,#site-header .sh-nav a[aria-current="page"]::after{content:"";position:absolute;left:0;right:0;bottom:10px;height:2px;background:var(--sh-red)}',
    '#site-header .sh-burger{display:none;width:48px;height:48px;margin-left:auto;background:transparent;border:1px solid #3a2626;color:#f4efe9;align-items:center;justify-content:center;cursor:pointer}',
    '#site-header .sh-burger:hover,#site-header .sh-burger:focus-visible{border-color:var(--sh-redtext);color:var(--sh-redtext)}',
    '#site-header .sh-drawer{position:fixed;left:0;right:0;bottom:0;top:57px;z-index:70;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;background:rgba(5,3,3,.98);display:none;flex-direction:column;padding:12px 22px 40px;overflow:auto}',
    '#site-header .sh-drawer.open{display:flex}',
    '#site-header .sh-drawer a{display:flex;align-items:baseline;gap:14px;padding:16px 0;border-bottom:1px solid #2a1c1c;font-family:Anton,Impact,sans-serif;font-size:30px;line-height:1.05;text-transform:uppercase;color:#f4efe9}',
    '#site-header .sh-drawer a small{font-family:Anton,Impact,sans-serif;font-size:15px;color:var(--sh-redtext);min-width:26px}',
    '#site-header .sh-drawer a:hover,#site-header .sh-drawer a:focus-visible,#site-header .sh-drawer a[aria-current="page"]{color:var(--sh-redtext)}',
    /* phone: show the middle of the story, burger menu */
    '@media (max-width:1100px) and (min-width:761px){#site-header .sh-nav{gap:2px 16px}#site-header .sh-nav a{font-size:12px;letter-spacing:.09em}}',
    '@media (max-width:760px){',
    '  #site-header .sh-frame-box{aspect-ratio:1040/240}',
    '  #site-header .sh-stage{width:192.3%;left:-45.6%}',
    '  #site-header .sh-mirror{display:none}',
    '  #site-header .sh-nav{display:none}',
    '  #site-header .sh-burger{display:inline-flex}',
    '  #site-header .sh-brand{display:flex}',
    '  #site-header .sh-brand span{font-size:17px}',
    '}',
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
  LINKS.forEach(function (l, i) {
    var a1 = el('a', { href: root + l[0], text: l[1] }), a2 = el('a', { href: root + l[0] }, [el('small', { text: '0' + (i + 1) }), document.createTextNode(l[1])]);
    if (isHere(l[0])) { a1.setAttribute('aria-current', 'page'); a2.setAttribute('aria-current', 'page'); }
    nav.appendChild(a1); drawer.appendChild(a2);
  });
  var burger = el('button', { class: 'sh-burger', type: 'button', 'aria-label': 'Open menu', 'aria-expanded': 'false', 'aria-controls': 'sh-drawer' });
  burger.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var brand = el('a', { class: 'sh-brand', href: home, 'aria-label': 'Agar Main King Hota — home' }, [
    img(A('one-full.webp'), 900, 584, '', ''),
    el('span', {}, [document.createTextNode('AGAR MAIN '), el('b', { text: 'KING' }), document.createTextNode(' HOTA')])
  ]);
  var bar = el('div', { class: 'sh-bar' }, [el('div', { class: 'sh-bar-in' }, [brand, nav, burger])]);

  var header = el('header', { id: 'site-header' }, [banner, bar, drawer]);
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

  // compact brand in the bar once the banner scrolls away
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { header.classList.toggle('sh-stuck', !es[0].isIntersecting); }).observe(banner);
  }

  // pages with their own sticky bar sit it under ours: top: var(--sh-bar-h)
  function barH() { document.documentElement.style.setProperty('--sh-bar-h', bar.offsetHeight + 'px'); }
  barH(); window.addEventListener('resize', barH);

  // first view of the session plays the intro; later pages appear still
  var seen = false;
  try { seen = sessionStorage.getItem('amkh-intro') === '1'; sessionStorage.setItem('amkh-intro', '1'); } catch (e) { }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!seen && !reduce) {
    header.classList.add('sh-intro');
  }
})();
