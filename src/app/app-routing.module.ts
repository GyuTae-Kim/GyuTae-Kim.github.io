import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { BoardComponent } from './pages/board/board.component';
import { OpenCadComponent } from './pages/opencad/opencad.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ArticleComponent } from './pages/article/article.component';
import { SITE_ARTICLES } from './articles-data';
import { SEARCH_ALIASES } from './site-seo';

export const APP_ROUTES: Routes = [
  ...SEARCH_ALIASES.map(({ from, to }): Routes[number] => ({
    path: from.slice(1), pathMatch: 'full', component: NotFoundComponent,
    // A UrlTree redirect retains arbitrary campaign queries and article fragments.
    // The guard runs before activation, so the fallback component never renders.
    canActivate: [(route: ActivatedRouteSnapshot) => inject(Router).createUrlTree([to], { queryParams: route.queryParams, fragment: route.fragment ?? undefined })],
  })),
  ...SITE_ARTICLES.map((article) => ({ path: article.path.slice(1), component: ArticleComponent, data: { article } })),
  { path: '', component: HomeComponent },
  { path: 'notes', component: ArticleComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'portfolio/:id', component: PortfolioComponent },
  { path: 'research', component: BoardComponent },
  { path: 'opencad', component: OpenCadComponent },
  { path: 'blog', redirectTo: 'research', pathMatch: 'full' },
  { path: 'blog/:post', redirectTo: 'research' },
  { path: '**', component: NotFoundComponent },
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
