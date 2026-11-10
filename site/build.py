"""Export static pages, including directly accessible article/poem URLs."""
from pathlib import Path
import json
import shutil

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'dist'
OUT.mkdir(exist_ok=True)
for name in ['index.html', 'style.css', 'poetry.css', 'home.css', 'project.css', 'app.js', 'poetry.js', 'home.js', 'project.js', 'ambient.js', 'space.js', 'apartment.js', 'home-art.js', 'content.json']:
    shutil.copy2(ROOT / name, OUT / name)
shutil.copytree(ROOT / 'assets', OUT / 'assets', dirs_exist_ok=True)
shutil.copytree(ROOT / 'vendor', OUT / 'vendor', dirs_exist_ok=True)
data = json.loads((ROOT / 'content.json').read_text())
routes = ['home', 'poetry', 'article', 'project', 'photos']
routes += ['poetry/' + p['id'] for p in data['poems']]
routes += ['article/' + p['id'] for p in data['articles']]
for route in routes:
    page = OUT / route / 'index.html'
    page.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / 'index.html', page)
shutil.copy2(ROOT / 'index.html', OUT / '404.html')
print(f'Exported homepage and {len(routes)} routes to {OUT}')
