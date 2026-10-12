{{- /* theblues:template */ -}}
// Native <dialog> lightbox for the masonry galleries (.gal) on photo posts (decision D7).
// Previous/next buttons, arrow, Home and End keys, swipe, counter, Esc to close, focus returns to the photo that was
// opened. Each link points at the large image (X3); the thumbnail in the page stays X2. The counter and alt text change
// only when the new image has loaded (or both it and the thumbnail have failed), so they always describe the photo on
// screen (#3, #168); neighbors are preloaded.
// The text it shows is the site's language: Hugo fills it in when it builds this file (asset.html runs it as a template,
// js-text.html), from i18n/en.toml or the site's own file.
(function () {
  var galleries = document.querySelectorAll('.gal');
  if (!galleries.length || typeof HTMLDialogElement === 'undefined') return;

  var TX = {{ partial "js-text.html" "gallery" | jsonify }};
  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.setAttribute('aria-label', TX.viewer);
  // Built with DOM calls, not innerHTML, so it works under a Trusted Types CSP (#16).
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }
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

  var img = dlg.querySelector('img'), count = dlg.querySelector('.count'), say = dlg.querySelector('[aria-live]');
  var prev = dlg.querySelector('[data-a="p"]'), next = dlg.querySelector('[data-a="n"]');
  var list = [], idx = 0, opener = null, seq = 0;

  function preload(n) { if (list.length > 1) new Image().src = list[(n + list.length) % list.length].href; }

  function show(n) {
    idx = (n + list.length) % list.length;
    var a = list[idx], thumb = a.querySelector('img'), my = ++seq, pre = new Image();
    dlg.setAttribute('aria-busy', 'true');
    function done() {
      if (my !== seq) return;  // a later photo was asked for meanwhile
      img.src = pre.src || (thumb ? thumb.src : '');
      img.alt = thumb ? thumb.alt : '';
      count.textContent = (idx + 1) + ' / ' + list.length;
      say.textContent = TX.photoOf.replace('{i}', idx + 1).replace('{n}', list.length) + (img.alt ? ': ' + img.alt : '');
      dlg.removeAttribute('aria-busy');
      preload(idx + 1); preload(idx - 1);
    }
    pre.onload = done;
    // The large image failed: try the thumbnail once; if that fails too, still finish (broken image, counter and caption
    // updated, no longer busy) instead of leaving the viewer empty and busy (#168).
    pre.onerror = function () {
      if (thumb && pre.src !== thumb.src) { pre.onerror = done; pre.src = thumb.src; } else done();
    };
    pre.src = a.href;
  }

  galleries.forEach(function (g) {
    g.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || !g.contains(a)) return;
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // keep open-in-new-tab working
      e.preventDefault();
      list = [].slice.call(g.querySelectorAll('a'));
      opener = a;
      prev.hidden = next.hidden = list.length < 2;
      img.removeAttribute('src'); img.alt = ''; count.textContent = ''; say.textContent = '';
      show(list.indexOf(a));
      dlg.showModal();
      dlg.querySelector('[data-a="c"]').focus();
    });
  });

  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  dlg.addEventListener('click', function (e) {
    var a = e.target.dataset && e.target.dataset.a;
    if (a === 'n') show(idx + 1);
    else if (a === 'p') show(idx - 1);
    else if (a === 'c' || e.target === dlg || e.target.classList.contains('in') || e.target.classList.contains('bb')) dlg.close();
  });
  dlg.addEventListener('keydown', function (e) {
    if (list.length < 2) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(list.length - 1); }
  });
  // Swipe left or right on the photo (touch or pen); a mostly horizontal move of 50px or more.
  var sx = null, sy = null;
  img.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
  img.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (list.length > 1 && Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
  });
})();
