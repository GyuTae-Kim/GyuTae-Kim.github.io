"""Generate original SVG location diagrams for the furniture panel tooltips.

These are explanatory cabinet/drawer diagrams, not AI predictions or research renders.
Run from any directory with Python's standard library; outputs are deterministic.
"""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'src/assets/cases/panel/types'

# Axis-aligned panels in a common cabinet coordinate system: X width, Y depth, Z up.
CARCASS = {
    'back': (0, .62, .22, 1.04, .66, 1.75),
    'left': (0, 0, .2, .045, .66, 1.75),
    'base': (0, 0, .18, 1.045, .66, .23),
    'right': (1, 0, .2, 1.045, .66, 1.75),
    'shelf': (.045, .04, .9, 1, .6, .94),
    'top': (0, 0, 1.7, 1.045, .66, 1.75),
    'kick': (0, .08, 0, 1.045, .12, .18),
}
EXTRA = {
    'door': (.05, -.15, .24, .98, -.11, 1.47),
    'band': (.05, .50, 1.53, 1, .62, 1.59),
    'channel-h': (.05, -.03, 1.48, 1, .12, 1.52),
    'channel-v': (.05, .09, 1.48, 1, .13, 1.66),
    'ep': (1.1, 0, .02, 1.145, .66, 1.76),
    'divider': (.53, .04, .24, .57, .62, 1.68),
}
DRAWER = {
    'bottom': (.06, -.55, .75, .98, .12, .79),
    'left': (.06, -.55, .79, .10, .12, 1.15),
    'back': (.10, .08, .79, .94, .12, 1.15),
    'right': (.94, -.55, .79, .98, .12, 1.15),
    'front': (.10, -.55, .79, .94, -.51, 1.15),
}
PANELS = {
    'door': ('도어', ['door']),
    'side-panel': ('측판', ['right']),
    'base-panel': ('지판', ['base']),
    'band': ('밴드목', ['band']),
    'channel': ('찬넬', ['channel-h', 'channel-v']),
    'top-panel': ('천판', ['top']),
    'back-panel': ('뒷판(우라판)', ['back']),
    'kickboard': ('걸레받이', ['kick']),
    'shelf': ('선반', ['shelf']),
    'drawer-bottom': ('서랍 바닥판', ['bottom']),
    'ep-panel': ('EP 패널', ['ep']),
    'drawer-side': ('서랍 측판', ['left', 'right']),
    'drawer-front-back': ('서랍 앞뒤판', ['front', 'back']),
    'absolute-divider': ('절대 디바이더', ['divider']),
    'proportional-divider': ('비율 디바이더', ['divider']),
}


def point(x, y, z):
    return (65 + x * 205 + y * 100, 270 + x * 20 - y * 48 - z * 128)


def polygon(vertices, fill, stroke, opacity):
    coordinates = ' '.join(f'{x:.1f},{y:.1f}' for x, y in (point(*p) for p in vertices))
    return f'<polygon points="{coordinates}" fill="{fill}" stroke="{stroke}" stroke-width="1.3" stroke-linejoin="round" opacity="{opacity}"/>'


def box(bounds, highlighted=False, opacity=.42):
    x0, y0, z0, x1, y1, z1 = bounds
    faces = [
        [(x0,y0,z0),(x1,y0,z0),(x1,y0,z1),(x0,y0,z1)],
        [(x1,y0,z0),(x1,y1,z0),(x1,y1,z1),(x1,y0,z1)],
        [(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)],
    ]
    colours = ['#2c659d', '#204c77', '#5c93c6'] if highlighted else ['#e0e6ec', '#ccd6df', '#edf1f5']
    return ''.join(polygon(face, colour, '#204c77' if highlighted else '#a5b4c3', 1 if highlighted else opacity) for face, colour in zip(faces, colours))


def render(key, label, selection):
    if key in {'absolute-divider', 'proportional-divider'}:
        return divider_comparison(key, label)
    drawer = key.startswith('drawer-')
    drawing = []
    # Gray context remains visible; selected parts are drawn last as an explanatory overlay.
    for name, bounds in CARCASS.items():
        if drawer and name == 'shelf':
            continue
        drawing.append(box(bounds, opacity=.24 if drawer else .42))
    if drawer:
        for name, bounds in DRAWER.items():
            if name not in selection:
                drawing.append(box(bounds, opacity=.85))
        selected = DRAWER
    else:
        selected = {**CARCASS, **EXTRA}
    for name in selection:
        drawing.append(box(selected[name], highlighted=True))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="420" height="300" viewBox="0 0 420 300" role="img" aria-labelledby="title description">
<title id="title">{escape(label)} 위치</title>
<desc id="description">가구의 다른 부위는 회색, {escape(label)} 부위는 파란색으로 표시한 위치 안내용 개념도입니다.</desc>
<rect width="420" height="300" fill="#f6f8fa"/>
{''.join(drawing)}
</svg>
'''


def divider_comparison(key, label):
    absolute = key == 'absolute-divider'
    title = '기준면과의 거리 유지' if absolute else '공간의 비율 유지'
    panels = []
    for x, width, heading in [(20, 125, '폭 변경 전'), (205, 190, '폭 증가 후')]:
        offset = 50 if absolute else width / 2
        divider_x = x + offset
        panels.append(f'''<text x="{x + width / 2}" y="63" text-anchor="middle" font-size="15">{heading}</text>
<rect x="{x}" y="83" width="{width}" height="126" fill="#edf1f5" stroke="#a5b4c3" stroke-width="2"/>
<rect x="{divider_x - 3}" y="83" width="6" height="126" fill="#2c659d"/>
<path d="M{x},225v10 M{x},230H{divider_x} M{divider_x},225v10" fill="none" stroke="#2c659d" stroke-width="1.5"/>
<text x="{x + offset / 2}" y="255" text-anchor="middle" font-size="15" fill="#204c77">{'일정' if absolute else '1'}</text>''')
        if not absolute:
            panels.append(f'''<path d="M{divider_x},230H{x + width} M{x + width},225v10" fill="none" stroke="#2c659d" stroke-width="1.5"/>
<text x="{divider_x + (width - offset) / 2}" y="255" text-anchor="middle" font-size="15" fill="#204c77">1</text>''')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="420" height="300" viewBox="0 0 420 300" role="img" aria-labelledby="title description">
<title id="title">{label}: {title}</title>
<desc id="description">가구 폭을 늘릴 때 {'왼쪽 기준면과 칸막이의 거리는 그대로이고 오른쪽 칸만 늘어납니다.' if absolute else '가운데 칸막이가 이동해 양쪽 칸의 1대1 비율을 유지합니다.'}</desc>
<rect width="420" height="300" fill="#f6f8fa"/>
<g font-family="Arial, sans-serif" fill="#29343d">
<text x="210" y="29" text-anchor="middle" font-size="19" font-weight="bold">{title}</text>
{''.join(panels)}
<path d="M158,145h32m-7,-6 7,6-7,6" fill="none" stroke="#687785" stroke-width="2"/>
<text x="210" y="285" text-anchor="middle" font-size="12" fill="#687785">정면에서 본 폭 변경 예시 · 판 두께 생략</text>
</g></svg>
'''


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for key, (label, selection) in PANELS.items():
        (OUT / f'{key}.svg').write_text(render(key, label, selection), encoding='utf-8')
    print(f'Generated {len(PANELS)} original SVG panel diagrams.')
