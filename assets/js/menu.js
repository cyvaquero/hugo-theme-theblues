// Hamburger nav at 820px and narrower. The links stay in the DOM and visible without JS from 821px up.
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
  // Growing past 820px shows the links inline, so drop the open state (#13).
  var wide = window.matchMedia('(min-width: 821px)');
  function onWide() { if (wide.matches && links.classList.contains('open')) set(false); }
  wide.addEventListener('change', onWide);
  links.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  // Close when keyboard focus leaves the nav (an open menu would otherwise cover what gets focus next).
  links.addEventListener('focusout', function (e) {
    if (links.classList.contains('open') && e.relatedTarget && !e.relatedTarget.closest('nav.site')) set(false);
  });
  document.addEventListener('click', function (e) {
    if (links.classList.contains('open') && !e.target.closest('nav.site')) set(false);
  });
  // Escape closes the menu and does nothing else: preventDefault marks it handled, so wall.js doesn't also hide a hovered
  // photo tile's caption (#227). This listener runs first, since menu.js loads before wall.js.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !e.defaultPrevented && links.classList.contains('open')) { e.preventDefault(); set(false, true); }
  });
})();
