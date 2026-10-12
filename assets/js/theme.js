// Color theme switch (#22): System (the default, follows prefers-color-scheme), Light or Dark. Loaded in <head> without
// defer, so a picked mode is on <html> as data-theme before the first paint; main.css applies the dark tokens for
// data-theme="dark", or for a dark system setting unless data-theme="light". The choice is kept in localStorage; where
// storage is blocked the switch still works for the current page.
(function () {
  var KEY = 'theme', root = document.documentElement;
  // Marks the page as running JavaScript, so main.css keeps the space of the controls that scripts show later (the theme
  // switch, the wall controls); without JavaScript there is no mark and they collapse (#274).
  root.classList.add('js');
  var scheme = document.querySelector('meta[name="color-scheme"]');
  var colors = document.querySelectorAll('meta[name="theme-color"]');
  // The browser-UI color for each mode, from the media-query metas in head.html.
  var tc = {};
  colors.forEach(function (m) {
    m.setAttribute('data-c', m.content);
    var k = /dark/.test(m.media) ? 'dark' : /light/.test(m.media) ? 'light' : '';
    if (k) tc[k] = m.content;
  });

  function stored() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system'; } catch (e) { return 'system'; }
  }

  function apply(mode) {
    if (mode === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', mode);
    if (scheme) scheme.content = mode === 'system' ? 'light dark' : mode;
    // A picked mode sets both theme-color metas to its color; System puts back each meta's own.
    colors.forEach(function (m) { m.content = mode === 'system' ? m.getAttribute('data-c') : (tc[mode] || m.getAttribute('data-c')); });
    document.querySelectorAll('.thm button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode));
    });
  }

  // Disqus picks its light or dark look from the page colors when it loads, so reload loaded comments after a change.
  function refreshComments() {
    if (window.DISQUS && document.querySelector('#disqus_thread iframe')) {
      try { window.DISQUS.reset({ reload: true, config: window.disqus_config }); } catch (e) {}
    }
  }

  apply(stored());

  function init() {
    var li = document.querySelector('nav.site li.theme');
    if (!li) return;
    apply(stored());
    li.hidden = false;
    li.addEventListener('click', function (e) {
      var b = e.target.closest('.thm button');
      if (!b) return;
      var mode = b.getAttribute('data-mode');
      try { if (mode === 'system') localStorage.removeItem(KEY); else localStorage.setItem(KEY, mode); } catch (err) {}
      apply(mode);
      refreshComments();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // Keep other open tabs of the site in step.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY || e.key === null) { apply(stored()); refreshComments(); }
  });
})();
