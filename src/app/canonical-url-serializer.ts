import { Injectable } from '@angular/core';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { LANGUAGES } from './i18n/localization';

const languageHome = new RegExp(`^/(${LANGUAGES.filter(({ code }) => code !== 'ko').map(({ code }) => code).join('|')})(?=[?#]|$)`);

/** Keep generated home links on the same URL used by canonicals and sitemaps. */
@Injectable()
export class CanonicalUrlSerializer extends DefaultUrlSerializer {
  override serialize(tree: UrlTree): string {
    return super.serialize(tree).replace(languageHome, '$&/');
  }
}
