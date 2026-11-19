"""Render the checked-in, language-specific Open Graph JPEGs from native SVG layouts."""
import sys
sys.dont_write_bytecode=True
import argparse,base64,hashlib,importlib.util,json,subprocess
from html import escape
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('images',ROOT/'tools/prepare-localized-images.py');images=importlib.util.module_from_spec(spec);spec.loader.exec_module(images)
parser=argparse.ArgumentParser();parser.add_argument('--work',type=Path,required=True);args=parser.parse_args()
proof=[]
for row in json.loads((ROOT/'tools/localized-sharing-cover-copy.json').read_text()):
 lang=row['language'];fontPath,family=images.FONT[lang];path=images.target(row['source'],lang)
 if not path.exists():path=ROOT/'src'/row['source']
 mime={'.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'}[path.suffix]
 figure=base64.b64encode(path.read_bytes()).decode();title=row['title'];size=40
 # The title is drawn bold, so measure it with the bold face and keep a little room for
 # synthetic emboldening; measuring the regular face let lines run into the figure.
 boldPath=subprocess.check_output(['fc-match','-f','%{file}',family+':bold'],text=True);width=525
 font=images.ImageFont.truetype(boldPath,size)
 while size>26 and max(font.getlength(word) for word in title.split())>width:size-=1;font=images.ImageFont.truetype(boldPath,size)
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" xml:lang="{lang}"><rect width="1200" height="630" fill="#f4f3ec"/><rect x="24" y="24" width="1152" height="582" fill="none" stroke="#293b31"/><text x="58" y="83" font-family="{escape(family)}" font-size="19" fill="#385f8a">Sean Kim · AI / CAD / CAM</text>'
 # A long title shrinks to stay within three lines instead of ending in an ellipsis.
 while size>30 and len(images.wrapped(title,width,boldPath,size,99))>3:size-=1
 y=148
 for line in images.wrapped(title,width,boldPath,size,3):svg+=f'<text x="58" y="{y}" font-family="{escape(family)}" font-size="{size}" font-weight="bold" fill="#23352a">{escape(line)}</text>';y+=size*1.28
 y+=26
 # The description may use the whole space above the footer rule (last baseline 530),
 # then a smaller size, so the cover shows the full page description.
 body=23
 while True:
  step=round(body*1.43);room=int((530-y)//step)+1
  if len(images.wrapped(row['description'],535,fontPath,body,99))<=room or body<=19:break
  body-=1
 for line in images.wrapped(row['description'],535,fontPath,body,room):svg+=f'<text x="58" y="{y}" font-family="{escape(family)}" font-size="{body}" fill="#536157">{escape(line)}</text>';y+=step
 svg+=f'<rect x="625" y="96" width="515" height="426" fill="#ffffff" stroke="#b7c1b8"/><image x="636" y="108" width="493" height="402" preserveAspectRatio="xMidYMid meet" href="data:{mime};base64,{figure}"/><path d="M24 554H1176" stroke="#293b31"/><text x="58" y="585" font-family="{escape(family)}" font-size="19" fill="#293b31">Sean Kim</text><text x="1140" y="585" text-anchor="end" font-family="Arial" font-size="18" fill="#536157">gyutae-kim.github.io</text></svg>'
 target=images.target(row['path'],lang);images.raster(svg,target,args.work)
 assert target.stat().st_size<512*1024
 proof.append({'source':row['source'],'path':row['path'],'language':lang,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
(args.work/'cover-proof.json').write_text(json.dumps({'all_pass':True,'outputs':proof},indent=2)+'\n')
print('Rendered',len(proof),'native-language JPEG sharing covers.')
