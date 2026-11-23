#!/usr/bin/env python3
"""Génère le site Sahalha (pages statiques, SEO). Usage : python3 build.py https://USERNAME.github.io"""
import json, sys, os, html, datetime

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://sahalha.github.io").rstrip("/")
OUT = os.path.dirname(os.path.abspath(__file__))
TODAY = datetime.date.today().isoformat()

SHOP = "https://sahalha-teshel.converty.shop"
WA_COMMUNITY = "https://chat.whatsapp.com/HFkKLOljykmEAK5NuE3Ppn"
WA_DIRECT = "https://wa.me/21623235642"
YT = "https://www.youtube.com/@Sahalha_Teshel"
YT_LIST = "UUbSJk9ZAAfwo3VrJnnkOuQg"
TIKTOK = "https://www.tiktok.com/@sahalha.teshal.akram"
FB = "https://www.facebook.com/sahalha.teshal.akram"

# Contenu éditable (admin /admin → content/site.json)
DATA = json.load(open(os.path.join(OUT, "content", "site.json"), encoding="utf-8"))
_S = DATA["settings"]
SHOP, YT, YT_LIST, TIKTOK, FB = _S["shop"], _S["youtube"], _S["youtube_playlist"], _S["tiktok"], _S["facebook"]
WA_DIRECT = "https://wa.me/" + "".join(ch for ch in str(_S["whatsapp"]) if ch.isdigit())
WA_COMM = _S.get("whatsapp_community", "")

# Pixels publicitaires : colle les IDs ici puis relance build.py (vide = pas de pixel)
META_PIXEL_ID = _S.get('meta_pixel','')     # ex. "123456789012345"
TIKTOK_PIXEL_ID = _S.get('tiktok_pixel','')   # ex. "CABCDEF123456789"

def pixels():
    s = ""
    if META_PIXEL_ID:
        s += f"""<script>!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','{META_PIXEL_ID}');fbq('track','PageView');</script>"""
    if TIKTOK_PIXEL_ID:
        s += f"""<script>!function(w,d,t){{w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){{t[e]=function(){{t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){{for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e}};ttq.load=function(e,n){{var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{{}};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{{}};ttq._t[e]=+new Date;ttq._o=ttq._o||{{}};ttq._o[e]=n||{{}};var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)}};ttq.load('{TIKTOK_PIXEL_ID}');ttq.page();}}(window,document,'ttq');</script>"""
    return s

FICHES = DATA["fiches"]
import hashlib
_V = lambda f: hashlib.md5(open(os.path.join(OUT, "assets", f), "rb").read()).hexdigest()[:8]
EXOS = DATA.setdefault("exercices", [])
# Miniature auto : si une fiche n'a pas d'image, on la crée depuis la 1re page du PDF
for _f in FICHES + EXOS:
    if not _f.get("thumb") and _f.get("pdf", "").lower().endswith(".pdf"):
        try:
            import pymupdf
            _src = os.path.join(OUT, _f["pdf"].lstrip("/"))
            _name = os.path.splitext(os.path.basename(_src))[0] + ".png"
            _dst = os.path.join(OUT, "img", "fiches", _name)
            os.makedirs(os.path.dirname(_dst), exist_ok=True)
            pymupdf.open(_src)[0].get_pixmap(dpi=40).save(_dst)
            _f["thumb"] = "/img/fiches/" + _name
            if not _f.get("pages"): _f["pages"] = len(pymupdf.open(_src))
        except Exception as e:
            print("miniature impossible :", _f.get("pdf"), e)
CLASSES = DATA["classes"]

HAT = '<svg viewBox="0 0 64 44" width="26" height="18" aria-hidden="true" fill="#fff"><path d="M2 15 33 3l29 10-31 12z"/><path d="M14 20v10c0 7 34 7 34 0V20l-17 7z"/><path d="M8 17.5 6.5 33" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><rect x="3.5" y="32" width="6" height="7" rx="2"/></svg>'
WA_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.6 5.8 5 2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z"/></svg>'

NOTIF = lambda cls: f'''<div class="notif" data-cls="{cls}"><b>🔔 Reçois une alerte avant chaque live</b><p>Choisis ta classe puis active les notifications : tu seras prévenu(e) des lives, des nouvelles fiches et des promos.</p>
<div class="chips">{"".join(f'<button type="button" data-v="{v}"' + (' class="on"' if v==cls else '') + f'>{n}</button>' for v,n in [("2sc","2ème Sc"),("2info","2ème Info"),("3sc","3ème"),("bac","Bac")])}</div>
<button type="button" class="btn btn-main notif-go">🔔 Activer les notifications</button>{('<a class="btn btn-wa notif-wa" href="' + WA_COMM + '" target="_blank" rel="noopener">💬 Rejoindre la communauté WhatsApp</a>') if WA_COMM else ""}<small class="notif-msg"></small></div>'''

def esc(s): return html.escape(s, quote=True)

def head(title, desc, path, kw, extra_ld):
    url = f"{BASE}/{path}"
    ld = json.dumps(extra_ld, ensure_ascii=False)
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta name="keywords" content="{esc(kw)}">
<meta name="author" content="Akram Taktak – Sahalha">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#c2501f">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_TN">
<meta property="og:site_name" content="Sahalha – تسهال مع أكرم">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}/img/og-sahalha.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%23c2501f'/><g transform='translate(14 24) scale(1.15)' fill='white'><path d='M2 15 33 3l29 10-31 12z'/><path d='M14 20v10c0 7 34 7 34 0V20l-17 7z'/><path d='M8 17.5 6.5 33' stroke='white' stroke-width='2.6'/><rect x='3.5' y='32' width='6' height='7' rx='2'/></g></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Tajawal:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css?v={_V("style.css")}">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Sahalha">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<script type="application/ld+json">{ld}</script>
{pixels()}
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>window.OneSignalDeferred=window.OneSignalDeferred||[];OneSignalDeferred.push(async function(OneSignal){{await OneSignal.init({{appId:"786ddca5-4470-4993-8717-a3594fc52366",safari_web_id:"web.onesignal.auto.5ecc7e9f-2540-4c26-bcd6-80ea5ac40604",serviceWorkerPath:"sw.js",serviceWorkerParam:{{scope:"/"}}}});window.__os=OneSignal;document.dispatchEvent(new Event("os-ready"));}});</script>
</head>
<body>
<a class="skip" href="#main">Aller au contenu</a>"""

def nav(active):
    items = [("", "Accueil")] + [(c["slug"] + "/", c["short"]) for c in CLASSES]
    links = "".join(f'<a href="/{p}"{" aria-current=page" if p==active else ""}>{n}</a>' for p, n in items)
    return f"""<header class="nav"><div class="wrap">
<a class="brand" href="/" aria-label="Sahalha – accueil"><span class="logo"><svg viewBox="0 0 64 44" width="24" height="17" aria-hidden="true" fill="#fff"><path d="M2 15 33 3l29 10-31 12z"/><path d="M14 20v10c0 7 34 7 34 0V20l-17 7z"/><path d="M8 17.5 6.5 33" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><rect x="3.5" y="32" width="6" height="7" rx="2"/></svg></span><span>Sahalha<small class="ar">تسهال مع أكرم</small></span></a>
<nav class="links" aria-label="Menu">{links}<a class="install" href="#" hidden>📲 Installer l'app</a><a class="cta" href="{SHOP}" target="_blank" rel="noopener">🛒 Boutique</a></nav>
<button class="burger" aria-label="Ouvrir le menu" aria-expanded="false"><span></span></button>
</div></header>"""

def footer():
    cls = "".join(f'<a href="/{c["slug"]}/">Algorithme & Python {c["short"]}</a>' for c in CLASSES)
    return f"""<footer><div class="wrap"><div class="cols">
<div><h4>Sahalha <span class="ar">تسهال مع أكرم</span></h4><p>Algorithmique et programmation Python expliquées en tunisien, de la 2ème année secondaire jusqu'au Bac. Cours, fiches PDF gratuites, exercices et sujets Bac corrigés.</p></div>
<div><h4>Les classes</h4>{cls}</div>
<div><h4>Suivre Sahalha</h4><a href="{YT}" target="_blank" rel="noopener">YouTube</a><a href="{TIKTOK}" target="_blank" rel="noopener">TikTok</a><a href="{FB}" target="_blank" rel="noopener">Facebook</a><a href="{WA_DIRECT}" target="_blank" rel="noopener">WhatsApp : 23 235 642</a><a href="{SHOP}" target="_blank" rel="noopener">Boutique (livres)</a></div>
</div><div class="copy">© {datetime.date.today().year} Sahalha · Akram Taktak · Algorithme, Python, informatique – Tunisie</div></div></footer>
<div class="sheet" id="sheet" hidden><div class="sheet-in"><button class="x" aria-label="Fermer">×</button><div class="logo big">{HAT}</div><b>Installe l'app Sahalha</b><p id="sheet-txt"></p><button class="btn btn-main" id="sheet-go">📲 Installer</button></div></div>
<a class="fab" href="{WA_DIRECT}" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp">{WA_SVG}</a>
<script src="/assets/app.js?v={_V("app.js")}" defer></script>
</body></html>"""

def fiche_cards(items):
    out = []
    for i, f in enumerate(items):
        t, pdf, thumb, pages = f["title"], f["pdf"], f.get("thumb") or "", f.get("pages") or ""
        img = f'<img src="{esc(thumb)}" alt="{esc(t)} – PDF gratuit Sahalha" loading="lazy" width="331" height="468">' if thumb else ""
        pg = f" · {pages} pages" if pages else ""
        out.append(f'<a class="fiche reveal d{i%4}" href="{esc(pdf)}" target="_blank" rel="noopener" download>'
                   f'<div class="th">{img}</div><div class="meta"><b>{esc(t)}</b><span>⬇ PDF gratuit{pg}</span></div></a>')
    return "".join(out)

def exo_cards(items):
    out = []
    for i, f in enumerate(items):
        t, pdf, thumb, pages = f["title"], f["pdf"], f.get("thumb") or "", f.get("pages") or ""
        img = f'<img src="{esc(thumb)}" alt="{esc(t)} – exercices gratuits Sahalha" loading="lazy" width="331" height="468">' if thumb else ""
        pg = f" · {pages} pages" if pages else ""
        corr = f'<a class="corr" href="{esc(f["correction"])}" target="_blank" rel="noopener" download>✅ Voir la correction</a>' if f.get("correction") else ""
        out.append(f'<div class="fiche exo reveal d{i%4}"><a href="{esc(pdf)}" target="_blank" rel="noopener" download>'
                   f'<div class="th">{img}</div><div class="meta"><b>{esc(t)}</b><span>✏️ Exercices gratuits{pg}</span></div></a>{corr}</div>')
    return "".join(out)

def exo_section(items, title, bg=""):
    if not items: return ""
    return (f'<section id="exercices"{bg}><div class="wrap"><div class="reveal"><span class="eyebrow">Gratuit</span><h2>{title}</h2>'
            f'<p class="sub">Entraîne-toi, puis vérifie avec la correction.</p></div><div class="fiches">{exo_cards(items)}</div></div></section>')

def apercu_block(c):
    ok, flou = c.get("apercu") or [], c.get("apercu_flou") or []
    if not ok: return ""
    data = json.dumps({"ok": ok, "lock": [_blur(u) for u in flou], "total": c.get("pages_livre") or 0,
                       "shop": c["shop"], "name": c["short"]}, ensure_ascii=False)
    return (f'<section id="apercu" class="apercu-sec"><div class="wrap"><div class="center reveal"><span class="eyebrow">Aperçu gratuit</span><h2>Feuillette le livre</h2>'
            f'<p class="sub">Tourne les pages comme un vrai livre : le menu, le cours, une série et sa correction.</p></div>'
            f'<div class="fb reveal" data-book="{esc(data)}"><div class="fb-stage"><div class="fb-book"></div></div>'
            f'<div class="fb-bar"><button class="fb-prev" aria-label="Page précédente">‹</button><div class="fb-info"><span class="fb-count"></span><div class="fb-prog"><i class="fb-free"></i><i class="fb-pos"></i></div></div><button class="fb-zoom" aria-label="Agrandir">🔍</button><button class="fb-next" aria-label="Page suivante">›</button></div>'
            f'<p class="fb-hint">👆 Clique sur une page pour la lire en grand · ‹ › ou glisse pour tourner</p></div></div></section>'
            '<div class="lb" hidden><button aria-label="Fermer">✕</button><img alt="Page du livre"></div>')

def _blur(u):
    """Les pages verrouillées sont floutées ici : seule la version floue est publiée sur la page."""
    if os.path.basename(u).startswith("flou-"): return u
    src = os.path.join(OUT, u.lstrip("/")); dst_name = "flou-" + os.path.splitext(os.path.basename(u))[0] + ".webp"
    dst = os.path.join(OUT, "img", "apercu", dst_name)
    if not os.path.exists(dst):
        try:
            from PIL import Image, ImageFilter
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            im = Image.open(src).convert("RGB"); w = 60
            im.resize((w, int(w * im.height / im.width))).resize((420, int(420 * im.height / im.width))).filter(ImageFilter.GaussianBlur(6)).save(dst, "WEBP", quality=50)
        except Exception as e:
            print("flou impossible :", u, e); return u
    return "/img/apercu/" + dst_name

def video_block():
    return (f'<div class="video-wrap reveal"><div class="video"><button data-list="{YT_LIST}" aria-label="Lancer les vidéos Sahalha"><div><div class="play"></div>Voir les vidéos Sahalha</div></button></div>'
            f'<a class="yt-out" href="{YT}/videos" target="_blank" rel="noopener">▶ Regarder sur YouTube</a>'
            f'<p class="inapp-tip" hidden>📱 Tu es dans TikTok / Instagram / Facebook : appuie sur <b>⋯</b> en haut puis <b>« Ouvrir dans le navigateur »</b> pour voir les vidéos ici, ou clique sur « Regarder sur YouTube ».</p></div>')

def faq_block(items):
    return "".join(f'<details class="reveal"><summary>{esc(q)}</summary><p>{esc(a)}</p></details>' for q, a in items)

def faq_ld(items):
    return {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in items]}

HOME_FAQ = [(x["q"], x["a"]) for x in DATA["home_faq"]]

def home():
    cards = "".join(f'''<a class="cls reveal d{i}" href="/{c["slug"]}/"><span class="tag">{c["tag"]}</span><span class="num">{c["num"]}</span><h3>{c["short"]}</h3><p>{esc(c["lead"][:96].rsplit(" ",1)[0])}…</p><span class="go">Commencer <span>→</span></span></a>''' for i, c in enumerate(CLASSES))
    allfiches = [f for f in FICHES if f.get("home")]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "EducationalOrganization", "name": "Sahalha – تسهال مع أكرم", "url": BASE + "/", "logo": BASE + "/img/og-sahalha.jpg",
         "description": "Cours d'algorithmique et de programmation Python pour les élèves tunisiens, de la 2ème année secondaire au Bac.",
         "areaServed": "TN", "founder": {"@type": "Person", "name": "Akram Taktak"}, "sameAs": [YT, TIKTOK, FB]},
        {"@type": "WebSite", "name": "Sahalha", "url": BASE + "/", "inLanguage": "fr-TN"},
        faq_ld(HOME_FAQ)]}
    title = "Sahalha – Algorithme & Programmation Python | Bac Tunisie, 2ème et 3ème"
    desc = "Algorithmique et programmation Python expliquées en tunisien, de la 2ème année secondaire au Bac Tunisie : vidéos, lives, fiches PDF gratuites, exercices et sujets Bac corrigés. تسهال مع أكرم"
    kw = "algorithme, python, programmation, informatique tunisie, bac tunisie, bac informatique, algorithmique bac, cours python tunisie, exercices corrigés algorithme, sujets bac corrigés, 2ème sciences, 3ème sciences, tunisie"
    body = f"""{nav("")}
<main id="main">
<section class="hero"><div class="hero-blob b1"></div><div class="hero-blob b2"></div>
<span class="tok" style="left:6%;top:16%">if</span><span class="tok" style="left:46%;top:80%;animation-delay:-3s">for i in range</span><span class="tok" style="left:30%;top:8%;animation-delay:-6s">Tant que</span><span class="tok" style="left:88%;top:86%;animation-delay:-2s">print(i)</span><span class="tok" style="left:3%;top:88%;animation-delay:-7s">len(ch)</span>
<div class="wrap">
<div class="reveal in">
<span class="pill"><i></i> Programme officiel tunisien · 2ème → Bac</span>
<h1>Algorithme &amp; <em>Python</em>,<br>expliqués en tunisien</h1>
<p class="lead">Cours, fiches PDF gratuites, exercices et sujets Bac corrigés pour réussir l'informatique au lycée en Tunisie.</p>
<span class="ar">من الصفر حتى للباك · تسهال مع أكرم 💯</span>
<div class="btns"><a class="btn btn-main" href="#classes">Choisir ma classe →</a><a class="btn btn-ghost" href="#fiches">Fiches PDF gratuites</a></div>
</div>
<div class="reveal in d2"><div class="code" aria-hidden="true"><div class="bar"><span></span><span></span><span></span><div class="tabs"><b class="on">ALGORITHME</b><b>PYTHON</b></div></div><pre id="code"></pre><div class="out" id="out"></div></div></div>
</div></section>

<section id="classes"><div class="wrap">
<div class="center reveal"><span class="eyebrow">Ta classe</span><h2>Choisis ton niveau</h2><p class="sub">Chaque espace regroupe les vidéos, les lives, les fiches PDF et le livre adaptés à ta classe.</p></div>
<div class="classes">{cards}</div>
</div></section>

<section style="padding-top:0"><div class="wrap"><div class="feats">
<div class="feat reveal"><div class="ic">🎥</div><h3>Vidéos en tunisien</h3><p>Chaque notion expliquée simplement, avec des exemples et des astuces.</p></div>
<div class="feat reveal d1"><div class="ic">🔴</div><h3>Lives & replays</h3><p>Questions/réponses en direct sur YouTube, et le replay reste disponible.</p></div>
<div class="feat reveal d2"><div class="ic">📄</div><h3>Fiches PDF gratuites</h3><p>Résumé du cours + « À retenir » en algorithme et en Python.</p></div>
<div class="feat reveal d3"><div class="ic">📚</div><h3>Livres corrigés</h3><p>Séries d'exercices, corrections détaillées et sujets Bac.</p></div>
</div></div></section>

<section style="background:var(--cream2)"><div class="wrap split">
<div class="reveal"><span class="eyebrow">Les vidéos</span><h2>Apprends à ton rythme, gratuitement</h2><p class="sub">Les dernières vidéos de la chaîne YouTube Sahalha : algorithmique, Python, pièges classiques du Bac… <span class="ar">شوف وافهم على روحك</span></p><a class="btn btn-dark" href="{YT}" target="_blank" rel="noopener">▶ S'abonner à la chaîne</a></div>
{video_block()}
</div></section>

<section id="fiches"><div class="wrap">
<div class="reveal"><span class="eyebrow">Gratuit</span><h2>Fiches de révision PDF</h2><p class="sub">Télécharge les fiches Sahalha : l'essentiel du cours, en algorithme et en Python, sur 2 à 4 pages.</p></div>
<div class="fiches">{fiche_cards(allfiches)}</div>
<p style="margin-top:22px"><a class="btn btn-light" href="/bac-algorithme-python-tunisie/#fiches">Voir toutes les fiches →</a></p>
</div></section>

<section><div class="wrap"><div class="live reveal">
<span class="dot"><i></i> Lives</span><h2>Ne rate aucun live</h2><p class="sub">Les lives se font sur la chaîne YouTube Sahalha, et le replay reste disponible. Une question sur un exercice, un live ou un livre ? Écris-moi directement sur WhatsApp. <span class="ar">عندك سؤال؟ ابعثلي على الواتساب 👇</span></p>
<div class="btns"><a class="btn btn-wa" href="{WA_DIRECT}" target="_blank" rel="noopener">{WA_SVG.replace('<svg','<svg width=22 height=22 style="fill:#fff"')} Écris-moi sur WhatsApp</a><a class="btn btn-ghost" href="{YT}" target="_blank" rel="noopener">Chaîne YouTube</a></div>
{NOTIF('')}
</div></div></section>

<section style="padding-top:0"><div class="wrap split">
<img class="banner-img reveal" src="/img/sahalha-algorithme-python-tunisie.webp" alt="Sahalha : de la confusion au Bac – cours, exercices et corrigés d'algorithme et Python en Tunisie" width="1400" height="787" loading="lazy">
<div class="reveal d1"><span class="eyebrow">Pourquoi Sahalha</span><h2>Du « ma fhemt chay » au Bac</h2><ul class="checks"><li>Algorithme et Python côte à côte, comme au Bac</li><li>Les termes exacts du programme officiel tunisien</li><li>Tableaux de déroulement pour comprendre chaque boucle</li><li>Des exercices progressifs, du plus simple aux sujets Bac</li></ul><a class="btn btn-main" href="{SHOP}" target="_blank" rel="noopener">🛒 Découvrir les livres</a></div>
</div></section>

<section class="faq"><div class="wrap" style="max-width:820px">
<div class="center reveal"><span class="eyebrow">Questions</span><h2>Questions fréquentes</h2></div>
{faq_block(HOME_FAQ)}
<h2 style="font-size:22px;margin-top:40px" class="reveal">Algorithme et programmation Python en Tunisie</h2>
<p class="reveal" style="color:var(--muted)">Sahalha aide les élèves tunisiens à comprendre l'algorithmique et la programmation Python, de la 2ème année secondaire jusqu'au Bac : 2ème Sciences, 2ème Informatique, 3ème Sciences et Bac Tunisie (Mathématiques, Sciences expérimentales, Technique). Au programme : structures de données, structures conditionnelles, boucles Pour / Répéter / Tant que, tableaux, chaînes, sous-programmes, algorithmes de recherche et de tri (tri à bulles, tri par sélection, tri par insertion) et préparation au Bac pratique avec Python et Qt Designer.</p>
</div></section>
</main>"""
    return head(title, desc, "", kw, ld) + body + footer()

def class_page(c):
    faq = [
     (f"Les fiches PDF {c['short']} sont-elles gratuites ?", "Oui, toutes les fiches de cette page se téléchargent gratuitement en PDF."),
     (f"Le livre {c['short']} suit-il le programme officiel ?", "Oui : il suit le programme tunisien d'Algorithmique et Programmation, avec le cours, les séries d'exercices et les corrections en algorithme et en Python."),
     ("Comment être informé des lives ?", "Abonne-toi à la chaîne YouTube et active la cloche 🔔. Pour toute question, écris-moi sur WhatsApp (23 235 642)."),
    ]
    url = f"{BASE}/{c['slug']}/"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Course", "name": f"Algorithme et programmation Python – {c['short']}", "description": c["desc"], "inLanguage": "fr-TN",
         "educationalLevel": c["short"], "url": url,
         "provider": {"@type": "EducationalOrganization", "name": "Sahalha", "url": BASE + "/"},
         "hasCourseInstance": {"@type": "CourseInstance", "courseMode": "online", "courseWorkload": "PT1H"},
         "offers": {"@type": "Offer", "price": "0", "priceCurrency": "TND", "category": "Free"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": BASE + "/"},
            {"@type": "ListItem", "position": 2, "name": c["short"], "item": url}]},
        faq_ld(faq)]}
    chips = "".join(f"<span>{esc(x)}</span>" for x in c["chaps"])
    pts = "".join(f"<li>{esc(x)}</li>" for x in c["bookpts"])
    body = f"""{nav(c['slug'] + '/')}
<main id="main">
<section class="hero phero"><div class="hero-blob b1"></div><div class="hero-blob b2"></div>
<span class="tok" style="left:8%;top:20%">Si … Sinon</span><span class="tok" style="left:52%;top:82%;animation-delay:-4s">def f(x):</span><span class="tok" style="left:40%;top:10%;animation-delay:-2s">Pour i de 1 à n</span>
<div class="wrap">
<div class="reveal in"><div class="crumbs"><a href="/">Accueil</a> › {c['short']}</div>
<h1>{c['h1']}</h1><p class="lead">{esc(c['lead'])}</p><span class="ar">مرحبا بيك، هنا تلقى كل شي باش تفهم وتنجح 💯</span>
<div class="btns"><a class="btn btn-main" href="#livre">📚 Le livre</a><a class="btn btn-ghost btn-sm" href="#fiches">📄 Fiches PDF gratuites</a></div></div>
<div class="reveal in d2"><a href="#apercu" class="open-book" aria-label="Feuilleter le livre"><img class="cover" src="{c['cover']}" alt="{esc(c['book'])} – Sahalha, Tunisie" width="900" height="1200"></a></div>
</div></section>

<section><div class="wrap split">
<div class="reveal"><span class="eyebrow">Vidéos</span><h2>Comprends en vidéo</h2><p class="sub">Les vidéos Sahalha expliquent chaque notion en tunisien, en algorithme puis en Python.</p><a class="btn btn-dark" href="{YT}" target="_blank" rel="noopener">▶ Chaîne YouTube</a></div>
{video_block()}
</div></section>

<section id="fiches" style="background:var(--cream2)"><div class="wrap">
<div class="reveal"><span class="eyebrow">Gratuit</span><h2>Fiches PDF – {c['short']}</h2><p class="sub">Clique pour ouvrir ou télécharger. Chaque fiche résume le cours avec les points « À retenir ».</p></div>
<div class="fiches">{fiche_cards([f for f in FICHES if c['notif'] in (f.get('classes') or [])])}</div>
</div></section>
{exo_section([f for f in EXOS if c['notif'] in (f.get('classes') or [])], "Exercices gratuits – " + c['short'])}

<section><div class="wrap"><div class="live reveal">
<span class="dot"><i></i> Lives {c['short']}</span><h2>Lives et replays</h2><p class="sub">Les lives se font sur YouTube, avec questions/réponses. Chaque live reste enregistré : si tu le rates, tu le revois quand tu veux. Une question ? Écris-moi sur WhatsApp. <span class="ar">عندك سؤال؟ ابعثلي على الواتساب 👇</span></p>
<div class="btns"><a class="btn btn-wa" href="{WA_DIRECT}" target="_blank" rel="noopener">{WA_SVG.replace('<svg','<svg width=22 height=22 style="fill:#fff"')} Écris-moi sur WhatsApp</a></div>
{NOTIF(c['notif'])}
</div></div></section>

<section id="livre"><div class="wrap"><div class="book reveal">
<img src="{c['cover']}" alt="Couverture – {esc(c['book'])}" width="900" height="1200" loading="lazy">
<div><span class="eyebrow">Le livre</span><h2>{esc(c['book'])}</h2><ul class="checks">{pts}</ul>
<div class="btns"><a class="btn btn-main" href="{c['shop']}" target="_blank" rel="noopener">🛒 Commander le livre</a><a class="btn btn-sm btn-fiches" href="#fiches">📄 Fiches gratuites</a>{'<a class="btn btn-book open-book" href="#apercu">📖 Feuilleter le livre</a>' if c.get('apercu') else ''}<a class="btn btn-light" href="{WA_DIRECT}" target="_blank" rel="noopener">Une question ?</a></div></div>
</div></div></section>

{apercu_block(c)}
<section style="padding-top:0"><div class="wrap"><div class="reveal"><span class="eyebrow">Programme</span><h2>Les chapitres</h2></div><div class="chaps reveal">{chips}</div></div></section>

<section class="faq" style="padding-top:0"><div class="wrap" style="max-width:820px"><div class="reveal"><h2>Questions fréquentes</h2></div>{faq_block(faq)}</div></section>
</main>"""
    return head(c["title"], c["desc"], c["slug"] + "/", c["kw"] + ", algorithme, python, programmation, informatique tunisie, bac tunisie", ld) + body + footer()

def write(path, s):
    p = os.path.join(OUT, path); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(s)

write("index.html", home())
for c in CLASSES: write(c["slug"] + "/index.html", class_page(c))
urls = [BASE + "/"] + [f"{BASE}/{c['slug']}/" for c in CLASSES]
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "".join(f"  <url><loc>{u}</loc><lastmod>{TODAY}</lastmod><priority>{'1.0' if u.endswith(BASE+'/') else '0.8'}</priority></url>\n" for u in urls) + "</urlset>\n")
write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: {BASE}/sitemap.xml\n")
write("404.html", head("Page introuvable | Sahalha", "Page introuvable", "404.html", "sahalha", {"@context":"https://schema.org","@type":"WebPage","name":"404"}) + nav("") + '<main id="main"><section class="hero phero"><div class="wrap" style="display:block"><h1>Oups, page introuvable</h1><p class="lead">Retourne à l\'accueil pour choisir ta classe.</p><div class="btns"><a class="btn btn-main" href="/">← Accueil</a></div></div></section></main>' + footer())
write(".nojekyll", "")
print("OK", BASE)
