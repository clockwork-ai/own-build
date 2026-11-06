/* Demo site behaviour. Everything runs in the browser: nothing is sent or saved anywhere. */
(function () {
  var d = document, h = d.documentElement;
  var reduce = h.classList.contains('rm');
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  /* Header: shrink on scroll, mobile menu */
  var hdr = d.getElementById('hdr');
  var onScroll = function () { if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 24); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = d.getElementById('burger'), mnav = d.getElementById('mnav');
  if (burger && mnav) burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open); h.classList.toggle('menu-open', open);
    burger.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
  });
  var here = location.pathname.replace(/\/$/, '').split('/').pop() || '';
  $$('.nav a').forEach(function (a) { var t = a.getAttribute('href'); if (t && here && (here === t || here.indexOf(t + '-') === 0)) a.setAttribute('aria-current', 'page'); });

  /* Reveal on scroll */
  var rv = $$('[data-rv]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* Count-up numbers */
  $$('[data-num]').forEach(function (el) {
    var to = +el.getAttribute('data-num'), plus = el.hasAttribute('data-plus');
    if (reduce || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now();
      (function step(t) { var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(e * to) + (p === 1 && plus ? '+' : ''); if (p < 1) requestAnimationFrame(step); })(t0);
    });
    o.observe(el);
  });

  /* Emergency panel */
  var sos = d.getElementById('sos');
  function openSos() { if (!sos) return; if (sos.showModal) sos.showModal(); else sos.setAttribute('open', ''); h.classList.add('sos-open'); }
  function closeSos() { if (!sos) return; if (sos.close) sos.close(); else sos.removeAttribute('open'); h.classList.remove('sos-open'); }
  $$('[data-sos]').forEach(function (b) { b.addEventListener('click', openSos); });
  if (sos) {
    sos.addEventListener('click', function (e) { if (e.target === sos || e.target.closest('[data-close]')) closeSos(); });
    sos.addEventListener('close', function () { h.classList.remove('sos-open'); });
  }
  if (location.hash === '#sos') openSos();

  /* Forms: conditional questions, checks, file chosen state, then a thank you. Nothing is sent. */
  $$('form[data-demo-form]').forEach(function (f) {
    var conds = $$('[data-when]', f);
    function sync() {
      conds.forEach(function (box) {
        var parts = box.getAttribute('data-when').split('='), field = f.elements[parts[0]];
        var v = field ? (field.value || (field.length ? (Array.prototype.find.call(field, function (r) { return r.checked; }) || {}).value : '')) : '';
        var show = parts[1].split('|').indexOf(v) !== -1;
        box.hidden = !show;
        $$('input,select,textarea', box).forEach(function (i) { i.disabled = !show; });
      });
    }
    f.addEventListener('change', sync); sync();
    $$('input[type=file]', f).forEach(function (inp) {
      var out = f.querySelector('[data-files="' + inp.name + '"]');
      inp.addEventListener('change', function () {
        if (!out) return; out.innerHTML = '';
        Array.prototype.slice.call(inp.files || [], 0, 8).forEach(function (file) {
          var li = d.createElement('li');
          if (/^image\//.test(file.type) && out.hasAttribute('data-preview')) { var im = d.createElement('img'); im.alt = ''; im.src = URL.createObjectURL(file); li.appendChild(im); }
          var s = d.createElement('span'); s.textContent = file.name; li.appendChild(s); out.appendChild(li);
        });
        var n = (inp.files || []).length;
        var note = f.querySelector('[data-files-note="' + inp.name + '"]');
        if (note) note.textContent = n ? n + (n === 1 ? ' file' : ' files') + ' chosen. In this demo they stay on your device and are never uploaded.' : '';
      });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('.field', f).forEach(function (w) { w.classList.remove('is-bad'); });
      $$('[required]', f).forEach(function (i) {
        if (i.disabled) return;
        var ok = i.type === 'checkbox' ? i.checked : (i.type === 'radio' ? !!f.querySelector('input[name="' + i.name + '"]:checked') : i.value.trim() !== '');
        if (ok && i.type === 'tel') ok = /^[0-9 +()]{10,16}$/.test(i.value.trim());
        if (ok && i.type === 'email' && i.value) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim());
        if (!ok) { var w = i.closest('.field'); if (w) w.classList.add('is-bad'); if (!bad) bad = i; }
      });
      var msg = f.querySelector('.form__err');
      if (bad) { if (msg) msg.hidden = false; bad.focus(); return; }
      if (msg) msg.hidden = true;
      var done = d.getElementById(f.getAttribute('data-demo-form'));
      f.hidden = true; if (done) { done.hidden = false; done.focus(); done.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); }
    });
  });
  $$('[data-again]').forEach(function (b) { b.addEventListener('click', function () { var f = d.querySelector('form[data-demo-form="' + b.getAttribute('data-again') + '"]'); if (f) { f.reset(); f.hidden = false; b.closest('[tabindex]').hidden = true; f.dispatchEvent(new Event('change')); } }); });

  /* Self-check lists: tick what applies, get a plain-English read-out */
  $$('[data-check]').forEach(function (box) {
    var out = box.querySelector('[data-check-out]'), msgs = JSON.parse(box.getAttribute('data-check'));
    function upd() {
      var n = $$('input:checked', box).length, hard = $$('input[data-hard]:checked', box).length;
      var m = hard ? msgs.hard : (n >= 2 ? msgs.some : (n === 1 ? msgs.one : msgs.none));
      out.innerHTML = m; box.setAttribute('data-level', hard ? 'hard' : n >= 2 ? 'some' : n ? 'one' : 'none');
      var bar = box.querySelector('[data-check-bar]'); if (bar) bar.style.setProperty('--p', Math.min(1, (n + hard * 2) / 5));
    }
    box.addEventListener('change', upd); upd();
  });

  /* Before and after slider: drag, tap or keyboard */
  $$('[data-ba]').forEach(function (ba) {
    var r = ba.querySelector('input[type=range]');
    function set(v) { ba.style.setProperty('--pos', v + '%'); r.setAttribute('aria-valuetext', v < 50 ? 'Showing mostly before' : 'Showing mostly after'); }
    r.addEventListener('input', function () { set(r.value); }); set(r.value);
  });

  /* Gallery filters and lightbox */
  $$('[data-filters]').forEach(function (bar) {
    var grid = d.getElementById(bar.getAttribute('data-filters'));
    $$('button', bar).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', bar).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var k = b.getAttribute('data-k');
        $$('[data-cat]', grid).forEach(function (it) { var show = k === 'all' || it.getAttribute('data-cat') === k; it.hidden = !show; });
        var live = bar.parentNode.querySelector('[data-count]'); if (live) live.textContent = $$('[data-cat]:not([hidden])', grid).length + ' jobs shown';
      });
    });
  });
  var lb = d.getElementById('lb');
  if (lb) {
    var items = $$('[data-lb]'), idx = 0;
    function show(i) {
      var vis = items.filter(function (x) { return !x.closest('[hidden]'); }); if (!vis.length) return;
      idx = (i + vis.length) % vis.length; var it = vis[idx];
      lb.querySelector('.lb__img').innerHTML = it.querySelector('img').outerHTML.replace(/ loading="lazy"/, '');
      lb.querySelector('.lb__t').innerHTML = it.getAttribute('data-lb');
      lb.querySelector('.lb__n').textContent = (idx + 1) + ' of ' + vis.length;
      lb._vis = vis;
    }
    items.forEach(function (it) { it.addEventListener('click', function (e) { e.preventDefault(); var vis = items.filter(function (x) { return !x.closest('[hidden]'); }); show(vis.indexOf(it)); lb.showModal ? lb.showModal() : lb.setAttribute('open', ''); }); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('[data-close]')) lb.close(); if (e.target.closest('[data-prev]')) show(idx - 1); if (e.target.closest('[data-next]')) show(idx + 1); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    var x0 = null; lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* Pointer glow on cards (desktop only, purely decorative) */
  if (!reduce && matchMedia('(hover: hover)').matches) $$('[data-glow]').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
})();
