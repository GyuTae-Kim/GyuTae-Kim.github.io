"""Export localized screenshot reference labels from hash-checked capture inputs."""
import sys
sys.dont_write_bytecode=True
import argparse,hashlib,importlib.util,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('images',ROOT/'tools/prepare-localized-images.py');images=importlib.util.module_from_spec(spec);spec.loader.exec_module(images)
parser=argparse.ArgumentParser();parser.add_argument('--work',type=Path,required=True);args=parser.parse_args()
rows=json.loads((ROOT/'tools/localized-capture-labels.json').read_text())['images']
for row in rows:
 source=ROOT/row['source'];assert hashlib.sha256(source.read_bytes()).hexdigest()==row['sourceSha256']
 lang=row['language'];target=images.target(row['path'],lang)
 if row['layers']:images.raster(images.svg_layers(row,lang,Image.open(source).convert('RGB')),target,args.work)
 else:images.run(['cwebp','-quiet','-q','88',source,'-o',target])
 small=images.target(row['path'].replace('-1440.','-720.'),lang)
 images.run(['cwebp','-quiet','-q','88','-resize','720','450',target,'-o',small])
print('Exported 32 native screenshot variants; source capture bytes and filenames retained.')
