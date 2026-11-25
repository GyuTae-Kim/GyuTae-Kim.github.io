import { contactEvent, internalTraffic, navigationEvent } from './analytics';

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
  it('records only the contact channel, never the address, subject or a repository', () => {
    const email = contactEvent('mailto:GyuTae.K1020@gmail.com?subject=private%20message');
    expect(email).toEqual({ name: 'contact_open', params: { contact_method: 'email' } });
    expect(JSON.stringify(email)).not.toMatch(/gmail|private/i);
    expect(contactEvent('https://github.com/GyuTae-Kim')).toEqual({ name: 'contact_open', params: { contact_method: 'github' } });
    for (const url of ['https://github.com/GyuTae-Kim/opencad-step', 'https://github.com/someone-else', 'http://github.com/GyuTae-Kim', 'https://gyutae-kim.github.io/contact']) expect(contactEvent(url)).toBeUndefined();
  });
});

function memory(): Storage {
  const items = new Map<string, string>();
  return {
    get length(): number { return items.size; },
    clear: () => items.clear(),
    getItem: (key: string) => items.get(key) ?? null,
    key: (index: number) => [...items.keys()][index] ?? null,
    removeItem: (key: string) => { items.delete(key); },
    setItem: (key: string, value: string) => { items.set(key, value); },
  } as Storage;
}

describe('Internal traffic marking', () => {
  it('keeps ordinary visitors external', () => {
    const store = { local: memory(), session: memory() };
    expect(internalTraffic('?utm_source=newsletter', '#work', store)).toBeFalse();
    expect(internalTraffic('', '#ga-internal=maybe', store)).toBeFalse();
  });
  it('marks a QA link for the current tab only', () => {
    const store = { local: memory(), session: memory() };
    expect(internalTraffic('?utm_source=QA&utm_medium=verification', '', store)).toBeTrue();
    expect(internalTraffic('', '', store)).toBeTrue();
    expect(internalTraffic('', '', { local: store.local, session: memory() })).toBeFalse();
  });
  it('lets the owner mark and unmark this browser', () => {
    const store = { local: memory(), session: memory() };
    expect(internalTraffic('', '#ga-internal=on', store)).toBeTrue();
    expect(internalTraffic('', '', { local: store.local, session: memory() })).toBeTrue();
    expect(internalTraffic('', '#x=1&ga-internal=off', store)).toBeFalse();
  });
  it('never blocks the page when storage is unavailable', () => {
    const blocked = { getItem: () => { throw new Error('blocked'); } } as unknown as Storage;
    expect(internalTraffic('?utm_source=qa', '#ga-internal=on', { local: blocked, session: blocked })).toBeFalse();
  });
});
