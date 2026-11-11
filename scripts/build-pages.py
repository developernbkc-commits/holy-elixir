"""Generate the prebuilt static site. No template engine or runtime dependency required."""
from pathlib import Path
from html import escape
import argparse
import json
import re
import shutil

PROJECT = Path(__file__).resolve().parent.parent
SOURCE = PROJECT / 'holy-elixir'
DIWALI_LIVE = False
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--diwali-preview', action='store_true', help='Build a separate Diwali preview in qa/diwali-preview.')
parser.add_argument('--poster', type=Path, help='Optional JPG, PNG or WebP poster for the Diwali preview.')
parser.add_argument('--poster-alt', help='Text alternative for the supplied poster.')
args = parser.parse_args()
if (args.poster or args.poster_alt) and not args.diwali_preview:
    parser.error('Poster options require --diwali-preview.')
if args.poster and (not args.poster.is_file() or args.poster.suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp'} or not (args.poster_alt or '').strip()):
    parser.error('Supply an existing JPG, PNG or WebP poster and a nonempty --poster-alt.')
if args.poster_alt and not args.poster:
    parser.error('--poster-alt requires --poster.')

ROOT = PROJECT / 'qa' / 'diwali-preview' if args.diwali_preview else SOURCE
seasonal = DIWALI_LIVE or args.diwali_preview
poster_url = None
if args.diwali_preview:
    shutil.copytree(SOURCE, ROOT, dirs_exist_ok=True, ignore=shutil.ignore_patterns('*.html', 'sitemap.xml'))
    (ROOT / 'robots.txt').write_text('User-agent: *\nDisallow: /\n', encoding='utf-8')
    if args.poster:
        poster_url = f'assets/images/campaign/diwali-poster{args.poster.suffix.lower()}'
        if args.poster.resolve() != (ROOT / poster_url).resolve():
            shutil.copyfile(args.poster, ROOT / poster_url)
if seasonal:
    shutil.copyfile(PROJECT / 'styles' / 'diwali.css', ROOT / 'diwali.css')
else:
    shutil.copyfile(PROJECT / 'styles' / 'product-hero.css', ROOT / 'product-hero.css')

# Keep prior builds from leaving the retired product page in the publish directory.
for retired in ('alkaline-water.html', 'ionizers.html'):
    (ROOT / retired).unlink(missing_ok=True)

PAGES = {}

def image(name, alt, cls='', eager=False, campaign=True, full=False):
    folder='campaign' if campaign else 'lifestyle-v2'
    width = 1440
    sizes = '100vw' if full else '(max-width: 760px) 100vw, 50vw'
    height = 960
    return f'<img class="{cls}" src="assets/images/{folder}/{name}-1440.webp" srcset="assets/images/{folder}/{name}-640.webp 640w, assets/images/{folder}/{name}-1440.webp {width}w" sizes="{sizes}" alt="{escape(alt)}" width="{width}" height="{height}" loading="{"eager" if eager else "lazy"}" decoding="async" {"fetchpriority=high" if eager else ""}>'

def link(href, text, secondary=False):
    return f'<a class="button {"button--line" if secondary else ""}" href="{href}">{text}<span aria-hidden="true">↗</span></a>'

def intro(kicker,title,body,extra=''):
    return f'<header class="page-intro wrap"><p class="eyebrow">{kicker}</p><h1>{title}</h1><p class="lede">{body}</p>{extra}</header>'

def split(kicker,title,body,img,alt,reverse=False,campaign=True,extra='',dark=False):
    return f'<section class="section {"midnight" if dark else ""}"><div class="wrap split {"split--reverse" if reverse else ""}"><div class="split-art">{image(img,alt,campaign=campaign)}</div><div class="split-copy"><p class="eyebrow">{kicker}</p><h2>{title}</h2>{body}{extra}</div></div></section>'

def cards(items,cls=''):
    articles = []
    for i, (title, body, href, label) in enumerate(items, 1):
        action = f'<a class="arrow-link" href="{escape(href)}">{label} <span aria-hidden="true">→</span></a>' if href else ''
        articles.append(f'<article class="text-card"><span class="card-number">{i:02}</span><h3>{title}</h3><p>{body}</p>{action}</article>')
    return f'<div class="cards {cls}">{"".join(articles)}</div>'

def section(kicker,title,body='',content='',dark=False):
    return f'<section class="section {"midnight" if dark else ""}"><div class="wrap"><div class="section-head"><p class="eyebrow">{kicker}</p><h2>{title}</h2>{f"<p>{body}</p>" if body else ""}</div>{content}</div></section>'

def faq(items):
    return '<div class="faq-list">'+''.join(f'<details><summary>{q}<span aria-hidden="true">+</span></summary><div class="faq-answer">{a}</div></details>' for q,a in items)+'</div>'

def related(items):
    return section('Related information','Continue exploring.',content=cards(items))

def cta(title='Speak with Holy Elixir.',body='Ask about product information, availability, hospitality or trade.',href='contact.html',label='Speak with us'):
    return f'<section class="cta-band"><div class="wrap"><div><p class="eyebrow">Your next step</p><h2>{title}</h2><p>{body}</p></div>{link(href,label)}</div></section>'

def product_intro(kicker,title,body,extra,img,alt,number,notes,sections,campaign=True):
    return f'''<header class="product-hero wrap "><div class="product-hero-copy"><p class="eyebrow">{kicker}</p><h1>{title}</h1><p class="lede">{body}</p><div class="product-notes">{''.join(f'<span>{n}</span>' for n in notes)}</div><div class="actions">{extra}<a class="quiet-link" href="#product-details">Explore the details <span aria-hidden="true">↓</span></a></div><p class="product-edition"><span>{number}</span> The Zubrex signature</p></div><figure class="product-hero-figure"><div class="product-hero-art">{image(img,alt,eager=True,campaign=campaign)}</div></figure></header><nav class="product-sections wrap" aria-label="Product sections"><span>Discover more</span>{''.join(f'<a href="#{id_}">{label}<span aria-hidden="true">↘</span></a>' for id_,label in zip(['product-overview','product-details','product-questions'],sections))}</nav>'''

def add(file,title,description,body,group='Explore',noindex=False):
    if file == 'black-drink.html':
        anchors=iter(['product-overview','product-details','product-questions'])
        body=re.sub(r'<section ',lambda m:f'<section id="{next(anchors)}" ',body,count=3)
    PAGES[file]={'title':title,'description':description,'body':body,'group':group,'noindex':noindex}

hero_name = 'diwali-hero.html' if seasonal else 'product-hero.html'
if poster_url:
    art = f'<img src="{poster_url}" alt="{escape(args.poster_alt)}" fetchpriority="high" decoding="async">'
    hero = f'''<section class="diwali-hero" aria-labelledby="home-title"><div class="wrap diwali-stage">
    <div class="diwali-copy"><svg class="diwali-diya" viewBox="0 0 80 62" width="64" height="50" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M39 6c3 7 10 11 10 19a9 9 0 0 1-18 0c0-6 6-13 8-19Z"/><path d="M39 23c-4 5-4 8 1 11M11 38h58c-4 11-14 17-29 17S15 49 11 38ZM24 59h32M8 26l5 3m59-3-5 3M20 15l4 4m36-4-4 4"/></svg>
    <p class="eyebrow">Zubrex · Festival of lights</p><h1 id="home-title">Happy <em>Diwali.</em></h1><p>Wishing you warm evenings, good company and more moments worth sharing.</p><div class="actions">{link('products.html','Explore the collection')}{link('serving-guide.html','Serving notes',True)}</div></div>
    <figure class="diwali-art"><div class="diwali-frame">{art}</div></figure>
    </div></section>'''
else:
    hero = (PROJECT / 'templates' / hero_name).read_text(encoding='utf-8').strip()
home = hero + '\n' + (PROJECT / 'templates' / 'signature-home.html').read_text(encoding='utf-8').strip()
home_title = 'Happy Diwali from Zubrex | Holy Elixir' if seasonal else 'Zubrex Black Drink | Holy Elixir'
home_description = ('Explore Zubrex Black Drink, thoughtful serving moments and hospitality from Holy Elixir.' if seasonal else
                    'Discover Zubrex Black Drink: a distinctive non-carbonated water-based beverage in a signature black-and-gold 500 ml pack. A considered way to serve, share and savour the moment.')
add('index.html',home_title,home_description,home,'Home')

from black_drink_content import add_brand_pages
add_brand_pages(add, intro, split, section, cards, related, cta, link, product_intro, faq)

contact=intro('Let’s connect','Every good choice<br>starts with <em>a conversation.</em>','Ask about Black Drink, plan a guest experience, or tell us about your business.')
contact+='''<section class="section contact-section"><div class="wrap contact-grid"><div><p class="eyebrow">Your enquiry</p><h2>Tell us what<br>you have in mind.</h2><p>Prepare an email below, then review and send it in your email app.</p><form class="contact-form" aria-describedby="enquiry-privacy" action="mailto:Info@holy-elixir.com" method="get"><div class="form-row"><div><label for="name">Your name</label><input id="name" name="name" autocomplete="name" maxlength="100" required></div><div><label for="email">Email address</label><input type="email" id="email" name="email" autocomplete="email" maxlength="200" required></div></div><div class="form-row"><div><label for="phone">Phone <span>(optional)</span></label><input type="tel" id="phone" name="phone" autocomplete="tel" maxlength="30"></div><div><label for="city">City / postcode <span>(optional)</span></label><input id="city" name="city" autocomplete="address-level2" maxlength="100"></div></div><label for="interest">What are you interested in?</label><select id="interest" name="interest" required><option value="">Choose an interest</option><option value="black-drink">Black Drink</option><option value="hospitality">Hospitality / events</option><option value="trade">Retail / distribution</option><option value="business">Business supply</option><option value="other">Something else</option></select><label for="message">Your message</label><textarea id="message" name="message" rows="5" maxlength="2000" placeholder="Product, expected quantity, preferred date, or the details you’d like to know…" required></textarea><p class="form-note" id="enquiry-privacy">Holy Elixir uses the details you send by email to respond to your enquiry. <a href="privacy.html">Privacy notice</a>.</p><button class="button" type="submit">Prepare my email <span aria-hidden="true">↗</span></button><p id="form-status" role="status"></p><noscript><p>JavaScript is off. Please email the details above directly to <a href="mailto:Info@holy-elixir.com">Info@holy-elixir.com</a>.</p></noscript></form></div><aside class="contact-card"><p class="eyebrow">A direct connection</p><h2>We’re here<br>to help.</h2><dl><dt>Email us</dt><dd><a href="mailto:Info@holy-elixir.com">Info@holy-elixir.com</a></dd><dt>Call us</dt><dd><a href="tel:+919784649100">+91 97846 49100</a><br><a href="tel:+919829230735">+91 98292 30735</a></dd><dt>Corporate office</dt><dd>414, ARG North Avenue,<br>Road No. 9A, VKIA,<br>Sikar Road, Jaipur 302013</dd></dl><div class="contact-tip"><span aria-hidden="true">✦</span><p>For product support or complaints, include the product name and the batch number if available.</p></div></aside></div></section>'''
contact+=related([('A quick answer','Browse the questions we hear most often.','faq.html','Open the FAQ'),('Discover the difference','Explore the details of the Black Drink experience.','benefits.html','The Zubrex difference'),('Planning for guests','Prepare a useful venue or event enquiry.','hospitality.html','For hospitality')])
add('contact.html','Contact & Enquiries | Zubrex by Holy Elixir','Contact Holy Elixir for product information, availability, hospitality and business enquiries.',contact,'Contact')

privacy=intro('Website information','Privacy <em>notice.</em>','How Holy Elixir handles website visits and enquiries.','<p class="reading-time">Updated 11 November 2026</p>')
privacy+='''<section class="section"><div class="wrap narrow prose policy">
<h2>Website visits</h2><p>Our hosting provider may handle IP addresses, browser details and request logs to deliver and secure the site. The website code does not set tracking cookies or load advertising or analytics scripts. Linked websites have their own privacy practices.</p>
<h2>Enquiries</h2><p>The form prepares a draft on your device. When you send it, Holy Elixir receives the name, email address, enquiry topic, message and any optional phone or location details you include. We use these details to reply, follow up and handle support or complaints. Please leave out payment credentials, identification numbers and medical details.</p>
<h2>Service providers and records</h2><p>Hosting and email providers handle the information needed to deliver their services. Enquiry emails may be kept to follow up, resolve a complaint or meet recordkeeping requirements.</p>
<h2>Privacy requests</h2><p>Email <a href="mailto:Info@holy-elixir.com?subject=Privacy%20enquiry">Info@holy-elixir.com</a> to ask about your enquiry information, request access, correction or deletion, or raise a privacy concern. Include enough detail to identify the enquiry.</p>
</div></section>'''
add('privacy.html','Privacy Notice | Zubrex by Holy Elixir','How the Holy Elixir website handles browsing information and email enquiries.',privacy,'Information')
terms=intro('Website information','Website <em>terms.</em>','Product information and enquiries.','<p class="reading-time">Updated 11 November 2026</p>')
terms+='''<section class="section"><div class="wrap narrow prose policy">
<h2>Enquiries and purchases</h2><p>Holy Elixir presents Zubrex Black Drink and helps you prepare an email enquiry. The site has no checkout or payment facility. Confirm the current price, availability, delivery terms and any applicable returns or warranty terms with the seller before agreeing to a purchase. Your statutory consumer rights apply.</p>
<h2>Product information</h2><p>Ask for the <a href="contact.html?interest=black-drink">current Black Drink label</a> to check ingredients, nutrition, storage and use. Our science notes explain general product terms; current product declarations are on the label.</p>
<h2>Product images</h2><p>Some images illustrate serving ideas and settings. See the <a href="black-drink.html#product-details">supplied Black Drink pack photograph</a> for the label.</p>
<h2>Product support and complaints</h2><p>Email <a href="mailto:Info@holy-elixir.com?subject=Product%20support">Info@holy-elixir.com</a> or use the <a href="contact.html">contact page</a>. Include the product name, batch number, and order reference if available.</p>
</div></section>'''
add('terms.html','Website Terms | Zubrex by Holy Elixir','Terms for exploring Zubrex Black Drink and requesting product information.',terms,'Information')

gallery=intro('The Zubrex imagery','A world of<br><em>Black Drink.</em>','Serving moments, light spaces and the Zubrex signature.')
gallery+=section('The moments','A distinctive presence.',content='<div class="gallery-grid">'+''.join(f'<figure>{image(n,a,campaign=False)}<figcaption>{t}</figcaption></figure>' for n,a,t in [('black-pour-editorial','Black Drink beside a clear glass','The simple serve'),('joyful-dining-editorial','Friends serving Black Drink at a shared table','At the table'),('hospitality-editorial','A waiter serving Black Drink in a restaurant','For your guests'),('friends-picnic-editorial','Friends sharing Black Drink on a terrace','A change of scene')])+'</div>')
gallery+=section('The signature','The actual supplied pack.',content='<figure class="actual-pack"><img src="assets/images/lifestyle-v2/black-drink-actual.webp" alt="Actual supplied Black Drink 500 ml pack" width="621" height="1100" loading="lazy"></figure>')
add('imagery.html','Black Drink Images | Zubrex by Holy Elixir','Serving moments and signature product images for Zubrex Black Drink.',gallery,'Review',True)
add('404.html','Page Not Found | Zubrex by Holy Elixir','Find your way back to the world of Zubrex Black Drink.',intro('A little detour / 404','Let’s find your <em>way back.</em>','This page may have moved. Explore Black Drink or use the search above to find your next stop.',link('products.html','Explore Black Drink'))+related([('Start again','Return to the Zubrex homepage.','index.html','Back to home'),('Find an answer','Browse common product and enquiry questions.','faq.html','Read the FAQ'),('Speak with us','Tell us what you are looking for.','contact.html','Get in touch')]),'Information',True)

def nav(file):
    groups=[('Black Drink',[('black-drink.html','Meet Black Drink'),('products.html','The Black Drink world'),('benefits.html','The Zubrex difference')]),('Our world',[('about.html','Our perspective'),('rituals.html','The journal'),('serving-guide.html','The serving notes')]),('Guides',[('science.html','The science notes'),('reading-labels.html','The pack notes'),('faq.html','Frequently asked')]),('For business',[('hospitality.html','Hospitality & events'),('partners.html','Trade & partnerships')])]
    features={
      'Black Drink':('black-drink.html','campaign/black-drink-studio-pack','Zubrex Black Drink with a dark beverage splash on white','The Zubrex signature','A distinct presence.'),
      'Our world':('rituals.html','lifestyle-v2/joyful-dining-editorial','Friends sharing Black Drink over a meal','The journal','Time at the table.'),
      'Guides':('science.html','lifestyle-v2/black-pour-editorial','Black Drink and clear glassware on a light table','The product notes','A clearer perspective.'),
      'For business':('hospitality.html','lifestyle-v2/hospitality-editorial','A waiter serving Black Drink in a restaurant','For hospitality & events','A place at your table.')}
    result='<ul id="site-menu">'
    for label,items in groups:
        href,img,alt,kicker,title=features[label]
        feature=f'<a class="nav-feature" href="{href}"><img src="assets/images/{img}-640.webp" alt="{alt}" width="640" height="427" loading="lazy"><span><small>{kicker}</small><strong>{title}</strong><span aria-hidden="true">↗</span></span></a>'
        result+='<li><details class="nav-dropdown"><summary '+('class="nav-current"' if file in [f for f,t in items] else '')+'>'+label+'<span aria-hidden="true">⌄</span></summary><div class="nav-panel"><div class="nav-panel-links"><p class="eyebrow">'+label+'</p>'+''.join(f'<a href="{f}" {"aria-current=page" if file==f else ""}>{t}<span aria-hidden="true">↗</span></a>' for f,t in items)+'</div>'+feature+'</div></details></li>'
    return result+f'<li><a class="mobile-contact" href="contact.html" {"aria-current=page" if file=="contact.html" else ""}>Contact & enquiries</a></li></ul>'

def footer():
    groups=[('Black Drink',['black-drink.html','products.html','benefits.html']),('Our world',['about.html','rituals.html','serving-guide.html']),('Here to help',['reading-labels.html','science.html','faq.html','contact.html']),('For business',['hospitality.html','partners.html'])]
    labels={'products.html':'The Black Drink world','black-drink.html':'Meet Black Drink','about.html':'Our perspective','rituals.html':'The journal','serving-guide.html':'Serving notes','benefits.html':'The Zubrex difference','reading-labels.html':'The pack notes','science.html':'The science notes','faq.html':'FAQs','contact.html':'Contact us','hospitality.html':'Hospitality & events','partners.html':'Trade & partnerships'}
    return '<footer class="site-footer"><div class="wrap"><div class="footer-top"><a class="brand" href="index.html"><span class="brand-symbol"><img src="assets/images/logo.webp" alt="Zubrex" width="440" height="293"></span><span class="brand-sub">BY HOLY ELIXIR</span></a><p>A distinctive drink.<br>A considered moment.</p><a class="footer-email" href="mailto:Info@holy-elixir.com">Info@holy-elixir.com <span aria-hidden="true">↗</span></a></div><div class="footer-grid">'+''.join('<div><h2>'+label+'</h2><ul>'+''.join(f'<li><a href="{f}">{labels[f]}</a></li>' for f in files)+'</ul></div>' for label,files in groups)+'''<div><h2>Find us</h2><p>414, ARG North Avenue,<br>Road No. 9A, VKIA,<br>Sikar Road, Jaipur 302013</p><a href="tel:+919784649100">+91 97846 49100</a></div></div><div class="footer-bottom"><span>© <span id="year">2026</span> Holy Elixir. All rights reserved.</span><div><a href="privacy.html">Privacy notice</a><a href="terms.html">Website terms</a><a href="#top">Back to top ↑</a></div></div><p class="footer-credit"><span>Powered by</span><a href="https://samvidalabs.com/" aria-label="Samvida Labs website"><img src="assets/images/samvida-labs-symbol.png" alt="Samvida Labs logo" width="28" height="28"><strong>Samvida Labs</strong></a></p></div></footer>'''

for file,page in PAGES.items():
    if file=='black-drink.html':
        page['body']=page['body'].replace('</div><div class="split-copy"><p class="eyebrow">A closer look at the pack', '<button class="pack-zoom quiet-link" data-pack-zoom type="button" hidden>View the pack photograph <span aria-hidden="true">↗</span></button></div><div class="split-copy"><p class="eyebrow">A closer look at the pack')
    pack_dialog='<dialog class="pack-dialog" id="pack-viewer" aria-labelledby="pack-title"><form method="dialog"><button class="dialog-close" aria-label="Close product photograph">Close ×</button></form><h2 id="pack-title">The actual Black Drink pack.</h2><p>500 ml pack photograph. Refer to the current product label for its declarations.</p><img src="assets/images/lifestyle-v2/black-drink-actual.webp" alt="Full photograph of the actual supplied Zubrex Black Drink 500 ml packaging" width="621" height="1100" loading="lazy"></dialog>' if file=='black-drink.html' else ''
    breadcrumb='' if file=='index.html' else f'<nav class="breadcrumbs wrap" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span>'+ (f'<a href="products.html">Black Drink</a><span aria-hidden="true">/</span>' if page['group']=='Collection' and file!='products.html' else '')+f'<span aria-current="page">{escape(page["title"].split(" | ")[0])}</span></nav>'
    robots = '<meta name="robots" content="noindex,nofollow">' if page['noindex'] or args.diwali_preview else ''
    theme_styles = '<link rel="stylesheet" href="diwali.css"><link rel="stylesheet" href="festival-surfaces.css">' if seasonal else '<link rel="stylesheet" href="product-surfaces.css">'
    if not seasonal and file == 'index.html':
        theme_styles += '<link rel="stylesheet" href="product-hero.css">'
    body_class = 'signature-site theme-diwali' if seasonal else 'signature-site theme-product'
    theme_color = '#291323' if seasonal else '#fffefa'
    social_image = {'black-drink.html':'campaign/black-drink-studio-pack-1440.webp', 'hospitality.html':'lifestyle-v2/hospitality-editorial-1440.webp'}.get(file, 'lifestyle-v2/joyful-dining-editorial-1440.webp')
    if file == 'index.html' and seasonal and not poster_url:
        social_image = 'campaign/diwali-family-1536.webp'
    elif file == 'index.html' and not seasonal:
        social_image = 'campaign/black-drink-kitchen-editorial-1536.webp'
    html=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(page['title'])}</title><meta name="description" content="{escape(page['description'])}"><meta name="theme-color" content="{theme_color}">{robots}<link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" href="assets/favicon-zubrex-32.png" type="image/png" sizes="32x32"><link rel="icon" href="assets/favicon-zubrex.svg" type="image/svg+xml" sizes="any"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png" sizes="180x180"><link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="premium.css"><link rel="stylesheet" href="refinements.css"><link rel="stylesheet" href="signature.css">{theme_styles}<link rel="preload" href="assets/fonts/lato-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><meta property="og:title" content="{escape(page['title'])}"><meta property="og:description" content="{escape(page['description'])}"><meta property="og:type" content="website"><meta property="og:image" content="https://holy-elixir.com/assets/images/{social_image}"></head>
<body id="top" class="{body_class}"><a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header"><div class="wrap header-inner"><a class="brand" href="index.html" aria-label="Zubrex by Holy Elixir home"><span class="brand-symbol"><img src="assets/images/logo.webp" alt="Zubrex" width="440" height="293"></span><span class="brand-sub">BY HOLY ELIXIR</span></a><nav class="main-nav" aria-label="Main navigation">{nav(file)}</nav><div class="header-actions"><button class="search-toggle" type="button" hidden aria-label="Search the website"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg></button><a class="header-cta" href="contact.html">Enquire <span aria-hidden="true">↗</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" hidden>Menu <span aria-hidden="true">☰</span></button></div></div></header>
<main id="main-content" tabindex="-1">{breadcrumb}{page['body']}</main>{footer()}{pack_dialog}
<dialog class="search-dialog" id="site-search" aria-labelledby="search-title"><form method="dialog"><button class="dialog-close" aria-label="Close search">Close ×</button></form><p class="eyebrow">Explore Zubrex</p><h2 id="search-title">What are you looking for?</h2><label class="sr-only" for="site-query">Search pages</label><input type="search" id="site-query" placeholder="Try Black Drink, serving or trade…" autocomplete="off"><p class="search-count" role="status"></p><div class="search-results"></div></dialog><script src="assets/page-index.js" defer></script><script src="script.js" defer></script></body></html>'''
    html = html.replace('><', '>\n<')
    (ROOT/file).write_text(html,encoding='utf-8')

index=[{'url':file,'title':page['title'].split(' | ')[0],'description':page['description'],'group':page['group']} for file,page in PAGES.items() if not page['noindex']]
(ROOT/'assets/page-index.js').write_text('window.sitePages = '+json.dumps(index,ensure_ascii=False)+';\n',encoding='utf-8')
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>https://holy-elixir.com/{file if file!="index.html" else ""}</loc></url>' for file,p in PAGES.items() if not p['noindex'])+'</urlset>\n',encoding='utf-8')
print(f'Built {len(PAGES)} complete static pages, local search index and sitemap in {ROOT}.')
