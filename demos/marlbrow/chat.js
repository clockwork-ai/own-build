window.DEMO_CHAT={"name":"Marlbrow","open":"Ask Marlbrow","mark":"<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect width=\"32\" height=\"32\" rx=\"7\" fill=\"#1E2224\"/><path d=\"M6 12.5c3.4-2.6 6.6-2.6 10 0s6.6 2.6 10 0\" fill=\"none\" stroke=\"#A9C27C\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><rect x=\"6\" y=\"17\" width=\"20\" height=\"3.2\" rx=\"1.6\" fill=\"#D8C7A6\"/><rect x=\"6\" y=\"22.4\" width=\"20\" height=\"3.2\" rx=\"1.6\" fill=\"#9A6B4B\"/></svg>","intro":"Hi, this is the Marlbrow chat. Ask about garden design, patios, garden rooms, lighting, drives or groundworks, or start a quote.","main":["Garden design and planting","Patios, paths and walls","Garden rooms","Outdoor lighting","Drives and front gardens","Drainage or groundworks","Commercial grounds","Do you cover my area?","How does a quote work?"],"quoteLabel":"Start a quote","quoteRe":"\\b(start a quote|get a quote|want a quote|need a quote|price|prices|cost|how much|estimate|book)\\b","services":["Garden design and planting","Patio, paths or walls","Garden room or structure","Outdoor lighting","Drive or front garden","Groundworks or drainage","Fencing or gates","Commercial grounds","Something else"],"fallback":"I'm not sure about that one, but the team will know. The quickest way is to start a quote and tell them what you need.","answers":[["garden room|garden office|studio|summer ?house|pergola|cabin|structure|shed","Yes. We build the base, the paving, the path and the planting around a garden room, studio or pergola. The room itself comes from a specialist supplier, and we make sure it sits level and looks like part of the garden. Whether it needs planning permission depends on its size and position, so it's worth checking with the council and asking on the quote."],["commercial|care home|school|office|shop|business|car ?park|frontage|grounds","Yes, a few small commercial jobs a year: shop and office frontages, care home and school grounds, and small car parks. We work round your opening hours and keep the entrance usable. Start a quote and tell us about the site."],["\\blight","Yes. Low wall lights, step lights, path lights and a light under a tree, planned with the garden so the cables go in while the ground is open. A qualified electrician makes the connections."],["resin|block|tarmac|asphalt|finish|which (is )?best","We lay all three. Block paving is tough and easy to repair a section of. Resin is a smooth finish that water drains through when it's on the right base. Tarmac is quick and suits long drives and slopes. We design the drive with the rest of the front garden, and go through the options on the visit."],["drive|driveway|parking|front garden|car\\b","Yes, as part of the front garden: block paving, resin or tarmac, designed with the path, the planting and the wall. Every drive gets a full dig-out and a compacted base, with the drainage sorted at the same time."],["patio|slab|sandstone|porcelain|path|step|wall|raised bed","Yes. Porcelain and sandstone patios laid on a full bed with a gentle fall away from the house, paths and steps that are easy underfoot, and low garden walls and raised beds in brick."],["drain|soakaway|flood|puddle|gully|water","Yes, we do drainage: channel drains, connecting downpipes, soakaways where the ground suits them, and sorting out water that sits where it shouldn't. Whether a soakaway will work depends on your ground, so it's best to ask on the quote."],["footing|foundation|groundwork|base|clearance|level|dig","Yes: digging out, levels, bases for garden rooms, footings for garden walls, and site clearance. We always check for buried pipes and cables before anything is dug."],["fence|fencing|gate|panel|post","Yes, close board, panels, slatted screens and gates, on posts set in concrete, with gravel boards to keep the timber off the soil."],["design|plan|drawing|planting|plant|border|lawn|turf|landscap|garden","Yes, that's most of what we do. We walk the garden with you, draw a simple plan, then build it: patio, lawn, borders, paths and planting chosen to cope with heavy clay."],["area|cover|postcode|where|ormskirk|burscough|aughton|lathom|skelm|maghull|rufford|l39|l40|wn8","We're based in Ormskirk (sample) and cover Burscough, Aughton, Lathom, Skelmersdale, Maghull and Rufford. If you're just outside that, ask: we often are too."],["how does .*quote|quote work|visit|survey|come out|look at","We come out, walk the garden with you, measure up, and check the levels and drainage. Then you get a simple plan and a written quote saying what we'll dig, what goes underneath, the materials, the planting and how long it takes. We don't price without seeing it."],["after|aftercare|finished|handover|review|check in|warranty|guarantee","When we finish, we walk it with you and leave care notes for the planting and the paving. The same day you'll get a thank-you message, then a link to leave a Google review if you'd like to, and a check-in a few weeks later to see how it's settling."],["how long|when can|start|busy|soon","It depends on the job and the time of year. Once we've been to look, the quote will say how long the work takes and when we could start."],["hello|hi\\b|hey|morning|afternoon","Hello. What are you thinking of having done? Ask a question, or start a quote."]]};
/* Demo chat box. Scripted answers only, written for this trade. No server, no keys: nothing is sent or saved. */
(function () {
  var C = window.DEMO_CHAT; if (!C) return;
  var d = document;
  var btn = d.createElement('button');
  btn.className = 'chat-btn'; btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg><span class="chat-btn__t">' + C.open + '</span>';
  var box = d.createElement('div');
  box.className = 'chat'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Chat with ' + C.name + ' (demo)'); box.hidden = true;
  box.innerHTML = '<div class="chat__top"><span class="chat__who">' + C.mark + '<span><b>' + C.name + '</b><small>Demo chat box. Scripted answers.</small></span></span><button class="chat__x" type="button" aria-label="Close the chat">&times;</button></div>' +
    '<div class="chat__log" aria-live="polite"></div>' +
    '<form class="chat__in"><label class="skip" for="chatq">Your message</label><input id="chatq" autocomplete="off" placeholder="Type a question"><button type="submit">Send</button></form>' +
    '<p class="chat__demo">Demo chat box. Nothing you type is sent or saved.</p>';
  d.body.appendChild(btn); d.body.appendChild(box);
  var log = box.querySelector('.chat__log'), form = box.querySelector('form'), input = box.querySelector('input');
  var started = false, step = null, q = {};
  var A = C.answers.map(function (a) { return [new RegExp(a[0], 'i'), a[1]]; });
  var quoteRe = new RegExp(C.quoteRe, 'i');

  function scroll() { log.scrollTop = log.scrollHeight; }
  function say(text, who) {
    var m = d.createElement('div'); m.className = 'msg msg--' + (who || 'bot');
    m.textContent = text; log.appendChild(m); scroll();
  }
  function bot(text, then) {
    var t = d.createElement('div'); t.className = 'msg msg--bot msg--typing'; t.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(t); scroll();
    setTimeout(function () { t.remove(); say(text); if (then) then(); }, 420);
  }
  function chips(list) {
    var c = d.createElement('div'); c.className = 'chips';
    list.forEach(function (l) {
      var b = d.createElement('button'); b.type = 'button'; b.textContent = l;
      b.addEventListener('click', function () { c.remove(); handle(l); });
      c.appendChild(b);
    });
    log.appendChild(c); scroll();
  }
  function more() { chips([C.quoteLabel, 'Ask something else']); }

  function startQuote() { step = 'service'; q = {}; bot('Happy to. What sort of job is it?', function () { chips(C.services); }); }
  function quoteStep(text) {
    if (step === 'service') { q.service = text; step = 'postcode'; bot('Thanks. What postcode is the job at?'); return; }
    if (step === 'postcode') {
      if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(text.trim())) { bot('That doesn’t look like a full UK postcode. Try something like L39 0AB.'); return; }
      q.postcode = text.trim().toUpperCase(); step = 'name'; bot('Got it. And your first name?'); return;
    }
    if (step === 'name') {
      if (text.trim().length < 2) { bot('Just a first name is fine.'); return; }
      q.name = text.trim().split(/\s+/)[0]; step = 'phone'; bot('Thanks, ' + q.name + '. What’s the best number to reach you on?'); return;
    }
    if (step === 'phone') {
      if (text.replace(/[^\d]/g, '').length < 10) { bot('That number looks a bit short. Could you check it?'); return; }
      step = null;
      bot('Thanks, ' + q.name + '. That’s a ' + q.service.toLowerCase() + ' quote at ' + q.postcode + '. On a real site, the office would ring you to arrange a visit.', function () {
        bot('This is a demo, so nothing was sent or saved and nobody will call.', more);
      });
    }
  }
  function handle(text) {
    say(text, 'me');
    if (step) { quoteStep(text); return; }
    if (text === C.quoteLabel || quoteRe.test(text)) { startQuote(); return; }
    if (text === 'Ask something else') { bot('Go ahead, or pick one of these.', function () { chips(C.main); }); return; }
    for (var i = 0; i < A.length; i++) if (A[i][0].test(text)) { bot(A[i][1], more); return; }
    bot(C.fallback, more);
  }

  function open() {
    box.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.classList.add('is-open'); d.documentElement.classList.add('chat-open');
    if (!started) { started = true; bot(C.intro, function () { chips(C.main); }); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('is-open'); d.documentElement.classList.remove('chat-open'); btn.focus(); }
  btn.addEventListener('click', function () { box.hidden ? open() : close(); });
  box.querySelector('.chat__x').addEventListener('click', close);
  box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; var c = log.querySelector('.chips:last-child'); if (c) c.remove(); handle(v); });
})();
