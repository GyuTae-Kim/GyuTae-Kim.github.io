import { localizedImage } from './image-assets';
import { catalogs } from './catalogs';
export { ensureCatalog } from './catalogs';

export const LANGUAGES = [
  { code: 'ko', label: '한국어', locale: 'ko_KR' },
  { code: 'en', label: 'English', locale: 'en_US' },
  { code: 'ja', label: '日本語', locale: 'ja_JP' },
  { code: 'zh-CN', label: '简体中文', locale: 'zh_CN' },
  { code: 'de', label: 'Deutsch', locale: 'de_DE' },
] as const;
export type Language = typeof LANGUAGES[number]['code'];
export const normalizeMessage = (value: string): string => value.replace(/\s+/g, ' ').trim();
export function languageFromUrl(url: string): Language {
  const segment = url.split(/[?#]/)[0].split('/')[1];
  return LANGUAGES.find(({ code }) => code === segment)?.code ?? 'ko';
}
export function originalPath(url: string): string {
  const language = languageFromUrl(url);
  const path = language === 'ko' ? url : url.replace(new RegExp(`^/${language}(?=/|[?#]|$)`), '') || '/';
  return path.startsWith('/') ? path : '/' + path;
}
export function languagePath(url: string, language: Language): string {
  const path = originalPath(url);
  return language === 'ko' ? path : `/${language}${path === '/' ? '/' : path.startsWith('/') ? path : '/' + path}`;
}
export function localizedHref(value: string, language: Language): string {
  const origin = 'https://gyutae-kim.github.io';
  if (!value.startsWith(origin)) return value;
  const url = new URL(value);
  if (url.origin !== origin) return value;
  if (url.pathname.startsWith('/assets/')) return value;
  const app = url.pathname.match(/^\/(2dcad-viewer|opencad-(?:dwgdxf|step|skp|nc))\/(?:en|ja|zh-CN|de)?\/?$/);
  if (app) {
    const name = app[1] === '2dcad-viewer' ? 'opencad-dwgdxf' : app[1];
    url.pathname = `/${name}/${language === 'ko' ? '' : language + '/'}`;
    return url.href;
  }
  return origin + languagePath(url.pathname + url.search + url.hash, language);
}
const patterns = new Map<string, { expression: RegExp; key: string; slots: string[] }[]>();
export function translate(value: string, language: Language, parameters: unknown[] = []): string {
  const key = normalizeMessage(value);
  const catalog = catalogs[language] ?? {};
  let result = catalog[key] ?? value;
  // Computed labels in component code use the same numbered parameters as templates.
  if (language !== 'ko' && catalogs[language] && !catalog[key] && /[가-힣]/.test(key)) {
    if (!patterns.has(language)) patterns.set(language, Object.keys(catalog).filter(k => /\{\d+\}/.test(k)).map(k => {
      const slots = k.match(/\{\d+\}/g)!;
      const expression = new RegExp('^' + k.split(/\{\d+\}/).map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('(.+?)') + '$');
      return { key: k, slots, expression };
    }).sort((a,b) => b.key.replace(/\{\d+\}/g,'').length - a.key.replace(/\{\d+\}/g,'').length));
    for (const pattern of patterns.get(language)!) {
      const match = key.match(pattern.expression);
      if (!match) continue;
      result = catalog[pattern.key].replace(/\{\d+\}/g, slot => translate(match[pattern.slots.indexOf(slot) + 1], language));
      break;
    }
  }
  return result.replace(/\{(\d+)\}/g, (slot, index) => index in parameters ? String(typeof parameters[index] === 'string' ? translate(parameters[index] as string, language) : parameters[index] ?? '') : slot);
}

// JSON-LD and search descriptions must agree with the visible translated content.
export function translateData<T>(value: T, language: Language): T {
  if (typeof value === 'string') return localizedImage(translate(value, language), language) as T;
  if (Array.isArray(value)) return value.map(item => translateData(item, language)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateData(item, language)])) as T;
  return value;
}
