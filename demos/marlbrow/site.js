/* Demo site behaviour. Everything runs in the browser: nothing is sent or saved anywhere. */
(function () {
  var d = document, h = d.documentElement;
  var reduce = h.classList.contains('rm');
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* Header: solid once you scroll. Phone contact bar: hidden while scrolling down, back when scrolling up. */
  var hdr = d.getElementById('hdr'), mbar = d.getElementById('mbar'), lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('is-scrolled', y > 24);
    if (mbar) {
      var nearEnd = y + window.innerHeight > d.documentElement.scrollHeight - 80;
      if (y < window.innerHeight * 0.5) h.classList.remove('mbar-on');
      else if (y < lastY - 4 || nearEnd) h.classList.add('mbar-on');
      else if (y > lastY + 4) h.classList.remove('mbar-on');
    }
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  var burger = d.getElementById('burger'), mnav = d.getElementById('mnav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open); h.classList.toggle('menu-open', open);
    burger.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* Gentle reveal on scroll (off for reduce motion) */
  var rv = $$('[data-rv]');
  if (!reduce && 'IntersectionObserver' in window) {
    h.classList.add('rv-on');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* Before and after: drag (or use the arrow keys) to move the line */
  $$('[data-ba]').forEach(function (fig) {
    var media = fig.querySelector('.ba__media'), range = fig.querySelector('.ba__range');
    if (!media || !range) return;
    range.style.pointerEvents = 'none';
    function set(p) {
      p = Math.max(0, Math.min(100, p));
      media.style.setProperty('--p', p + '%');
      range.value = Math.round(p);
      range.setAttribute('aria-valuetext', Math.round(p) + ' percent before');
    }
    function fromX(x) { var r = media.getBoundingClientRect(); return (x - r.left) / r.width * 100; }
    var dragging = false, startX = 0, startY = 0, decided = false;
    media.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') { dragging = true; decided = true; set(fromX(e.clientX)); media.setPointerCapture(e.pointerId); e.preventDefault(); return; }
      dragging = true; decided = false; startX = e.clientX; startY = e.clientY;
    });
    media.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (!decided) {
        var dx = Math.abs(e.clientX - startX), dy = Math.abs(e.clientY - startY);
        if (dx < 6 && dy < 6) return;
        decided = true;
        if (dy > dx) { dragging = false; return; } /* a vertical swipe: let the page scroll */
        try { media.setPointerCapture(e.pointerId); } catch (err) {}
      }
      set(fromX(e.clientX));
    });
    function end(e) {
      if (dragging && !decided && e.type === 'pointerup') set(fromX(e.clientX)); /* a tap jumps the line there */
      dragging = false;
    }
    media.addEventListener('pointerup', end);
    media.addEventListener('pointercancel', end);
    range.addEventListener('input', function () { set(+range.value); });
    media.addEventListener('click', function () { range.focus({ preventScroll: true }); });
    set(50);
  });

  /* Sample Google profile buttons: they only reveal a note */
  $$('[data-gprofile]').forEach(function (b) {
    b.addEventListener('click', function () {
      var note = d.getElementById(b.getAttribute('aria-controls')); if (!note) return;
      var open = note.hidden; note.hidden = !open;
      $$('[aria-controls="' + note.id + '"]').forEach(function (x) { x.setAttribute('aria-expanded', open); });
    });
  });

  /* Quote form: checks, then a thank you. Nothing is sent. */
  $$('form[data-demo-form]').forEach(function (f) {
    var card = f.parentNode, thanks = card.querySelector('[data-thanks]');
    var file = f.querySelector('input[type=file]'), note = f.querySelector('[data-files-note]');
    if (file && note) file.addEventListener('change', function () {
      var n = (file.files || []).length;
      note.textContent = n ? n + (n === 1 ? ' photo' : ' photos') + ' chosen. In this demo they stay on your device and are never uploaded.' : '';
    });
    var checks = {
      job: function () { return !!f.querySelector('input[name=job]:checked'); },
      postcode: function () { return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(f.postcode.value.trim()); },
      name: function () { return f.name.value.trim().length >= 2; },
      desc: function () { return f.desc.value.trim().length >= 5; },
      phone: function () { return f.phone.value.replace(/[^\d]/g, '').length >= 10; },
      email: function () { var v = f.email.value.trim(); return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    };
    function check(k) {
      var ok = checks[k](), err = f.querySelector('[data-err="' + k + '"]');
      if (err) err.hidden = ok;
      var el = k === 'job' ? null : f.elements[k];
      if (el) el.setAttribute('aria-invalid', !ok);
      return ok;
    }
    Object.keys(checks).forEach(function (k) {
      var el = k === 'job' ? null : f.elements[k];
      if (el) el.addEventListener('blur', function () { if (el.value) check(k); });
    });
    f.addEventListener('change', function (e) { if (e.target.name === 'job') check('job'); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      Object.keys(checks).forEach(function (k) { if (!check(k) && !first) first = k; });
      if (first) {
        var el = first === 'job' ? f.querySelector('input[name=job]') : f.elements[first];
        if (el) el.focus();
        return;
      }
      var nm = f.name.value.trim().split(/\s+/)[0];
      thanks.querySelector('[data-thanks-name]').textContent = nm ? ', ' + nm : '';
      f.hidden = true; thanks.hidden = false; thanks.focus();
    });
    var again = thanks && thanks.querySelector('[data-again]');
    if (again) again.addEventListener('click', function () { f.reset(); if (note) note.textContent = ''; thanks.hidden = true; f.hidden = false; f.querySelector('input').focus(); });
  });
})();
