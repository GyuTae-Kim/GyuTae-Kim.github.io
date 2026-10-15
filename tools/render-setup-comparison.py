"""Render both sides of the actual 302_1 STEP for the setup-change explanation.

Run with the same pythonocc / numpy / Pillow environment as render-feature-examples.py:
  python tools/render-setup-comparison.py --evidence /path/to/302-variants-native-20261003
The neutral-colour renders show design geometry, not machining simulation or AI labels.
"""

import argparse
import hashlib
import json
from pathlib import Path
import runpy


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evidence', type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    config = json.loads((root / 'tools/setup-comparison-sources.json').read_text())
    render = runpy.run_path(str(root / 'tools/render-feature-examples.py'))['render']
    for view in config['views']:
        source = args.evidence / view['source']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == view['sha256'], source
        render(source, view['camera'], root / view['asset'], training_labels=False)
        print(view['asset'], flush=True)
