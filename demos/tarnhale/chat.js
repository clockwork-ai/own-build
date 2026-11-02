/* Tarnhale demo chat. Scripted answers only. Nothing is sent or saved. */
(function () {
  var MARK = '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M2.5 21.5 L12 9 L21.5 21.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  var btn = document.createElement('button');
  btn.className = 'chat-btn'; btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>Ask Tarnhale';
  var box = document.createElement('div');
  box.className = 'chat'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Chat with Tarnhale');
  box.innerHTML = '<div class="chat__top"><span class="brand">' + MARK + '<span>Tarnhale</span></span><small>Demo chat</small><button class="chat__x" type="button" aria-label="Close the chat">&times;</button></div>' +
    '<div class="chat__log" aria-live="polite"></div>' +
    '<form class="chat__in"><label class="skip" for="chatq">Your message</label><input id="chatq" autocomplete="off" placeholder="Type a question"><button type="submit">Send</button></form>' +
    '<p class="chat__demo">Demo chat. Nothing you type is sent or saved.</p>';
  document.body.appendChild(btn); document.body.appendChild(box);
  var log = box.querySelector('.chat__log'), form = box.querySelector('form'), input = box.querySelector('input');
  var started = false, flow = null, data = {};

  function say(text, who) {
    var m = document.createElement('div'); m.className = 'msg msg--' + (who || 'bot'); m.textContent = text;
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  }
  function chips(list) {
    var c = document.createElement('div'); c.className = 'chips';
    list.forEach(function (l) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = l;
      b.addEventListener('click', function () { c.remove(); handle(l); });
      c.appendChild(b);
    });
    log.appendChild(c); log.scrollTop = log.scrollHeight;
  }
  var MAIN = ['Book a consultation', 'Do I need planning?', 'How do fees work?', 'Where do you work?', 'How long does it take?'];

  var A = [
    [/plan(ning)?|permission|permitted/i, "It depends on the house and the area. Many single-storey rear extensions fall under permitted development (work you can do without a full application), but there are limits, and flats, listed buildings and conservation areas are different. We check this on the first visit, so you know before you spend anything."],
    [/fee|cost|price|how much|charge|budget|expensive/i, "Every project is different, so we don't quote fees in a chat. After the free consultation we agree a fixed fee for each stage, so you know where you stand before any work starts."],
    [/where|area|cover|travel|lancaster|kendal|preston|lakes/i, "We're based in Lancaster and work across the North West: Morecambe, Kendal, the Lune Valley, Arnside, the Ribble Valley, Preston, the Fylde and the South Lakes."],
    [/long|time|weeks|months|how soon|start/i, "As a rough guide: a few weeks for design, then planning, which councils usually aim to decide in about 8 weeks for a householder application, then technical drawings. Every project's different, and we'll give you a clearer timeline after the site visit."],
    [/barn|convert|conversion|chapel/i, "We love conversions. If you're thinking of buying a barn, we can look at it with you before you make an offer, and tell you honestly what's likely to be allowed."],
    [/extension|extend|kitchen|back room/i, "Extensions are a big part of what we do. We'll measure up, show you two or three options, and sort out planning or permitted development."],
    [/new build|new home|plot|self.?build/i, "We design one-off homes, often on sloping or rural plots. If you've found a plot, we can do a quick check on planning before you buy."],
    [/builder|contractor|build it/i, "We don't build ourselves, but we'll help you find and choose a builder, and visit site at key stages."],
    [/hello|hi\b|hey/i, "Hello. What's the project? You can ask me anything, or book a free consultation."]
  ];

  function handle(text) {
    say(text, 'me');
    if (flow) return step(text);
    if (/book|consult|appointment|call|meet|visit/i.test(text)) return startBooking();
    for (var i = 0; i < A.length; i++) if (A[i][0].test(text)) { setTimeout(function (a) { say(a); chips(['Book a consultation', 'Something else']); }.bind(null, A[i][1]), 350); return; }
    if (/something else/i.test(text)) { setTimeout(function () { say('Sure. What would you like to know?'); chips(MAIN); }, 300); return; }
    setTimeout(function () { say("I'm not sure about that one, but the studio can help. The easiest way is a free 30 minute consultation."); chips(['Book a consultation', 'Something else']); }, 350);
  }

  var Q = [
    ['type', 'Great. What kind of project is it?', ['Extension', 'New home', 'Conversion', 'Interior', 'Not sure']],
    ['where', 'Where is it? A town or postcode is fine.', null],
    ['when', 'When suits you for a 30 minute call?', ['Weekday morning', 'Weekday afternoon', 'Early evening']],
    ['name', "And your name?", null],
    ['contact', 'Best email or phone number for the studio to confirm?', null]
  ];
  var qi = 0;
  function startBooking() { flow = 'book'; qi = 0; data = {}; setTimeout(ask, 300); }
  function ask() { var q = Q[qi]; say(q[1]); if (q[2]) chips(q[2]); input.focus(); }
  function step(text) {
    data[Q[qi][0]] = text; qi++;
    if (qi < Q.length) return setTimeout(ask, 300);
    flow = null;
    setTimeout(function () {
      say('Thanks ' + (data.name || '').split(' ')[0] + '. That\'s a ' + (data.type || 'project').toLowerCase() + ' in ' + data.where + ', with a call on a ' + data.when.toLowerCase() + '.');
      say("On a live site, the studio would get this straight away and confirm a time with you.");
      var n = document.createElement('div'); n.className = 'msg msg--note'; n.textContent = 'Demo only. Nothing was sent or saved.'; log.appendChild(n);
      chips(['Something else']);
    }, 400);
  }

  function open(intent) {
    box.classList.add('is-open'); btn.style.visibility = 'hidden'; btn.setAttribute('aria-expanded', 'true');
    if (!started) { started = true; say("Hello, I'm the Tarnhale assistant. I can answer quick questions or book you a free consultation."); if (intent === 'book') { handle('Book a consultation'); } else chips(MAIN); }
    else if (intent === 'book' && !flow) handle('Book a consultation');
    setTimeout(function () { input.focus(); }, 300);
  }
  function close() { box.classList.remove('is-open'); btn.style.visibility = ''; btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  btn.addEventListener('click', function () { open(); });
  box.querySelector('.chat__x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('is-open')) close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; var c = log.querySelector('.chips:last-child'); if (c) c.remove(); handle(v); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-chat-open]'), function (b) {
    b.addEventListener('click', function () { open(b.getAttribute('data-chat-intent')); });
  });
})();
