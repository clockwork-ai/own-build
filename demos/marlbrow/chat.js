window.DEMO_CHAT={"name":"Marlbrow Groundworks","open":"Ask Marlbrow","mark":"<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect width=\"32\" height=\"32\" rx=\"7\" fill=\"#1E2224\"/><path d=\"M6 12.5c3.4-2.6 6.6-2.6 10 0s6.6 2.6 10 0\" fill=\"none\" stroke=\"#A9C27C\" stroke-width=\"2.6\" stroke-linecap=\"round\"/><rect x=\"6\" y=\"17\" width=\"20\" height=\"3.2\" rx=\"1.6\" fill=\"#D8C7A6\"/><rect x=\"6\" y=\"22.4\" width=\"20\" height=\"3.2\" rx=\"1.6\" fill=\"#9A6B4B\"/></svg>","intro":"Hi, this is the Marlbrow chat. Ask about drives, patios, gardens, drainage or footings, or start a quote.","main":["Driveways","Resin, block paving or tarmac?","Patio or landscaping","Drainage or footings","Do you cover my area?","How does a quote work?","What happens after the job?"],"quoteLabel":"Start a quote","quoteRe":"\\b(start a quote|get a quote|want a quote|need a quote|price|prices|cost|how much|estimate|book)\\b","services":["Driveway","Patio","Landscaping","Drainage","Groundworks or footings","Fencing","Something else"],"fallback":"I'm not sure about that one, but the team will know. The quickest way is to start a quote and tell them what you need.","answers":[["resin|block|tarmac|asphalt|finish|which (is )?best","We lay all three. Block paving is tough and easy to repair a section of. Resin is a smooth finish that water drains through when it's on the right base. Tarmac is quick and suits long drives and slopes. Which one suits you depends on the look, the slope and the drainage, so we'll go through it on the visit."],["drive|driveway|parking|car","Yes, drives are a big part of what we do: block paving, resin and tarmac. Every one gets a full dig-out and a compacted base, because that's what stops it sinking. We sort the drainage at the same time."],["patio|slab|sandstone|porcelain","Yes, we lay sandstone, porcelain and slab patios on a full bed, with a gentle fall away from the house so rain runs off the right way."],["landscap|garden|lawn|turf|plant|border|path|gravel","Yes. Lawns, borders, planting, paths and gravel. Lots of jobs are a patio, a lawn and a fence together, which saves digging twice."],["drain|soakaway|flood|puddle|gully|water","Yes, we do drainage: channel drains, connecting downpipes, soakaways where the ground suits them, and sorting out water that sits where it shouldn't. Whether a soakaway will work depends on your ground, so it's best to ask on the quote."],["footing|foundation|extension|groundwork|base|slab|garden room|clearance|level","Yes, we dig footings to your architect's or engineer's drawings, lay bases for garden rooms and sheds, and clear and level sites. We always check for buried pipes and cables before we dig."],["fence|fencing|gate|panel|post","Yes, close board, panels, picket and gates, on posts set in concrete, with gravel boards to keep the timber off the soil."],["area|cover|postcode|where|ormskirk|burscough|aughton|lathom|skelm|maghull|rufford|l39|l40|wn8","We're based in Ormskirk (sample) and cover Burscough, Aughton, Lathom, Skelmersdale, Maghull and Rufford. If you're just outside that, ask: we often are too."],["how does .*quote|quote work|visit|survey|come out|look at","We come out, measure up, check levels and drainage, and talk through what you want. Then you get a written quote saying what we'll dig, what goes underneath, the finish and how long it takes. We don't price without seeing it."],["after|aftercare|finished|handover|review|check in|warranty|guarantee","When we finish, we walk it with you and leave care notes. The same day you'll get a thank-you message, then a link to leave a Google review if you'd like to, and a check-in a few weeks later to see how it's settling."],["how long|when can|start|busy|soon","It depends on the job and the time of year. Once we've been to look, the quote will say how long the work takes and when we could start."],["hello|hi\\b|hey|morning|afternoon","Hello. What are you thinking of having done? Ask a question, or start a quote."]]};
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
