"""Card/case figure 04 — panel role classification (synthetic geometry).

Left: an exploded cabinet whose panels are colored by role. Right: the same panels as a
contact graph laid out like the cabinet's front elevation, so edges never cross the 3D
drawing. Edges are physical contacts only; the door is linked to the side it hangs on by
a dashed hinge edge, because it touches the carcass only through the hinge."""
import sys

from iso import BASE_CSS, PALETTE, box_faces, fit, path, shade_for, svg_doc

W, D, H, T = 600.0, 560.0, 720.0, 18.0
TB = 9.0

# name, role, box (x0,x1,y0,y1,z0,z1), explode offset
panels = [
    ('back', 'back', (T, W - T, 0, TB, T, H - T), (0, -120, 0)),
    ('left', 'side', (0, T, 0, D, 0, H), (-120, 0, 0)),
    ('bottom', 'topbot', (T, W - T, TB, D, 0, T), (0, 0, -80)),
    ('shelf', 'shelf', (T, W - T, TB, D - 30, H / 2 - T / 2, H / 2 + T / 2), (0, 0, 0)),
    ('top', 'topbot', (T, W - T, TB, D, H - T, H), (0, 0, 90)),
    ('right', 'side', (W - T, W, 0, D, 0, H), (120, 0, 0)),
    ('door', 'door', (0, W, D + 3, D + 3 + T, 0, H), (0, 150, 0)),
]
ROLE = {
    'side': ('blue', 'SIDE'), 'topbot': ('orange', 'TOP · BOTTOM'), 'back': ('stone', 'BACK'),
    'shelf': ('green', 'SHELF'), 'door': ('sand', 'DOOR'),
}
ROLE_OF = {name: role for name, role, _, _ in panels}
contacts = [('left', 'top'), ('right', 'top'), ('left', 'bottom'), ('right', 'bottom'),
            ('left', 'shelf'), ('right', 'shelf'),
            ('back', 'left'), ('back', 'right'), ('back', 'top'), ('back', 'bottom'), ('back', 'shelf')]
hinges = [('door', 'left')]


def corners(b):
    x0, x1, y0, y1, z0, z1 = b
    return [(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (z0, z1)]


def moved(b, o):
    x0, x1, y0, y1, z0, z1 = b
    return (x0 + o[0], x1 + o[0], y0 + o[1], y1 + o[1], z0 + o[2], z1 + o[2])


def center(b):
    return ((b[0] + b[1]) / 2, (b[2] + b[3]) / 2, (b[4] + b[5]) / 2)


body = []

# ---- left: exploded cabinet ------------------------------------------------------------
iso = fit([q for _, _, b, o in panels for q in corners(moved(b, o))], (14, 40, 300, 348))
ghost = [iso.p(0, 0, H), iso.p(W, 0, H), iso.p(W, D, H), iso.p(0, D, H)]
body.append(f'<path d="{path(ghost)}" fill="none" stroke="#9aaa9e" stroke-width="1" stroke-dasharray="3 4"/>')
order = sorted(panels, key=lambda p: sum(center(moved(p[2], p[3]))))
for name, role, b, o in order:
    color = PALETTE[ROLE[role][0]]
    for n, quad in box_faces(*moved(b, o)):
        d = path([iso.p(*q) for q in quad])
        body.append(f'<path d="{d}" fill="{color}" stroke="#4c6255" stroke-width="1"/>')
        s = shade_for(n)
        if s:
            body.append(f'<path class="sh" d="{d}" fill-opacity="{s:.2f}"/>')

# ---- divider ---------------------------------------------------------------------------
body.append('<line x1="320" y1="44" x2="320" y2="344" stroke="#d9dfd7" stroke-width="1"/>')

# ---- right: contact graph in front-elevation layout ----------------------------------------
pos = {
    'top': (448, 92), 'shelf': (448, 196), 'bottom': (448, 300),
    'left': (370, 196), 'right': (526, 196), 'back': (478, 152), 'door': (370, 300),
}
g = ['<g stroke="#2c4436" stroke-width="1.2" stroke-opacity=".6">']
for a, c in contacts:
    (xa, ya), (xc, yc) = pos[a], pos[c]
    g.append(f'<line x1="{xa}" y1="{ya}" x2="{xc}" y2="{yc}"/>')
for a, c in hinges:
    (xa, ya), (xc, yc) = pos[a], pos[c]
    g.append(f'<line x1="{xa}" y1="{ya}" x2="{xc}" y2="{yc}" stroke-dasharray="4 4"/>')
g.append('</g>')
for name, (x, y) in pos.items():
    key, _ = ROLE[ROLE_OF[name]]
    g.append(f'<circle cx="{x}" cy="{y}" r="11" fill="{PALETTE[key]}" stroke="{PALETTE[key + "_ink"]}" stroke-width="1.6"/>')
label = {'top': ('TOP', 0, -18), 'shelf': ('SHELF', 0, 26), 'bottom': ('BOTTOM', 0, 27),
         'left': ('SIDE', 0, -18), 'right': ('SIDE', 0, 27), 'back': ('BACK', -32, 4), 'door': ('DOOR', 0, 27)}
for name, (t, dx, dy) in label.items():
    x, y = pos[name]
    g.append(f'<text x="{x + dx}" y="{y + dy}" font-size="9.5" fill="#4f5c54" text-anchor="middle">{t}</text>')
xh, yh = pos['door'][0], (pos['door'][1] + pos['left'][1]) / 2
g.append(f'<text x="{xh - 8}" y="{yh + 3}" font-size="9" fill="#6b766e" text-anchor="end">HINGE</text>')
body.append(''.join(g))

# ---- legend and titles -----------------------------------------------------------------
lx, ly = 16, 376
x = lx
leg = []
for role in ['side', 'topbot', 'back', 'shelf', 'door']:
    key, text = ROLE[role]
    leg.append(f'<rect x="{x}" y="{ly - 9}" width="11" height="11" rx="2" fill="{PALETTE[key]}" stroke="#4c6255" stroke-width=".8"/>')
    leg.append(f'<text x="{x + 16}" y="{ly}" font-size="10" fill="#4f5c54">{text}</text>')
    x += 16 + len(text) * 6.4 + 16
leg.append(f'<line x1="{x + 4}" y1="{ly - 4}" x2="{x + 24}" y2="{ly - 4}" stroke="#2c4436" stroke-opacity=".6" stroke-width="1.2"/>')
leg.append(f'<text x="{x + 30}" y="{ly}" font-size="10" fill="#4f5c54">CONTACT</text>')
body.append(''.join(leg))
body.append('<text x="16" y="24" font-size="10" fill="#6b766e">EXPLODED PANELS</text>')
body.append('<text x="544" y="24" font-size="10" fill="#6b766e" text-anchor="end">CONTACT GRAPH</text>')

svg = svg_doc(560, 390, ''.join(body), BASE_CSS,
              '판재 역할 분류 개념도: 분해한 가구 몸통의 판재를 역할별 색으로 표시하고, 같은 판재를 접촉 관계 그래프로 정리')
open(sys.argv[1], 'w', encoding='utf-8').write(svg)
print(len(svg))
