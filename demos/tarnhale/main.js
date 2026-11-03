/* Tarnhale demo site. Everything important works without the animation libraries.
   Motion is layered on top with GSAP, ScrollTrigger and Lenis, and is switched off for reduced motion. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* ---------- demo bar height (the header sits under it) ---------- */
  var bar = $('.demo-bar');
  function setBar() { if (bar) html.style.setProperty('--bar-h', bar.offsetHeight + 'px'); }
  setBar(); window.addEventListener('resize', setBar);

  /* ---------- active nav ---------- */
  var here = location.pathname.replace(/\/$/, '').split('/').pop() || '';
  here = here.replace(/\.html$/, '');
  if (here.indexOf('project-') === 0) here = 'projects';
  if (here.indexOf('journal-') === 0) here = 'journal';
  $$('[data-nav]').forEach(function (a) { if (a.getAttribute('data-nav') === here) { a.classList.add('is-on'); a.setAttribute('aria-current', 'page'); } });

  /* ---------- mobile menu ---------- */
  var burger = $('#burger'), mnav = $('#mnav'), hdr = $('#hdr'), top = $('#top');
  var lenis = null;
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open);
      hdr.classList.toggle('menu-open', open);
      burger.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('is-open')) burger.click(); });
  }

  /* ---------- header: hide on scroll down, colour by section ---------- */
  var lastY = 0, hcEls = $$('[data-hc]');
  function onScroll() {
    var y = window.scrollY || 0;
    if (top) top.classList.toggle('is-hidden', y > 320 && y > lastY + 2 && !(mnav && mnav.classList.contains('is-open')));
    if (y < lastY - 2 || y < 320) top && top.classList.remove('is-hidden');
    lastY = y;
    if (!hdr) return;
    hdr.classList.toggle('is-solid', y > 12);
    var probe = (bar ? bar.offsetHeight : 0) + hdr.offsetHeight / 2, dark = false;
    for (var i = 0; i < hcEls.length; i++) {
      var r = hcEls[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { dark = hcEls[i].getAttribute('data-hc') === 'dark'; break; }
    }
    hdr.classList.toggle('on-dark', dark);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- page transitions: a short curtain, never blocks navigation ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
    if (u.pathname === location.pathname && u.search === location.search) return; /* same page or anchor */
    e.preventDefault();
    try { sessionStorage.setItem('th-leave', '1'); } catch (x) {}
    html.classList.add('is-leaving');
    setTimeout(function () { location.href = a.href; }, 480);
  });
  window.addEventListener('pageshow', function (ev) { if (ev.persisted) html.classList.remove('is-leaving', 'is-entering', 'is-revealing'); });

  /* ---------- hero video: only on fast connections, never with reduced motion ---------- */
  var video = $('.hero video'), pauseBtn = $('.hero__pause');
  function startVideo() {
    if (!video || reduce) return;
    var c = navigator.connection || {};
    if (c.saveData || /(^|-)2g$|^3g$/.test(c.effectiveType || '')) return;
    var small = window.matchMedia('(max-width: 900px)').matches;
    var list = small ? [[video.getAttribute('data-mp4-sm'), 'video/mp4']] : [[video.getAttribute('data-webm'), 'video/webm'], [video.getAttribute('data-mp4'), 'video/mp4']];
    var failed = 0, userPaused = false;
    function fail() { failed++; if (failed >= list.length) { video.remove(); if (pauseBtn) pauseBtn.classList.remove('is-on'); } }
    list.forEach(function (s) { var el = document.createElement('source'); el.src = s[0]; el.type = s[1]; el.addEventListener('error', fail); video.appendChild(el); });
    video.addEventListener('playing', function () { video.classList.add('is-playing'); if (pauseBtn) pauseBtn.classList.add('is-on'); });
    video.addEventListener('error', function () { video.remove(); });
    video.preload = 'auto'; video.load();
    var p = video.play(); if (p && p.catch) p.catch(function () {});
    if (pauseBtn) pauseBtn.addEventListener('click', function () {
      userPaused = !video.paused; if (userPaused) video.pause(); else video.play();
      pauseBtn.textContent = userPaused ? 'Play' : 'Pause'; pauseBtn.setAttribute('aria-pressed', userPaused);
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (userPaused) return; if (en.isIntersecting) { var q = video.play(); if (q && q.catch) q.catch(function () {}); } else video.pause(); });
    }).observe(video);
  }
  if (document.readyState === 'complete') startVideo(); else window.addEventListener('load', startVideo);

  /* ---------- projects: filters, list or grid, floating preview ---------- */
  var plist = $('#plist'), pgrid = $('#pgrid');
  $$('.filters .chip').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      $$('.filters .chip').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      $$('.prow, #pgrid .card').forEach(function (c) { c.classList.toggle('is-hidden', f !== 'all' && c.getAttribute('data-cat') !== f); });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });
  $$('[data-view]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-view');
      $$('[data-view]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      if (plist) plist.classList.toggle('is-hidden', v !== 'list');
      if (pgrid) pgrid.classList.toggle('is-hidden', v !== 'grid');
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    });
  });
  var pf = $('.pfloat');
  if (pf && plist && fine) {
    var pimgs = $$('img', pf), px = 0, py = 0, cx = 0, cy = 0, on = false, raf = 0;
    var loop = function () { cx += (px - cx) * .16; cy += (py - cy) * .16; pf.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%) scale(' + (on ? 1 : .7) + ')'; raf = requestAnimationFrame(loop); };
    window.addEventListener('pointermove', function (e) { px = e.clientX; py = e.clientY; });
    $$('.prow a').forEach(function (a) {
      a.addEventListener('pointerenter', function () {
        var k = a.getAttribute('data-img');
        pimgs.forEach(function (i) { i.loading = 'eager'; i.classList.toggle('is-on', i.getAttribute('data-for') === k); });
        if (!on) { cx = px; cy = py; } on = true; pf.style.opacity = 1; pf.style.transition = 'opacity .3s';
        if (!raf) loop();
      });
    });
    plist.addEventListener('pointerleave', function () { on = false; pf.style.opacity = 0; });
  }

  /* ---------- drawing vs image slider (Fell House page) ---------- */
  var cmp = $('#compare');
  if (cmp) {
    var handle = $('.compare__handle', cmp), dragging = false;
    var set = function (pct) { pct = Math.max(0, Math.min(100, pct)); cmp.style.setProperty('--p', pct + '%'); handle.setAttribute('aria-valuenow', Math.round(pct)); };
    var fromEvent = function (e) { var r = cmp.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    cmp.addEventListener('pointerdown', function (e) { dragging = true; set(fromEvent(e)); try { cmp.setPointerCapture(e.pointerId); } catch (x) {} });
    cmp.addEventListener('pointermove', function (e) { if (dragging) set(fromEvent(e)); });
    ['pointerup', 'pointercancel'].forEach(function (n) { cmp.addEventListener(n, function () { dragging = false; }); });
    handle.addEventListener('keydown', function (e) {
      var v = parseFloat(handle.getAttribute('aria-valuenow'));
      if (e.key === 'ArrowLeft') { set(v - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(v + 5); e.preventDefault(); }
    });
    set(50);
  }

  /* ---------- demo enquiry form: nothing is sent ---------- */
  var form = $('#enqForm');
  if (form) {
    var done = $('#enqDone'), nameOut = $('#enqName'), again = $('#enqAgain');
    var valid = function (el) { if (el.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()); return el.value.trim() !== ''; };
    $$('input,select,textarea', form).forEach(function (el) {
      ['input', 'change'].forEach(function (ev) { el.addEventListener(ev, function () { var f = el.closest('.fld'); if (f) f.classList.remove('is-bad'); }); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('[required]', form).forEach(function (el) { var ok = valid(el); el.closest('.fld').classList.toggle('is-bad', !ok); if (!ok && !bad) bad = el; });
      if (bad) { bad.focus(); return; }
      var first = form.elements.name.value.trim().split(/\s+/)[0];
      nameOut.textContent = first ? ', ' + first : '';
      form.reset(); form.hidden = true; done.hidden = false; done.focus();
      if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 50);
    });
    again.addEventListener('click', function () { done.hidden = true; form.hidden = false; form.elements.name.focus(); });
  }

  /* ---------- text prep ---------- */
  $$('.split').forEach(function (el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (p) { return '<span class="l"><span>' + p + '</span></span>'; }).join('');
  });
  $$('[data-words]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  });

  if (!hasGsap || reduce) { if (reduce) html.classList.add('is-reduced'); return; }

  /* ================= motion layer ================= */
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  html.classList.add('js-anim');

  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', function () { ST.update(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (html.classList.contains('is-intro')) lenis.stop();
    $$('a[href*="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').split('#')[1], t = id && document.getElementById(id);
        if (t && a.pathname === location.pathname) { e.preventDefault(); lenis.scrollTo(t, { offset: -90 }); }
      });
    });
    if (location.hash && document.getElementById(location.hash.slice(1))) setTimeout(function () { lenis.scrollTo(location.hash, { offset: -90, immediate: true }); }, 80);
  }

  /* ---------- intro: hero media settles, headline rises line by line ---------- */
  var heroLines = $$('.hero .split .l > span, .pj__hero .split .l > span, .page-hero .split .l > span, .article .split .l > span');
  var heroBits = $$('.hero .eyebrow, .hero__row, .hero__ctl, .pj__head .eyebrow, .page-hero .eyebrow, .page-hero .lede, .page-hero .ai-note, .article > .eyebrow');
  var heroMedia = $$('.hero__media > img, .hero__media picture img, .hero__media video, .pj__hero .rv img');
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set(heroBits, { opacity: 0, y: 18 });
  function heroIntro() {
    if (lenis) lenis.start();
    var t = gsap.timeline();
    if (heroMedia.length) t.fromTo(heroMedia, { scale: 1.25 }, { scale: 1, duration: 2.2, ease: 'expo.out' }, 0);
    t.to(heroLines, { yPercent: 0, duration: 1.3, stagger: .12, ease: 'expo.out' }, .12)
     .to(heroBits, { opacity: 1, y: 0, duration: 1, stagger: .08, ease: 'power3.out' }, .35);
    ST.refresh();
  }
  if (window.__introDone) heroIntro(); else document.addEventListener('th:intro', heroIntro, { once: true });

  /* ---------- cursor + magnetic buttons (pointer devices) ---------- */
  if (fine) {
    var cur = $('.cursor');
    var qx = gsap.quickTo(cur, 'x', { duration: .4, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: .4, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { qx(e.clientX); qy(e.clientY); cur.style.opacity = 1; });
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

  /* ---------- scroll scenes (rebuilt when the screen size class changes) ---------- */
  var mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 900px)', mob: '(max-width: 899px)' }, function (ctx) {
    var desk = ctx.conditions.desk;

    /* hero parallax out */
    if ($('.hero')) gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__media', { yPercent: 14, scale: 1.18, ease: 'none' }, 0)
      .to('.hero__copy', { yPercent: -18, opacity: 0, ease: 'none' }, 0);
    if ($('.pj__hero')) gsap.timeline({ scrollTrigger: { trigger: '.pj__hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.pj__hero .rv', { yPercent: 14, ease: 'none' }, 0)
      .to('.pj__head', { yPercent: -20, opacity: 0, ease: 'none' }, 0);

    /* intro words light up, counters */
    if ($('.intro__text')) gsap.to('.intro__text .w', { opacity: 1, stagger: .1, ease: 'none',
      scrollTrigger: { trigger: '.intro__text', start: 'top 82%', end: 'bottom 50%', scrub: true } });
    $$('[data-num]').forEach(function (el) {
      var end = +el.getAttribute('data-num'), plus = el.hasAttribute('data-plus'), o = { v: 0 };
      el.textContent = '0';
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
        gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: function () { el.textContent = Math.round(o.v) + (plus ? '+' : ''); } });
      } });
    });

    /* showcase: sideways on desktop, a stack on phones */
    var track = $('.showcase__track');
    if (track && desk) {
      html.classList.add('js-hscroll');
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var hs = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: '.showcase', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$('.slide', track).forEach(function (s) {
        var img = $('img', s);
        gsap.fromTo(img, { xPercent: -6, scale: 1.22 }, { xPercent: 6, scale: 1.06, ease: 'none',
          scrollTrigger: { trigger: s, containerAnimation: hs, start: 'left right', end: 'right left', scrub: true } });
        gsap.from($('.slide__meta', s), { y: 30, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: s, containerAnimation: hs, start: 'left 85%' } });
      });
    }

    /* the drawing scene: grid draws, a section cut reveals the drawing, the building dissolves in */
    var sc = $('#scene');
    if (sc) {
      html.classList.add('js-scene');
      var art = $('.scene__art', sc), draw = $('.scene__draw', sc), photo = $('.scene__photo', sc), cut = $('.scene__cut', sc);
      var caps = $$('.scene__caps li', sc), prog = $('.scene__prog i', sc), shade = $('.scene__shade', sc);
      var dark = '#F7F7F4';
      gsap.set(photo, { opacity: 0 }); gsap.set(draw, { clipPath: 'inset(0 100% 0 0)' });
      gsap.set('.scene__grid line', { strokeDasharray: 1, strokeDashoffset: 1 }); gsap.set('.scene__grid text', { opacity: 0 });
      gsap.set(caps, { opacity: 0, y: 16 }); gsap.set(caps[0], { opacity: 1, y: 0 });
      gsap.set(cut, { left: '0%', opacity: 0 });
      var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: sc, start: 'top top', end: desk ? '+=430%' : '+=320%', pin: true, scrub: .8, anticipatePin: 1,
        onUpdate: function (st) { sc.setAttribute('data-hc', st.progress > .6 ? 'dark' : 'light'); onScroll(); } } });
      tl.to('.g-datum line', { strokeDashoffset: 0, duration: 1.2, stagger: .2 }, 0)
        .to('.g-axis line', { strokeDashoffset: 0, duration: 1.2, stagger: .15 }, .4)
        .to('.g-text text', { opacity: 1, duration: .4, stagger: .05 }, 1.1)
        .to(cut, { opacity: 1, duration: .15 }, 1.6)
        .to(cut, { left: '100%', duration: 2.4, ease: 'power1.inOut' }, 1.6)
        .to(draw, { clipPath: 'inset(0 0% 0 0)', duration: 2.4, ease: 'power1.inOut' }, 1.6)
        .to(cut, { opacity: 0, duration: .2 }, 3.9)
        .to(caps[0], { opacity: 0, y: -14, duration: .3 }, 2.1).to(caps[1], { opacity: 1, y: 0, duration: .4 }, 2.4)
        .to('.scene__grid', { opacity: 0, duration: .8 }, 4.1)
        .to(photo, { opacity: 1, duration: 1.6 }, 4.3)
        .fromTo($('img', photo), { scale: 1.16 }, { scale: 1, duration: 3.4 }, 4.3)
        .to(shade, { opacity: 1, duration: 1 }, 5.0)
        .to('.scene__title, .scene .eyebrow', { color: dark, duration: .6 }, 5.0)
        .to(caps[1], { opacity: 0, y: -14, duration: .3 }, 5.0).to(caps[2], { opacity: 1, y: 0, duration: .4 }, 5.3)
        .to(prog, { scaleX: 1, duration: 7.7 }, 0)
        .to({}, { duration: .4 }, 7.7);
      gsap.from('.scene__title', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: sc, start: 'top 70%' } });
    }

    /* headlines rise line by line (not the page-top ones, they play in the intro) */
    $$('.split').forEach(function (el) {
      if (el.closest('.hero, .pj__hero, .page-hero, .article')) return;
      gsap.from($$('.l > span', el), { yPercent: 110, duration: 1.3, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('.head .eyebrow, .band .eyebrow, .intro .eyebrow').forEach(function (el) {
      gsap.from(el, { opacity: 0, x: -16, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });

    /* every image: mask reveal plus scrubbed parallax */
    var amp = desk ? 7 : 4, s0 = desk ? 1.25 : 1.12, s1 = desk ? 1.08 : 1.04;
    $$('.rv').forEach(function (f) {
      if (f.closest('.showcase__track') || f.classList.contains('rv--hero') || f.classList.contains('prow__thumb') && fine) return;
      var img = $('img', f); if (!img) return;
      gsap.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: f, start: 'top 90%' } });
      gsap.fromTo(img, { yPercent: -amp, scale: s0 }, { yPercent: amp, scale: s1, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.svc li, .step, .svc-item, .post, .person, .facts div, .pj__body > div, .prow, .card__meta').forEach(function (el) {
      gsap.from(el, { y: 30, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });

    /* big scrubbed marquee */
    if ($('.marq__row')) gsap.fromTo('.marq__row', { xPercent: 0 }, { xPercent: desk ? -38 : -30, ease: 'none',
      scrollTrigger: { trigger: '.marq', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* closing band */
    if ($('.band')) gsap.from('.band .lede, .band .row', { y: 30, opacity: 0, duration: 1.1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.band .lede', start: 'top 92%' } });

    return function () { html.classList.remove('js-hscroll', 'js-scene'); };
  });

  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
