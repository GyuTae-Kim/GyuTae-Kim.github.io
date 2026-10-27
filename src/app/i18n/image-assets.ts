import imageAssets from './image-assets.json';
import type { Language } from './localization';

const variants = new Set<string>(imageAssets.paths);
const origin = 'https://gyutae-kim.github.io';

// Only registered images have language variants. Keep model files, external
// hosts, logos and images without authored text at their original addresses.
export function localizedImage(value: string, language: Language): string {
  return value.replace(/(^|,)(\s*)(\S+)/g, (_match, separator: string, space: string, candidate: string) => {
    const absolute = candidate.startsWith(origin + '/assets/');
    const rootRelative = candidate.startsWith('/assets/');
    if (!absolute && !rootRelative && !candidate.startsWith('assets/')) return separator + space + candidate;
    const local = absolute ? candidate.slice(origin.length + 1) : candidate.replace(/^\//, '');
    const match = local.match(/^(assets\/(?:i18n\/(?:en|ja|zh-CN|de)\/)?[^?#]+)([?#].*)?$/);
    if (!match) return separator + space + candidate;
    const path = match[1].replace(/^assets\/i18n\/(?:en|ja|zh-CN|de)\//, 'assets/');
    if (!variants.has(path)) return separator + space + candidate;
    const target = language === 'ko' ? path : path.replace(/^assets\//, `assets/i18n/${language}/`);
    return separator + space + (absolute ? origin + '/' : rootRelative ? '/' : '') + target + (match[2] ?? '');
  });
}

const referenceImages = new Set<string>(imageAssets.references);
export function imageOriginal(value: string, language: Language): string | undefined {
  if (language === 'ko') return undefined;
  const local = value.startsWith(origin + '/') ? value.slice(origin.length + 1) : value.replace(/^\//, '');
  const original = local.replace(/^assets\/i18n\/(?:en|ja|zh-CN|de)\//, 'assets/');
  return referenceImages.has(original) ? '/' + original : undefined;
}
