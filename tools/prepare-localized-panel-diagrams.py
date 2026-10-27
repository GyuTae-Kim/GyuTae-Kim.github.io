"""Localize the text nodes of the original panel SVGs without changing geometry."""
from pathlib import Path
import argparse,hashlib,json,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent.parent
LANGS=['en','ja','zh-CN','de']
TEXT={
'기준면과의 거리 유지':['Keep a fixed offset','基準面からの距離を維持','保持与基准面的距离','Abstand zur Bezugsfläche beibehalten'],
'공간의 비율 유지':['Keep the space ratio','空間の比率を維持','保持空间比例','Raumverhältnis beibehalten'],
'폭 변경 전':['Before','幅変更前','宽度修改前','Breite vorher'],
'폭 증가 후':['After widening','幅を広げた後','宽度增加后','Breite nachher'],
'일정':['Fixed','一定','固定','Konstant'],
'정면에서 본 폭 변경 예시 · 판 두께 생략':['Front view · Panel thickness omitted','正面から見た幅変更・板厚は省略','正面宽度变化示意 · 省略板厚','Vorderansicht · Plattendicke nicht dargestellt']}
ET.register_namespace('','http://www.w3.org/2000/svg')
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--proof',type=Path,required=True)
args=parser.parse_args()
proof=[]
for i,lang in enumerate(LANGS):
 catalog=json.loads((ROOT/f'src/app/i18n/{lang}.json').read_text())
 for source in sorted((ROOT/'src/assets/cases/panel/types').glob('*.svg')):
  root=ET.fromstring(source.read_text());title=root.find('{*}title');label=title.text.split(':')[0].removesuffix(' 위치');name=catalog.get(label)
  assert name and not any('가'<=c<='힣' for c in name),(lang,label)
  title.text=[f'{name} location',f'{name}の位置',f'{name}的位置',f'Position: {name}'][i]
  root.find('{*}desc').text=['Location diagram: the selected panel is blue; surrounding panels are gray.','位置を示す模式図です。選択した板材は青、周囲の板材は灰色で示します。','位置示意图：所选板件为蓝色，周围板件为灰色。','Positionsdiagramm: Die gewählte Platte ist blau, die umgebenden Platten sind grau.'][i]
  for node in root.findall('.//{*}text'):
   if node.text in TEXT:node.text=TEXT[node.text][i]
   if node.get('font-size')=='15':node.set('font-size','13')
  root.set('{http://www.w3.org/XML/1998/namespace}lang',lang)
  target=ROOT/f'src/assets/i18n/{lang}/cases/panel/types/{source.name}';target.parent.mkdir(parents=True,exist_ok=True);ET.ElementTree(root).write(target,encoding='unicode')
  assert not any('가'<=c<='힣' for c in target.read_text())
  proof.append({'source':str(source.relative_to(ROOT)),'language':lang,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
args.proof.parent.mkdir(parents=True,exist_ok=True)
args.proof.write_text(json.dumps({'all_pass':True,'outputs':proof},indent=2)+'\n')
print('Localized',len(proof),'SVG panel diagrams; original geometry retained.')
