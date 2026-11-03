/* BAAHEIN KHOL (owner, 3 Nov 2026): copy one of SRK's poses, score 90+ to collect the card.
   Pose reading runs on the fan's device (MoveNet in the browser); no photo or video is uploaded. */
(function () {
  var KEY = 'amkh-pose', GOAL = 90;
  var LV = { e: 'Easy', m: 'Medium', h: 'Hard', l: 'Legendary' };
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} }

  // ---- pose features: arm angles in the shoulder frame, so camera tilt, size and distance do not matter
  var L = { sh: 5, el: 7, wr: 9 }, R = { sh: 6, el: 8, wr: 10 }, MIN = 0.25;
  function feats(kp) {
    var ok = function (i) { return kp[i] && kp[i][2] >= MIN; };
    if (!ok(5) || !ok(6)) return null;
    var ls = kp[5], rs = kp[6], mx = (ls[0] + rs[0]) / 2, my = (ls[1] + rs[1]) / 2;
    var th = Math.atan2(ls[1] - rs[1], ls[0] - rs[0]), sw = Math.hypot(ls[0] - rs[0], ls[1] - rs[1]) || 1;
    var rot = function (p) { var x = p[0] - mx, y = p[1] - my, c = Math.cos(-th), s = Math.sin(-th); return [(x * c - y * s) / sw, (x * s + y * c) / sw]; };
    var ang = function (a, b) { var A = rot(kp[a]), B = rot(kp[b]); return Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI; };
    var f = {};
    f.uaL = ok(7) ? ang(5, 7) : null; f.faL = ok(7) && ok(9) ? ang(7, 9) : null;
    f.uaR = ok(8) ? ang(6, 8) : null; f.faR = ok(8) && ok(10) ? ang(8, 10) : null;
    if (ok(0)) { var n = rot(kp[0]); f.hx = n[0] * 60; f.hy = n[1] * 60; } else { f.hx = f.hy = null; }
    return f;
  }
  // mirror: swap sides and reflect across the vertical axis
  function mirror(f) {
    var m = function (a) { return a == null ? null : (a >= 0 ? 180 - a : -180 - a); };
    return { uaL: m(f.uaR), faL: m(f.faR), uaR: m(f.uaL), faR: m(f.faL), hx: f.hx == null ? null : -f.hx, hy: f.hy };
  }
  var W = { uaL: 1, uaR: 1, faL: 0.8, faR: 0.8, hx: 0.3, hy: 0.3 };
  function diff(a, b) { var d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return d; }
  function compare(t, u) {
    var sum = 0, wt = 0, worst = null;
    Object.keys(W).forEach(function (k) {
      if (t[k] == null) return;
      wt += W[k];
      if (u[k] == null) { if (!worst || 1 > worst.loss) worst = { k: k, d: null, loss: 1 }; return; }
      var d = (k === 'hx' || k === 'hy') ? (u[k] - t[k]) : diff(u[k], t[k]);
      var s = Math.max(0, 1 - Math.pow(Math.abs(d) / 50, 1.3));
      sum += W[k] * s;
      var loss = W[k] * (1 - s); if (!worst || loss > worst.loss) worst = { k: k, d: d, loss: loss };
    });
    return { score: wt ? Math.round(100 * sum / wt) : 0, worst: worst };
  }
  function best(t, u) { var a = compare(t, u), b = compare(t, mirror(u)); return a.score >= b.score ? a : b; }
  window.BAAHEIN = { feats: feats, best: best };
  function hint(w) {
    if (!w || w.loss < 0.08) return 'Spot on. Hold it just like that.';
    var side = /L$/.test(w.k) ? 'left' : 'right';
    if (w.d == null) return w.k === 'hx' || w.k === 'hy' ? 'Keep your face in the frame.' : 'Keep your whole ' + side + ' arm in the frame.';
    if (/^ua/.test(w.k)) return (w.d > 0 ? 'Raise' : 'Lower') + ' your ' + side + ' arm' + (Math.abs(w.d) < 20 ? ' a little' : ' more') + ' (about ' + Math.round(Math.abs(w.d)) + '°).';
    if (/^fa/.test(w.k)) return (Math.abs(w.d) > 0 ? 'Bend or straighten' : 'Hold') + ' your ' + side + ' elbow to match his.';
    return 'Tilt your head the way he does.';
  }
  var EDGES = [[5, 6], [5, 7], [7, 9], [6, 8], [8, 10], [5, 11], [6, 12], [11, 12]];
  function drawSk(ctx, kp, map, col) {
    ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.fillStyle = col;
    EDGES.forEach(function (e) { var a = kp[e[0]], b = kp[e[1]]; if (!a || !b || a[2] < MIN || b[2] < MIN) return; var A = map(a), B = map(b); ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); });
    [0, 5, 6, 7, 8, 9, 10].forEach(function (i) { var p = kp[i]; if (!p || p[2] < MIN) return; var P = map(p); ctx.beginPath(); ctx.arc(P[0], P[1], 5, 0, 7); ctx.fill(); });
  }
  // draw a source (img/video) cover-fit into a canvas; returns the point mapper
  function cover(ctx, src, sw, sh, cw, ch) {
    var s = Math.max(cw / sw, ch / sh), dw = sw * s, dh = sh * s, dx = (cw - dw) / 2, dy = (ch - dh) * 0.2;
    ctx.drawImage(src, dx, dy, dw, dh);
    return function (p) { return [dx + p[0] * s, dy + p[1] * s]; };
  }

  // ---- deck
  var DECK = [], CUR = null, det = null, stream = null, raf = 0, lastKp = null, filter = 'all';
  function album() { var a = load(); var n = DECK.filter(function (c) { return a[c.id] && a[c.id].got; }).length;
    $('#alb').textContent = n + ' / ' + DECK.length; $('#albBar').style.width = (DECK.length ? 100 * n / DECK.length : 0) + '%'; }
  function grid() {
    var a = load();
    $('#grid').innerHTML = DECK.filter(function (c) {
      var got = a[c.id] && a[c.id].got;
      return filter === 'all' || filter === c.lv || (filter === 'got' && got) || (filter === 'not' && !got);
    }).map(function (c) {
      var r = a[c.id] || {};
      return '<button class="bk-card' + (r.got ? ' got' : '') + '" data-id="' + esc(c.id) + '"><img src="' + esc(c.img) + '" alt="' + esc(c.label) + '" loading="lazy"><span class="lv ' + c.lv + '">' + LV[c.lv] + '</span>' + (r.best ? '<span class="sc">' + r.best + '</span>' : '') + '<span class="nm">' + esc(c.label) + '</span></button>';
    }).join('') || '<p>No cards here yet.</p>';
    album();
  }
  $('#flt').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; [].forEach.call($('#flt').children, function (x) { x.classList.toggle('on', x === b); }); grid(); });
  $('#grid').addEventListener('click', function (e) { var b = e.target.closest('.bk-card'); if (b) open(b.dataset.id); });

  function getDet() {
    if (det) return Promise.resolve(det);
    return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, { modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER }).then(function (d) { det = d; return d; });
  }
  function toKp(poses) { var p = poses && poses[0]; return p ? p.keypoints.map(function (k) { return [k.x, k.y, k.score]; }) : null; }

  function open(id) {
    CUR = DECK.filter(function (c) { return c.id === id; })[0]; if (!CUR) return;
    CUR.f = CUR.f || feats(CUR.kp);
    $('#pTitle').textContent = CUR.label + ' · ' + LV[CUR.lv];
    $('#res').classList.remove('on'); $('#msg').textContent = 'Open your camera, step back until your arms fit, and match his pose.';
    var img = $('#pImg'); img.onload = function () {
      var cv = $('#pSk'), r = cv.getBoundingClientRect(); cv.width = r.width * 2; cv.height = r.height * 2;
      var ctx = cv.getContext('2d'); var map = cover(ctx, img, img.naturalWidth, img.naturalHeight, cv.width, cv.height);
      var sx = img.naturalWidth / CUR.w; drawSk(ctx, CUR.kp, function (p) { return map([p[0] * sx, p[1] * sx]); }, 'rgba(240,194,78,.85)');
      img.style.visibility = 'hidden';
    };
    img.style.visibility = ''; img.src = CUR.img;
    $('#play').classList.add('on'); document.body.style.overflow = 'hidden';
  }
  function close() {
    $('#play').classList.remove('on'); document.body.style.overflow = '';
    cancelAnimationFrame(raf); if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    $('#bShot').disabled = true; $('#live').textContent = ''; grid();
  }
  $('#pX').onclick = close;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#play').classList.contains('on')) close(); });

  $('#bStart').onclick = function () {
    $('#msg').textContent = 'Starting the camera and the pose reader…';
    Promise.all([navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 1280 } }, audio: false }), getDet()]).then(function (x) {
      stream = x[0]; var v = $('#cam'); v.srcObject = stream; v.play();
      v.onloadeddata = function () { $('#bShot').disabled = false; $('#msg').textContent = 'Match his pose. The number is your live score.'; loop(); };
    }).catch(function () { $('#msg').textContent = 'The camera could not open. Allow camera access, or use a photo instead.'; });
  };
  $('#mirror').checked = true;
  $('#mirror').onchange = function () { $('#camPane').classList.toggle('mir', this.checked); };

  function loop() {
    var v = $('#cam'), cv = $('#cSk');
    if (!stream) return;
    var r = cv.getBoundingClientRect(); if (cv.width !== Math.round(r.width)) { cv.width = Math.round(r.width); cv.height = Math.round(r.height); }
    det.estimatePoses(v, { flipHorizontal: false }).then(function (p) {
      var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
      var map = cover(ctx, v, v.videoWidth, v.videoHeight, cv.width, cv.height);
      lastKp = toKp(p);
      if (lastKp) { drawSk(ctx, lastKp, map, 'rgba(229,9,20,.9)'); var u = feats(lastKp); $('#live').textContent = u ? best(CUR.f, u).score : ''; }
      else $('#live').textContent = '';
      raf = requestAnimationFrame(loop);
    }).catch(function () { raf = requestAnimationFrame(loop); });
  }

  function finish(src, sw, sh) {
    getDet().then(function (d) { return d.estimatePoses(src); }).then(function (p) {
      var kp = toKp(p), u = kp && feats(kp);
      var shot = $('#shot'); shot.width = sw; shot.height = sh; shot.getContext('2d').drawImage(src, 0, 0, sw, sh);
      if (!u) { $('#msg').textContent = 'We could not see your shoulders and arms. Step back so your upper body fits, then try again.'; return; }
      var r = best(CUR.f, u), a = load(), rec = a[CUR.id] || {};
      rec.best = Math.max(rec.best || 0, r.score); rec.at = Date.now();
      var newCard = r.score >= GOAL && !rec.got; if (r.score >= GOAL) rec.got = true;
      a[CUR.id] = rec; save(a);
      $('#rScore').textContent = r.score + '%';
      $('#rText').innerHTML = r.score >= GOAL ? (newCard ? '<b>Card collected!</b> ' + esc(CUR.label) + ' is in your album.' : 'You already own this card. Best score: ' + rec.best + '%.') : (r.score >= 80 ? 'So close. ' + (GOAL - r.score) + ' more to win the card.' : 'Not yet. Score ' + GOAL + ' or more to win the card.');
      $('#rHint').textContent = hint(r.worst);
      $('#res').classList.add('on');
      if (newCard && window.STARKS) window.STARKS.earn('pose', 100, 'BAAHEIN KHOL · ' + CUR.label, 'pose-' + CUR.id);
      album();
    });
  }
  $('#bShot').onclick = function () {
    var n = 3, cd = $('#cd'); $('#bShot').disabled = true;
    var t = setInterval(function () {
      cd.textContent = n; n--;
      if (n < 0) { clearInterval(t); cd.textContent = ''; var v = $('#cam'); finish(v, v.videoWidth, v.videoHeight); $('#bShot').disabled = false; }
    }, 1000);
  };
  $('#bAgain').onclick = function () { $('#res').classList.remove('on'); };
  $('#up').onchange = function () {
    var f = this.files && this.files[0]; if (!f) return;
    var im = new Image(); im.onload = function () {
      var cv = $('#cSk'), r = cv.getBoundingClientRect(); cv.width = r.width; cv.height = r.height;
      cover(cv.getContext('2d'), im, im.naturalWidth, im.naturalHeight, cv.width, cv.height);
      $('#msg').textContent = 'Reading your pose…'; finish(im, im.naturalWidth, im.naturalHeight);
    };
    im.onerror = function () { $('#msg').textContent = 'That photo could not be opened. Try a JPG or PNG.'; };
    im.src = URL.createObjectURL(f);
  };
  // card image: the King's pose beside yours, with the score; made on the device and downloaded
  $('#bSave').onclick = function () {
    var W2 = 1080, H2 = 1350, c = document.createElement('canvas'); c.width = W2; c.height = H2; var x = c.getContext('2d');
    x.fillStyle = '#0a0505'; x.fillRect(0, 0, W2, H2);
    x.fillStyle = '#f0c24e'; x.font = '72px Anton, Impact, sans-serif'; x.textAlign = 'center'; x.fillText('BAAHEIN KHOL', W2 / 2, 110);
    var pw = 500, ph = 800, y = 170;
    x.save(); x.beginPath(); x.rect(30, y, pw, ph); x.clip(); cover(x, $('#pImg'), $('#pImg').naturalWidth, $('#pImg').naturalHeight, pw, ph); x.restore();
    var sh = $('#shot'); x.save(); x.beginPath(); x.rect(550, y, pw, ph); x.clip(); x.translate(550 + pw, y); x.scale(-1, 1);
    var s = Math.max(pw / sh.width, ph / sh.height); x.drawImage(sh, (pw - sh.width * s) / 2, (ph - sh.height * s) * 0.2, sh.width * s, sh.height * s); x.restore();
    x.strokeStyle = '#c9a24a'; x.lineWidth = 4; x.strokeRect(30, y, pw, ph); x.strokeRect(550, y, pw, ph);
    x.fillStyle = '#fff'; x.font = '40px Anton, Impact, sans-serif'; x.fillText(CUR.label.toUpperCase(), W2 / 2, 1060);
    x.fillStyle = '#f0c24e'; x.font = '140px Anton, Impact, sans-serif'; x.fillText($('#rScore').textContent, W2 / 2, 1230);
    x.fillStyle = '#cfc4bb'; x.font = '30px Archivo, Arial, sans-serif'; x.fillText('www.AgarMainKingHota.com', W2 / 2, 1300);
    var a = document.createElement('a'); a.download = 'baahein-khol-' + CUR.id + '.png'; a.href = c.toDataURL('image/png'); a.click();
  };

  fetch('../data/baahein-khol.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
    var order = { e: 0, m: 1, h: 2, l: 3 };
    DECK = (d.cards || []).sort(function (a, b) { return order[a.lv] - order[b.lv]; });
    grid();
  }).catch(function () { $('#grid').innerHTML = '<p>The deck could not load. Refresh the page.</p>'; });
})();
