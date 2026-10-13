"""Card/case figure 03 — design to manufacturing data: one nested sheet with continuous
wood grain, a grain-matched door group (A-1..A-3), edge banding, hinge cups and part
labels (synthetic layout)."""
import math
import sys

from iso import BASE_CSS, PALETTE, svg_doc

SW, SH = 2440.0, 1220.0
S = 0.205
X0, Y0 = 30.0, 58.0

# id, x, y, w, h, kind
parts = [
    ('A-1', 10, 10, 716, 596, 'door'),
    ('A-2', 732, 10, 716, 596, 'door'),
    ('A-3', 1454, 10, 716, 596, 'door'),
    ('S-1', 2176, 10, 254, 596, 'part'),
    ('P-01', 10, 616, 720, 560, 'part'),
    ('P-02', 736, 616, 720, 560, 'part'),
    ('P-03', 1462, 616, 564, 300, 'part'),
    ('P-04', 1462, 922, 564, 254, 'part'),
    ('P-05', 2032, 616, 398, 560, 'part'),
]


def X(x):
    return X0 + x * S


def Y(y):
    return Y0 + y * S


body = []
body.append('<defs><clipPath id="sheet"><rect x="%.1f" y="%.1f" width="%.1f" height="%.1f"/></clipPath>' % (X(0), Y(0), SW * S, SH * S))
body.append('<clipPath id="grp">' + ''.join(
    f'<rect x="{X(x):.1f}" y="{Y(y):.1f}" width="{w * S:.1f}" height="{h * S:.1f}"/>' for i, x, y, w, h, k in parts if k == 'door') + '</clipPath></defs>')

# sheet + grain lines running along the sheet length
body.append(f'<rect x="{X(0):.1f}" y="{Y(0):.1f}" width="{SW * S:.1f}" height="{SH * S:.1f}" fill="#efe4cf" stroke="#b9a684" stroke-width="1"/>')
grain = []
for j in range(0, 52):
    y = 12 + j * 23.5
    pts = []
    for i in range(0, 61):
        x = i * SW / 60
        dy = 7 * math.sin(x / 260 + j * 0.7) + 4 * math.sin(x / 90 + j * 1.9)
        pts.append(f'{X(x):.1f} {Y(y + dy):.1f}')
    grain.append('M' + ' L'.join(pts))
gpath = ' '.join(grain)
body.append(f'<path d="{gpath}" fill="none" stroke="#c9b48c" stroke-width=".7" clip-path="url(#sheet)"/>')

# parts: offcut-coloured base, then the grain-matched group with stronger grain
for pid, x, y, w, h, kind in parts:
    fill = '#f4ead7' if kind == 'part' else '#f1dfc1'
    body.append(f'<rect x="{X(x):.1f}" y="{Y(y):.1f}" width="{w * S:.1f}" height="{h * S:.1f}" fill="{fill}" fill-opacity=".72" stroke="#6f5133" stroke-width="1"/>')
body.append(f'<path d="{gpath}" fill="none" stroke="#a9834f" stroke-width=".9" clip-path="url(#grp)"/>')

# edge banding (thick accent edges) on the doors and the shelf front
for pid, x, y, w, h, kind in parts:
    if kind == 'door':
        body.append(f'<rect x="{X(x) + 1.2:.1f}" y="{Y(y) + 1.2:.1f}" width="{w * S - 2.4:.1f}" height="{h * S - 2.4:.1f}" fill="none" stroke="{PALETTE["accent"]}" stroke-width="2.2"/>')
px, py, pw, ph = 1462, 616, 564, 300
body.append(f'<path d="M{X(px):.1f} {Y(py + ph) - 1.2:.1f} L{X(px + pw):.1f} {Y(py + ph) - 1.2:.1f}" stroke="{PALETTE["accent"]}" stroke-width="2.2"/>')

# hinge cups (35 mm) on each door, shelf-pin rows on the side panels
for pid, x, y, w, h, kind in parts:
    if kind == 'door':
        for cy in (y + 100, y + h - 100):
            body.append(f'<circle cx="{X(x + 22.5 + 17.5):.1f}" cy="{Y(cy):.1f}" r="{17.5 * S:.1f}" fill="#fff" stroke="#2f5a45" stroke-width="1.1"/>')
for pid in ('P-01', 'P-02'):
    _, x, y, w, h, _ = next(p for p in parts if p[0] == pid)
    for i in range(7):
        for cx in (x + 37, x + w - 37):
            body.append(f'<circle cx="{X(cx):.1f}" cy="{Y(y + 90 + i * 64):.1f}" r="1.3" fill="#2f5a45"/>')

# labels
for pid, x, y, w, h, kind in parts:
    color = PALETTE['accent'] if kind == 'door' else '#4f5c54'
    weight = '600' if kind == 'door' else '400'
    body.append(f'<text x="{X(x + w / 2):.1f}" y="{Y(y + h / 2) + 4:.1f}" font-size="11" font-weight="{weight}" fill="{color}" text-anchor="middle" stroke="#f6ecd9" stroke-width="3" paint-order="stroke">{pid}</text>')

# annotations
ax0, ax1, ay = X(10), X(2170), Y(0) - 14
body.append(f'<path d="M{ax0:.1f} {ay + 6:.1f} L{ax0:.1f} {ay:.1f} L{ax1:.1f} {ay:.1f} L{ax1:.1f} {ay + 6:.1f}" fill="none" stroke="{PALETTE["accent"]}" stroke-width="1"/>')
body.append(f'<text x="{ax0:.1f}" y="{ay - 7:.1f}" font-size="10.5" font-weight="600" fill="{PALETTE["accent"]}">GRAIN MATCH · A-1 → A-2 → A-3</text>')
body.append(f'<text x="{X(SW):.1f}" y="{ay - 7:.1f}" font-size="10" fill="#6b766e" text-anchor="end">GRAIN →</text>')
by = Y(SH) + 22
body.append(f'<text x="{X(0):.1f}" y="{by:.1f}" font-size="10" fill="#6b766e">SHEET 01 · 2440 × 1220 · 18T</text>')
lx = X(SW) - 286
body.append(f'<rect x="{lx:.1f}" y="{by - 9:.1f}" width="16" height="9" fill="none" stroke="{PALETTE["accent"]}" stroke-width="2"/>'
            f'<text x="{lx + 22:.1f}" y="{by:.1f}" font-size="10" fill="#4f5c54">EDGE BAND</text>'
            f'<circle cx="{lx + 110:.1f}" cy="{by - 4:.1f}" r="4" fill="#fff" stroke="#2f5a45" stroke-width="1.1"/>'
            f'<text x="{lx + 120:.1f}" y="{by:.1f}" font-size="10" fill="#4f5c54">HINGE CUP</text>'
            f'<circle cx="{lx + 204:.1f}" cy="{by - 4:.1f}" r="1.6" fill="#2f5a45"/>'
            f'<text x="{lx + 212:.1f}" y="{by:.1f}" font-size="10" fill="#4f5c54">SHELF PIN</text>')

svg = svg_doc(560, 390, ''.join(body), BASE_CSS, '제조 데이터 개념도: 원장 한 장의 부재 배치와 결맞춤 도어 그룹, 엣지, 경첩·선반핀 가공 표시')
open(sys.argv[1], 'w', encoding='utf-8').write(svg)
print(len(svg))
