"""Build self-hosted Japanese/Chinese subsets from pinned OFL Noto inputs.

Usage: python tools/prepare-cjk-fonts.py <NotoSansJP.ttf> <NotoSansSC.ttf>
Requires fonttools[woff]==4.56.0. Normal builds use committed WOFF2 files.
"""
import hashlib
import json
from pathlib import Path
import sys
import unicodedata
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
output = root / 'src/assets/fonts'
base = set(json.loads((output / 'coverage.json').read_text())['covered'])
common = {ord(c) for c in '한국어English日本語简体中文Deutsch'} - base
commit = 'ddf386ba1b9fbc6b2c818f1ddcd9148f54ced94b'
manifest = {'upstreamCommit': commit, 'files': []}

def ranges(points):
    runs = []
    for point in sorted(points):
        if runs and point == runs[-1][1] + 1: runs[-1][1] = point
        else: runs.append([point, point])
    return ','.join(f'U+{a:X}' + (f'-{b:X}' if a != b else '') for a, b in runs)

css = []
for locale, source, family in [('common', Path(sys.argv[2]), 'Portfolio CJK'),
                               ('ja', Path(sys.argv[1]), 'Portfolio Japanese'),
                               ('zh-CN', Path(sys.argv[2]), 'Portfolio Chinese')]:
    if locale == 'common': points = common
    else:
        catalog = json.loads((root / f'src/app/i18n/{locale}.json').read_text())
        points = common | {ord(c) for text in catalog.values() for c in text
                           if not c.isspace() and unicodedata.category(c) != 'Cf'}
        points -= base
    font = TTFont(source, recalcTimestamp=False)
    available = set(font.getBestCmap())
    # Native faces need not contain the other language's menu label; the small
    # shared face covers it without changing the native body glyph preference.
    missing = points - available - (common if locale != 'common' else set())
    if missing: raise ValueError(f'{locale}: upstream lacks {sorted(missing)}')
    points &= available
    options = subset.Options(); options.flavor = 'woff2'
    cutter = subset.Subsetter(options=options); cutter.populate(unicodes=points); cutter.subset(font)
    for record in font['name'].names:
        names = {1: family, 2: 'Regular', 3: family + ' subset 1', 4: family,
                 6: family.replace(' ', ''), 16: family, 17: 'Regular'}
        if record.nameID in names: record.string = names[record.nameID].encode(record.getEncoding())
    font.flavor = 'woff2'
    target = output / f'site-cjk-{locale}.woff2'; font.save(target)
    css.append(f'@font-face{{font-family:"{family}";font-style:normal;font-weight:100 900;'
               f'font-display:swap;src:url("/assets/fonts/{target.name}") format("woff2");'
               f'unicode-range:{ranges(points)}}}')
    manifest['files'].append({'locale': locale, 'family': family, 'name': target.name,
                             'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                             'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                             'bytes': target.stat().st_size, 'covered': sorted(points)})
(output / '_site-cjk.scss').write_text('\n'.join(css) + '\n')
(output / 'cjk-coverage.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps([{'locale': f['locale'], 'glyphs': len(f['covered']), 'bytes': f['bytes']}
                  for f in manifest['files']]))
