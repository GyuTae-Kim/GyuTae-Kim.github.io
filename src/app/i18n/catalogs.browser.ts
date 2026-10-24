// Replaces catalogs.ts only in the browser production build. Korean uses source
// copy; visitors download a translation only when they use that language.
export const catalogs: Record<string, Record<string, string>> = {};
const pending = new Map<string, Promise<void>>();
const loaders: Record<string, () => Promise<{ default: Record<string, string> }>> = {
  en: () => import('./en.json'),
  ja: () => import('./ja.json'),
  'zh-CN': () => import('./zh-CN.json'),
  de: () => import('./de.json'),
};
export async function ensureCatalog(language: string): Promise<void> {
  if (catalogs[language] || !loaders[language]) return;
  let task = pending.get(language);
  if (!task) {
    task = loaders[language]().then(module => { catalogs[language] = module.default; });
    pending.set(language, task);
    task.catch(() => { pending.delete(language); });
  }
  await task;
}
