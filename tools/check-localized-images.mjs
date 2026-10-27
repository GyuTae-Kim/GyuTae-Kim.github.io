// Validate actual prerendered image URLs, responsive variants and sharing art.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
const require=createRequire(import.meta.url);
const {LOCALIZED_SEARCH_PAGES,SITE_URL,localizedImage}=require('../dist/server/main.js');
const manifest=JSON.parse(readFileSync('src/app/i18n/image-assets.json'));
const variants=new Set(manifest.paths);
let images=0;
for(const path of variants)for(const lang of ['en','ja','zh-CN','de']){
 const target=localizedImage(path,lang);
 assert.ok(target.startsWith(`assets/i18n/${lang}/`),`${path}: no ${lang} variant`);
 assert.ok(existsSync('docs/'+target),target);
}
for(const page of LOCALIZED_SEARCH_PAGES){
 const file=page.path==='/'?'docs/index.html':`docs/${page.path.replace(/^\/|\/$/g,'')}/index.html`;
 const dom=new JSDOM(readFileSync(file,'utf8'),{url:SITE_URL+page.path});const doc=dom.window.document;
 const originals=doc.querySelectorAll('.image-original-link');
 if(page.language==='ko')assert.equal(originals.length,0,`${page.path}: Korean source should stay original`);
 for(const link of originals){assert.ok(existsSync('docs'+new URL(link.href).pathname),`${page.path}: missing original capture`);assert.ok(!new URL(link.href).pathname.includes('/i18n/'),`${page.path}: source link must open original`);}
 for(const image of doc.querySelectorAll('img[src],source[srcset]')){
  const candidates=[image.getAttribute('src'),...(image.getAttribute('srcset')?.split(',').map(p=>p.trim().split(/\s/)[0])??[])].filter(Boolean);
  for(const candidate of candidates){const url=new URL(candidate,SITE_URL+'/');if(url.origin!==SITE_URL||!url.pathname.startsWith('/assets/'))continue;
   assert.ok(existsSync('docs'+url.pathname),`${page.path}: missing ${candidate}`);
   const expected=localizedImage(candidate,page.language);assert.equal(candidate,expected,`${page.path}: stale image language ${candidate}`);images++;
  }
 }
 assert.equal(doc.querySelector('meta[property="og:image"]').content,SITE_URL+'/'+localizedImage(page.image,page.language));
 dom.window.close();
}
console.log(`Image localization check passed: ${variants.size} image families, four foreign variants, ${LOCALIZED_SEARCH_PAGES.length} pages and ${images} image references.`);
