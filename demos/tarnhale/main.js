/* Tarnhale demo site. Core features work without the animation libraries. */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* active nav */
  var here = location.pathname.replace(/\/$/, '').split('/').pop() || '';
  if (here.indexOf('project-') === 0) here = 'projects';
  if (here.indexOf('journal-') === 0) here = 'journal';
  $$('[data-nav]').forEach(function (a) { if (a.getAttribute('data-nav') === here) a.classList.add('is-on'); });

  /* mobile menu */
  var burger = $('#burger'), mnav = $('#mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open);
      burger.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { burger.click(); }); });
  }

  /* header hide on scroll down */
  var hdr = $('#hdr'), lastY = 0;
  function onScroll(y) {
    if (!hdr) return;
    hdr.classList.toggle('is-scrolled', y > 10);
    hdr.classList.toggle('is-hidden', y > 300 && y > lastY && !(mnav && mnav.classList.contains('is-open')));
    lastY = y;
  }
  window.addEventListener('scroll', function () { onScroll(window.scrollY); }, { passive: true });

  /* project filters */
  $$('.filters .chip').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      $$('.filters .chip').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      $$('.grid--all .card').forEach(function (c) { c.classList.toggle('is-hidden', f !== 'all' && c.getAttribute('data-cat') !== f); });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });

  /* drawing vs photo slider */
  var cmp = $('#compare');
  if (cmp) {
    var draw = $('.compare__draw', cmp), handle = $('.compare__handle', cmp), dragging = false;
    var set = function (pct) {
      pct = Math.max(0, Math.min(100, pct));
      draw.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%'; handle.setAttribute('aria-valuenow', Math.round(pct));
    };
    var fromEvent = function (e) { var r = cmp.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    cmp.addEventListener('pointerdown', function (e) { dragging = true; set(fromEvent(e)); cmp.setPointerCapture(e.pointerId); });
    cmp.addEventListener('pointermove', function (e) { if (dragging) set(fromEvent(e)); });
    cmp.addEventListener('pointerup', function () { dragging = false; });
    cmp.addEventListener('pointercancel', function () { dragging = false; });
    handle.addEventListener('keydown', function (e) {
      var v = parseFloat(handle.getAttribute('aria-valuenow'));
      if (e.key === 'ArrowLeft') { set(v - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(v + 5); e.preventDefault(); }
    });
    set(50);
  }

  /* demo enquiry form: nothing is sent */
  var form = $('#enqForm');
  if (form) {
    var done = $('#enqDone'), nameOut = $('#enqName'), again = $('#enqAgain');
    var valid = function (el) {
      if (el.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      return el.value.trim() !== '';
    };
    $$('input,select,textarea', form).forEach(function (el) {
      ['input', 'change'].forEach(function (ev) { el.addEventListener(ev, function () { el.closest('.fld') && el.closest('.fld').classList.remove('is-bad'); }); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('[required]', form).forEach(function (el) {
        var ok = valid(el); el.closest('.fld').classList.toggle('is-bad', !ok); if (!ok && !bad) bad = el;
      });
      if (bad) { bad.focus(); return; }
      var first = form.elements.name.value.trim().split(/\s+/)[0];
      nameOut.textContent = first ? ', ' + first : '';
      form.reset(); form.hidden = true; done.hidden = false; done.focus();
      if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 50);
    });
    again.addEventListener('click', function () { done.hidden = true; form.hidden = false; form.elements.name.focus(); });
  }

  /* split headings into lines (by <br>) for the reveal */
  $$('.split').forEach(function (el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (p) { return '<span class="l"><span>' + p + '</span></span>'; }).join('');
  });
  /* split intro into words, keep any sample tag at the end */
  $$('[data-words]').forEach(function (el) {
    var tag = el.querySelector('.sample'); var tagHtml = tag ? ' ' + tag.outerHTML : '';
    if (tag) tag.remove();
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ') + tagHtml;
  });

  /* animation layer: only if libraries loaded and motion is OK */
  function finish() { $$('.intro__text .w').forEach(function (w) { w.style.opacity = 1; }); $$('[data-num]').forEach(function (el) { el.textContent = el.getAttribute('data-num') + (el.hasAttribute('data-plus') ? '+' : ''); }); }
  window.addEventListener('load', function () {
    if (reduce || !window.gsap || !window.ScrollTrigger) { finish(); return; }
    var gsap = window.gsap, ST = window.ScrollTrigger; gsap.registerPlugin(ST);

    if (window.Lenis) {
      var lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on('scroll', function (e) { ST.update(); onScroll(e.scroll); });
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
      $$('a[href*="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var id = a.getAttribute('href').split('#')[1]; var t = id && document.getElementById(id);
          if (t && a.pathname === location.pathname) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); }
        });
      });
      if (location.hash && document.getElementById(location.hash.slice(1))) setTimeout(function () { lenis.scrollTo(location.hash, { offset: -80, immediate: true }); }, 60);
    }

    /* headline line reveals */
    $$('.split').forEach(function (el) {
      gsap.from($$('.l > span', el), { yPercent: 110, duration: 1.2, stagger: .1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.from('.hero .reveal', { y: 24, opacity: 0, duration: 1, stagger: .15, delay: .3, ease: 'power3.out' });

    /* hero image settles, then drifts on scroll */
    var heroImg = $('.hero__media img');
    if (heroImg) {
      gsap.fromTo(heroImg, { scale: 1.16 }, { scale: 1.04, duration: 2.2, ease: 'expo.out' });
      gsap.to(heroImg, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
    var pjImg = $('.pj__media img');
    if (pjImg) gsap.fromTo(pjImg, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.pj__hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* intro words light up as you scroll */
    if ($('.intro__text')) gsap.to('.intro__text .w', { opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: '.intro__text', start: 'top 80%', end: 'bottom 45%', scrub: true } });

    /* counters */
    $$('[data-num]').forEach(function (el) {
      var end = +el.getAttribute('data-num'), plus = el.hasAttribute('data-plus'), o = { v: 0 };
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v) + (plus ? '+' : ''); } });
      } });
    });

    /* images unveil */
    $$('.card__img, .jcard figure, .about__img, .article__img, .pj__gal').forEach(function (f) {
      gsap.from(f, { clipPath: 'inset(12% 0 0 0)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 90%' } });
    });
    $$('.svc li, .step, .svc-item, .post, .person, .facts div').forEach(function (el) {
      gsap.from(el, { y: 30, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });

    /* drawing slider eases open once */
    var c = $('#compare');
    if (c) {
      var draw = $('.compare__draw', c), handle = $('.compare__handle', c), o2 = { p: 100 };
      ST.create({ trigger: c, start: 'top 70%', once: true, onEnter: function () {
        gsap.to(o2, { p: 50, duration: 1.8, ease: 'expo.inOut', onUpdate: function () {
          draw.style.clipPath = 'inset(0 ' + (100 - o2.p) + '% 0 0)'; handle.style.left = o2.p + '%';
        } });
      } });
    }

    /* cursor and magnetic buttons, pointer devices only */
    if (window.matchMedia('(hover: hover)').matches) {
      var cur = $('.cursor');
      var cx = gsap.quickTo(cur, 'x', { duration: .4, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .4, ease: 'power3' });
      window.addEventListener('pointermove', function (e) { cx(e.clientX); cy(e.clientY); cur.style.opacity = 1; });
      $$('[data-cursor]').forEach(function (el) {
        el.addEventListener('pointerenter', function () { cur.classList.add('is-view'); });
        el.addEventListener('pointerleave', function () { cur.classList.remove('is-view'); });
      });
      $$('[data-magnet]').forEach(function (el) {
        var mx = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.6)' }), my = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.6)' });
        el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .25); my((e.clientY - r.top - r.height / 2) * .35); });
        el.addEventListener('pointerleave', function () { mx(0); my(0); });
      });
    }
  });
})();
