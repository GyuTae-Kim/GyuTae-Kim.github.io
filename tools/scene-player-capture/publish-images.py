"""Turn two captures from the Scene player capture workflow into the portfolio images.

  python3 tools/scene-player-capture/publish-images.py \
      --player <player-cand-NN.png> --detail <detail-cand-NN.png> --thumb-crop x,y,w,h

Requires Pillow and cwebp. The player capture keeps its pixels (the window is captured at
1100 px wide); the panel capture is also saved at 1100 px wide for the page.
"""
import argparse
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent.parent
TARGET = ROOT / 'src/assets/cases/scene-player'


def encode(image, name, quality):
    with tempfile.NamedTemporaryFile(suffix='.png') as png:
        image.save(png.name)
        subprocess.run(
            ['cwebp', '-quiet', '-q', str(quality), '-m', '6', '-sharp_yuv', png.name, '-o', str(TARGET / name)],
            check=True,
        )
    print(f'{name}: {image.width}x{image.height}, {(TARGET / name).stat().st_size} bytes')


def scaled(image, width):
    if image.width == width:
        return image
    return image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)


parser = argparse.ArgumentParser()
parser.add_argument('--player', type=Path, required=True)
parser.add_argument('--detail', type=Path, required=True)
parser.add_argument('--thumb-crop', required=True, help='x,y,w,h in the player capture, 8:5')
args = parser.parse_args()

player = Image.open(args.player).convert('RGB')
detail = Image.open(args.detail).convert('RGB')
encode(player, 'player.webp', 92)
encode(scaled(player, 1100), 'player-1100.webp', 84)
encode(detail, 'detail.webp', 92)
encode(scaled(detail, 1100), 'detail-1100.webp', 84)

x, y, w, h = (int(value) for value in args.thumb_crop.split(','))
assert abs(w / h - 1.6) < 0.01, 'the thumbnail crop must be 8:5'
thumb = player.crop((x, y, x + w, y + h))
encode(scaled(thumb, 672), 'thumb-scene-player-672.webp', 82)
encode(scaled(thumb, 336), 'thumb-scene-player-336.webp', 82)
