// Google Analytics (GA4) loader, replacing Hugo's internal template (#16). head.html includes it only in production
// builds when the site sets services.googleAnalytics.id (passed as data-id). A visitor who sends Do Not Track or Global
// Privacy Control gets nothing: no gtag.js request and no hit. No inline script, so a site CSP needs no hash for it.
(function () {
  var me = document.currentScript, id = me && me.dataset.id;
  if (!id) return;
  var n = navigator, dnt = n.doNotTrack || window.doNotTrack || n.msDoNotTrack;
  if (dnt === '1' || dnt === 'yes' || n.globalPrivacyControl === true) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id);
  var g = document.createElement('script');
  g.async = true;
  g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(g);
})();
