"""Regenerate checked-in WOFF2 subsets; normal builds need no Python/font service.

Usage: python tools/prepare-site-fonts.py <PretendardVariable.woff2> <output-dir>
Requires fonttools[woff]==4.56.0. See src/assets/fonts/README.md for sources.
"""
import hashlib
import html
import json
from pathlib import Path
import re
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

source, output = Path(sys.argv[1]), Path(sys.argv[2])
output.mkdir(parents=True, exist_ok=True)
root = Path(__file__).resolve().parents[1]
texts = [p.read_text() for p in (root / 'src').rglob('*')
         if p.is_file() and 'assets' not in p.parts and p.suffix in {'.ts', '.html', '.json'}]
text = html.unescape(''.join(texts))
characters = set(range(32, 127)) | {ord(c) for c in text if not c.isspace()}
characters |= {int(h, 16) for h in re.findall(r'\\u([0-9a-fA-F]{4})', text)}
font = TTFont(source)
available = set(font.getBestCmap())
critical_text = '김규태 Sean Kim AI · CAD/CAM 개발자 · 제조 소프트웨어 가구 설계부터 가공 데이터까지, 3D 형상을 다룹니다. 프로젝트 연구 오픈캐드 연락'
critical = ({ord(c) for c in critical_text} | set(range(32, 127))) & available
covered = characters & available

def ranges(points):
    runs = []
    for point in sorted(points):
        if runs and point == runs[-1][1] + 1:
            runs[-1][1] = point
        else:
            runs.append([point, point])
    return ','.join(f'U+{a:X}' + (f'-{b:X}' if a != b else '') for a, b in runs)

css = []
manifest = {'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'covered': sorted(covered), 'fallback': sorted(characters - available), 'files': []}
for name, points in [('site-sans-core', critical), ('site-sans-content', covered - critical)]:
    font = TTFont(source)
    options = subset.Options()
    options.flavor = 'woff2'
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=points)
    sub.subset(font)
    # OFL reserves the upstream family name; use a distinct name for derivatives.
    for record in font['name'].names:
        values = {1: 'Portfolio Sans', 2: 'Regular', 3: 'Portfolio Sans 1.3.9 subset',
                  4: 'Portfolio Sans', 6: 'PortfolioSans', 16: 'Portfolio Sans', 17: 'Regular'}
        if record.nameID in values:
            record.string = values[record.nameID].encode(record.getEncoding())
    font.flavor = 'woff2'
    target = output / (name + '.woff2')
    font.save(target)
    css.append('@font-face{font-family:"Portfolio Sans";font-style:normal;font-weight:45 920;'
               'font-display:swap;src:url("/assets/fonts/' + target.name + '") format("woff2");'
               'unicode-range:' + ranges(points) + '}')
    manifest['files'].append({'name': target.name, 'bytes': target.stat().st_size})
(output / '_site-sans.scss').write_text('\n'.join(css) + '\n')
(output / 'coverage.json').write_text(json.dumps(manifest, ensure_ascii=True, indent=2) + '\n')
print(json.dumps({'glyphs': len(covered), 'files': manifest['files']}, ensure_ascii=False))
