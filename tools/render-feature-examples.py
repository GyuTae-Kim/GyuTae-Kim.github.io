"""Render the six portfolio examples from hash-checked annotated training STEP files.

Run in a Python environment with pythonocc-core, numpy and Pillow:
  python tools/render-feature-examples.py --steps /path/to/training/steps
Source data is read only. Face colours are training annotations, not predictions.
"""

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageColor
from OCC.Core.BRep import BRep_Tool
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.IFSelect import IFSelect_RetDone
from OCC.Core.STEPControl import STEPControl_Reader
from OCC.Core.StepRepr import StepRepr_RepresentationItem
from OCC.Core.TopAbs import TopAbs_REVERSED
from OCC.Core.TopLoc import TopLoc_Location
from OCC.Extend.TopologyUtils import TopologyExplorer

PALETTE = {
    '0': ('through_hole', '#287abb'),
    '1': ('blind_hole', '#7c62b5'),
    '4': ('opened_pocket', '#168f8b'),
    '5': ('closed_pocket', '#d49a32'),
    '6': ('chamfer', '#da6e58'),
    '7': ('stock', '#bcc8ce'),
    '8': ('fillet', '#c84e86'),
}


def render(source, camera, target, training_labels=True):
    reader = STEPControl_Reader()
    assert reader.ReadFile(str(source)) == IFSelect_RetDone
    assert reader.TransferRoots() > 0
    shape = reader.OneShape()
    BRepMesh_IncrementalMesh(shape, 0.04, False, 0.16, True).Perform()
    triangles, colours, labels = [], [], []
    for face in TopologyExplorer(shape).faces():
        annotation = '7'
        if training_labels:
            entity = reader.WS().TransferReader().EntityFromShapeResult(face, 1)
            annotation = StepRepr_RepresentationItem.DownCast(entity).Name().ToCString()
            if annotation in ('2', '3'):
                annotation = '7'
        label, colour = PALETTE[annotation]
        labels.append(label)
        loc = TopLoc_Location()
        mesh = BRep_Tool.Triangulation(face, loc)
        if mesh is None:
            continue
        for index in range(1, mesh.NbTriangles() + 1):
            nodes = list(mesh.Triangle(index).Get())
            if face.Orientation() == TopAbs_REVERSED:
                nodes.reverse()
            triangles.append([mesh.Node(i).Transformed(loc.Transformation()).Coord() for i in nodes])
            colours.append(ImageColor.getrgb(colour))
    triangles = np.array(triangles)
    camera = np.array(camera, dtype=float)
    camera /= np.linalg.norm(camera)
    hint = np.array([0., 0., 1.])
    right = np.cross(hint, camera)
    right /= np.linalg.norm(right)
    up = np.cross(camera, right)
    basis = np.array([right, up, camera]).T
    screen = triangles @ basis
    bounds = screen.reshape(-1, 3)
    center = (bounds.min(0) + bounds.max(0)) / 2
    width, height = 960, 720
    scale = min((width - 110) / np.ptp(bounds[:, 0]), (height - 100) / np.ptp(bounds[:, 1]))
    screen -= center
    screen[:, :, 0] = screen[:, :, 0] * scale + width / 2
    screen[:, :, 1] = -screen[:, :, 1] * scale + height / 2
    normals = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
    normals /= np.maximum(np.linalg.norm(normals, axis=1)[:, None], 1e-12)
    light = camera + up * .6 - right * .35
    light /= np.linalg.norm(light)
    shade = .58 + .42 * np.maximum(normals @ light, 0)
    colours = np.clip(np.array(colours) * shade[:, None], 0, 255).astype(np.uint8)
    pixels = np.full((height, width, 3), [246, 248, 250], dtype=np.uint8)
    depth = np.full((height, width), -np.inf)
    for vertices, colour in zip(screen, colours):
        x0, y0 = np.maximum(np.floor(vertices[:, :2].min(0)).astype(int), 0)
        x1, y1 = np.minimum(np.ceil(vertices[:, :2].max(0)).astype(int), [width - 1, height - 1])
        if x0 > x1 or y0 > y1:
            continue
        v = vertices
        denominator = (v[1, 1] - v[2, 1]) * (v[0, 0] - v[2, 0]) + (v[2, 0] - v[1, 0]) * (v[0, 1] - v[2, 1])
        if abs(denominator) < 1e-10:
            continue
        yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1] + .5
        a = ((v[1, 1] - v[2, 1]) * (xx - v[2, 0]) + (v[2, 0] - v[1, 0]) * (yy - v[2, 1])) / denominator
        b = ((v[2, 1] - v[0, 1]) * (xx - v[2, 0]) + (v[0, 0] - v[2, 0]) * (yy - v[2, 1])) / denominator
        c = 1 - a - b
        z = a * v[0, 2] + b * v[1, 2] + c * v[2, 2]
        region = depth[y0:y1 + 1, x0:x1 + 1]
        visible = (a >= -1e-8) & (b >= -1e-8) & (c >= -1e-8) & (z > region)
        region[visible] = z[visible]
        pixels[y0:y1 + 1, x0:x1 + 1][visible] = colour
    Image.fromarray(pixels).save(target, quality=88, method=6)
    return dict(face_count=len(labels), face_labels=dict(Counter(labels)))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--steps', type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    config = json.loads((root / 'tools/cad-feature-examples.json').read_text())
    out = root / 'src/assets/cases/feature-cam/examples'
    out.mkdir(parents=True, exist_ok=True)
    evidence = []
    for example in config['examples']:
        source = args.steps / example['source']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == example['sha256'], source
        result = render(source, example['camera'], out / (example['id'] + '.webp'))
        evidence.append(dict(**example, **result))
        print(example['id'], result, flush=True)
    evidence_path = root / '.runtime/cad-feedback/render-evidence.json'
    evidence_path.parent.mkdir(parents=True, exist_ok=True)
    evidence_path.write_text(json.dumps(evidence, indent=2) + '\n')
