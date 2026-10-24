from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import re

ROOT = Path('holy-elixir').resolve()
errors = []
pages = {}

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.refs, self.headings = path, set(), [], 0
        self.resources = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1': self.headings += 1
        if 'id' in attrs:
            if attrs['id'] in self.ids: errors.append(f'{self.path.name}: duplicate id {attrs["id"]}')
            self.ids.add(attrs['id'])
        if tag == 'a' and attrs.get('href'): self.refs.append(attrs['href'])
        if tag in ('script','img','iframe','source') and attrs.get('src'): self.resources.append(attrs['src'])
        if tag in ('img','source') and attrs.get('srcset'):
            self.resources.extend(item.strip().split()[0] for item in attrs['srcset'].split(',') if item.strip())
        if tag == 'link' and attrs.get('rel') in ('stylesheet','preload','icon'): self.resources.append(attrs.get('href',''))
        if tag == 'img' and not attrs.get('alt'): errors.append(f'{self.path.name}: missing image description')

for path in ROOT.glob('*.html'):
    page = Page(path)
    page.feed(path.read_text(encoding='utf-8'))
    pages[path.name] = page
    if page.headings != 1: errors.append(f'{path.name}: expected 1 H1, found {page.headings}')
    for src in page.resources:
        if urlparse(src).scheme or src.startswith('//'): errors.append(f'{path.name}: external loading dependency {src}')
        elif not (ROOT / unquote(urlparse(src).path)).is_file(): errors.append(f'{path.name}: missing asset {src}')

for page in pages.values():
    for ref in page.refs:
        link = urlparse(ref)
        if link.scheme or ref.startswith('//'): continue
        name = link.path or page.path.name
        if not (ROOT / name).is_file(): errors.append(f'{page.path.name}: broken link {ref}')
        if link.fragment and name in pages and link.fragment not in pages[name].ids: errors.append(f'{page.path.name}: missing anchor {ref}')
        if ref == '#': errors.append(f'{page.path.name}: placeholder link')

for css in ROOT.rglob('*.css'):
    for resource in re.findall(r'url\([\s\'"]*([^\)\'\"]+)', css.read_text(encoding='utf-8')):
        if resource.startswith('data:'): continue
        if urlparse(resource).scheme: errors.append(f'{css.name}: external CSS dependency {resource}')
        elif not (css.parent / resource).is_file(): errors.append(f'{css.name}: missing CSS asset {resource}')

if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages; local loading dependencies; valid local links, anchors, images and fonts; one H1 per page.')
