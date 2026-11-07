window.DEMO_CHAT={"name":"Lunebrook Damp & Timber","open":"Ask Lunebrook","mark":"<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><path d=\"M16 2.5 27 6.6v8.2c0 7-4.6 12.4-11 14.7C9.6 27.2 5 21.8 5 14.8V6.6z\" fill=\"#142226\"/><path d=\"M16 8.5s4.6 4.9 4.6 8.1a4.6 4.6 0 0 1-9.2 0c0-3.2 4.6-8.1 4.6-8.1z\" fill=\"#7FE0D3\"/><path d=\"M9 23.2c2.2-1 4.6-1 7 0s4.8 1 7 0\" fill=\"none\" stroke=\"#F4F7F7\" stroke-width=\"1.6\" stroke-linecap=\"round\"/></svg>","intro":"Hello, I'm the Lunebrook chat. Ask about condensation, damp walls, woodworm or cellars, or book a survey.","main":["Condensation or rising damp?","Signs of woodworm","Do you do basements?","How does a survey work?","Do you cover my area?","How soon can someone come?","Book a survey"],"bookLabel":"Book a survey","bookRe":"\\b(book|appointment|survey slot|visit|call ?back|come out)\\b","bookAsk":"Happy to. What's it for?","services":["Damp survey","Condensation and mould","Woodworm or rot check","Basement or cellar","Call back"],"slots":["Morning (8am to 12)","Afternoon (12 to 5pm)"],"doneNote":"On the real site, the office would ring to confirm the time.","fallback":"Good question. The surest answer comes from a survey: we find the cause and explain it in writing. Want to book one?","answers":[["condensation or|rising damp|tide mark|difference","Condensation usually shows as streaming windows and black spots in corners, worse in winter. Damp low on ground floor walls with a tide mark and salty plaster could be rising damp, but is often water from outside. A survey tells you which."],["condensation|mould|mold|window","Condensation is the most common damp we see. It's usually about moisture from cooking, showers and washing with nowhere to go. Extractor fans that vent outside often make the biggest difference."],["woodworm|holes|beetle|dust","Small round holes with fine dust underneath are the classic sign. Many holes are old and inactive. Fresh pale dust is the thing to ask about. Please don't treat it yourself before it's checked."],["rot|soft|spongy|fungus","Rot always starts with water, so we find and stop the source first, then repair the timber. Soft or crumbling wood is worth getting looked at soon."],["basement|cellar","Yes, we do basements and cellars. We start by finding out how wet it is and why, then talk about what you'd like to use it for: storage, or a proper room."],["survey|how does|report","We look inside and out: readings room by room, gutters, ground levels, airbricks and under the floor where we can. Then you get a written report with photos, the cause, and what we'd do in order."],["how soon|when can|quick|urgent|asap","Usually within a week or so (sample). If something's getting worse fast, ring the office and we'll do our best."],["area|cover|where|lancaster|morecambe|carnforth|garstang|heysham","We're based in Lancaster (sample) and cover Morecambe, Carnforth, Garstang and Heysham. Just outside? Ask anyway."],["price|cost|how much|quote","We don't give prices in the chat, because it depends on the cause. After the survey you get a written report with a clear quote for each step."],["inject|diy|myself|cream","We'd ask you not to inject or treat anything yourself before a survey. A lot of damp isn't rising damp at all, so it may not help."],["hello|hi\\b|hiya|hey|morning|afternoon","Hello. What's the damp doing?"]],"satSlots":null};
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
    // Sundays are closed everywhere. Saturdays only where the demo's sample hours open on a Saturday (satSlots).
    while (out.length < 5) { dt.setDate(dt.getDate() + 1); var g = dt.getDay(); if (g !== 0 && (g !== 6 || C.satSlots)) out.push(names[g] + ' ' + dt.getDate() + ' ' + mon[dt.getMonth()]); }
    return out;
  }
  var STEPS = [
    ['service', function () { return C.bookAsk; }, function () { return C.services; }],
    ['day', function () { return 'Which day suits you?'; }, days],
    ['slot', function () { return 'And roughly when?'; }, function () { return /^Sat /.test(data.day || '') && C.satSlots ? C.satSlots : C.slots; }],
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
