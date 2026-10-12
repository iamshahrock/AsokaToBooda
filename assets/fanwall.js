/* Fan Wall: comments and reactions at the bottom of every section page.
   Loaded by footer.js on the pages listed in PAGES (the Worker accepts the same list). */
(function () {
  if (document.getElementById('fan-wall')) return;
  var API = 'https://asokatobooda.iamshahrock.workers.dev';
  var me = document.currentScript || document.querySelector('script[src*="assets/fanwall.js"]');
  var base = new URL('.', me ? me.src : location.href).href, q = me && me.src.indexOf('?') > 0 ? me.src.slice(me.src.indexOf('?')) : '';
  var page = location.pathname.replace(/index\.html$/i, '');
  var PAGES = ['/create/', '/lairs/', '/CHESS81.HTML', '/fan-billboard/', '/king-intelligence/', '/asoka-to-booda/', '/doom-to-king/', '/inquilab/', '/fan-made-ai-universe/'];
  if (PAGES.indexOf(page) < 0) return;
  var MAX = 555, sort = 'new', state = null, replyTo = null;

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function device() {
    try { if (window.STARKS) return STARKS.get().device; } catch (e) {}
    var d = null; try { d = localStorage.getItem('amkh-wall-dev'); } catch (e) {}
    if (!d) { d = Array.from(crypto.getRandomValues(new Uint8Array(12))).map(function (b) { return b.toString(16).padStart(2, '0'); }).join(''); try { localStorage.setItem('amkh-wall-dev', d); } catch (e) {} }
    return d;
  }
  function myName() {
    var n = ''; try { n = localStorage.getItem('amkh-wall-name') || ''; } catch (e) {}
    try { if (!n && window.STARKS && STARKS.get().name) n = STARKS.get().name; } catch (e) {}
    return n;
  }
  function ago(ts) {
    var s = Math.max(1, Math.round((Date.now() - ts) / 1000));
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    var d = Math.floor(s / 86400); return d < 30 ? d + ' d ago' : new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }

  var css = '#fan-wall{--fw-red:#c3121a;--fw-hi:#ff4a4f;--fw-line:#2a1c1c;--fw-ink:#f4efe9;--fw-mute:#b8aca4;background:#070505;color:var(--fw-ink);border-top:1px solid var(--fw-line);font-family:Archivo,"Helvetica Neue",Arial,sans-serif;text-transform:none;letter-spacing:normal;line-height:1.5;padding:40px 16px}' +
    '#fan-wall *{box-sizing:border-box}#fan-wall .fw-in{max-width:880px;margin:0 auto}' +
    '#fan-wall .fw-eye{margin:0;font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--fw-hi)}' +
    '#fan-wall h2{margin:4px 0 6px;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:clamp(32px,4.4vw,52px);line-height:1;text-transform:uppercase;color:var(--fw-ink)}' +
    '#fan-wall h2 em{font-style:normal;color:var(--fw-hi)}#fan-wall .fw-sub{margin:0 0 16px;color:var(--fw-mute);font-size:14px}' +
    '#fan-wall .fw-react{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}' +
    '#fan-wall button{font:inherit;cursor:pointer}' +
    '#fan-wall .fw-rx{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border:1px solid var(--fw-line);background:#120c0c;color:var(--fw-ink);font-size:15px}' +
    '#fan-wall .fw-rx[aria-pressed=true]{border-color:var(--fw-red);background:#3a0a0e}#fan-wall .fw-rx b{font-weight:600}' +
    '#fan-wall form{border:1px solid var(--fw-line);background:#0d0909;padding:14px;margin:0 0 18px}' +
    '#fan-wall .fw-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-top:8px}' +
    '#fan-wall input,#fan-wall textarea{width:100%;background:#120c0c;border:1px solid #3a2626;color:var(--fw-ink);padding:10px;font:inherit;font-size:15px}' +
    '#fan-wall input{max-width:240px;margin-bottom:8px}#fan-wall textarea{min-height:92px;resize:vertical}' +
    '#fan-wall .fw-count{font-size:12px;color:var(--fw-mute)}#fan-wall .fw-count.over{color:var(--fw-hi)}' +
    '#fan-wall .fw-go{padding:10px 18px;background:var(--fw-red);border:1px solid var(--fw-red);color:#fff;font-weight:600;letter-spacing:.08em;text-transform:uppercase;font-size:13px}' +
    '#fan-wall .fw-go:disabled{opacity:.5;cursor:not-allowed}' +
    '#fan-wall .fw-msg{margin:6px 0 0;font-size:13px;color:var(--fw-mute)}#fan-wall .fw-replying{font-size:13px;color:var(--fw-hi);margin:0 0 6px}' +
    '#fan-wall .fw-rules{font-size:12px;color:#8f837c;margin:8px 0 0}' +
    '#fan-wall .fw-bar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 10px;font-size:13px;color:var(--fw-mute)}' +
    '#fan-wall .fw-sort button{background:none;border:0;color:var(--fw-mute);padding:4px 8px;font-size:13px}#fan-wall .fw-sort button[aria-pressed=true]{color:var(--fw-ink);border-bottom:2px solid var(--fw-red)}' +
    '#fan-wall ol{list-style:none;margin:0;padding:0}#fan-wall li.fw-c{border-top:1px solid var(--fw-line);padding:12px 0}' +
    '#fan-wall .fw-head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}#fan-wall .fw-head b{color:var(--fw-ink);font-size:15px}#fan-wall .fw-head small{color:#8f837c;font-size:12px}' +
    '#fan-wall .fw-body{margin:4px 0 6px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px;color:#e6dcd4}' +
    '#fan-wall .fw-acts{display:flex;gap:14px}#fan-wall .fw-acts button{background:none;border:0;padding:2px 0;color:var(--fw-mute);font-size:13px}#fan-wall .fw-acts button:hover{color:var(--fw-hi)}' +
    '#fan-wall .fw-acts button[aria-pressed=true]{color:var(--fw-hi)}' +
    '#fan-wall ol ol{margin:8px 0 0 18px;border-left:2px solid var(--fw-line);padding-left:12px}#fan-wall ol ol li.fw-c{border-top:0;padding:8px 0}' +
    '#fan-wall .fw-empty{padding:20px;border:1px dashed var(--fw-line);text-align:center;color:var(--fw-mute)}' +
    '#fan-wall .fw-more{margin-top:12px;background:none;border:1px solid var(--fw-line);color:var(--fw-ink);padding:8px 14px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var w = document.createElement('section'); w.id = 'fan-wall'; w.setAttribute('aria-labelledby', 'fw-h');
  w.innerHTML = '<div class="fw-in"><p class="fw-eye">Fan Wall</p><h2 id="fw-h">Say it <em>loud</em></h2>' +
    '<p class="fw-sub">Your words, your wall. Every comment earns +10 STARKS (3 a day).</p>' +
    '<div class="fw-react" id="fwReact"></div>' +
    '<form id="fwForm"><p class="fw-replying" id="fwReplying" hidden></p><input id="fwName" maxlength="24" placeholder="Your name" autocomplete="nickname" aria-label="Your name">' +
    '<textarea id="fwText" maxlength="' + MAX + '" placeholder="What do you want to say?" aria-label="Your comment"></textarea>' +
    '<div class="fw-row"><span class="fw-count" id="fwCount">0 / ' + MAX + '</span><button class="fw-go" id="fwGo" type="submit">Post to the wall</button></div>' +
    '<p class="fw-msg" id="fwMsg" aria-live="polite"></p><p class="fw-rules">Say what you feel. No spam, no threats, no leaking anyone’s private details. Comments with links wait for a quick check. Three reports from fans hide a comment until it is reviewed.</p></form>' +
    '<div class="fw-bar"><span id="fwTotal"></span><span class="fw-sort"><button type="button" data-s="new" aria-pressed="true">Newest</button><button type="button" data-s="top" aria-pressed="false">Most crowned</button></span></div>' +
    '<ol id="fwList"><li class="fw-empty">Loading the wall…</li></ol><div id="fwMoreBox"></div></div>';
  var foot = document.getElementById('site-footer');
  if (foot) foot.parentNode.insertBefore(w, foot); else document.body.appendChild(w);
  var $ = function (id) { return document.getElementById(id); };
  $('fwName').value = myName();

  var shown = 40;
  function draw() {
    if (!state) return;
    var R = [['crown', '👑', 'Crown'], ['fire', '🔥', 'Fire'], ['heart', '❤️', 'Love']];
    $('fwReact').innerHTML = R.map(function (r) { var on = state.mine.reactions.indexOf(r[0]) >= 0; return '<button type="button" class="fw-rx" data-k="' + r[0] + '" aria-pressed="' + on + '" aria-label="' + r[2] + ' this page">' + r[1] + ' <b>' + fmt(state.reactions[r[0]]) + '</b></button>'; }).join('');
    var top = state.comments.filter(function (c) { return !c.parent; }), kids = {};
    state.comments.forEach(function (c) { if (c.parent) (kids[c.parent] = kids[c.parent] || []).push(c); });
    $('fwTotal').textContent = state.comments.length ? fmt(state.comments.length) + ' comment' + (state.comments.length > 1 ? 's' : '') : '';
    function one(c) {
      var crowned = state.mine.crowns.indexOf(c.id) >= 0;
      var k = (kids[c.id] || []).slice().sort(function (a, b) { return a.ts - b.ts; });
      return '<li class="fw-c" id="fw-' + c.id + '"><div class="fw-head"><b>' + esc(c.name) + '</b><small>' + ago(c.ts) + '</small></div><p class="fw-body">' + esc(c.body) + '</p>' +
        '<div class="fw-acts"><button type="button" data-a="crown" data-id="' + c.id + '" aria-pressed="' + crowned + '">👑 ' + (c.crowns ? fmt(c.crowns) : 'Crown') + '</button>' +
        (c.parent ? '' : '<button type="button" data-a="reply" data-id="' + c.id + '" data-n="' + esc(c.name) + '">Reply</button>') +
        '<button type="button" data-a="report" data-id="' + c.id + '">Report</button></div>' +
        (k.length ? '<ol>' + k.map(one).join('') + '</ol>' : '') + '</li>';
    }
    $('fwList').innerHTML = top.length ? top.slice(0, shown).map(one).join('') : '<li class="fw-empty">The wall is empty. Be the first fan to write on it.</li>';
    $('fwMoreBox').innerHTML = top.length > shown ? '<button class="fw-more" type="button" id="fwMore">Show more (' + (top.length - shown) + ')</button>' : '';
    if ($('fwMore')) $('fwMore').onclick = function () { shown += 40; draw(); };
  }
  function load() {
    return fetch(API + '/comments?page=' + encodeURIComponent(page) + '&sort=' + sort + '&device=' + device(), { cache: 'no-store' })
      .then(function (r) { return r.json(); }).then(function (j) { if (j.comments) { state = j; draw(); } })
      .catch(function () { $('fwList').innerHTML = '<li class="fw-empty">The wall could not load. Try again in a moment.</li>'; });
  }
  function post(path, body) {
    body.device = device(); body.sort = sort;
    return fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Something went wrong.'); return j; }); });
  }
  $('fwText').oninput = function () { var n = $('fwText').value.length; $('fwCount').textContent = n + ' / ' + MAX; $('fwCount').classList.toggle('over', n >= MAX); };
  $('fwForm').onsubmit = function (e) {
    e.preventDefault();
    var name = $('fwName').value.trim(), text = $('fwText').value.trim(), msg = $('fwMsg');
    if (name.length < 2) { msg.textContent = 'Add your name first.'; $('fwName').focus(); return; }
    if (text.length < 2) { msg.textContent = 'Write something first.'; return; }
    try { localStorage.setItem('amkh-wall-name', name); } catch (x) {}
    $('fwGo').disabled = true; msg.textContent = 'Posting…';
    post('/comments', { page: page, body: text, name: name, parent: replyTo }).then(function (j) {
      state = j; draw(); $('fwText').value = ''; $('fwText').oninput(); replyTo = null; $('fwReplying').hidden = true;
      var got = 0; try { if (window.STARKS) got = STARKS.earn('comment', 10, 'Fan Wall comment'); } catch (x) {}
      msg.textContent = j.held ? 'Thanks! Your comment has a link, so it will appear after a quick check.' : 'Posted' + (got ? ' · +10 STARKS' : '') + '.';
    }).catch(function (x) { msg.textContent = x.message; }).then(function () { $('fwGo').disabled = false; });
  };
  w.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.classList.contains('fw-rx')) { post('/comments/react', { page: page, kind: b.dataset.k }).then(function (j) { state = j; draw(); }).catch(function (x) { $('fwMsg').textContent = x.message; }); }
    else if (b.dataset.s) { sort = b.dataset.s; [].forEach.call(w.querySelectorAll('.fw-sort button'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); load(); }
    else if (b.dataset.a === 'reply') { replyTo = +b.dataset.id; $('fwReplying').hidden = false; $('fwReplying').textContent = 'Replying to ' + b.dataset.n + ' · tap Reply again to cancel'; $('fwText').focus(); b.dataset.a = 'unreply'; }
    else if (b.dataset.a === 'unreply') { replyTo = null; $('fwReplying').hidden = true; b.dataset.a = 'reply'; }
    else if (b.dataset.a === 'crown') { post('/comments/crown', { id: +b.dataset.id }).then(function (j) { state = j; draw(); }).catch(function (x) { $('fwMsg').textContent = x.message; }); }
    else if (b.dataset.a === 'report') { if (b.dataset.done) return; b.dataset.done = '1'; post('/comments/report', { id: +b.dataset.id }).then(function (j) { state = j; draw(); $('fwMsg').textContent = 'Reported. Thank you.'; }).catch(function (x) { $('fwMsg').textContent = x.message; }); }
  });
  if (!window.STARKS) { var s = document.createElement('script'); s.src = base + 'starks.js' + q; document.head.appendChild(s); }
  load();
})();
