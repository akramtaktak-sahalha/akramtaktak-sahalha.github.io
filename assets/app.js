// Menu mobile
const nav=document.querySelector('.nav');
document.querySelector('.burger')?.addEventListener('click',()=>{const o=nav.classList.toggle('open');document.querySelector('.burger').setAttribute('aria-expanded',o)});
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

// Apparition au scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Vidéo YouTube : chargée au clic ; dans TikTok/Instagram/Facebook on ouvre l'app YouTube
const INAPP=/BytedanceWebview|musical_ly|TikTok|trill|Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger/i.test(navigator.userAgent);
document.querySelectorAll('.video-wrap').forEach(w=>{
  const b=w.querySelector('.video button'),out=w.querySelector('.yt-out'),tip=w.querySelector('.inapp-tip');
  if(INAPP&&tip)tip.hidden=false;
  if(!b)return;
  b.addEventListener('click',()=>{
    if(INAPP){location.href=out.href;return}
    const f=document.createElement('iframe');
    f.src='https://www.youtube.com/embed/videoseries?list='+b.dataset.list+'&autoplay=1&rel=0&playsinline=1&origin='+encodeURIComponent(location.origin);
    f.title='Vidéos Sahalha – Algorithme et Python';
    f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';f.allowFullscreen=true;
    f.referrerPolicy='strict-origin-when-cross-origin';
    b.replaceWith(f);
  });
});

// Événements pixels (Meta + TikTok) : clic WhatsApp = Lead, clic boutique = intérêt d'achat, PDF = téléchargement
const fire=(meta,tt,p={})=>{try{window.fbq&&fbq('track',meta,p)}catch(e){}try{window.ttq&&ttq.track(tt,p)}catch(e){}};
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const h=a.href||'';
  if(/wa\.me|chat\.whatsapp/.test(h))fire('Lead','Contact');
  else if(/converty\.shop/.test(h))fire('InitiateCheckout','ClickButton',{content_name:document.title});
  else if(/\.pdf$/.test(h))fire('ViewContent','Download',{content_name:a.textContent.trim().slice(0,80)});
});

// Code animé : Algorithme <-> Python
const pre=document.getElementById('code');
if(pre){
  const tabs=document.querySelectorAll('.code .tabs b');const out=document.getElementById('out');
  const S=[
    {t:0,lines:['<span class=c>// Somme de 1 à n</span>','<span class=k>Pour</span> i <span class=k>de</span> <span class=n>1</span> <span class=k>à</span> n <span class=k>Faire</span>','    s ← s + i','<span class=k>Fin Pour</span>','<span class=k>Écrire</span>(<span class=s>"S ="</span>, s)']},
    {t:1,lines:['<span class=c># Somme de 1 à n</span>','<span class=k>for</span> i <span class=k>in</span> range(<span class=n>1</span>, n + <span class=n>1</span>) :','    s = s + i','','print(<span class=s>"S ="</span>, s)']}
  ];
  let k=0;
  const run=()=>{const s=S[k%2];tabs.forEach((x,i)=>x.classList.toggle('on',i===s.t));pre.innerHTML='';out.innerHTML='';let i=0;
    const step=()=>{if(i<s.lines.length){pre.innerHTML+=(i?'\n':'')+s.lines[i++];setTimeout(step,520)}else{pre.innerHTML+='<span class=cur></span>';out.innerHTML='>>> n = 4 &nbsp;→&nbsp; <b>S = 10</b>';k++;setTimeout(run,3200)}};step()};
  run();
}

// App installable (PWA)
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
(()=>{
  const btn=document.querySelector('.links .install'),sheet=document.getElementById('sheet');if(!btn||!sheet)return;
  const txt=document.getElementById('sheet-txt'),go=document.getElementById('sheet-go');
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferred=null;
  const seen=()=>{try{return localStorage.getItem('sh-sheet')}catch(e){return 1}};
  const mark=()=>{try{localStorage.setItem('sh-sheet',Date.now())}catch(e){}};
  const open=()=>{sheet.hidden=false};const close=()=>{sheet.hidden=true;mark()};
  sheet.querySelector('.x').onclick=close;sheet.onclick=e=>{if(e.target===sheet)close()};
  if(standalone)return;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;btn.hidden=false;
    txt.textContent="Ajoute Sahalha sur ton écran d'accueil : accès direct aux vidéos, fiches et lives, comme une vraie application.";
    if(!seen())setTimeout(open,9000)});
  if(ios){btn.hidden=false;txt.innerHTML="Sur iPhone : appuie sur <b>Partager</b> ⬆️ en bas de Safari, puis <b>« Sur l'écran d'accueil »</b>.";go.textContent='OK, compris';
    if(!seen())setTimeout(open,9000)}
  btn.onclick=e=>{e.preventDefault();open()};
  go.onclick=async()=>{if(deferred){deferred.prompt();const r=await deferred.userChoice;deferred=null;if(r.outcome==='accepted'){btn.hidden=true;try{window.fbq&&fbq('trackCustom','InstallApp')}catch(e){}}}close()};
})();

// Notifications push (OneSignal) + choix de la classe
(()=>{
  const boxes=document.querySelectorAll('.notif');if(!boxes.length)return;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  const d=new Date(),y=d.getFullYear(),ANNEE=d.getMonth()>=8?y+'-'+(y+1):(y-1)+'-'+y;
  const sub=()=>{try{return window.__os&&window.__os.User.PushSubscription.optedIn}catch(e){return false}};
  const refresh=()=>boxes.forEach(b=>{if(sub()){b.querySelector('.notif-go').textContent='✅ Notifications activées';b.querySelector('.notif-msg').textContent='Tu peux changer de classe à tout moment.'}});
  document.addEventListener('os-ready',async()=>{refresh();try{if(sub()){const t=window.__os.User.getTags()||{};if(!t.annee&&t.classe)await window.__os.User.addTags({annee:ANNEE})}}catch(e){}});
  boxes.forEach(b=>{
    let cls=b.dataset.cls||'';
    b.querySelectorAll('.chips button').forEach(c=>c.onclick=()=>{cls=c.dataset.v;b.querySelectorAll('.chips button').forEach(x=>x.classList.toggle('on',x===c));if(sub())save()});
    const msg=b.querySelector('.notif-msg');
    const save=async()=>{try{await window.__os.User.addTags({classe:cls||'tous',annee:ANNEE});msg.textContent='✅ Classe enregistrée : '+(b.querySelector('.chips .on')?.textContent||'toutes')}catch(e){}};
    b.querySelector('.notif-go').onclick=async()=>{
      if(!cls){msg.textContent='👆 Choisis d\'abord ta classe.';return}
      if(ios&&!standalone){msg.innerHTML='Sur iPhone : appuie sur <b>Partager ⬆️</b> puis <b>« Sur l\'écran d\'accueil »</b>, ouvre l\'app Sahalha et reviens ici.';return}
      if(!window.__os){msg.textContent='Un instant… réessaie dans 2 secondes.';return}
      try{await window.__os.Notifications.requestPermission();
        if(sub()){await save();refresh();try{window.fbq&&fbq('track','Subscribe');window.ttq&&ttq.track('Subscribe')}catch(e){}}
        else msg.textContent='Notifications refusées. Tu peux les autoriser dans les réglages du navigateur (🔒 à côté de l\'adresse).'}
      catch(e){msg.textContent='Ton navigateur ne supporte pas les notifications.'}
    };
  });
})();

(function(){document.querySelectorAll('.fb').forEach(function(fb){
var D=JSON.parse(fb.dataset.book),book=fb.querySelector('.fb-book'),lb=document.querySelector('.lb'),lbi=lb&&lb.querySelector('img');
var mobile=matchMedia('(max-width:720px)').matches;
var pages=D.ok.map(function(u){return{src:u}}).concat(D.lock.map(function(u){return{src:u,lock:1}})).concat([{end:1}]);
function face(p,cls){var f=document.createElement('div');f.className='face '+cls;if(!p){f.classList.add('blank');return f}
 if(p.end){f.classList.add('end');f.innerHTML='<div class="big">🔓</div><h3>Tu as vu '+(D.total?Math.max(1,Math.round(D.ok.length*100/D.total)):5)+'% du livre</h3><p>Débloque les '+(D.total||'')+' pages : tout le cours, toutes les séries et leurs corrections.</p><a class="btn btn-main" href="'+D.shop+'" target="_blank" rel="noopener">Débloquer le livre</a>';return f}
 var i=new Image();i.src=p.src;i.loading='lazy';i.alt='Aperçu du livre '+D.name;f.appendChild(i);if(p.lock)f.classList.add('lock');f._p=p;return f}
var leaves=[],step=mobile?1:2;
for(var k=0;k*step<pages.length;k++){var l=document.createElement('div');l.className='leaf';
 l.appendChild(face(pages[k*step],'front'));l.appendChild(face(mobile?null:(k===0?null:pages[k*step+1]),'back'));
 leaves.push(l);book.appendChild(l)}
// desktop: leaf 0 = couverture seule (dos vide), puis pages par paires
if(!mobile){book.innerHTML='';leaves=[];var seq=[pages[0]];var rest=pages.slice(1);
 var l0=document.createElement('div');l0.className='leaf';l0.appendChild(face(pages[0],'front'));l0.appendChild(face(rest[0],'back'));leaves.push(l0);
 for(var j=1;j<rest.length;j+=2){var l=document.createElement('div');l.className='leaf';l.appendChild(face(rest[j],'front'));l.appendChild(face(rest[j+1],'back'));leaves.push(l)}
 leaves.forEach(function(l){book.appendChild(l)})}
var cur=0,n=leaves.length;var MAX=mobile?n-1:n;leaves.forEach(function(l,i){if(!mobile&&l.querySelector('.front.end'))MAX=i});
function seen(){return mobile?cur+1:(cur===0?1:Math.min(pages.length,cur*2+1))}
function render(){leaves.forEach(function(l,i){var t=i<cur;l.classList.toggle('turned',t);l.style.zIndex=t?i+1:n-i});
 book.classList.toggle('closed',!mobile&&cur===0);
 var pg=Math.min(seen(),D.ok.length+D.lock.length);var real=pg;
 fb.querySelector('.fb-count').textContent=cur>=MAX?'Fin de l’aperçu gratuit':'Page '+real+(D.total?' / '+D.total:'')+' · aperçu gratuit';
 if(D.total){fb.querySelector('.fb-free').style.width=(D.ok.length*100/D.total)+'%';fb.querySelector('.fb-pos').style.width=(Math.min(real,D.ok.length)*100/D.total)+'%'}
 fb.querySelector('.fb-prev').disabled=cur===0;fb.querySelector('.fb-next').disabled=cur>=MAX}
function go(d){cur=Math.max(0,Math.min(MAX,cur+d));render();fb.querySelector('.fb-hint').style.display='none'}
fb.querySelector('.fb-next').onclick=function(){go(1)};fb.querySelector('.fb-prev').onclick=function(){go(-1)};
leaves.forEach(function(l,i){l.addEventListener('click',function(e){if(e.target.closest('a'))return;go(i<cur?-1:1)})});
var x0=null;book.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
book.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(dx<0?1:-1);x0=null});
fb.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)});fb.tabIndex=0;
fb.querySelector('.fb-zoom').onclick=function(){var l=leaves[Math.min(cur,n-1)];var f=(!mobile&&cur>0&&leaves[cur-1])?leaves[cur-1].querySelector('.back'):l.querySelector('.front');
 if(!mobile&&cur<n&&leaves[cur]&&leaves[cur].querySelector('.front')._p&&!leaves[cur].querySelector('.front')._p.lock)f=leaves[cur].querySelector('.front');
 if(!f||!f._p||f._p.lock){location.href=D.shop;return}lbi.src=f._p.src;lb.hidden=false};
if(lb&&!lb._b){lb._b=1;lb.addEventListener('click',function(){lb.hidden=true});document.addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true})}
if('IntersectionObserver'in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){fb.classList.add('fb-peek');io.disconnect()}},{threshold:.5});io.observe(fb)}
render();});})();
