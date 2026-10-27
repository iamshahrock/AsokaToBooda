/* King's Lairs · Rescue Your Face
   Mario-style worlds on the owner's lair pictures. Every level is a different arcade game, 55 seconds.
   The fan's photo is "stolen" into the safe at the start; the last level (bow and arrow) shoots down the crown,
   the crown becomes the key, the safe opens and the face goes to Make Your Poster.
   The photo never leaves the device here (localStorage 'amkh-face'); only the poster studio sends it to the AI. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var SC = '../assets/lairs/scenes/';
  var KEY = 'amkh-rescue', FACE = 'amkh-face', SECS = 55;
  var WORLDS = {
    city: { name: 'The Underground City', sub: 'The Casino, The Pit and the Abyssal Den', img: 'city-floorplan', open: true,
      levels: [
        { id: 'gallery', name: 'Shooting Gallery', where: 'Casino Floor', img: 'casino-grand', style: 'Duck Hunt', pin: [22, 60],
          how: 'The House throws its cards into the air. Tap or click to shoot them. Do not hit the faces. Hit 15 to win.' },
        { id: 'bricks', name: 'Chip Breaker', where: 'Casino Floor', img: 'casino-grand', style: 'Arkanoid', pin: [36, 48],
          how: 'Smash the House\'s wall of chips. Move the paddle with your finger, mouse or arrow keys. Break 60% of the wall to win; you have 3 balls.' },
        { id: 'knockout', name: 'Knockout', where: 'The Pit', img: 'pit-dance', style: 'Punch-Out', pin: [52, 36],
          how: 'The brute swings left or right: dodge to the other side. When he is open, PUNCH. Knock him out before he knocks you out.' },
        { id: 'dive', name: 'Deep Dive', where: 'The Abyssal Den', img: 'den-abyssal', style: 'Dodger', pin: [70, 30],
          how: 'Swim through the Noctopus\'s tank. Grab 12 crowns. Three hits from ink or sharks and you surface.' },
        { id: 'runner', name: 'Tunnel Run', where: 'The service tunnels', img: 'city-vr', style: 'Subway Surfers', pin: [80, 56],
          how: 'Run the tunnels for 55 seconds. Swipe or use the arrow keys: left and right to change lane, up to jump the barriers, down to slide under the bars.' },
        { id: 'archery', name: 'Shoot the Crown', where: 'The Trophy Vault', img: 'city-vault', style: 'Bow and arrow', pin: [60, 84], boss: true,
          how: 'The crown swings above the vault. Drag back to aim, let go to shoot. Watch the wind. Seven arrows. Hit the crown and it becomes the key.' }
      ] },
    lab: { name: 'The AI Lab', sub: 'The glass dome: the Lab, the Archive and the Hive', img: 'dome-panorama', open: true,
      levels: [
        { id: 'stealth', name: 'Searchlights', where: 'The frozen lake', img: 'dome-aerial', style: 'Stealth', pin: [14, 28],
          how: 'Cross the ice to the dome. Hold the screen (or the space bar) to creep forward; let go when a searchlight comes. Spotted three times and the alarm goes off.' },
        { id: 'invaders', name: 'Drone Attack', where: 'The Lab', img: 'dome-lab', style: 'Space Invaders', pin: [33, 42],
          how: 'The face-copying drones are coming down. Move with your finger, mouse or arrows; you fire on your own. Destroy all 30 drones. Their lasers cost you a shield.' },
        { id: 'slicer', name: 'Fake Slicer', where: 'The Archive', img: 'dome-archive', style: 'Fruit Ninja', pin: [10, 72],
          how: 'Fake faces fly out of the Archive. Swipe to slice them. Never slice a real fan (the gold ones). Slice 30 fakes to win.' },
        { id: 'maze', name: 'Hive Chase', where: 'The Hive', img: 'dome-hive', style: 'Pac-Man', pin: [50, 64],
          how: 'Run the Hive and touch every pod to free the face inside. Guards hunt you: swipe or use the arrow keys to turn. Free 80% of the pods to win.' },
        { id: 'flyer', name: 'Tower Flight', where: 'Above the dome', img: 'dome-arrival', style: 'Flappy Bird', pin: [52, 12],
          how: 'Fly the helicopter between the broadcast towers. Tap (or space) to rise. Pass 15 towers to win.' },
        { id: 'archery', name: 'Shoot the Crown', where: 'The control room', img: 'dome-waterfall', style: 'Bow and arrow', pin: [61, 45], boss: true,
          how: 'The second crown swings above the world map. Drag back to aim, let go to shoot. Watch the wind. Seven arrows. Hit the crown and it becomes the key.' }
      ] }
  };
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var S = load(); S.w = S.w || {};
  function W(id) { S.w[id] = S.w[id] || { level: 0, lives: 3, score: 0, best: {}, rescued: false }; return S.w[id]; }
  function face() { try { return localStorage.getItem(FACE); } catch (e) { return null; } }
  function fmt(n) { return Number(n).toLocaleString('en-IN'); }
  function earn(r, n, note, once) { try { return window.STARKS ? STARKS.earn(r, n, note, once) : 0; } catch (e) { return 0; } }
  var root, stop = null, current = null;

  /* ---------------- screens ---------------- */
  function screen(html) { if (stop) { stop(); stop = null; } root.innerHTML = html; root.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function safeHtml(open) {
    var f = face();
    return '<div class="rs-safe' + (open ? ' open' : '') + '"><div class="rs-face">' + (f ? '<img src="' + f + '" alt="Your face">' : '<span>?</span>') + '</div><div class="rs-bars"></div><div class="rs-lock">' + (open ? 'OPEN' : 'LOCKED') + '</div></div>';
  }
  function intro(note) {
    current = null;
    var f = face();
    screen('<div class="rs-intro"><div class="rs-copy"><p class="eyebrow">King\'s Lairs</p><h2>Rescue <em>your face</em></h2>' +
      '<p class="say">A face thief is stealing fans\' faces and locking them in his safe. Yours is next. Fight through the lairs, level by level, shoot down his crown, and the crown becomes the key to the safe.</p>' +
      '<div class="rs-up">' + safeHtml(false) + '<div><p class="say" style="margin:0 0 10px">' + (f ? 'Your face is locked in the safe. Go and get it back.' : 'Add your photo: it goes into the safe until you rescue it. It stays on this device.') + '</p>' +
      '<label class="btn btn-line rs-file">' + (f ? 'Change photo' : 'Add your photo') + '<input type="file" accept="image/jpeg,image/png,image/webp" hidden id="rsFile"></label>' +
      '<label class="still-ok"><input type="checkbox" id="rsOk"' + (f ? ' checked' : '') + '> This is my photo, or I have permission to use it.</label><p class="msg' + (note ? ' ok' : '') + '" id="rsMsg">' + (note || '') + '</p></div></div></div>' +
      '<div class="rs-worlds"><p class="eyebrow">Choose your world</p>' + Object.keys(WORLDS).map(function (k) {
        var w = WORLDS[k], st = W(k), lv = w.levels.length;
        return '<button type="button" class="rs-world' + (w.open ? '' : ' soon') + '" data-w="' + k + '"' + (w.open ? '' : ' disabled') + '><img src="' + SC + w.img + '-m.webp" alt=""><span class="rs-wn">' + w.name + '</span><span class="rs-ws">' + w.sub + '</span><span class="rs-wp">' +
          (w.open ? (st.rescued ? 'Face rescued · ' + fmt(st.score) + ' points' : 'Level ' + (Math.min(st.level, lv - 1) + 1) + ' of ' + lv + ' · ' + st.lives + ' lives') : 'Opens next') + '</span></button>';
      }).join('') + '<p class="say rs-games">Underground City: Shooting Gallery · Chip Breaker · Knockout · Deep Dive · Tunnel Run · Shoot the Crown.<br>The AI Lab: Searchlights · Drone Attack · Fake Slicer · Hive Chase · Tower Flight · Shoot the Crown.<br>Every level is 55 seconds.</p></div></div>');
    $('rsFile').onchange = function () {
      var file = this.files && this.files[0]; if (!file) return;
      if (!$('rsOk').checked) { $('rsMsg').textContent = 'Please tick the box first: the photo must be yours, or one you have permission to use.'; this.value = ''; return; }
      var url = URL.createObjectURL(file), im = new Image(), inp = this;
      $('rsMsg').className = 'msg'; $('rsMsg').textContent = 'Reading your photo…';
      im.onerror = function () { URL.revokeObjectURL(url); inp.value = ''; $('rsMsg').textContent = 'This photo could not be opened. Please use a JPG, PNG or WebP photo (iPhone photos in HEIC: share or export them as JPG first).'; };
      im.onload = function () {
        var sc = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        try { localStorage.setItem(FACE, c.toDataURL('image/jpeg', 0.86)); } catch (e) { $('rsMsg').textContent = 'This browser could not keep the photo; try a smaller one.'; return; }
        intro('Photo added. The face thief has locked it in his safe: choose a world below and fight to get it back.');
        var w = root.querySelector('.rs-worlds'); if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      im.src = url;
    };
    [].forEach.call(root.querySelectorAll('.rs-world'), function (b) { b.onclick = function () { map(b.dataset.w); }; });
  }
  function hearts(n) { var s = ''; for (var i = 0; i < 3; i++) s += '<i class="' + (i < n ? 'on' : '') + '">♥</i>'; return s; }
  function map(wid) {
    var w = WORLDS[wid], st = W(wid); current = wid;
    if (st.lives <= 0) { st.lives = 3; st.level = 0; save(); }
    var lv = w.levels;
    screen('<div class="rs-bar"><button type="button" class="btn btn-line rs-sm" id="rsHome">← Worlds</button><div class="rs-stat"><span>' + w.name + '</span><b>' + fmt(st.score) + ' pts</b><span class="rs-h">' + hearts(st.lives) + '</span></div></div>' +
      '<div class="rs-map"><img src="' + SC + w.img + '.webp" alt="' + w.name + '"><svg class="rs-path" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="' + lv.map(function (l) { return l.pin.join(','); }).join(' ') + '"/></svg>' +
      lv.map(function (l, i) {
        var state = st.best[l.id] != null ? 'done' : i === st.level ? 'next' : i < st.level ? 'done' : 'shut';
        return '<button type="button" class="rs-node ' + state + (l.boss ? ' boss' : '') + '" style="left:' + l.pin[0] + '%;top:' + l.pin[1] + '%" data-i="' + i + '"' + (i > st.level ? ' disabled' : '') + '><i>' + (l.boss ? '♛' : (wid === 'city' ? '1-' : '2-') + (i + 1)) + '</i><span>' + l.name + '</span></button>';
      }).join('') + '<div class="rs-mapsafe">' + safeHtml(st.rescued) + '</div></div>' +
      '<div class="rs-levels">' + lv.map(function (l, i) {
        var b = st.best[l.id];
        return '<button type="button" class="rs-lv' + (i > st.level ? ' shut' : '') + '" data-i="' + i + '"' + (i > st.level ? ' disabled' : '') + '><b>' + (l.boss ? 'BOSS' : 'LEVEL ' + (i + 1)) + '</b><span>' + l.name + '</span><small>' + l.where + ' · ' + l.style + '</small><em>' + (b != null ? 'Best ' + fmt(b) : i === st.level ? 'Play now' : 'Locked') + '</em></button>';
      }).join('') + '</div>');
    $('rsHome').onclick = intro;
    [].forEach.call(root.querySelectorAll('[data-i]'), function (b) { b.onclick = function () { level(wid, +b.dataset.i); }; });
  }
  function level(wid, i) {
    var w = WORLDS[wid], l = w.levels[i], st = W(wid);
    screen('<div class="rs-bar"><button type="button" class="btn btn-line rs-sm" id="rsMap">← Map</button><div class="rs-stat"><span>' + (l.boss ? 'BOSS' : 'Level ' + (i + 1)) + ' · ' + l.name + '</span><b id="rsScore">0</b><span class="rs-time" id="rsTime">55</span><span class="rs-h">' + hearts(st.lives) + '</span></div></div>' +
      '<div class="rs-stage"><canvas id="rsCv" width="960" height="540"></canvas><div class="rs-over" id="rsOver"><p class="eyebrow">' + l.where + ' · ' + l.style + '</p><h3>' + l.name + '</h3><p>' + l.how + '</p><button type="button" class="btn btn-red" id="rsGo">Start · 55 seconds</button></div>' +
      '<div class="rs-pad" id="rsPad"></div></div>');
    $('rsMap').onclick = function () { map(wid); };
    var bg = new Image(); bg.src = SC + l.img + '.webp';
    $('rsGo').onclick = function () {
      $('rsOver').style.display = 'none';
      stop = GAMES[l.id]($('rsCv'), bg, {
        score: function (n) { $('rsScore').textContent = fmt(n); },
        time: function (t) { $('rsTime').textContent = Math.ceil(t); $('rsTime').classList.toggle('low', t <= 10); },
        pad: $('rsPad')
      }, function (won, score, note) { stop = null; result(wid, i, won, score, note); });
    };
  }
  function result(wid, i, won, score, note) {
    var w = WORLDS[wid], l = w.levels[i], st = W(wid), got = 0;
    if (won) {
      var prev = st.best[l.id] || 0; st.best[l.id] = Math.max(prev, score); st.score += Math.max(0, score - prev);
      if (st.level === i) st.level = i + 1;
      got = earn('lair', Math.min(1000, score), 'Rescue Your Face · ' + l.name);
    } else { st.lives -= 1; }
    save();
    if (won && l.boss) return rescue(wid, score);
    var over = !won && st.lives <= 0;
    var o = $('rsOver'); o.style.display = '';
    o.innerHTML = won
      ? '<p class="eyebrow">Level ' + (i + 1) + ' cleared</p><h3>+' + fmt(score) + ' points</h3><p>' + (note || '') + (got ? ' · +' + fmt(got) + ' STARKS' : '') + '</p><p>Next: <b>' + w.levels[i + 1].name + '</b> (' + w.levels[i + 1].style + ')' + (w.levels[i + 1].boss ? ', the boss level.' : '') + '</p><div class="row" style="justify-content:center"><button type="button" class="btn btn-red" id="rsNext">Next level →</button><button type="button" class="btn btn-line" id="rsBack">Map</button></div>'
      : over
        ? '<p class="eyebrow">Game over</p><h3>No lives left</h3><p>' + (note || '') + '</p><p>Your face stays in the safe. Start the world again with 3 lives; your best scores are kept.</p><div class="row" style="justify-content:center"><button type="button" class="btn btn-red" id="rsAgain">Start the world again</button></div>'
        : '<p class="eyebrow">Life lost</p><h3>Not this time</h3><p>' + (note || '') + '</p><p>' + st.lives + (st.lives === 1 ? ' life' : ' lives') + ' left.</p><div class="row" style="justify-content:center"><button type="button" class="btn btn-red" id="rsAgain">Try again</button><button type="button" class="btn btn-line" id="rsBack">Map</button></div>';
    if ($('rsNext')) $('rsNext').onclick = function () { level(wid, i + 1); };
    if ($('rsBack')) $('rsBack').onclick = function () { map(wid); };
    if ($('rsAgain')) $('rsAgain').onclick = function () { if (over) { st.lives = 3; st.level = 0; save(); map(wid); } else level(wid, i); };
  }
  function rescue(wid, score) {
    var w = WORLDS[wid], st = W(wid), first = !st.rescued; st.rescued = true; save();
    if (first) earn('verdict', 750, 'Rescued my face · ' + w.name, 'rescue-' + wid);
    screen('<div class="rs-win"><p class="eyebrow">' + w.name + ' cleared</p><h2>The crown is the <em>key</em></h2><div class="rs-anim"><div class="rs-crown">♛</div>' + safeHtml(false) + '</div><p class="say" id="rsLine">The crown falls…</p><div id="rsAfter"></div></div>');
    var safe = root.querySelector('.rs-safe'), crown = root.querySelector('.rs-crown');
    setTimeout(function () { crown.classList.add('key'); crown.textContent = '🗝'; $('rsLine').textContent = '…and turns into the key.'; }, 1100);
    setTimeout(function () { crown.classList.add('in'); }, 2100);
    setTimeout(function () { safe.classList.add('open'); safe.querySelector('.rs-lock').textContent = 'OPEN'; $('rsLine').innerHTML = face() ? '<b>Your face is free.</b> Nobody copies it, nobody sells it. It is yours.' : '<b>The safe is open.</b> Add your photo to see your face come home.'; done(); }, 2900);
    function done() {
      var f = face();
      $('rsAfter').innerHTML = '<p class="big">' + fmt(st.score) + ' points</p><p class="say">' + (first ? '+750 STARKS for the rescue. ' : '') + 'Your face. Not his. Not theirs.</p>' +
        '<div class="row" style="justify-content:center">' + (f ? '<a class="btn btn-red" href="../create/?from=lairs">Make your poster with your face →</a>' : '<button type="button" class="btn btn-red" id="rsAdd">Add your photo</button>') +
        '<button type="button" class="btn btn-line" id="rsReplay">Play the world again</button><a class="btn btn-line" href="../inquilab/">Join the Inquilaab</a></div>' +
        (wid === 'city' && !W('lab').rescued ? '<p class="say rs-next"><button type="button" class="btn btn-line" id="rsOther">Now rescue it again in The AI Lab →</button></p>' : wid === 'lab' && !W('city').rescued ? '<p class="say rs-next"><button type="button" class="btn btn-line" id="rsOther">Play The Underground City →</button></p>' : '');
      $('rsReplay').onclick = function () { st.level = 0; st.lives = 3; save(); map(wid); };
      if ($('rsAdd')) $('rsAdd').onclick = intro;
      if ($('rsOther')) $('rsOther').onclick = function () { map(wid === 'city' ? 'lab' : 'city'); };
    }
  }

  /* ---------------- shared game loop ---------------- */
  function loop(cv, bg, ui, done, setup) {
    var ctx = cv.getContext('2d'), W_ = cv.width, H_ = cv.height, t0 = 0, last = 0, raf, over = false, score = 0;
    var keys = {}, G = { ctx: ctx, W: W_, H: H_, keys: keys, t: 0, left: SECS, add: function (n) { score = Math.max(0, score + n); ui.score(Math.round(score)); }, get score() { return score; } };
    function kd(e) { if (/Arrow|Space/.test(e.code)) e.preventDefault(); keys[e.code] = true; G.onkey && G.onkey(e.code); }
    function ku(e) { keys[e.code] = false; }
    addEventListener('keydown', kd); addEventListener('keyup', ku);
    function pt(e) { var r = cv.getBoundingClientRect(), p = e.touches ? e.touches[0] || e.changedTouches[0] : e; return { x: (p.clientX - r.left) * W_ / r.width, y: (p.clientY - r.top) * H_ / r.height }; }
    function on(ev, f) { cv.addEventListener(ev, function (e) { if (over) return; if (ev.indexOf('touch') === 0) e.preventDefault(); f(pt(e), e); }, { passive: false }); }
    G.on = on;
    G.end = function (won, note) { if (over) return; over = true; cancelAnimationFrame(raf); cleanup(); setTimeout(function () { done(won, Math.round(score), note); }, 450); };
    function cleanup() { removeEventListener('keydown', kd); removeEventListener('keyup', ku); if (ui.pad) ui.pad.innerHTML = ''; }
    G.bg = function (dim) { if (bg.complete && bg.naturalWidth) { var r = Math.max(W_ / bg.naturalWidth, H_ / bg.naturalHeight), w = bg.naturalWidth * r, h = bg.naturalHeight * r; ctx.drawImage(bg, (W_ - w) / 2, (H_ - h) / 2, w, h); } else { ctx.fillStyle = '#120808'; ctx.fillRect(0, 0, W_, H_); } ctx.fillStyle = 'rgba(5,3,3,' + (dim == null ? 0.55 : dim) + ')'; ctx.fillRect(0, 0, W_, H_); };
    G.text = function (s, x, y, size, col, align) { ctx.font = '700 ' + size + 'px Archivo, Arial, sans-serif'; ctx.fillStyle = col || '#fff'; ctx.textAlign = align || 'center'; ctx.fillText(s, x, y); };
    G.button = function (label, code) { var b = document.createElement('button'); b.type = 'button'; b.className = 'rs-key'; b.textContent = label; var press = function (e) { e.preventDefault(); keys[code] = true; G.onkey && G.onkey(code); }, rel = function () { keys[code] = false; }; b.addEventListener('pointerdown', press); b.addEventListener('pointerup', rel); b.addEventListener('pointerleave', rel); ui.pad.appendChild(b); return b; };
    var tick = setup(G);
    function frame(ts) {
      if (over) return;
      if (!t0) { t0 = ts; last = ts; }
      var dt = Math.min(0.05, (ts - last) / 1000); last = ts; G.t = (ts - t0) / 1000; G.left = Math.max(0, SECS - G.t); ui.time(G.left);
      tick(dt);
      if (!over && G.left <= 0) { G.timeup ? G.timeup() : G.end(false, 'Time ran out.'); }
      if (!over) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return function () { if (!over) { over = true; cancelAnimationFrame(raf); cleanup(); } };
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ---------------- the games ---------------- */
  var GAMES = {};
  /* 1-1 Shooting Gallery (Duck Hunt): cards fly up in arcs; shoot them, not the faces */
  GAMES.gallery = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, items = [], hits = 0, spawn = 0, flash = [], NEED = 15;
      G.on('pointerdown', function (p) {
        flash.push({ x: p.x, y: p.y, t: 0.25 });
        for (var k = items.length - 1; k >= 0; k--) { var it = items[k]; if (Math.abs(p.x - it.x) < it.w / 2 + 6 && Math.abs(p.y - it.y) < it.h / 2 + 6) {
          items.splice(k, 1);
          if (it.face) { G.add(-50); flash.push({ x: it.x, y: it.y, t: 0.6, txt: '−50 a fan!' }); }
          else { hits++; G.add(it.k ? 60 : 30); flash.push({ x: it.x, y: it.y, t: 0.5, txt: it.k ? '+60' : '+30' }); if (hits >= NEED) G.end(true, hits + ' cards shot'); }
          return; } }
        G.add(-5);
      });
      G.timeup = function () { G.end(hits >= NEED, hits + ' of ' + NEED + ' cards'); };
      var SUITS = ['♠', '♥', '♦', '♣'], R = ['A', 'K', 'Q', 'J', '10'];
      return function (dt) {
        spawn -= dt; var lvl = 1 + G.t / 25;
        if (spawn <= 0) { spawn = rnd(0.45, 0.9) / lvl; var face = Math.random() < 0.18, fromL = Math.random() < 0.5;
          items.push({ x: fromL ? -40 : G.W + 40, y: G.H + 40, vx: (fromL ? 1 : -1) * rnd(140, 260) * lvl, vy: -rnd(520, 700), w: 54, h: 76, face: face, k: !face && Math.random() < 0.25, s: SUITS[Math.floor(Math.random() * 4)], r: R[Math.floor(Math.random() * 5)], rot: rnd(-1, 1) }); }
        G.bg(0.45);
        items.forEach(function (it) { it.vy += 520 * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.rot += dt * 2; });
        items = items.filter(function (it) { return it.y < G.H + 120 && it.x > -120 && it.x < G.W + 120; });
        items.forEach(function (it) {
          ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot * 0.3);
          if (it.face) { ctx.fillStyle = '#d9d2c8'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(-10, -6, 4, 0, 7); ctx.arc(10, -6, 4, 0, 7); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 6, 10, 0.2, 2.9); ctx.stroke(); }
          else { ctx.fillStyle = it.k ? '#ffd34d' : '#f4efe9'; ctx.fillRect(-it.w / 2, -it.h / 2, it.w, it.h); ctx.strokeStyle = '#111'; ctx.strokeRect(-it.w / 2, -it.h / 2, it.w, it.h); ctx.fillStyle = it.s === '♥' || it.s === '♦' ? '#c3121a' : '#111'; ctx.font = '700 22px Arial'; ctx.textAlign = 'center'; ctx.fillText((it.k ? 'K' : it.r) + it.s, 0, 8); }
          ctx.restore();
        });
        flash.forEach(function (f) { f.t -= dt; ctx.strokeStyle = 'rgba(255,211,77,' + Math.max(0, f.t * 2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, 26 - f.t * 30, 0, 7); ctx.stroke(); if (f.txt) G.text(f.txt, f.x, f.y - 30, 26, f.txt[0] === '−' ? '#ff4a4f' : '#ffd34d'); });
        flash = flash.filter(function (f) { return f.t > 0; });
        G.text('Cards ' + hits + ' / ' + NEED, 20, 40, 26, '#fff', 'left'); G.text('Gold King = +60 · faces = −50', G.W - 20, 40, 18, '#ffd34d', 'right');
      };
    });
  };
  /* 1-2 Chip Breaker (Arkanoid) */
  GAMES.bricks = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, pw = 150, px = G.W / 2, balls = 3, ball = null, bricks = [], total, COLS = 12, ROWS = 6, bw = G.W / COLS, bh = 28;
      var colors = ['#c3121a', '#e3242b', '#ffd34d', '#f4efe9', '#1d5a2a', '#2f8a43'];
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) bricks.push({ x: c * bw + 4, y: 70 + r * (bh + 6), w: bw - 8, h: bh, col: colors[r], hp: r < 1 ? 2 : 1 });
      total = bricks.length;
      function serve() { ball = { x: px, y: G.H - 70, vx: rnd(-220, 220), vy: -420, stuck: true }; }
      serve();
      G.on('pointermove', function (p) { px = p.x; }); G.on('pointerdown', function (p) { px = p.x; if (ball.stuck) ball.stuck = false; });
      G.on('touchmove', function (p) { px = p.x; }); G.on('touchstart', function (p) { px = p.x; if (ball.stuck) ball.stuck = false; });
      G.onkey = function (k) { if (k === 'Space' || k === 'ArrowUp') ball.stuck = false; };
      function broken() { return total - bricks.length; }
      G.timeup = function () { var pct = broken() / total; G.end(pct >= 0.6, Math.round(pct * 100) + '% of the wall'); };
      return function (dt) {
        if (G.keys.ArrowLeft) px -= 620 * dt; if (G.keys.ArrowRight) px += 620 * dt;
        px = Math.max(pw / 2, Math.min(G.W - pw / 2, px));
        if (ball.stuck) { ball.x = px; ball.y = G.H - 70; }
        else {
          ball.x += ball.vx * dt; ball.y += ball.vy * dt;
          if (ball.x < 10 || ball.x > G.W - 10) { ball.vx *= -1; ball.x = Math.max(10, Math.min(G.W - 10, ball.x)); }
          if (ball.y < 10) { ball.vy = Math.abs(ball.vy); }
          if (ball.y > G.H - 58 && ball.y < G.H - 40 && Math.abs(ball.x - px) < pw / 2 + 10 && ball.vy > 0) { ball.vy = -Math.abs(ball.vy) * 1.02; ball.vx = (ball.x - px) / (pw / 2) * 380; }
          for (var k = 0; k < bricks.length; k++) { var b = bricks[k]; if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) { ball.vy *= -1; b.hp--; if (b.hp <= 0) { bricks.splice(k, 1); G.add(20); } else G.add(5); break; } }
          if (ball.y > G.H + 20) { balls--; if (balls <= 0) { G.end(broken() / total >= 0.6, 'Out of balls · ' + Math.round(broken() / total * 100) + '% of the wall'); return; } serve(); }
          if (broken() / total >= 0.6) { G.add(150 + Math.round(G.left) * 4); G.end(true, Math.round(broken() / total * 100) + '% of the wall with ' + Math.round(G.left) + 's left'); return; }
        }
        G.bg(0.6);
        bricks.forEach(function (b) { ctx.fillStyle = b.col; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(b.x, b.y + b.h - 6, b.w, 6); if (b.hp > 1) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(b.x + 3, b.y + 3, b.w - 6, b.h - 6); } });
        ctx.fillStyle = '#ffd34d'; ctx.fillRect(px - pw / 2, G.H - 50, pw, 14);
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ball.x, ball.y, 10, 0, 7); ctx.fill();
        G.text('Wall broken ' + Math.round(broken() / total * 100) + '% (need 60%)', 20, 40, 24, '#fff', 'left'); G.text('Balls ' + balls, G.W - 20, 40, 24, '#ffd34d', 'right');
        if (ball.stuck) G.text('Tap or press space to launch', G.W / 2, G.H - 100, 24, '#ffd34d');
      };
    });
  };
  /* 1-3 Knockout (Punch-Out): dodge the side he swings at, punch when he is open */
  GAMES.knockout = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, foe = 100, me = 100, phase = 'idle', side = 0, timer = 1.2, dodge = 0, dodgeT = 0, hitFx = 0, lean = 0;
      G.button('◀ Dodge', 'ArrowLeft'); G.button('PUNCH', 'Space'); G.button('Dodge ▶', 'ArrowRight');
      G.onkey = function (k) {
        if (k === 'ArrowLeft') { dodge = -1; dodgeT = 0.45; }
        if (k === 'ArrowRight') { dodge = 1; dodgeT = 0.45; }
        if (k === 'Space' || k === 'ArrowUp') {
          if (phase === 'open') { foe -= 12; G.add(40); hitFx = 0.25; if (foe <= 0) G.end(true, 'Knockout with ' + me + ' health left'); }
          else if (phase === 'idle') { foe -= 2; G.add(5); hitFx = 0.15; }
          else { me -= 6; }
        }
      };
      G.on('pointerdown', function (p) { G.onkey(p.x < G.W / 3 ? 'ArrowLeft' : p.x > G.W * 2 / 3 ? 'ArrowRight' : 'Space'); });
      G.timeup = function () { G.end(false, 'He is still standing (' + Math.max(0, foe) + ' health left).'); };
      return function (dt) {
        timer -= dt; dodgeT -= dt; if (dodgeT <= 0) dodge = 0; hitFx -= dt;
        var speed = 1 + G.t / 40;
        if (timer <= 0) {
          if (phase === 'idle') { phase = 'wind'; side = Math.random() < 0.5 ? -1 : 1; timer = 0.8 / speed; }
          else if (phase === 'wind') { phase = 'swing'; timer = 0.25; if (dodge !== -side) { me -= 15; hitFx = -0.3; } else G.add(15); }
          else if (phase === 'swing') { phase = 'open'; timer = 0.9 / speed; }
          else { phase = 'idle'; timer = rnd(0.6, 1.2) / speed; }
          if (me <= 0) { G.end(false, 'The brute knocked you down.'); return; }
        }
        lean += ((phase === 'wind' ? side * 30 : 0) - lean) * Math.min(1, dt * 10);
        G.bg(0.4);
        var cx = G.W / 2 + lean, cy = G.H / 2 + 20;
        ctx.fillStyle = phase === 'open' ? '#2f8a43' : '#1a0b0c'; ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.ellipse(cx, cy + 60, 120, 150, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(cx, cy - 120, 62, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = '#c3121a'; [-1, 1].forEach(function (s) { var up = phase === 'wind' && s === side; ctx.beginPath(); ctx.arc(cx + s * (up ? 190 : 140), cy + (up ? -130 : -10), 40, 0, 7); ctx.fill(); });
        if (phase === 'wind') G.text(side < 0 ? '◀ LEFT HOOK — dodge right ▶' : 'RIGHT HOOK ▶ — dodge left ◀', G.W / 2, 110, 32, '#ffd34d');
        if (phase === 'open') G.text('OPEN — PUNCH!', G.W / 2, 110, 40, '#7fd38a');
        if (hitFx > 0) { ctx.fillStyle = 'rgba(255,211,77,.25)'; ctx.fillRect(0, 0, G.W, G.H); }
        if (hitFx < 0) { ctx.fillStyle = 'rgba(227,36,43,.35)'; ctx.fillRect(0, 0, G.W, G.H); hitFx += dt; }
        function bar(x, v, lab, col) { ctx.fillStyle = '#2a1c1c'; ctx.fillRect(x, 20, 300, 18); ctx.fillStyle = col; ctx.fillRect(x, 20, 3 * Math.max(0, v), 18); G.text(lab, x, 62, 18, '#fff', 'left'); }
        bar(20, me, 'You', '#7fd38a'); bar(G.W - 320, foe, 'The brute', '#e3242b');
        if (dodge) G.text(dodge < 0 ? '◀ dodging' : 'dodging ▶', G.W / 2, G.H - 30, 22, '#fff');
      };
    });
  };
  /* 1-4 Deep Dive (dodger): crowns, ink and sharks */
  GAMES.dive = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, p = { x: G.W / 2, y: G.H - 90 }, tgt = null, items = [], spawn = 0, crowns = 0, hits = 0, inv = 0, NEED = 12;
      G.on('pointerdown', function (q) { tgt = q; }); G.on('pointermove', function (q, e) { if (e.buttons || e.pointerType === 'touch') tgt = q; }); G.on('touchmove', function (q) { tgt = q; });
      G.timeup = function () { G.end(crowns >= NEED, crowns + ' crowns'); };
      return function (dt) {
        var sp = 360; if (G.keys.ArrowLeft) p.x -= sp * dt; if (G.keys.ArrowRight) p.x += sp * dt; if (G.keys.ArrowUp) p.y -= sp * dt; if (G.keys.ArrowDown) p.y += sp * dt;
        if (tgt) { p.x += (tgt.x - p.x) * Math.min(1, dt * 6); p.y += (tgt.y - p.y) * Math.min(1, dt * 6); }
        p.x = Math.max(30, Math.min(G.W - 30, p.x)); p.y = Math.max(80, Math.min(G.H - 30, p.y));
        spawn -= dt; var lvl = 1 + G.t / 30;
        if (spawn <= 0) { spawn = rnd(0.35, 0.7) / lvl; var r = Math.random();
          if (r < 0.4) items.push({ k: 'crown', x: rnd(40, G.W - 40), y: -30, vy: rnd(120, 180) * lvl });
          else if (r < 0.8) items.push({ k: 'ink', x: rnd(40, G.W - 40), y: -30, vy: rnd(160, 240) * lvl });
          else { var L = Math.random() < 0.5; items.push({ k: 'shark', x: L ? -80 : G.W + 80, y: rnd(120, G.H - 60), vx: (L ? 1 : -1) * rnd(220, 320) * lvl }); } }
        items.forEach(function (it) { if (it.vy) it.y += it.vy * dt; if (it.vx) it.x += it.vx * dt; });
        inv -= dt;
        items = items.filter(function (it) {
          var d = Math.hypot(it.x - p.x, it.y - p.y);
          if (d < (it.k === 'shark' ? 50 : 34)) {
            if (it.k === 'crown') { crowns++; G.add(40); if (crowns >= NEED) G.end(true, crowns + ' crowns, ' + (3 - hits) + ' hits to spare'); return false; }
            if (inv <= 0) { hits++; inv = 1; G.add(-20); if (hits >= 3) { G.end(false, 'Three hits. You surfaced with ' + crowns + ' crowns.'); } return false; }
          }
          return it.y < G.H + 60 && it.x > -140 && it.x < G.W + 140;
        });
        G.bg(0.35); ctx.fillStyle = 'rgba(6,56,74,.35)'; ctx.fillRect(0, 0, G.W, G.H);
        items.forEach(function (it) {
          if (it.k === 'crown') G.text('♛', it.x, it.y + 12, 40, '#ffd34d');
          else if (it.k === 'ink') { ctx.fillStyle = '#c3121a'; ctx.beginPath(); ctx.arc(it.x, it.y, 20, 0, 7); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(it.x, it.y, 9, 0, 7); ctx.fill(); }
          else { ctx.fillStyle = '#7d8fa3'; ctx.beginPath(); ctx.ellipse(it.x, it.y, 60, 20, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(it.x, it.y - 18); ctx.lineTo(it.x - (it.vx > 0 ? 20 : -20), it.y - 46); ctx.lineTo(it.x + (it.vx > 0 ? 20 : -20), it.y - 18); ctx.fill(); }
        });
        ctx.globalAlpha = inv > 0 ? 0.5 + 0.5 * Math.sin(G.t * 30) : 1;
        ctx.fillStyle = '#f4efe9'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 18, 28, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(p.x, p.y - 30, 14, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        G.text('Crowns ' + crowns + ' / ' + NEED, 20, 40, 26, '#ffd34d', 'left'); G.text('Hits ' + hits + ' / 3', G.W - 20, 40, 24, '#ff4a4f', 'right');
      };
    });
  };
  /* 1-5 Tunnel Run (Subway Surfers): 3 lanes, jump, slide, coins */
  GAMES.runner = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, lane = 1, lx = 1, jump = 0, slide = 0, obs = [], spawn = 1, z = 0, coins = 0, sx = null, sy = null;
      G.button('◀', 'ArrowLeft'); G.button('Jump ▲', 'ArrowUp'); G.button('Slide ▼', 'ArrowDown'); G.button('▶', 'ArrowRight');
      G.onkey = function (k) { if (k === 'ArrowLeft') lane = Math.max(0, lane - 1); if (k === 'ArrowRight') lane = Math.min(2, lane + 1); if (k === 'ArrowUp' && jump <= 0 && slide <= 0) jump = 0.7; if (k === 'ArrowDown' && jump <= 0) slide = 0.7; };
      G.on('touchstart', function (p) { sx = p.x; sy = p.y; }); G.on('touchend', function (p) { if (sx == null) return; var dx = p.x - sx, dy = p.y - sy; if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) G.onkey(dx < 0 ? 'ArrowLeft' : 'ArrowRight'); else if (Math.abs(dy) > 30) G.onkey(dy < 0 ? 'ArrowUp' : 'ArrowDown'); sx = null; });
      G.on('pointerdown', function (p, e) { if (e.pointerType === 'mouse') G.onkey(p.x < G.W / 3 ? 'ArrowLeft' : p.x > G.W * 2 / 3 ? 'ArrowRight' : p.y < G.H / 2 ? 'ArrowUp' : 'ArrowDown'); });
      G.timeup = function () { G.add(300); G.end(true, 'You ran the tunnels · ' + coins + ' coins'); };
      var HY = 150; // horizon
      function proj(laneX, d) { var s = 1 - d; var y = HY + (G.H - HY) * s * s; var spread = 40 + 300 * s * s; return { x: G.W / 2 + (laneX - 1) * spread, y: y, s: 0.12 + 0.88 * s * s }; }
      return function (dt) {
        var speed = 0.55 + G.t / 90; z += dt * speed;
        lx += (lane - lx) * Math.min(1, dt * 14); jump -= dt; slide -= dt;
        spawn -= dt * speed;
        if (spawn <= 0) { spawn = rnd(0.55, 0.95); var kind = ['block', 'bar', 'train', 'coin', 'coin'][Math.floor(Math.random() * 5)];
          obs.push({ lane: Math.floor(Math.random() * 3), d: 1, k: kind }); if (kind === 'train' && Math.random() < 0.5) obs.push({ lane: (Math.floor(Math.random() * 3)), d: 1.05, k: 'coin' }); }
        obs.forEach(function (o) { o.d -= dt * speed; });
        var air = jump > 0, low = slide > 0;
        obs = obs.filter(function (o) {
          if (o.d < 0.06 && o.d > -0.02 && o.lane === lane && !o.hit) {
            o.hit = true;
            if (o.k === 'coin') { coins++; G.add(15); return false; }
            if (o.k === 'block' && air) { G.add(10); return true; }
            if (o.k === 'bar' && low) { G.add(10); return true; }
            G.end(false, (o.k === 'train' ? 'You hit a train' : o.k === 'bar' ? 'Slide under the bars next time' : 'Jump the barriers next time') + ' · ' + coins + ' coins'); return true;
          }
          return o.d > -0.1;
        });
        G.add(dt * 6);
        G.bg(0.55);
        ctx.fillStyle = 'rgba(20,10,10,.85)'; ctx.beginPath(); var a = proj(-0.5, 1), b = proj(2.5, 1), c = proj(2.5, 0), d0 = proj(-0.5, 0); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x + 200, G.H); ctx.lineTo(d0.x - 200, G.H); ctx.fill();
        ctx.strokeStyle = 'rgba(255,211,77,.35)'; ctx.lineWidth = 2; [0.5, 1.5].forEach(function (L) { var p1 = proj(L, 1), p2 = proj(L, 0); ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x + (L - 1) * 200, G.H); ctx.stroke(); });
        for (var k = 0; k < 8; k++) { var dd = ((k / 8) - z % (1 / 8) * 8 / 8 + 1) % 1; var pp = proj(1, dd); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, pp.y, G.W, 2 * pp.s); }
        obs.slice().sort(function (x, y) { return y.d - x.d; }).forEach(function (o) {
          if (o.d < -0.05) return; var q = proj(o.lane, Math.max(0, o.d)), w = 130 * q.s, h;
          if (o.k === 'coin') { ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(q.x, q.y - 40 * q.s, 18 * q.s, 0, 7); ctx.fill(); return; }
          if (o.k === 'block') { h = 60 * q.s; ctx.fillStyle = '#e3242b'; ctx.fillRect(q.x - w / 2, q.y - h, w, h); ctx.fillStyle = '#fff'; ctx.fillRect(q.x - w / 2, q.y - h * 0.6, w, h * 0.15); }
          if (o.k === 'bar') { h = 150 * q.s; ctx.fillStyle = '#ffd34d'; ctx.fillRect(q.x - w / 2, q.y - h, w, 16 * q.s); ctx.fillRect(q.x - w / 2, q.y - h, 8 * q.s, h); ctx.fillRect(q.x + w / 2 - 8 * q.s, q.y - h, 8 * q.s, h); }
          if (o.k === 'train') { h = 210 * q.s; ctx.fillStyle = '#3a3f4a'; ctx.fillRect(q.x - w / 2, q.y - h, w, h); ctx.fillStyle = '#ffd34d'; ctx.fillRect(q.x - w / 2 + 8 * q.s, q.y - h + 14 * q.s, w - 16 * q.s, 40 * q.s); }
        });
        var me = proj(lx, 0.02), jy = air ? Math.sin(Math.max(0, jump) / 0.7 * Math.PI) * 110 : 0, hh = low ? 50 : 100;
        ctx.fillStyle = '#f4efe9'; ctx.fillRect(me.x - 22, me.y - hh - jy - 10, 44, hh); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(me.x, me.y - hh - jy - 26, 18, 0, 7); ctx.fill();
        G.text('Coins ' + coins, 20, 40, 26, '#ffd34d', 'left'); G.text('Survive ' + Math.ceil(G.left) + 's', G.W - 20, 40, 24, '#fff', 'right');
      };
    });
  };
  /* 1-6 Shoot the Crown (bow and arrow boss) */
  GAMES.archery = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, bow = { x: G.W / 2, y: G.H - 40 }, aim = null, arrows = 7, flying = [], wind = rnd(-60, 60), hitAt = null, guardX = 0;
      var crown = function () { var a = Math.sin(G.t * 1.3) * 0.75; return { x: G.W / 2 + Math.sin(a) * 260, y: 60 + Math.cos(a) * 140, a: a }; };
      function fire(p) { if (arrows <= 0 || hitAt) return; var dx = bow.x - p.x, dy = bow.y - p.y, pw = Math.min(1, Math.hypot(dx, dy) / 220); if (pw < 0.15) return; arrows--; var ang = Math.atan2(dy, dx); flying.push({ x: bow.x, y: bow.y, vx: Math.cos(ang) * 1150 * pw, vy: Math.sin(ang) * 1150 * pw }); }
      G.on('pointerdown', function (p) { aim = p; }); G.on('pointermove', function (p) { if (aim) aim = p; }); G.on('pointerup', function (p) { if (aim) { fire(aim); aim = null; } });
      G.on('touchstart', function (p) { aim = p; }); G.on('touchmove', function (p) { aim = p; }); G.on('touchend', function () { if (aim) { fire(aim); aim = null; } });
      G.timeup = function () { G.end(false, 'Time ran out. The crown still swings.'); };
      return function (dt) {
        var c = crown(); guardX = G.W / 2 + Math.sin(G.t * 2.1 + 1) * 300;
        flying.forEach(function (f) { f.vy += 600 * dt; f.vx += wind * dt; f.x += f.vx * dt; f.y += f.vy * dt;
          if (!f.done && Math.abs(f.x - guardX) < 70 && Math.abs(f.y - 300) < 14) { f.done = true; f.vx = -f.vx * 0.3; f.vy = 200; }
          if (!f.done && Math.hypot(f.x - c.x, f.y - c.y) < 40) { f.done = true; hitAt = G.t; G.add(500 + arrows * 80 + Math.round(G.left) * 5); }
        });
        flying = flying.filter(function (f) { return f.y < G.H + 40 && f.x > -60 && f.x < G.W + 60 && !f.done; });
        if (hitAt && G.t - hitAt > 0.6) { G.end(true, 'Crown down with ' + arrows + ' arrows to spare'); return; }
        if (arrows <= 0 && !flying.length && !hitAt) { G.end(false, 'Out of arrows.'); return; }
        G.bg(0.5);
        ctx.strokeStyle = '#999'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(G.W / 2, 0); ctx.lineTo(c.x, c.y - 30); ctx.stroke();
        G.text('♛', c.x, c.y + 20, 72, hitAt ? '#fff' : '#ffd34d');
        ctx.fillStyle = '#7d8fa3'; ctx.fillRect(guardX - 70, 294, 140, 12); G.text('guard', guardX, 288, 14, '#bbb');
        ctx.strokeStyle = '#c99a16'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bow.x, bow.y, 60, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        if (aim) { var dx = bow.x - aim.x, dy = bow.y - aim.y, ang = Math.atan2(dy, dx), pw = Math.min(1, Math.hypot(dx, dy) / 220);
          ctx.strokeStyle = 'rgba(255,211,77,.7)'; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(bow.x, bow.y); ctx.lineTo(bow.x + Math.cos(ang) * 260 * pw, bow.y + Math.sin(ang) * 260 * pw); ctx.stroke(); ctx.setLineDash([]); }
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; flying.forEach(function (f) { var a = Math.atan2(f.vy, f.vx); ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x - Math.cos(a) * 36, f.y - Math.sin(a) * 36); ctx.stroke(); });
        G.text('Arrows ' + arrows, 20, 40, 26, '#fff', 'left'); G.text('Wind ' + (wind < 0 ? '◀ ' : '') + Math.abs(Math.round(wind / 10)) + (wind >= 0 ? ' ▶' : ''), G.W - 20, 40, 24, '#ffd34d', 'right');
        if (!flying.length && !aim && arrows === 7) G.text('Drag back from the bow, let go to shoot', G.W / 2, G.H - 120, 24, '#ffd34d');
      };
    });
  };

  /* 2-1 Searchlights (stealth): hold to creep, freeze in the light */
  GAMES.stealth = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, x = 60, hold = false, spotted = 0, cool = 0, beams = [{ x: 300, v: 160 }, { x: 700, v: -120 }];
      G.button('Hold to creep ▶', 'Space');
      G.on('pointerdown', function () { hold = true; }); G.on('pointerup', function () { hold = false; }); G.on('touchstart', function () { hold = true; }); G.on('touchend', function () { hold = false; });
      G.timeup = function () { G.end(false, 'Day broke before you reached the dome.'); };
      return function (dt) {
        var moving = hold || G.keys.Space || G.keys.ArrowRight;
        if (moving) { x += 95 * dt; G.add(dt * 4); }
        var lvl = 1 + G.t / 30; if (G.t > 18 && beams.length < 3) beams.push({ x: 100, v: 210 });
        beams.forEach(function (b) { b.x += b.v * lvl * dt; if (b.x < 40 || b.x > G.W - 40) b.v *= -1; });
        cool -= dt;
        var lit = beams.some(function (b) { return Math.abs(b.x - x) < 55; });
        if (lit && moving && cool <= 0) { spotted++; cool = 1.2; x = Math.max(60, x - 140); if (spotted >= 3) { G.end(false, 'The alarm went off.'); return; } }
        if (x >= G.W - 90) { G.add(200 + Math.round(G.left) * 6 + (3 - spotted) * 60); G.end(true, 'You reached the dome, spotted ' + spotted + (spotted === 1 ? ' time' : ' times')); return; }
        G.bg(0.35);
        ctx.fillStyle = 'rgba(220,235,250,.25)'; ctx.fillRect(0, G.H - 120, G.W, 120);
        beams.forEach(function (b) { var gr = ctx.createLinearGradient(0, 0, 0, G.H); gr.addColorStop(0, 'rgba(255,255,210,.0)'); gr.addColorStop(1, 'rgba(255,255,210,.45)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(b.x - 10, 0); ctx.lineTo(b.x + 10, 0); ctx.lineTo(b.x + 60, G.H); ctx.lineTo(b.x - 60, G.H); ctx.fill(); });
        G.text('⛫', G.W - 50, G.H - 70, 64, '#bfe3ff');
        ctx.fillStyle = cool > 0 ? '#ff4a4f' : '#111'; ctx.fillRect(x - 12, G.H - 110, 24, 46); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(x, G.H - 122, 13, 0, 7); ctx.fill();
        ctx.fillStyle = '#2a1c1c'; ctx.fillRect(20, 60, G.W - 40, 8); ctx.fillStyle = '#ffd34d'; ctx.fillRect(20, 60, (G.W - 40) * Math.min(1, (x - 60) / (G.W - 150)), 8);
        G.text('Spotted ' + spotted + ' / 3', 20, 40, 24, '#ff4a4f', 'left'); G.text(moving ? 'creeping…' : 'frozen', G.W - 20, 40, 22, moving ? '#ffd34d' : '#bfe3ff', 'right');
        if (lit && moving) G.text('IN THE LIGHT — LET GO!', G.W / 2, 120, 34, '#ff4a4f');
      };
    });
  };
  /* 2-2 Drone Attack (Space Invaders) */
  GAMES.invaders = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, px = G.W / 2, shots = [], lasers = [], drones = [], dir = 1, fire = 0, shield = 3, inv = 0, killed = 0, NEED = 30;
      for (var r = 0; r < 3; r++) for (var c = 0; c < 10; c++) drones.push({ x: 120 + c * 72, y: 90 + r * 56 });
      G.on('pointermove', function (p) { px = p.x; }); G.on('pointerdown', function (p) { px = p.x; }); G.on('touchmove', function (p) { px = p.x; });
      G.timeup = function () { G.end(false, killed + ' of ' + NEED + ' drones down.'); };
      return function (dt) {
        if (G.keys.ArrowLeft) px -= 520 * dt; if (G.keys.ArrowRight) px += 520 * dt; px = Math.max(30, Math.min(G.W - 30, px));
        fire -= dt; if (fire <= 0) { fire = 0.32; shots.push({ x: px, y: G.H - 60 }); }
        var spd = (40 + (NEED - drones.length) * 4) * dt, edge = false;
        drones.forEach(function (d) { d.x += dir * spd; if (d.x < 30 || d.x > G.W - 30) edge = true; });
        if (edge) { dir *= -1; drones.forEach(function (d) { d.y += 22; }); }
        if (drones.some(function (d) { return d.y > G.H - 90; })) { G.end(false, 'The drones reached the lab floor.'); return; }
        if (Math.random() < dt * (0.9 + G.t / 30) && drones.length) { var s = drones[Math.floor(Math.random() * drones.length)]; lasers.push({ x: s.x, y: s.y + 14 }); }
        shots.forEach(function (s) { s.y -= 700 * dt; }); lasers.forEach(function (l) { l.y += 300 * dt; });
        shots = shots.filter(function (s) {
          for (var k = 0; k < drones.length; k++) { var d = drones[k]; if (Math.abs(s.x - d.x) < 24 && Math.abs(s.y - d.y) < 18) { drones.splice(k, 1); killed++; G.add(25); if (!drones.length) { G.add(Math.round(G.left) * 6 + shield * 60); G.end(true, 'All 30 drones down with ' + shield + ' shields'); } return false; } }
          return s.y > -10;
        });
        inv -= dt;
        lasers = lasers.filter(function (l) { if (inv <= 0 && Math.abs(l.x - px) < 26 && l.y > G.H - 70 && l.y < G.H - 30) { shield--; inv = 1; if (shield <= 0) G.end(false, 'Shields gone. ' + killed + ' drones down.'); return false; } return l.y < G.H + 10; });
        G.bg(0.5);
        drones.forEach(function (d) { ctx.fillStyle = '#7fd3ff'; ctx.beginPath(); ctx.ellipse(d.x, d.y, 22, 10, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#e3242b'; ctx.beginPath(); ctx.arc(d.x, d.y + 2, 6, 0, 7); ctx.fill(); ctx.strokeStyle = '#7fd3ff'; ctx.beginPath(); ctx.moveTo(d.x - 26, d.y - 8); ctx.lineTo(d.x - 14, d.y - 2); ctx.moveTo(d.x + 26, d.y - 8); ctx.lineTo(d.x + 14, d.y - 2); ctx.stroke(); });
        ctx.fillStyle = '#ffd34d'; shots.forEach(function (s) { ctx.fillRect(s.x - 2, s.y - 10, 4, 14); });
        ctx.fillStyle = '#ff4a4f'; lasers.forEach(function (l) { ctx.fillRect(l.x - 2, l.y - 8, 4, 16); });
        ctx.globalAlpha = inv > 0 ? 0.5 + 0.5 * Math.sin(G.t * 30) : 1; ctx.fillStyle = '#f4efe9'; ctx.beginPath(); ctx.moveTo(px, G.H - 74); ctx.lineTo(px + 26, G.H - 34); ctx.lineTo(px - 26, G.H - 34); ctx.fill(); ctx.globalAlpha = 1;
        G.text('Drones ' + killed + ' / ' + NEED, 20, 40, 24, '#fff', 'left'); G.text('Shields ' + shield, G.W - 20, 40, 24, '#7fd3ff', 'right');
      };
    });
  };
  /* 2-3 Fake Slicer (Fruit Ninja) */
  GAMES.slicer = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, items = [], halves = [], trail = [], spawn = 0.5, cut = 0, down = false, NEED = 30, last = null;
      function slice(p) {
        if (last) { trail.push({ a: last, b: p, t: 0.2 });
          items.forEach(function (it) { if (it.dead) return; var mx = (last.x + p.x) / 2, my = (last.y + p.y) / 2; if (Math.hypot(it.x - p.x, it.y - p.y) < 40 || Math.hypot(it.x - mx, it.y - my) < 40) { it.dead = true;
            if (it.real) { G.add(-100); G.end(false, 'You sliced a real fan. Only fakes!'); return; }
            cut++; G.add(30); halves.push({ x: it.x - 10, y: it.y, vx: -120, vy: -80, r: 0 }, { x: it.x + 10, y: it.y, vx: 120, vy: -80, r: 0 }); if (cut >= NEED) { G.add(Math.round(G.left) * 6); G.end(true, cut + ' fakes sliced'); } } }); }
        last = p;
      }
      G.on('pointerdown', function (p) { down = true; last = p; }); G.on('pointermove', function (p) { if (down) slice(p); }); G.on('pointerup', function () { down = false; last = null; });
      G.on('touchstart', function (p) { down = true; last = p; }); G.on('touchmove', function (p) { slice(p); }); G.on('touchend', function () { down = false; last = null; });
      G.timeup = function () { G.end(cut >= NEED, cut + ' of ' + NEED + ' fakes'); };
      return function (dt) {
        spawn -= dt; var lvl = 1 + G.t / 30;
        if (spawn <= 0) { spawn = rnd(0.35, 0.7) / lvl; var n = Math.random() < 0.3 ? 2 : 1; for (var k = 0; k < n; k++) items.push({ x: rnd(120, G.W - 120), y: G.H + 40, vx: rnd(-160, 160), vy: -rnd(620, 760), real: Math.random() < 0.15 }); }
        items.forEach(function (it) { it.vy += 600 * dt; it.x += it.vx * dt; it.y += it.vy * dt; });
        items = items.filter(function (it) { return !it.dead && it.y < G.H + 80; });
        halves.forEach(function (h) { h.vy += 900 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.r += dt * 6; }); halves = halves.filter(function (h) { return h.y < G.H + 60; });
        G.bg(0.45);
        items.forEach(function (it) { ctx.fillStyle = it.real ? '#ffd34d' : '#cfd6df'; ctx.beginPath(); ctx.arc(it.x, it.y, 32, 0, 7); ctx.fill(); ctx.fillStyle = it.real ? '#6b4f06' : '#4a5560'; ctx.beginPath(); ctx.arc(it.x - 11, it.y - 6, 5, 0, 7); ctx.arc(it.x + 11, it.y - 6, 5, 0, 7); ctx.fill(); if (!it.real) { ctx.strokeStyle = '#4a5560'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(it.x - 30, it.y - 14); ctx.lineTo(it.x + 30, it.y - 14); ctx.stroke(); G.text('FAKE', it.x, it.y + 20, 12, '#4a5560'); } else G.text('FAN', it.x, it.y + 20, 12, '#6b4f06'); });
        halves.forEach(function (h) { ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.r); ctx.fillStyle = '#cfd6df'; ctx.beginPath(); ctx.arc(0, 0, 30, -1.4, 1.4); ctx.fill(); ctx.restore(); });
        trail.forEach(function (s) { s.t -= dt; ctx.strokeStyle = 'rgba(255,255,255,' + Math.max(0, s.t * 4) + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(s.a.x, s.a.y); ctx.lineTo(s.b.x, s.b.y); ctx.stroke(); }); trail = trail.filter(function (s) { return s.t > 0; });
        G.text('Fakes ' + cut + ' / ' + NEED, 20, 40, 24, '#fff', 'left'); G.text('Never slice the gold FANS', G.W - 20, 40, 20, '#ffd34d', 'right');
      };
    });
  };
  /* 2-4 Hive Chase (Pac-Man) */
  GAMES.maze = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, M = ['###############', '#.............#', '#.##.#.#.#.##.#', '#.#..#...#..#.#', '#.#.##.#.##.#.#', '#.....#.#.....#', '###.#.....#.###', '#...#.###.#...#', '#.#.........#.#', '#.#.##.#.##.#.#', '#.............#', '###############'];
      var C = 15, R = 12, cs = Math.min(G.W / C, G.H / R), ox = (G.W - C * cs) / 2, oy = (G.H - R * cs) / 2, dots = 0, eaten = 0, sx, sy, sw = null;
      var grid = M.map(function (row) { return row.split(''); }); grid.forEach(function (row) { row.forEach(function (c) { if (c === '.') dots++; }); });
      var me = { x: 7, y: 8, dx: 0, dy: 0, nx: -1, ny: 0, p: 0 }, guards = [{ x: 1, y: 1, dx: 1, dy: 0, p: 0 }, { x: 13, y: 1, dx: -1, dy: 0, p: 0 }, { x: 13, y: 10, dx: -1, dy: 0, p: 0 }];
      grid[8][7] = ' '; dots--;
      function free(x, y) { return grid[y] && grid[y][x] && grid[y][x] !== '#'; }
      G.onkey = function (k) { if (k === 'ArrowLeft') { me.nx = -1; me.ny = 0; } if (k === 'ArrowRight') { me.nx = 1; me.ny = 0; } if (k === 'ArrowUp') { me.nx = 0; me.ny = -1; } if (k === 'ArrowDown') { me.nx = 0; me.ny = 1; } };
      G.button('◀', 'ArrowLeft'); G.button('▲', 'ArrowUp'); G.button('▼', 'ArrowDown'); G.button('▶', 'ArrowRight');
      G.on('touchstart', function (p) { sx = p.x; sy = p.y; }); G.on('touchend', function (p) { if (sx == null) return; var dx = p.x - sx, dy = p.y - sy; if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) G.onkey(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'ArrowLeft' : 'ArrowRight') : (dy < 0 ? 'ArrowUp' : 'ArrowDown')); sx = null; });
      G.timeup = function () { var pct = eaten / dots; G.end(pct >= 0.8, Math.round(pct * 100) + '% of the pods freed'); };
      function step(o, spd, dt, think) {
        o.p += spd * dt;
        while (o.p >= 1) { o.p -= 1; o.x += o.dx; o.y += o.dy; think(o); if (!free(o.x + o.dx, o.y + o.dy)) { o.dx = 0; o.dy = 0; } }
        if (o.dx === 0 && o.dy === 0) { o.p = 0; think(o); }
      }
      return function (dt) {
        step(me, 6.5, dt, function (o) { if ((o.nx || o.ny) && free(o.x + o.nx, o.y + o.ny)) { o.dx = o.nx; o.dy = o.ny; } if (grid[o.y][o.x] === '.') { grid[o.y][o.x] = ' '; eaten++; G.add(10); if (eaten / dots >= 0.8 && !o.won) { o.won = true; G.add(Math.round(G.left) * 6); G.end(true, Math.round(eaten / dots * 100) + '% of the pods freed'); } } });
        if (G.t > 2.5) guards.forEach(function (g) { step(g, 3.4 + G.t / 25, dt, function (o) { var opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(function (d) { return free(o.x + d[0], o.y + d[1]) && !(d[0] === -o.dx && d[1] === -o.dy); }); if (!opts.length) opts = [[-o.dx, -o.dy]]; opts.sort(function (a, b) { return (Math.hypot(o.x + a[0] - me.x, o.y + a[1] - me.y) - Math.hypot(o.x + b[0] - me.x, o.y + b[1] - me.y)) + rnd(-2.5, 2.5); }); o.dx = opts[0][0]; o.dy = opts[0][1]; }); });
        function pos(o) { return { x: ox + (o.x + o.dx * o.p + 0.5) * cs, y: oy + (o.y + o.dy * o.p + 0.5) * cs }; }
        var mp = pos(me);
        if (guards.some(function (g) { var gp = pos(g); return Math.hypot(gp.x - mp.x, gp.y - mp.y) < cs * 0.7; })) { G.end(eaten / dots >= 0.8, 'A guard caught you · ' + Math.round(eaten / dots * 100) + '% freed'); return; }
        G.bg(0.6);
        grid.forEach(function (row, y) { row.forEach(function (c, x) { if (c === '#') { ctx.fillStyle = 'rgba(30,40,70,.85)'; ctx.fillRect(ox + x * cs + 2, oy + y * cs + 2, cs - 4, cs - 4); } else if (c === '.') { ctx.fillStyle = '#bfe3ff'; ctx.beginPath(); ctx.ellipse(ox + (x + 0.5) * cs, oy + (y + 0.5) * cs, cs * 0.12, cs * 0.18, 0, 0, 7); ctx.fill(); } }); });
        ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(mp.x, mp.y, cs * 0.36, 0.3, Math.PI * 2 - 0.3); ctx.lineTo(mp.x, mp.y); ctx.fill();
        guards.forEach(function (g) { var gp = pos(g); ctx.fillStyle = '#e3242b'; ctx.beginPath(); ctx.arc(gp.x, gp.y - 2, cs * 0.34, Math.PI, 0); ctx.lineTo(gp.x + cs * 0.34, gp.y + cs * 0.32); ctx.lineTo(gp.x - cs * 0.34, gp.y + cs * 0.32); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(gp.x - 9, gp.y - 6, 6, 6); ctx.fillRect(gp.x + 3, gp.y - 6, 6, 6); });
        if (G.t < 2.5) G.text('Guards wake in ' + Math.ceil(2.5 - G.t) + '…', G.W / 2, G.H / 2, 34, '#ffd34d'); G.text('Pods freed ' + Math.round(eaten / dots * 100) + '% (need 80%)', 20, 30, 20, '#fff', 'left');
      };
    });
  };
  /* 2-5 Tower Flight (Flappy Bird) */
  GAMES.flyer = function (cv, bg, ui, done) {
    return loop(cv, bg, ui, done, function (G) {
      var ctx = G.ctx, y = G.H / 2, vy = 0, towers = [], spawn = 0.4, passed = 0, NEED = 15, started = false;
      function flap() { started = true; vy = -330; }
      G.onkey = function (k) { if (k === 'Space' || k === 'ArrowUp') flap(); };
      G.on('pointerdown', flap);
      G.timeup = function () { G.end(passed >= NEED, passed + ' towers'); };
      return function (dt) {
        if (started) { vy += 900 * dt; y += vy * dt; }
        var sp = 230 + G.t * 2;
        spawn -= dt; if (spawn <= 0 && started) { spawn = 1.55; var gap = Math.max(150, 200 - G.t); towers.push({ x: G.W + 40, gy: rnd(130, G.H - 130), gap: gap }); }
        towers.forEach(function (t) { t.x -= sp * dt; if (!t.passed && t.x < 150) { t.passed = true; passed++; G.add(40); if (passed >= NEED) { G.add(Math.round(G.left) * 6); G.end(true, passed + ' towers passed'); } } });
        towers = towers.filter(function (t) { return t.x > -100; });
        if (y > G.H - 20 || y < 10) { G.end(false, 'Crashed after ' + passed + ' towers.'); return; }
        for (var k = 0; k < towers.length; k++) { var t = towers[k]; if (Math.abs(t.x - 180) < 50 && (y < t.gy - t.gap / 2 + 14 || y > t.gy + t.gap / 2 - 14)) { G.end(false, 'Hit a tower after ' + passed + '.'); return; } }
        G.bg(0.4);
        towers.forEach(function (t) { ctx.fillStyle = '#3a3f4a'; ctx.fillRect(t.x - 40, 0, 80, t.gy - t.gap / 2); ctx.fillRect(t.x - 40, t.gy + t.gap / 2, 80, G.H); ctx.fillStyle = '#e3242b'; ctx.fillRect(t.x - 46, t.gy - t.gap / 2 - 14, 92, 14); ctx.fillRect(t.x - 46, t.gy + t.gap / 2, 92, 14); ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.arc(t.x, t.gy + t.gap / 2 + 30, 5, 0, 7); ctx.fill(); });
        ctx.save(); ctx.translate(180, y); ctx.rotate(Math.max(-0.4, Math.min(0.6, vy / 700)));
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 14, 0, 0, 7); ctx.fill(); ctx.fillRect(-48, -4, 22, 6); ctx.fillStyle = '#7fd3ff'; ctx.fillRect(4, -10, 16, 8); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, -20); ctx.lineTo(34, -20); ctx.stroke(); ctx.restore();
        G.text('Towers ' + passed + ' / ' + NEED, 20, 40, 24, '#fff', 'left');
        if (!started) G.text('Tap or press space to fly', G.W / 2, G.H / 2 + 80, 28, '#ffd34d');
      };
    });
  };

  window.KingsRescue = { _rescue: function (w) { rescue(w || 'city', 0); }, start: function (el) { root = el; var q = new URLSearchParams(location.search).get('world'); if (q && WORLDS[q] && WORLDS[q].open) map(q); else intro(); } };
})();
