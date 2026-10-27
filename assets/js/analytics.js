// Google Analytics (GA4) loader, replacing Hugo's internal template (#16). head.html includes it only in production
// builds when the site sets services.googleAnalytics.id (passed as data-id). A visitor who sends Do Not Track or Global
// Privacy Control gets nothing: no gtag.js request and no hit. No inline script, so a site CSP needs no hash for it.
// The search page keeps the visitor's query in the address (?q=), so the page location sent to Google, and the referrer
// when it is a page of this site, are sent without that parameter (#406).
(function () {
  var me = document.currentScript, id = me && me.dataset.id;
  if (!id) return;
  var n = navigator, dnt = n.doNotTrack || window.doNotTrack || n.msDoNotTrack;
  if (dnt === '1' || dnt === 'yes' || n.globalPrivacyControl === true) return;
  // url without its q parameter (and, for the page itself, without the fragment, which gtag.js leaves out too); another
  // site's address is passed as it is, since its query is not the visitor's search here.
  function clean(url, self) {
    try {
      var u = new URL(url);
      if (!self && u.origin !== location.origin) return url;
      u.searchParams.delete('q');
      if (self) u.hash = '';
      return u.href;
    } catch (e) { return self ? location.origin + location.pathname : ''; }
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  var p = { page_location: clean(location.href, true) }, r = document.referrer;
  if (r) p.page_referrer = clean(r, false);
  window.gtag('set', p);
  window.gtag('config', id, p);
  var g = document.createElement('script');
  g.async = true;
  g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(g);
})();
