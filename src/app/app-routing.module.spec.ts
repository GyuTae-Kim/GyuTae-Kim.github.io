import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_ROUTES } from './app-routing.module';
import { NotFoundComponent } from './pages/not-found/not-found.component';

describe('published HTML aliases', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RouterTestingModule.withRoutes(APP_ROUTES)] }).compileComponents();
  });

  it('redirects to real routes while retaining search attribution and section fragments', async () => {
    const router = TestBed.inject(Router);
    const zone = TestBed.inject(NgZone);
    for (const [from, to] of [
      ['/index.html', '/'], ['/portfolio.html', '/portfolio'],
      ['/portfolio/cad-feature-recognition/index.html', '/portfolio/cad-feature-recognition'],
      ['/opencad/guides/measure-export.html', '/opencad/guides/measure-export'],
    ]) {
      await zone.run(() => router.navigateByUrl(`${from}?utm_source=search#main`));
      expect(router.url).toBe(`${to}?utm_source=search#main`);
      expect(router.routerState.snapshot.root.firstChild?.component).not.toBe(NotFoundComponent);
    }
  });

  it('keeps unpublished aliases on the not-found route', async () => {
    const router = TestBed.inject(Router);
    await TestBed.inject(NgZone).run(() => router.navigateByUrl('/unpublished-guide.html'));
    expect(router.url).toBe('/unpublished-guide.html');
    expect(router.routerState.snapshot.root.firstChild?.component).toBe(NotFoundComponent);
  });
});
