// Menu mobile
const nav=document.querySelector('.nav');
document.querySelector('.burger')?.addEventListener('click',()=>{const o=nav.classList.toggle('open');document.querySelector('.burger').setAttribute('aria-expanded',o)});
document.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

// Apparition au scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Vidéo YouTube chargée au clic (site plus rapide)
document.querySelectorAll('.video button').forEach(b=>b.addEventListener('click',()=>{
  const f=document.createElement('iframe');
  f.src='https://www.youtube-nocookie.com/embed/videoseries?list='+b.dataset.list+'&autoplay=1';
  f.title='Vidéos Sahalha – Algorithme et Python';
  f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;
  b.replaceWith(f);
}));

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
