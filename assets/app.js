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
  const android=/android/i.test(navigator.userAgent),inapp=/FBAN|FBAV|FB_IAB|Instagram|Messenger|TikTok|BytedanceWebview|musical_ly|; wv\)/i.test(navigator.userAgent);
  if(android&&!inapp){btn.hidden=false;if(!deferred){txt.innerHTML="Pour installer Sahalha : appuie sur <strong>⋮</strong> en haut à droite de Chrome, puis <strong>« Installer l'application »</strong> (ou « Ajouter à l'écran d'accueil »).";go.textContent='OK, compris'}}
  btn.onclick=e=>{e.preventDefault();if(deferred){go.textContent='📲 Installer';txt.textContent="Ajoute Sahalha sur ton écran d'accueil : accès direct aux vidéos, fiches et lives, comme une vraie application."}open()};
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
    const go=b.querySelector('.notif-go');
    const ua=navigator.userAgent,android=/android/i.test(ua);
    const inapp=/BytedanceWebview|musical_ly|TikTok|trill|Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|Snapchat|Line\//i.test(ua)||(android&&/; wv\)/.test(ua));
    const yt=(document.querySelector('a[href*="youtube.com/@"],a[href*="youtube.com/c"]')||{}).href||'https://www.youtube.com';
    const alt='<br><small>Ou abonne-toi à la chaîne <a href="'+yt+'" target="_blank" rel="noopener"><b>YouTube</b></a> et appuie sur 🔔 : tu seras aussi prévenu(e) des lives.</small>';
    const wa=b.querySelector('.notif-wa');
    if(wa&&ios&&!standalone){go.style.display='none';wa.classList.add('main');msg.innerHTML='Sur iPhone, le plus simple : rejoins la communauté WhatsApp, tu recevras les alertes des lives et des nouvelles fiches.'}
    if(wa)wa.addEventListener('click',()=>{try{window.fbq&&fbq('track','Lead');window.ttq&&ttq.track('Contact')}catch(e){}});
    if(inapp){go.textContent=android?'🌐 Ouvrir dans Chrome pour activer':'🌐 Ouvrir dans Safari pour activer'}
    const waitOS=()=>new Promise(r=>{if(window.__os)return r(true);let n=0;const t=setInterval(()=>{if(window.__os||++n>25){clearInterval(t);r(!!window.__os)}},200)});
    go.onclick=async()=>{
      if(!cls){msg.textContent='👆 Choisis d\'abord ta classe.';return}
      if(inapp){
        if(android){const u=new URL(location.href);u.searchParams.set('notif',cls);u.hash='';
          location.href='intent://'+u.host+u.pathname+u.search+'#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='+encodeURIComponent(u.href)+';end';
          msg.innerHTML='Si Chrome ne s\'ouvre pas : appuie sur <b>⋮</b> en haut à droite puis <b>« Ouvrir dans le navigateur »</b>.'+alt;return}
        {const u=new URL(location.href);u.searchParams.set('notif',cls);u.hash='';const link=u.href;
         msg.innerHTML='Messenger/Instagram bloquent les notifications. Ouvre le site dans <b>Safari</b> :<ol><li>Appuie sur <b>•••</b> ou <b>⬆️</b> → <b>« Ouvrir dans Safari »</b></li><li>Sinon, copie le lien et colle-le dans Safari 👇</li></ol><button type="button" class="copy-link">📋 Copier le lien</button>'+alt;
         msg.querySelector('.copy-link').onclick=async e=>{try{await navigator.clipboard.writeText(link)}catch(_){const t=document.createElement('textarea');t.value=link;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}e.target.textContent='✅ Lien copié — colle-le dans Safari'}}
        return}
      if(ios&&!standalone){
        msg.innerHTML='Sur iPhone, Apple demande d\'ajouter Sahalha à l\'écran d\'accueil (une seule fois) :<ol><li>Appuie sur <b>Partager ⬆️</b> en bas de Safari</li><li>Choisis <b>« Sur l\'écran d\'accueil » ➕</b></li><li>Ouvre l\'icône <b>Sahalha</b> et appuie sur ce bouton</li></ol>'+alt;return}
      if(!('Notification' in window)||!('serviceWorker' in navigator)){msg.innerHTML='Ce navigateur ne gère pas les notifications. Ouvre le site dans <b>Chrome</b>.'+alt;return}
      go.disabled=true;msg.textContent='⏳ Un instant…';
      const ok=await waitOS();go.disabled=false;
      if(!ok){msg.innerHTML='Connexion lente : réessaie dans quelques secondes.'+alt;return}
      try{await window.__os.Notifications.requestPermission();
        if(sub()){await save();refresh();try{window.fbq&&fbq('track','Subscribe');window.ttq&&ttq.track('Subscribe')}catch(e){}}
        else msg.innerHTML='Notifications refusées. Pour les autoriser : 🔒 à côté de l\'adresse → <b>Autorisations</b> → <b>Notifications</b>.'+alt}
      catch(e){msg.innerHTML='Ton navigateur ne supporte pas les notifications.'+alt}
    };
    // arrivée depuis Messenger/Facebook : classe déjà choisie
    const q=new URLSearchParams(location.search).get('notif');
    if(q&&!inapp){const c=b.querySelector('.chips button[data-v="'+q+'"]');if(c){c.click();setTimeout(()=>{b.scrollIntoView({behavior:'smooth',block:'center'});msg.textContent='👉 Appuie maintenant sur « Activer les notifications ».'},600)}}
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
var vis=D.ok.slice(),zi=0;
function show(i){zi=(i+vis.length)%vis.length;lbi.src=vis[zi];lb.querySelector('.lb-c').textContent='Page '+(zi+1)+' / '+vis.length+' de l’aperçu';lb.hidden=false;lb.scrollTop=0}
if(!lb.querySelector('.lb-p')){lb.insertAdjacentHTML('beforeend','<span class="lb-c"></span><button class="lb-nav lb-p" aria-label="Précédente">‹</button><button class="lb-nav lb-n" aria-label="Suivante">›</button>');}
lb.querySelector('.lb-p').onclick=function(e){e.stopPropagation();show(zi-1)};lb.querySelector('.lb-n').onclick=function(e){e.stopPropagation();show(zi+1)};
lbi.onclick=function(e){e.stopPropagation()};
leaves.forEach(function(l){l.querySelectorAll('.face').forEach(function(f){f.addEventListener('click',function(e){if(e.target.closest('a'))return;e.stopPropagation();
 if(f._p&&f._p.lock){window.open(D.shop,'_blank');return}if(f._p&&f._p.src){show(vis.indexOf(f._p.src));return}})})});
var x0=null;book.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
book.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(dx<0?1:-1);x0=null});
fb.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)});fb.tabIndex=0;
fb.querySelector('.fb-zoom').onclick=function(){show(Math.min(Math.max(seen()-1,0),vis.length-1))};
if(lb&&!lb._b){lb._b=1;lb.addEventListener('click',function(){lb.hidden=true});document.addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')lb.hidden=true;})}
if('IntersectionObserver'in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){fb.classList.add('fb-peek');io.disconnect()}},{threshold:.5});io.observe(fb)}
render();
document.querySelectorAll('.open-book').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();fb.closest('section').scrollIntoView({behavior:'smooth'});setTimeout(function(){if(cur===0)go(1)},700)})});
});})();

// Invitation « Ne rate aucun live » : 2 fois max pendant la navigation, plus jamais après inscription
(()=>{
  const wa=document.querySelector('.notif-wa'),box=document.querySelector('.notif');if(!wa||!box)return;
  const ua=navigator.userAgent,ios=/iphone|ipad|ipod/i.test(ua),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  const g=k=>{try{return +localStorage.getItem(k)||0}catch(e){return 99}},s=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
  const views=g('sh-v')+1;s('sh-v',views);
  const shown=g('sh-inv'),done=g('sh-joined');
  wa.addEventListener('click',()=>s('sh-joined',1));
  if(done||shown>=2)return;
  // 1re fois : à la 2e page vue (ou après 25 s sur la 1re) ; 2e fois : au moins 2 pages plus tard
  const last=g('sh-inv-at');
  if(shown===1&&views-last<2)return;
  const delay=(shown===0&&views===1)?25000:9000;
  const subbed=()=>{try{return window.__os&&window.__os.User.PushSubscription.optedIn}catch(e){return false}};
  const canPush=!ios||standalone;
  const open=()=>{
    if(subbed()){s('sh-joined',1);return}
    const other=document.getElementById('sheet');if(other&&!other.hidden){setTimeout(open,8000);return}
    s('sh-inv',shown+1);s('sh-inv-at',views);
    const el=document.createElement('div');el.className='invite';el.innerHTML=
      '<div class="inv-card" role="dialog" aria-label="Ne rate aucun live"><button class="x" aria-label="Fermer">✕</button>'+
      '<div class="inv-ico">🔔</div><b>Ne rate aucun live ni nouvelle fiche</b>'+
      '<p>Rejoins les élèves Sahalha : tu es prévenu(e) avant chaque live, gratuitement.</p>'+
      '<a class="btn inv-wa" href="'+wa.href+'" target="_blank" rel="noopener">💬 Rejoindre la communauté WhatsApp</a>'+
      (document.getElementById('fiches')?'<a class="inv-fiches" href="#fiches">📄 Voir les fiches PDF gratuites</a>':'')+
      (canPush?'<button class="btn inv-push">🔔 Activer les notifications</button>':'')+
      '<button class="inv-later">Plus tard</button></div>';
    document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
    const close=()=>{el.classList.remove('on');setTimeout(()=>el.remove(),300)};
    el.querySelector('.x').onclick=close;el.querySelector('.inv-later').onclick=close;el.onclick=e=>{if(e.target===el)close()};
    {const f=el.querySelector('.inv-fiches');if(f)f.onclick=()=>close()}
    el.querySelector('.inv-wa').onclick=()=>{s('sh-joined',1);try{window.fbq&&fbq('track','Lead');window.ttq&&ttq.track('Contact')}catch(e){}close()};
    const p=el.querySelector('.inv-push');if(p)p.onclick=()=>{close();box.scrollIntoView({behavior:'smooth',block:'center'});box.classList.add('pulse');setTimeout(()=>box.classList.remove('pulse'),2400);
      if(box.querySelector('.chips .on'))setTimeout(()=>box.querySelector('.notif-go').click(),700);
      else box.querySelector('.notif-msg').textContent='👆 Choisis ta classe puis appuie sur « Activer ».'};
    try{window.fbq&&fbq('trackCustom','InviteShown')}catch(e){}
  };
  setTimeout(open,delay);
})();
