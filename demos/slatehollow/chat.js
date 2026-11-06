window.DEMO_CHAT={"name":"Slatehollow Roofing","open":"Ask Slatehollow","mark":"<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect width=\"32\" height=\"32\" rx=\"6\" fill=\"#1D2329\"/><path d=\"M4 18 16 7l12 11\" fill=\"none\" stroke=\"#9CC6EE\" stroke-width=\"3\" stroke-linejoin=\"round\"/><path d=\"M8 22h16M10 26h12\" stroke=\"#EEEBE5\" stroke-width=\"2.4\" stroke-linecap=\"round\"/></svg>","intro":"Now then. I'm the Slatehollow chat. Ask about leaks, re-roofs, flat roofs or gutters, or book an inspection.","main":["Leak after the storm","Repair or new roof?","How does a photo quote work?","Do you do flat roofs?","Do you cover my area?","Book an inspection"],"bookLabel":"Book an inspection","bookRe":"\\b(book|appointment|inspection|visit|call ?back|come out)\\b","bookAsk":"Sure. What would you like?","services":["Roof inspection","Call back","Leak repair visit","Re-roof quote visit","Gutter and fascia visit"],"slots":["Morning (8am to 12)","Afternoon (12 to 5pm)"],"doneNote":"On the real site, the yard would text to confirm.","fallback":"Good question. The quickest way to an answer is a photo quote: three photos from the ground and a line about it.","answers":[["leak|storm|water (coming|through)|drip|ceiling","Sorry to hear that. First: don't go up a ladder. Catch drips inside and keep away from any wet electrics. Take photos from the ground, then use the red Emergency button for our number. We'll get a temporary cover on as soon as we can (sample)."],["repair or|new roof|replace|re-?roof","Most roofs can be repaired. If slates are slipping all over, there are lots of old patches, or the ridge is sagging, it may be time for a new one. Send three photos from the ground and we'll tell you honestly."],["photo quote|how does|photo","Take a wide photo of the roof from the ground, then a couple closer up of the problem. Upload them with a line about what's wrong. We come back with a view and a quote, usually within a working day (sample)."],["how long|take|weeks|days","A typical terrace re-roof takes one to two weeks (sample), weather depending. A flat roof on a garage or extension is usually one or two days (sample)."],["flat","Yes: felt, rubber and fibreglass, on extensions, garages and dormers. Send a photo and we'll recommend one."],["gutter|fascia|soffit|downpipe","Yes, we renew gutters, fascias, soffits and downpipes. Overflowing gutters are usually a blockage, a sag or too little fall."],["chimney|stack|flashing|lead","We repoint chimneys, replace pots and fit new lead flashing. Damp on a chimney breast is often water getting in at the flashing."],["area|cover|where|rawtenstall|bacup|haslingden|ramsbottom|accrington|rossendale","We're based in Rawtenstall (sample) and cover Bacup, Haslingden, Ramsbottom and Accrington. Just outside? Ask anyway."],["price|cost|how much|quote","We don't give prices in the chat because every roof's different. A photo quote is the quickest way to a clear price."],["hello|hi\\b|hiya|hey|now then","Now then. What's up with your roof?"]]};
/* Demo chat. Scripted answers only, written for this trade. No server, no keys: nothing is sent or saved. */
(function () {
  var C = window.DEMO_CHAT; if (!C) return;
  var d = document;
  var btn = d.createElement('button');
  btn.className = 'chat-btn'; btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', C.open);
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg><span class="chat-btn__t">' + C.open + '</span>';
  var box = d.createElement('div');
  box.className = 'chat'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Chat with ' + C.name); box.hidden = true;
  box.innerHTML = '<div class="chat__top"><span class="chat__who">' + C.mark + '<span><b>' + C.name + '</b><small>Demo chat. Scripted answers.</small></span></span><button class="chat__x" type="button" aria-label="Close the chat">&times;</button></div>' +
    '<div class="chat__log" aria-live="polite"></div>' +
    '<form class="chat__in"><label class="skip" for="chatq">Your message</label><input id="chatq" autocomplete="off" placeholder="Type a question"><button type="submit">Send</button></form>' +
    '<p class="chat__demo">Demo chat. Nothing you type is sent or saved.</p>';
  d.body.appendChild(btn); d.body.appendChild(box);
  var log = box.querySelector('.chat__log'), form = box.querySelector('form'), input = box.querySelector('input');
  var started = false, flow = null, data = {};
  var A = C.answers.map(function (a) { return [new RegExp(a[0], 'i'), a[1]]; });

  function say(text, who) {
    var m = d.createElement('div'); m.className = 'msg msg--' + (who || 'bot');
    if (who === 'me') m.textContent = text; else m.innerHTML = text;
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  }
  function typing(then, ms) {
    var t = d.createElement('div'); t.className = 'msg msg--bot msg--typing'; t.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(t); log.scrollTop = log.scrollHeight;
    setTimeout(function () { t.remove(); then(); }, ms || 450);
  }
  function chips(list) {
    var c = d.createElement('div'); c.className = 'chips';
    list.forEach(function (l) {
      var b = d.createElement('button'); b.type = 'button'; b.textContent = l;
      b.addEventListener('click', function () { c.remove(); handle(l); });
      c.appendChild(b);
    });
    log.appendChild(c); log.scrollTop = log.scrollHeight;
  }
  function after() { chips([C.bookLabel, 'Something else']); }

  function days() {
    var out = [], dt = new Date(), names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    while (out.length < 5) { dt.setDate(dt.getDate() + 1); if (dt.getDay() !== 0) out.push(names[dt.getDay()] + ' ' + dt.getDate() + ' ' + mon[dt.getMonth()]); }
    return out;
  }
  var STEPS = [
    ['service', function () { return C.bookAsk; }, function () { return C.services; }],
    ['day', function () { return 'Which day suits you?'; }, days],
    ['slot', function () { return 'And roughly when?'; }, function () { return C.slots; }],
    ['name', function () { return 'Your first name?'; }, null],
    ['phone', function () { return 'Best mobile number to confirm on?'; }, null]
  ];
  var si = 0;
  function ask() { var s = STEPS[si]; typing(function () { say(s[1]()); var opts = s[2] && s[2](); if (opts) chips(opts); else input.focus(); }); }
  function startBooking() { flow = 'book'; si = 0; data = {}; ask(); }
  function step(text) {
    var key = STEPS[si][0];
    if (key === 'phone' && !/^[0-9 +()]{10,16}$/.test(text.trim())) { typing(function () { say('That doesn\'t look like a phone number. Try again, for example 07700 900123.'); }); return; }
    if (key === 'name' && !text.trim()) return;
    data[key] = text.trim(); si++;
    if (si < STEPS.length) return ask();
    flow = null;
    typing(function () {
      say('<b>Booked in (demo).</b><br>' + data.service + '<br>' + data.day + ', ' + data.slot.toLowerCase() + '<br>For ' + esc(data.name) + ' on ' + esc(data.phone));
      say(C.doneNote + ' <b>This is a demo: nothing has been booked, sent or saved.</b>');
      chips(['Something else']);
    }, 700);
  }
  function esc(s) { var x = d.createElement('i'); x.textContent = s; return x.innerHTML; }

  function handle(text) {
    say(text, 'me');
    if (flow) return step(text);
    if (text === C.bookLabel || new RegExp(C.bookRe, 'i').test(text)) return startBooking();
    if (/something else/i.test(text)) return typing(function () { say('Sure. What would you like to know?'); chips(C.main); });
    for (var i = 0; i < A.length; i++) if (A[i][0].test(text)) { var a = A[i][1]; return typing(function () { say(a); after(); }, 550); }
    typing(function () { say(C.fallback); after(); }, 500);
  }

  function open() {
    box.hidden = false; btn.setAttribute('aria-expanded', 'true'); d.documentElement.classList.add('chat-open');
    if (!started) { started = true; typing(function () { say(C.intro); chips(C.main); }, 350); }
    setTimeout(function () { input.focus(); }, 60);
  }
  function close() { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); d.documentElement.classList.remove('chat-open'); btn.focus(); }
  btn.addEventListener('click', function () { box.hidden ? open() : close(); });
  box.querySelector('.chat__x').addEventListener('click', close);
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; handle(v); });
  Array.prototype.forEach.call(d.querySelectorAll('[data-chat]'), function (b) { b.addEventListener('click', function (e) { e.preventDefault(); open(); if (b.getAttribute('data-chat') === 'book' && !flow) setTimeout(function () { handle(C.bookLabel); }, 900); }); });
})();
