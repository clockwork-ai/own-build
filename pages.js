// Clockwork AI: shared behaviour for the inner pages.
// Every page lives at an hour of the working day. The corner subdial shows it
// and opens the site menu; page dials and the closing disc are drawn here.
(() => {
  ScrollCraft.mount(document.body);
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = document) => r.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const polar = (c, r, deg) => [c + r * Math.sin(deg * Math.PI / 180), c - r * Math.cos(deg * Math.PI / 180)];
  const parse = t => { const [h, m] = t.split(':').map(Number); return h + m / 60; };

  // The site, as hours of a working day. Keep in step with the menu on the home page.
  const PAGES = [
    ['/', 'Home', '02:14'],
    ['/roofers', 'Roofers', '07:30'],
    ['/how-it-works', 'How it works', '06:30'],
    ['/services', 'Services', '09:00'],
    ['/missed-calls', 'Missed calls', '10:42'],
    ['/clockwork-check', 'Free audit', '11:00'],
    ['/work', 'My work', '14:00'],
    ['/about', 'About', '17:30'],
    ['/book', 'Book a call', '08:00'],
  ];

  function ticks(g, c, n, rOut, rIn, every, rBig, attrs, bigAttrs, skip = -1) {
    for (let i = 0; i < n; i++) {
      if (i === skip) continue;
      const a = i * 360 / n, big = i % every === 0;
      const [x1, y1] = polar(c, big ? rBig : rIn, a), [x2, y2] = polar(c, rOut, a);
      const l = document.createElementNS(NS, 'line');
      Object.entries({ x1, y1, x2, y2, ...(big ? bigAttrs : attrs) }).forEach(([k, v]) => l.setAttribute(k, v));
      g.appendChild(l);
    }
  }
  function hand(svg, c, len, width, deg, colour, tail = 8) {
    const [x1, y1] = polar(c, -tail, deg), [x2, y2] = polar(c, len, deg);
    const l = document.createElementNS(NS, 'line');
    Object.entries({ x1, y1, x2, y2, stroke: colour, 'stroke-width': width, 'stroke-linecap': 'round' }).forEach(([k, v]) => l.setAttribute(k, v));
    svg.appendChild(l);
  }

  // Page dials: <svg data-dial="hero" data-hour="09:00" data-lit="9">
  document.querySelectorAll('svg[data-dial]').forEach(svg => {
    const kind = svg.dataset.dial, g = document.createElementNS(NS, 'g');
    svg.appendChild(g);
    const lit = svg.dataset.lit ? Math.round(+svg.dataset.lit % 12 * 5) : -1;
    ticks(g, 100, 60, 94, 91, 5, 85,
      { stroke: 'rgba(232,238,214,.26)', 'stroke-width': 0.5 },
      { stroke: kind === 'end' ? 'rgba(232,238,214,.6)' : 'rgba(232,238,214,.75)', 'stroke-width': 1.2, 'stroke-linecap': 'round' }, lit);
    if (lit >= 0) {
      const [x, y] = polar(100, 89, lit * 6);
      const d = document.createElementNS(NS, 'circle');
      Object.entries({ cx: x, cy: y, r: 3, fill: '#CBB892' }).forEach(([k, v]) => d.setAttribute(k, v));
      svg.appendChild(d);
    }
    if (svg.dataset.hour) {
      const h = parse(svg.dataset.hour);
      hand(svg, 100, 50, 2.6, (h % 12) / 12 * 360, '#E8EED6', 8);
      hand(svg, 100, 76, 1.4, (h % 1) * 360, '#E8EED6', 12);
      const hub = document.createElementNS(NS, 'circle');
      Object.entries({ cx: 100, cy: 100, r: 3.2, fill: '#CBB892' }).forEach(([k, v]) => hub.setAttribute(k, v));
      svg.appendChild(hub);
    }
  });

  // Corner subdial: this page's hour, and the menu.
  let here = location.pathname.replace(/\.html$/i, "");
  if (here.length > 1 && here.endsWith("/")) here = here.slice(0, -1);
  if (here === "/index" || here === "") here = "/";
  const pageHour = document.body.dataset.hour || '09:00';
  const sub = $('#subdialsvg');
  if (sub) {
    ticks($('#subticks'), 20, 12, 17.5, 15.5, 3, 14.5, { 'stroke-width': 0.8 }, { 'stroke-width': 1.3 });
    const h = parse(pageHour);
    $('#subhour').setAttribute('transform', `rotate(${(h % 12) / 12 * 360} 20 20)`);
    $('#submin').setAttribute('transform', `rotate(${(h % 1) * 360} 20 20)`);
    $('#subtime').textContent = pageHour;
    const marks = $('#submarks');
    PAGES.forEach(([, , t]) => {
      const [x, y] = polar(20, 16.2, (parse(t) % 12) / 12 * 360);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 1.1); marks.appendChild(c);
    });
  }
  const menu = $('#dialmenu');
  if (menu) {
    const add = html => { const li = document.createElement('li'); li.innerHTML = html; menu.appendChild(li); return li; };
    // Phones: the same three actions as the dock, at the top of the menu.
    const book = $('.dock .btn--primary'), wa = $('.dock a[href^="https://wa.me"]');
    if (book && wa) add(`<div class="menu__cta"><a class="btn btn--primary" href="${book.href}" target="_blank" rel="noopener">Book a free 30-minute call</a><div><a class="btn btn--ghost" href="tel:+447460038202">Call</a><a class="btn btn--ghost" href="${wa.href}" target="_blank" rel="noopener">WhatsApp</a></div></div>`);
    add('<div class="menu__head">Pages</div>');
    PAGES.forEach(([href, name, t]) => {
      const li = add('<a></a>'), a = li.firstChild;
      a.href = href; a.innerHTML = `<time>${t}</time><span></span>`; a.lastChild.textContent = name;
      if (href === here) a.setAttribute('aria-current', 'page');
    });
    const sections = [...document.querySelectorAll('main > section[id][data-title]')];
    if (sections.length > 1) {
      add('<div class="menu__rule"></div>');
      add('<div class="menu__head">On this page</div>');
      sections.forEach(sec => {
        const li = add('<a></a>'), a = li.firstChild;
        a.href = '#' + sec.id; a.innerHTML = '<time>·</time><span></span>'; a.lastChild.textContent = sec.dataset.title;
      });
    }
  }
  const subWrap = $('.subdial'), subBtn = $('.subdial__btn');
  const setOpen = open => {
    if (open) subWrap.setAttribute('data-open', ''); else subWrap.removeAttribute('data-open');
    subBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('menu-open', open && matchMedia('(max-width: 860px)').matches);
    if (open) menu.querySelector('a')?.focus();
  };
  subBtn?.addEventListener('click', () => setOpen(!subWrap.hasAttribute('data-open')));
  menu?.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && subWrap?.hasAttribute('data-open')) { setOpen(false); subBtn.focus(); } });
  document.addEventListener('pointerdown', e => { if (subWrap && !subWrap.contains(e.target)) setOpen(false); });

  // Header turns solid once the page hero has scrolled under it.
  const bar = $('.bar');
  const onScroll = () => bar.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  window.Clockwork = { pad, parse, polar };
})();
