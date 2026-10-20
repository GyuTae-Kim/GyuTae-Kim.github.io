import { NgModule } from '@angular/core';
import { LocalLinkPipe, TranslatePipe } from './i18n.service';

@NgModule({ declarations: [LocalLinkPipe, TranslatePipe], exports: [LocalLinkPipe, TranslatePipe] })
export class I18nModule {}
