/* STARKS — the points fans earn on Agar Main King Hota.
   One ledger per device (localStorage). Fans who join the Billboard with a name have their
   balance posted to the public leaderboard (Worker /billboard). Include on any page:
     <script src="(path)/assets/starks.js"></script>
   then call STARKS.earn('poster', 100) etc. */
(function () {
  if (window.STARKS) return;
  var KEY = 'amkh-starks';
  var BASE = 'https://asokatobooda.iamshahrock.workers.dev', API = BASE + '/billboard';
  // reason -> [label, max awards per IST day]
  var RULES = {
    visit: ['Daily visit', 1],
    poster: ['Made a KING poster', 5],
    share: ['Shared a poster', 1],
    lair: ['Cleared a lair', 18],
    firstclear: ['First clear of a lair', 6],
    throne: ['Throne Room', 3],
    flush: ['Royal Flush jackpot', 3],
    allsix: ['All six lairs cleared', 1],
    chess: ['Beat the Machine at Chess81', 5],
    chapter: ['Finished a story chapter', 12],
    verdict: ['Finished THE CONTRACT', 2]
  };
  var TIERS = [[0, 'Fan'], [500, 'Rebel'], [1500, 'Prince'], [4000, 'King'], [10000, 'Royal Flush']];

  function istDay() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
  function load() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!s) s = { balance: 0, history: [], day: '', counts: {}, once: {}, name: '', joined: false, device: '' };
    if (!s.device) s.device = Array.from(crypto.getRandomValues(new Uint8Array(12))).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    if (s.day !== istDay()) { s.day = istDay(); s.counts = {}; }
    return s;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function tier(b) { var t = TIERS[0][1]; TIERS.forEach(function (x) { if (b >= x[0]) t = x[1]; }); return t; }
  function nextTier(b) { for (var i = 0; i < TIERS.length; i++) if (b < TIERS[i][0]) return { name: TIERS[i][1], at: TIERS[i][0] }; return null; }

  function toast(text) {
    var box = document.getElementById('starks-toasts');
    if (!box) {
      box = document.createElement('div'); box.id = 'starks-toasts'; box.setAttribute('role', 'status');
      box.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;max-width:92vw';
      document.body.appendChild(box);
    }
    var t = document.createElement('div');
    t.style.cssText = 'background:#c3121a;color:#fff;font:600 15px Archivo,Arial,sans-serif;padding:11px 18px;box-shadow:0 8px 30px rgba(0,0,0,.5);letter-spacing:.02em;text-align:center';
    t.textContent = text; box.appendChild(t);
    setTimeout(function () { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; }, 2200);
    setTimeout(function () { t.remove(); }, 2700);
  }

  function post(path, body) {
    return fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'STARKS error ' + r.status); return j; }); });
  }
  function adopt(j) {
    if (!j || typeof j.balance !== 'number') return;
    var s = load(); s.balance = j.balance; s.synced = true;
    if (typeof j.joined === 'boolean') s.joined = j.joined;
    if (j.name) s.name = j.name;
    save(s); document.dispatchEvent(new CustomEvent('starks', { detail: s }));
  }
  var api = {
    rules: RULES, tiers: TIERS, tier: tier, nextTier: nextTier,
    get: function () { var s = load(); save(s); return s; },
    // once: an id that may only ever be awarded one time (e.g. first clear of a lair)
    earn: function (reason, amount, note, once) {
      var s = load(), rule = RULES[reason];
      if (!rule || !(amount > 0)) return 0;
      if (once && s.once[once]) return 0;
      if ((s.counts[reason] || 0) >= rule[1]) return 0;
      amount = Math.round(amount);
      var carry = s.synced ? undefined : s.balance;
      s.counts[reason] = (s.counts[reason] || 0) + 1;
      if (once) s.once[once] = Date.now();
      s.balance += amount;
      s.history.unshift({ r: reason, a: amount, n: note || rule[0], t: Date.now() });
      s.history = s.history.slice(0, 40);
      save(s);
      toast('+' + amount.toLocaleString('en-IN') + ' STARKS · ' + (note || rule[0]));
      document.dispatchEvent(new CustomEvent('starks', { detail: s }));
      // the server checks every award and keeps the real balance
      post('/starks/earn', { device: s.device, reason: reason, amount: amount, note: note || rule[0], once: once || null, carry: carry }).then(adopt).catch(function () {});
      return amount;
    },
    join: function (name) {
      var s = load(); s.name = String(name || '').trim().slice(0, 18);
      return post('/billboard', { device: s.device, name: s.name, carry: s.synced ? undefined : s.balance }).then(function (j) {
        var t = load(); t.name = j.name || t.name; t.joined = true; t.balance = j.starks; t.synced = true; save(t);
        document.dispatchEvent(new CustomEvent('starks', { detail: t })); return j;
      });
    },
    leave: function () { var s = load(); s.joined = false; save(s); return post('/billboard', { device: s.device, leave: true }).catch(function () {}); },
    sync: function () {
      var s = load();
      return fetch(BASE + '/starks/me?device=' + s.device, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { if (j && typeof j.balance === 'number') adopt(j); return j; });
    },
    board: function () { return fetch(API, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('Billboard error ' + r.status); return r.json(); }); }
  };
  window.STARKS = api;
  // daily visit
  document.addEventListener('DOMContentLoaded', function () { setTimeout(function () { api.earn('visit', 10, 'Daily visit'); }, 1200); });
})();
