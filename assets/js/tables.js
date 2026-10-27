// Page-body tables (#404). render-table.html writes every Markdown table in a focusable, labeled region (.tw), so a keyboard
// user can scroll a wide table (WCAG 2.1.1). A table that fits has nothing to scroll, and its region would be an empty Tab
// stop, and a page of small tables would list several identical "Table" landmarks, so this script takes the tabindex, the role
// and the name off a region that doesn't overflow (it is then a plain div) and puts all three back when it does (#410). Without
// script (or without ResizeObserver) every region keeps all three. Loaded only on a page that has a Markdown table.
(function () {
  if (!window.ResizeObserver) return;
  // The name is read once, before any region is stripped, since render-table.html writes it in the page's language.
  var names = new Map();
  function fit(box) {
    if (!names.has(box)) names.set(box, box.getAttribute('aria-label'));
    // A region with focus keeps its stop (and its role and name), so a resize doesn't drop the keyboard user's place.
    if (box.scrollWidth > box.clientWidth || document.activeElement === box) {
      box.setAttribute('tabindex', '0');
      box.setAttribute('role', 'region');
      if (names.get(box) !== null) box.setAttribute('aria-label', names.get(box));
    } else {
      box.removeAttribute('tabindex');
      box.removeAttribute('role');
      box.removeAttribute('aria-label');
    }
  }
  // The observer reports each element once when observing starts, then whenever its size changes: the region with the
  // window, the table with its content (late fonts and images, a translation tool). Both sizes decide whether it overflows.
  var ro = new ResizeObserver(function (entries) {
    entries.forEach(function (e) { fit(e.target.classList.contains('tw') ? e.target : e.target.parentNode); });
  });
  document.querySelectorAll('.tw').forEach(function (box) {
    ro.observe(box);
    if (box.firstElementChild) ro.observe(box.firstElementChild);
    // Blurring a region that lost its fit while focused: re-check then.
    box.addEventListener('blur', function () { fit(box); });
  });
})();
