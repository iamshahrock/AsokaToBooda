/* Big section tiles at the top of Gallery and On The Record pages, so nobody misses a section. */
(function(){
  var me=document.currentScript, base=new URL('..',me.src).href;
  var GROUPS={
    gallery:['The Gallery',[['gallery/videos/','Videos','Songs, trailers, scenes, shows, awards','vids'],['gallery/','Images','Films, covers, shoots, events, awards','img']]],
    record:['On The Record',[['on-the-record/branded/','Branded','TV ads by brand + print ads','ads'],['on-the-record/video-interviews/','Video Interviews','TV, talks, speeches, press meets','vid'],['on-the-record/king-in-print/','King In Print','Interviews, articles, opinions, his words','txt']]]
  };
  var here=location.pathname.replace(/index\.html$/,'');
  var g=/\/on-the-record\//.test(here)?'record':'gallery', G=GROUPS[g], S=G[1];
  var css='.gnav{display:grid;grid-template-columns:repeat('+S.length+',minmax(0,1fr));gap:10px;margin:6px 0 22px}.gnav a{position:relative;display:flex;flex-direction:column;gap:4px;padding:16px 16px 14px;border:2px solid #3a2222;background:linear-gradient(160deg,#1c0b0b,#0d0909);color:#efe6df;text-decoration:none;min-width:0;transition:border-color .15s,transform .15s}.gnav a:hover{border-color:var(--red,#e3242b);transform:translateY(-2px)}.gnav a[aria-current]{border-color:var(--red,#e3242b);background:linear-gradient(160deg,#3a0d0f,#140909)}.gnav b{font:400 clamp(20px,2.4vw,32px)/1 Anton,Impact,sans-serif;letter-spacing:.02em;text-transform:uppercase}.gnav a[aria-current] b{color:#fff}.gnav span{font-size:12.5px;line-height:1.35;color:#bfb3aa}.gnav i{font-style:normal;font:700 11px Archivo,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--red-text,#ff4a4f)}.gnav-h{font:700 12px Archivo,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--red-text,#ff4a4f);margin:22px 0 8px}@media(max-width:800px){.gnav{grid-template-columns:1fr}.gnav a{padding:12px}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  var wrap=document.createElement('div');
  wrap.innerHTML='<p class="gnav-h">'+G[0]+' · '+S.length+' sections</p><nav class="gnav" aria-label="'+G[0]+' sections">'+S.map(function(s){var u=new URL(s[0],base);var cur=u.pathname===here?' aria-current="page"':'';return '<a href="'+u.href+'"'+cur+'><i data-c="'+s[3]+'">&nbsp;</i><b>'+s[1]+'</b><span>'+s[2]+'</span></a>';}).join('')+'</nav>';
  var put=function(){var main=document.querySelector('main'); if(!main) return; var ph=main.querySelector('.page-head'); if(here.replace(/\/$/,'').split('/').pop()==='on-the-record'&&ph) ph.after(wrap); else main.insertBefore(wrap, main.firstChild);};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',put); else put();
  var fmt=function(n){return Number(n).toLocaleString('en-US');};
  var set=function(k,t){var e=wrap.querySelector('[data-c="'+k+'"]'); if(e) e.textContent=t;};
  var get=function(f){return fetch(base+'data/'+f,{cache:'no-store'}).then(function(r){return r.json();});};
  if(g==='gallery'){
    get('gallery.json').then(function(d){var n=(d.items||[]).length;set('img',n?fmt(n)+' pictures':'Coming soon');}).catch(function(){});
    get('srk-videos.json').then(function(d){set('vids',fmt((d.items||[]).length)+' videos');}).catch(function(){});
  } else {
    get('srk-ads.json').then(function(d){set('ads',fmt((d.items||[]).length)+' ads · '+fmt((d.print_images||[]).length)+' print');}).catch(function(){});
    get('srk-interviews.json').then(function(d){set('vid',fmt((d.items||[]).length)+' videos');set('txt',fmt((d.text||[]).length)+' pieces');}).catch(function(){});
  }
})();
