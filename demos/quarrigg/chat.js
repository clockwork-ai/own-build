window.DEMO_CHAT={"name":"Quarrigg Builders","open":"Ask Quarrigg","mark":"<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect width=\"32\" height=\"32\" rx=\"7\" fill=\"#23261F\"/><path d=\"M5 26V14l7.5-5.5L20 14v12\" fill=\"none\" stroke=\"#F4F1EA\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/><path d=\"M20 19h7v7\" fill=\"none\" stroke=\"#B9711F\" stroke-width=\"2.4\" stroke-linejoin=\"round\"/></svg>","intro":"Hello, this is the Quarrigg chat box. Ask about extensions, conversions, knock throughs, renovations or brickwork, or start a quote.","main":["House extensions","Loft or garage conversion","Knock through and steel beam","Renovation or refurbishment","Brickwork and repointing","Do I need planning permission?","Can we stay in the house?","Do you cover my area?"],"quoteLabel":"Start a quote","quoteRe":"\\b(start a quote|get a quote|want a quote|need a quote|price|prices|cost|how much|estimate|quote)\\b","services":["House extension","Loft or garage conversion","Knock through or steel beam","Renovation or refurbishment","Brickwork or repointing","Garden wall or small structure","Something urgent","Not sure yet"],"fallback":"I am not sure about that one, but the lads will know. The quickest way is to start a quote and say what you are after.","answers":[["planning permission|planning|permitted development","It depends on the size, the height and where it sits. Plenty of single storey rear extensions fall under permitted development, but there are limits, and they are tighter on flats, listed buildings and conservation areas. We would never tell you it is certain. Check with your council's planning team, or ask us on the visit and we will say what we think you are looking at."],["building regs|building regulation|regs|sign off|completion certificate","Yes, an extension or a structural alteration needs building regulations approval, and that is separate from planning. The council or an approved inspector visits at set stages and signs it off at the end. We work to what the inspector wants and book the visits in as we go."],["how long|timescale|weeks|months|take","It depends on the size and the ground. A straightforward single storey extension is usually a few months on site once we start, longer if the drains or the levels throw something up. The quote says how long yours should take (sample)."],["stay in|live in|move out|kids|dog|kitchen","Most people stay put. We keep the house sealed off from the work with dust screens, and we tell you up front which days will be noisy or dusty and when the water or power needs turning off. If the kitchen is coming out we talk about a temporary set up before we start."],["drawing|architect|plan|designer|technician","Either way works. If you already have drawings, bring them. If you have not, we can point you at an architect or an architectural technician we have worked with, and they do the drawings and the application. We do not pretend to be designers, we build what is drawn."],["party wall|neighbour|next door","If you are building up to or on a shared wall, or digging near next door's foundations, you may need a party wall agreement. It is a notice to the neighbour and, if they do not just agree, a surveyor sorts it out. It is worth starting early because it has its own timescales. Have a read of our advice page on it."],["loft|dormer|attic|conversion|garage","Yes. We do the structural side of loft and garage conversions: steels, floor, dormer openings, blocking up the garage door, insulation and making it weathertight. First and second fix trades come in behind us and we keep them in order."],["steel|knock through|rsj|beam|wall removal|open plan","Yes. Knock throughs and steel beams are everyday work for us. The beam gets sized by a structural engineer first, never guessed, then we prop properly, cut the opening, set the steel on padstones and make good. Building control sees it before it is covered up."],["brick|repoint|pointing|mortar|lime|chimney","Yes. New brickwork and stonework, rebuilds, and repointing in the right mortar. On older stone and soft brick that usually means a lime mortar, not hard cement, because cement traps damp in the wall and chews the face off the stone."],["wall|gate post|pier|patio|step|bin store|planter","Yes, we build garden walls, piers, steps, bin stores and small structures. Proper footings, the right mortar and a coping on top so it sheds water."],["urgent|emergency|storm|car hit|vehicle|collapse|lintel|crack|unsafe|made safe","Give us a ring and tell us what has happened. We will ask a few questions and tell you honestly whether it sounds urgent or whether it can wait for a proper look. If anything is loose over a path, a drive or the road, keep people well clear of it first. We do not promise a time until we know what it is."],["area|cover|where|halifax|huddersfield|brighouse|elland|sowerby|calder|west yorkshire","We are based in West Yorkshire (sample) and cover Halifax, Huddersfield, Brighouse, Elland and Sowerby Bridge. If you are just outside, ask anyway."],["how does .*quote|quote work|visit|survey|come out|look at","We come out, have a look, measure up and go through what you want. Then you get a written quote setting out the work, what is included and what is not, and roughly how long it takes. We do not price an extension off a photo."],["guarantee|insurance|accredit|member|scheme|certificate","This is a demo site for a made up firm, so there is nothing real to show you here. On a real site this is where a builder would put whatever they genuinely hold, and nothing they do not."],["hello|hi\\b|hiya|hey|morning|afternoon|now then","Hello. What are you thinking of having done? Ask a question, or start a quote."]]};
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
      if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(text.trim())) { bot('That does not look like a full UK postcode. Try something like HX1 1AA.'); return; }
      q.postcode = text.trim().toUpperCase(); step = 'name'; bot('Got it. And your first name?'); return;
    }
    if (step === 'name') {
      if (text.trim().length < 2) { bot('Just a first name is fine.'); return; }
      q.name = text.trim().split(/\s+/)[0]; step = 'phone'; bot('Thanks, ' + q.name + '. What is the best number to reach you on?'); return;
    }
    if (step === 'phone') {
      if (text.replace(/[^\d]/g, '').length < 10) { bot('That number looks a bit short. Could you check it?'); return; }
      step = null;
      bot('Thanks, ' + q.name + '. That is a ' + q.service.toLowerCase() + ' quote at ' + q.postcode + '. On a real site the office would ring you to arrange a look.', function () {
        bot('This is a demo, so nothing has been sent or saved and nobody will call.', more);
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
  Array.prototype.forEach.call(d.querySelectorAll('[data-chat]'), function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); if (b.getAttribute('data-chat') === 'quote' && !step) setTimeout(function () { handle(C.quoteLabel); }, 900); }); });
})();
