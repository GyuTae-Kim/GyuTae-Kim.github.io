import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {LOCALIZED_SEARCH_PAGES, LANGUAGES, SITE_URL}=require('../dist/server/main.js');
const catalog=code=>JSON.parse(readFileSync(new URL(`../src/app/i18n/${code}.json`,import.meta.url),'utf8'));
const keys=Object.keys(catalog('en')).sort();
for(const{code}of LANGUAGES.filter(item=>item.code!=='ko')){
 const translations=catalog(code);assert.deepEqual(Object.keys(translations).sort(),keys,code);
 for(const key of keys){assert.ok(translations[key].trim(),`${code}: empty ${key}`);assert.deepEqual((translations[key].match(/\{\d+\}/g)??[]).sort(),(key.match(/\{\d+\}/g)??[]).sort(),`${code}: parameters ${key}`);}
}
const missing=[];
for(const page of LOCALIZED_SEARCH_PAGES.filter(page=>page.language!=='ko')){
 const stem=page.path.replace(/^\/|\/$/g,'');const dom=new JSDOM(readFileSync(`docs/${stem}/index.html`,'utf8'),{url:SITE_URL+page.path});
 const doc=dom.window.document;
 // Search and sharing metadata are authored copy too. Checking only app-root
 // misses catalog fallbacks in the head even when the visible page is translated.
 for(const selector of ['title','meta[name="author"]','meta[name="description"]','meta[property="og:site_name"]','meta[property="og:title"]','meta[property="og:description"]','meta[name="twitter:title"]','meta[name="twitter:description"]']) {
  const element=doc.querySelector(selector);
  assert.ok(element,`${page.path}: missing ${selector}`);
  const text=element.getAttribute('content')??element.textContent;
  if(/[가-힣]/.test(text))missing.push({path:page.path,attribute:selector,text});
 }
 // Native language names and original screenshots remain native; all authored DOM copy is translated.
 doc.querySelectorAll('.language-menu,.language-versions,script,style').forEach(el=>el.remove());
 const walker=doc.createTreeWalker(doc.querySelector('app-root'),4);
 while(walker.nextNode()){const text=walker.currentNode.textContent.trim();if(/[가-힣]/.test(text))missing.push({path:page.path,text});}
 for(const el of doc.querySelectorAll('app-root [title],app-root [aria-label],app-root [placeholder],app-root img[alt]')) for(const attr of ['title','aria-label','placeholder','alt']) { const text=el.getAttribute(attr);if(text&&/[가-힣]/.test(text))missing.push({path:page.path,attribute:attr,text}); }
 assert.doesNotMatch(doc.querySelector('app-root').textContent,/\{\d+\}|ZXQPH/,page.path);
 assert.ok(!doc.querySelector('a[href*="%3F"],a[href*="%23"]'),`${page.path}: encoded query or fragment in route`);
 dom.window.close();
}
assert.equal(missing.length,0, 'Untranslated authored text: '+JSON.stringify(missing.slice(0,20).map(item=>({...item,text:item.text.slice(0,180)}))));
console.log(`i18n check passed: ${keys.length} messages in four catalogs and ${LOCALIZED_SEARCH_PAGES.length} prerendered pages.`);
