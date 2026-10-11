// Browse controls for the masonry wall (home, tag, category, series and section pages).
// Progressive enhancement: the wall is complete and sorted newest first without this file; the controls markup is
// hidden until this script runs. Behavior follows the final mockup (decision D12): type chips with counts, a
// "View options" popover (Mode, Sort, Group by gallery, Reset), a Clear button and a live caption.
// Tiles carry data-type (photo|article), data-gallery, data-gallery-title, data-n (photos in the gallery) and data-date.
// A tile's server order is its position in the DOM when this script starts: the tie-breaker for sorting.
// The type chips count the whole list, from #stage's data-articles and data-photos (article and photo tiles on every pager
// page, #7); the caption, groups and sorting work on the tiles on the current page (the wall is paginated by tile), and the
// caption starts "This page:" instead of "Showing" when the list has tiles on other pages. The "see all" tile of a gallery (data-more) is a
// link, not a photo: it is excluded from counts and the caption, but filters, highlights, sorts and groups like a photo
// tile and always stays last in its gallery.
// The text this script writes (captions, counts, the Articles group, On/Off) is the site's language: Hugo fills it in
// when it builds this file (asset.html runs it as a template, js-text.html), from i18n/en.toml or the site's own file.
(function () {
  var stage = document.getElementById('stage'), ctl = document.getElementById('ctl');
  if (!stage || !ctl) return;

  var TX = {{ partial "js-text.html" "wall" | jsonify }};
  // A count's text: TX holds its one and other forms with %d for the number, and the language's plural rule picks one.
  var PR; try { PR = new Intl.PluralRules(document.documentElement.lang || undefined); } catch (e) {}
  function plural(n, f) { return ((PR ? PR.select(n) : n === 1 ? 'one' : 'other') === 'one' ? f.one : f.other).replace('%d', n); }
  // A sentence with {articles} and {photos} marks for the two counts.
  function fill(s, a, p) { return s.replace('{articles}', a).replace('{photos}', p); }

  // Collect the tiles the server rendered; ord is a tile's position in the server's order (newest first).
  var items = [], galleries = {}, galleryList = [];
  [].slice.call(stage.querySelectorAll('.tile')).forEach(function (el, idx) {
    var d = el.dataset, it = {
      t: d.type === 'article' ? 'a' : 'p', date: d.date || '', ord: idx,
      key: d.gallery || '', name: d.galleryTitle || '', el: el,
      more: d.more !== undefined ? (+d.more || 0) : -1  // see-all link tile: not a photo, never counted
    };
    items.push(it);
    if (it.t === 'p') {
      var g = galleries[it.key];
      if (!g) {
        var cap = el.querySelector('figcaption .meta');
        // The heading counts the whole gallery from data-n, also when part of it is on another pager page (#7).
        // Group headings show a gallery's date as its tiles' captions do (date.html, which follows params.dateFormat and the
        // site's language); a custom wall without captions has no date text to show.
        g = galleries[it.key] = { key: it.key, name: it.name, date: it.date, shown: cap ? cap.textContent : '', ord: it.ord, n: +d.n || 0 };
        galleryList.push(g);
      }
    }
  });
  var NA = items.filter(function (i) { return i.t === 'a'; }).length;
  var NP = items.filter(function (i) { return i.t === 'p' && i.more < 0; }).length;
  // Whole-list counts from the build; a wall without them (an older or custom wall.html) counts this page.
  function total(v, here) { return v !== undefined && v !== '' && !isNaN(+v) ? +v : here; }
  var TA = total(stage.dataset.articles, NA), TP = total(stage.dataset.photos, NP);
  // The caption says "This page:" when the list has more than one pager page. The page count comes from the build
  // (data-pages); counting tiles can't tell, because a see-all tile on page 2 is in no count (#167). A wall without it
  // (an older or custom wall.html) falls back to comparing the counts.
  var PG = stage.dataset.pages;
  var paged = PG !== undefined && PG !== '' && !isNaN(+PG) ? +PG > 1 : TA + TP !== NA + NP;

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
    if (S.m === 'filter') s = fill(paged ? TX.showingPage : TX.showing, plural(vis.a, TX.articleCount), plural(vis.p, TX.photoCount));
    else if (S.f === 'all') s = fill(paged ? TX.pickPage : TX.pick, plural(NA, TX.articleCount), plural(NP, TX.photoCount));
    else s = fill(S.f === 'article' ? (paged ? TX.highlightArticlesPage : TX.highlightArticles) : (paged ? TX.highlightPhotosPage : TX.highlightPhotos),
                  plural(NA, TX.articleCount), plural(NP, TX.photoCount));
    if (S.g && vis.p) s += ', ' + plural(galleryList.length, TX.grouped);
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
            k: g.key, title: g.name, extra: (g.shown ? g.shown + ' · ' : '') + plural(g.n, TX.photoCount),
            its: items.filter(function (i) { return i.t === 'p' && i.key === g.key; }).sort(cmp)
          });
        });
      if (NA) {
        var as = { k: '#articles', title: TX.articles, extra: plural(NA, TX.articleCount),
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
    qa('[data-role=grp]').forEach(function (c) { c.checked = S.g; c.parentNode.querySelector('.st').textContent = S.g ? TX.on : TX.off; });
    var inPop = (S.m !== DEF.m) + (S.s !== DEF.s) + (S.g ? 1 : 0), any = inPop + (S.f !== DEF.f);
    qa('[data-badge=opts]').forEach(function (e) {
      e.hidden = !inPop;
      e.textContent = ' ' + inPop;  // the leading space keeps the name "View options 1 active" where flex items aren't spaced
      var v = document.createElement('span'); v.className = 'vh'; v.textContent = ' ' + TX.active; e.appendChild(v);
    });
    qa('[data-role=clear],[data-role=reset]').forEach(function (e) { e.hidden = !any; });
  }

  // Chip counts are the whole list's.
  qa('[data-f]').forEach(function (b) {
    b.querySelector('.n').textContent = b.dataset.f === 'all' ? TA + TP : b.dataset.f === 'article' ? TA : TP;
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
