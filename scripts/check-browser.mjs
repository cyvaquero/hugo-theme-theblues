#!/usr/bin/env node
// Runs the browser checks of docs/testing.md against the fixture builds that scripts/build-fixtures.sh makes.
// Usage: node scripts/check-browser.mjs [--list] <out> [name ...]
//   <out>   the folder build-fixtures.sh wrote (it needs base, rtl, multilingual, lightbox-names, long-title, table-attributes and ugly-urls)
//   name    run only these checks; a name also runs every check that starts with "name-"
//   --list  print the check names and stop
// One PASS or FAIL line per check, the reason on FAIL. Exit status: 0 all passed, 1 a check failed, 2 usage error.
// Needs Chrome or Chromium (the CHROME environment variable, else the usual places); nothing else, and no network: photos
// are answered by the script, not fetched.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { Browser, serve, png, sleep, waitFor } from './cdp.mjs';

const checks = [];
export function check(name, what, fn) { checks.push({ name, what, fn }); }
function assert(cond, msg) { if (!cond) throw new Error(typeof msg === 'function' ? msg() : msg); }
function eq(actual, expected, what) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), () => `${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

// ---------------------------------------------------------------------------------------------------------------------
// Shared setup

const PHOTO = png(1200, 800);
const HOST = '127.0.0.1';
// Every image that is not on the local server (SmugMug photos, photos.example.org) is answered with a stand-in; every
// other request to another origin fails, so nothing reaches the network.
const photos = (mode = 'ok') => (url, req, type) => {
  const u = new URL(url);
  if (u.hostname === HOST) return undefined;
  if (type !== 'Image') return { fail: true };
  if (mode === 'ok') return { fulfill: { body: PHOTO } };
  if (mode === 'fail') return { fulfill: { status: 404, body: '' } };
  return mode(url, req, type); // a function: the check decides
};
// Divides every timer of 20 s or more by 20 (the hero's 30 s show and 25 s lead become 1.5 s and 1.25 s; its 1.5 s fade stays).
const SCALE = `(() => { const st = window.setTimeout; window.setTimeout = function (f, d, ...a) { if (d >= 20000) d = d / 20; return st.call(this, f, d, ...a); }; })();`;

class Context {
  constructor(out, browser) { this.out = out; this.browser = browser; this.servers = new Map(); this.pages = new Set(); }

  async serve(build, hooks, key = '') {
    const k = build + '|' + key;
    if (!this.servers.has(k)) {
      const dir = resolve(this.out, build);
      if (!existsSync(dir)) throw new Error(`no build "${build}" in ${this.out} (run scripts/build-fixtures.sh)`);
      this.servers.set(k, await serve(dir, hooks));
    }
    return this.servers.get(k).url;
  }

  /**
   * Opens build/path in a new page. Options: viewport [w, h, {dpr, mobile}], media {feature: value}, js (false turns
   * script off), scale (scale the long timers), photos ('ok', 'fail' or a function), hooks and key (a server with hooks),
   * dir ('rtl' or 'ltr' set on <html> after load), init (a script run before the page's own), load (false: return before navigating).
   */
  async open(build, path, o = {}) {
    const base = await this.serve(build, o.hooks, o.key);
    const page = await this.browser.newPage();
    this.pages.add(page);
    page.base = base;
    if (o.photos !== null) await page.intercept(photos(o.photos ?? 'ok'));
    if (o.viewport) await page.setViewport(o.viewport[0], o.viewport[1], o.viewport[2]);
    if (o.media) await page.setMedia(o.media);
    await page.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (o.scale) await page.addInitScript(SCALE);
    if (o.init) await page.addInitScript(o.init);
    if (o.js === false) await page.setJavaScript(false);
    if (o.load !== false) await page.goto(base + path);
    return page;
  }

  async closePages() { for (const p of this.pages) await p.close(); this.pages.clear(); }
  async close() {
    await this.closePages();
    for (const s of this.servers.values()) await s.close();
    await this.browser.close();
  }
}

/** The names of the accessibility tree's nodes with this role. */
async function names(page, role) { return (await page.axNodes((n) => n.role === role)).map((n) => n.name); }
/** Presses Tab until the active element matches selector (at most max times); returns how many presses it took. */
async function tabTo(page, selector, max = 40) {
  for (let i = 1; i <= max; i++) {
    await page.key('Tab');
    if (await page.eval(`!!document.activeElement && document.activeElement.matches(${JSON.stringify(selector)})`)) return i;
  }
  throw new Error(`Tab did not reach ${selector} in ${max} presses`);
}
const overflow = (page) => page.eval('[document.documentElement.scrollWidth, document.documentElement.clientWidth]');

// ---------------------------------------------------------------------------------------------------------------------
// Right-to-left layout, skip link, overflow

check('rtl-html', 'The Arabic pages start <html lang="ar" dir="rtl">; the English ones have no dir', async (c) => {
  const ar = await c.open('rtl', '/');
  eq(await ar.eval('[document.documentElement.lang, document.documentElement.getAttribute("dir")]'), ['ar', 'rtl'], 'Arabic home');
  const en = await c.open('rtl', '/en/');
  eq(await en.eval('document.documentElement.hasAttribute("dir")'), false, 'English page has dir');
  eq(await en.eval('getComputedStyle(document.documentElement).direction'), 'ltr', 'English direction');
});

check('overflow', 'No page scrolls sideways at 320px and 1280px (Arabic: home, a post, a term; English: the same)', async (c) => {
  const pages = [['rtl', '/'], ['rtl', '/post/20260112-series-2/'], ['rtl', '/tags/fixtures/'], ['rtl', '/en/'],
    ['base', '/'], ['base', '/post/20260106-untitled/'], ['base', '/tags/fixtures/']];
  const bad = [];
  for (const w of [320, 1280]) {
    for (const [build, path] of pages) {
      const p = await c.open(build, path, { viewport: [w, 800] });
      const [sw, cw] = await overflow(p);
      if (sw > cw) bad.push(`${build}${path} at ${w}px: scrollWidth ${sw} > clientWidth ${cw}`);
      await p.close();
    }
  }
  assert(!bad.length, bad.join('; '));
});

check('skip-link', 'The skip link is off screen until Tab, then inside the window at the inline-start top corner', async (c) => {
  for (const [build, path, dir] of [['rtl', '/', 'rtl'], ['rtl', '/en/', 'ltr'], ['base', '/', 'ltr']]) {
    for (const w of [320, 1280]) {
      const p = await c.open(build, path, { viewport: [w, 800] });
      assert(await p.eval(`!!document.querySelector('a.skip')`), `${build}${path}: no skip link`);
      const rect = `(() => { const r = document.querySelector('a.skip').getBoundingClientRect(); return [r.left, r.right, r.top, r.bottom, document.documentElement.clientWidth]; })()`;
      let [l, r, t, b, cw] = await p.eval(rect);
      const label = `${build}${path} at ${w}px`;
      assert(r <= 0 || l >= cw || b <= 0 || t >= 800, `${label}: skip link is on screen before Tab (${l}, ${r}, ${t}, ${b})`);
      await p.key('Tab');
      eq(await p.eval('document.activeElement.className'), 'skip', `${label}: first Tab`);
      await sleep(250); // its slide-in transition
      [l, r, t, b, cw] = await p.eval(rect);
      assert(l >= 0 && r <= cw && t >= 0 && b > 0, `${label}: skip link is not inside the window after Tab (${l}, ${r}, ${t}, ${b}, ${cw})`);
      assert(dir === 'rtl' ? cw - r < l : l < cw - r, `${label}: skip link is not at the ${dir === 'rtl' ? 'right' : 'left'} (${l}, ${r}, ${cw})`);
      await p.key('Enter');
      eq(await p.eval('document.activeElement.id'), 'main', `${label}: Enter on the skip link moves focus to main`);
      await p.close();
    }
  }
});

check('rtl-mirror', 'Arabic layout mirrors: the series box and article tile bars are on the right (the English ones on the left); code stays left to right', async (c) => {
  const bar = (p, sel) => p.eval(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const cs = getComputedStyle(e); return parseFloat(cs.borderRightWidth) > parseFloat(cs.borderLeftWidth) ? 'right' : parseFloat(cs.borderRightWidth) < parseFloat(cs.borderLeftWidth) ? 'left' : 'none'; })()`);
  const ar = await c.open('rtl', '/post/20260112-series-2/', { viewport: [1280, 800] });
  eq(await bar(ar, '.series'), 'right', 'Arabic series box bar');
  const arHome = await c.open('rtl', '/', { viewport: [1280, 800] });
  eq(await bar(arHome, '.tile.article'), 'right', 'Arabic article tile bar');
  const en = await c.open('rtl', '/en/post/20260106-untitled/', { viewport: [1280, 800] });
  eq(await bar(en, '.series'), 'left', 'English series box bar');
  const enHome = await c.open('rtl', '/en/', { viewport: [1280, 800] });
  eq(await bar(enHome, '.tile.article'), 'left', 'English article tile bar');
  const code = await ar.eval(`(() => { const pre = document.createElement('pre'); document.querySelector('.abody').appendChild(pre); const d = getComputedStyle(pre).direction; pre.remove(); return d; })()`);
  eq(code, 'ltr', 'direction of a code block in an Arabic page');
});

check('rtl-arrows', 'Previous/next arrows point to their side, are aria-hidden and stay out of the accessible names', async (c) => {
  const arrows = (p) => p.eval(`[...document.querySelectorAll('a')].flatMap((a) => [...a.querySelectorAll('span[aria-hidden=true]')].filter((s) => /[\\u2190\\u2192]/.test(s.textContent)).map((s) => [s.textContent.includes('\\u2192') ? 'rarr' : 'larr', a.getAttribute('rel') || a.textContent.trim().slice(0, 20), s.nextSibling === null || s.previousSibling === null ? (s.previousSibling === null ? 'before' : 'after') : 'inside']))`);
  const p = await c.open('rtl', '/post/20260112-series-2/');
  const a = await arrows(p);
  assert(a.some(([d, rel, pos]) => d === 'rarr' && rel === 'prev' && pos === 'before'), `no → before the previous link: ${JSON.stringify(a)}`);
  assert(a.some(([d, rel, pos]) => d === 'larr' && rel === 'next' && pos === 'after'), `no ← after the next link: ${JSON.stringify(a)}`);
  const en = await c.open('rtl', '/en/post/20260106-untitled/');
  const e = await arrows(en);
  assert(e.some(([d, rel]) => d === 'larr' && rel === 'prev'), `English page lost ← before the previous link: ${JSON.stringify(e)}`);
  for (const [pg, path] of [[p, '/post/20260112-series-2/'], [en, '/en/post/20260106-untitled/']]) {
    const bad = (await pg.axNodes((n) => n.role === 'link' && /[←→]/.test(n.name))).map((n) => n.name);
    assert(!bad.length, `${path}: links with an arrow in their accessible name: ${bad.join(' | ')}`);
  }
  const page2 = await c.open('rtl', '/page/2/');
  const last = await arrows(page2);
  assert(last.length > 0 && last.every(([d]) => d === 'rarr'), `/page/2/ (last page) should have only → : ${JSON.stringify(last)}`);
  const tag = await c.open('rtl', '/tags/fixtures/');
  const t = await arrows(tag);
  assert(t.some(([d]) => d === 'rarr') && t.some(([d]) => d === 'larr'), `/tags/fixtures/ should have both arrows: ${JSON.stringify(t)}`);
});

// ---------------------------------------------------------------------------------------------------------------------
// Accessibility names

check('a11y-feed-names', 'The two feed links in a post\'s series boxes have different accessible names; term pages keep "Subscribe via RSS"', async (c) => {
  const p = await c.open('base', '/post/20260106-untitled/');
  const feeds = (await names(p, 'link')).filter((n) => n.startsWith('Subscribe via RSS'));
  eq(feeds, ['Subscribe via RSS : Fixture Series', 'Subscribe via RSS : Second Fixture Series'], 'series feed links');
  const t = await c.open('base', '/tags/fixtures/');
  assert((await names(t, 'link')).includes('Subscribe via RSS'), 'term page lost its "Subscribe via RSS" link');
});

check('a11y-newtab-names', 'External links name themselves without "(opens in a new tab)" and describe it; titles stay as written', async (c) => {
  const p = await c.open('base', '/post/20260111-heading-link/');
  const tocNames = await p.eval(`[...document.querySelectorAll('#TableOfContents a')].map((a) => a.textContent.trim())`);
  const all = (await p.axNodes((n) => n.role === 'link')).map((n) => n.name);
  for (const t of tocNames) assert(all.some((n) => n === t), `no link named "${t}"`);
  assert(!all.some((n) => n.includes('(opens in a new tab)') && !n.includes('Hugo & friends')), `a name holds the notice: ${all.filter((n) => n.includes('(opens in a new tab)'))}`);
  const heading = await p.eval(`(() => { const a = document.querySelector('h2#hugo a'); return [a.getAttribute('aria-describedby'), document.getElementById(a.getAttribute('aria-describedby')).textContent]; })()`);
  eq(heading, ['tb-newtab', '(opens in a new tab)'], 'heading link description');
  const titled = await p.eval(`(() => { const a = document.querySelector('a[title^="Hugo &"], a[title^="Hugo "]'); return [a.title, a.hasAttribute('aria-describedby'), a.target]; })()`);
  eq(titled, ['Hugo & friends (opens in a new tab)', false, '_blank'], 'link with a title');
  const internal = await p.eval(`(() => { const a = document.querySelector('a[title="All the posts"]'); return [a.hasAttribute('aria-describedby'), a.hasAttribute('target')]; })()`);
  eq(internal, [false, false], 'internal titled link');
});

check('links-origin', 'About page: a link to the site\'s own host on its default port is internal; another port opens in a new tab', async (c) => {
  const p = await c.open('base', '/about/');
  const r = await p.eval(`(() => { const f = (h) => { const a = document.querySelector('a[href="' + h + '"]'); return a ? [a.target, a.getAttribute('aria-describedby')] : null; }; return [f('https://example.org:443/about/'), f('https://example.org:8443/')]; })()`);
  assert(r[0] && r[1], `the About page lacks the test links: ${JSON.stringify(r)}`);
  eq(r[0], ['', null], 'link to https://example.org:443/about/');
  eq(r[1], ['_blank', 'tb-newtab'], 'link to https://example.org:8443/');
});

check('nav-search-current', 'The nav\'s search link has aria-current="page" on the search page and on no other page', async (c) => {
  const cur = (p) => p.eval(`[...document.querySelectorAll('nav.site a[aria-current]')].map((a) => a.getAttribute('href')).filter((h) => /search/.test(h))`);
  eq(await cur(await c.open('base', '/search/')), ['/search/'], 'base /search/');
  eq(await cur(await c.open('base', '/')), [], 'base /');
  eq(await cur(await c.open('base', '/about/')), [], 'base /about/');
  const ml = await cur(await c.open('multilingual', '/en/search/'));
  eq(ml, ['/en/search/'], 'multilingual /en/search/');
  const de = await c.open('multilingual', '/');
  eq(await de.eval(`[...document.querySelectorAll('nav.site a')].some((a) => /search/i.test(a.getAttribute('href')))`), false, 'German page has a search link');
});

check('nav-search-current-ugly', 'With uglyURLs the search page\'s nav link still has aria-current="page" and the 404 page\'s search gets data-base "/", not "/index.html" (#410)', async (c) => {
  eq(await (await c.open('ugly-urls', '/search/')).eval(`[...document.querySelectorAll('nav.site a[aria-current]')].map((a) => a.getAttribute('href'))`), ['/search/'], 'ugly-urls /search/ current links');
  const n = await c.open('ugly-urls', '/no-such-page/');
  eq(await n.eval(`document.getElementById('search').getAttribute('data-base')`), '/', 'ugly-urls 404 data-base');
});

// ---------------------------------------------------------------------------------------------------------------------
// Theme switch

check('theme-switch', 'The theme switch sets data-theme, aria-pressed and localStorage, and System puts it back', async (c) => {
  const p = await c.open('base', '/post/20260105-dated-article/', { viewport: [1280, 800], media: { 'prefers-color-scheme': 'light' } });
  await p.eval('localStorage.clear()');
  await p.waitForEval(`!document.querySelector('nav.site li.theme').hidden`, { what: 'the theme switch' });
  const state = () => p.eval(`({ t: document.documentElement.getAttribute('data-theme'), s: localStorage.getItem('theme'), bg: getComputedStyle(document.body).backgroundColor, pressed: [...document.querySelectorAll('.thm button')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.mode) })`);
  const sys = await state();
  eq([sys.t, sys.s, sys.pressed], [null, null, ['system']], 'initial');
  await p.click('.thm button[data-mode=dark]');
  const dark = await state();
  eq([dark.t, dark.s, dark.pressed], ['dark', 'dark', ['dark']], 'after Dark');
  assert(dark.bg !== sys.bg, `the page background did not change (${dark.bg})`);
  await p.click('.thm button[data-mode=light]');
  eq((await state()).t, 'light', 'after Light');
  await p.click('.thm button[data-mode=system]');
  const back = await state();
  eq([back.t, back.s, back.pressed, back.bg], [null, null, ['system'], sys.bg], 'after System');
});

// ---------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------
// Rotating hero (home page of the base build: a pool of two landscape photos)

const heroId = (p) => p.eval(`(document.querySelector('header[data-pool]').style.getPropertyValue('--hi').match(/i-[A-Za-z0-9]+/) || [''])[0]`);
const BUILD_PHOTO = 'i-25Xwh4F';
const isPhotoReq = (r) => r.url.startsWith('https://photos.smugmug.com/');
/** Follows the hero's photo until n different consecutive values have been seen; returns them. */
async function heroSequence(p, n, timeout = 20000) {
  const seen = [await heroId(p)];
  await waitFor(async () => { const id = await heroId(p); if (id !== seen[seen.length - 1]) seen.push(id); return seen.length >= n; }, { timeout, interval: 40, what: `the hero to change photo ${n - 1} times (saw ${seen})` });
  return seen;
}
const heroButton = (p) => p.eval(`(() => { const b = document.querySelector('header[data-pool] .hpp'); return b ? { hidden: b.hidden, label: b.getAttribute('aria-label'), lang: b.getAttribute('lang'), pressed: b.hasAttribute('aria-pressed') } : null; })()`);

check('hero-nojs', 'With JavaScript off the hero shows the first photo and has the preload, no layer and no button', async (c) => {
  const p = await c.open('base', '/', { js: false, viewport: [1280, 800] });
  assert((await p.eval(`getComputedStyle(document.querySelector('header[data-pool]')).backgroundImage`)).includes(BUILD_PHOTO), 'hero background is not the build\'s first photo');
  assert(await p.eval(`!![...document.querySelectorAll('head link[rel=preload][as=image]')].find((l) => (l.href + l.getAttribute('imagesrcset')).includes('${BUILD_PHOTO}'))`), 'no preload of the first photo in <head>');
  eq(await p.eval(`document.querySelectorAll('.hr, .hpp').length`), 0, 'layer and buttons');
});

// The hero alternates two layers (.hr, each a scrim over a photo in .hp): the first fade puts one over the hero's own photo, each
// later one fades the idle layer in over the one showing and then hides that one. The pan is a Web Animations transform on the
// .hp of the layer showing. `off` below is how far the layer's photo is moved up, in px (0 at the top of the cropped part,
// `crop` at its bottom), read from the rendered box, so it holds whatever the photo's start position is.
const LAYER_STATE = `(() => {
  const h = document.querySelector('header[data-pool]'), hb = h.getBoundingClientRect();
  const ids = (window.__hrIds = window.__hrIds || new WeakMap());
  return [...h.querySelectorAll(':scope > .hr')].map((l) => {
    if (!ids.has(l)) ids.set(l, (window.__hrN = (window.__hrN || 0) + 1));
    const hp = l.firstElementChild, r = hp.getBoundingClientRect(), lr = l.getBoundingClientRect(), a = hp.getAnimations()[0];
    const prev = l.previousElementSibling;
    return { id: ids.get(l), shown: !l.hidden, on: l.classList.contains('on'), opacity: +getComputedStyle(l).opacity,
      photo: (l.style.getPropertyValue('--hi').match(/i-[A-Za-z0-9]+/) || [''])[0], prev: prev && ids.has(prev) ? ids.get(prev) : 0,
      off: hb.top - r.top, crop: r.height - hb.height, layerMoved: lr.top !== hb.top || lr.height !== hb.height,
      anims: hp.getAnimations().length, state: a ? a.playState : null, t: a ? a.currentTime : null,
      dur: a ? a.effect.getTiming().duration : null, easing: a ? a.effect.getTiming().easing : null };
  });
})()`;
const layerState = (p) => p.eval(LAYER_STATE);
/** The layer showing alone at full opacity (no fade running), or undefined. */
const settledLayer = (ls) => { const s = ls.filter((l) => l.shown); return s.length === 1 && s[0].opacity === 1 ? s[0] : undefined; };
/** Waits for a layer that has settled with its pan running (and moved on a little). */
const settledPanning = (p, timeout = 15000) => waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.state === 'running' && s.t > 0 && s; }, { timeout, interval: 25, what: 'a photo showing alone with its pan running' });
/** Polls every 100 ms for ms, failing as soon as check(state of the layer showing) returns a message. */
async function holdFor(p, ms, check) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const s = settledLayer(await layerState(p));
    const bad = check(s);
    if (bad) throw new Error(bad);
    await sleep(100);
  }
}
// Records every change of the layers (which are shown, their opacity and photo) from the first frame, so a check sees the
// first fade as well as the later ones.
const LAYER_LOG = `(() => { const log = (window.__hrLog = []), ids = new WeakMap(); let n = 0, last = '';
  const tick = () => { const h = document.querySelector('header[data-pool]'); if (h) {
    const s = [...h.querySelectorAll(':scope > .hr')].map((l) => { if (!ids.has(l)) ids.set(l, ++n);
      return { id: ids.get(l), shown: !l.hidden, on: l.classList.contains('on'), opacity: +(+getComputedStyle(l).opacity).toFixed(2), photo: (l.style.getPropertyValue('--hi').match(/i-[A-Za-z0-9]+/) || [''])[0] }; });
    const k = JSON.stringify(s); if (k !== last) { last = k; log.push(s); } }
    requestAnimationFrame(tick); }; requestAnimationFrame(tick); })();`;

check('hero-rotation', 'The two layers take turns: the first photo fades in over the hero\'s own, each later fade brings the idle layer in over the one showing and then hides that one; button, layers and live regions are as specified', async (c) => {
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800], init: LAYER_LOG });
  await p.waitForEval(`!!document.querySelector('header[data-pool] .hpp')`, { what: 'the pause button' });
  const b = await heroButton(p);
  eq([b.hidden, b.label, b.lang, b.pressed], [false, 'Pause the photo rotation', null, false], 'pause button');
  const box = await p.eval(`(() => { const r = document.querySelector('.hpp').getBoundingClientRect(); return [r.width, r.height]; })()`);
  eq(box, [44, 44], 'button size');
  eq(await p.eval(`[...document.querySelectorAll('header[data-pool] .hr')].map((l) => l.getAttribute('aria-hidden'))`), ['true', 'true'], 'the two layers\' aria-hidden');
  eq(await p.eval(`document.querySelectorAll('header[data-pool] [aria-live], header[data-pool] [role=status], header[data-pool] [role=alert]').length`), 0, 'live regions in the hero');
  assert((await names(p, 'button')).includes('Pause the photo rotation'), 'accessibility tree has no button "Pause the photo rotation"');
  // The visible layer changes at each fade: layer A, then B, then A again.
  const order = [];
  await waitFor(async () => {
    const s = settledLayer(await layerState(p));
    if (s && s.id !== order[order.length - 1]?.id) order.push({ id: s.id, photo: s.photo });
    return order.length >= 3;
  }, { timeout: 20000, interval: 25, what: `the visible layer to change twice (saw ${JSON.stringify(order)})` });
  assert(order[0].id !== order[1].id && order[1].id !== order[2].id && order[0].id === order[2].id, `the layers do not take turns: ${JSON.stringify(order)}`);
  assert(order[0].photo !== order[1].photo && order[0].photo === order[2].photo, `the photos do not alternate: ${JSON.stringify(order)}`);
  assert(order.some((o) => o.photo === BUILD_PHOTO) && order.some((o) => o.photo === 'i-8Nr9Vp5'), `both pool photos are not shown: ${JSON.stringify(order)}`);
  // The recorded fades: the first has one layer rising over the hero's own photo; the later ones have the idle layer rising
  // over the one at full opacity, which is hidden when it ends.
  const log = await p.eval('window.__hrLog');
  const shown = (s) => s.filter((l) => l.shown);
  const first = log.find((s) => shown(s).length === 1 && shown(s)[0].opacity > 0 && shown(s)[0].opacity < 1);
  assert(first, 'the first photo was not seen fading in over the hero\'s own photo (one layer with an opacity between 0 and 1)');
  const rising = log.filter((s) => shown(s).length === 2);
  assert(rising.some((s) => shown(s).some((l) => l.opacity > 0 && l.opacity < 1)), 'no later fade was seen with the idle layer rising (opacity between 0 and 1) over the one showing');
  for (const s of rising) {
    const [out, inc] = shown(s).sort((x, y) => y.opacity - x.opacity);
    assert(out.opacity === 1 && inc.opacity <= 1 && inc.id !== out.id && inc.photo !== out.photo, `a fade does not bring the idle layer in over the one showing: ${JSON.stringify(s)}`);
  }
  const after = log.filter((s) => shown(s).length === 1 && shown(s)[0].opacity === 1);
  assert(after.length >= 3, 'too few settled states');
  assert(log.slice(log.findIndex((s) => shown(s).length)).every((s) => shown(s).length >= 1), 'the hero\'s own photo showed again after the first fade (no layer shown)');
  const hidden = await layerState(p);
  assert(hidden.every((l) => l.shown || !l.on), 'a hidden layer still has .on');
  const req = p.requests.filter(isPhotoReq).map((r) => r.url);
  assert(req.some((u) => u.includes('i-8Nr9Vp5')), 'the other photo was never requested');
  assert(req.every((u) => /\/(M|L|XL|X2|X3)\//.test(u)), `a photo request is not in a size of the hero's tiers: ${req.join(' ')}`);
  eq(await p.eval(`document.querySelectorAll('header[data-pool] > .hr').length`), 2, 'layers in the hero');
});

check('hero-pause', 'Tab reaches the pause button after the nav; Enter pauses the rotation and the pan (no change, no request), Space and a click resume both; no aria-pressed', async (c) => {
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800] });
  await p.waitForEval(`!!document.querySelector('header[data-pool] .hpp')`, { what: 'the pause button' });
  const presses = await tabTo(p, '.hpp');
  assert(presses > 3, `Tab reached the button after only ${presses} presses (the skip link and nav come first)`);
  // Wait until no fade is running and the pan is going, so the pause is not pressed during a fade.
  await settledPanning(p);
  await p.key('Enter');
  eq((await heroButton(p)).label, 'Play the photo rotation', 'name after Enter');
  assert((await names(p, 'button')).includes('Play the photo rotation'), 'accessibility tree has no button "Play the photo rotation"');
  eq((await heroButton(p)).pressed, false, 'aria-pressed');
  // The pause takes a frame: wait until the pan has stopped, then hold longer than the scaled interval plus the fade.
  const held = await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.state === 'paused' && s; }, { timeout: 3000, what: 'the pan to pause' });
  await sleep(150);
  const still = settledLayer(await layerState(p));
  const n = p.requests.filter(isPhotoReq).length;
  await holdFor(p, 4500, (s) => {
    if (!s) return 'a fade started while paused';
    if (s.id !== still.id || s.photo !== still.photo) return `the layer or photo changed while paused (${still.photo} to ${s.photo})`;
    if (s.state !== 'paused' || s.t !== still.t || s.off !== still.off) return `the pan moved while paused (t ${still.t} to ${s.t}, offset ${still.off} to ${s.off})`;
    if (p.requests.filter(isPhotoReq).length !== n) return 'a photo was requested while paused';
  });
  assert(still.t >= held.t && still.t > 0, `the pan was reset by the pause (t ${still.t})`);
  await p.key(' ');
  eq((await heroButton(p)).label, 'Pause the photo rotation', 'name after Space');
  // The pan goes on from where it stopped, then the rotation changes the visible layer.
  const resumed = await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.id === still.id && s.state === 'running' && s.t > still.t && s; }, { timeout: 3000, what: 'the pan to run again from where it stopped' });
  assert(resumed.t - still.t < 3000 && resumed.off >= still.off, `the pan did not go on from where it stopped (t ${still.t} to ${resumed.t}, offset ${still.off} to ${resumed.off})`);
  await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.id !== still.id; }, { timeout: 12000, what: 'the rotation to resume after Space' });
  const next = await settledPanning(p);
  assert(next.id !== still.id && next.photo !== still.photo, 'the rotation did not move to the other layer and photo');
  await p.click('.hpp');
  eq((await heroButton(p)).label, 'Play the photo rotation', 'name after a click');
  await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.state === 'paused'; }, { timeout: 3000, what: 'the pan to pause after a click' });
  await p.click('.hpp');
  eq((await heroButton(p)).label, 'Pause the photo rotation', 'name after the second click');
  await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.state === 'running'; }, { timeout: 3000, what: 'the pan to run after the second click' });
});

// The pan (#385), on the home hero of the base build at 1280px: the photos are 3:2, so the hero (about 246px high) crops most of
// the photo's height. The checks read the offset from the rendered box and the animation from getAnimations(), so they hold
// whether the first photo starts its pan at 1/6 of the crop or at the middle (the build's photo over the hero's own, #388).
check('hero-pan', 'The visible layer\'s photo pans down its crop on a compositor transform: linear over the interval, ending at 5/6, the layer itself still', async (c) => {
  const p = await c.open('base', '/', { viewport: [1280, 800] }); // timers not scaled: the first photo stays for the whole check
  const s = await settledPanning(p);
  assert(s.crop > 100, `the photo is not cropped by much (${s.crop}px)`);
  eq([s.anims, s.dur, s.easing], [1, 30000, 'linear'], 'animations on the photo, their duration (hero_interval 30 s) and easing');
  assert(!s.layerMoved, 'the layer (scrim) moved: only its photo may');
  assert(await p.eval(`getComputedStyle(document.querySelector('header[data-pool] .hr .hp'), null).transform !== 'none'`), 'the photo has no transform');
  // Direction and speed from two readings of the rendered offset against the animation's own clock.
  const read = () => p.eval(`(() => { const hb = document.querySelector('header[data-pool]').getBoundingClientRect(), hp = [...document.querySelectorAll('header[data-pool] .hr')].find((l) => !l.hidden).firstElementChild; const a = hp.getAnimations()[0]; return { t: a.currentTime, off: hb.top - hp.getBoundingClientRect().top }; })()`);
  const a = await read();
  const b2 = await waitFor(async () => { const r = await read(); return r.t - a.t >= 600 && r; }, { timeout: 5000, what: '600 ms of pan' });
  assert(b2.off > a.off, `the photo does not move down its crop (offset ${a.off} to ${b2.off})`);
  // Start, middle and end by seeking the animation (restored after), read in the same task so nothing else moves.
  const seek = await p.eval(`(() => { const hb = document.querySelector('header[data-pool]').getBoundingClientRect(), hp = [...document.querySelectorAll('header[data-pool] .hr')].find((l) => !l.hidden).firstElementChild; const a = hp.getAnimations()[0], keep = a.currentTime;
    const at = (t) => { a.currentTime = t; return hb.top - hp.getBoundingClientRect().top; };
    const r = { start: at(0), mid: at(15000), end: at(30000), after: at(30000 + 5000) }; a.currentTime = keep; return r; })()`);
  const near = (x, y, what) => assert(Math.abs(x - y) <= 1, `${what}: ${x} is not within 1px of ${y}`);
  assert(seek.start >= s.crop / 6 - 1 && seek.start <= s.crop / 2 + 1, `the pan starts at ${seek.start}px, outside 1/6 to 1/2 of the ${s.crop}px crop`);
  near(seek.end, s.crop * 5 / 6, 'the pan\'s end (5/6 of the crop)');
  near(seek.mid, (seek.start + seek.end) / 2, 'the pan\'s middle (linear)');
  near(seek.after, seek.end, 'the offset after the end (the pan holds its last position)');
  const speed = (b2.off - a.off) / (b2.t - a.t), expect = (seek.end - seek.start) / 30000;
  assert(Math.abs(speed - expect) <= expect * 0.05, `the pan's speed is ${speed} px/ms, not the ${expect} of a straight line over the interval`);
  assert(b2.off >= seek.start - 1 && b2.off <= seek.end + 1, 'the offset is outside the pan');
});

check('hero-pan-second', 'The photo that fades in over another starts its pan at 1/6 of the crop, paused while it fades, and does not jump when the other layer is hidden', async (c) => {
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800] });
  let fade, last;
  await waitFor(async () => {
    const ls = await layerState(p), sh = ls.filter((l) => l.shown);
    if (sh.length === 2) { fade = sh.find((l) => l.opacity < 1); if (fade) last = fade; return false; }
    return last && settledLayer(ls)?.id === last.id && ls;
  }, { timeout: 20000, interval: 10, what: 'the second photo to fade in over the first and settle' });
  const after = settledLayer(await layerState(p));
  assert(last.opacity < 1 && last.anims === 1, 'the incoming layer has no pan animation while it fades');
  assert(Math.abs(last.off - last.crop / 6) <= 1, `the second photo fades in at ${last.off}px, not 1/6 of its ${last.crop}px crop`);
  eq([last.state, last.t], ['paused', 0], 'the incoming photo\'s pan during the fade');
  assert(after.off >= last.off - 1 && after.off - last.off < 40, `the photo jumped when the other layer was hidden (${last.off} to ${after.off})`);
  assert(await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.id === last.id && s.state === 'running' && s.off > last.off; }, { timeout: 3000, what: 'the second photo to pan' }), 'no pan');
});

check('hero-pan-hold', 'The pan holds its offset while the button pauses it, the tab is hidden or reduced motion is on, and goes on from there', async (c) => {
  const p = await c.open('base', '/', { viewport: [1280, 800] });
  await p.waitForEval(`!!document.querySelector('header[data-pool] .hpp')`, { what: 'the pause button' });
  await settledPanning(p);
  const cases = [
    ['pause button', () => p.click('.hpp'), () => p.click('.hpp')],
    ['hidden tab', () => p.eval(`Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); true`),
      () => p.eval(`Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); true`)],
    ['reduced motion', () => p.setMedia({ 'prefers-reduced-motion': 'reduce' }), () => p.setMedia({ 'prefers-reduced-motion': 'no-preference' })],
  ];
  for (const [name, on, off] of cases) {
    await on();
    await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.state === 'paused'; }, { timeout: 3000, what: `the pan to pause (${name})` });
    await sleep(150); // the pause takes a frame to settle
    const held = settledLayer(await layerState(p));
    await holdFor(p, 1200, (s) => (!s || s.state !== 'paused' || s.t !== held.t || s.off !== held.off ? `${name}: the pan moved while held (t ${held.t}, offset ${held.off})` : ''));
    await off();
    const r = await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.state === 'running' && s.t > held.t && s; }, { timeout: 3000, what: `the pan to run again (${name})` });
    assert(r.t - held.t < 2500 && r.off >= held.off && r.off - held.off < 40, `${name}: the pan did not go on from where it stopped (t ${held.t} to ${r.t}, offset ${held.off} to ${r.off})`);
  }
});

check('hero-pan-none', 'No pan with reduced motion, on a page with no pool, or where the photo is not cropped (320px wide)', async (c) => {
  const r = await c.open('base', '/', { viewport: [1280, 800], media: { 'prefers-reduced-motion': 'reduce' } });
  await r.waitForEval(`!!document.querySelector('header[data-pool] .hr')`, { what: 'the script to have run' });
  const rm = () => r.eval(`({ all: document.getAnimations().length, hp: [...document.querySelectorAll('.hp')].map((h) => [h.getAnimations().length, h.style.transform, h.style.height]), shown: [...document.querySelectorAll('.hr')].filter((l) => !l.hidden).length })`);
  eq(await rm(), { all: 0, hp: [[0, '', ''], [0, '', '']], shown: 0 }, 'animations, photo styles and layers shown with reduced motion');
  await sleep(600);
  eq((await rm()).all, 0, 'animations 600 ms later');
  const t = await c.open('base', '/tags/code/', { viewport: [1280, 800] });
  eq(await t.eval(`[document.querySelectorAll('.hr, .hp').length, document.getAnimations().length]`), [0, 0], 'layers and animations on a page with no pool');
  const n = await c.open('base', '/', { viewport: [320, 800] });
  await waitFor(async () => settledLayer(await layerState(n)), { timeout: 15000, interval: 25, what: 'the first photo to show at 320px' });
  const hp = await n.eval(`(() => { const hb = document.querySelector('header[data-pool]').getBoundingClientRect(), hp = [...document.querySelectorAll('header[data-pool] .hr')].find((l) => !l.hidden).firstElementChild; return { hero: hb.height, photo: hp.getBoundingClientRect().height, anims: hp.getAnimations().length, style: hp.getAttribute('style') }; })()`);
  assert(Math.abs(hp.hero - hp.photo) < 0.5 && hp.anims === 0 && !hp.style, `at 320px the photo is ${hp.photo}px in a ${hp.hero}px hero with ${hp.anims} animations (style ${hp.style})`);
});

check('hero-focus-ring', 'The pause button is 44 by 44 with a 3px cream outline around a 2px dark halo, also with forced colors', async (c) => {
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800] });
  await p.waitForEval(`!!document.querySelector('header[data-pool] .hpp')`, { what: 'the pause button' });
  await tabTo(p, '.hpp');
  const ring = () => p.eval(`(() => { const cs = getComputedStyle(document.querySelector('.hpp')); return { w: cs.outlineWidth, s: cs.outlineStyle, c: cs.outlineColor, sh: cs.boxShadow }; })()`);
  const r = await ring();
  eq([r.w, r.s], ['3px', 'solid'], 'outline');
  assert(/ 0px 0px 0px 2px|0px 0px 0px 2px/.test(r.sh), `no 2px halo in box-shadow: ${r.sh}`);
  await p.setMedia({ 'forced-colors': 'active' });
  const f = await ring();
  assert(f.w === '3px' && f.s === 'solid', `forced-colors: outline is ${f.w} ${f.s}`);
  assert(/ 0px 0px 0px 2px|0px 0px 0px 2px/.test(f.sh) || f.sh === 'none', `forced-colors: box-shadow ${f.sh}`);
});

check('hero-reduced-motion', 'With reduced motion: no button, no layer, no rotation and no more photo requests; the setting is followed while open', async (c) => {
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800], media: { 'prefers-reduced-motion': 'reduce' } });
  await sleep(300);
  let b = await heroButton(p);
  assert(!b || b.hidden, 'the pause button is shown');
  await sleep(4500);
  eq(await heroId(p), BUILD_PHOTO, 'photo with reduced motion');
  eq(await p.eval(`document.querySelector('header[data-pool] .hr') ? document.querySelector('header[data-pool] .hr').hidden : true`), true, 'layer hidden');
  assert(!p.requests.filter(isPhotoReq).some((r) => r.url.includes('i-8Nr9Vp5')), 'the other photo was requested');
  await p.setMedia({ 'prefers-reduced-motion': 'no-preference' });
  await p.waitForEval(`(() => { const b = document.querySelector('.hpp'); return b && !b.hidden; })()`, { what: 'the button to appear when reduced motion is switched off' });
  // Chrome reports a media query change to a script one frame after it happens, and not at all if the script reads
  // `matches` in between (the hero does when it starts a photo's timers, two frames after the photo changes). The hero reads the
  // setting itself wherever it needs it, so switch the moment the photo has changed, with no wait.
  await heroSequence(p, 2);
  await p.setMedia({ 'prefers-reduced-motion': 'reduce' });
  try {
    await p.waitForEval(`document.querySelector('.hpp').hidden`, { what: 'the button to go when reduced motion is switched on', timeout: 4000 });
  } catch (e) {
    throw new Error(`${e.message} (state: ${JSON.stringify(await p.eval(`[matchMedia('(prefers-reduced-motion: reduce)').matches, document.querySelector('.hpp').hidden, document.querySelector('.hr').hidden]`))})`);
  }
});

check('hero-reduced-motion-silent', 'When reduced motion is switched on and the page is never told (no change event), the next photo change still hides the button and ends the rotation', async (c) => {
  // The page's matchMedia answers `matches` from a switch the check flips just before the timer that ends a fade (1.6 s) runs,
  // and never fires a change event: what Chrome does when the script reads `matches` before the event arrives.
  const SILENT = `(() => { const real = window.matchMedia.bind(window), Q = '(prefers-reduced-motion: reduce)'; let on = false;
    window.matchMedia = (s) => { const m = real(s); if (s !== Q) return m; return new Proxy(m, { get: (t, k) => (k === 'matches' ? on : typeof t[k] === 'function' ? t[k].bind(t) : t[k]) }); };
    window.__silent = { arm: false };
    const st = window.setTimeout; window.setTimeout = function (f, d, ...a) { if (d === 1600 && window.__silent.arm) { window.__silent.arm = false; const g = f; f = function () { on = true; return g.apply(this, arguments); }; } return st.call(this, f, d, ...a); }; })();`;
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800], init: SILENT });
  await p.waitForEval(`(() => { const b = document.querySelector('.hpp'); return b && !b.hidden; })()`, { what: 'the pause button' });
  await p.eval('window.__silent.arm = true');
  await p.waitForEval(`document.querySelector('.hpp').hidden`, { what: 'the button to go when the setting changed with no event', timeout: 8000 });
  await sleep(2500); // longer than the scaled interval and a fade: the rotation must have ended
  const id = await heroId(p);
  await sleep(2500);
  eq(await heroId(p), id, 'photo after the rotation should have ended');
});

check('hero-focus-kept', 'Focus moves to main#main, not body, when the button goes away (reduced motion switched on, or every photo fails)', async (c) => {
  const focusAfter = async (p) => {
    await p.waitForEval(`document.querySelector('.hpp').hidden`, { what: 'the button to be hidden' });
    eq(await p.eval('document.activeElement.id'), 'main', 'document.activeElement');
    await p.key('Tab');
    assert(await p.eval(`(() => { const a = document.activeElement; return a !== document.body && !a.closest('header') && !!a.closest('main') && a.id !== 'main'; })()`), 'the next Tab did not go to the first stop after the hero');
  };
  const a = await c.open('base', '/', { viewport: [1280, 800] }); // timers not scaled: none is due while the media setting changes
  await a.waitForEval(`!!document.querySelector('.hpp')`, { what: 'the pause button' });
  await tabTo(a, '.hpp');
  await a.setMedia({ 'prefers-reduced-motion': 'reduce' });
  await focusAfter(a);

  let armed = false, release;
  const gate = new Promise((r) => { release = r; });
  const held = [];
  const rule = (url) => {
    if (!armed || !url.startsWith('https://photos.smugmug.com/')) return { fulfill: { body: PHOTO } };
    held.push(url);
    return { wait: gate.then(() => ({ fail: true })) };
  };
  const b = await c.open('base', '/', { scale: true, viewport: [1280, 800], photos: rule });
  await b.waitForEval(`!!document.querySelector('.hpp')`, { what: 'the pause button' });
  armed = true;
  await waitFor(() => held.length > 0, { timeout: 8000, what: 'a held photo request' });
  await tabTo(b, '.hpp');
  release();
  await b.waitForEval(`document.querySelector('.hpp').hidden`, { what: 'the button to go once the photos fail' });
  await focusAfter(b);
});

check('hero-bad-pool', 'data-pool tokens the build can not write are ignored (unknown size, five names, over 512 characters) and the hero still rotates', async (c) => {
  const bad = ['photos/b1/0/zz/X3/badone-X3.jpg|M,L,EVIL,X2,,X2,,', 'photos/b2/0/zz/X3/badfive-X3.jpg|M,L,X2,X2,', 'photos/' + 'a'.repeat(600) + '/0/zz/X3/badlong-X3.jpg|M,L,X2,X2,,X2', 'photos/b4/0/zz/X2/badmix-X3.jpg|M,L,X2,X2,,X2'];
  const rewrite = (path, body) => (path === '/' ? Buffer.from(body.toString().replace('data-pool="', `data-pool="${bad.join(' ')} `)) : undefined);
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800], hooks: { rewrite }, key: 'bad-pool' });
  await p.waitForEval(`!!document.querySelector('.hpp')`, { what: 'the pause button' });
  assert(await p.eval(`document.querySelector('header[data-pool]').getAttribute('data-pool').includes('badone')`), 'the test page has no bad tokens');
  const seq = await heroSequence(p, 3);
  assert(seq.every((s) => s === BUILD_PHOTO || s === 'i-8Nr9Vp5'), `the hero showed a photo outside the build's pool: ${seq}`);
  assert(!p.requests.some((r) => /bad(one|five|long|mix)/.test(r.url)), 'a bad pool entry was requested');
});

check('hero-lang', 'On a language with no text for the pause button it carries lang="en" and the same names, also after it is pressed', async (c) => {
  const p = await c.open('multilingual', '/', { scale: true, viewport: [1280, 800] });
  await p.waitForEval(`!!document.querySelector('.hpp')`, { what: 'the pause button' });
  let b = await heroButton(p);
  eq([b.label, b.lang], ['Pause the photo rotation', 'en'], 'German pause button');
  await p.click('.hpp');
  b = await heroButton(p);
  eq([b.label, b.lang], ['Play the photo rotation', 'en'], 'German play button');
  const en = await c.open('multilingual', '/en/', { scale: true, viewport: [1280, 800] });
  const e = await en.eval(`(() => { const b = document.querySelector('.hpp'); return b ? [b.getAttribute('aria-label'), b.getAttribute('lang')] : null; })()`);
  if (e) eq(e, ['Pause the photo rotation', null], 'English pause button');
});

// ---------------------------------------------------------------------------------------------------------------------
// Lightbox

const LB = 'dialog.lb';
async function openFirst(p, gallery = '.gal') {
  await p.click(`${gallery} a`);
  await p.waitForEval(`(() => { const d = document.querySelector('${LB}'); return d && d.open && d.querySelector('.count').textContent !== '' && !d.hasAttribute('aria-busy'); })()`, { what: 'the lightbox to open and show its first photo' });
}
const lbState = (p) => p.eval(`(() => { const d = document.querySelector('${LB}'); return { count: d.querySelector('.count').innerHTML, say: d.querySelector('[aria-live]').innerHTML, src: d.querySelector('img').src, open: d.open }; })()`);
const lbCounter = (p) => p.eval(`document.querySelector('${LB} .count').textContent`);

check('lightbox-lang', 'On a language lacking the lightbox text, the dialog and buttons are lang="en" with English names, the photo\'s alt text is not marked; English pages have no lang', async (c) => {
  const p = await c.open('multilingual', '/post/20260113-fotos/', { viewport: [1280, 800] });
  await openFirst(p);
  const dom = await p.eval(`(() => { const d = document.querySelector('${LB}'); return { dlg: d.getAttribute('lang'), inn: d.querySelector('.in').getAttribute('lang'), btns: [...d.querySelectorAll('button')].map((b) => [b.getAttribute('aria-label'), b.getAttribute('lang')]) , say: d.querySelector('[aria-live]').innerHTML }; })()`);
  eq(dom.dlg, 'en', 'dialog lang');
  eq(dom.inn, 'de-DE', 'wrapper lang');
  eq(dom.btns, [['Previous photo', 'en'], ['Next photo', 'en'], ['Close photo viewer', 'en']], 'buttons');
  eq(dom.say, '<span lang="en">Photo 1 of 2</span>: Querformat', 'announcement');
  const ax = await p.axNodes((n) => ['button', 'dialog'].includes(n.role));
  const axNames = ax.map((n) => n.name);
  for (const n of ['Photo viewer', 'Previous photo', 'Next photo', 'Close photo viewer']) assert(axNames.includes(n), `accessibility tree has no "${n}" (has ${axNames})`);

  const f = await c.open('multilingual', '/post/20260113-fotos/', { viewport: [1280, 800], photos: 'fail' });
  await openFirst(f);
  const st = await lbState(f);
  eq(st.say, '<span lang="en">Photo 1 of 2</span>: Querformat <span lang="en">(image couldn’t be loaded)</span>', 'announcement after a failed load');
  eq(st.count, '1 / 2 <span lang="en">(image couldn’t be loaded)</span>', 'counter after a failed load');

  const en = await c.open('multilingual', '/en/post/20260107-photo-gallery/', { viewport: [1280, 800] });
  await openFirst(en);
  eq(await en.eval(`(() => { const d = document.querySelector('${LB}'); return d.querySelectorAll('[lang]').length + (d.hasAttribute('lang') ? 1 : 0); })()`), 0, 'lang attributes in the English lightbox');
});

check('lightbox-names', 'A button whose name is English but whose text is translated keeps lang="en" on the button and the text in a span in the page\'s language', async (c) => {
  const p = await c.open('lightbox-names', '/post/20260114-photos/', { viewport: [1280, 800] });
  await openFirst(p);
  const lang = await p.eval('document.documentElement.lang');
  const btns = await p.eval(`[...document.querySelectorAll('${LB} button')].map((b) => ({ name: b.getAttribute('aria-label'), lang: b.getAttribute('lang'), text: b.textContent, span: b.querySelector('span') ? [b.querySelector('span').lang, b.querySelector('span').textContent] : null }))`);
  eq(btns.map((b) => [b.name, b.lang]), [['Previous photo', 'en'], ['Next photo', 'en'], ['Close photo viewer', 'en']], 'button names and lang');
  eq(btns.map((b) => b.span), [[lang, 'Précédent'], [lang, 'Suivant'], [lang, 'Fermer']], 'visible text spans');
  assert(lang === 'fr-FR', `page language is ${lang}`);
  const ax = (await p.axNodes((n) => n.role === 'button')).map((n) => n.name);
  for (const n of ['Previous photo', 'Next photo', 'Close photo viewer']) assert(ax.includes(n), `accessibility tree has no button "${n}" (has ${ax})`);
  // Clicking the visible text (the span inside the button) works like clicking the button (#410).
  eq(await lbCounter(p), '1 / 2', 'counter on opening');
  await p.click(`${LB} [data-a="n"] span`);
  await p.waitForEval(`document.querySelector('${LB} .count').textContent === '2 / 2' && !document.querySelector('${LB}').hasAttribute('aria-busy')`, { what: 'the counter to read 2 / 2 after clicking the text of Next' });
  await p.click(`${LB} [data-a="p"] span`);
  await p.waitForEval(`document.querySelector('${LB} .count').textContent === '1 / 2' && !document.querySelector('${LB}').hasAttribute('aria-busy')`, { what: 'the counter to read 1 / 2 after clicking the text of Previous' });
  await p.click(`${LB} [data-a="c"] span`);
  await p.waitForEval(`!document.querySelector('${LB}').open`, { what: 'the lightbox to close after clicking the text of Close' });
});

check('lightbox-keys', 'Arrow, Home and End keys change the photo only without Alt, Ctrl, Meta or Shift; Tab cycles; Escape returns focus to the photo; arrows follow the direction', async (c) => {
  const p = await c.open('base', '/post/20260104-smugmug-photos/', { viewport: [1280, 800] });
  await openFirst(p);
  const total = +(await lbCounter(p)).split(' / ')[1];
  assert(total >= 3, `the post has ${total} photos`);
  await p.eval(`window.__dp = []; document.addEventListener('keydown', (e) => window.__dp.push([e.key, e.defaultPrevented]));`);
  for (const m of [1, 2, 4, 8]) {
    for (const k of ['ArrowRight', 'ArrowLeft', 'Home', 'End']) {
      await p.key(k, { modifiers: m });
    }
  }
  await sleep(300);
  eq(await lbCounter(p), `1 / ${total}`, 'counter after keys with a modifier');
  const dp = await p.eval('window.__dp');
  eq(dp.length, 16, 'keydown events seen');
  assert(dp.every(([, prevented]) => prevented === false), `a modified key was default-prevented: ${JSON.stringify(dp.filter((d) => d[1]))}`);
  const go = async (key, want) => { await p.key(key); await p.waitForEval(`document.querySelector('${LB} .count').textContent === '${want} / ${total}' && !document.querySelector('${LB}').hasAttribute('aria-busy')`, { what: `the counter to read ${want} / ${total} after ${key}` }); };
  await go('ArrowRight', 2);
  await go('ArrowLeft', 1);
  await go('End', total);
  await go('Home', 1);
  // Tab moves Close, Previous, Next, Close.
  const focus = () => p.eval(`document.activeElement.getAttribute('aria-label')`);
  eq(await focus(), 'Close photo viewer', 'initial focus');
  const order = [];
  // (Headless Chrome spends one Tab on the document when focus wraps past the dialog's last button.)
  for (let i = 0; i < 4; i++) { await p.key('Tab'); order.push(await focus()); }
  eq(order.filter((n) => n), ['Previous photo', 'Next photo', 'Close photo viewer'], 'Tab order');
  // The arrows follow the direction of a right-to-left page.
  await p.eval(`document.documentElement.dir = 'rtl'`);
  await go('ArrowLeft', 2);
  await go('ArrowRight', 1);
  await p.eval(`document.documentElement.dir = ''`);
  await p.key('Escape');
  await p.waitForEval(`!document.querySelector('${LB}').open`, { what: 'the lightbox to close' });
  eq(await p.eval(`document.activeElement === document.querySelector('.gal a')`), true, 'focus after Escape');
});

check('lightbox-size', 'The lightbox loads X2 where it has a pixel per device pixel and X3 otherwise, and follows a resize; its listeners do not pile up', async (c) => {
  const cases = [[390, 844, 1, 'X2'], [390, 844, 3, 'X2'], [1280, 800, 1, 'X2'], [1280, 800, 2, 'X3']];
  for (const [w, h, dpr, want] of cases) {
    const p = await c.open('base', '/post/20260104-smugmug-photos/', { viewport: [w, h, { dpr, mobile: w < 600 }] });
    assert(await p.eval(`!!document.querySelector('.gal img[width][height]')`), "the thumbnails have no width and height (the build could not read the photos' sizes: build with a network)");
    await openFirst(p);
    const st = await lbState(p);
    assert(st.src.includes(`/${want}/`), `${w}x${h} at ${dpr}x: expected ${want}, got ${st.src}`);
    eq(await p.eval(`/\\/X3\\//.test(document.querySelector('.gal a').href)`), true, 'the link\'s href is X3');
    await p.close();
  }
  const p = await c.open('base', '/post/20260104-smugmug-photos/', { viewport: [390, 844, { dpr: 1, mobile: true }] });
  const listeners = async () => {
    const { result } = await p.send('Runtime.evaluate', { expression: 'window' });
    const { listeners: l } = await p.send('DOMDebugger.getEventListeners', { objectId: result.objectId });
    return ['resize', 'orientationchange'].map((t) => l.filter((x) => x.type === t).length);
  };
  const before = await listeners();
  await openFirst(p);
  eq((await lbState(p)).src.includes('/X2/'), true, 'opened at 390x844 at 1x');
  await p.setViewport(1280, 800, { dpr: 2 });
  await p.waitForEval(`document.querySelector('${LB} img').src.includes('/X3/')`, { what: 'the lightbox to switch to X3 after the window grew' });
  await p.setViewport(390, 844, { dpr: 3, mobile: true });
  await p.waitForEval(`document.querySelector('${LB} img').src.includes('/X2/')`, { what: 'the lightbox to go back to X2' });
  for (let i = 0; i < 4; i++) { await p.key('Escape'); await p.waitForEval(`!document.querySelector('${LB}').open`, { what: 'the lightbox to close' }); await openFirst(p); }
  const after = await listeners();
  eq(after.map((n, i) => n - before[i]), [1, 1], 'resize and orientationchange listeners added by opening the lightbox 5 times');
});

check('lightbox-failed', 'A photo that fails to load is said so in the counter and announcement; a failing X3 with a working thumbnail is not', async (c) => {
  const p = await c.open('base', '/post/20260104-smugmug-photos/', { viewport: [1280, 800], photos: 'fail' });
  await openFirst(p);
  const total = +(await lbCounter(p)).match(/\/ (\d+)/)[1];
  const alt = await p.eval(`document.querySelector('.gal img').alt`);
  eq(await lbCounter(p), `1 / ${total} (image couldn’t be loaded)`, 'counter');
  eq(await p.eval(`document.querySelector('${LB} [aria-live]').textContent`), `Photo 1 of ${total}: ${alt} (image couldn’t be loaded)`, 'announcement');
  // Only the X3 request fails; at 2x on a desktop window the lightbox asks for X3, and the thumbnail loads.
  const x3 = (url, req) => (url.includes('/X3/') ? { fulfill: { status: 404, body: '' } } : { fulfill: { body: PHOTO } });
  const q = await c.open('base', '/post/20260104-smugmug-photos/', { viewport: [1280, 800, { dpr: 2 }], photos: x3 });
  await openFirst(q);
  eq(await lbCounter(q), `1 / ${total}`, 'counter with only X3 failing');
  eq(await q.eval(`document.querySelector('${LB} [aria-live]').textContent`), `Photo 1 of ${total}: ${alt}`, 'announcement with only X3 failing');
  assert(q.requests.some((r) => r.url.includes('/X3/')), 'X3 was never requested, so the test did not exercise the fallback');
});

check('lightbox-short-viewport', 'On a short viewport the lightbox\'s Close (with 5px around it), Previous and Next stay on screen and the dialog does not scroll; on others the photo keeps its size (3:2 and 2:3 photos, left to right and right to left)', async (c) => {
  const bad = [];
  for (const [pw, ph] of [[3000, 2000], [2000, 3000]]) {
    const img = png(pw, ph);
    const rule = (url, req, type) => (new URL(url).hostname === HOST ? undefined : type === 'Image' ? { fulfill: { body: img } } : { fail: true });
    for (const dir of ['ltr', 'rtl']) {
      for (const [w, h, short] of [[320, 200, true], [320, 256, true], [568, 320, true], [320, 640, false], [1280, 1024, false], [1920, 1080, false]]) {
        const p = await c.open('base', '/post/20260104-smugmug-photos/', { viewport: [w, h], photos: rule });
        await p.eval(`document.documentElement.dir = ${JSON.stringify(dir)}`);
        await openFirst(p);
        await p.waitForEval(`(() => { const i = document.querySelector('${LB} img'); return i.complete && i.naturalWidth > 0; })()`, { what: `the lightbox photo to load (${pw}x${ph} ${dir} at ${w}x${h})` });
        await sleep(100);
        const m = await p.eval(`(() => { const d = document.querySelector('${LB}'); const r = (s) => { const b = d.querySelector(s).getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; }; const i = d.querySelector('img').getBoundingClientRect(); return { close: r('[data-a=c]'), prev: r('[data-a=p]'), next: r('[data-a=n]'), img: [i.width, i.height], scrolled: [d.scrollTop, d.scrollLeft], vw: document.documentElement.clientWidth, vh: innerHeight }; })()`);
        const label = `${pw}x${ph} ${dir} at ${w}x${h}`;
        if (short) {
          const inside = (b, pad) => b[0] >= pad && b[1] >= pad && b[2] <= m.vw - pad && b[3] <= m.vh - pad;
          if (!inside(m.close, 5)) bad.push(`${label}: Close is not inside the viewport with 5px around it (${m.close})`);
          if (!inside(m.prev, 0)) bad.push(`${label}: Previous is outside the viewport (${m.prev})`);
          if (!inside(m.next, 0)) bad.push(`${label}: Next is outside the viewport (${m.next})`);
          if (m.scrolled[0] !== 0 || m.scrolled[1] !== 0) bad.push(`${label}: the dialog scrolled (${m.scrolled})`);
        } else {
          const byHeight = Math.abs(m.img[1] - 0.8 * h) <= 1.5, byWidth = Math.abs(m.img[0] - (w - 32)) <= 1.5;
          if (!byHeight && !byWidth) bad.push(`${label}: the photo is ${m.img[0].toFixed(1)}x${m.img[1].toFixed(1)}, neither 80% of the height nor the width limit`);
        }
        await p.close();
      }
    }
  }
  assert(!bad.length, bad.slice(0, 4).join('; ') + (bad.length > 4 ? `; and ${bad.length - 4} more` : ''));
});

// ---------------------------------------------------------------------------------------------------------------------
// Wall, comments, scripts' English fallback

check('wall-nojs', 'Without JavaScript the wall controls and the theme switch collapse: the first row sits directly under the hero', async (c) => {
  const p = await c.open('base', '/', { js: false, viewport: [1280, 900] });
  const m = await p.eval(`(() => { const h = document.querySelector('header.hero').getBoundingClientRect(); const t = document.querySelector('.tile').getBoundingClientRect(); return { gap: t.top - h.bottom, ctl: getComputedStyle(document.querySelector('#ctl')).display, theme: getComputedStyle(document.querySelector('nav.site li.theme')).display }; })()`);
  eq([m.ctl, m.theme], ['none', 'none'], 'controls and theme switch display');
  assert(m.gap < 20, `the first tile is ${m.gap}px under the hero`);
});

check('wall-caption-lang', 'The wall\'s caption and group headings put the theme\'s English in lang="en" spans and nothing else (German, Arabic); English pages have none', async (c) => {
  const cap = (p) => p.eval(`document.querySelector('.cap').innerHTML`);
  const de = await c.open('multilingual', '/', { viewport: [1280, 900] });
  assert(/^<span lang="en">(Showing|This page: )\s*\d+ articles?, \d+ photos?<\/span>$/.test(await cap(de)), `German caption: ${await cap(de)}`);   // "This page:" because the German home page has a pager
  const ar = await c.open('rtl', '/', { viewport: [1280, 900] });
  assert(/^<span lang="en">This page: <\/span>[^<]+<span lang="en">, <\/span>[^<]+$/.test(await cap(ar)), `Arabic caption: ${await cap(ar)}`);
  for (const [build, path] of [['base', '/'], ['multilingual', '/en/'], ['rtl', '/en/']]) {
    const p = await c.open(build, path, { viewport: [1280, 900] });
    eq(await p.eval(`document.querySelector('.cap').querySelectorAll('[lang]').length`), 0, `${build}${path} caption lang attributes`);
  }
  // Group by gallery: the "Articles" heading and the options badge are marked; the gallery's own heading is not.
  await de.click('#vb');
  await de.click('input[data-role=grp]');
  await de.waitForEval(`document.querySelectorAll('#stage details.grp').length > 0`, { what: 'the grouped view' });
  const g = await de.eval(`({ articles: [...document.querySelectorAll('#stage h3')].find((h) => /Articles/.test(h.textContent)).innerHTML, gallery: [...document.querySelectorAll('#stage h3')].find((h) => /Fotos auf Deutsch/.test(h.textContent)).innerHTML, badge: document.querySelector('#vb .bdg .vh').outerHTML, cap: document.querySelector('.cap').innerHTML })`);
  assert(g.articles.startsWith('<span lang="en">Articles</span> · '), `"Articles" heading: ${g.articles}`);
  assert(g.gallery.startsWith('Fotos auf Deutsch · '), `gallery heading: ${g.gallery}`);
  assert(g.badge.includes('lang="en"') && g.badge.includes('class="vh"'), `badge: ${g.badge}`);
  assert(/^<span lang="en">This page: \d+ articles?, 2 photos, grouped into 1 gallery<\/span>$/.test(g.cap), `grouped caption: ${g.cap}`);   // "This page": the German home page has a pager
});

check('wall-script-text', 'Each language\'s wall script lists the entries it lacks as en:[…]; the Arabic one has the plural forms', async (c) => {
  const src = async (build, path) => {
    const p = await c.open(build, path);
    const url = await p.eval(`[...document.scripts].map((s) => s.src).find((s) => /wall/.test(s))`);
    return p.eval(`fetch(${JSON.stringify(url)}).then((r) => r.text())`).then((t) => [url, t]);
  };
  const [du, dt] = await src('multilingual', '/');
  assert(/wall\.de\./.test(du) && /en:\[[^\]]/.test(dt), `German wall script (${du}) has no entries in en:[…]`);
  const [au, at] = await src('rtl', '/');
  assert(/wall\.ar\./.test(au) && /en:\[[^\]]/.test(at), `Arabic wall script (${au}) has no entries in en:[…]`);
  assert(/p:\[0,1,2,3,/.test(at), 'Arabic wall script has no p:[0,1,2,3,…] plural samples');
  const [eu, et] = await src('base', '/');
  assert(!/en:\[[^\]]/.test(et), `English wall script (${eu}) lists entries as English`);
});

check('rtl-group-triangle', 'The closed group\'s triangle is "◂" on Arabic pages and "▸" on English ones; the open one is "▾" in both', async (c) => {
  for (const [path, closed] of [['/', '◂'], ['/en/', '▸']]) {
    const p = await c.open('rtl', path, { viewport: [1280, 900] });
    await p.click('#vb');
    await p.click('input[data-role=grp]');
    await p.waitForEval(`document.querySelectorAll('#stage details.grp > summary').length > 0`, { what: 'the grouped view' });
    const mark = () => p.eval(`getComputedStyle(document.querySelector('#stage details.grp > summary'), '::before').content`);
    eq(await mark(), '"▾" / ""', `open triangle on ${path}`);
    await p.eval(`document.querySelector('#stage details.grp').open = false`);
    const got = await mark();
    assert(got.startsWith(`"${closed}"`), `closed triangle on ${path}: expected "${closed}", got ${got}`);
  }
});

check('wall-plural', 'The Arabic wall caption reads the six plural forms (0 zero, 1 one, 2 two, 3-10 few, 11-99 many, 100-102 other, 103 few)', async (c) => {
  const toml = readFileSync(new URL('../exampleSite/i18n/ar.toml', import.meta.url), 'utf8');
  const forms = (section) => {
    const m = toml.match(new RegExp(`^\\[${section}\\]\\n((?:[a-z]+ = ".*"\\n?)+)`, 'm'));
    return Object.fromEntries([...m[1].matchAll(/^([a-z]+) = "(.*)"$/gm)].map((x) => [x[1], x[2]]));
  };
  const art = forms('articleCount'), pho = forms('photoCount');
  const rules = new Intl.PluralRules('ar');
  const say = (f, n) => f[rules.select(n)].replace('{{ .Count }}', n);
  const root = resolve(c.out, 'rtl');
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  const article = html.match(/<article class="tile article"[\s\S]*?<\/article>/)[0];
  const photo = html.match(/<figure class="tile photo"(?![^>]*data-more)[\s\S]*?<\/figure>/)[0];
  const page = (A, P) => html.replace(/<article class="tile article"[\s\S]*?<\/article>|<figure class="tile photo"[\s\S]*?<\/figure>/g, '')
    .replace('<div class=mas>', '<div class=mas>' + article.repeat(A) + photo.repeat(P)).replace(/data-articles=\d+ data-photos=\d+/, `data-articles=${A} data-photos=${P}`);
  const hooks = { before: (path) => { const m = path.match(/^\/plural\/(\d+)\/(\d+)\/$/); return m ? { type: 'text/html; charset=utf-8', body: page(+m[1], +m[2]) } : undefined; } };
  const bad = [];
  for (const [A, P] of [[0, 1], [2, 3], [5, 11], [12, 100], [21, 22], [101, 102], [103, 6], [1, 2]]) {
    const p = await c.open('rtl', `/plural/${A}/${P}/`, { hooks, key: 'plural', viewport: [1280, 900] });
    const got = await p.eval(`document.querySelector('.cap').textContent`);
    const want = `This page: ${say(art, A)}, ${say(pho, P)}`;
    if (got !== want) bad.push(`(${A}, ${P}): expected "${want}", got "${got}"`);
    await p.close();
  }
  assert(!bad.length, bad.join('; '));
});

check('comments-lang', 'The comment status and Try again button carry lang="en" while their text is English; English pages have none', async (c) => {
  const run = async (build, path) => {
    const p = await c.open(build, path);
    await p.click('.showc');
    await p.waitForEval(`/couldn.t be loaded/.test(document.getElementById('comments-status').textContent)`, { what: 'the failure message' });
    return p.eval(`({ st: document.getElementById('comments-status').getAttribute('lang'), btn: document.querySelector('.showc').getAttribute('lang'), shown: !document.querySelector('.showc').hidden })`);
  };
  eq(await run('multilingual', '/post/20260113-fotos/'), { st: 'en', btn: 'en', shown: true }, 'German post');
  eq(await run('multilingual', '/en/post/20260107-photo-gallery/'), { st: null, btn: null, shown: true }, 'English post');
});

// ---------------------------------------------------------------------------------------------------------------------
// Search and the 404 page

const results = (p) => p.eval(`({ status: document.querySelector('.sst').textContent, list: [...document.querySelectorAll('.sres li')].map((li) => ({ path: new URL(li.querySelector('a').href).pathname, marks: [...li.querySelectorAll('mark')].map((m) => m.textContent) })) })`);
/**
 * Types a query into the search field the way a reader does, presses Enter (which says the count at once) and waits until
 * the results and the status are the ones for that query, not the previous query's.
 */
async function search(p, q) {
  await p.click('#search-q');
  await p.eval(`(() => { const i = document.getElementById('search-q'); i.value = ''; window.__sn = document.querySelector('.sst').firstChild; document.querySelectorAll('.sres li').forEach((li) => { li.__stale = true; }); })()`);
  await p.typeText(q);
  await p.key('Enter');
  await p.waitForEval(`(() => { const st = document.querySelector('.sst'); return st.firstChild && st.firstChild !== window.__sn && ![...document.querySelectorAll('.sres li')].some((li) => li.__stale); })()`, { what: `the results for "${q}"`, timeout: 5000 });
  return results(p);
}

check('search-index', 'The index is /search/index.json with "v":1, no row for the unlisted or the two unpublished pages, no index.xml; they are not in any sitemap', async (c) => {
  const p = await c.open('base', '/search/');
  const r = await p.eval(`(async () => { const t = await (await fetch('/search/index.json')).text(); const x = await fetch('/search/index.xml'); const sm = await (await fetch('/sitemap.xml')).text(); return { t, xml: x.status, sitemap: /unrendered/i.test(sm) }; })()`);
  const j = JSON.parse(r.t);
  eq(j.v, 1, 'index version');
  assert(Array.isArray(j.d || j.rows || Object.values(j).find(Array.isArray)), 'the index has no rows');
  assert(!/Unlisted note|Unrendered|Link-only|quokkaneverrender|wombatlinkonly|zebrafish/i.test(r.t), 'the index has a row (or text) of an unlisted or unpublished page');
  eq(r.xml, 404, 'status of /search/index.xml');
  eq(r.sitemap, false, 'unrendered pages in the sitemap');
});

const QUERIES = [
  // [query, paths expected, a word that must be marked whole (or null)]
  ['gallery', ['/post/20260107-photo-gallery/', '/post/20260109-embed/', '/post/20260102-article-with-gallery/', '/post/20260104-smugmug-photos/'], 'gallery'],
  ['code', ['/post/20260105-dated-article/'], 'code'],
  ['cafe creme', ['/accents/'], 'Café'], ['Café Crème', ['/accents/'], 'Café'], ['naive resume', ['/accents/'], 'naïve'], ['MUNSTER', ['/accents/'], 'munster'], ['brulee', ['/accents/'], 'brulee'],
  ['की', ['/hindi/'], 'की'], ['किताब', ['/hindi/'], 'किताब'], ['ecole', ['/decomposed/'], 'école'],
  ['كتاب', ['/vocalized/'], 'كتاب'], ['كِتَابٌ', ['/vocalized/'], 'كِتَابٌ'],
  ['strasse', ['/accents/'], 'Straße'], ['lodz', ['/accents/'], 'Łódź'], ['kobenhavn', ['/accents/'], 'København'], ['oslo', ['/accents/'], 'Øslo'],
  ['dan', ['/accents/'], 'Đan'], ['đan', ['/accents/'], 'Đan'], ['aeroe', ['/accents/'], 'Ærøe'], ['coeur', ['/accents/'], 'cœur'],
  ['ΚΟΣ', ['/accents/'], 'ΚΟΣΜΟΣ'], ['κοσμος', ['/accents/'], 'ΚΟΣΜΟΣ'], ['ΚΟΣΜΟΣ', ['/accents/'], 'ΚΟΣΜΟΣ'],
  ['کتابها', ['/vocalized/'], 'کتاب‌ها'], ['کتاب‌ها', ['/vocalized/'], 'کتاب‌ها'],
  ['constructor', ['/accents/'], 'constructor'],
  ['smug', ['/post/20260104-smugmug-photos/', '/post/20260103-hero-image/'], null], ['galery', ['/post/20260107-photo-gallery/', '/post/20260109-embed/', '/post/20260102-article-with-gallery/', '/post/20260104-smugmug-photos/'], null],
];

check('search-queries', 'Queries fold case and accents, mark whole words (Hindi, Arabic, Greek, Latin letters with no decomposition), allow one typo and find nothing for unpublished words', async (c) => {
  const p = await c.open('base', '/search/', { viewport: [1280, 900] });
  const bad = [];
  for (const [q, paths, whole] of QUERIES) {
    const r = await search(p, q);
    const got = r.list.map((x) => x.path).sort();
    if (JSON.stringify(got) !== JSON.stringify([...paths].sort())) bad.push(`"${q}": found ${JSON.stringify(got)}`);
    else if (whole && !r.list.some((x) => x.marks.includes(whole))) bad.push(`"${q}": no whole "${whole}" in <mark> (${JSON.stringify(r.list.map((x) => x.marks))})`);
    else if (!r.list.every((x) => x.marks.length)) bad.push(`"${q}": a result has no <mark>`);
  }
  for (const q of ['zzzqx', 'zebrafish', 'quokkaneverrender', 'wombatlinkonly']) {
    const r = await search(p, q);
    if (r.list.length || r.status !== `No results for “${q}”.`) bad.push(`"${q}": expected no results, got ${r.status} / ${r.list.length}`);
  }
  // Hindi: "की" finds only the page that has it, not "कमल", "कोई" or "कुछ"; the snippet of "किताब" is centered on the word.
  const k = await search(p, 'किताब');
  const snip = await p.eval(`document.querySelector('.sres li .sn').textContent`);
  assert(snip.includes('किताब'), `the snippet for किताब does not hold the word: ${snip}`);
  assert(!bad.length, bad.join('; '));
});

check('search-url', '?q= runs on load, leaves focus on the page and keeps other parameters and the hash; /constructor/ on the 404 page searches that word', async (c) => {
  const p = await c.open('base', '/search/?q=Caf%C3%A9&x=1#top', { viewport: [1280, 900] });
  await p.waitForEval(`document.querySelectorAll('.sres li').length === 1`, { what: 'the results from ?q=' });
  eq(await p.eval(`document.getElementById('search-q').value`), 'Café', 'field');
  eq(await p.eval(`document.activeElement === document.body`), true, 'focus stays on the page');
  eq(await p.eval(`[location.search, location.hash]`), ['?q=Caf%C3%A9&x=1', '#top'], 'address');
  const k = await c.open('base', '/search/?q=constructor');
  await k.waitForEval(`document.querySelectorAll('.sres li').length === 1`, { what: 'the results for constructor' });
  const n = await c.open('base', '/constructor/');
  await n.waitForEval(`document.querySelectorAll('.sres li').length === 1`, { what: 'the 404 results for constructor' });
  eq((await results(n)).list.map((x) => x.path), ['/accents/'], '404 constructor');
});

check('search-nojs', 'With JavaScript off the search page says it is unavailable and shows no form; the empty status is in the accessibility tree', async (c) => {
  const p = await c.open('base', '/search/', { js: false });
  eq(await p.eval(`document.querySelector('.soff').textContent`), 'Search is not available yet.', 'message');
  eq(await p.eval(`getComputedStyle(document.querySelector('#search form')).display`), 'none', 'form display');
  const { nodes } = await p.send('Accessibility.getFullAXTree');
  assert(nodes.some((n) => !n.ignored && n.role?.value === 'status'), 'no role="status" node in the accessibility tree');
});

check('search-loading', 'A slow index shows "Loading the search index…" after 0.4 s and clears it; a 500 leaves the failure message', async (c) => {
  // The server answers the index late (1.5 s) or with a 500: the page is served normally.
  let mode = 'slow';
  const hooks = { before: (path) => {
    if (path !== '/search/index.json') return undefined;
    return mode === 'slow' ? { delay: 1500, type: 'application/json', body: readFileSync(resolve(c.out, 'base/search/index.json')) } : { status: 500, body: 'no' };
  } };
  const p = await c.open('base', '/search/', { hooks, key: 'slow-index', viewport: [1280, 900] });
  await p.click('#search-q'); // focus loads the index
  await p.waitForEval(`document.querySelector('.sst').textContent === 'Loading the search index…'`, { what: 'the loading message', timeout: 1400 });
  await p.waitForEval(`document.querySelector('.sst').textContent === ''`, { what: 'the loading message to clear once the index is in', timeout: 4000 });
  mode = 'broken';
  const q = await c.open('base', '/search/', { hooks, key: 'slow-index', viewport: [1280, 900] });
  await q.click('#search-q');
  await q.typeText('smug');
  await q.waitForEval(`document.querySelector('.sst').textContent === 'The search couldn’t be loaded. Try again later.'`, { what: 'the failure message', timeout: 5000 });
});

check('search-ui', 'Title matches are bolder than the result title; Tab goes field, button, first result; a long query reflows at 320px; the status is a role=status; Enter searches', async (c) => {
  const p = await c.open('base', '/search/', { viewport: [1280, 900] });
  await search(p, 'smug');
  const w = await p.eval(`(() => { const li = document.querySelector('.sres li'); const a = li.querySelector('a'); const m = a.querySelector('mark'); const sn = li.querySelector('.sn'); const sm = sn && sn.querySelector('mark'); return { link: getComputedStyle(a).fontWeight, mark: m && getComputedStyle(m).fontWeight, snip: sn && getComputedStyle(sn).fontWeight, snipMark: sm && getComputedStyle(sm).fontWeight }; })()`);
  eq([w.link, w.mark], ['700', '900'], 'weight of a title and its match');
  if (w.snipMark) eq([w.snip, w.snipMark], ['400', '700'], 'weight of a snippet and its match');
  eq(await p.eval(`document.querySelector('.sst').getAttribute('role')`), 'status', 'status role');
  // Tab: field, button, first result.
  await p.eval(`document.getElementById('search-q').focus()`);
  await p.key('Tab');
  eq(await p.eval(`document.activeElement.type + ':' + document.activeElement.tagName`), 'submit:BUTTON', 'second stop');
  await p.key('Tab');
  eq(await p.eval(`document.activeElement.closest('.sres li') === document.querySelector('.sres li')`), true, 'third stop is in the first result');
  // Enter runs the search without leaving the page.
  await p.eval(`window.__same = true; const i = document.getElementById('search-q'); i.focus(); i.value = ''`);
  await p.typeText('galery');
  await p.key('Enter');
  await p.waitForEval(`document.querySelector('.sst').textContent === '4 results'`, { what: 'the count after Enter' });
  eq(await p.eval(`window.__same`), true, 'the page stayed');
  const narrow = await c.open('base', '/search/', { viewport: [320, 700] });
  await narrow.click('#search-q');
  await narrow.typeText('averyveryveryverylongquerythatdoesnotmatchanythingatallbutkeepsgoing '.repeat(3));
  await narrow.waitForEval(`document.querySelector('.sst').textContent !== ''`, { what: 'the status for a long query' });
  const [sw, cw] = await overflow(narrow);
  assert(sw <= cw, `a long query scrolls sideways at 320px (${sw} > ${cw})`);
});

check('search-mark-contrast', 'The search mark is 8:1 or better in light and dark (system and picked), and uses Mark and MarkText with forced colors', async (c) => {
  const lum = (rgb) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const colors = (p) => p.eval(`(() => { const m = document.querySelector('.sres mark'); const cs = getComputedStyle(m); const parse = (s) => (s.match(/[\\d.]+/g) || []).slice(0, 3).map(Number); return [parse(cs.color), parse(cs.backgroundColor)]; })()`);
  const bad = [];
  for (const [label, scheme, theme] of [['light', 'light'], ['dark system', 'dark'], ['dark picked', 'light', 'dark'], ['light picked', 'dark', 'light']]) {
    const p = await c.open('base', '/search/?q=gallery', { viewport: [1280, 900], media: { 'prefers-color-scheme': scheme } });
    await p.waitForEval(`document.querySelector('.sres mark')`, { what: 'a mark' });
    if (theme) await p.eval(`document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)})`);
    const [fg, bg] = await colors(p);
    const r = ratio(fg, bg);
    if (r < 8) bad.push(`${label}: ${r.toFixed(2)}:1 (${fg} on ${bg})`);
    await p.close();
  }
  const f = await c.open('base', '/search/?q=gallery', { viewport: [1280, 900], media: { 'forced-colors': 'active' } });
  await f.waitForEval(`document.querySelector('.sres mark')`, { what: 'a mark' });
  const forced = await f.eval(`(() => { const m = getComputedStyle(document.querySelector('.sres mark')); const probe = document.createElement('span'); probe.style.cssText = 'color: MarkText; background-color: Mark'; document.body.appendChild(probe); const p = getComputedStyle(probe); return [m.color === p.color, m.backgroundColor === p.backgroundColor]; })()`);
  if (!forced[0] || !forced[1]) bad.push(`forced colors: mark is not Mark/MarkText (${forced})`);
  assert(!bad.length, bad.join('; '));
});

check('search-404', 'The 404 page searches the missing address: matches replace the latest posts, escapes are decoded safely, nothing of the address becomes markup', async (c) => {
  const state = (p) => p.eval(`({ field: document.getElementById('search-q').value, status: document.querySelector('.sst').textContent, titles: [...document.querySelectorAll('.sres li a')].map((a) => a.textContent), paths: [...document.querySelectorAll('.sres li a')].map((a) => new URL(a.href).pathname), latest: !document.getElementById('latest').hidden, focus: document.activeElement === document.body, listed: !document.querySelector('.sres').hidden })`);
  const open = async (path) => {
    const p = await c.open('base', path, { viewport: [1280, 900] });
    await p.waitForEval(`!document.querySelector('#search form').hidden`, { what: `the search form on ${path}` });
    await sleep(150);
    return p;
  };
  let p = await open('/post/20260104-smug/');
  await p.waitForEval(`document.querySelectorAll('.sres li').length > 0`, { what: 'the results for smug' });
  let s = await state(p);
  eq([s.field, s.status, s.latest, s.focus], ['smug', '2 results', false, true], '/post/20260104-smug/');
  eq([...s.titles].sort(), ['An article with a SmugMug hero', 'SmugMug photos with sizes'], 'titles');
  assert(await p.eval(`!!document.querySelector('.sres mark')`), 'no <mark> in the results');
  await p.click('#search-q');
  await p.key('Enter');
  await p.waitForEval(`location.pathname === '/search/' && location.search === '?q=smug'`, { what: 'Enter to go to /search/?q=smug' });
  p = await open('/post/2026/gallry-photos/');
  await p.waitForEval(`document.querySelectorAll('.sres li').length > 0`, { what: 'the results for the typo' });
  assert((await state(p)).paths.includes('/post/20260107-photo-gallery/'), 'one typo (gallry) did not find the gallery posts');
  p = await open('/accnts/');
  await p.waitForEval(`document.querySelectorAll('.sres li').length > 0`, { what: 'the results for accnts' });
  assert((await state(p)).paths.includes('/accents/'), '/accnts/ did not find the accents page');
  for (const path of ['/2017/05/', '/zzzqxv/', '/2017/05/awx-on-centos/']) {
    p = await open(path);
    s = await state(p);
    eq([s.field, s.listed, s.latest], ['', false, true], path);
    eq(await p.eval(`document.querySelectorAll('#latest li').length`), 5, `${path}: latest posts`);
  }
  for (const path of ['/caf%C3%A9%/', '/post/caf%C3%A9-%E0%A4%A/']) {
    p = await open(path);
    await p.waitForEval(`document.querySelectorAll('.sres li').length > 0`, { what: `results for ${path}` });
    s = await state(p);
    assert(s.field.split(' ').includes('cafe') && s.paths.includes('/accents/'), `${path}: field "${s.field}", ${s.paths}`);
    assert(!s.field.split(' ').some((w) => ['c3', 'a9', 'e0', 'a4'].includes(w)), `${path}: stray byte words in "${s.field}"`);
  }
  for (const path of ['/%3Cimg%20src=x%20onerror=alert(1)%3E/', '/%E0%A4%A/']) {
    const q = await c.open('base', path, { load: false });
    let dialogs = 0;
    q.on('Page.javascriptDialogOpening', () => { dialogs++; });
    await q.goto(q.base + path);
    await sleep(500);
    eq(dialogs, 0, `${path}: dialogs`);
    eq(await q.eval(`document.querySelectorAll('img[src=x], [onerror]').length`), 0, `${path}: markup from the address`);
    const errs = [...q.errors, ...q.console.filter((m) => m.type === 'error' && !/Failed to load resource.*404|the server responded with a status of 404/.test(m.text))];
    assert(!errs.length, `${path}: console errors ${JSON.stringify(errs)}`);
  }
});

check('search-404-nojs', 'With JavaScript off the 404 page is the hero, the home link and the latest five posts, with no field', async (c) => {
  const p = await c.open('base', '/post/20260104-smug/', { js: false, viewport: [1280, 900] });
  eq(await p.eval(`getComputedStyle(document.querySelector('#search form')).display`), 'none', 'form');
  eq(await p.eval(`document.querySelectorAll('#latest li').length`), 5, 'latest posts');
  eq(await p.eval(`!!document.querySelector('a[href="/"]') && !document.querySelector('.sres li')`), true, 'home link and no results');
});

// ---------------------------------------------------------------------------------------------------------------------
// Hero sizes

check('hero-sizes', 'The home hero\'s photo size follows the screen (X2 up to 427px at 3x, X3 from 428px or at 4x), and the photo-post hero is 416px high (422.7px at 320px)', async (c) => {
  const p = await c.open('base', '/', { js: false });
  const size = () => p.eval(`getComputedStyle(document.querySelector('header.hero')).backgroundImage.match(/\\/(M|L|XL|X2|X3|X4|X5)\\//)[1]`);
  const bad = [];
  for (const [w, dpr, want] of [[390, 3, 'X2'], [412, 3, 'X2'], [427, 3, 'X2'], [428, 3, 'X3'], [430, 3, 'X3'], [390, 4, 'X3'], [390, 2, 'X2'], [390, 1, 'M'], [800, 1, 'L'], [1280, 1, 'X2']]) {
    await p.setViewport(w, 900, { dpr, mobile: w < 500 });
    await p.goto(p.base + '/'); // the size is chosen by media queries when the page loads
    const got = await size();
    if (got !== want) bad.push(`${w}px at ${dpr}x: expected ${want}, got ${got}`);
  }
  await p.setViewport(1280, 900);
  const h = await p.eval(`document.querySelector('header.hero').getBoundingClientRect().height`);
  if (Math.abs(h - 245.64) > 0.1) bad.push(`home hero at 1280px is ${h}px high, expected 245.64`);
  assert(!bad.length, bad.join('; '));
  const q = await c.open('base', '/post/20260110-deep-headings/', { js: false });
  for (const [w, want] of [[320, 422.7], [390, 416], [1280, 416]]) {
    await q.setViewport(w, 900);
    const got = await q.eval(`document.querySelector('.phero').getBoundingClientRect().height`);
    if (Math.abs(got - want) > 0.1) bad.push(`.phero at ${w}px is ${got}px high, expected ${want}`);
  }
  assert(!bad.length, bad.join('; '));
});

// ---------------------------------------------------------------------------------------------------------------------
// The rotating hero's size changes, finished rotation and slow photos (#396)

// The pool of the base build in its page order (a shuffle with a random of .999 swaps nothing), so the rotation starts on the build's
// photo and the other, i-8Nr9Vp5, is the next one.
const NO_SHUFFLE = `Math.random = () => 0.999;`;
const OTHER_PHOTO = 'i-8Nr9Vp5';

check('hero-relayout', 'A hero that becomes vertically cropped after the photo loaded (320px, then 1280px) gets its pan', async (c) => {
  const p = await c.open('base', '/', { viewport: [320, 800] });
  const s0 = await waitFor(async () => settledLayer(await layerState(p)), { timeout: 15000, interval: 25, what: 'the first photo to show at 320px' });
  eq(s0.anims, 0, 'animations at 320px (the photo is not cropped vertically)');
  await p.setViewport(1280, 800);
  const s1 = await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.anims === 1 && s.state === 'running' && s; }, { timeout: 4000, interval: 25, what: 'the pan to be made once the hero is cropped (1280px)' });
  assert(s1.crop > 100, `the photo is cropped by only ${s1.crop}px at 1280px`);
  eq(s1.dur, 30000, 'the new pan\'s duration');
});

check('hero-relayout-fade', 'A resize while a photo fades in is applied to the incoming photo when the fade ends: it is sized for the new hero, and its pan runs', async (c) => {
  const q = await c.open('base', '/', { viewport: [1280, 800] });
  await waitFor(async () => (await layerState(q)).some((l) => l.shown && l.opacity > 0 && l.opacity < 1), { timeout: 15000, interval: 5, what: 'the first fade to run' });
  await q.setViewport(685, 800);
  const s2 = await waitFor(async () => { const s = settledLayer(await layerState(q)); return s && s.state === 'running' && s; }, { timeout: 5000, interval: 25, what: 'the photo to settle and its pan to start after the fade' });
  const fit = await q.eval(`(() => { const hb = document.querySelector('header[data-pool]').getBoundingClientRect(), hp = [...document.querySelectorAll('header[data-pool] .hr')].find((l) => !l.hidden).firstElementChild; return { high: hp.getBoundingClientRect().height, want: 800 * Math.max(hb.width / 1200, hb.height / 800), box: [hb.width, hb.height] }; })()`);
  assert(Math.abs(fit.high - fit.want) <= 1.5, `after a resize during the fade the photo is ${fit.high}px high in a ${fit.box} hero, not the ${fit.want}px that fits`);
  eq(s2.state, 'running', 'the pan after the fade');
  assert(s2.crop > 100 && Math.abs(s2.crop - (fit.want - fit.box[1])) <= 1.5, `the photo's crop is ${s2.crop}px, not ${fit.want - fit.box[1]}px`);
});

check('hero-pan-finished', 'When the rotation ends because a photo fails, a resize, a hidden and visible tab and the reduced-motion setting leave the pan paused (the button is gone)', async (c) => {
  const fail = (url) => (url.includes(OTHER_PHOTO) ? { fulfill: { status: 404, body: '' } } : { fulfill: { body: PHOTO } });
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800], init: NO_SHUFFLE, photos: fail });
  await p.waitForEval(`document.querySelector('.hpp') && document.querySelector('.hpp').hidden`, { timeout: 15000, what: 'the button to go when the second photo fails' });
  const held = await waitFor(async () => { const s = settledLayer(await layerState(p)); return s && s.anims === 1 && s.state === 'paused' && s; }, { timeout: 3000, what: 'the pan to be paused after the rotation ended' });
  const stays = async (what, act) => {
    await act();
    const end = Date.now() + 700;
    while (Date.now() < end) {
      const s = settledLayer(await layerState(p));
      assert(s && s.state === 'paused', `${what}: the pan is ${s ? s.state : 'not settled'} after the rotation ended`);
      await sleep(50);
    }
  };
  await stays('a resize', () => p.setViewport(1100, 800));
  await stays('a hidden tab', () => p.eval(`Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); true`));
  await stays('a visible tab', () => p.eval(`Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); true`));
  await stays('reduced motion switched off and on', async () => { await p.setMedia({ 'prefers-reduced-motion': 'reduce' }); await p.setMedia({ 'prefers-reduced-motion': 'no-preference' }); });
  assert(held.t >= 0, 'no pan time');
});

check('hero-load-limit', 'A photo that neither loads nor fails is treated as failed after about 10 s: the rotation ends and the button goes', async (c) => {
  const hang = (url) => (url.includes(OTHER_PHOTO) ? { wait: new Promise(() => {}) } : { fulfill: { body: PHOTO } });
  const p = await c.open('base', '/', { scale: true, viewport: [1280, 800], init: NO_SHUFFLE, photos: hang });
  await waitFor(() => p.requests.some((r) => r.url.includes(OTHER_PHOTO)), { timeout: 8000, interval: 25, what: 'the request for the second photo' });
  const t0 = Date.now();
  await sleep(6000);
  eq(await p.eval(`document.querySelector('.hpp').hidden`), false, 'the button after 6 s of waiting');
  await waitFor(() => p.eval(`document.querySelector('.hpp').hidden`), { timeout: 9000, interval: 100, what: 'the hanging photo to count as failed' });
  const took = Date.now() - t0;
  assert(took >= 9000 && took <= 12500, `the hanging photo was given up after ${took} ms, not about 10000`);
});

// ---------------------------------------------------------------------------------------------------------------------
// Review notes of release 1.9.0 (#396): names, the empty search, long titles, tables and forced colors

check('a11y-heading-names', 'The home h1 is "Testing the blues." with no space before the period; the 404 h1 holds "404 Page not found"; a tag link in the index is named by its visible "#name N posts" with no aria-label', async (c) => {
  const home = await c.open('base', '/', { viewport: [1280, 800] });
  eq(await names(home, 'heading').then((n) => n.filter((x) => /Testing/.test(x))), ['Testing the blues.'], 'home heading');
  const nf = await c.open('base', '/no-such-page/', { viewport: [1280, 800] });
  eq((await names(nf, 'heading')).filter((x) => /404/.test(x)), ['404 Page not found'], '404 heading');
  // The visible line under the heading is aria-hidden, so the text is in the accessibility tree once (the heading's), also in another language (#403).
  for (const [build, path, text] of [['base', '/no-such-page/', 'Page not found'], ['multilingual', '/no-such-page/', 'Seite nicht gefunden']]) {
    const q = build === 'base' ? nf : await c.open(build, path, { viewport: [1280, 800] });
    eq(await q.eval(`[document.querySelector('.hero .sub').getAttribute('aria-hidden'), document.querySelector('.hero .sub').textContent]`), ['true', text], `${build}: the 404 line under the heading`);
    const said = await q.axNodes((n) => n.name.includes(text) && n.role !== 'RootWebArea' && n.role !== 'InlineTextBox');
    eq(said.map((n) => n.role).sort(), ['StaticText', 'heading'], `${build}: nodes of the accessibility tree that hold "${text}"`);
  }
  eq(await nf.eval(`getComputedStyle(document.querySelector('h1')).fontSize === getComputedStyle(document.querySelector('.hero h1')).fontSize && document.querySelector('h1 .vh').textContent`), ' Page not found', 'the hidden part of the 404 heading');
  const idx = await c.open('base', '/tags/', { viewport: [1280, 800] });
  const link = (await idx.axNodes((n) => n.role === 'link' && /^#Fixtures\b/.test(n.name)))[0];
  assert(link && /^#Fixtures \d+ posts?$/.test(link.name), `the name of the tag link is ${JSON.stringify(link && link.name)}, not "#Fixtures N posts"`);
  eq(await idx.eval(`document.querySelectorAll('.atl a[aria-label]').length`), 0, 'links with an aria-label in the tag index');
});

check('search-empty', 'Enter in an empty search field says "Enter a search term." in the status line; emptying the field says nothing', async (c) => {
  const p = await c.open('base', '/search/', { viewport: [1280, 900] });
  await p.eval(`document.getElementById('search-q').focus()`);
  await p.key('Enter');
  await p.waitForEval(`document.querySelector('.sst').textContent === 'Enter a search term.'`, { timeout: 3000, what: 'the empty-search message' });
  eq(await p.eval(`document.querySelector('.sst').getAttribute('role')`), 'status', 'the message is in the status line');
  await p.typeText('galery');
  await p.key('Enter');
  await p.waitForEval(`document.querySelector('.sst').textContent === '4 results'`, { what: 'the count' });
  await p.eval(`const i = document.getElementById('search-q'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true }))`);
  await sleep(1000); // typing is followed by a 700 ms wait before the status speaks
  eq(await p.eval(`document.querySelector('.sst').textContent`), '', 'the status after emptying the field');
});

check('layout-long-title', 'A site title that is one 47-character word wraps in the nav, kicker and footer: the Menu button stays inside the window at 320px and nothing is wider than its box', async (c) => {
  const p = await c.open('long-title', '/', { viewport: [320, 800], photos: 'ok' });
  const m = await p.eval(`(() => { const w = document.documentElement.clientWidth, r = (s) => document.querySelector(s).getBoundingClientRect(), over = (s) => { const e = document.querySelector(s); return e.scrollWidth - e.clientWidth; };
    return { w, menuRight: r('nav.site .menu').right, menuLeft: r('nav.site .menu').left, brand: r('nav.site .brand').right, kicker: over('.hero .k'), footer: over('footer.site p'), brandOver: over('nav.site .brand') }; })()`);
  assert(m.menuLeft >= 0 && m.menuRight <= m.w, `the Menu button is at ${m.menuLeft} to ${m.menuRight} in a ${m.w}px window`);
  assert(m.brand <= m.menuLeft, `the brand ends at ${m.brand}, over the Menu button at ${m.menuLeft}`);
  eq([m.kicker, m.footer, m.brandOver], [0, 0, 0], 'overflow of the kicker, footer line and brand');
  await p.click('nav.site .menu');
  await p.waitForEval(`document.querySelector('nav.site .links.open')`, { what: 'the menu to open' });
  const wide = await c.open('long-title', '/', { viewport: [1280, 800], photos: 'ok' });
  assert(await wide.eval(`document.querySelector('nav.site .brand').getBoundingClientRect().height < 80`), 'the brand wraps at 1280px');
});

check('layout-long-names', 'A tag, category, series name, series item and description word of 70 unbroken characters wrap at 320px: nothing reaches past the window, no text is clipped (the hero description included) and the series item keeps its date (#410)', async (c) => {
  const clipped = (p) => p.eval(`(() => { const w = document.documentElement.clientWidth, bad = [];
    for (const e of document.querySelectorAll('body *')) { if (e.closest('.skip, [hidden], .vh, nav.site .links:not(.open)')) continue; const r = e.getBoundingClientRect(); if (r.width && (r.right > w + 0.5 || r.left < -0.5)) bad.push(e.tagName + '.' + e.className + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); }
    for (const e of document.querySelectorAll('body *')) if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth && !e.closest('.vh, .skip, pre, .tw, [hidden]')) bad.push('clipped ' + e.tagName + '.' + e.className + ' ' + e.scrollWidth + '/' + e.clientWidth);
    return { w, bad, scroll: document.documentElement.scrollWidth }; })()`);
  const post = await c.open('long-title', '/post/20260116-long-1/', { viewport: [320, 800], photos: 'ok' });
  const a = await clipped(post);
  eq([a.bad, a.scroll <= a.w], [[], true], 'post page: elements past the window or with clipped text');
  const s = await post.eval(`(() => { const li = document.querySelector('.series li:not(:has(strong))'), d = li.querySelector('.meta').getBoundingClientRect(), l = li.querySelector('a').getBoundingClientRect(); return { dateIn: d.left >= 0 && d.right <= document.documentElement.clientWidth && d.width > 0, linkEndsBeforeDate: l.right <= d.left + 0.5, over: [...document.querySelectorAll('.tag, .series .t, .phero .meta a')].filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.className) }; })()`);
  eq(s, { dateIn: true, linkEndsBeforeDate: true, over: [] }, 'series item date and clipped text');
  for (const path of ['/', '/tags/tagunbrokenwordwithnobreakopportunityatallsoitmustwrapatthreetwentypx/']) {
    const h = await c.open('long-title', path, { viewport: [320, 800], photos: 'ok' });
    const r = await clipped(h);
    eq([path, r.bad, r.scroll <= r.w], [path, [], true], `${path}: elements past the window`);
    eq(await h.eval(`[...document.querySelectorAll('.tile.article p')].filter((e) => e.scrollWidth > e.clientWidth + 1).length`), 0, `${path}: clipped tile descriptions`);
  }
});

check('tables-scroll', 'A Markdown table is in a focusable, labeled region that scrolls sideways (the table does not scroll itself); Tab reaches it with a visible ring and an arrow key scrolls it', async (c) => {
  for (const path of ['/about/', '/q&a/']) {
    const p = await c.open('base', path, { viewport: [320, 800] });
    const t = await p.eval(`(() => { const w = document.querySelectorAll('.tw'), r = w[0]; return { n: w.length, role: r.getAttribute('role'), tab: r.getAttribute('tabindex'), label: r.getAttribute('aria-label'), wide: r.scrollWidth > r.clientWidth, over: getComputedStyle(r).overflowX, own: getComputedStyle(r.firstElementChild).overflowX, tag: r.firstElementChild.tagName, th: r.querySelectorAll('th').length, align: r.querySelector('th').style.textAlign }; })()`);
    eq([t.n, t.role, t.tab, t.label, t.wide, t.over, t.own, t.tag], [path === '/about/' ? 2 : 1, 'region', '0', 'Table', true, 'auto', 'visible', 'TABLE'], `${path} table region`);
    eq([t.th, t.align], [8, 'center'], `${path} header cells and the first one's alignment`);
    assert((await names(p, 'region')).includes('Table'), `${path}: the accessibility tree has no region named "Table"`);
    await tabTo(p, '.tw');
    const f = await p.eval(`(() => { const s = getComputedStyle(document.activeElement); return [s.outlineStyle, s.outlineWidth, document.activeElement.matches(':focus-visible')]; })()`);
    eq(f, ['solid', '3px', true], `${path} focus ring`);
    const before = await p.eval(`document.activeElement.scrollLeft`);
    await p.key('ArrowRight');
    await waitFor(() => p.eval(`document.activeElement.scrollLeft`).then((v) => v > before), { timeout: 2000, what: `${path}: an arrow key to scroll the table` });
  }
});

check('tables-tabstop', 'A Markdown table\'s region is a Tab stop only while its table scrolls: not at 1280px for a table that fits, yes at 320px (a real Tab reaches it), and it follows a resize both ways; without script every region keeps its tabindex', async (c) => {
  const state = (p) => p.eval(`[...document.querySelectorAll('.tw')].map((r) => [r.getAttribute('tabindex'), r.scrollWidth > r.clientWidth, r.getAttribute('role'), r.getAttribute('aria-label')])`);
  // The About page holds a wide table (first) and a medium one (second) whose columns fit at 1280px and not at 320px.
  const p = await c.open('base', '/about/', { viewport: [1280, 900] });
  await p.waitForEval(`!document.querySelectorAll('.tw')[1].hasAttribute('tabindex')`, { timeout: 3000, what: 'the script to take the tabindex off the table that fits' });
  eq(await state(p), [['0', true, 'region', 'Table'], [null, false, null, null]], 'regions at 1280px: the wide one keeps its Tab stop, role and name, the medium one has none of the three (#410)');
  eq((await names(p, 'region')).filter((n) => n === 'Table').length, 1, 'regions named "Table" in the accessibility tree at 1280px');
  const stops = [];
  for (let i = 0; i < 60; i++) { await p.key('Tab'); const t = await p.eval(`document.activeElement.matches('.tw') ? [...document.querySelectorAll('.tw')].indexOf(document.activeElement) : -1`); if (t >= 0 && !stops.includes(t)) stops.push(t); }
  eq(stops, [0], 'regions Tab stops through the page at 1280px');
  await p.setViewport(320, 800);
  await p.waitForEval(`document.querySelectorAll('.tw')[1].getAttribute('tabindex') === '0'`, { timeout: 3000, what: 'the Tab stop to come back when the window narrows' });
  eq(await state(p), [['0', true, 'region', 'Table'], ['0', true, 'region', 'Table']], 'regions at 320px: all three are back');
  eq((await names(p, 'region')).filter((n) => n === 'Table').length, 2, 'regions named "Table" in the accessibility tree at 320px');
  await p.eval(`document.activeElement.blur(); window.scrollTo(0, 0)`);
  await p.eval(`document.body.focus()`);
  const seen = [];
  for (let i = 0; i < 60; i++) { await p.key('Tab'); const t = await p.eval(`document.activeElement.matches('.tw') ? [...document.querySelectorAll('.tw')].indexOf(document.activeElement) : -1`); if (t >= 0 && !seen.includes(t)) seen.push(t); }
  eq(seen, [0, 1], 'regions a real Tab reaches at 320px');
  await p.setViewport(1280, 900);
  await p.waitForEval(`!document.querySelectorAll('.tw')[1].hasAttribute('tabindex')`, { timeout: 3000, what: 'the Tab stop to go when the window widens' });
  eq(await state(p), [['0', true, 'region', 'Table'], [null, false, null, null]], 'regions after widening again');
  // A focused region keeps its stop when it stops overflowing, so focus is not dropped.
  await p.setViewport(320, 800);
  await p.waitForEval(`document.querySelectorAll('.tw')[1].getAttribute('tabindex') === '0'`, { timeout: 3000, what: 'the Tab stop again' });
  await p.eval(`document.querySelectorAll('.tw')[1].focus()`);
  await p.setViewport(1280, 900);
  await sleep(500);
  eq(await p.eval(`[document.activeElement === document.querySelectorAll('.tw')[1], document.querySelectorAll('.tw')[1].getAttribute('tabindex')]`), [true, '0'], 'the focused region keeps its tabindex');
  eq(await p.eval(`[document.querySelectorAll('.tw')[1].getAttribute('role'), document.querySelectorAll('.tw')[1].getAttribute('aria-label')]`), ['region', 'Table'], 'the focused region keeps its role and name');
  // Without JavaScript the markup stays as it was: every region is a Tab stop.
  const n = await c.open('base', '/about/', { js: false, viewport: [1280, 900] });
  eq(await state(n), [['0', true, 'region', 'Table'], ['0', false, 'region', 'Table']], 'regions without JavaScript at 1280px');
  // A page with no table loads no table script.
  const h = await c.open('base', '/', { viewport: [1280, 800] });
  eq(await h.eval(`[...document.scripts].filter((x) => /tables/.test(x.src)).length`), 0, 'table scripts on the home page');
});

check('tables-attributes', 'With Markdown attributes on tables, {.fancy #prices} become a class and an id as before, and a value with a quote stays whole in one title attribute: no onmouseover attribute, no handler (#409)', async (c) => {
  const p = await c.open('table-attributes', '/post/20260115-table-attributes/', { viewport: [1280, 800] });
  const t = await p.eval(`[...document.querySelectorAll('.tw > table')].map((t) => Object.fromEntries([...t.attributes].map((a) => [a.name, a.value])))`);
  eq(t, [{ class: 'fancy', id: 'prices' }, { class: 'crafted', title: 'x" onmouseover=alert(1) y="' }, {}], 'attributes of the three tables');
});

check('hero-pool-lang', 'In a two-language site the pager pages of the two home pages (both at "/") load different pool files, each setting its own key', async (c) => {
  const key = async (build, path) => {
    const p = await c.open(build, path, { viewport: [1280, 800] });
    return p.eval(`(() => { const h = document.querySelector('header[data-pool-key]'), s = [...document.scripts].filter((x) => /\\/hero\\/pool-/.test(x.src)); return h && { key: h.getAttribute('data-pool-key'), files: s.map((x) => new URL(x.src).pathname), pool: Object.keys((window.theblues || {}).pool || {}) }; })()`);
  };
  const de = await key('multilingual', '/page/2/'), en = await key('multilingual', '/en/page/2/');
  assert(de && en, `a pager page has no data-pool-key (German: ${JSON.stringify(de)}, English: ${JSON.stringify(en)})`);
  assert(de.key !== en.key, `both languages' pager pages have the key ${de.key}`);
  eq([de.files.length, en.files.length], [1, 1], 'pool files per page');
  assert(de.files[0] !== en.files[0] && de.files[0].includes(de.key) && en.files[0].includes(en.key), `the pool files are ${de.files[0]} and ${en.files[0]}`);
  eq([de.pool, en.pool], [[de.key], [en.key]], 'the keys each page\'s file sets');
});

// Light photos, so that a scrim which is missing shows as a bright hero.
const LIGHT = png(1200, 800, [235, 235, 235]);
/** The [r, g, b] of one pixel of a PNG screenshot (8-bit RGB or RGBA, not interlaced), decoded with Node's zlib only. */
function pixel(buf, px, py) {
  const idat = []; let w = 0, h = 0, ct = 0, o = 8;
  while (o < buf.length) {
    const len = buf.readUInt32BE(o), type = buf.toString('latin1', o + 4, o + 8), d = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; }
    if (type === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3, raw = inflateSync(Buffer.concat(idat)), stride = w * bpp, rows = [];
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0, b = prev[i], cc = i >= bpp ? prev[i - bpp] : 0;
      const pa = Math.abs(b - cc), pb = Math.abs(a - cc), pc = Math.abs(a + b - 2 * cc);
      line[i] = (line[i] + (f === 1 ? a : f === 2 ? b : f === 3 ? (a + b) >> 1 : f === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : cc) : 0)) & 255;
    }
    rows.push(line); prev = line;
  }
  return [rows[py][px * bpp], rows[py][px * bpp + 1], rows[py][px * bpp + 2]];
}
const shotPixel = async (p, x, y) => pixel(Buffer.from((await p.send('Page.captureScreenshot', { format: 'png' })).data, 'base64'), x, y);
const bright = (rgb) => 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];

check('forced-colors-scrim', 'With forced colors the scrim over a light photo is still there: the rotating home hero, the term hero\'s ramp and a post hero are dark where the text is', async (c) => {
  const open = (path, w = 1100) => c.open('base', path, { viewport: [w, 700], media: { 'forced-colors': 'active' }, photos: () => ({ fulfill: { body: LIGHT } }) });
  const home = await open('/');
  await waitFor(async () => settledLayer(await layerState(home)), { timeout: 15000, interval: 25, what: 'the first photo to show' });
  await home.eval(`document.querySelectorAll('.hpp').forEach((b) => { b.hidden = true; })`);
  const h = bright(await shotPixel(home, 900, 150));
  assert(h < 110, `the rotating home hero is ${Math.round(h)} bright over a light photo (the scrim is 85% navy)`);
  const term = await open('/tags/fixtures/');
  await waitFor(async () => settledLayer(await layerState(term)), { timeout: 15000, interval: 25, what: 'the term hero\'s photo to show' });
  const bottom = await term.eval(`Math.round(document.querySelector('.phero').getBoundingClientRect().bottom) - 20`);
  const t = bright(await shotPixel(term, 900, bottom));
  assert(t < 110, `the term hero is ${Math.round(t)} bright at its bottom edge, under the ramp over a light photo`);
  const post = await open('/post/20260104-smugmug-photos/');
  const s = bright(await shotPixel(post, 900, 90));
  assert(s < 190, `the post hero is ${Math.round(s)} bright at its top: the static hero lost its scrim`);
  assert((await names(post, 'heading')).includes('SmugMug photos with sizes'), 'the post heading is not in the accessibility tree');
  eq(await term.eval(`[getComputedStyle(document.querySelector('.hr'), '::after').forcedColorAdjust, getComputedStyle(document.querySelector('.phero .in'), '::before').forcedColorAdjust, getComputedStyle(document.querySelector('.phero .in')).forcedColorAdjust]`), ['none', 'none', 'auto'], 'forced-color-adjust of the scrims and of the hero text');
});

check('analytics-query', 'With analytics on, the search query is not sent to Google Analytics: a direct load of /search/?q= and a result page reached from a search send no q in page_location or page_referrer (the gtag() arguments; gtag.js itself is a stand-in)', async (c) => {
  // Nothing reaches Google: gtag.js is answered with an empty script, and every call the theme makes is read from dataLayer.
  const stub = (url) => (new URL(url).hostname === 'www.googletagmanager.com' ? { fulfill: { body: '', type: 'text/javascript' } } : undefined);
  const rule = (u, r, t) => stub(u) || photos()(u, r, t);
  const calls = (p) => p.eval(`dataLayer.map((a) => Array.from(a))`);
  const sent = (cs) => cs.filter((a) => a[0] === 'config' || a[0] === 'set').map((a) => a[a.length - 1]);
  const direct = await c.open('analytics', '/search/?q=gallery', { viewport: [1280, 900], photos: rule });
  const dc = await calls(direct);
  assert(dc.some((a) => a[0] === 'config' && a[1] === 'G-TEST000000'), `no config call: ${JSON.stringify(dc)}`);
  eq(sent(dc).map((o) => o.page_location), [direct.base + '/search/', direct.base + '/search/'], 'page_location of a direct load');
  assert(!/q=|gallery/.test(JSON.stringify(dc)), `the query is in a gtag() call: ${JSON.stringify(dc)}`);
  // A search, then a click on a result: the next page's referrer is /search/?q=..., sent without the q.
  const s = await c.open('analytics', '/search/', { viewport: [1280, 900], photos: rule });
  await s.eval(`document.getElementById('search-q').focus()`);
  await s.typeText('gallery');
  await s.key('Enter');
  await s.waitForEval(`/^\\d+ results?$/.test(document.querySelector('.sst').textContent) && location.search === '?q=gallery'`, { what: 'the results, with ?q= in the address' });
  assert(!/q=gallery/.test(JSON.stringify(await calls(s))), 'the query is in a gtag() call on the search page');
  await s.eval(`document.querySelector('.sres li a').click()`);
  await s.waitForEval(`location.pathname !== '/search/' && window.dataLayer && dataLayer.length > 1`, { what: 'the result page' });
  assert(await s.eval(`document.referrer.includes('q=gallery')`), 'the check needs a referrer with the query');
  const rc = await calls(s);
  eq(sent(rc).map((o) => o.page_referrer), [s.base + '/search/', s.base + '/search/'], 'page_referrer of the result page');
  assert(!/q=gallery/.test(JSON.stringify(rc)), `the query is in a gtag() call: ${JSON.stringify(rc)}`);
  // A referrer from another site is passed as it is.
  const o = await c.open('analytics', '/post/20260106-untitled/', { photos: rule, init: `Object.defineProperty(document, 'referrer', { get: () => 'https://other.example/find?q=x&y=1' });` });
  eq(sent(await calls(o)).map((x) => x.page_referrer), ['https://other.example/find?q=x&y=1', 'https://other.example/find?q=x&y=1'], 'another site\'s referrer');
});

check('tag-target', 'A tag link in a post hero is at least 24px tall with a fine pointer (light and dark, 1280px and 320px), its text centered on one line with no sideways scroll, and 44px with a coarse pointer', async (c) => {
  for (const [label, vp, scheme] of [['1280 light', [1280, 800], 'light'], ['1280 dark', [1280, 800], 'dark'], ['320 light', [320, 700], 'light'], ['320 dark', [320, 700], 'dark']]) {
    const p = await c.open('base', '/post/20260106-untitled/', { viewport: vp, media: { 'prefers-color-scheme': scheme } });
    const m = await p.eval(`[...document.querySelectorAll('.phero .tag')].map((a) => { const r = a.getBoundingClientRect(), g = document.createRange(); g.selectNodeContents(a); const t = g.getBoundingClientRect(); return { h: r.height, w: r.width, lines: g.getClientRects().length, off: Math.abs((t.top + t.bottom) / 2 - (r.top + r.bottom) / 2), over: r.right > document.documentElement.clientWidth }; })`);
    assert(m.length > 0, `${label}: no tag link in the hero`);
    assert(await p.eval(`matchMedia('(pointer: fine)').matches`), `${label}: the pointer is not fine`);
    for (const t of m) assert(t.h >= 24 && t.lines === 1 && t.off <= 1.5 && !t.over, `${label}: tag ${JSON.stringify(t)}`);
    eq(await p.eval(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true, `${label}: no sideways scroll`);
  }
  const t = await c.open('base', '/post/20260106-untitled/', { viewport: [390, 800, { dpr: 2, mobile: true }] });
  await t.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 }); // a touch screen: pointer: coarse
  await t.frame();
  assert(await t.eval(`matchMedia('(pointer: coarse)').matches`), 'touch emulation did not give a coarse pointer');
  const h = await t.eval(`[...document.querySelectorAll('.phero .tag')].map((a) => a.getBoundingClientRect().height)`);
  assert(h.length && h.every((x) => x >= 44), `coarse pointer: heights ${h}`);
});

// ---------------------------------------------------------------------------------------------------------------------
// Runner
const args = process.argv.slice(2);
if (args.includes('--list')) {
  for (const k of checks) console.log(`${k.name.padEnd(24)} ${k.what}`);
  process.exit(0);
}
if (!args.length || args[0].startsWith('-')) {
  console.error('usage: node scripts/check-browser.mjs [--list] <out> [name ...]');
  process.exit(2);
}
const [outArg, ...wanted] = args;
if (!existsSync(outArg)) { console.error(`not a folder: ${outArg}`); process.exit(2); }
const known = checks.map((k) => k.name);
for (const w of wanted) {
  if (!known.some((n) => n === w || n.startsWith(w + '-'))) { console.error(`unknown check: ${w} (see --list)`); process.exit(2); }
}
const todo = wanted.length ? checks.filter((k) => wanted.some((w) => k.name === w || k.name.startsWith(w + '-'))) : checks;

const t0 = Date.now();
let browser, ctx, failed = 0;
const cleanup = async () => { try { await ctx?.close(); } catch { /* already gone */ } if (!ctx) await browser?.close().catch(() => {}); };
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { await cleanup(); process.exit(130); });
try {
  browser = await Browser.launch();
  ctx = new Context(resolve(outArg), browser);
  for (const k of todo) {
    const t = Date.now();
    try {
      await Promise.race([k.fn(ctx), sleep(120000).then(() => { throw new Error('timed out after 120 s'); })]);
      console.log(`PASS ${k.name} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
    } catch (e) {
      failed++;
      console.log(`FAIL ${k.name}: ${String(e.message || e).split('\n')[0]}`);
    }
    await ctx.closePages();
  }
} catch (e) {
  console.error(`error: ${e.message}`);
  failed = failed || 1;
} finally {
  await cleanup();
}
console.log(`${todo.length - failed} passed, ${failed} failed in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
process.exit(failed ? 1 : 0);
