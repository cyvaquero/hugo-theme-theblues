{{- /* theblues:template */ -}}
// Client-side search (#159). The page (layouts/_partials/search-box.html) holds the form, a status line and an empty
// results list, all hidden. This script fetches the site's search index (/search/index.json, made by the build from
// layouts/search/section.searchindex.json), searches it in the browser and fills the list in. Nothing is sent anywhere.
//
// The index is fetched on first use: when the field gets focus, or at once when the address has ?q=. Only the same-origin
// address in data-index is fetched, and an index whose "v" isn't 1 (a layout this script doesn't know) is refused.
// Each row is [title, url, date, section, tags, categories, series, description, photoTitles, text].
//
// The matcher folds case and accents (Unicode NFD, marks removed), splits words at anything that isn't a letter or digit,
// and scores a page by where the words are found: title 10, tags/categories/series 6, description 4, photo titles 3, text 1
// (a little more for repeats in the text). It tries three passes and stops at the first that finds a page:
//   1. every word of the query matches a word of the page, exactly or as its start ("bost" finds "Boston");
//   2. the same, allowing one typo (an extra, missing, wrong or swapped letter) in query words of 4 letters or more;
//   3. any word of the query (matched as in pass 2), the pages with the most words first.
// Results are built with createElement and textContent only: nothing from the index is ever parsed as HTML.
// The text it writes is the site's language: Hugo fills it in when it builds this file (asset.html runs it as a template,
// js-text.html), from i18n/en.toml or the site's own file.
(function () {
  var root = document.getElementById('search');
  var ui = root && root.querySelector('.sui');
  var form = ui && ui.querySelector('form');
  if (!form || !root.getAttribute('data-index')) return;
  var input = form.elements.q, status = ui.querySelector('.sst'), box = ui.querySelector('.sres');
  var list = box.querySelector('ol'), off = root.querySelector('.soff');
  var TX = {{ partial "js-text.html" "search" | jsonify }};
  var WEIGHT = { title: 10, terms: 6, desc: 4, photos: 3, text: 1 };
  var MAX = 50;          // results shown; the status says when there are more
  var TOKEN = /[\p{L}\p{N}]+/gu;
  var index, pending, seq = 0, timer, stimer, statusDue = false, last = null;
  var lang = document.documentElement.lang || undefined;

  var plural, dates;
  try { plural = new Intl.PluralRules(lang); } catch (e) {}
  try { dates = new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeZone: 'UTC' }); } catch (e) {}

  function fold(s) { return s.toLowerCase().normalize('NFD').replace(/\p{M}+/gu, ''); }
  function str(x) { return typeof x === 'string' ? x : ''; }
  function strs(x) { return Array.isArray(x) ? x.filter(function (v) { return typeof v === 'string'; }) : []; }

  // True if a and b differ by at most one inserted, missing, wrong or swapped letter.
  function near(a, b) {
    var la = a.length, lb = b.length, i = 0;
    if (Math.abs(la - lb) > 1) return false;
    while (i < la && i < lb && a.charAt(i) === b.charAt(i)) i++;
    if (la === lb) {
      return a.slice(i + 1) === b.slice(i + 1) ||
        (a.charAt(i) === b.charAt(i + 1) && a.charAt(i + 1) === b.charAt(i) && a.slice(i + 2) === b.slice(i + 2));
    }
    return la > lb ? a.slice(i + 1) === b.slice(i) : b.slice(i + 1) === a.slice(i);
  }

  // The index in memory: the pages, and for every word the pages it is in as flat triples [page, best weight, count].
  function build(data) {
    if (!data || data.v !== 1 || !Array.isArray(data.p)) throw new Error('index format');
    var docs = [], post = new Map();
    data.p.forEach(function (r) {
      if (!Array.isArray(r) || r.length < 10) return;
      var u;
      try { u = new URL(str(r[1]), location.href); } catch (e) { return; }
      if (u.origin !== location.origin) return;  // a result links to this site only
      var d = { title: str(r[0]), url: u.href, date: str(r[2]), section: str(r[3]), desc: str(r[7]), text: str(r[9]) };
      var n = docs.push(d) - 1;
      function add(text, weight) {
        var words = fold(text).match(TOKEN);
        if (!words) return;
        words.forEach(function (w) {
          if (w.length > 64) return;
          var p = post.get(w);
          if (!p) post.set(w, [n, weight, 1]);
          else if (p[p.length - 3] === n) { if (weight > p[p.length - 2]) p[p.length - 2] = weight; p[p.length - 1]++; }
          else p.push(n, weight, 1);
        });
      }
      add(d.title, WEIGHT.title);
      add(strs(r[4]).concat(strs(r[5]), strs(r[6])).join(' '), WEIGHT.terms);
      add(d.desc, WEIGHT.desc);
      add(strs(r[8]).join(' '), WEIGHT.photos);
      add(d.text, WEIGHT.text);
    });
    return { docs: docs, post: post, vocab: Array.from(post.keys()) };
  }

  function load() {
    if (index) return Promise.resolve(index);
    if (pending) return pending;
    var u;
    try { u = new URL(root.getAttribute('data-index'), location.href); } catch (e) { return Promise.reject(e); }
    if (u.origin !== location.origin) return Promise.reject(new Error('origin'));
    var slow = setTimeout(function () { say(TX.loading); }, 400);
    pending = fetch(u.href, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) { index = build(data); return index; });
    function done() { clearTimeout(slow); pending = null; }
    pending.then(done, done);
    return pending;
  }

  // One pass over the vocabulary for each word: which pages have a word that matches it, and how well. mode 1 is exact
  // or start of a word, 2 and 3 also one typo.
  function pass(words, mode) {
    var per = words.map(function (w) {
      var m = new Map(), typo = mode > 1 && w.length >= 4;
      index.vocab.forEach(function (t) {
        var f = t === w ? 1 : t.indexOf(w) === 0 ? 0.8 : typo && near(w, t) ? 0.5 : 0;
        if (!f) return;
        var p = index.post.get(t);
        for (var i = 0; i < p.length; i += 3) {
          var s = f * (p[i + 1] + Math.min(p[i + 2], 10) * 0.1);
          if (s > (m.get(p[i]) || 0)) m.set(p[i], s);
        }
      });
      return m;
    });
    var score = new Map(), count = new Map(), hits = [];
    per.forEach(function (m) {
      m.forEach(function (s, d) { score.set(d, (score.get(d) || 0) + s); count.set(d, (count.get(d) || 0) + 1); });
    });
    score.forEach(function (s, d) {
      if (mode < 3 && count.get(d) !== words.length) return;
      hits.push({ d: d, s: s, n: count.get(d) });
    });
    hits.sort(function (a, b) {
      var x = index.docs[a.d].date, y = index.docs[b.d].date;
      return b.n - a.n || b.s - a.s || (x < y ? 1 : x > y ? -1 : 0) || a.d - b.d;
    });
    return hits;
  }

  function queryWords(q) {
    var seen = {}, out = [];
    (fold(q).match(TOKEN) || []).forEach(function (w) {
      w = w.slice(0, 64);
      if (!seen[w] && out.length < 10) { seen[w] = out.push(w); }
    });
    return out;
  }

  function search(words) {
    for (var mode = 1; mode <= 3; mode++) {
      var hits = pass(words, mode);
      if (hits.length) return { hits: hits, words: words, mode: mode };
    }
    return { hits: [], words: words, mode: 3 };
  }

  // Does this folded word of a page's text match the query, as the pass that found the page matched it?
  function isHit(t, r) {
    return r.words.some(function (w) { return t.indexOf(w) === 0 || (r.mode > 1 && w.length >= 4 && near(w, t)); });
  }

  // text into node, with the words that match the query in <mark> (text nodes and createElement only).
  function mark(node, text, r) {
    var re = new RegExp(TOKEN), at = 0, m;
    while ((m = re.exec(text))) {
      if (!isHit(fold(m[0]), r)) continue;
      if (m.index > at) node.appendChild(document.createTextNode(text.slice(at, m.index)));
      var k = document.createElement('mark');
      k.textContent = m[0];
      node.appendChild(k);
      at = m.index + m[0].length;
    }
    if (at < text.length) node.appendChild(document.createTextNode(text.slice(at)));
  }

  function firstHit(text, r) {
    var re = new RegExp(TOKEN), m;
    while ((m = re.exec(text))) if (isHit(fold(m[0]), r)) return m.index;
    return -1;
  }

  // About 160 characters of text around position i, cut at spaces, with an ellipsis where text was left out.
  function around(text, i) {
    var start = Math.max(0, i - 50), end, sp;
    if (start > 0) { sp = text.indexOf(' ', start); if (sp >= 0 && sp < i) start = sp + 1; }
    end = Math.min(text.length, start + 160);
    if (end < text.length) { sp = text.lastIndexOf(' ', end); if (sp > i) end = sp; }
    return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  }

  function snippet(d, r) {
    var i = firstHit(d.desc, r);
    if (i >= 0) return around(d.desc, i);
    i = firstHit(d.text, r);
    if (i >= 0) return around(d.text, i);
    return around(d.desc || d.text, 0);
  }

  function meta(d) {
    var date = '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(d.date)) {
      try { date = dates ? dates.format(new Date(d.date + 'T00:00:00Z')) : d.date; } catch (e) { date = d.date; }
    }
    return [date, d.section].filter(Boolean).join(' · ');
  }

  function render(r) {
    list.textContent = '';
    r.hits.slice(0, MAX).forEach(function (h) {
      var d = index.docs[h.d], li = document.createElement('li'), a = document.createElement('a'), p;
      a.href = d.url;
      mark(a, d.title || d.url, r);
      li.appendChild(a);
      var m = meta(d);
      if (m) { p = document.createElement('p'); p.className = 'meta'; p.textContent = m; li.appendChild(p); }
      var s = snippet(d, r);
      if (s) { p = document.createElement('p'); p.className = 'sn'; mark(p, s, r); li.appendChild(p); }
      list.appendChild(li);
    });
    box.hidden = !r.hits.length;
  }

  function clear() { list.textContent = ''; box.hidden = true; }
  function say(text) { status.textContent = text; }

  function summary() {
    var n = last.r.hits.length, q = input.value.trim();
    if (!n) return TX.noResults.replace('{query}', function () { return q; });
    var text = TX.count[plural && plural.select(n) === 'one' ? 'one' : 'other'].replace('%d', n);
    return n > MAX ? text + ' ' + TX.capped.replace('{n}', MAX) : text;
  }

  // Keep the query in the address (?q=), so a result can be shared or come back to with Back; no history entry is added.
  function sync(q) {
    try {
      var u = new URL(location.href);
      if (q) u.searchParams.set('q', q); else u.searchParams.delete('q');
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  // Show the results for what is in the field. now: say the count at once (Enter, or a ?q= on load); otherwise the
  // count is said once typing has paused, so a screen reader isn't read a new count for every key.
  function update(now) {
    var q = input.value.trim(), mine = ++seq, words = queryWords(q);
    sync(q);
    if (!words.length) { clear(); last = null; say(''); return; }
    function go() {
      if (mine !== seq) return;
      last = { r: search(words) };
      render(last.r);
      if (now || statusDue) say(summary());
    }
    if (index) go();
    else load().then(go, function () { if (mine === seq) { clear(); last = null; say(TX.failed); } });
  }

  input.addEventListener('input', function () {
    clearTimeout(timer);
    clearTimeout(stimer);
    statusDue = false;
    timer = setTimeout(function () { update(false); }, 120);
    stimer = setTimeout(function () { statusDue = true; if (last) say(summary()); }, 700);
  });
  input.addEventListener('focus', function () { load().catch(function () {}); }, { once: true });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearTimeout(timer);
    clearTimeout(stimer);
    update(true);
  });

  if (off) off.hidden = true;
  ui.hidden = false;
  var q0 = new URLSearchParams(location.search).get('q');
  if (q0 && q0.trim()) { input.value = q0.slice(0, 200); update(true); }
})();
