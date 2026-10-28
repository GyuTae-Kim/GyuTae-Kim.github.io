export { localizedImage, imageOriginal } from './app/i18n/image-assets';
import 'zone.js/node';
import { enableProdMode, NgModule } from '@angular/core';
import { renderModule, ServerModule } from '@angular/platform-server';
import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';
export { SEARCH_PAGES, LOCALIZED_SEARCH_PAGES, SITE_URL, contentModified } from './app/site-seo';
export { DEFAULT_LANGUAGE, LANGUAGES, languagePath, localizedHref, languageFromUrl, originalPath, translate } from './app/i18n/localization';
export { OPENCAD_TOOLS } from './app/opencad-data';

enableProdMode();

@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent],
})
class AppServerModule {}

export function renderPage(document: string, url: string): Promise<string> {
  return renderModule(AppServerModule, { document, url });
}
