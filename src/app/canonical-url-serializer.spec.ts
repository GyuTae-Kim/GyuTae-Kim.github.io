import { DefaultUrlSerializer } from '@angular/router';
import { CanonicalUrlSerializer } from './canonical-url-serializer';

describe('canonical language home URLs', () => {
  const serializer = new CanonicalUrlSerializer();
  it('normalizes language home aliases and preserves campaign parameters and section links', () => {
    for (const code of ['en', 'ja', 'zh-CN', 'de']) {
      for (const suffix of ['', '?utm_source=google&file=part.step#work', '#research']) {
        expect(serializer.serialize(serializer.parse(`/${code}${suffix}`))).toBe(`/${code}/${suffix}`);
        expect(serializer.serialize(serializer.parse(`/${code}/${suffix}`))).toBe(`/${code}/${suffix}`);
      }
    }
  });
  it('leaves Korean, deep links, assets and unknown language paths unchanged', () => {
    const standard = new DefaultUrlSerializer();
    for (const url of ['/', '/?source=google#work', '/en/portfolio', '/ja/opencad?sample#step-viewer', '/assets/og/home.jpg', '/fr', '/english']) {
      expect(serializer.serialize(serializer.parse(url))).toBe(standard.serialize(standard.parse(url)));
    }
  });
});
