"""Register only complete four-language image families in the browser asset manifest."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parent.parent
codes=['en','ja','zh-CN','de'];sets=[]
for code in codes:
 root=ROOT/'src/assets/i18n'/code
 sets.append({str(p.relative_to(root)) for p in root.rglob('*') if p.is_file()})
assert all(paths==sets[0] for paths in sets), 'A locale is missing an image variant'
paths=sorted('assets/'+path for path in sets[0])
assert all((ROOT/'src'/path).is_file() for path in paths)
refs=json.loads((ROOT/'tools/image-localization-references.json').read_text())
references={r['path'] for r in refs['images']+refs['derivatives']}
labels=json.loads((ROOT/'tools/image-localization-labels.json').read_text())
references.update(r['path'] for r in labels['images']+labels['derivatives'] if '/operations/' in r['path'])
for r in json.loads((ROOT/'tools/localized-capture-labels.json').read_text())['images']:
 if r['layers']:references.update([r['path'],r['path'].replace('-1440.','-720.')])
manifest={'paths':paths,'references':sorted(references)}
(ROOT/'src/app/i18n/image-assets.json').write_text(json.dumps(manifest,indent=2)+'\n')
policy={'languages':['ko']+codes,'localizedImageFamilies':len(paths),'foreignVariants':len(paths)*4,'originals':'Korean assets remain unchanged. Translated reference images keep links to the original evidence.','sharedAssets':'Geometry without authored text, portraits, official logos and source identifiers do not need language duplicates.','capturePolicy':'Actual public browser captures at 1440×900. Only labels of public synthetic examples are translated in the reference images; original data files, filename/layout identifiers and geometry stay unchanged.','originalImageSha256':{path:hashlib.sha256((ROOT/'src'/path).read_bytes()).hexdigest() for path in paths}}
(ROOT/'tools/image-localization-policy.json').write_text(json.dumps(policy,ensure_ascii=False,indent=2)+'\n')
print(f'Registered {len(paths)} image families and {len(paths)*4} locale variants.')
