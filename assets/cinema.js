/* Lairs Cinema: play an approved fan clip on our own site (YouTube, Instagram, Facebook);
   X posts open on X. Used by the home page and King's Lairs. */
(function () {
  if (window.AMKH_CINEMA) return;
  var LAIR = { casino: 'The Casino Floor', dome: 'The Mountain Dome', city: 'The Secret City', pit: 'The Pit', den: 'The Abyssal Den', throne: 'The Throne Room' };
  var PLATE = { casino: 'casino-grand', dome: 'dome-aerial', city: 'dome-archive', pit: 'pit-dance', den: 'den-abyssal', throne: 'dome-panorama' };
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ytId(u) { var m = String(u).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/); return m ? m[1] : null; }
  function embed(c) {
    var u = String(c.url || ''), y = ytId(u), m;
    if (y) return { src: 'https://www.youtube-nocookie.com/embed/' + y + '?autoplay=1&rel=0', tall: /shorts\//.test(u) };
    if ((m = u.match(/instagram\.com\/(reel|p|tv)\/([\w-]+)/))) return { src: 'https://www.instagram.com/' + m[1] + '/' + m[2] + '/embed', tall: true };
    if (/facebook\.com|fb\.watch/.test(u)) return { src: 'https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(u) + '&show_text=false', tall: false };
    return null;
  }
  function thumb(c, base) {
    var y = ytId(c.url);
    return y ? 'https://i.ytimg.com/vi/' + y + '/hqdefault.jpg' : base + 'assets/lairs/scenes/' + (PLATE[c.lair] || 'casino-grand') + '-t.webp';
  }
  var css = '.cine-modal{position:fixed;inset:0;z-index:200;background:rgba(5,3,3,.92);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.cine-box{width:min(960px,100%);max-height:100%;display:flex;flex-direction:column;gap:10px}' +
    '.cine-frame{position:relative;width:100%;aspect-ratio:16/9;background:#000;border:1px solid #3a2626}' +
    '.cine-frame.tall{aspect-ratio:9/16;width:min(420px,100%);max-height:78vh;margin:0 auto}' +
    '.cine-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
    '.cine-meta{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:space-between;color:#f4efe9;font-size:14px}' +
    '.cine-meta b{font-size:16px}.cine-meta small{display:block;color:#b8aca4;font-size:12px;letter-spacing:.08em;text-transform:uppercase}' +
    '.cine-acts{display:flex;gap:8px;flex-wrap:wrap}.cine-acts a{padding:9px 14px;border:1px solid #4a2c2c;color:#f4efe9;text-decoration:none;font-size:13px;letter-spacing:.08em;text-transform:uppercase}' +
    '.cine-acts a.red{background:#c3121a;border-color:#c3121a}.cine-acts a:hover{border-color:#ff4a4f}' +
    '.cine-x{position:absolute;top:12px;right:14px;width:44px;height:44px;border:1px solid #4a2c2c;background:#0a0707;color:#f4efe9;font-size:22px;cursor:pointer}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function play(c, base) {
    base = base || '';
    var e = embed(c);
    if (!e) { window.open(c.url, '_blank', 'noopener'); return; }
    var m = document.createElement('div'); m.className = 'cine-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Lairs Cinema player');
    m.innerHTML = '<button class="cine-x" type="button" aria-label="Close">×</button><div class="cine-box"><div class="cine-frame' + (e.tall ? ' tall' : '') + '"><iframe src="' + esc(e.src) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="' + esc(c.title || 'Fan clip') + '"></iframe></div>' +
      '<div class="cine-meta"><div><small>Lairs Cinema' + (LAIR[c.lair] ? ' · ' + LAIR[c.lair] : '') + (c.tool ? ' · made with ' + esc(c.tool) : '') + '</small><b>' + esc(c.title || 'Fan clip') + '</b> <span style="color:#b8aca4">' + esc(c.handle || '') + '</span></div>' +
      '<div class="cine-acts"><a class="red" href="' + base + 'lairs/?scene=' + esc(c.lair || 'casino') + '#cinema">Make yours in this scene</a><a href="' + esc(c.url) + '" target="_blank" rel="noopener">Open original ↗</a></div></div></div>';
    function close() { m.remove(); document.removeEventListener('keydown', key); document.documentElement.style.overflow = ''; }
    function key(ev) { if (ev.key === 'Escape') close(); }
    m.querySelector('.cine-x').onclick = close; m.onclick = function (ev) { if (ev.target === m) close(); };
    document.addEventListener('keydown', key); document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(m); m.querySelector('.cine-x').focus();
  }
  window.AMKH_CINEMA = { play: play, thumb: thumb, embed: embed, esc: esc, LAIR: LAIR, PLATE: PLATE };
})();
