// Mejora progresiva: todo el contenido ya está en el HTML. Si este archivo no carga, nada se oculta.
(function () {
  var raiz = document.documentElement;
  var sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tema claro/oscuro. El <head> ya fijó data-theme para evitar el parpadeo.
  var boton = document.getElementById('theme');
  if (boton) {
    var marcar = function () { boton.setAttribute('aria-pressed', raiz.dataset.theme === 'dark'); };
    marcar();
    boton.addEventListener('click', function () {
      raiz.dataset.theme = raiz.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('theme', raiz.dataset.theme); } catch (e) { /* modo privado */ }
      marcar();
    });
  }

  // Carrusel: flechas además del deslizamiento.
  document.querySelectorAll('.carousel').forEach(function (car) {
    var lista = car.querySelector('.cards');
    var nav = document.createElement('div');
    nav.className = 'car-nav';
    var crear = function (texto, etiqueta, dir) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = texto; b.setAttribute('aria-label', etiqueta);
      b.addEventListener('click', function () {
        var tarjeta = lista.querySelector('.card');
        lista.scrollBy({ left: dir * (tarjeta ? tarjeta.offsetWidth + 11 : 260), behavior: sinMovimiento ? 'auto' : 'smooth' });
      });
      nav.appendChild(b);
      return b;
    };
    var ant = crear('‹', car.dataset.prev, -1);
    var sig = crear('›', car.dataset.next, 1);
    var actualizar = function () {
      ant.disabled = lista.scrollLeft < 4;
      sig.disabled = lista.scrollLeft + lista.clientWidth > lista.scrollWidth - 4;
    };
    lista.addEventListener('scroll', actualizar, { passive: true });
    addEventListener('resize', actualizar);
    car.appendChild(nav);
    actualizar();
  });

  if (sinMovimiento) return;

  // Presentación: los primeros mensajes llegan uno por uno, con "escribiendo…". Solo una vez por sesión.
  var intro = Array.prototype.slice.call(document.querySelectorAll('[data-intro]'));
  var visto = false;
  try { visto = sessionStorage.getItem('intro') === '1'; sessionStorage.setItem('intro', '1'); } catch (e) { /* sin storage */ }
  if (intro.length && !visto) {
    intro.forEach(function (el) { el.classList.add('pending'); });
    var escribiendo = document.createElement('div');
    escribiendo.className = 'typing';
    escribiendo.setAttribute('aria-hidden', 'true');
    escribiendo.innerHTML = '<i></i><i></i><i></i>';
    var i = 0;
    var siguiente = function () {
      if (i >= intro.length) { escribiendo.remove(); return; }
      var el = intro[i++];
      var esMensaje = el.classList.contains('msg') && el.classList.contains('in');
      if (esMensaje) el.parentNode.insertBefore(escribiendo, el);
      setTimeout(function () {
        el.classList.remove('pending');
        if (esMensaje) escribiendo.remove();
        siguiente();
      }, esMensaje ? 650 : 200);
    };
    siguiente();
  }

  // Lo que empieza fuera de pantalla aparece al llegar a ella. Lo ya visible nunca se oculta,
  // así el contenido no depende de que el observador llegue a dispararse.
  if (!('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('shown'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll(".thread .msg:not([data-intro]), .thread .quick:not([data-intro])").forEach(function (el) {
    if (el.getBoundingClientRect().top < innerHeight) return;
    el.classList.add('fade');
    obs.observe(el);
  });
})();
