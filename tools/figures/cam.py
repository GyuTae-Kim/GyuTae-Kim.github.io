"""Card/case figure 02 — Fusion CAM: a stepped (nested) pocket in a stock block, one
offset toolpath set per level, two tools (tool change) and the stock envelope
(synthetic geometry, painter's order for correct recesses)."""
import math
import sys

from iso import BASE_CSS, PALETTE, fit, path, shade_for, svg_doc

W, D, H = 150.0, 100.0, 34.0
OUT = dict(x0=26.0, x1=124.0, y0=18.0, y1=82.0, r=10.0, z=H - 10.0)   # level 1
INN = dict(x0=52.0, x1=104.0, y0=34.0, y1=66.0, r=7.0, z=H - 22.0)    # level 2
STOCK = 4.0


def arc(cx, cy, r, a0, a1, n):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def rrect(x0, x1, y0, y1, r, n=8):
    pts = []
    pts += arc(x1 - r, y0 + r, r, -math.pi / 2, 0, n)
    pts += arc(x1 - r, y1 - r, r, 0, math.pi / 2, n)
    pts += arc(x0 + r, y1 - r, r, math.pi / 2, math.pi, n)
    pts += arc(x0 + r, y0 + r, r, math.pi, 1.5 * math.pi, n)
    return pts


extent = [(x, y, z) for x in (-STOCK, W + STOCK) for y in (-STOCK, D + STOCK) for z in (0, H + STOCK + 34)]
iso = fit(extent, (40, 40, 520, 352))
P = iso.p
body = []


def face(pts3, fill, n, extra=''):
    d = path([P(*q) for q in pts3])
    body.append(f'<path d="{d}" fill="{fill}"{extra}/>')
    s = shade_for(n)
    if s:
        body.append(f'<path class="sh" d="{d}" fill-opacity="{s:.2f}"/>')


def walls(loop, ztop, zbot, fill):
    for (x0, y0), (x1, y1) in zip(loop, loop[1:] + loop[:1]):
        tx, ty = x1 - x0, y1 - y0
        L = math.hypot(tx, ty) or 1
        nx, ny = -ty / L, tx / L
        if nx + ny > 1e-9:
            face([(x0, y0, ztop), (x1, y1, ztop), (x1, y1, zbot), (x0, y0, zbot)], fill, (nx, ny, 0),
                 f' stroke="{fill}" stroke-width=".5"')


base, lv1, lv2 = '#dfe6de', '#e7cdb4', '#e7b892'
outer = rrect(OUT['x0'], OUT['x1'], OUT['y0'], OUT['y1'], OUT['r'])
inner = rrect(INN['x0'], INN['x1'], INN['y0'], INN['y1'], INN['r'])

# shadow
c = P(W / 2 + 8, D / 2 + 8, 0)
body.append(f'<ellipse cx="{c[0]:.1f}" cy="{c[1] + 6:.1f}" rx="{iso.k * 104:.1f}" ry="{iso.k * 34:.1f}" fill="#213a2e" opacity=".06"/>')
# level 2 (deepest) floor + far walls
face([(x, y, INN['z']) for x, y in inner], lv2, (0, 0, 1))
walls(inner, OUT['z'], INN['z'], lv2)
# level 1 floor with the level-2 opening, then its far walls
d = path([P(x, y, OUT['z']) for x, y in outer]) + ' ' + path([P(x, y, OUT['z']) for x, y in reversed(inner)])
body.append(f'<path d="{d}" fill="{lv1}" fill-rule="evenodd"/>')
body.append(f'<path class="e" d="{path([P(x, y, OUT["z"]) for x, y in inner])}"/>')
walls(outer, H, OUT['z'], lv1)
# block sides
face([(W, 0, H), (W, D, H), (W, D, 0), (W, 0, 0)], base, (1, 0, 0), ' stroke="#4c6255" stroke-width="1.2"')
face([(0, D, H), (W, D, H), (W, D, 0), (0, D, 0)], base, (0, 1, 0), ' stroke="#4c6255" stroke-width="1.2"')
# top face with the level-1 opening
top = path([P(0, 0, H), P(W, 0, H), P(W, D, H), P(0, D, H)]) + ' ' + path([P(x, y, H) for x, y in reversed(outer)])
body.append(f'<path d="{top}" fill="#eef2ec" fill-rule="evenodd" stroke="#4c6255" stroke-width="1.2"/>')
body.append(f'<path class="e" d="{path([P(x, y, H) for x, y in outer])}"/>')

# stock envelope (dashed wireframe, allowance on sides and top)
s0, s1 = -STOCK, None
sx = [(-STOCK, -STOCK), (W + STOCK, -STOCK), (W + STOCK, D + STOCK), (-STOCK, D + STOCK)]
for z in (0.0, H + STOCK):
    body.append(f'<path d="{path([P(x, y, z) for x, y in sx])}" fill="none" stroke="#7c8f82" stroke-width="1" stroke-dasharray="4 4"/>')
for x, y in sx[1:]:
    body.append(f'<path d="{path([P(x, y, 0), P(x, y, H + STOCK)], close=False)}" fill="none" stroke="#7c8f82" stroke-width="1" stroke-dasharray="4 4"/>')

# toolpaths: offset loops per level
cut = PALETTE['accent']
tp = []
for inset in (5.0, 12.0):
    r = max(OUT['r'] - inset, 1.0)
    lp = rrect(OUT['x0'] + inset, OUT['x1'] - inset, OUT['y0'] + inset, OUT['y1'] - inset, r)
    tp.append(path([P(x, y, OUT['z'] + .5) for x, y in lp]))
for inset in (3.0, 8.0, 13.0):
    r = max(INN['r'] - inset, 1.0)
    lp = rrect(INN['x0'] + inset, INN['x1'] - inset, INN['y0'] + inset, INN['y1'] - inset, r)
    tp.append(path([P(x, y, INN['z'] + .5) for x, y in lp]))
open_top = path([P(x, y, H) for x, y in outer])
open_mid = path([P(x, y, OUT['z']) for x, y in inner])
body.append(f'<defs><clipPath id="cam-open1"><path d="{open_top}"/></clipPath><clipPath id="cam-open2"><path d="{open_mid}"/></clipPath></defs>')
style = f'fill="none" stroke="{cut}" stroke-width="1.5" stroke-linejoin="round"'
body.append(f'<g clip-path="url(#cam-open1)" {style}>' + ''.join(f'<path d="{t}"/>' for t in tp[:2])
            + '<g clip-path="url(#cam-open2)">' + ''.join(f'<path d="{t}"/>' for t in tp[2:]) + '</g></g>')


def tool(cx, cy, zt, r, length, label):
    """End mill standing on (cx, cy, zt): shank + fluted body, drawn as a projected cylinder."""
    g = []
    top_z = zt + length
    left = P(cx - r * 0.7071, cy + r * 0.7071, zt)
    right = P(cx + r * 0.7071, cy - r * 0.7071, zt)
    left_t = P(cx - r * 0.7071, cy + r * 0.7071, top_z)
    right_t = P(cx + r * 0.7071, cy - r * 0.7071, top_z)
    bottom = arc(cx, cy, r, math.radians(-45), math.radians(135), 18)
    body_pts = [P(x, y, zt) for x, y in bottom] + [left_t, right_t]
    g.append(f'<path d="{path(body_pts)}" fill="#c9d0cc" stroke="#3d4f45" stroke-width="1"/>')
    half = [P(x, y, zt) for x, y in bottom[:9]] + [P(bottom[8][0], bottom[8][1], top_z), right_t]
    g.append(f'<path class="sh" d="{path(half)}" fill-opacity=".18"/>')
    ring = arc(cx, cy, r, 0, 2 * math.pi, 36)
    g.append(f'<path d="{path([P(x, y, top_z) for x, y in ring])}" fill="#e4e9e6" stroke="#3d4f45" stroke-width="1"/>')
    for k in range(3):
        a = math.radians(-20 + 50 * k)
        p0 = P(cx + r * math.cos(a), cy + r * math.sin(a), zt + 2)
        p1 = P(cx + r * math.cos(a + 1.1), cy + r * math.sin(a + 1.1), top_z - 4)
        g.append(f'<path d="M{p0[0]:.1f} {p0[1]:.1f} L{p1[0]:.1f} {p1[1]:.1f}" stroke="#7d8c84" stroke-width="1"/>')
    lx, ly = P(cx, cy, top_z)
    g.append(f'<text x="{lx + 2:.1f}" y="{ly - 12:.1f}" font-size="10.5" font-weight="600" fill="#2c4436" text-anchor="middle">{label}</text>')
    body.append(''.join(g))


tool(OUT['x0'] + 16, OUT['y0'] + 12, OUT['z'] + 6, 5.0, 30, 'T1 · Ø10')
tool(INN['x1'] - 9, INN['y0'] + 9, INN['z'] + 8, 3.0, 34, 'T2 · Ø6')

# labels
def tag(p3, text, dx, dy, color):
    ax, ay = P(*p3)
    tx, ty = ax + dx, ay + dy
    end = 'start' if dx > 0 else 'end'
    return (f'<path d="M{ax:.1f} {ay:.1f} L{tx:.1f} {ty:.1f}" stroke="{color}" stroke-width="1" fill="none"/>'
            f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="2.4" fill="{color}"/>'
            f'<text x="{tx + (4 if dx > 0 else -4):.1f}" y="{ty + 4:.1f}" font-size="10.5" fill="{color}" text-anchor="{end}">{text}</text>')


body.append(tag((OUT['x1'] - 12, OUT['y0'] + 9, OUT['z']), 'LEVEL 1', 70, 26, '#8e4c2e'))
body.append(tag((INN['x0'] + 9, INN['y0'] + 10, INN['z']), 'LEVEL 2', -96, 64, '#8e4c2e'))
body.append(tag((-STOCK, D + STOCK, H + STOCK), 'STOCK', -24, -22, '#4f5c54'))
body.append('<text x="544" y="24" font-size="10" fill="#6b766e" text-anchor="end">SETUP · TOOL CHANGE · TOOLPATH</text>')

svg = svg_doc(560, 390, ''.join(body), BASE_CSS, 'CAM 개념도: 소재 안의 2단 중첩 포켓과 단별 공구, 공구 경로')
open(sys.argv[1], 'w', encoding='utf-8').write(svg)
print(len(svg))
