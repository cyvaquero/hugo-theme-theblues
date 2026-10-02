// Native <dialog> lightbox for .gallery grids (provisional, see decision D7).
(function () {
  var dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Image viewer');
  dlg.innerHTML = '<div class="lb-inner"><img alt=""><div class="lb-bar">' +
    '<button type="button" data-a="prev">Previous</button><span class="lb-cap"></span>' +
    '<button type="button" data-a="next">Next</button><button type="button" data-a="close">Close</button></div></div>';
  document.body.appendChild(dlg);
  var img = dlg.querySelector('img'), cap = dlg.querySelector('.lb-cap'), items = [], i = 0;
  function show(n) {
    i = (n + items.length) % items.length;
    img.src = items[i].href; img.alt = items[i].textContent.trim(); cap.textContent = img.alt;
  }
  document.querySelectorAll('.gallery').forEach(function (g) {
    g.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      e.preventDefault();
      items = Array.prototype.slice.call(g.querySelectorAll('a'));
      show(items.indexOf(a)); dlg.showModal();
    });
  });
  dlg.addEventListener('click', function (e) {
    var a = e.target.dataset && e.target.dataset.a;
    if (a === 'next') show(i + 1); else if (a === 'prev') show(i - 1);
    else if (a === 'close' || e.target === dlg) dlg.close();
  });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(i + 1); else if (e.key === 'ArrowLeft') show(i - 1);
  });
})();
