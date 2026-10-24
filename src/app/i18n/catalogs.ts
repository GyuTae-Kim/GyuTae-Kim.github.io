import en from './en.json';
import ja from './ja.json';
import zh from './zh-CN.json';
import de from './de.json';

// SSR and unit tests keep every locale available for the static HTML build.
export const catalogs: Record<string, Record<string, string>> = { en, ja, 'zh-CN': zh, de };
export async function ensureCatalog(_language: string): Promise<void> {}
