// Click-to-load Disqus, replacing Hugo's internal template (#16). The "Show comments" button (comments.html) stays hidden
// until this runs; nothing from Disqus (or the trackers it brings) is requested before the reader clicks it.
// After the click, focus moves to the "Comments" heading and a polite status says what is happening: loading, loaded, or
// "couldn't be loaded" with the button back as "Try again" (#162). Disqus gives no error event for a blocked or failed
// embed.js except the script's own error, so a load that never reports ready is treated as failed after TIMEOUT.
(function () {
  var b = document.querySelector('.comments .showc');
  if (!b) return;
  var h = document.getElementById('comments-h'), st = document.getElementById('comments-status');
  var TIMEOUT = 15000, timer, script;
  b.hidden = false;

  function say(text) { if (st) st.textContent = text; }

  function fail() {
    clearTimeout(timer);
    if (script) { script.onerror = null; script.remove(); script = null; }
    say('Comments couldn’t be loaded. Check your connection or content blocker, then try again.');
    b.textContent = 'Try again';
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
        say('Comments loaded.');
      }];
    };
    // The button goes away while loading, so first put keyboard focus on the heading above the comments.
    if (h) { h.hidden = false; h.focus(); }
    b.hidden = true;
    say('Loading comments…');
    clearTimeout(timer);
    timer = setTimeout(fail, TIMEOUT);
    if (window.DISQUS) {  // an earlier try loaded embed.js but never reported ready: reload instead of adding it twice
      try { window.DISQUS.reset({ reload: true, config: window.disqus_config }); } catch (e) { fail(); }
      return;
    }
    script = document.createElement('script');
    script.async = true;
    script.src = 'https://' + d.shortname.replace(/^\/+/, '') + '.disqus.com/embed.js';  // tolerates a leading slash
    script.setAttribute('data-timestamp', String(+new Date()));
    script.onerror = fail;
    (document.head || document.body).appendChild(script);
  });
})();
