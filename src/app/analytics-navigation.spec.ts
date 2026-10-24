import { navigationEvent } from './analytics';

describe('Public SEO navigation measurement', () => {
  it('distinguishes sample launches and never sends a file URL or name', () => {
    const event = navigationEvent('https://gyutae-kim.github.io/opencad-step/en/?sample&open=https://private.test/customer.step&name=secret#private');
    expect(event).toEqual({ name: 'viewer_open', params: { target_tool: 'step', launch_mode: 'sample' } });
    expect(JSON.stringify(event)).not.toContain('private');
    expect(navigationEvent('https://gyutae-kim.github.io/opencad-skp/?open=https://private.test/model.skp')?.params).toEqual({ target_tool: 'skp', launch_mode: 'url' });
  });
  it('only records authored guide identities, including localized links', () => {
    expect(navigationEvent('https://gyutae-kim.github.io/de/opencad/guides/open-step-stp?file=private')).toEqual({ name: 'guide_open', params: { guide_key: 'open-step-stp' } });
    for (const url of ['https://private.test/opencad-step/', 'https://gyutae-kim.github.io/opencad/guides/private-file', 'https://gyutae-kim.github.io/customer.skp', 'mailto:private@example.test']) expect(navigationEvent(url)).toBeUndefined();
  });
});
