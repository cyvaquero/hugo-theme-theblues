{{- /* theblues:template */ -}}
// Native <dialog> lightbox for the masonry galleries (.gal) on photo posts (decision D7).
// Previous/next buttons, arrow, Home and End keys (without Alt, Ctrl, Meta or Shift, which belong to the browser), swipe,
// counter, Esc to close, focus returns to the photo that was opened. The dialog is built at the first click, not at load. Each link points at the large image (X3), which is what
// opens without JavaScript; the thumbnail in the page stays X2. The lightbox shows the X2 photo instead when it already
// has a pixel for each device pixel of the space the photo fills (width and height, from the thumbnail's attributes,
// the viewport and devicePixelRatio, see big()), and the X3 one otherwise; the preloads use the same choice (#345). The
// counter and alt text change only when the new image has loaded (or both it and the thumbnail have failed, which the
// announcement says), so they always describe the photo on screen (#3, #168); neighbors are preloaded. The choice is made
// again when the window is resized or the device turned, for the photo on screen (refit()).
// The text it shows is the site's language: Hugo fills it in when it builds this file (asset.html runs it as a template,
// js-text.html), from i18n/en.toml or the site's own file.
(function () {
  var galleries = document.querySelectorAll('.gal');
  if (!galleries.length || typeof HTMLDialogElement === 'undefined') return;

  var TX = {{ partial "js-text.html" "gallery" | jsonify }};
  var dlg = null;
  var img, count, say, prev, next;
  var list = [], idx = 0, opener = null, seq = 0;
  // The URL show() chose for the photo on screen, and the one refit() is loading in its place.
  var chose = '', fitting = '';
  // Swipe state, see below.
  var sx = null, sy = null, down = 0;

  // Built with DOM calls, not innerHTML, so it works under a Trusted Types CSP (#16).
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
  // The dialog is built when a photo is first opened, not at load: most visits to a photo post never open it.
  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.setAttribute('aria-label', TX.viewer);
    var inner = el('div', { 'class': 'in' }), bar = el('div', { 'class': 'bb' });
    inner.appendChild(el('img', { alt: '' }));
    bar.appendChild(el('button', { type: 'button', 'data-a': 'p', 'aria-label': TX.previousPhoto }, TX.previous));
    // The visible counter ("4 / 18") is hidden from screen readers; a visually hidden live region announces the position
    // and the photo's alt text instead ("Photo 4 of 18: La Huasteca", #38).
    bar.appendChild(el('span', { 'class': 'count', 'aria-hidden': 'true' }));
    bar.appendChild(el('span', { 'class': 'vh', 'aria-live': 'polite' }));
    bar.appendChild(el('button', { type: 'button', 'data-a': 'n', 'aria-label': TX.nextPhoto }, TX.next));
    bar.appendChild(el('button', { type: 'button', 'data-a': 'c', 'aria-label': TX.closeViewer }, TX.close));
    inner.appendChild(bar);
    dlg.appendChild(inner);
    document.body.appendChild(dlg);

    img = dlg.querySelector('img'); count = dlg.querySelector('.count'); say = dlg.querySelector('[aria-live]');
    prev = dlg.querySelector('[data-a="p"]'); next = dlg.querySelector('[data-a="n"]');
    img.addEventListener('load', keepInView);
    // A turned phone or a resized window changes the space the photo fills, and with it the choice big() makes. Added once,
    // here, since the dialog is built once; refit() does nothing while the dialog is closed.
    window.addEventListener('resize', refit);
    window.addEventListener('orientationchange', refit);

    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
    dlg.addEventListener('click', function (e) {
      var a = e.target.dataset && e.target.dataset.a;
      if (a === 'n') show(idx + 1);
      else if (a === 'p') show(idx - 1);
      else if (a === 'c' || e.target === dlg || e.target.classList.contains('in') || e.target.classList.contains('bb')) dlg.close();
    });
    dlg.addEventListener('keydown', function (e) {
      if (list.length < 2 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;  // Alt+Left is Back, Ctrl+End is the page's end
      // The arrows point where the buttons are: the next photo is on the right in a left-to-right page and on the left in
      // a right-to-left one (#296).
      var fwd = rtl() ? 'ArrowLeft' : 'ArrowRight', back = rtl() ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd) { e.preventDefault(); show(idx + 1); }
      else if (e.key === back) { e.preventDefault(); show(idx - 1); }
      else if (e.key === 'Home') { e.preventDefault(); show(0); }
      else if (e.key === 'End') { e.preventDefault(); show(list.length - 1); }
    });
    // Swipe left or right on the photo (touch or pen); a mostly horizontal move of 50px or more by one finger. A second
    // pointer going down means a pinch, so the gesture is dropped and nothing changes until every pointer is up again.
    img.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      down++;
      if (down === 1) { sx = e.clientX; sy = e.clientY; } else sx = sy = null;
    });
    img.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse') return;
      var x = sx, y = sy;
      down = Math.max(0, down - 1); sx = sy = null;
      if (x === null) return;
      var dx = e.clientX - x, dy = e.clientY - y;
      if (list.length > 1 && Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) show(idx + ((dx < 0) !== rtl() ? 1 : -1));
    });
    // The browser fires pointercancel when it takes a gesture over (a pinch or a pan), and that
    // ends the pointer without a pointerup.
    img.addEventListener('pointercancel', function (e) {
      if (e.pointerType !== 'mouse') { down = Math.max(0, down - 1); sx = sy = null; }
    });
  }

  // The photo leaves room for the controls (main.css), but on a screen too short even for them the dialog scrolls, and
  // focus() alone has not brought the focused button into view there. Run after the dialog opens and each time a photo
  // has loaded, since the photo's size changes the layout (#348).
  function keepInView() {
    var f = document.activeElement;
    if (dlg && dlg.open && f && dlg.contains(f) && f !== dlg) f.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  // The page's reading direction, read when it is needed since it can differ per page (dir on <html>).
  function rtl() { return getComputedStyle(dlg).direction === 'rtl'; }

  // The URL of the large photo to load for a link: the thumbnail's own X2 URL when the thumbnail is the X2 size of the
  // link's X3 photo and X2 has at least a pixel for each device pixel the lightbox will fill (1px to spare for
  // rounding); the link's X3 URL otherwise, and for any link that does not follow SmugMug's /X2/…-X2.ext and
  // /X3/…-X3.ext pattern or whose thumbnail has no width and height (X2's size, written at build time) to judge by. The
  // photo fills the dialog less its padding (1rem each side) and 80% of the viewport's height (main.css, dialog.lb),
  // whole and in proportion, and never more than its own pixels, so X3 is shown at the same size as X2 wherever X2 is
  // enough. `need` is the number of device pixels per X2 pixel the photo would be shown at. On a screen too short for
  // that height plus the controls bar the photo is smaller than this assumes, so the choice errs toward X3, never X2.
  function big(a) {
    var t = a.querySelector('img');
    if (!t) return a.href;
    var x2 = t.getAttribute('src') || '', w = +t.getAttribute('width'), h = +t.getAttribute('height');
    if (!(w > 0 && h > 0) || x2.replace(/\/X2\/([^\/?#]*)-X2(\.[A-Za-z0-9]+)(?=[?#]|$)/, '/X3/$1-X3$2') !== a.getAttribute('href')) return a.href;
    var need = Math.min((document.documentElement.clientWidth - 32) / w, window.innerHeight * 0.8 / h) * (window.devicePixelRatio || 1);
    return need * w <= w + 1 && need * h <= h + 1 ? t.src : a.href;
  }

  function preload(n) { if (list.length > 1) new Image().src = big(list[(n + list.length) % list.length]); }

  // The photo on screen at a window size that would make big() choose the other size: load that one first, and swap it in
  // only once it has loaded, so there is no flicker, and only if the same photo is still shown. Waits for a photo being
  // loaded (show() runs this when it finishes), and asks for a URL only once, whether or not it loads.
  function refit() {
    if (!dlg || !dlg.open || !list.length || dlg.hasAttribute('aria-busy')) return;
    var want = big(list[idx]), my = seq;
    if (want === chose || want === fitting) return;
    fitting = want;
    var pre = new Image();
    pre.onload = function () {
      if (my !== seq || want !== fitting) return;
      img.src = chose = want;
    };
    pre.src = want;
  }

  function show(n) {
    idx = (n + list.length) % list.length;
    var a = list[idx], thumb = a.querySelector('img'), my = ++seq, pre = new Image();
    dlg.setAttribute('aria-busy', 'true');
    fitting = '';
    function done(failed) {
      if (my !== seq) return;  // a later photo was asked for meanwhile
      img.src = pre.src || (thumb ? thumb.src : '');
      img.alt = thumb ? thumb.alt : '';
      var note = failed === true ? ' ' + TX.photoFailed : '';
      count.textContent = (idx + 1) + ' / ' + list.length + note;
      say.textContent = TX.photoOf.replace('{i}', idx + 1).replace('{n}', list.length) + (img.alt ? ': ' + img.alt : '') + note;
      dlg.removeAttribute('aria-busy');
      preload(idx + 1); preload(idx - 1);
      refit();
    }
    pre.onload = function () { done(false); };
    // The large image failed: try the thumbnail once; if that fails too, still finish (broken image, counter and caption
    // updated, no longer busy) instead of leaving the viewer empty and busy (#168), and say in both that it didn't load.
    pre.onerror = function () {
      if (thumb && pre.src !== thumb.src) { pre.onerror = function () { done(true); }; pre.src = thumb.src; } else done(true);
    };
    chose = pre.src = big(a);
  }

  galleries.forEach(function (g) {
    g.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || !g.contains(a)) return;
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // keep open-in-new-tab working
      e.preventDefault();
      if (!dlg) build();
      list = Array.from(g.querySelectorAll('a'));
      opener = a;
      prev.hidden = next.hidden = list.length < 2;
      img.removeAttribute('src'); img.alt = ''; count.textContent = ''; say.textContent = '';
      show(list.indexOf(a));
      dlg.showModal();
      dlg.querySelector('[data-a="c"]').focus();
      keepInView();
    });
  });
})();
