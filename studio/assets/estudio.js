// Solo el botón de tema; el <head> ya fijó data-theme para evitar el parpadeo.
(function () {
  var raiz = document.documentElement;
  var boton = document.getElementById('theme');
  if (!boton) return;
  var marcar = function () { boton.setAttribute('aria-pressed', raiz.dataset.theme === 'dark'); };
  marcar();
  boton.addEventListener('click', function () {
    raiz.dataset.theme = raiz.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', raiz.dataset.theme); } catch (e) { /* modo privado */ }
    marcar();
  });
})();
