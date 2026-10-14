import { siteUpdated } from './site-updated';

describe('siteUpdated', () => {
  it('formats the page date as YYYY.MM', () => {
    expect(siteUpdated()).toMatch(/^\d{4}\.(0[1-9]|1[0-2])$/);
  });
});
