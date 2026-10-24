import { I18nModule } from './i18n/i18n.module';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_ROUTES } from './app-routing.module';
import { NotFoundComponent } from './pages/not-found/not-found.component';

describe('published HTML aliases', () => {
  function leafComponent(router: Router) {
    let route = router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.component;
  }
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [I18nModule, RouterTestingModule.withRoutes(APP_ROUTES)] }).compileComponents();
  });

  it('redirects to real routes while retaining search attribution and section fragments', async () => {
    const router = TestBed.inject(Router);
    const zone = TestBed.inject(NgZone);
    for (const [from, to] of [
      ['/index.html', '/'], ['/portfolio.html', '/portfolio'],
      ['/portfolio/cad-feature-recognition/index.html', '/portfolio/cad-feature-recognition'],
      ['/research/graph-tsp.html', '/research/graph-tsp'],
      ['/research/virtual-try-on/index.html', '/research/virtual-try-on'],
      ['/opencad/guides/measure-export.html', '/opencad/guides/measure-export'],
      ['/opencad/projects/nc-viewer.html', '/opencad/projects/nc-viewer'],
      ['/opencad/projects/viewer3d/index.html', '/opencad/projects/viewer3d'],
    ]) {
      await zone.run(() => router.navigateByUrl(`${from}?utm_source=search#main`));
      expect(router.url).toBe(`${to}?utm_source=search#main`);
      expect(leafComponent(router)).not.toBeNull();
      expect(leafComponent(router)).not.toBe(NotFoundComponent);
    }
  });

  it('keeps unpublished aliases on the not-found route', async () => {
    const router = TestBed.inject(Router);
    for (const prefix of ['', '/en', '/ja', '/zh-CN', '/de']) {
      const url = `${prefix}/unpublished-guide.html`;
      await TestBed.inject(NgZone).run(() => router.navigateByUrl(url));
      expect(router.url).toBe(url);
      expect(leafComponent(router)).toBe(NotFoundComponent);
    }
  });
  it('retains language, attribution and fragments for translated HTML aliases', async () => {
    const router = TestBed.inject(Router);
    for (const code of ['en','ja','zh-CN','de']) {
      await TestBed.inject(NgZone).run(() => router.navigateByUrl(`/${code}/opencad/projects/skp-viewer.html?utm_source=test#project-start`));
      expect(router.url).toBe(`/${code}/opencad/projects/skp-viewer?utm_source=test#project-start`);
    }
  });

});
