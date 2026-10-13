"""Shared helpers for the portfolio figures: isometric projection (viewer along (1,1,1)),
box faces with back-face culling, and SVG writing."""
import math

C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))
VIEW = (1.0, 1.0, 1.0)

PALETTE = {
    'ink': '#202d28', 'edge': '#4c6255', 'paper': '#f7f8f4', 'panel': '#eff2eb',
    'muted': '#6b766e', 'accent': '#b2552f',
    'orange': '#e7b892', 'green': '#86b39a', 'blue': '#a9bcd6', 'sand': '#e6d8bf',
    'stone': '#cfd5cc', 'rose': '#d9b0a3',
    'orange_ink': '#8e4c2e', 'green_ink': '#2f5a45', 'blue_ink': '#3e5f88', 'sand_ink': '#6f5133',
    'stone_ink': '#4f5c54', 'rose_ink': '#7d4434',
}

MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'


class Iso:
    def __init__(self, k, ox, oy):
        self.k, self.ox, self.oy = k, ox, oy

    def p(self, x, y, z):
        return (self.ox + (x - y) * C30 * self.k, self.oy + (x + y) * S30 * self.k - z * self.k)


def path(pts, close=True):
    s = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return s + (' Z' if close else '')


def visible(n):
    return n[0] * VIEW[0] + n[1] * VIEW[1] + n[2] * VIEW[2] > 1e-9


def shade_for(n):
    """Darkness overlay for a face normal: top 0, +y 0.10, +x 0.24, between interpolated."""
    nx, ny, nz = n
    if nz > 0.99:
        return 0.0
    t = math.atan2(ny, nx) / (math.pi / 2)
    t = min(max(t, 0.0), 1.0)
    side = 0.24 + (0.10 - 0.24) * t
    return side * (1 - max(nz, 0.0))


def box_faces(x0, x1, y0, y1, z0, z1):
    """Visible faces of an axis-aligned box as (normal, 3D quad)."""
    faces = [
        ((0, 0, 1), [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]),
        ((1, 0, 0), [(x1, y0, z1), (x1, y1, z1), (x1, y1, z0), (x1, y0, z0)]),
        ((0, 1, 0), [(x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)]),
    ]
    return [(n, q) for n, q in faces if visible(n)]


def svg_doc(w, h, body, css, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}">'
            f'<title>{title}</title><style>{css}</style>{body}</svg>\n')


BASE_CSS = (
    f'text{{font-family:{MONO};letter-spacing:.4px}}'
    '.e{fill:none;stroke:#4c6255;stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round}'
    '.sh{fill:#12251b;stroke:none}'
)


def fit(points3d, box, k_max=10.0):
    """Iso whose projection of points3d fits inside box=(x0, y0, x1, y1), centred."""
    probe = Iso(1.0, 0.0, 0.0)
    pts = [probe.p(*q) for q in points3d]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    bw, bh = box[2] - box[0], box[3] - box[1]
    k = min(bw / (max(xs) - min(xs)), bh / (max(ys) - min(ys)), k_max)
    ox = box[0] + (bw - (max(xs) - min(xs)) * k) / 2 - min(xs) * k
    oy = box[1] + (bh - (max(ys) - min(ys)) * k) / 2 - min(ys) * k
    return Iso(k, ox, oy)
