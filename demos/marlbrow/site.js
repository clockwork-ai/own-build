/* Demo site behaviour. Everything runs in the browser: nothing is sent or saved anywhere. */
(function () {
  var d = document, h = d.documentElement;
  var reduce = h.classList.contains('rm');
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* Header shadow on scroll, mobile menu */
  var hdr = d.getElementById('hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 16); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = d.getElementById('burger'), mnav = d.getElementById('mnav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open); h.classList.toggle('menu-open', open);
    burger.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  }

  /* Gentle reveal on scroll (off for reduce motion) */
  var rv = $$('[data-rv]');
  if (!reduce && 'IntersectionObserver' in window) {
    h.classList.add('rv-on');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* Sample Google profile buttons: they only reveal a note */
  $$('[data-gprofile]').forEach(function (b) {
    b.addEventListener('click', function () {
      var note = d.getElementById(b.getAttribute('aria-controls')); if (!note) return;
      var open = note.hidden; note.hidden = !open;
      $$('[aria-controls="' + note.id + '"]').forEach(function (x) { x.setAttribute('aria-expanded', open); });
    });
  });

  /* Our work: filters and a simple photo viewer */
  var gal = d.querySelector('.gal');
  if (gal) {
    var items = $$('li', gal), count = d.querySelector('[data-count]');
    $$('.filters button').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k'), n = 0;
        $$('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        items.forEach(function (li) { var on = k === 'all' || li.getAttribute('data-cat') === k; li.hidden = !on; if (on) n++; });
        if (count) count.textContent = n + (n === 1 ? ' job' : ' jobs');
      });
    });
    var lb = d.getElementById('lb'), cur = 0;
    function vis() { return items.filter(function (li) { return !li.hidden; }); }
    function show(i) {
      var v = vis(); cur = (i + v.length) % v.length;
      var b = v[cur].querySelector('[data-lb]'), im = b.querySelector('img');
      lb.querySelector('.lb__img').innerHTML = '<img src="' + im.src + '" alt="' + im.alt.replace(/"/g, '&quot;') + '"><span class="ph__tag">Stock photo</span>';
      lb.querySelector('.lb__t').innerHTML = '<b></b><p></p>';
      lb.querySelector('.lb__t b').textContent = b.getAttribute('data-t');
      lb.querySelector('.lb__t p').textContent = b.getAttribute('data-d');
    }
    if (lb && lb.showModal) {
      $$('[data-lb]', gal).forEach(function (b) {
        b.addEventListener('click', function () { show(vis().indexOf(b.parentNode)); lb.showModal(); });
      });
      lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.closest('[data-close]')) lb.close();
        else if (e.target.closest('[data-prev]')) show(cur - 1);
        else if (e.target.closest('[data-next]')) show(cur + 1);
      });
      lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
    }
  }

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
