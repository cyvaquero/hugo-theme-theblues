// Page-body tables (#404). render-table.html writes every Markdown table in a focusable, labeled region (.tw), so a keyboard
// user can scroll a wide table (WCAG 2.1.1). A table that fits has nothing to scroll, and its region would be an empty Tab
// stop, so this script takes the tabindex off a region that doesn't overflow and puts it back when it does. Without script
// (or without ResizeObserver) every region keeps its tabindex. The region and its name stay either way. Loaded only on a page
// that has a Markdown table.
(function () {
  if (!window.ResizeObserver) return;
  function fit(box) {
    // A region with focus keeps its stop, so a resize doesn't drop the keyboard user's place.
    if (box.scrollWidth > box.clientWidth || document.activeElement === box) box.setAttribute('tabindex', '0');
    else box.removeAttribute('tabindex');
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
