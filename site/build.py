"""Export static pages, including directly accessible article/poem URLs."""
from pathlib import Path
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
OUT.mkdir(exist_ok=True)
FILES = ['index.html', 'style.css', 'poetry.css', 'home.css', 'project.css', 'app.js', 'poetry.js', 'home.js', 'project.js', 'ambient.js', 'space.js', 'apartment.js', 'home-art.js', 'viewport.js', 'content.json']
for name in FILES:
    shutil.copy2(ROOT / name, OUT / name)
shutil.copytree(ROOT / 'assets', OUT / 'assets', dirs_exist_ok=True)
shutil.copytree(ROOT / 'vendor', OUT / 'vendor', dirs_exist_ok=True)

# Cloudflare gives scripts and styles a 4-hour browser cache whatever nginx says, so every release gets its own
# URLs: the page's links and every module import carry ?v=<hash of the sources>. One version for all files keeps
# each module a single instance (every importer asks for the same URL).
VERSION = hashlib.sha256(b''.join((ROOT / name).read_bytes() for name in FILES)).hexdigest()[:10]
IMPORT = re.compile(r"(from\s+['\"])(\./[^'\"?]+\.js)(['\"])")
for js in OUT.glob('*.js'):
    js.write_text(IMPORT.sub(lambda m: f'{m[1]}{m[2]}?v={VERSION}{m[3]}', js.read_text()))
LINK = re.compile(r'((?:href|src)="/[\w-]+\.(?:css|js))"')
(OUT / 'index.html').write_text(LINK.sub(lambda m: f'{m[1]}?v={VERSION}"', (OUT / 'index.html').read_text()))

data = json.loads((ROOT / 'content.json').read_text())
routes = ['home', 'poetry', 'article', 'project', 'photos']
routes += ['poetry/' + p['id'] for p in data['poems']]
routes += ['article/' + p['id'] for p in data['articles']]
for route in routes:
    page = OUT / route / 'index.html'
    page.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUT / 'index.html', page)
shutil.copy2(OUT / 'index.html', OUT / '404.html')
print(f'Exported homepage and {len(routes)} routes to {OUT} (version {VERSION})')
