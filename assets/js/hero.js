{{- /* theblues:template */ -}}
// Rotating hero (#356): the home and term heroes (header[data-pool]) show five of the landscape photos of the site's
// photo posts, one after the other. The page paints the build's first photo with no script (the hero's own --hi), for a
// visitor without script or who prefers reduced motion. This picks five at random from the data-pool attribute
// (hero-pool.html lists every photo there, the build's first one too), so each visit starts on a random photo of a
// random gallery: unless the pick is the build's photo, it is fetched at once and faded in as soon as it has loaded.
// Each then shows for params.hero_interval seconds (30 by default, from 5 to 2147483) before a 1.5 second fade to the next. The next photo is fetched 5 seconds ahead (never all at once) and is faded in only once it has loaded and
// decoded, so the hero never shows an empty box.
// The fade is a second layer (.hr) over the hero, holding the same scrim and the next photo; when it is done the hero
// itself takes the photo and the layer is hidden again. The photo's sizes are chosen by main.css exactly as for the first
// photo: the layer and the hero get --hi and --hi1 to --hi6 (hero-sizes.html's tiers), and the script reads the URL the
// browser's media queries picked (--hs) to load it. Photos stay CSS backgrounds: the layer is aria-hidden and nothing is
// announced.
// A visitor who prefers reduced motion gets the build's photo and no timer, no fade and no button. Everyone else gets a
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
  var hero = document.querySelector('header[data-pool]');
  if (!hero) return;

  var TX = {{ partial "js-text.html" "hero" | jsonify }};
  var SHOW = {{ mul $show 1000 | math.Round }}, LEAD = 5000, FADE = 1500;   // ms; FADE is the opacity transition of .hr in main.css
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var URL_RE = /^[A-Za-z0-9_.~\/-]+$/;
  var FILE_RE = /^([A-Za-z0-9_.~-]+)-(M|L|XL|X2|X3|X4|X5)\.([A-Za-z0-9]+)$/;   // the last segment: stem-SIZE.ext
  var NAME_RE = /^(M|L|XL|X2|X3|X4|X5)?$/, SIZES = /^(M|L|XL|X2|X3|X4|X5)$/;
  var ORIGIN = 'https://photos.smugmug.com/';

  // data-pool: tokens separated by spaces, each "path" or "path|M,L,XL,M,XL,X2" (the size name of each of the six tiers, empty
  // where the full size is used). Anything that doesn't look like what hero-pool.html writes is ignored: a token over 512
  // characters, a path that isn't "directory/SIZE/stem-SIZE.ext" with the same size twice, or size names that aren't six
  // known ones. The path is split on "/" rather than matched with one pattern, so a long path can't make it backtrack.
  var pool = [];
  (hero.getAttribute('data-pool') || '').split(' ').forEach(function (tok) {
    if (tok.length > 512) return;
    var part = tok.split('|'), path = part[0];
    if (part.length > 2 || !URL_RE.test(path)) return;
    var segs = path.split('/'), m = FILE_RE.exec(segs.pop() || ''), size = segs.pop(), dir = segs.join('/');
    if (!m || !dir || !SIZES.test(size || '') || m[2] !== size) return;
    var names = part.length > 1 ? part[1].split(',') : [];
    if (part.length > 1 && names.length !== 6) return;
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
    for (var k = 0; k < 6; k++) {
      var n = p.names[k];
      node.style.setProperty('--hi' + (k + 1), n ? 'url("' + p.base + '/' + n + '/' + p.stem + '-' + n + '.' + p.ext + '")' : 'initial');
    }
  }
  var layer = document.createElement('div');
  layer.className = 'hr';
  layer.setAttribute('aria-hidden', 'true');
  layer.hidden = true;
  hero.insertBefore(layer, hero.firstChild);
  hero.classList.add('rot');

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

  var cur = seq[0] === pool[0] ? 0 : -1;   // index in seq of the photo on screen; -1 while the build's photo shows
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
    paint(layer, p);
    var cs = getComputedStyle(layer);
    var m = /url\(\s*["']?([^"')]+)/.exec(cs.getPropertyValue('--hs') || cs.getPropertyValue('--hi'));
    return m ? m[1] : p.full;
  }

  function load(p, done) {
    var img = new Image(), url = chosen(p);
    img.onload = function () { if (img.decode) img.decode().then(function () { done(true); }, function () { done(true); }); else done(true); };
    img.onerror = function () { done(false); };
    img.src = url;
  }

  function clear() {
    clearTimeout(loadTimer); clearTimeout(showTimer);
    loadTimer = showTimer = 0;
    gen++;
    nextState = 'idle'; waiting = false;
  }

  function running() { return !paused && !document.hidden && !reduce.matches; }

  // Starts the time of the photo on screen; the build's photo, when the visit starts elsewhere, gets none.
  function begin() {
    clear();
    if (!running() || fading) return;
    if (cur < 0) { showTimer = setTimeout(advance, 0); return; }
    loadTimer = setTimeout(prepare, SHOW - LEAD);
    showTimer = setTimeout(advance, SHOW);
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
    load(seq[nextIdx], function (ok) {
      if (mine !== gen) return;
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
    if (nextState === 'ready') go();
    else { waiting = true; prepare(); }
  }

  // Fades the layer in over the hero, then the hero takes the photo and the layer goes away.
  function go() {
    var p = seq[nextIdx], idx = nextIdx;
    waiting = false; fading = true;
    clearTimeout(loadTimer); clearTimeout(showTimer);
    paint(layer, p);
    layer.hidden = false;
    layer.classList.remove('on');
    void layer.offsetWidth;
    layer.classList.add('on');
    setTimeout(function () {
      paint(hero, p);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          layer.hidden = true;
          layer.classList.remove('on');
          fading = false; cur = idx;
          begin();
        });
      });
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
    hideButton();
  }

  btn.addEventListener('click', function () {
    paused = !paused;
    label();
    begin();
  });
  document.addEventListener('visibilitychange', begin);
  function motion() {
    if (reduce.matches || seq.length < 2) hideButton(); else btn.hidden = false;
    begin();
  }
  if (reduce.addEventListener) reduce.addEventListener('change', motion); else if (reduce.addListener) reduce.addListener(motion);

  label();
  motion();
})();
