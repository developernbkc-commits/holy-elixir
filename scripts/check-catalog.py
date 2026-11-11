"""Check the Black Drink catalogue, page indexes and retired product assets."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json, re, xml.etree.ElementTree as ET
root=Path('holy-elixir')
forbidden=re.compile(r'alkaline[ -]water|black[ -]water|ioni[sz]ers?|site-notice|notice-scroll|water-terrace|water-morning|water-lifestyle|collection-updated|collection-(?:640|1440)\.webp|partners\.webp', re.I)
class Metadata(HTMLParser):
    def __init__(self):
        super().__init__(); self.noindex=False; self.social=[]
    def handle_starttag(self,tag,attrs):
        if tag!='meta':return
        a=dict(attrs)
        if a.get('name')=='robots' and 'noindex' in a.get('content',''): self.noindex=True
        if a.get('property')=='og:image': self.social.append(a.get('content',''))
public=set()
for f in root.glob('*.html'):
    assert f.name not in {'alkaline-water.html','ionizers.html'}, 'Retired HTML is still present'
    html=f.read_text(encoding='utf-8')
    leak=forbidden.search(html)
    assert not leak, f'{f}: old content {leak.group()}'
    m=Metadata(); m.feed(html)
    if not m.noindex: public.add(f.name)
    for social in m.social:
        url=urlsplit(social)
        assert url.netloc=='holy-elixir.com' and (root/url.path.lstrip('/')).is_file(), f'{f}: missing social image {social}'
assert len(public)==15, public
search=(root/'assets/page-index.js').read_text(encoding='utf-8')
assert not forbidden.search(search)
assert {p['url'] for p in json.loads(search.split('=',1)[1].strip().removesuffix(';'))}==public
paths={urlsplit(v.text).path.lstrip('/') or 'index.html' for v in ET.parse(root/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
assert paths==public, paths.symmetric_difference(public)
assert not forbidden.search((root/'sitemap.xml').read_text(encoding='utf-8'))
retired_assets=[str(p) for p in root.rglob('*') if p.is_file() and forbidden.search(p.relative_to(root).as_posix())]
assert not retired_assets, f'Retired assets remain in publish directory: {retired_assets}'
print(f'PASS: {len(public)} Black Drink pages match sitemap and search. No retired products, assets or notice. Social images resolve.')
