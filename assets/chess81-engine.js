/* CHESS81 engine — rules, move generation and the Machine.
   Board: 9x9, index i = row*9 + col. Row 0 = rank 1 (RED home). Files A B C D O E F G H.
   Pieces: positive = RED, negative = BLUE.
   1 Pawn · 2 Lighter · 3 Knight · 4 Bishop · 5 Rook · 6 Queen (range 3) · 7 Torch · 8 King (king + knight leap)
   Loaded by CHESS81.HTML as a script and also run as a Web Worker for the Machine's thinking. */
(function (root) {
  var P = 1, L = 2, N = 3, B = 4, R = 5, Q = 6, T = 7, K = 8;
  var FILES = ['A', 'B', 'C', 'D', 'O', 'E', 'F', 'G', 'H'];
  var CENTRE = 40; // O5
  var QUEEN_RANGE = 3;
  var KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
  var ADJ = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  var ORTH = ADJ.slice(0, 4), DIAG = ADJ.slice(4);
  var VAL = [0, 100, 160, 300, 320, 500, 520, 0, 0];

  function sideOf(p) { return p > 0 ? 0 : 1; }
  function typeOf(p) { return p < 0 ? -p : p; }
  function sq(i) { return FILES[i % 9] + ((i / 9 | 0) + 1); }
  function idx(name) { var c = FILES.indexOf(String(name).charAt(0).toUpperCase()), r = parseInt(String(name).slice(1), 10) - 1; return c < 0 || !(r >= 0 && r < 9) ? -1 : r * 9 + c; }
  function on(r, c) { return r >= 0 && r < 9 && c >= 0 && c < 9; }

  function initial() {
    var b = new Int8Array(81), back = [R, N, B, Q, T, K, B, N, R];
    for (var c = 0; c < 9; c++) {
      b[c] = back[c]; b[9 + c] = c === 4 ? L : P;
      b[72 + c] = -back[c]; b[63 + c] = c === 4 ? -L : -P;
    }
    return { b: b, turn: 0, lit: [0, 0], fire: [0, 0], lage: [0, 0], kpos: [5, 77], quiet: 0, ply: 0, winner: -1, reason: '', events: [] };
  }
  function clone(s) {
    return { b: new Int8Array(s.b), turn: s.turn, lit: s.lit.slice(), fire: s.fire.slice(), lage: s.lage.slice(), kpos: s.kpos.slice(), quiet: s.quiet, ply: s.ply, winner: s.winner, reason: s.reason, events: [] };
  }
  function stage(fire) { return fire >= 3 ? 3 : fire >= 2 ? 2 : 1; }
  // what a lit torch burns at each stage (never the King, never the Torch)
  function burns(fire, t) { var st = stage(fire); return t === P || t === L || (st >= 2 && (t === N || t === B)) || (st >= 3 && (t === R || t === Q)); }
  function capturable(s, q, side) { if (!q || sideOf(q) === side) return false; var t = typeOf(q); return !(t === T && !s.lit[1 - side]); }

  /* pseudo-legal moves for the side to move; moves are encoded from*81+to */
  function gen(s, capsOnly) {
    var b = s.b, side = s.turn, out = [], sg = side ? -1 : 1, fwd = side ? -1 : 1;
    for (var i = 0; i < 81; i++) {
      var p = b[i]; if (!p || (p > 0) !== (sg > 0)) continue;
      var t = typeOf(p), r = i / 9 | 0, c = i % 9, k, a, e, j, q, d;
      if (t === P) {
        a = r + fwd;
        if (!capsOnly && on(a, c) && !b[a * 9 + c]) {
          out.push(i * 81 + a * 9 + c);
          if (r === (side ? 7 : 1) && !b[(a + fwd) * 9 + c]) out.push(i * 81 + (a + fwd) * 9 + c);
        }
        for (d = -1; d <= 1; d += 2) { e = c + d; if (on(a, e) && capturable(s, b[a * 9 + e], side)) out.push(i * 81 + a * 9 + e); }
      } else if (t === L) {
        if (capsOnly) continue;
        for (k = 0; k < 8; k++) { a = r + ADJ[k][0]; e = c + ADJ[k][1]; if (on(a, e) && !b[a * 9 + e]) out.push(i * 81 + a * 9 + e); }
        if (r === (side ? 7 : 1) && !b[(r + fwd) * 9 + c] && !b[(r + 2 * fwd) * 9 + c]) out.push(i * 81 + (r + 2 * fwd) * 9 + c);
      } else if (t === N || t === K) {
        for (k = 0; k < 8; k++) { a = r + KN[k][0]; e = c + KN[k][1]; if (!on(a, e)) continue; j = a * 9 + e; q = b[j]; if (q ? capturable(s, q, side) : !capsOnly) out.push(i * 81 + j); }
        if (t === K) for (k = 0; k < 8; k++) { a = r + ADJ[k][0]; e = c + ADJ[k][1]; if (!on(a, e)) continue; j = a * 9 + e; q = b[j]; if (q ? capturable(s, q, side) : !capsOnly) out.push(i * 81 + j); }
      } else if (t === T) {
        if (!s.lit[side]) continue;
        for (k = 0; k < 8; k++) { a = r + ADJ[k][0]; e = c + ADJ[k][1]; if (!on(a, e)) continue; j = a * 9 + e; q = b[j]; if (q ? capturable(s, q, side) : !capsOnly) out.push(i * 81 + j); }
      } else {
        var dirs = t === B ? DIAG : t === R ? ORTH : ADJ, max = t === Q ? QUEEN_RANGE : 9;
        for (k = 0; k < dirs.length; k++) {
          a = r; e = c;
          for (var n = 0; n < max; n++) {
            a += dirs[k][0]; e += dirs[k][1]; if (!on(a, e)) break; j = a * 9 + e; q = b[j];
            if (!q) { if (!capsOnly) out.push(i * 81 + j); continue; }
            if (capturable(s, q, side)) out.push(i * 81 + j);
            break;
          }
        }
      }
    }
    return out;
  }

  /* is square x attacked by side `by`? */
  function attacked(s, x, by) {
    var b = s.b, r = x / 9 | 0, c = x % 9, sg = by ? -1 : 1, k, a, e, q, t;
    for (k = 0; k < 8; k++) { a = r + KN[k][0]; e = c + KN[k][1]; if (!on(a, e)) continue; q = b[a * 9 + e] * sg; if (q === N || q === K) return true; }
    for (k = 0; k < 8; k++) {
      var dr = ADJ[k][0], dc = ADJ[k][1], diag = k >= 4; a = r; e = c;
      for (var n = 1; n <= 9; n++) {
        a += dr; e += dc; if (!on(a, e)) break; q = b[a * 9 + e]; if (!q) continue;
        q *= sg; if (q < 0) break; t = q;
        if (n === 1 && (t === K || (t === T && s.lit[by]))) return true;
        if (n === 1 && t === P && diag && dr === (by ? 1 : -1)) return true;
        if (t === Q && n <= QUEEN_RANGE) return true;
        if (diag ? t === B : t === R) return true;
        break;
      }
    }
    return false;
  }
  function inCheck(s, side) { return attacked(s, s.kpos[side], 1 - side); }

  /* apply a move; returns the new state (with events for the UI) */
  function make(s, m) {
    var n = clone(s), b = n.b, f = (m / 81) | 0, to = m % 81, p = b[f], q = b[to], side = sideOf(p), t = typeOf(p), sg = side ? -1 : 1, quietReset = t === P || t === L;
    if (q) {
      quietReset = true; var qt = typeOf(q);
      n.events.push(['take', to, q]);
      if (qt === N || qt === B || qt === R) n.fire[side]++;
      if (qt === T) { n.winner = side; n.reason = 'torch'; }
      if (qt === L) n.lage[1 - side] = 0;
    }
    b[to] = p; b[f] = 0;
    if (t === K) n.kpos[side] = to;
    if (t === P && (to / 9 | 0) === (side ? 0 : 8)) { b[to] = Q * sg; n.events.push(['promote', to]); }
    // the Lighter leaves the Fire Square: the match is spent, it carries on as a pawn
    if (t === L && f === CENTRE && n.lit[side]) { b[to] = P * sg; n.events.push(['spent', to]); }
    // lighting the Torch
    if (to === CENTRE && !n.lit[side]) {
      var lights = t === L;
      if (t === K) { lights = true; for (var z = 0; z < 81; z++) if (b[z] === L * sg) { lights = false; break; } }
      if (lights) { n.lit[side] = 1; n.lage[side] = 0; n.events.push(['lit', side, t === K ? 'king' : 'lighter']); }
    }
    // a lit match left on O5 burns out after 3 more of your moves
    if (n.lit[side] && b[CENTRE] === L * sg && !(t === L && to === CENTRE)) {
      n.lage[side]++;
      if (n.lage[side] >= 3) { b[CENTRE] = 0; n.events.push(['burnout', CENTRE, side]); }
    }
    // the Torch breathes fire on the enemy pieces next to it
    if (n.lit[side] && n.winner < 0) {
      var tp = -1; for (var y = 0; y < 81; y++) if (b[y] === T * sg) { tp = y; break; }
      if (tp >= 0) {
        var fire = n.fire[side], tr = tp / 9 | 0, tc = tp % 9;
        for (var k = 0; k < 8; k++) {
          var a = tr + ADJ[k][0], e = tc + ADJ[k][1]; if (!on(a, e)) continue;
          var j = a * 9 + e, x = b[j]; if (!x || sideOf(x) === side) continue;
          var xt = typeOf(x);
          if (burns(fire, xt)) { b[j] = 0; quietReset = true; n.events.push(['burn', j, x]); if (xt === N || xt === B || xt === R) n.fire[side]++; }
        }
      }
    }
    n.quiet = quietReset ? 0 : n.quiet + 1;
    n.turn = 1 - side; n.ply++;
    return n;
  }

  function legal(s) {
    var ps = gen(s, false), out = [];
    for (var i = 0; i < ps.length; i++) { var n = make(s, ps[i]); if (n.winner === s.turn || !inCheck(n, s.turn)) out.push(ps[i]); }
    return out;
  }
  function fireVerdict(s) { return s.fire[0] > s.fire[1] ? 0 : s.fire[1] > s.fire[0] ? 1 : -1; }
  function onlyRoyals(s) { for (var i = 0; i < 81; i++) { var t = typeOf(s.b[i]); if (t && t !== K && t !== T) return false; } return true; }
  /* game result after a move: null if the game goes on */
  function result(s, rep) {
    if (s.winner >= 0) return { winner: s.winner, reason: 'torch' };
    var lm = legal(s);
    if (!lm.length) {
      if (inCheck(s, s.turn)) return { winner: 1 - s.turn, reason: 'mate' };
      return { winner: fireVerdict(s), reason: 'stalemate' };
    }
    if (s.quiet >= 100) return { winner: fireVerdict(s), reason: 'quiet' };
    if (rep >= 3) return { winner: fireVerdict(s), reason: 'repeat' };
    if (onlyRoyals(s)) return { winner: fireVerdict(s), reason: 'bare' };
    return null;
  }
  function key(s) { return s.turn + ':' + s.lit.join('') + ':' + Array.prototype.join.call(s.b, ','); }

  /* ---------- the Machine ---------- */
  var WIN = 100000;
  function evaluate(s) {
    var b = s.b, sc = 0;
    for (var i = 0; i < 81; i++) {
      var p = b[i]; if (!p) continue;
      var side = sideOf(p), t = typeOf(p), sg = side ? -1 : 1, r = i / 9 | 0, c = i % 9, v = VAL[t];
      var cd = Math.max(Math.abs(r - 4), Math.abs(c - 4));
      if (t === N || t === B || t === Q) v += (4 - cd) * 8;
      if (t === P) v += (side ? 8 - r : r) * 6 - Math.abs(c - 4) * 2;
      if (t === L && !s.lit[side]) v += (8 - Math.max(Math.abs(r - 4), Math.abs(c - 4))) * 22;
      if (t === K) v += (side ? (r >= 7 ? 20 : -30 * (7 - r)) : (r <= 1 ? 20 : -30 * (r - 1)));
      if (t === T && s.lit[side]) { v += 90 + s.fire[side] * 45 - (side ? 8 - r : r) * 4; }
      sc += sg * v;
    }
    sc += (s.fire[0] - s.fire[1]) * 30;
    return s.turn ? -sc : sc;
  }
  function order(s, ms) {
    var b = s.b;
    return ms.map(function (m) { var q = b[m % 81], p = b[(m / 81) | 0]; var w = q ? (typeOf(q) === T ? 9999 : VAL[typeOf(q)] * 10 - VAL[typeOf(p)]) : 0; if (m % 81 === CENTRE) w += 300; return [w, m]; })
      .sort(function (x, y) { return y[0] - x[0]; }).map(function (x) { return x[1]; });
  }
  var deadline = 0, nodes = 0, aborted = false;
  function quiesce(s, alpha, beta, d) {
    var stand = evaluate(s);
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    if (d <= 0) return stand;
    var ms = order(s, gen(s, true));
    for (var i = 0; i < ms.length; i++) {
      var n = make(s, ms[i]);
      if (n.winner === s.turn) return WIN;
      if (inCheck(n, s.turn)) continue;
      var v = -quiesce(n, -beta, -alpha, d - 1);
      if (v >= beta) return v;
      if (v > alpha) alpha = v;
    }
    return alpha;
  }
  function search(s, depth, alpha, beta, ply) {
    if ((++nodes & 1023) === 0 && deadline && Date.now() > deadline) aborted = true;
    if (aborted) return 0;
    if (s.quiet >= 100) return 0;
    if (depth <= 0) return quiesce(s, alpha, beta, 4);
    var ms = order(s, gen(s, false)), any = false, best = -WIN * 2;
    for (var i = 0; i < ms.length; i++) {
      var n = make(s, ms[i]), v;
      if (n.winner === s.turn) return WIN - ply;
      if (inCheck(n, s.turn)) continue;
      any = true;
      v = -search(n, depth - 1, -beta, -alpha, ply + 1);
      if (aborted) return 0;
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    if (!any) return inCheck(s, s.turn) ? -WIN + ply : (s.fire[s.turn] - s.fire[1 - s.turn]) * 50;
    return best;
  }
  var LEVELS = { squire: { depth: 1, noise: 140, ms: 600 }, knight: { depth: 2, noise: 25, ms: 1500 }, king: { depth: 5, noise: 0, ms: 2600 } };
  function think(s, level) {
    var cfg = LEVELS[level] || LEVELS.knight, ms = order(s, legal(s));
    if (!ms.length) return -1;
    if (ms.length === 1) return ms[0];
    deadline = Date.now() + cfg.ms; nodes = 0;
    var bestMove = ms[0];
    for (var depth = 1; depth <= cfg.depth; depth++) {
      aborted = false;
      var alpha = -WIN * 2, pick = -1, scored = [];
      for (var i = 0; i < ms.length; i++) {
        var n = make(s, ms[i]), v;
        if (n.winner === s.turn) return ms[i];
        v = -search(n, depth - 1, -WIN * 2, -alpha + cfg.noise, 1);
        if (aborted) break;
        v += cfg.noise ? Math.random() * cfg.noise : 0;
        scored.push([v, ms[i]]);
        if (v > alpha) { alpha = v; pick = ms[i]; }
      }
      if (aborted) break;
      if (pick >= 0) bestMove = pick;
      // search the best move first next time
      scored.sort(function (x, y) { return y[0] - x[0]; }); ms = scored.map(function (x) { return x[1]; });
      if (alpha >= WIN - 50) break;
    }
    deadline = 0;
    return bestMove;
  }

  var api = { P: P, L: L, N: N, B: B, R: R, Q: Q, T: T, K: K, FILES: FILES, CENTRE: CENTRE, QUEEN_RANGE: QUEEN_RANGE,
    initial: initial, clone: clone, legal: legal, make: make, inCheck: inCheck, attacked: attacked, result: result, key: key,
    stage: stage, burns: burns, sq: sq, idx: idx, sideOf: sideOf, typeOf: typeOf, think: think, levels: LEVELS };
  root.Chess81 = api;

  // Web Worker mode: postMessage({state, level}) -> {move}
  if (typeof window === 'undefined' && typeof self !== 'undefined' && typeof importScripts === 'function') {
    self.onmessage = function (e) {
      var d = e.data, s = d.state; s.b = new Int8Array(s.b);
      self.postMessage({ id: d.id, move: think(s, d.level) });
    };
  }
})(typeof window !== 'undefined' ? window : self);
