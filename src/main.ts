import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ensureCatalog, languageFromUrl } from './app/i18n/localization';

// Load the locale before evaluating search metadata or bootstrapping Angular.
ensureCatalog(languageFromUrl(location.pathname))
  .then(() => import('./app/app.module'))
  .then(({ AppModule }) => platformBrowserDynamic().bootstrapModule(AppModule))
  .catch(err => console.error(err));
