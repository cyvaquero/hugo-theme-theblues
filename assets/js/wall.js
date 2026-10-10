// Browse controls for the masonry wall (home, tag, category, series and section pages).
// Progressive enhancement: the wall is complete and sorted newest first without this file; the controls markup is
// hidden until this script runs. Behavior follows the final mockup (decision D12): type chips with counts, a
// "View options" popover (Mode, Sort, Group by gallery, Reset), a Clear button and a live caption.
// Tiles carry data-type (photo|article), data-gallery, data-gallery-title, data-n (photos in the gallery), data-date and
// data-order.
// Counts and groups are computed from the tiles on the current page (the wall is paginated by tile). The "see all" tile of a
// gallery (data-more) is a link, not a photo: it is excluded from counts and the caption, but filters, highlights, sorts and
// groups like a photo tile and always stays last in its gallery.
(function () {
  var stage = document.getElementById('stage'), ctl = document.getElementById('ctl');
  if (!stage || !ctl) return;

  // Group headings show a gallery's date as its tiles' captions do (date.html, which follows params.dateFormat); fd is
  // the fallback for a gallery whose first tile here has no caption date.
  var MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fd(d) { if (!d) return 'Undated'; var p = d.split('-'); return MO[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0]; }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  // Collect the tiles the server rendered.
  var items = [], galleries = {}, galleryList = [];
  [].slice.call(stage.querySelectorAll('.tile')).forEach(function (el) {
    var d = el.dataset, it = {
      t: d.type === 'article' ? 'a' : 'p', date: d.date || '', ord: +d.order || 0,
      key: d.gallery || '', name: d.galleryTitle || '', el: el,
      more: d.more !== undefined ? (+d.more || 0) : -1  // see-all link tile: not a photo, never counted
    };
    items.push(it);
    if (it.t === 'p') {
      var g = galleries[it.key];
      if (!g) {
        var cap = el.querySelector('figcaption .meta');
        // The heading counts the whole gallery from data-n, also when part of it is on another pager page (#7).
        g = galleries[it.key] = { key: it.key, name: it.name, date: it.date, shown: cap ? cap.textContent : fd(it.date), ord: it.ord, n: +d.n || 0 };
        galleryList.push(g);
      }
    }
  });
  var NA = items.filter(function (i) { return i.t === 'a'; }).length;
  var NP = items.filter(function (i) { return i.t === 'p' && i.more < 0; }).length;
  var NT = NA + NP;

  var DEF = { f: 'all', m: 'filter', s: 'new', g: false };
  var S = { f: DEF.f, m: DEF.m, s: DEF.s, g: DEF.g };
  var openGroups = {};

  function qa(sel) { return [].slice.call(ctl.querySelectorAll(sel)); }
  var vb = document.getElementById('vb'), pop = document.getElementById('pop'), cap = ctl.querySelector('.cap');

  // Sorting: newest/oldest by date; "Galleries first" and "Articles first" group by type. data-date holds only the day, so
  // ties fall back to the server order (newest first, by full timestamp): reversed for Oldest first, except within one
  // gallery, whose photos keep their order and its see-all tile stays last (#32).
  function byDate(dir) {
    return function (x, y) {
      if (x.date !== y.date) return (x.date < y.date ? 1 : -1) * dir;
      return x.t === 'p' && y.t === 'p' && x.key === y.key ? x.ord - y.ord : (x.ord - y.ord) * dir;
    };
  }
  function sorter() {
    var c = byDate(S.s === 'old' ? -1 : 1);
    if (S.s === 'gal') return function (x, y) { return x.t !== y.t ? (x.t === 'p' ? -1 : 1) : c(x, y); };
    if (S.s === 'art') return function (x, y) { return x.t !== y.t ? (x.t === 'a' ? -1 : 1) : c(x, y); };
    return c;
  }
  function matches(it) {
    return S.f === 'all' || (S.f === 'article' && it.t === 'a') || (S.f === 'photo' && it.t === 'p');
  }

  // Apply filter/highlight and update the caption and control state.
  function paint() {
    var vis = { a: 0, p: 0 };
    items.forEach(function (it) {
      var m = matches(it), e = it.el;
      if (S.m === 'filter') { e.hidden = !m; e.classList.remove('dim', 'hl'); }
      else { e.hidden = false; e.classList.toggle('dim', S.f !== 'all' && !m); e.classList.toggle('hl', S.f !== 'all' && m); }
      if (!e.hidden && it.more < 0) vis[it.t]++;
    });
    [].slice.call(stage.querySelectorAll('details.grp')).forEach(function (d) {
      d.hidden = !d.querySelector('.tile:not([hidden])');
    });
    var s;
    if (S.m === 'filter') s = 'Showing ' + plural(vis.a, 'article') + ', ' + plural(vis.p, 'photo');
    else if (S.f === 'all') s = 'Showing ' + plural(NA, 'article') + ', ' + plural(NP, 'photo') + ' (highlight: pick a type)';
    else s = 'Highlighting ' + (S.f === 'article' ? plural(NA, 'article') + '; ' + plural(NP, 'photo') + ' dimmed'
                                                  : plural(NP, 'photo') + '; ' + plural(NA, 'article') + ' dimmed');
    if (S.g && vis.p) s += ', grouped into ' + galleryList.length + (galleryList.length === 1 ? ' gallery' : ' galleries');
    if (cap.textContent !== s) cap.textContent = s;  // the caption is a live region: announce changes only
    sync();
  }

  function flow() { var d = document.createElement('div'); d.className = 'mas'; return d; }

  // Rebuild the wall in the current order, flat or grouped into <details> sections.
  function render() {
    var cmp = sorter();
    stage.textContent = '';
    if (!S.g) {
      var m = flow();
      items.slice().sort(cmp).forEach(function (it) { m.appendChild(it.el); });
      stage.appendChild(m);
    } else {
      var dir = S.s === 'old' ? -1 : 1, secs = [];
      galleryList.slice().sort(function (x, y) { return x.date === y.date ? (x.ord - y.ord) * dir : (x.date < y.date ? 1 : -1) * dir; })
        .forEach(function (g) {
          secs.push({
            k: g.key, title: g.name, extra: g.shown + ' · ' + plural(g.n, 'photo'),
            its: items.filter(function (i) { return i.t === 'p' && i.key === g.key; }).sort(cmp)
          });
        });
      if (NA) {
        var as = { k: '#articles', title: 'Articles', extra: plural(NA, 'article'),
                   its: items.filter(function (i) { return i.t === 'a'; }).sort(cmp) };
        if (S.s === 'art') secs.unshift(as); else secs.push(as);
      }
      secs.forEach(function (sc) {
        var d = document.createElement('details'), sm = document.createElement('summary'), x = document.createElement('span');
        d.className = 'grp'; d.open = openGroups[sc.k] !== false;
        d.addEventListener('toggle', function () { openGroups[sc.k] = d.open; });
        sm.appendChild(document.createTextNode(sc.title + ' · '));
        x.className = 'meta'; x.textContent = sc.extra; sm.appendChild(x);
        d.appendChild(sm);
        var m2 = flow();
        sc.its.forEach(function (it) { m2.appendChild(it.el); });
        d.appendChild(m2);
        stage.appendChild(d);
      });
    }
    paint();
  }

  // Reflect state in the chips, popover widgets, badge and Clear/Reset visibility.
  function sync() {
    qa('[data-f]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === S.f); });
    qa('[data-m2]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m2 === S.m); });
    qa('[data-role=sort]').forEach(function (x) { x.value = S.s; });
    qa('[data-role=grp]').forEach(function (c) { c.checked = S.g; c.parentNode.querySelector('.st').textContent = S.g ? 'On' : 'Off'; });
    var inPop = (S.m !== DEF.m) + (S.s !== DEF.s) + (S.g ? 1 : 0), any = inPop + (S.f !== DEF.f);
    qa('[data-badge=opts]').forEach(function (e) {
      e.hidden = !inPop;
      e.textContent = ' ' + inPop;  // the leading space keeps the name "View options 1 active" where flex items aren't spaced
      var v = document.createElement('span'); v.className = 'vh'; v.textContent = ' active'; e.appendChild(v);
    });
    qa('[data-role=clear],[data-role=reset]').forEach(function (e) { e.hidden = !any; });
  }

  // Chip counts come from the tiles on this page.
  qa('[data-f]').forEach(function (b) {
    b.querySelector('.n').textContent = b.dataset.f === 'all' ? NT : b.dataset.f === 'article' ? NA : NP;
  });

  // Popover: closes on Esc (focus returns to the button) and on outside click.
  function closePop(ret) {
    if (!pop.hidden) { pop.hidden = true; vb.setAttribute('aria-expanded', 'false'); if (ret) vb.focus(); }
  }
  function togglePop() {
    if (pop.hidden) {
      pop.hidden = false; vb.setAttribute('aria-expanded', 'true');
      (pop.querySelector('[aria-pressed=true]') || pop.querySelector('button, select, input')).focus();
    } else closePop();
  }
  // Close when keyboard focus leaves the popover and its button, so it can't cover the next focused element.
  ctl.addEventListener('focusout', function (e) {
    var to = e.relatedTarget;
    if (!pop.hidden && to && !pop.contains(to) && to !== vb) closePop();
  });

  document.addEventListener('click', function (e) {
    var t = e.target, c;
    if (!t.closest) return;
    // Any click outside the popover and its button closes it, including on a chip or Clear (#13).
    if (!pop.hidden && !t.closest('#pop') && !t.closest('#vb')) closePop();
    if ((c = t.closest('[data-f]')) && ctl.contains(c)) { S.f = c.dataset.f; stage.dataset.pv = 'all'; paint(); return; }
    if ((c = t.closest('[data-m2]')) && ctl.contains(c)) { S.m = c.dataset.m2; paint(); return; }
    if ((c = t.closest('[data-role=clear],[data-role=reset]'))) {
      // The button hides itself, so move focus: Clear to the "All" chip, Reset closes the popover and returns to its button.
      S.f = DEF.f; S.m = DEF.m; S.s = DEF.s; S.g = DEF.g; render();
      if (c.dataset.role === 'reset') closePop(true); else ctl.querySelector('[data-f=all]').focus();
      return;
    }
    if (t.closest('#vb')) { togglePop(); return; }
  });
  ctl.addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset.role === 'sort') { S.s = t.value; render(); }
    else if (t.dataset.role === 'grp') { S.g = t.checked; render(); }
  });
  // Capture phase and preventDefault, so the same Escape doesn't also close the nav menu (menu.js skips handled keys).
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !pop.hidden) { e.preventDefault(); closePop(true); }
  }, true);

  // Hovering a chip with a mouse previews the highlight (stage[data-pv] drives the CSS). Not on keyboard focus or touch,
  // where it would dim the wall while the reader is still moving through the controls.
  function pvOn(e) {
    if (e.pointerType !== 'mouse') return;
    var b = e.target.closest && e.target.closest('[data-f]');
    if (b && ctl.contains(b) && b.dataset.f !== 'all' && b.dataset.f !== S.f) stage.dataset.pv = b.dataset.f;
  }
  function pvOff(e) { if (e.target.closest && e.target.closest('[data-f]')) stage.dataset.pv = 'all'; }
  document.addEventListener('pointerover', pvOn);
  document.addEventListener('pointerout', pvOff);

  // The first render fills the live caption; keep it out of the live region so it isn't announced on page load (#13).
  cap.removeAttribute('aria-live');
  render();
  ctl.hidden = false;
  setTimeout(function () { cap.setAttribute('aria-live', 'polite'); }, 0);
})();
