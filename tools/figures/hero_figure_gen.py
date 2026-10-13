"""Generate the home hero CAD figure (Angular template) from real 3D geometry.

A plate with a filleted vertical corner, a rectangular pocket with corner radii and a
blind hole, projected isometrically (viewer along (1,1,1)). Visibility comes from
back-face culling plus painter's order (interior -> side faces -> top face with
openings), so recessed features read as recessed.

Usage: python3 hero_figure_gen.py <out.html>
"""
import math
import sys

# ---- geometry (mm) ------------------------------------------------------------
W, D, H = 150.0, 96.0, 26.0          # plate: x in [0,W], y in [0,D], z in [0,H]
RF = 18.0                             # vertical fillet at the near corner (W, D)
PK = dict(x0=24.0, x1=86.0, y0=20.0, y1=64.0, r=8.0, depth=11.0)   # pocket
HO = dict(cx=118.0, cy=32.0, r=9.5, depth=17.0)                     # blind hole
TOOL_R = 4.0

C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))
K = 1.8                                # px per mm
OX, OY = 268.0, 108.0                  # screen offset


def P(x, y, z):
    return (OX + (x - y) * C30 * K, OY + (x + y) * S30 * K - z * K)


def fmt(pts, close=True):
    s = 'M' + ' L'.join(f'{px:.1f} {py:.1f}' for px, py in pts)
    return s + (' Z' if close else '')


def arc(cx, cy, r, a0, a1, n):
    return [(cx + r * math.cos(a0 + (a1 - a0) * i / n), cy + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]


def rounded_rect(x0, x1, y0, y1, r, n=8):
    """Counter-clockwise loop seen from +z (x right, y down in plan = CCW in xy)."""
    pts = []
    pts += arc(x1 - r, y0 + r, r, -math.pi / 2, 0, n)
    pts += arc(x1 - r, y1 - r, r, 0, math.pi / 2, n)
    pts += arc(x0 + r, y1 - r, r, math.pi / 2, math.pi, n)
    pts += arc(x0 + r, y0 + r, r, math.pi, 1.5 * math.pi, n)
    return pts


def plate_outline():
    pts = [(0.0, 0.0), (W, 0.0)]
    pts += arc(W - RF, D - RF, RF, 0, math.pi / 2, 14)
    pts += [(0.0, D)]
    return pts


VIEW = (1.0, 1.0, 1.0)


def vis(nx, ny, nz=0.0):
    return nx * VIEW[0] + ny * VIEW[1] + nz * VIEW[2] > 1e-9


def side_shade(nx, ny):
    """Darkness of a vertical face from its normal angle: +y face 0.10, +x face 0.24."""
    t = math.atan2(ny, nx) / (math.pi / 2)        # 0 at +x, 1 at +y
    t = min(max(t, 0.0), 1.0)
    return 0.24 + (0.10 - 0.24) * t


out = []
add = out.append


def face(d, cls, shade, extra=''):
    add(f'<path class="face {cls}" d="{d}"{extra}/>')
    if shade > 0:
        add(f'<path class="shade" d="{d}" fill-opacity="{shade:.3f}"/>')


# ---- shadow --------------------------------------------------------------------
sx, sy = P(W / 2 + 6, D / 2 + 6, 0)
add(f'<ellipse class="ground" cx="{sx:.1f}" cy="{sy + 14:.1f}" rx="{W * C30 * K * 0.78:.1f}" ry="{D * S30 * K * 0.62:.1f}"/>')

# ---- pocket interior -----------------------------------------------------------
zt, zf = H, H - PK['depth']
loop = rounded_rect(PK['x0'], PK['x1'], PK['y0'], PK['y1'], PK['r'])
face(fmt([P(x, y, zf) for x, y in loop]), 'f-pocket floor', 0.05)
for (x0, y0), (x1, y1) in zip(loop, loop[1:] + loop[:1]):
    tx, ty = x1 - x0, y1 - y0
    L = math.hypot(tx, ty) or 1
    nx, ny = -ty / L, tx / L                    # left normal of a CCW loop = inward
    if vis(nx, ny):
        quad = [P(x0, y0, zt), P(x1, y1, zt), P(x1, y1, zf), P(x0, y0, zf)]
        face(fmt(quad), 'f-pocket wall', side_shade(nx, ny), ' data-strip=""')

# ---- hole interior -------------------------------------------------------------
hz = H - HO['depth']
circ = arc(HO['cx'], HO['cy'], HO['r'], 0, 2 * math.pi, 48)[:-1]
face(fmt([P(x, y, hz) for x, y in circ]), 'f-hole floor', 0.30)
for (x0, y0), (x1, y1) in zip(circ, circ[1:] + circ[:1]):
    mx, my = (x0 + x1) / 2 - HO['cx'], (y0 + y1) / 2 - HO['cy']
    L = math.hypot(mx, my)
    nx, ny = -mx / L, -my / L                   # inward = toward the axis
    if vis(nx, ny):
        quad = [P(x0, y0, zt), P(x1, y1, zt), P(x1, y1, hz), P(x0, y0, hz)]
        face(fmt(quad), 'f-hole wall', side_shade(nx, ny) + 0.16, ' data-strip=""')

# ---- side faces ----------------------------------------------------------------
face(fmt([P(W, 0, H), P(W, D - RF, H), P(W, D - RF, 0), P(W, 0, 0)]), 'f-side side-x', side_shade(1, 0))
face(fmt([P(W - RF, D, H), P(0, D, H), P(0, D, 0), P(W - RF, D, 0)]), 'f-side side-y', side_shade(0, 1))
fa = arc(W - RF, D - RF, RF, 0, math.pi / 2, 14)
for (x0, y0), (x1, y1) in zip(fa, fa[1:]):
    nx, ny = (x0 + x1) / 2 - (W - RF), (y0 + y1) / 2 - (D - RF)
    L = math.hypot(nx, ny)
    quad = [P(x0, y0, H), P(x1, y1, H), P(x1, y1, 0), P(x0, y0, 0)]
    face(fmt(quad), 'f-fillet', side_shade(nx / L, ny / L), ' data-strip=""')

# ---- mesh hint on the flat sides (stage 01: 면·삼각면) --------------------------
mesh = []
for (a, b, fixed) in ((0.0, D - RF, 'x'), (0.0, W - RF, 'y')):
    n = 6
    for i in range(n):
        u0 = a + (b - a) * i / n
        u1 = a + (b - a) * (i + 1) / n
        if fixed == 'x':
            p00, p10, p01, p11 = P(W, u0, H), P(W, u1, H), P(W, u0, 0), P(W, u1, 0)
        else:
            p00, p10, p01, p11 = P(u0, D, H), P(u1, D, H), P(u0, D, 0), P(u1, D, 0)
        mesh.append(fmt([p00, p11], close=False))
        if i:
            mesh.append(fmt([p00, p01], close=False))
add('<g class="mesh">' + ''.join(f'<path d="{m}"/>' for m in mesh) + '</g>')

# ---- top face with openings ----------------------------------------------------
top = fmt([P(x, y, H) for x, y in plate_outline()])
top += ' ' + fmt([P(x, y, H) for x, y in reversed(loop)])
top += ' ' + fmt([P(x, y, H) for x, y in reversed(circ)])
add(f'<path class="face f-top" fill-rule="evenodd" d="{top}"/>')

# ---- edges ---------------------------------------------------------------------
edges = [
    fmt([P(x, y, H) for x, y in plate_outline()]),
    fmt([P(W, 0, H), P(W, 0, 0), P(W, D - RF, 0)], close=False),
    fmt([P(x, y, 0) for x, y in fa], close=False),
    fmt([P(W - RF, D, 0), P(0, D, 0), P(0, D, H)], close=False),
    fmt([P(x, y, H) for x, y in loop]),
    fmt([P(x, y, H) for x, y in circ]),
]
tangent = [fmt([P(W, D - RF, H), P(W, D - RF, 0)], close=False), fmt([P(W - RF, D, H), P(W - RF, D, 0)], close=False)]
# pocket floor edge: only the part visible through the opening is drawn (far half)
far = [(x, y) for x, y in loop if (x - PK['x0']) + (y - PK['y0']) < (PK['x1'] - PK['x0'] + PK['y1'] - PK['y0']) * 0.5 + 1]
add('<g class="edges">' + ''.join(f'<path d="{e}"/>' for e in edges) + '</g>')
add('<g class="edges thin">' + ''.join(f'<path d="{e}"/>' for e in tangent) + '</g>')

# ---- face adjacency graph ------------------------------------------------------
nodes = {
    'top': ((W * 0.30, D * 0.80, H), 'n-plain'),
    'side_x': ((W, (D - RF) / 2, H / 2), 'n-plain'),
    'side_y': (((W - RF) / 2, D, H / 2), 'n-plain'),
    'fillet': ((W - RF + RF * 0.72, D - RF + RF * 0.72, H / 2), 'n-fillet'),
    'p_floor': (((PK['x0'] + PK['x1']) / 2, (PK['y0'] + PK['y1']) / 2, zf), 'n-pocket'),
    'p_w0': ((PK['x0'], (PK['y0'] + PK['y1']) / 2, zf + PK['depth'] / 2), 'n-pocket'),
    'p_w1': (((PK['x0'] + PK['x1']) / 2, PK['y0'], zf + PK['depth'] / 2), 'n-pocket'),
    'p_w2': ((PK['x1'], (PK['y0'] + PK['y1']) / 2, zf + PK['depth'] / 2), 'n-pocket'),
    'p_w3': (((PK['x0'] + PK['x1']) / 2, PK['y1'], zf + PK['depth'] / 2), 'n-pocket'),
    'h_wall': ((HO['cx'] - HO['r'] * 0.7, HO['cy'] - HO['r'] * 0.7, H - HO['depth'] / 2), 'n-hole'),
    'h_floor': ((HO['cx'], HO['cy'], hz), 'n-hole'),
}
links = [('top', 'side_x'), ('top', 'side_y'), ('top', 'fillet'), ('side_x', 'fillet'), ('side_y', 'fillet'),
         ('top', 'p_w0'), ('top', 'p_w1'), ('top', 'p_w2'), ('top', 'p_w3'),
         ('p_w0', 'p_w1'), ('p_w1', 'p_w2'), ('p_w2', 'p_w3'), ('p_w3', 'p_w0'),
         ('p_floor', 'p_w0'), ('p_floor', 'p_w1'), ('p_floor', 'p_w2'), ('p_floor', 'p_w3'),
         ('top', 'h_wall'), ('h_wall', 'h_floor')]
g = ['<g class="graph">']
for a, b in links:
    (pa, _), (pb, _) = nodes[a], nodes[b]
    xa, ya = P(*pa)
    xb, yb = P(*pb)
    g.append(f'<line x1="{xa:.1f}" y1="{ya:.1f}" x2="{xb:.1f}" y2="{yb:.1f}"/>')
for name, (p, cls) in nodes.items():
    x, y = P(*p)
    g.append(f'<circle class="{cls}" cx="{x:.1f}" cy="{y:.1f}" r="4.2"/>')
g.append('</g>')
add(''.join(g))

# ---- feature labels (stage 02) -------------------------------------------------
def label(cls, anchor3, text, sub, dx, dy, side='left'):
    ax, ay = P(*anchor3)
    tx, ty = ax + dx, ay + dy
    hx = tx + (70 if side == 'right' else -70)
    tanchor = 'start' if side == 'right' else 'end'
    txt_x = tx + (4 if side == 'right' else -4)
    return (f'<g class="label {cls}"><path d="M{ax:.1f} {ay:.1f} L{tx:.1f} {ty:.1f} L{hx:.1f} {ty:.1f}"/>'
            f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="2.6"/>'
            f'<text x="{txt_x:.1f}" y="{ty - 6:.1f}" text-anchor="{tanchor}">{text}</text>'
            f'<text class="sub" x="{txt_x:.1f}" y="{ty + 13:.1f}" text-anchor="{tanchor}">{sub}</text></g>')


add('<g class="labels">'
    + label('l-pocket', ((PK['x0'] + PK['x1']) / 2 - 8, (PK['y0'] + PK['y1']) / 2 - 6, zf), 'POCKET', 'FEATURE 01', 104, -92, side='right')
    + label('l-hole', (HO['cx'], HO['cy'], H - HO['depth'] * 0.45), 'HOLE', 'FEATURE 02', 64, -40, side='right')
    + label('l-fillet', (W - RF + RF * 0.72, D - RF + RF * 0.72, H * 0.45), 'FILLET', 'FEATURE 03', 70, 26, side='right')
    + '</g>')

# ---- CAM (stage 03) ------------------------------------------------------------
cam = ['<g class="cam">']
# floor-level loops are clipped to the pocket opening so they never show through the top face
cam.append(f'<defs><clipPath id="hero-pocket-open"><path d="{fmt([P(x, y, H) for x, y in loop])}"/></clipPath></defs>')
cam.append('<g clip-path="url(#hero-pocket-open)">')
for inset in (TOOL_R, TOOL_R + 7, TOOL_R + 14):
    r = max(PK['r'] - inset, 1.0)
    lp = rounded_rect(PK['x0'] + inset, PK['x1'] - inset, PK['y0'] + inset, PK['y1'] - inset, r)
    cam.append(f'<path class="cut" d="{fmt([P(x, y, zf + 0.6) for x, y in lp])}"/>')
cam.append('</g>')
# helical entry above the pocket centre
pcx, pcy = (PK['x0'] + PK['x1']) / 2, (PK['y0'] + PK['y1']) / 2
hel = [(pcx + 5 * math.cos(t), pcy + 5 * math.sin(t), H + 8 - (H + 8 - zf) * t / (6 * math.pi)) for t in [i * 6 * math.pi / 90 for i in range(91)]]
cam.append(f'<path class="cut" d="{fmt([P(*q) for q in hel], close=False)}"/>')
# rapid moves at clearance
clear = H + 14
rap = [P(pcx + 5, pcy, H + 8), P(pcx + 5, pcy, clear), P(HO['cx'], HO['cy'], clear), P(HO['cx'], HO['cy'], H + 4)]
cam.append(f'<path class="rapid" d="{fmt(rap, close=False)}"/>')
# drilling cycle with peck marks
d0, d1 = P(HO['cx'], HO['cy'], H + 4), P(HO['cx'], HO['cy'], hz + 1)
cam.append(f'<path class="cut" d="M{d0[0]:.1f} {d0[1]:.1f} L{d1[0]:.1f} {d1[1]:.1f}"/>')
for z in (H - 3, H - 8, H - 13):
    x, y = P(HO['cx'], HO['cy'], z)
    cam.append(f'<path class="peck" d="M{x - 5:.1f} {y:.1f} L{x + 5:.1f} {y:.1f}"/>')
# contour finishing pass around the visible outer profile (offset by tool radius)
cz = H * 0.62
prof = [(W + TOOL_R, 0.0), (W + TOOL_R, D - RF)] + arc(W - RF, D - RF, RF + TOOL_R, 0, math.pi / 2, 14) + [(0.0, D + TOOL_R)]
cam.append(f'<path class="cut contour" d="{fmt([P(x, y, cz) for x, y in prof], close=False)}"/>')
cam.append('</g>')
add(''.join(cam))

# ---- setup origin (WCS) at the far top corner -----------------------------------
o = P(0, 0, H)
# P() sends model +x to screen right-down and +y to left-down. Seen from (1,1,1) with z up, a
# right-handed frame has X going left-down and Y right-down, so the screen axes are labelled that way.
ax = [('y', P(26, 0, H), 'Y'), ('x', P(0, 26, H), 'X'), ('z', P(0, 0, H + 26), 'Z')]
w = ['<g class="wcs">']
for cls, (x, y), t in ax:
    w.append(f'<path class="ax-{cls}" d="M{o[0]:.1f} {o[1]:.1f} L{x:.1f} {y:.1f}"/>')
    lx = x + (6 if x > o[0] + 1 else -10 if x < o[0] - 1 else -3)
    ly = y + (8 if cls != 'z' else -4)
    w.append(f'<text x="{lx:.1f}" y="{ly:.1f}">{t}</text>')
w.append(f'<circle cx="{o[0]:.1f}" cy="{o[1]:.1f}" r="2.6"/>')
w.append(f'<text class="wcs-label" x="{o[0] + 10:.1f}" y="{o[1] - 16:.1f}">WCS</text>')
w.append('</g>')
add(''.join(w))

svg = ('<svg viewBox="0 0 560 400" role="img"\n'
       '  [attr.class]="\'cad-figure stage-\' + stage"\n'
       '  [attr.aria-label]="label">\n  ' + '\n  '.join(out) +
       '\n  <text class="figure-note" x="540" y="388" text-anchor="end">{{ note }}</text>\n</svg>\n')
open(sys.argv[1], 'w', encoding='utf-8').write(svg)

print('elements', len(out), 'bytes', len(svg))
