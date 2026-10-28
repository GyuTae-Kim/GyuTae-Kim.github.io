// CI-only capture: wait for real font loading, rather than a virtual-time budget.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const [url, output] = process.argv.slice(2);
assert.ok(url?.startsWith('http://127.0.0.1:') && output);
const profile = await mkdtemp(join(tmpdir(), 'portfolio-preview-'));
const chrome = spawn(process.env.CHROME_BIN || '/usr/bin/google-chrome', [
  '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
  '--hide-scrollbars', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: ['ignore', 'ignore', 'ignore'] });
const exited = once(chrome, 'exit');
const requests = new Map();
let socket, nextId = 0;
function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { requests.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    requests.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(chrome.exitCode, null, 'Chrome exited before debugging was ready');
    try { port = Number((await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; }
    catch { await delay(50); }
  }
  assert.ok(port, 'Chrome debugging port unavailable');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find(item => item.type === 'page');
  assert.ok(target);
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await once(socket, 'open');
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data), request = requests.get(message.id);
    if (!request) return;
    clearTimeout(request.timeout); requests.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  });
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    const state = await send('Runtime.evaluate', { expression: `location.href !== 'about:blank' && document.readyState === 'complete' && !!document.querySelector('h1')`, returnByValue: true });
    if (state.result.value) { ready = true; break; }
    await delay(50);
  }
  assert.ok(ready, 'Rendered page did not become ready');
  const loaded = await send('Runtime.evaluate', { expression: `(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return { language: document.documentElement.lang, title: document.title,
      heading: document.querySelector('h1').textContent,
      family: getComputedStyle(document.querySelector('h1')).fontFamily,
      fonts: [...document.fonts].map(font => ({ family: font.family, status: font.status })),
      resources: performance.getEntriesByType('resource').filter(item => item.name.includes('/fonts/')).map(item => item.name) };
  })()`, awaitPromise: true, returnByValue: true });
  assert.ok(!loaded.exceptionDetails, JSON.stringify(loaded.exceptionDetails));
  const proof = loaded.result.value;
  assert.ok(proof.fonts.length > 0);
  assert.ok(!proof.fonts.some(font => font.status === 'error'), JSON.stringify(proof));
  const native = { ja: 'Portfolio Japanese', 'zh-CN': 'Portfolio Chinese' }[proof.language];
  if (native) assert.ok(proof.fonts.some(font => font.family.replaceAll('"', '') === native && font.status === 'loaded'), JSON.stringify(proof));
  const capture = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(output, Buffer.from(capture.data, 'base64'));
  await writeFile(output.replace(/\.png$/, '.json'), JSON.stringify(proof, null, 2) + '\n');
  console.log(`${proof.language}: ${proof.heading}; web fonts loaded`);
} finally {
  for (const request of requests.values()) clearTimeout(request.timeout);
  if (socket?.readyState === WebSocket.OPEN) {
    try { await send('Browser.close'); } catch { /* Closing the browser closes CDP. */ }
    socket.close();
  }
  if (chrome.exitCode === null) chrome.kill('SIGTERM');
  await exited;
}
