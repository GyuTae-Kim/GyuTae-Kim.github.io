import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { BoardComponent } from './pages/board/board.component';
import { OpenCadComponent } from './pages/opencad/opencad.component';
import { OpenCadProjectComponent } from './pages/opencad-project/opencad-project.component';
import { OPENCAD_PROJECTS } from './opencad-data';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ArticleComponent } from './pages/article/article.component';
import { SITE_ARTICLES } from './articles-data';
import { SEARCH_ALIASES } from './site-seo';
import { LANGUAGES, languageFromUrl, languagePath } from './i18n/localization';

const PAGE_ROUTES: Routes = [
  ...SEARCH_ALIASES.map(({ from, to }): Routes[number] => ({
    path: from.slice(1), pathMatch: 'full', component: NotFoundComponent,
    // A UrlTree redirect retains arbitrary campaign queries and article fragments.
    // The guard runs before activation, so the fallback component never renders.
    canActivate: [(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => inject(Router).createUrlTree([languagePath(to, languageFromUrl(state.url))], { queryParams: route.queryParams, fragment: route.fragment ?? undefined })],
  })),
  ...SITE_ARTICLES.map((article) => ({ path: article.path.slice(1), component: ArticleComponent, data: { article } })),
  ...OPENCAD_PROJECTS.map((tool) => ({ path: tool.path.slice(1), component: OpenCadProjectComponent, data: { tool } })),
  { path: '', component: HomeComponent },
  { path: 'notes', component: ArticleComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'portfolio/:id', component: PortfolioComponent },
  { path: 'research', component: BoardComponent },
  { path: 'research/:id', component: BoardComponent },
  { path: 'opencad', component: OpenCadComponent },
  { path: 'blog', redirectTo: 'research', pathMatch: 'full' },
  { path: 'blog/:post', redirectTo: 'research' },
  { path: '**', component: NotFoundComponent },
];

export const APP_ROUTES: Routes = [
  ...LANGUAGES.filter(({ code }) => code !== 'ko').map(({ code }) => ({ path: code, children: PAGE_ROUTES })),
  ...PAGE_ROUTES,
];

@NgModule({
  imports: [
    RouterModule.forRoot(APP_ROUTES, {
      initialNavigation: 'enabledBlocking',
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 100],
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
