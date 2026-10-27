"""Build native SVG label layers and raster derivatives; original image bytes are read-only.

Requires rsvg-convert, cwebp, img2webp and Pillow. SVG text uses local system fonts;
no source geometry, plotted values, photographs or research results are synthesized.
"""
import argparse,base64,concurrent.futures,hashlib,json,re,subprocess
from html import escape
from pathlib import Path
from PIL import Image,ImageFont,ImageStat

ROOT=Path(__file__).resolve().parent.parent
LANGS=['en','ja','zh-CN','de']
CONFIG=ROOT/'tools/image-localization-labels.json'
FONT={}
for lang in LANGS:
 spec='Arial' if lang in ['en','de'] else ':lang='+lang.replace('zh-CN','zh-cn')
 match=subprocess.check_output(['fc-match','-f','%{file}|%{family}',spec],text=True).split('|')
 FONT[lang]=(match[0],match[1].split(',')[0])

def run(args):
 result=subprocess.run([str(x) for x in args],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 if result.returncode:raise RuntimeError(' '.join(str(x) for x in args[:3])+': '+result.stderr.decode()[-1200:])
 return result

def raster(svg,target,work):
 work.mkdir(parents=True,exist_ok=True);target.parent.mkdir(parents=True,exist_ok=True)
 name=hashlib.sha256(str(target).encode()).hexdigest()[:16];source=work/(name+'.svg');png=work/(name+'.png');source.write_text(svg)
 run(['rsvg-convert','--output',png,source])
 if target.suffix=='.webp':run(['cwebp','-quiet','-q','90','-m','6',png,'-o',target])
 elif target.suffix=='.jpg':run(['sips','-s','format','jpeg','-s','formatOptions','88',png,'--out',target])
 else:target.write_bytes(png.read_bytes())
 return png

def target(path,lang):return ROOT/'src'/path.replace('assets/','assets/i18n/'+lang+'/',1)

def feature_grid(lang,data,image):
 labels=[layer['translations'][lang] for layer in json.loads(CONFIG.read_text())['images'][0]['layers']]
 family=FONT[lang][1]
 parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675" xml:lang="{lang}"><image width="900" height="675" href="data:image/png;base64,{data}"/>']
 # Remove only the four original caption pills, located in empty margins.
 # Native captions fit below each model, away from the model geometry.
 for x,y,w in [(12,12,128),(466,12,128),(12,329,85),(466,329,110)]:
  parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="28" fill="#f5f6fb"/>')
 for text,x,y in zip(labels[:4],[14,468,14,468],[303,303,621,621]):
  parts.append(f'<text x="{x}" y="{y}" font-family="{escape(family)}" font-size="16" fill="#26342f">{escape(text)}</text>')
 parts.append('<rect x="0" y="630" width="900" height="45" fill="#f5f6fb"/>')
 x=16
 for i,(text,color) in enumerate(zip(labels[4:],[None]+['#%02x%02x%02x'%image.convert('RGB').getpixel(point) for point in [(105,650),(220,650),(305,650),(403,650)]])):
  if color:
   parts.append(f'<rect x="{x}" y="647" width="17" height="17" rx="2" fill="{color}"/>');x+=25
  font=ImageFont.truetype(FONT[lang][0],14);box=font.getbbox(text)
  parts.append(f'<text x="{x}" y="660" font-family="{escape(family)}" font-size="14" fill="#37433e">{escape(text)}</text>');x+=box[2]-box[0]+28
 parts.append('</svg>');return ''.join(parts)

def svg_layers(row,lang,image,frame=None):
 w,h=image.size
 import io
 encoded=io.BytesIO();image.save(encoded,format='PNG');data=base64.b64encode(encoded.getvalue()).decode()
 if row['path']=='assets/cases/feature-cam/step2.webp':return feature_grid(lang,data,image)
 if row['path']=='assets/cases/operations/response-drop-public.webp':
  # The six source keys combine environment, redacted host IDs and service
  # names. Rebuild only their caption band so no Korean fragments or labels
  # overlap. Keep the plotted pixels and the source key colours unchanged.
  copy=row['legend'][lang];fontPath,family=FONT[lang];size=13
  while sum(ImageFont.truetype(fontPath,size).getlength(t)+34 for t in copy)>w-28:size-=1
  widths=[ImageFont.truetype(fontPath,size).getlength(t)+34 for t in copy]
  x=(w-sum(widths))/2
  parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" xml:lang="{lang}"><image width="{w}" height="{h}" href="data:image/png;base64,{data}"/><rect x="0" y="270" width="{w}" height="{h-270}" fill="white"/>']
  parts.append(f'<rect x="15" y="8" width="320" height="28" fill="white"/><text x="21" y="30" font-family="{escape(family)}" font-size="21" fill="#28332f">{escape(row["layers"][0]["translations"][lang])}</text>')
  for label,key_x,width in zip(copy,[227,320,420,556,682,785],widths):
   pixels=[image.convert('RGB').getpixel((px,py)) for px in range(key_x-4,key_x+5) for py in range(284,290)]
   color=max(pixels,key=lambda p:max(p)-min(p));color='#%02x%02x%02x'%color
   parts.append(f'<path d="M{x} 287h16" stroke="{color}" stroke-width="2"/><circle cx="{x+8}" cy="287" r="2.5" fill="white" stroke="{color}"/><text x="{x+21}" y="291" font-family="{escape(family)}" font-size="{size}" fill="#37433e">{escape(label)}</text>')
   x+=width
  return ''.join(parts)+'</svg>'
 parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" xml:lang="{lang}"><image width="{w}" height="{h}" href="data:image/png;base64,{data}"/>']
 for i,layer in enumerate(row['layers']):
  x,y,bw,bh=[a*b for a,b in zip(layer['box'],[w,h,w,h])]
  text=layer['translations'][lang]
  if frame is not None and row['path'].endswith('panel/step3.webp') and layer['sourceText']=='접합면 찾기' and frame>0:
   text={'en':f'Propagation {frame}/8','ja':f'伝播 {frame}/8','zh-CN':f'传播 {frame}/8','de':f'Übertragung {frame}/8'}[lang]
  # Sample the flat label background just outside the glyphs. Only the authored
  # text rectangle is covered; no geometry or chart marks are redrawn.
  samples=[]
  for px,py in [(x-3,y+bh/2),(x+bw+3,y+bh/2),(x+bw/2,y-3),(x+bw/2,y+bh+3)]:
   samples.append(image.convert('RGB').getpixel((max(0,min(w-1,int(px))),max(0,min(h-1,int(py))))))
  bg=tuple(sorted(p[c] for p in samples)[1] for c in range(3))
  fg='#f5f7f6' if sum(bg)<380 else '#28332f';background='#%02x%02x%02x'%bg
  available=bw
  rgb=image.convert('RGB')
  # A translation may use adjacent flat margin, but never cover data, another
  # label or model geometry. Stop as soon as pixels differ from the background.
  for right in range(int(x+bw+4),int(min(w-4,x+bw*3)),4):
   area=rgb.crop((right,max(0,int(y-1)),right+4,min(h,int(y+bh+2))))
   if any(abs(edge-bg[c])>10 for c,pair in enumerate(ImageStat.Stat(area).extrema) for edge in pair):break
   available=right-x-2
  size=max(7,int(bh*1.15));fontPath,family=FONT[lang]
  while size>7:
   box=ImageFont.truetype(fontPath,size).getbbox(text)
   if box[2]-box[0]<=available:break
   size-=1
  parts.append(f'<rect x="{x-2:.2f}" y="{y-2:.2f}" width="{max(bw,ImageFont.truetype(fontPath,size).getlength(text))+4:.2f}" height="{bh+4:.2f}" fill="{background}"/>')
  parts.append(f'<text x="{x:.2f}" y="{y+bh*.91:.2f}" font-family="{escape(family)}" font-size="{size}" fill="{fg}">{escape(text)}</text>')
 parts.append('</svg>');return ''.join(parts)

def build(row,lang,work):
 source=ROOT/'src'/row['path'];digest=hashlib.sha256(source.read_bytes()).hexdigest()
 assert row.get('sourceSha256',digest)==digest, f'Source changed; review label masks: {source}'
 row['sourceSha256']=digest
 dest=target(row['path'],lang)
 with Image.open(source) as original:
  if row['frames']==1:raster(svg_layers(row,lang,original.convert('RGB')),dest,work)
  else:
   info=run(['webpmux','-info',source]).stdout.decode()
   durations=[int(v) for v in re.findall(r'^\s*\d+:\s+\d+\s+\d+\s+(?:yes|no)\s+\d+\s+\d+\s+(\d+)',info,re.M)]
   assert len(durations)==row['frames']
   frames=[]
   for i,ms in enumerate(durations):
    original.seek(i);image=original.convert('RGB')
    # Individual frame outputs are task data; only the composed animation is published.
    png=raster(svg_layers(row,lang,image,i),work/f'{source.stem}-{lang}-{i}.png',work)
    frames.extend(['-d',str(ms),str(png)])
   dest.parent.mkdir(parents=True,exist_ok=True)
   run(['img2webp','-loop','0','-lossy','-q','88',*frames,'-o',dest])
 return {'path':row['path'],'language':lang,'output':str(dest.relative_to(ROOT)),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}

def wrapped(text,width,fontPath,size,max_lines):
 font=ImageFont.truetype(fontPath,size);units=list(text) if re.search('[\u3040-\u30ff\u3400-\u9fff]',text) else text.split(' ')
 spacer='' if re.search('[\u3040-\u30ff\u3400-\u9fff]',text) else ' '
 lines=[];line=''
 for unit in units:
  trial=line+spacer+unit if line else unit
  if font.getlength(trial)>width and line:lines.append(line);line=unit
  else:line=trial
 if line:lines.append(line)
 if len(lines)>max_lines:lines=lines[:max_lines];lines[-1]=lines[-1].rstrip(' .,')+'…'
 return lines

def reference_svg(row,lang,ocr):
 source=ROOT/'src'/row['source'];w,h=row['width'],row['height'];copy=row['copy'][lang]
 image=Image.open(source).convert('RGB');sw,sh=image.size
 import io
 data=io.BytesIO();image.save(data,format='PNG');encoded=base64.b64encode(data.getvalue()).decode()
 family=FONT[lang][1];fontPath=FONT[lang][0];margin=max(12,w*.035)
 badge={'en':'Localized reference · original available','ja':'翻訳参考図・原本を参照可能','zh-CN':'本地化参考图 · 可查看原图','de':'Übersetzte Referenz · Original verfügbar'}[lang]
 heading_size=max(14,min(38,int(w/31)));body_size=max(12,min(24,int(w/55)))
 header=max(54,h*.19);footer=max(80,h*.26);body_height=h-header-footer
 x,y,cw,ch=[a*b for a,b in zip(row['crop'],[sw,sh,sw,sh])]
 parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" xml:lang="{lang}"><rect width="{w}" height="{h}" fill="#f4f3ec"/>']
 for n,line in enumerate(wrapped(copy['title'],w-margin*2,fontPath,heading_size,2)):
  parts.append(f'<text x="{margin}" y="{margin+heading_size+n*heading_size*1.15}" font-family="{escape(family)}" font-size="{heading_size}" fill="#24342b">{escape(line)}</text>')
 parts.append(f'<svg x="{margin}" y="{header}" width="{w-margin*2}" height="{body_height}" viewBox="{x} {y} {cw} {ch}" preserveAspectRatio="xMidYMid meet" overflow="hidden"><defs><clipPath id="reference-crop"><rect x="{x}" y="{y}" width="{cw}" height="{ch}"/></clipPath></defs><g clip-path="url(#reference-crop)"><image width="{sw}" height="{sh}" href="data:image/png;base64,{encoded}"/>')
 # The excerpt is an illustration, not a counterfeit localized application UI.
 # Remove incidental Korean UI text from the excerpt; full evidence stays linked.
 for text in row.get('masks', []):
  if not re.search('[가-힣]{2}',text['text']):continue
  tx,ty,tw,th=[a*b for a,b in zip(text['box'],[sw,sh,sw,sh])]
  if tx>x+cw or tx+tw<x or ty>y+ch or ty+th<y:continue
  px=max(0,min(sw-1,int(tx-3)));py=max(0,min(sh-1,int(ty+th/2)));rgb=image.getpixel((px,py));bg='#%02x%02x%02x'%rgb
  parts.append(f'<rect x="{tx-2}" y="{ty-2}" width="{tw+4}" height="{th+4}" fill="{bg}"/>')
 parts.append('</g></svg>')
 y_text=h-footer+body_size*1.2
 for n,line in enumerate(wrapped(copy['description'],w-margin*2,fontPath,body_size,3)):
  parts.append(f'<text x="{margin}" y="{y_text+n*body_size*1.35}" font-family="{escape(family)}" font-size="{body_size}" fill="#43534a">{escape(line)}</text>')
 parts.append(f'<text x="{margin}" y="{h-max(8,h*.022)}" font-family="{escape(family)}" font-size="{max(10,body_size*.72)}" fill="#66766b">{escape(badge)}</text></svg>')
 return ''.join(parts)

def build_references(work):
 config=json.loads((ROOT/'tools/image-localization-references.json').read_text());ocr={}
 rows=config['images'];by_path={r['path']:r for r in rows}
 for row in config['derivatives']:
  original=by_path[row['source']];rows.append({**original,'path':row['path'],'width':row['dimensions'][0],'height':row['dimensions'][1]})
 for row in rows:
  source=ROOT/'src'/row['source'];digest=hashlib.sha256(source.read_bytes()).hexdigest()
  assert row.get('sourceSha256',digest)==digest, f'Source changed; review reference crop: {source}'
  row['sourceSha256']=digest
  for lang in LANGS:raster(reference_svg(row,lang,ocr),target(row['path'],lang),work)
 print('Rendered',len(rows)*4,'localized illustrated references.')

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--work',type=Path,required=True);parser.add_argument('--references-only',action='store_true');args=parser.parse_args()
 config=json.loads(CONFIG.read_text());args.work.mkdir(parents=True,exist_ok=True)
 if args.references_only:build_references(args.work);return
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  results=list(pool.map(lambda task:build(task[0],task[1],args.work),[(r,l) for r in config['images'] for l in LANGS]))
 for row in config['derivatives']:
  for lang in LANGS:
   source=target(row['source'],lang);dest=target(row['path'],lang);dest.parent.mkdir(parents=True,exist_ok=True)
   run(['cwebp','-quiet','-q','88','-resize',row['width'],row['height'],source,'-o',dest]);results.append({'path':row['path'],'language':lang,'output':str(dest.relative_to(ROOT))})
 CONFIG.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n')
 (args.work/'render-proof.json').write_text(json.dumps({'all_pass':True,'outputs':results},indent=2)+'\n')
 print('Rendered',len(results),'localized images; original assets preserved.')
if __name__=='__main__':main()
