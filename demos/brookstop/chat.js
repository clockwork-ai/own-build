window.DEMO_CHAT={"name":"Brookstop Plumbing & Heating","open":"Ask Brookstop","mark":"<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect width=\"32\" height=\"32\" rx=\"16\" fill=\"#14223B\"/><path d=\"M16 6.5s7 7.4 7 12.4a7 7 0 0 1-14 0c0-5 7-12.4 7-12.4z\" fill=\"#C8692E\"/><path d=\"M12.5 19.5a3.5 3.5 0 0 0 3.5 3.5\" stroke=\"#F7F2EA\" stroke-width=\"1.8\" fill=\"none\" stroke-linecap=\"round\"/></svg>","intro":"Hiya, I'm the Brookstop chat. Ask about boilers, radiators, leaks or bathrooms, or book someone in.","main":["Do you cover my postcode?","What's a power flush?","Radiators have cold spots","I have a leak right now","Book a visit"],"bookLabel":"Book a visit","bookRe":"\\b(book|appointment|visit|come out|booking)\\b","bookAsk":"No problem. What's it for?","services":["Boiler repair","Boiler service","Power flush","Radiators","Bathroom quote visit","Leak or burst pipe"],"slots":["Morning (8am to 12)","Afternoon (12 to 6pm)"],"doneNote":"On the real site, the office would text to confirm the time.","fallback":"Good question. The team can help with that one. The quickest way is a quote request, or book a visit here.","answers":[["leak|burst|flood|water (coming|pouring|through)|dripping","Right, first things first: turn off your stopcock (usually under the kitchen sink). Keep away from any wet electrics. Then use the red Emergency call-out button for our 24 hour number (sample)."],["gas|smell","If you smell gas: don't use switches or flames, open the windows, leave the property and call the National Gas Emergency number on 0800 111 999."],["postcode|cover|area|chorley|preston|leyland|wigan|ormskirk|where","We're based in Chorley (sample) and cover Preston, Leyland, Wigan and Ormskirk too. Pop your postcode in the quote form and we'll confirm."],["power ?flush|sludge|flush","A power flush pushes the sludge out of your heating system with a machine, radiator by radiator, then protects it with inhibitor. It usually takes most of a day (sample). Signs you need one: cold spots at the bottom of radiators, dark water when you bleed them, noisy pipes."],["cold spot|cold at the|not heating|radiator","Cold at the top is usually trapped air, so bleeding the radiator often sorts it. Cold at the bottom usually means sludge, which is where a power flush helps. If it's one radiator only, it might be a valve. We can take a look."],["how soon|when can|today|tomorrow|urgent","Emergencies: use the red button for the 24 hour line. For everything else we aim to reply the same day and can usually visit within a few days (sample)."],["bathroom|shower|bath|toilet|loo","Yes, we do full bathroom refits as well as new showers and fixes. We'll visit, measure up, and give you a clear quote and a day-by-day plan."],["quote|price|cost|how much","Quotes are free and fixed before we start (sample). We don't give prices in the chat because every home's different. Send a quote request with a photo and we'll come back the same day."],["service|annual|yearly|boiler","A boiler service is a yearly check and clean to keep it running safely and efficiently. If your boiler's broken down, we'll find the fault and explain it before fixing anything."],["hello|hi\\b|hiya|hey|morning","Hiya. What's going on? Ask away, or book a visit."]]};
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
