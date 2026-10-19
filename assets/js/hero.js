{{- /* theblues:template */ -}}
// Rotating hero (#356): the home and term heroes (header[data-pool], or header[data-pool-key] on pager pages, #364) show five of the landscape photos of the site's
// photo posts, one after the other. The page paints the build's first photo with no script (the hero's own --hi), for a
// visitor without script or who prefers reduced motion. This picks five at random from the data-pool attribute
// (hero-pool.html lists every photo there, the build's first one too), so each visit starts on a random photo of a
// random gallery: unless the pick is the build's photo, it is fetched at once and faded in as soon as it has loaded.
// Each then shows for params.hero_interval seconds (30 by default, from 5 to 2147483) before a 1.5 second fade to the next. The next photo is fetched 5 seconds ahead (never all at once) and is faded in only once it has loaded and
// decoded, so the hero never shows an empty box.
// The photo on screen is in a layer (.hr, aria-hidden) over the hero's own background: the layer holds the photo (.hp, a CSS
// background) under the same scrim, and there are two of them, so the next photo fades in on the one that is not showing. The
// build's photo, which is the hero's own background, is replaced by the first layer's fade. The photo's sizes are chosen by
// main.css exactly as for the first photo: the layer and the hero get --hi and --hi1 to --hi8 (hero-sizes.html's tiers), and
// the script reads the URL the browser's media queries picked (--hs) to load it. Nothing is announced.
// Pan (#385): where `cover` crops the photo vertically, the photo moves while it shows, from 1/6 to 5/6 of the cropped part,
// linearly over the whole interval. The one photo that fades in over the same photo in the hero's own background (the pick that is
// the build's photo) starts at the middle (1/2) instead, where that background draws it, so nothing moves while it fades in (#388).
// Only .hp moves, by a Web Animations API transform, so the browser moves a layer it already
// painted instead of painting the photo again each frame; the scrim (.hr::after) never moves. The layer's photo is made as high
// as `cover` would draw it and slid up, so the hero looks the same as the CSS background would at that point. The pan is
// paused with the rotation (the pause button, a hidden tab, reduced motion) and goes on from where it was, and the timers
// follow its progress. A photo that is cropped only left and right does not move.
// A visitor who prefers reduced motion gets the build's photo and no timer, no fade and no button. The setting is read
// through settle(), which applies a change once whether or not the browser delivers the `change` event (#384). Everyone else gets a
// pause/play button (WCAG 2.2.2), made here so a page without script has none. A paused rotation stays paused for the
// page view; a hidden tab pauses it too and starts the current photo's time again when the tab comes back.
// The text it shows is the site's language and the interval is the site's setting, both filled in when Hugo builds this
// file (asset.html, js-text.html).
{{- /* The raw value is checked, before any default: 0, nan and inf are not "unset". 2147483 s is the longest that fits a timer (2^31-1 ms). */ -}}
{{- $show := 30 }}
{{- if isset site.Params "hero_interval" }}
  {{- $show = site.Params.hero_interval }}
  {{- if or (not (in (slice "int" "int64" "float64") (printf "%T" $show))) (ne $show $show) (lt $show 5) (gt $show 2147483) }}
    {{- errorf "theblues: params.hero_interval must be a number of seconds, from 5 to 2147483 (got %#v)" $show }}
  {{- end }}
{{- end }}
(function () {
  var hero = document.querySelector('header[data-pool], header[data-pool-key]');
  if (!hero) return;

  var TX = {{ partial "js-text.html" "hero" | jsonify }};
  var SHOW = {{ mul $show 1000 | math.Round }}, LEAD = 5000, FADE = 1500;   // ms; FADE is the opacity transition of .hr in main.css
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var URL_RE = /^[A-Za-z0-9_.~\/-]+$/;
  var FILE_RE = /^([A-Za-z0-9_.~-]+)-(M|L|XL|X2|X3|X4|X5)\.([A-Za-z0-9]+)$/;   // the last segment: stem-SIZE.ext
  var NAME_RE = /^(M|L|XL|X2|X3|X4|X5)?$/, SIZES = /^(M|L|XL|X2|X3|X4|X5)$/;
  var ORIGIN = 'https://photos.smugmug.com/';

  // data-pool: tokens separated by spaces, each "path" or "path|M,L,XL,M,XL,X2,,X4" (the size name of each of the eight tiers, empty
  // where the full size is used). Anything that doesn't look like what hero-pool.html writes is ignored: a token over 512
  // characters, a path that isn't "directory/SIZE/stem-SIZE.ext" with the same size twice, or size names that aren't eight
  // known ones. The path is split on "/" rather than matched with one pattern, so a long path can't make it backtrack.
  var pool = [];
  // The pool text: the data-pool attribute (the home page, a term's first page and any page with no pager), or on page 2 and later
  // the script file hero-pool-file.html writes, which sets window.theblues.pool[key] (data-pool-key) before this script runs. A
  // file that failed to load, or has no such key, gives an empty pool, so the hero keeps the build's photo and gets no button.
  function poolText() {
    var attr = hero.getAttribute('data-pool');
    if (attr !== null) return attr;
    var key = hero.getAttribute('data-pool-key'), all = window.theblues && window.theblues.pool;
    return key && all && Object.prototype.hasOwnProperty.call(all, key) && typeof all[key] === 'string' ? all[key] : '';
  }
  poolText().split(' ').forEach(function (tok) {
    if (tok.length > 512) return;
    var part = tok.split('|'), path = part[0];
    if (part.length > 2 || !URL_RE.test(path)) return;
    var segs = path.split('/'), m = FILE_RE.exec(segs.pop() || ''), size = segs.pop(), dir = segs.join('/');
    if (!m || !dir || !SIZES.test(size || '') || m[2] !== size) return;
    var names = part.length > 1 ? part[1].split(',') : [];
    if (part.length > 1 && names.length !== 8) return;
    for (var k = 0; k < names.length; k++) if (!NAME_RE.test(names[k])) return;
    pool.push({ full: ORIGIN + path, base: ORIGIN + dir, stem: m[1], ext: m[3], names: names });
  });
  if (pool.length < 2) return;

  // Five photos picked at random (a Fisher-Yates shuffle); the first of them is the one the rotation starts on.
  var seq = pool.slice(), i, j, t;
  for (i = seq.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = seq[i]; seq[i] = seq[j]; seq[j] = t; }
  var spare = seq.slice(5);   // the rest of the pool, in random order: stands in for a photo that fails to load
  seq = seq.slice(0, 5);

  // Sets a photo's custom properties on an element, the way the hero's style attribute does for the first photo.
  function paint(node, p) {
    node.style.setProperty('--hi', 'url("' + p.full + '")');
    for (var k = 0; k < 8; k++) {
      var n = p.names[k];
      node.style.setProperty('--hi' + (k + 1), n ? 'url("' + p.base + '/' + n + '/' + p.stem + '-' + n + '.' + p.ext + '")' : 'initial');
    }
  }
  // Two layers, each a scrim over a photo (.hp). `top` is the one showing the photo; null until the first fade is done.
  function makeLayer() {
    var l = document.createElement('div');
    l.className = 'hr';
    l.setAttribute('aria-hidden', 'true');
    l.hidden = true;
    var ph = document.createElement('div');
    ph.className = 'hp';
    l.appendChild(ph);
    return l;
  }
  var layers = [makeLayer(), makeLayer()], top = null;
  hero.insertBefore(layers[1], hero.firstChild);
  hero.insertBefore(layers[0], hero.firstChild);
  hero.classList.add('rot');
  function idleLayer() { return top === layers[0] ? layers[1] : layers[0]; }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hpp';
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  var shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.appendChild(shape);
  btn.appendChild(svg);
  hero.appendChild(btn);

  var cur = -1;   // index in seq of the photo on screen; -1 while the build's photo shows (the first fade replaces it, as that is what pans)
  var anim = null, topDims = null, topFrom = 1 / 6, nextDims = null;   // the pan of the photo on screen, its size, and the size of the one being fetched
  var nextIdx = 0, nextState = 'idle';   // the photo being fetched for next: 'idle', 'loading' or 'ready'
  var waiting = false;         // the show timer ran out before the next photo was ready
  var fading = false;
  var paused = false;          // the visitor's choice, for the page view
  var gen = 0;                 // changes when pending work must be forgotten
  var loadTimer = 0, showTimer = 0;

  function label() {
    var text = paused ? TX.play : TX.pause;
    btn.setAttribute('aria-label', text);
    btn.title = text;
    // Text the site's language lacks is the theme's English; marking it lets a screen reader speak it with an English voice (WCAG 3.1.2).
    if (TX.en.indexOf(paused ? 'play' : 'pause') < 0) btn.removeAttribute('lang'); else btn.lang = 'en';
    shape.setAttribute('d', paused ? 'M4 2.5l9 5.5-9 5.5z' : 'M3.5 2.5h3.5v11H3.5zM9 2.5h3.5v11H9z');
  }

  // The URL the browser's media queries chose for a photo, so the one fetched is the one the layer will show. The layer is
  // hidden while this is read (display: none still has computed custom properties, and loads nothing).
  function chosen(p) {
    var l = idleLayer();
    paint(l, p);
    var cs = getComputedStyle(l);
    var m = /url\(\s*["']?([^"')]+)/.exec(cs.getPropertyValue('--hs') || cs.getPropertyValue('--hi'));
    return m ? m[1] : p.full;
  }

  // Whether a photo is the one the hero's own background shows (its --hi, set by the page), which is drawn centered.
  function builds(p) {
    return hero.style.getPropertyValue('--hi').indexOf(p.full) >= 0;
  }

  function load(p, done) {
    var img = new Image(), url = chosen(p);
    function ok() { done(true, { w: img.naturalWidth, h: img.naturalHeight }); }
    img.onload = function () { if (img.decode) img.decode().then(ok, ok); else ok(); };
    img.onerror = function () { done(false); };
    img.src = url;
  }

  function clear() {
    clearTimeout(loadTimer); clearTimeout(showTimer);
    loadTimer = showTimer = 0;
    gen++;
    nextState = 'idle'; waiting = false;
  }

  // Every read of the reduced-motion setting goes through here, so the page follows the setting even when Chrome does not deliver
  // the `change` event (it reports a change a frame late, and not at all to a script that reads `matches` in between).
  function running() { settle(); return !paused && !document.hidden && !reduce.matches; }

  // The pan of a photo (#385) in a layer: null when `cover` doesn't crop it vertically (or the browser has no animate()).
  // `at` is how far through the interval it is, 0 to 1; `from` is where in the cropped part it starts (1/6, or 1/2 for the
  // photo that fades in over itself, #388). It ends at 5/6. The animation is made paused; syncAnim() plays it.
  function makePan(layer, dims, at, from) {
    var ph = layer.firstChild;
    ph.style.height = ph.style.transform = '';
    if (!dims || !dims.w || !dims.h || !ph.animate) return null;
    var box = hero.getBoundingClientRect();
    var high = dims.h * Math.max(box.width / dims.w, box.height / dims.h), crop = high - box.height;   // the photo as cover draws it, and the part it crops
    if (!(crop >= 1)) return null;
    ph.style.height = high + 'px';
    var a = ph.animate([{ transform: 'translateY(' + (-crop * from) + 'px)' }, { transform: 'translateY(' + (-crop * 5 / 6) + 'px)' }], { duration: SHOW, easing: 'linear', fill: 'both' });
    a.pause();
    a.currentTime = at * SHOW;
    return a;
  }

  // Plays the pan while the rotation runs, holds it where it is otherwise.
  function syncAnim() {
    if (!anim) return;
    if (running() && !fading && anim.currentTime < SHOW) anim.play(); else anim.pause();
  }

  // The photo's size changed with the hero's box: draw the pan again from the same point.
  function relayout() {
    if (!top || !anim || fading) return;
    var at = Math.min(1, anim.currentTime / SHOW);
    anim.cancel();
    anim = makePan(top, topDims, at, topFrom);
    syncAnim();
  }
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(hero); else window.addEventListener('resize', relayout);

  // Starts the time of the photo on screen; the build's photo, when the visit starts elsewhere, gets none.
  function begin() {
    clear();
    syncAnim();
    if (!running() || fading) return;
    if (cur < 0) { showTimer = setTimeout(advance, 0); return; }
    var left = anim ? Math.max(0, SHOW - anim.currentTime) : SHOW;   // a photo that was paused has the rest of its time
    loadTimer = setTimeout(prepare, Math.max(0, left - LEAD));
    showTimer = setTimeout(advance, left);
  }

  // Fetches the next photo; one that can't be loaded is replaced by a photo of the pool not yet tried, and only when there
  // is none left is it dropped from the five.
  function prepare() {
    loadTimer = 0;
    if (nextState !== 'idle' || !running()) return;
    if (seq.length < 2) return finish();
    var mine = gen;
    nextIdx = (cur + 1) % seq.length;
    nextState = 'loading';
    load(seq[nextIdx], function (ok, dims) {
      if (mine !== gen) return;
      nextDims = dims;
      if (!ok) {
        if (spare.length) seq[nextIdx] = spare.pop();
        else { seq.splice(nextIdx, 1); if (nextIdx <= cur) cur--; }
        nextState = 'idle';
        return prepare();
      }
      nextState = 'ready';
      if (waiting) go();
    });
  }

  function advance() {
    showTimer = 0;
    if (!running()) return;
    if (nextState === 'ready') go();
    else { waiting = true; prepare(); }
  }

  // Fades the spare layer in over the one showing (or over the hero's own photo), at the start of its pan (1/6; the middle for the
  // build's photo over the hero's own background, which draws it there), and when it is done hides the other one. The pan starts
  // then, so the photo has its whole interval after the fade.
  function go() {
    var p = seq[nextIdx], idx = nextIdx, dims = nextDims, layer = idleLayer();
    var from = !top && builds(p) ? 1 / 2 : 1 / 6;
    waiting = false; fading = true;
    clearTimeout(loadTimer); clearTimeout(showTimer);
    paint(layer, p);
    var pan = makePan(layer, dims, 0, from);
    if (top) hero.insertBefore(layer, top.nextSibling);
    layer.hidden = false;
    layer.classList.remove('on');
    void layer.offsetWidth;
    layer.classList.add('on');
    setTimeout(function () {
      paint(hero, p);   // the hero's own background follows, for whatever shows it (a print, a layer that is gone)
      if (top) { top.hidden = true; top.classList.remove('on'); }
      if (anim) anim.cancel();
      top = layer; anim = pan; topDims = dims; topFrom = from;
      fading = false; cur = idx;
      begin();
    }, FADE + 100);
  }

  // Hides the button. A button that is hidden while it has focus drops focus to <body>, and a keyboard or screen reader user
  // loses their place (WCAG 2.4.3), so focus moves first to <main> (the skip link's target, which has tabindex -1 and no ring):
  // the button is the last stop in the hero and <main> follows it, so the next Tab goes to the first stop after the hero, where
  // it would have gone from the button, and the hero's own links aren't visited twice. A page with no <main> gets the hero.
  function hideButton() {
    if (document.activeElement === btn) {
      var to = document.getElementById('main') || hero;
      if (to === hero) hero.setAttribute('tabindex', '-1');
      to.focus({ preventScroll: true });
    }
    btn.hidden = true;
  }

  // Fewer than two photos can be shown: no rotation, no button.
  function finish() {
    clear();
    if (anim) anim.pause();   // moving content needs a way to stop it (WCAG 2.2.2), and the button is going away
    hideButton();
  }

  btn.addEventListener('click', function () {
    paused = !paused;
    label();
    begin();
  });
  document.addEventListener('visibilitychange', begin);
  // Applies the setting once per change: hides or shows the button, and starts the timers again (begin() clears them, and starts
  // none while reduced motion is on). It runs from the `change` listener and from running(), whichever sees the change first;
  // `applied` is the setting it last applied, so the second one finds nothing to do.
  var applied = null;
  function settle() {
    var now = reduce.matches;
    if (now === applied) return;
    applied = now;
    if (now || seq.length < 2) hideButton(); else btn.hidden = false;
    begin();
  }
  if (reduce.addEventListener) reduce.addEventListener('change', settle); else if (reduce.addListener) reduce.addListener(settle);

  label();
  settle();
})();
