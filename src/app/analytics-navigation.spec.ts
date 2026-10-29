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
  it('records only fixed app entry points without accepting URL parameters or arbitrary text', () => {
    const url = 'https://gyutae-kim.github.io/opencad-skp/ja/?sample&entry_point=private-file.skp';
    expect(navigationEvent(url, 'hub_shortcut')?.params).toEqual({ target_tool: 'skp', launch_mode: 'sample', entry_point: 'hub_shortcut' });
    expect(navigationEvent(url, 'format_table')?.params['entry_point']).toBe('format_table');
    for (const invalid of [undefined, '', 'private-file.skp', '__proto__', 'https://private.test/model']) {
      expect(navigationEvent(url, invalid)?.params).toEqual({ target_tool: 'skp', launch_mode: 'sample' });
    }
    expect(navigationEvent('https://private.test/opencad-skp/', 'hub_shortcut')).toBeUndefined();
    expect(navigationEvent('https://gyutae-kim.github.io/ja/opencad/guides/open-skp', 'hub_shortcut')?.params).toEqual({ guide_key: 'open-skp' });
  });
});
