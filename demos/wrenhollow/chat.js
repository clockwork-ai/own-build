window.DEMO_CHAT={"name":"Wrenhollow Bathrooms","open":"Ask Wrenhollow","mark":"<svg viewBox=\"0 0 32 32\" aria-hidden=\"true\"><rect width=\"32\" height=\"32\" rx=\"9\" fill=\"#2A2330\"/><path d=\"M6 17h20v3a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z\" fill=\"none\" stroke=\"#F7F4F6\" stroke-width=\"2.2\" stroke-linejoin=\"round\"/><path d=\"M16 17V9h5\" fill=\"none\" stroke=\"#DDC3CE\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"21\" cy=\"9\" r=\"2.1\" fill=\"#7D4A64\"/></svg>","intro":"Hello, this is the Wrenhollow chat box. Ask about refits, shower rooms, wet rooms, tiling or a leak, or book a visit.","main":["How long does a refit take?","Do you supply the suite?","Will I be without a toilet?","Wet room or walk in shower?","Do you cover my postcode?","Book a visit"],"bookLabel":"Book a visit","bookRe":"\\b(book|appointment|visit|come out|booking|come and look|measure up)\\b","bookAsk":"Happy to. What is it you are after?","services":["Full bathroom refit","Shower room or en suite","Wet room or walk in shower","Accessible bathroom","Bathroom tiling","Small repair or leak","Not sure yet"],"slots":["Morning (8am to 12)","Afternoon (12 to 5.30pm)"],"satSlots":["Morning (9am to 12)"],"doneNote":"On the real site the office would text you to confirm the time.","fallback":"Good question. I have not got a scripted answer for that one, but it is worth asking on the visit. Book a visit here and put it to whoever comes out.","answers":[["leak|leaking|water (coming|through|dripping)|drip|ceiling|flood|burst|overflow","First thing: stop the water. Turn the shower or the tap off, and if it is still coming, isolate the supply at the valve under the basin or at the stopcock, usually under the kitchen sink. Keep away from any light fitting or socket near a wet patch, and do not switch it on to see if it still works. Put a bowl and a towel under the drip, then use the urgent button at the top of the page to ring us and tell us what you have got. There is more on the urgent help page."],["how long|timescale|days|weeks|refit take|take to","A straightforward full bathroom refit in an average British bathroom is usually around one to two weeks on site, start to finish. A shower room or an en suite is normally quicker. What stretches it is moving the toilet or the soil pipe, bad floorboards or plaster you only find once the old suite is out, and tiles with a pattern that has to be set out properly. Your quote says how long yours should take (sample)."],["supply|who buys|buy the suite|suite or|provide the|source the|merchant|showroom","Either way suits us. Plenty of people pick their own suite and tiles and we fit what turns up. Others would rather we sorted the lot, and then we put together a list of what we would use and you say yes or no to it. What we do ask is that everything is on site and checked before we start, because a missing waste or a cracked basin on day one holds the whole job up."],["plumb.*tile.*electric|one job|all the trades|everything|plumbing and tiling|electrics|electrician|spark|extractor|shaver|lighting","The plumbing, the tiling, the plastering and the fitting are all ours, so one team does the bulk of it. Anything electrical, so a new extractor fan, downlights, a shaver socket or an electric shower, is done by a qualified electrician we work with and booked in at the right stage. We just make sure nobody turns up in the wrong order."],["without a toilet|no toilet|loo|wc|one bathroom|only bathroom|use the toilet","Not for long. On a one bathroom house we normally lift the old toilet out and put it straight back on a temporary connection at the end of the day, so you have a working toilet overnight. There is usually a day or two in the middle, when the floor is going down or the soil connection is being moved, where it cannot go back. We tell you which days those are before we start rather than on the morning."],["mobility|limited mobility|wheelchair|disabled|grab rail|elderly|mum|dad|level access|walk in|accessible","Yes, that is a good part of the work. It usually means a level access shower instead of a bath, a slip resistant floor, grab rails fixed into something solid rather than into plasterboard, a seat in the shower, lever taps and a comfort height toilet. We come and look at the room and talk about who is using it and how, because the right answer for somebody using a frame is not the same as for somebody in a wheelchair. Your local council may have a scheme that helps with the cost of adapting a bathroom, so it is worth asking them before you commit."],["wet room|wetroom|walk in shower|which suits|tanking","A wet room means the whole floor is the shower: it is tanked, sloped to a drain and tiled through, with no tray. A walk in shower is a tray and a screen, sat in a normal bathroom floor. A wet room is better for level access and it looks seamless, but it needs floor depth for the slope and the drain, and it has to be tanked properly or you have a problem you cannot see. A walk in shower is simpler, cheaper to put right and fine in most houses. There is an advice page comparing the two."],["postcode|cover|area|cheshire|where are you|travel|near","We are based in Cheshire (sample) and the areas page lists the towns we cover most. Tell me your postcode, or put it on the booking, and we will say straight away whether you are in or out."],["tile|tiling|grout|large format|mosaic|porcelain|ceramic","We tile the bathrooms we fit and we also do tiling on its own, including a wall somebody else has made a mess of. Large format porcelain is the usual ask now, and it is the one that most needs a flat wall and levelling clips, or the lippage shows on every joint. We set the tiles out before any adhesive goes on, so the cuts land somewhere sensible instead of a 10mm sliver in the middle of the wall."],["sealant|silicone|mould|black|loose tile|cracked grout|small job|repair","Yes, we do the small ones. Mouldy or split sealant round a bath or a tray, a loose tile or two, grout that has gone, a shower door that drips down the outside. They are worth sorting early, because the thing that turns a 20 pound sealant job into a new floor is water getting under it for a year."],["price|cost|how much|quote|estimate|cheap","We do not put prices in the chat, and on a bathroom there is no honest number without seeing the room. Too much depends on the size, whether the toilet is moving, what the floor is like and what suite you want. Book a visit and you get it in writing afterwards."],["design|layout|plan|small bathroom|where to put","We will measure up and draw the room out with you, and we are honest about what will not fit. A lot of small bathrooms get better just by swapping the bath for a shorter one or moving the basin, rather than moving the toilet, which is the expensive change. Bring any pictures you have saved, they help more than you would think."],["hello|hi\\b|hiya|hey|morning|good evening","Hello. What are you thinking of doing? Ask away, or book a visit and somebody will come and look at the room."]]};
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
