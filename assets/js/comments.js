{{- /* theblues:template */ -}}
// Click-to-load Disqus, replacing Hugo's internal template (#16). The "Show comments" button (comments.html) stays hidden
// until this runs; nothing from Disqus (or the trackers it brings) is requested before the reader clicks it.
// After the click, focus moves to the "Comments" heading and a polite status says what is happening: loading, loaded, or
// "couldn't be loaded" with the button back as "Try again" (#162). Disqus gives no error event for a blocked or failed
// embed.js except the script's own error, so a load that never reports ready is treated as failed after TIMEOUT. A script
// that merely timed out is kept, since its request is still running: "Try again" waits for it, and adds a second one only
// after an error (#254).
// The text it writes is the site's language: Hugo fills it in when it builds this file (asset.html runs it as a template,
// js-text.html), from i18n/en.toml or the site's own file. Text the site's language lacks is the theme's English; the status and the
// button hold only that text, so they get lang="en" while it is there (TX.en lists the text, WCAG 3.1.2).
(function () {
  var b = document.querySelector('.comments .showc');
  if (!b) return;
  var h = document.getElementById('comments-h'), st = document.getElementById('comments-status');
  var TIMEOUT = 15000, timer, script;
  b.hidden = false;
  var TX = {{ partial "js-text.html" "comments" | jsonify }};

  // Sets an element's text to TX[key], with lang="en" on the element when that is the theme's English.
  function put(e, key) {
    if (TX.en.indexOf(key) >= 0) e.lang = 'en'; else e.removeAttribute('lang');
    e.textContent = TX[key];
  }
  function say(key) { if (st) put(st, key); }

  // drop: the script's request failed, so remove it and let the next try add a new one. After a timeout it stays, because
  // its request may still finish (embed.js would run twice if a second script were added next to it, #254).
  function fail(drop) {
    clearTimeout(timer);
    if (drop && script) { script.onerror = null; script.remove(); script = null; }
    say('failed');
    put(b, 'tryAgain');
    b.hidden = false;
  }

  b.addEventListener('click', function () {
    var d = b.dataset;
    window.disqus_config = function () {
      if (d.url) this.page.url = d.url;
      if (d.identifier) this.page.identifier = d.identifier;
      if (d.title) this.page.title = d.title;
      // Disqus calls this when the thread is on the page; it is the only success signal embed.js gives.
      this.callbacks.onReady = [function () {
        clearTimeout(timer);
        b.hidden = true;
        say('loaded');
      }];
    };
    // The button goes away while loading, so first put keyboard focus on the heading above the comments.
    if (h) { h.hidden = false; h.focus(); }
    b.hidden = true;
    say('loading');
    clearTimeout(timer);
    timer = setTimeout(function () { fail(false); }, TIMEOUT);
    if (window.DISQUS) {  // an earlier try loaded embed.js but never reported ready: reload instead of adding it twice
      try { window.DISQUS.reset({ reload: true, config: window.disqus_config }); } catch (e) { fail(false); }
      return;
    }
    if (script) return;  // the first request is still pending (it timed out but didn't fail): wait for it with a new timer
    script = document.createElement('script');
    script.async = true;
    script.src = 'https://' + d.shortname.replace(/^\/+/, '') + '.disqus.com/embed.js';  // tolerates a leading slash
    script.setAttribute('data-timestamp', String(+new Date()));
    script.onerror = function () { fail(true); };
    (document.head || document.body).appendChild(script);
  });
})();
