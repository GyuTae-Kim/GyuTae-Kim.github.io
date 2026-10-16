import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PortfolioComponent } from './pages/portfolio/portfolio.component';
import { BoardComponent } from './pages/board/board.component';
import { OpenCadComponent } from './pages/opencad/opencad.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ArticleComponent } from './pages/article/article.component';

import { AchievementsComponent } from './components/achievements/achievements.component';
import { ModelViewportComponent } from './components/model-viewport/model-viewport.component';
import { IconComponent } from './components/icon/icon.component';
import { PartnerTextComponent } from './components/partner-text/partner-text.component';
import { PanelCatalogComponent } from './components/panel-catalog/panel-catalog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ContactComponent,
    PortfolioComponent,
    BoardComponent,
    OpenCadComponent,
    NotFoundComponent,
    ArticleComponent,
    AchievementsComponent,
    ModelViewportComponent,
    IconComponent,
    PartnerTextComponent,
    PanelCatalogComponent,
  ],
  imports: [BrowserModule.withServerTransition({ appId: 'portfolio' }), AppRoutingModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
