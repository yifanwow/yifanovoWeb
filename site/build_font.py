"""Refresh the shared font subset after adding content (requires fonttools and brotli)."""
from pathlib import Path
import argparse
from fontTools.ttLib import TTFont
from fontTools import subset

ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', required=True, type=Path, help='Original NotoSerifSC[wght].ttf from google/fonts, licensed under OFL.')
args = parser.parse_args()
text = (ROOT / 'content.json').read_text() + ''.join(p.read_text() for p in ROOT.iterdir() if p.suffix in {'.js', '.css', '.html'})
characters = set(text) | {chr(i) for i in range(32, 127)}
font = TTFont(args.source)
options = subset.Options()
options.flavor = 'woff2'
options.hinting = False
options.layout_features = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=[ord(c) for c in characters])
subsetter.subset(font)
font.flavor = 'woff2'
output = ROOT / 'assets/fonts/yifanovo-serif.woff2'
font.save(output)
print(f'Updated {output.name}: {len(characters)} characters, {output.stat().st_size // 1024} KiB')
