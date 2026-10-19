// A small Chrome DevTools Protocol helper for scripts/check-browser.mjs: no packages, only Node's built-in WebSocket and
// fetch. It launches headless Chrome on a free port and waits for it by polling, opens pages, evaluates scripts,
// sets the viewport, sends real key events, reads the accessibility tree, and serves a build folder over HTTP.
//
// Chrome is found from the CHROME environment variable (CHROME_NO_SANDBOX=1 adds --no-sandbox, for a container), then the usual macOS path, then google-chrome, chromium,
// chromium-browser and chrome on PATH.
import { spawn } from 'node:child_process';
import { createServer, request as httpRequest } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { existsSync, mkdtempSync, rmSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize, sep, delimiter } from 'node:path';
import { deflateSync } from 'node:zlib';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Polls fn until it returns something truthy; returns it, or throws after timeout ms. */
export async function waitFor(fn, { timeout = 10000, interval = 25, what = 'a condition' } = {}) {
  const end = Date.now() + timeout;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > end) throw new Error(`timed out after ${timeout} ms waiting for ${what}`);
    await sleep(interval);
  }
}

export function freePort() {
  return new Promise((resolve, reject) => {
    const s = createNetServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

export function findChrome() {
  const names = ['google-chrome', 'chromium', 'chromium-browser', 'chrome'];
  const candidates = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for (const dir of (process.env.PATH || '').split(delimiter)) for (const n of names) candidates.push(join(dir, n));
  for (const c of candidates) if (c && existsSync(c) && statSync(c).isFile()) return c;
  throw new Error('Chrome not found: set CHROME to its executable');
}

/** A tiny solid-color PNG of the given size (a stand-in for a photo, so no check needs the network). */
export function png(w, h, rgb = [90, 120, 160]) {
  const crc = (buf) => {
    let c, crcv = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c = (crcv ^ buf[n]) & 0xff;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcv = (crcv >>> 8) ^ c;
    }
    return (crcv ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.alloc(1 + w * 3);
  for (let x = 0; x < w; x++) { row[1 + x * 3] = rgb[0]; row[2 + x * 3] = rgb[1]; row[3 + x * 3] = rgb[2]; }
  const raw = Buffer.concat(Array.from({ length: h }, () => row));
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

/**
 * Serves a build folder. A missing address gets the folder's 404.html with status 404, as a host with a 404 page does.
 * hooks.before(pathname) may return {status, body, type, delay} to answer instead; hooks.rewrite(pathname, buffer)
 * may return another buffer for a file. Resolves to {url, close()}.
 */
export async function serve(root, hooks = {}) {
  const base = normalize(root) + sep;
  const server = createServer(async (req, res) => {
    try {
      const u = new URL(req.url, 'http://x');
      let p;
      try { p = decodeURIComponent(u.pathname); } catch { p = u.pathname; } // a malformed escape is a missing file, not an error
      const o = hooks.before && hooks.before(p, u);
      if (o) {
        if (o.delay) await sleep(o.delay);
        res.writeHead(o.status || 200, { 'Content-Type': o.type || 'text/plain' });
        return res.end(o.body || '');
      }
      let file = normalize(join(root, p));
      if (!(file + sep).startsWith(base) && file + sep !== base) { res.writeHead(403); return res.end(); }
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
      let status = 200;
      if (!existsSync(file) || !statSync(file).isFile()) {
        status = 404;
        file = join(root, '404.html');
        if (!existsSync(file)) { res.writeHead(404); return res.end('not found'); }
      }
      let body = readFileSync(file);
      if (hooks.rewrite && status === 200) body = hooks.rewrite(p, body) || body;
      res.writeHead(status, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch (e) {
      res.writeHead(500); res.end(String(e));
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}`;
  return { url, close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(r); }) };
}

function getJson(port, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port, path, method, timeout: 2000 }, (res) => {
      let s = '';
      res.on('data', (d) => (s += d));
      res.on('end', () => { if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`)); try { resolve(JSON.parse(s)); } catch { resolve(s); } });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.end();
  });
}

/** Headless Chrome on a free port. close() stops it and removes its profile. */
export class Browser {
  static async launch({ chrome = findChrome(), args = [] } = {}) {
    const port = await freePort();
    const dir = mkdtempSync(join(tmpdir(), 'theblues-chrome-'));
    const extra = process.env.CHROME_NO_SANDBOX ? ['--no-sandbox'] : [];
    const proc = spawn(chrome, [
      '--headless=new', `--remote-debugging-port=${port}`, '--remote-debugging-address=127.0.0.1', `--user-data-dir=${dir}`,
      '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', '--mute-audio',
      ...extra, ...args, 'about:blank',
    ], { stdio: 'ignore' });
    const b = new Browser(proc, port, dir);
    // Whatever ends the script, Chrome and its profile go with it.
    process.once('exit', () => { try { proc.kill('SIGKILL'); } catch { /* gone */ } try { rmSync(dir, { recursive: true, force: true }); } catch { /* gone */ } });
    let exited = false;
    proc.once('exit', () => { exited = true; });
    try {
      await waitFor(async () => {
        if (exited) throw new Error('Chrome exited before it was ready');
        try { return await getJson(port, '/json/version'); } catch { return false; }
      }, { timeout: 30000, what: `Chrome's DevTools port ${port}` });
    } catch (e) {
      await b.close();
      throw e;
    }
    return b;
  }

  constructor(proc, port, dir) { this.proc = proc; this.port = port; this.dir = dir; this.pages = new Set(); }

  async newPage() {
    const t = await getJson(this.port, '/json/new?about:blank', 'PUT');
    const page = new Page(t.webSocketDebuggerUrl, t.id, this);
    await page.connect();
    this.pages.add(page);
    return page;
  }

  async close() {
    for (const p of this.pages) p.dispose();
    if (this.proc.exitCode === null && !this.proc.killed) {
      const done = new Promise((r) => this.proc.once('exit', r));
      this.proc.kill('SIGTERM');
      await Promise.race([done, sleep(3000)]);
      if (this.proc.exitCode === null) this.proc.kill('SIGKILL');
    }
    rmSync(this.dir, { recursive: true, force: true, maxRetries: 5 });
  }
}

const KEYS = {
  Tab: { code: 'Tab', vk: 9 }, Enter: { code: 'Enter', vk: 13, text: '\r' }, ' ': { code: 'Space', vk: 32, text: ' ' },
  Escape: { code: 'Escape', vk: 27 }, ArrowLeft: { code: 'ArrowLeft', vk: 37 }, ArrowRight: { code: 'ArrowRight', vk: 39 },
  Home: { code: 'Home', vk: 36 }, End: { code: 'End', vk: 35 },
};

export class Page {
  constructor(wsUrl, id, browser) {
    this.wsUrl = wsUrl; this.id = id; this.browser = browser;
    this.n = 0; this.pending = new Map(); this.handlers = new Map();
    this.console = []; this.errors = []; this.requests = [];
    this.rules = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      this.ws = ws;
      ws.addEventListener('open', async () => {
        ws.addEventListener('message', (m) => this.#message(JSON.parse(m.data)));
        ws.addEventListener('close', () => { for (const { reject: rj } of this.pending.values()) rj(new Error('connection closed')); this.pending.clear(); });
        this.on('Runtime.consoleAPICalled', (e) => this.console.push({ type: e.type, text: e.args.map((a) => a.value ?? a.description ?? '').join(' ') }));
        this.on('Runtime.exceptionThrown', (e) => this.errors.push(e.exceptionDetails.exception?.description || e.exceptionDetails.text));
        this.on('Log.entryAdded', (e) => this.console.push({ type: e.entry.level, text: e.entry.text, url: e.entry.url }));
        this.on('Fetch.requestPaused', (e) => this.#paused(e));
        await Promise.all(['Page', 'Runtime', 'Log', 'Network', 'DOM'].map((d) => this.send(`${d}.enable`)));
        resolve();
      });
      ws.addEventListener('error', () => reject(new Error('could not connect to the page')));
    });
  }

  #message(m) {
    if (m.id) {
      const p = this.pending.get(m.id);
      if (!p) return;
      this.pending.delete(m.id);
      if (m.error) p.reject(new Error(`${p.method}: ${m.error.message}`)); else p.resolve(m.result);
    } else if (m.method) {
      for (const h of this.handlers.get(m.method) || []) h(m.params);
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.n;
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, fn) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(fn);
  }

  /** Opens a URL and waits for the load event. */
  async goto(url, { timeout = 15000 } = {}) {
    this.console.length = 0; this.errors.length = 0;
    const loaded = new Promise((r) => { const h = (e) => r(e); this.once('Page.loadEventFired', h); });
    await this.send('Page.navigate', { url });
    await Promise.race([loaded, sleep(timeout).then(() => { throw new Error(`${url} did not load in ${timeout} ms`); })]);
  }

  once(method, fn) {
    const wrap = (p) => { const l = this.handlers.get(method); l.splice(l.indexOf(wrap), 1); fn(p); };
    this.on(method, wrap);
  }

  /** Evaluates an expression in the page and returns its value (promises are awaited). */
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(`script error: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
    return r.result.value;
  }

  /** Polls an expression until it is truthy. */
  waitForEval(expression, opts = {}) {
    return waitFor(() => this.eval(expression).catch(() => false), { what: opts.what || expression, ...opts });
  }

  async setViewport(width, height, { dpr = 1, mobile = false } = {}) {
    await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
  }

  async setMedia(features, media = '') {
    await this.send('Emulation.setEmulatedMedia', { media, features: Object.entries(features).map(([name, value]) => ({ name, value })) });
    await this.frame();
  }

  /** Waits for the page to draw a frame (media query changes are reported to scripts in one), but at most a second. */
  async frame() {
    await Promise.race([this.eval('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(true))))').catch(() => {}), sleep(1000)]);
  }

  async setJavaScript(on) { await this.send('Emulation.setScriptExecutionDisabled', { value: !on }); }

  /** Runs a script before every page's own scripts, in every later navigation. */
  async addInitScript(source) { await this.send('Page.addScriptToEvaluateOnNewDocument', { source }); }

  /** A real key event (down and up) through the browser's input pipeline. modifiers: 1 Alt, 2 Ctrl, 4 Meta, 8 Shift. */
  async key(key, { modifiers = 0 } = {}) {
    const k = KEYS[key] || { code: key.length === 1 ? 'Key' + key.toUpperCase() : key, vk: key.toUpperCase().charCodeAt(0) };
    const base = { key, code: k.code, windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk, modifiers };
    await this.send('Input.dispatchKeyEvent', { type: k.text && !modifiers ? 'keyDown' : 'rawKeyDown', ...base, ...(k.text && !modifiers ? { text: k.text } : {}) });
    await this.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  }

  async typeText(text) { await this.send('Input.insertText', { text }); }

  async click(selector) {
    const r = await this.eval(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return null; e.scrollIntoView({block:'center', behavior:'instant'}); const b = e.getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; })()`);
    if (!r) throw new Error(`no element for ${selector}`);
    const [x, y] = r;
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }

  /** The accessibility tree's nodes that are not ignored, as {role, name, id}; filter is a predicate on those. */
  async axNodes(filter = () => true) {
    const { nodes } = await this.send('Accessibility.getFullAXTree');
    return nodes
      .filter((n) => !n.ignored)
      .map((n) => ({ role: n.role?.value, name: n.name?.value ?? '', description: n.description?.value ?? '', id: n.nodeId, backendDOMNodeId: n.backendDOMNodeId, props: n.properties || [] }))
      .filter(filter);
  }

  /**
   * Answers the page's requests: rule(url, request) returns undefined to let the request through, or one of
   * {fulfill: {status, body (Buffer|string), type}}, {fail: true}, {wait: Promise} (hold until it resolves, then answer
   * with its value). Every request seen is recorded in this.requests as {url, type}.
   */
  async intercept(rule) {
    this.rules.push(rule);
    await this.send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  }

  async #paused(e) {
    this.requests.push({ url: e.request.url, type: e.resourceType });
    const id = e.requestId;
    try {
      let a;
      for (const r of this.rules) { a = r(e.request.url, e.request, e.resourceType); if (a) break; }
      if (a && a.wait) a = await a.wait;
      if (a && a.fulfill) {
        const body = Buffer.from(a.fulfill.body ?? '');
        await this.send('Fetch.fulfillRequest', {
          requestId: id, responseCode: a.fulfill.status || 200,
          responseHeaders: [{ name: 'Content-Type', value: a.fulfill.type || 'image/png' }, { name: 'Access-Control-Allow-Origin', value: '*' }],
          body: body.toString('base64'),
        });
      } else if (a && a.fail) await this.send('Fetch.failRequest', { requestId: id, errorReason: 'Failed' });
      else await this.send('Fetch.continueRequest', { requestId: id });
    } catch { /* the page went away */ }
  }

  dispose() { try { this.ws.close(); } catch { /* closed */ } this.browser?.pages.delete(this); }

  async close() {
    try { await getJson(this.browser.port, `/json/close/${this.id}`); } catch { /* gone */ }
    this.dispose();
  }
}
