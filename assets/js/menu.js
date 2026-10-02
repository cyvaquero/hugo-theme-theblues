// Toggles the small-screen nav dropdown. The links stay in the DOM and visible without JS above 820px.
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var links = document.getElementById('site-menu');
  if (!toggle || !links) return;
  function set(open) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  }
  toggle.addEventListener('click', function () { set(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();
