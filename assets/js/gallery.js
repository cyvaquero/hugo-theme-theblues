// Native <dialog> lightbox for the masonry galleries (.gal) on photo posts (decision D7).
// Previous/next buttons, arrow keys, counter, Esc to close, focus returns to the photo that was opened.
// Each link points at the large image (X3); the thumbnail in the page stays X2.
(function () {
  var galleries = document.querySelectorAll('.gal');
  if (!galleries.length || typeof HTMLDialogElement === 'undefined') return;

  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.setAttribute('aria-label', 'Photo viewer');
  dlg.innerHTML = '<div class="in"><img alt="">' +
    '<div class="bb"><button type="button" data-a="p" aria-label="Previous photo">Previous</button>' +
    '<span class="count" aria-live="polite"></span>' +
    '<button type="button" data-a="n" aria-label="Next photo">Next</button>' +
    '<button type="button" data-a="c" aria-label="Close photo viewer">Close</button></div></div>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('img'), count = dlg.querySelector('.count');
  var list = [], idx = 0, opener = null;

  function show(n) {
    idx = (n + list.length) % list.length;
    var a = list[idx], thumb = a.querySelector('img');
    img.onerror = function () { img.onerror = null; if (thumb) img.src = thumb.src; };
    img.src = a.href;
    img.alt = thumb ? thumb.alt : '';
    count.textContent = (idx + 1) + ' / ' + list.length;
  }

  galleries.forEach(function (g) {
    g.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || !g.contains(a)) return;
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // keep open-in-new-tab working
      e.preventDefault();
      list = [].slice.call(g.querySelectorAll('a'));
      opener = a;
      show(list.indexOf(a));
      dlg.showModal();
      dlg.querySelector('[data-a="c"]').focus();
    });
  });

  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  dlg.addEventListener('click', function (e) {
    var a = e.target.dataset && e.target.dataset.a;
    if (a === 'n') show(idx + 1);
    else if (a === 'p') show(idx - 1);
    else if (a === 'c' || e.target === dlg || e.target.classList.contains('in') || e.target.classList.contains('bb')) dlg.close();
  });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
  });
})();
