import 'zone.js/node';
import { enableProdMode, NgModule } from '@angular/core';
import { renderModule, ServerModule } from '@angular/platform-server';
import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';
export { SEARCH_PAGES, SITE_URL } from './app/site-seo';

enableProdMode();

@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent],
})
class AppServerModule {}

export function renderPage(document: string, url: string): Promise<string> {
  return renderModule(AppServerModule, { document, url });
}
