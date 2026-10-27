import { NgModule } from '@angular/core';
import { ImageOriginalPipe, LocalImagePipe, LocalLinkPipe, TranslatePipe } from './i18n.service';

@NgModule({ declarations: [ImageOriginalPipe, LocalImagePipe, LocalLinkPipe, TranslatePipe], exports: [ImageOriginalPipe, LocalImagePipe, LocalLinkPipe, TranslatePipe] })
export class I18nModule {}
