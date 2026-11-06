window.DEMO_CHAT={"name":"Ginnel Electrical","open":"Ask Ginnel","mark":"<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect width=\"32\" height=\"32\" rx=\"8\" fill=\"#101317\"/><rect x=\"1\" y=\"1\" width=\"30\" height=\"30\" rx=\"7\" fill=\"none\" stroke=\"#FFC629\" stroke-opacity=\".35\"/><path d=\"M18 5 9 18h6l-2 9 10-14h-6z\" fill=\"#FFC629\"/></svg>","intro":"Hi, I'm the Ginnel chat. Ask about EV chargers, fuse boards, rewires or landlord EICRs, or book a visit.","main":["EV charger","Fuse board keeps tripping","Landlord EICR","Do I need a rewire?","Do you cover my area?","Book a visit"],"bookLabel":"Book a visit","bookRe":"\\b(book|appointment|visit|come out|booking)\\b","bookAsk":"Great. What's the visit for?","services":["EV charger survey","Rewire visit","Consumer unit check","Fault finding","Landlord EICR"],"slots":["Morning (8am to 12)","Afternoon (12 to 5pm)"],"doneNote":"On the real site, the office would text to confirm the time.","fallback":"I'm not sure about that one, but the team can help. The quickest way is a quote request, or book a visit here.","answers":[["ev|charger|charge point|electric car|tesla|wallbox","Yes, we fit home EV chargers. You'll usually need off-street parking and room on your fuse board for one more circuit. Send a photo of your board and where you park and we can quote from that. We handle the network operator paperwork too."],["eicr|landlord|letting|tenant|rental|certificate","An EICR is an inspection of the fixed wiring in a property. In England, private landlords need one at least every five years, or sooner if the report says so. We arrange access with your tenant and send the report the same week (sample)."],["trip|tripping|keeps going off|rcd","If your board keeps tripping, unplug things on that circuit and reset the switch once. If it stays on, plug things back one at a time to find the culprit. If it trips with nothing plugged in, leave it off and book us in: it's usually quick to find."],["rewire|old wiring|rubber|fabric|round pin","Signs you might need a rewire: very old rubber or fabric cable, no earth on the lighting, round-pin sockets, or a very old board. An inspection tells you for sure. We plan rewires room by room so you know what's happening each day."],["consumer unit|fuse ?board|fuse box|fuses","The consumer unit (fuse board) is the box that splits your supply into circuits and protects them. Modern ones have RCDs that switch off fast if something goes wrong. If yours has fuse wire or no RCD, it's worth a look."],["how soon|when can|today|tomorrow|urgent|quick","For emergencies, use the red Emergency button for the number. For everything else, we usually reply the same working day and can often visit within the week (sample)."],["area|cover|postcode|rochdale|bury|oldham|heywood|littleborough|where","We're based in Rochdale (sample) and cover Bury, Oldham, Heywood and Littleborough too. If you're just outside, ask: we often are."],["price|cost|how much|quote|cheap|expensive","We don't give prices in the chat because every home is different. Send a quote request with a photo of your board and you'll get a fixed quote before anything starts."],["spark|burning|smell|smoke|fire|shock","Safety first: if you smell burning or see sparks, switch off at the main switch if it's safe to reach, don't touch the fitting, and keep everyone away. If there's smoke, fire or someone's had a shock, call 999. Then use the red Emergency button for our number."],["hello|hi\\b|hey|morning|afternoon","Hello. What's going on with your electrics? You can ask a question or book a visit."]]};
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
