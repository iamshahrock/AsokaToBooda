/* VGrid: a same-size thumbnail grid of YouTube videos (or links) read from a JSON file.
   Every card links to the original upload; nothing is re-hosted. */
(function(){
  var fmt=function(n){return (n==null)?'N/A':Number(n).toLocaleString('en-US');};
  var esc=function(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  var short=function(n){if(n==null)return 'N/A';if(n>=1e6)return (n/1e6).toFixed(n>=1e7?0:1)+'M';if(n>=1e3)return (n/1e3).toFixed(n>=1e4?0:1)+'K';return String(n);};
  function days(a){var m=String(a||'').match(/(\d+)\s*(second|minute|hour|day|d|week|w|month|mo|year|y)/i);if(!m)return 1e6;var n=+m[1],u=m[2].toLowerCase();
    var k={second:0,minute:0,hour:0,day:1,d:1,week:7,w:7,month:30,mo:30,year:365,y:365}[u];return n*(k==null?1:k);}
  window.VGrid=function(o){
    var $=function(q){return document.querySelector(q);}, grid=$(o.grid), f='all', shown=60, items=[];
    function card(it){
      var url=it.url||('https://www.youtube.com/watch?v='+it.id);
      var th=it.id?'<div class="th"><img loading="lazy" src="https://i.ytimg.com/vi/'+esc(it.id)+'/mqdefault.jpg" alt="">'+(it.length?'<i>'+esc(it.length)+'</i>':'')+(it.badge?'<em>'+esc(it.badge)+'</em>':'')+'</div>':'';
      var meta=(o.metaFn?o.metaFn(it,fmt,short):[(it.views!=null?short(it.views)+' views':'Views N/A'),it.age].filter(Boolean).join(' · '));
      return '<a class="vc" href="'+esc(url)+'" target="_blank" rel="noopener">'+th+'<div class="b"><h3>'+esc(it.title)+'</h3><span class="c">'+esc(it.channel||'')+'</span><span class="m">'+esc(meta)+'</span></div></a>';
    }
    function list(){
      var q=($(o.q)||{}).value; q=(q||'').toLowerCase().trim();
      var s=($(o.sort)||{}).value||'views';
      var L=items.filter(function(it){return o.filter(it,f)&&(!q||(it.title+' '+(it.channel||'')+' '+(it.brand||'')).toLowerCase().indexOf(q)>=0);});
      L.sort(s==='new'?function(a,b){return days(a.age)-days(b.age);}:(s==='az'?function(a,b){return String(a.sortKey||a.title).localeCompare(String(b.sortKey||b.title));}:function(a,b){return (b.views||-1)-(a.views||-1);}));
      return L;
    }
    function render(){
      var L=list();
      grid.innerHTML=L.length?L.slice(0,shown).map(card).join(''):'<p class="vg-empty">Nothing matches.</p>';
      if(L.length>shown){var b=document.createElement('button');b.className='vg-more';b.type='button';b.textContent='Show more ('+(L.length-shown)+' left)';b.onclick=function(){shown+=60;render();};grid.appendChild(b);}
    }
    fetch(o.data,{cache:'no-store'}).then(function(r){return r.json();}).then(function(d){
      items=d.items||[];
      if(o.stats&&o.statsFn) $(o.stats).innerHTML=o.statsFn(items,fmt).map(function(x){return '<div><b>'+x[0]+'</b><span>'+esc(x[1])+'</span></div>';}).join('');
      if(o.src) $(o.src).textContent='Source: '+(d.source||'')+(d.updated?' Updated '+d.updated+'.':'');
      render();
    }).catch(function(){grid.innerHTML='<p class="vg-empty">The list could not load right now.</p>';});
    if(o.chips) [].forEach.call(document.querySelectorAll(o.chips+' button'),function(b){b.onclick=function(){[].forEach.call(document.querySelectorAll(o.chips+' button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});f=b.getAttribute('data-f');shown=60;render();};});
    if(o.q) $(o.q).addEventListener('input',function(){shown=60;render();});
    if(o.sort) $(o.sort).addEventListener('change',render);
  };
})();
