// Click-to-load Disqus, replacing Hugo's internal template (#16). The "Show comments" button (comments.html) stays hidden
// until this runs; nothing from Disqus (or the trackers it brings) is requested before the reader clicks it.
(function () {
  var b = document.querySelector('.comments .showc');
  if (!b) return;
  b.hidden = false;
  b.addEventListener('click', function () {
    var d = b.dataset, t = document.getElementById('disqus_thread');
    window.disqus_config = function () {
      if (d.url) this.page.url = d.url;
      if (d.identifier) this.page.identifier = d.identifier;
      if (d.title) this.page.title = d.title;
    };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://' + d.shortname.replace(/^\/+/, '') + '.disqus.com/embed.js';  // tolerates a leading slash
    s.setAttribute('data-timestamp', String(+new Date()));
    (document.head || document.body).appendChild(s);
    // The button goes away; keep keyboard focus where the comments appear.
    t.setAttribute('tabindex', '-1');
    b.remove();
    t.focus();
  }, { once: true });
})();
