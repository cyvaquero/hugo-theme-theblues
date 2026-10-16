{{- /* theblues:template */ -}}
// Rotating hero (#356): the home and term heroes (header[data-pool]) show five of the landscape photos of the site's
// photo posts, one after the other. The page paints the first photo with no script (the hero's own --hi); this picks four
// more at random from the data-pool attribute (hero-pool.html lists every photo there, the first one too), never the
// first again, and shows each for params.hero_interval seconds (30 by default, 5 at least) before a 1.5 second fade to
// the next. The next photo is fetched 5 seconds ahead (never all at once) and is faded in only once it has loaded and
// decoded, so the hero never shows an empty box.
// The fade is a second layer (.hr) over the hero, holding the same scrim and the next photo; when it is done the hero
// itself takes the photo and the layer is hidden again. The photo's sizes are chosen by main.css exactly as for the first
// photo: the layer and the hero get --hi and --hi1 to --hi5 (hero-sizes.html's tiers), and the script reads the URL the
// browser's media queries picked (--hs) to load it. Photos stay CSS backgrounds: the layer is aria-hidden and nothing is
// announced.
// A visitor who prefers reduced motion gets the first photo and no timer, no fade and no button. Everyone else gets a
// pause/play button (WCAG 2.2.2), made here so a page without script has none. A paused rotation stays paused for the
// page view; a hidden tab pauses it too and starts the current photo's time again when the tab comes back.
// The text it shows is the site's language and the interval is the site's setting, both filled in when Hugo builds this
// file (asset.html, js-text.html).
{{- $show := site.Params.hero_interval | default 30 }}
{{- if or (not (in (slice "int" "int64" "float64") (printf "%T" $show))) (lt $show 5) }}
  {{- errorf "theblues: params.hero_interval must be a number of seconds, 5 or more (got %#v)" $show }}
{{- end }}
(function () {
  var hero = document.querySelector('header[data-pool]');
  if (!hero) return;

  var TX = {{ partial "js-text.html" "hero" | jsonify }};
  var SHOW = {{ mul $show 1000 | math.Round }}, LEAD = 5000, FADE = 1500;   // ms; FADE is the opacity transition of .hr in main.css
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var URL_RE = /^[A-Za-z0-9_.~\/-]+$/;
  var SIZE_RE = /^(.+)\/(M|L|XL|X2|X3|X4|X5)\/([A-Za-z0-9_.~-]+)-(M|L|XL|X2|X3|X4|X5)\.([A-Za-z0-9]+)$/;
  var ORIGIN = 'https://photos.smugmug.com/';

  // data-pool: tokens separated by spaces, each "path" or "path|M,L,XL,M,XL" (the size name of each of the five tiers, empty
  // where the full size is used). Anything that doesn't look like what hero-pool.html writes is ignored.
  var pool = [];
  (hero.getAttribute('data-pool') || '').split(' ').forEach(function (tok) {
    var part = tok.split('|'), path = part[0], m = SIZE_RE.exec(path);
    if (!m || !URL_RE.test(path) || m[2] !== m[4]) return;
    var names = (part[1] || '').split(',');
    pool.push({ full: ORIGIN + path, base: ORIGIN + m[1], stem: m[3], ext: m[5], names: names });
  });
  if (pool.length < 2) return;

  // The first photo is the page's own; four of the others, picked at random (a partial Fisher-Yates shuffle).
  var rest = pool.slice(1), seq = [pool[0]], i, j, t;
  for (i = rest.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = rest[i]; rest[i] = rest[j]; rest[j] = t; }
  seq = seq.concat(rest.slice(0, 4));

  // Sets a photo's custom properties on an element, the way the hero's style attribute does for the first photo.
  function paint(node, p) {
    node.style.setProperty('--hi', 'url("' + p.full + '")');
    for (var k = 0; k < 5; k++) {
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

  var cur = 0;                 // index in seq of the photo on screen
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

  // Starts the time of the photo on screen.
  function begin() {
    clear();
    if (!running() || fading) return;
    loadTimer = setTimeout(prepare, SHOW - LEAD);
    showTimer = setTimeout(advance, SHOW);
  }

  // Fetches the next photo; one that can't be loaded is dropped from the five, and the one after it is tried.
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
        seq.splice(nextIdx, 1);
        if (nextIdx <= cur) cur--;
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

  // Fewer than two photos can be shown: no rotation, no button.
  function finish() {
    clear();
    btn.hidden = true;
  }

  btn.addEventListener('click', function () {
    paused = !paused;
    label();
    begin();
  });
  document.addEventListener('visibilitychange', begin);
  function motion() {
    btn.hidden = reduce.matches || seq.length < 2;
    begin();
  }
  if (reduce.addEventListener) reduce.addEventListener('change', motion); else if (reduce.addListener) reduce.addListener(motion);

  label();
  motion();
})();
