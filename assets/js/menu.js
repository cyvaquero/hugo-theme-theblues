// Hamburger nav below 820px. The links stay in the DOM and visible without JS from 821px up.
(function () {
  var toggle = document.querySelector('nav.site .menu');
  var links = document.getElementById('site-menu');
  if (!toggle || !links) return;
  function set(open, returnFocus) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    if (!open && returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', function () { set(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', function (e) {
    if (links.classList.contains('open') && !e.target.closest('nav.site')) set(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('open')) set(false, true);
  });
})();
