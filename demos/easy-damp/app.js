/* Easy Damp survey app demo. Everything runs in the browser and nothing is sent. */
(function () {
  "use strict";
  var ED = window.ED, J = ED.job;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var money = function (n) { return "£" + n.toLocaleString("en-GB"); };
  var band = function (v) { return v > 20 ? "red" : v >= 17 ? "amber" : "green"; };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var I = {
    chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    tick: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0012 0M12 17v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 19L19 5M10 5h9v9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><path d="M9 7L4 12l5 5M4 12h11a5 5 0 010 10h-2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 10V7a4 4 0 018 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    pdf: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 13h6M9 17h6M14 3v5h5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    web: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    room: '<svg viewBox="0 0 24 24"><path d="M4 20V9l8-5 8 5v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  };
  var typeIcons = {
    rising: '<svg viewBox="0 0 24 24"><path d="M12 20V6M7 11l5-5 5 5M4 20h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    penetrating: '<svg viewBox="0 0 24 24"><path d="M4 4v16M9 12h11M15 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    condensation: I.drop,
    cellar: '<svg viewBox="0 0 24 24"><path d="M3 10l9-6 9 6M5 10v10h14V10M9 20v-5h6v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    timber: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 10c2 1 4 1 6 0s4-1 4 0M7 14c2-1 4-1 6 0" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    wallties: '<svg viewBox="0 0 24 24"><path d="M3 5h7v14H3zM14 5h7v14h-7zM10 9h4M10 15h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  };

  /* ---------- State ---------- */
  var S;
  function fresh() {
    var s = { type: "rising", rooms: {}, photos: {}, photoOrder: [], works: {}, pins: [], custSig: null, chrisSig: null, pdf: null };
    ED.rooms.forEach(function (r) {
      s.rooms[r.id] = {
        done: !r.todo, rag: r.todo ? null : r.rag,
        readings: r.walls.map(function (w) { return r.todo ? w.readings.map(function () { return null; }) : w.readings.slice(); }),
        obs: r.todo ? [] : r.observations.slice(),
        notes: r.todo ? "" : (r.notes || ""),
        photos: r.todo ? [] : (r.photo ? [r.photo] : []),
      };
    });
    Object.keys(ED.photos).forEach(function (k) { s.photos[k] = { shapes: k === "lounge" ? [] : ED.photos[k].example.slice() }; });
    ED.works.forEach(function (w) { s.works[w.id] = w.on; });
    s.pins = [
      { x: 252, y: 250, rag: "amber", label: "Hallway: damp on the party wall by the stairs" },
      { x: 120, y: 368, rag: "red", label: "Outside: path built up above the damp-proof course" },
    ];
    return s;
  }
  S = fresh();
  function photoOrder() {
    var o = [];
    ED.rooms.forEach(function (r) { S.rooms[r.id].photos.forEach(function (p) { if (o.indexOf(p) < 0) o.push(p); }); });
    return o;
  }

  /* ---------- Flow ---------- */
  var GUIDE = [
    ["Job comes in from the website", ["jobs", "enquiry"]],
    ["Pick the survey type", ["type"]],
    ["Log each room: readings, photos, voice notes", ["property", "rooms", "room"]],
    ["Pin problems on the floor plan", ["plan"]],
    ["Findings and quote", ["findings"]],
    ["Customer signs on the day", ["custsign"]],
    ["Chris checks and signs", ["review"]],
    ["Customer gets the PDF report", ["sent"]],
    ["Follow-up and review request", ["after"]],
  ];
  var ORDER = ["jobs", "enquiry", "type", "property", "rooms", "room", "plan", "findings", "custsign", "review", "sent", "after"];
  var stack = [];
  var cur = null;

  function guideIndex(name) { if (name === "welcome") return -1; for (var i = 0; i < GUIDE.length; i++) if (GUIDE[i][1].indexOf(name) >= 0) return i; return 0; }
  function renderGuide(name) {
    var gi = guideIndex(name);
    $("#guideSteps").innerHTML = GUIDE.map(function (g, i) {
      return '<li class="' + (i < gi ? "is-done" : i === gi ? "is-on" : "") + '"><i>' + (i < gi ? "&#10003;" : i + 1) + "</i>" + esc(g[0]) + "</li>";
    }).join("");
    $("#progBar").style.width = Math.round((ORDER.indexOf(name) + 1) / ORDER.length * 100) + "%";
  }

  function go(name, arg, opts) {
    if (cur && !(opts && opts.replace)) stack.push(cur);
    cur = { name: name, arg: arg };
    show();
  }
  function back() { if (!stack.length) return; cur = stack.pop(); show(); }
  function show() {
    var v = $("#view");
    closeSheet();
    $("#back").hidden = !stack.length;
    renderGuide(cur.name);
    $("#act").innerHTML = "";
    SCREENS[cur.name](v, cur.arg);
    v.scrollTop = 0;
    var gi = guideIndex(cur.name);
    $("#coachStep").textContent = cur.name === "welcome" ? "Welcome" : "Step " + (gi + 1) + " of " + GUIDE.length;
    coach.plan(PLANS[cur.name] ? PLANS[cur.name](cur.arg) : []);
    try { v.focus({ preventScroll: true }); } catch (e) {}
  }
  function title(t) { $("#title").textContent = t; }
  function act(html) { $("#act").innerHTML = html; }

  var toastT;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("is-on"); }, 2600);
  }
  function sheet(html) {
    var s = $("#sheet"); s.innerHTML = '<div class="sheet__in">' + html + "</div>"; s.hidden = false;
    s.onclick = function (e) { if (e.target === s || e.target.closest("[data-close]")) closeSheet(); };
  }
  function closeSheet() { var s = $("#sheet"); s.hidden = true; s.innerHTML = ""; }

  /* ---------- Click guidance ---------- */
  // Each screen has a list of steps. The current step's element gets an orange
  // ring and a "Tap here" label, everything else is dimmed, and taps anywhere
  // else are caught and pointed back to the right place.
  var coach = (function () {
    var app = $("#app"), hole, tag, steps = [], i = 0, token = 0, clickToken = -1, saved = [], raf = 0, scrolled = -1, prev = null, prevAt = 0;
    hole = document.createElement("div"); hole.className = "coach-hole"; hole.hidden = true; app.appendChild(hole);
    tag = document.createElement("div"); tag.className = "coach-tag"; tag.hidden = true; tag.setAttribute("aria-hidden", "true"); app.appendChild(tag);
    function cur() { return steps[i]; }
    function allowed(t) {
      if (!t.closest) return true;
      if (t.closest("#back")) return !$(".mk");
      if (t.closest("#restart, .coach-bar, .sheet, .toast")) return true;
      var s = cur(); if (!s) return true;
      return !!t.closest(s.sel + (s.allow ? ", " + s.allow : ""));
    }
    function guard(e) {
      if (!cur() || !$("#sheet").hidden) return;
      if (allowed(e.target)) { if (e.type === "click") clickToken = token; return; }
      e.preventDefault(); e.stopPropagation();
      // The click that ends a drag or signature lands after the step has moved on. Ignore it quietly.
      var quiet = prev && Date.now() - prevAt < 800 && e.target.closest(prev);
      if (e.type === "click" && !quiet) {
        toast("Not that one. " + cur().text);
        hole.classList.remove("is-nudge"); void hole.offsetWidth; hole.classList.add("is-nudge");
      }
    }
    app.addEventListener("pointerdown", guard, true);
    app.addEventListener("click", guard, true);
    app.addEventListener("click", function (e) {
      var s = cur();
      if (!s || s.manual || clickToken !== token || !e.target.closest || !e.target.closest(s.sel)) return;
      var t = token; setTimeout(function () { if (t === token) next(); }, 0);
    });
    function render() {
      var s = cur();
      $("#coachText").textContent = s ? s.text : "";
      if (!s) { hole.hidden = tag.hidden = true; return; }
      tag.textContent = s.label || "Tap here";
      if (!raf) raf = requestAnimationFrame(loop);
    }
    function loop() {
      raf = 0;
      var s = cur(); if (!s) { hole.hidden = tag.hidden = true; return; }
      raf = requestAnimationFrame(loop);
      var el = $(s.sel);
      if (!el || !el.getClientRects().length || !$("#sheet").hidden) { hole.hidden = tag.hidden = true; return; }
      if (scrolled !== token) {
        scrolled = token;
        var view = $("#view");
        if (view.contains(el)) {
          var vr = view.getBoundingClientRect(), er = el.getBoundingClientRect();
          if (er.top < vr.top + 8 || er.bottom > vr.bottom - 60) el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        }
      }
      var a = app.getBoundingClientRect(), r = el.getBoundingClientRect(), pad = 5;
      var br = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 8;
      hole.hidden = tag.hidden = false;
      hole.style.left = (r.left - a.left - pad) + "px"; hole.style.top = (r.top - a.top - pad) + "px";
      hole.style.width = (r.width + pad * 2) + "px"; hole.style.height = (r.height + pad * 2) + "px";
      hole.style.borderRadius = (br + pad) + "px";
      var tw = tag.offsetWidth, th = tag.offsetHeight, cx = r.left - a.left + r.width / 2;
      var x = Math.min(Math.max(10, cx - tw / 2), a.width - tw - 10);
      var above = (r.top - a.top) > a.height * 0.5 || s.above;
      var y = above ? r.top - a.top - pad - th - 12 : r.bottom - a.top + pad + 12;
      if (s.inside) { above = false; y = r.top - a.top + Math.min(r.height * 0.35, 90); }
      tag.className = "coach-tag " + (above ? "is-above" : "is-below");
      tag.style.left = x + "px"; tag.style.top = y + "px";
      tag.style.setProperty("--ax", Math.min(Math.max(14, cx - x), tw - 14) + "px");
    }
    function plan(list) { steps = list || []; i = 0; token++; render(); }
    function next() { var s = cur(); if (s) { prev = s.sel + (s.allow ? ", " + s.allow : ""); prevAt = Date.now(); } i++; token++; render(); }
    return {
      plan: plan, next: next,
      event: function (name) { var s = cur(); if (s && s.on === name) next(); },
      push: function (list) { saved.push({ steps: steps, i: i }); plan(list); },
      pop: function (advance) { var p = saved.pop(); if (!p) return; steps = p.steps; i = p.i; token++; if (advance) next(); else render(); },
    };
  })();

  var PLANS = {
    welcome: function () { return [{ sel: "#go", text: "Follow the orange ring and tap where it says.", label: "Start here" }]; },
    jobs: function () { return [{ sel: "[data-go]", text: "A new enquiry has come in from the website. Tap Sarah Holt's job." }]; },
    enquiry: function () { return [{ sel: "#go", text: "The job's filled in from the website form. Tap Start the survey." }]; },
    type: function () { return [{ sel: "#go", text: "Rising damp is picked for this demo. Tap Rising damp: carry on.", allow: ".type" }]; },
    property: function () { return [{ sel: "#go", text: "The property details are filled in. Tap Looks right." }]; },
    rooms: function () {
      return S.rooms.front.done
        ? [{ sel: "#go", text: "All rooms logged. Tap Next: floor plan." }]
        : [{ sel: '[data-room="front"]', text: "Tap Front room to log it. The other rooms are already done." }];
    },
    room: function (id) {
      if (id !== "front" || S.rooms.front.done) return [{ sel: "#save", text: "Tap Back to rooms." }];
      return [
        { sel: "#readAll", text: "Tap Take all readings. The meter reads each height up the wall.", on: "readings", manual: true, allow: "[data-read]" },
        { sel: ".thumb--add", text: "Tap Take a photo of the damp wall." },
        { sel: "#mic", text: "Tap the mic and say what you see. It gets typed up for you.", on: "voice", manual: true, allow: "#notes" },
        { sel: "#save", text: "Findings are ticked and the rating is set to red from the readings. Tap Save room.", allow: "#obs .chip, #rag button, #notes" },
      ];
    },
    plan: function () {
      return [
        { sel: "#plan svg", text: "Tap inside the front room on the plan to drop a red pin.", label: "Tap the front room", on: "pin", manual: true, inside: true },
        { sel: "#go", text: "Pin dropped. Tap Next: findings and quote.", allow: "#undoPin" },
      ];
    },
    findings: function () { return [{ sel: "#go", text: "Reds come first, so the customer knows what to look at. Tap Next: customer signs.", allow: "#works .work" }]; },
    custsign: function () {
      return [
        { sel: "#sig", text: "Hand the phone over. Sign in the box with a finger, or tap Sign for me.", label: "Sign here", on: "sig", manual: true, allow: "#fake", inside: true },
        { sel: "#go", text: "Signed. Tap Done, back to Chris." },
      ];
    },
    review: function () {
      return [
        { sel: "#sig", text: "Check the list, then sign to approve it. Or tap Sign for me.", label: "Sign here", on: "sig", manual: true, allow: "#fake, #prev", inside: true },
        { sel: "#go", text: "Tap Approve and send. This builds the customer's PDF." },
      ];
    },
    sent: function () {
      return [
        { sel: "#op", text: "Done. Tap Open PDF to see the report the customer gets.", allow: "#dl, #go" },
        { sel: "#go", text: "Tap What happens next.", allow: "#dl, #op" },
      ];
    },
    after: function () { return [{ sel: "#again", text: "That's the whole job, from enquiry to review request. Tap Start again to run it again.", allow: "#dl" }]; },
  };

  /* ---------- Screens ---------- */
  var SCREENS = {};

  SCREENS.welcome = function (v) {
    title("Survey app");
    v.innerHTML = '<div class="welcome"><p class="welcome__kicker">Easy Damp survey app demo</p>' +
      "<h2>A 4-minute walk through a real damp survey.</h2>" +
      '<p class="sub">Just follow the orange arrows. Tap where it says and you\'ll go from a new enquiry to a finished customer report.</p>' +
      '<div class="welcome__look"><span class="welcome__ring" aria-hidden="true"></span><span class="small">Look for the orange ring. Everything else is faded until you need it.</span></div>' +
      "<ul>" +
        "<li>" + I.tick + "<span>Log a rising damp survey: readings, a photo, a voice note.</span></li>" +
        "<li>" + I.tick + "<span>Get a signed, branded PDF report for the customer.</span></li>" +
        "<li>" + I.tick + "<span>Fictional customer. Nothing is sent to anyone.</span></li>" +
      "</ul>" +
      '<p class="small" style="margin-top:16px">Stuck? Tap Start again at the top at any time.</p></div>';
    act('<button class="btn" id="go">Start the demo</button>');
    $("#go").onclick = function () { stack = []; cur = null; go("jobs"); };
  };

  SCREENS.jobs = function (v) {
    title("Today");
    v.innerHTML =
      '<h2 class="h">Morning, Chris.</h2><p class="sub">' + esc(J.date) + ". Three surveys booked.</p>" +
      '<button class="card card--tap card--new" data-go="enquiry">' +
        '<div class="row row--between"><span class="pill pill--new"><span class="dot"></span>New from the website</span><span class="small">' + esc(J.time) + "</span></div>" +
        '<p class="job__who">' + esc(J.customer) + '</p><p class="job__where">' + esc(J.address) + " " + esc(J.postcode) + "</p>" +
        '<div class="job__meta row row--between"><span>' + esc(J.service) + "</span>" + I.chev + "</div>" +
      "</button>" +
      ED.otherJobs.map(function (o) {
        return '<div class="card dim"><div class="row row--between"><span class="pill">Booked</span><span class="small">' + esc(o.when) + '</span></div><p class="job__who">' + esc(o.who) + '</p><p class="job__where">' + esc(o.where) + '</p><div class="job__meta">' + esc(o.what) + "</div></div>";
      }).join("") +
      '<p class="small" style="text-align:center;margin-top:16px">Tap the new job to start.</p>';
    v.querySelector("[data-go]").onclick = function () { go("enquiry"); };
  };

  SCREENS.enquiry = function (v) {
    title("New job");
    v.innerHTML =
      '<div class="src">' + I.web + "<span>From the enquiry form on <b>" + esc(ED.company.web) + "</b> &middot; " + esc(J.received) + "</span></div>" +
      '<h2 class="h">' + esc(J.customer) + '</h2><p class="sub">' + esc(J.address) + " " + esc(J.postcode) + "</p>" +
      '<div class="card"><dl class="kv">' +
        "<dt>Service required</dt><dd>" + esc(J.service) + "</dd>" +
        "<dt>Phone</dt><dd>" + esc(J.phone) + "</dd>" +
        "<dt>Email</dt><dd>" + esc(J.email) + "</dd>" +
        "<dt>Postcode</dt><dd>" + esc(J.postcode) + "</dd>" +
        "<dt>Survey booked</dt><dd>Today, " + esc(J.time) + "</dd>" +
      "</dl></div>" +
      '<p class="lbl">What they said</p><p class="quote">' + esc(J.message) + "</p>" +
      '<p class="small" style="margin-top:14px">The job was set up from the website form, so there\'s nothing to type in.</p>';
    act('<button class="btn" id="go">Start the survey</button>');
    $("#go").onclick = function () { go("type"); };
  };

  SCREENS.type = function (v) {
    title("Survey type");
    v.innerHTML = '<h2 class="h">What kind of survey?</h2><p class="sub">Each type has its own checklist, readings and report layout.</p><div class="types">' +
      ED.types.map(function (t) {
        var on = t.id === "rising";
        return '<button class="type' + (on ? " is-on" : "") + '" data-t="' + t.id + '"><span class="type__ic">' + typeIcons[t.id] + "</span><span><b>" + esc(t.name) + "</b><span>" + (on ? esc(t.note) : "Available") + "</span></span>" + (on ? '<span class="type__tick" style="width:22px">' + I.tick + "</span>" : "") + "</button>";
      }).join("") + "</div>";
    $$(".type", v).forEach(function (b) {
      b.onclick = function () { if (b.dataset.t !== "rising") toast(b.querySelector("b").textContent + " is in the full app. This demo walks through rising damp."); };
    });
    act('<button class="btn" id="go">Rising damp: carry on</button>');
    $("#go").onclick = function () { go("property"); };
  };

  SCREENS.property = function (v) {
    title("The property");
    v.innerHTML = '<h2 class="h">The property</h2><p class="sub">Filled in from last time you were on this street. Tap anything to change it.</p>' +
      '<div class="card"><dl class="kv">' + J.property.map(function (p) { return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>"; }).join("") + "</dl></div>" +
      '<p class="lbl">Rooms on this survey</p><div class="chips">' + ED.rooms.map(function (r) { return '<span class="chip is-on">' + esc(r.name) + "</span>"; }).join("") + "</div>";
    $$(".kv dd", v).forEach(function (d) { d.style.cursor = "pointer"; d.onclick = function () { toast("You'd pick from a list here. Leave it as it is for the demo."); }; });
    act('<button class="btn" id="go">Looks right</button>');
    $("#go").onclick = function () { go("rooms"); };
  };

  SCREENS.rooms = function (v) {
    title("Rooms");
    var todo = ED.rooms.filter(function (r) { return !S.rooms[r.id].done; }).length;
    v.innerHTML = '<h2 class="h">Room by room</h2><p class="sub">' + (todo ? "Start with the front room. The others are already logged, so you can see how they look." : "All rooms logged. Next, pin the problems on the floor plan.") + "</p>" +
      ED.rooms.map(function (r) {
        var st = S.rooms[r.id];
        var pill = st.done ? '<span class="pill pill--' + st.rag + '"><span class="dot"></span>' + { red: "Red", amber: "Amber", green: "Green" }[st.rag] + "</span>" : '<span class="pill pill--new">To do</span>';
        var n = st.readings.length ? st.readings.length * ED.heights.length + " readings" : "Outside";
        return '<button class="card card--tap' + (st.done ? "" : " card--new") + '" data-room="' + r.id + '"><div class="room"><span class="room__ic">' + I.room + "</span><span><b>" + esc(r.name) + "</b><span>" + (st.done ? n + " &middot; " + (st.photos.length ? st.photos.length + " photo" + (st.photos.length === 1 ? "" : "s") : "no photos") : "Not started") + "</span></span>" + pill + I.chev + "</div></button>";
      }).join("");
    $$("[data-room]", v).forEach(function (b) { b.onclick = function () { go("room", b.dataset.room); }; });
    act('<button class="btn" id="go">Next: floor plan</button>');
    $("#go").onclick = function () { if (todo) return toast("Log the front room first."); go("plan"); };
  };

  /* Room detail */
  SCREENS.room = function (v, id) {
    var R = ED.rooms.filter(function (r) { return r.id === id; })[0], st = S.rooms[id];
    title(R.name);
    var html = '<h2 class="h">' + esc(R.name) + "</h2>";
    if (R.walls.length) {
      html += '<p class="lbl">Moisture readings</p><div class="card"><div class="meter"><i></i>Meter connected</div>';
      R.walls.forEach(function (w, wi) {
        html += '<div class="wall"><table class="rd"><thead><tr><th colspan="4">' + esc(w.name) + "</th></tr></thead><tbody>";
        ED.heights.slice().reverse().forEach(function (h, ri) {
          var hi = ED.heights.length - 1 - ri, val = st.readings[wi][hi];
          html += '<tr data-w="' + wi + '" data-h="' + hi + '"><td>' + h + 'mm</td><td><div class="bar"><i class="' + (val == null ? "" : band(val)) + '" style="width:' + (val == null ? 0 : Math.min(100, val / 30 * 100)) + '%"></i></div></td><td class="v">' + (val == null ? "&ndash;" : val) + '</td><td class="go">' + (val == null ? '<button class="btn btn--sm btn--ghost" data-read>Read</button>' : "") + "</td></tr>";
        });
        html += "</tbody></table></div>";
      });
      html += '<div class="key"><span><i style="background:var(--green)"></i>Under 17 dry</span><span><i style="background:var(--amber)"></i>17 to 20 at risk</span><span><i style="background:var(--red)"></i>Over 20 wet</span></div>';
      if (st.readings.some(function (w) { return w.some(function (x) { return x == null; }); })) html += '<button class="btn btn--navy" id="readAll" style="width:100%;margin-top:14px">Take all readings</button>';
      html += "</div>";
    }
    html += '<p class="lbl">Photos</p><div class="thumbs" id="thumbs"></div>';
    html += '<p class="lbl">Notes</p><div class="card"><div class="voice"><button class="mic" id="mic" aria-label="Record a voice note">' + I.mic + '</button><div class="wave" id="wave">' + new Array(28).join("<i></i>") + '</div></div><p class="small" id="micHint" style="margin:10px 0">' + (R.todo ? "Tap the mic and talk. Your note gets typed up for you." : "Tap the mic to add to the notes.") + '</p><textarea class="notes" id="notes" placeholder="Notes for this room">' + esc(st.notes) + "</textarea></div>";
    html += '<p class="lbl">What you found</p><div class="chips" id="obs">' + R.observations.map(function (o) { return '<button class="chip' + (st.obs.indexOf(o) >= 0 ? " is-on" : "") + '" data-o="' + esc(o) + '">' + esc(o) + "</button>"; }).join("") + "</div>";
    html += '<p class="lbl">Rating for the report</p><div class="rag" id="rag">' + ["red", "amber", "green"].map(function (r) { return '<button data-v="' + r + '" class="' + (st.rag === r ? "is-on" : "") + '">' + { red: "Red", amber: "Amber", green: "Green" }[r] + "</button>"; }).join("") + '</div><p class="small" style="margin-top:8px">Red needs work now, amber needs work soon, green is fine. The customer sees the reds first.</p>';
    v.innerHTML = html;

    // Readings
    function setReading(tr, val) {
      var wi = +tr.dataset.w, hi = +tr.dataset.h;
      st.readings[wi][hi] = val;
      var bar = tr.querySelector(".bar i"); bar.className = band(val);
      tr.querySelector(".go").innerHTML = "";
      var cell = tr.querySelector(".v"), t0 = performance.now(), D = reduce ? 0 : 450;
      (function tick(t) { var p = D ? Math.min(1, (t - t0) / D) : 1; cell.textContent = Math.round(val * p); bar.style.width = Math.min(100, val * p / 30 * 100) + "%"; if (p < 1) requestAnimationFrame(tick); })(t0);
      if (st.readings.every(function (w) { return w.every(function (x) { return x != null; }); })) {
        var ra = $("#readAll"); if (ra) ra.remove();
        coach.event("readings");
        if (!st.rag) { st.rag = "red"; $$("#rag button").forEach(function (b) { b.classList.toggle("is-on", b.dataset.v === "red"); }); toast("Readings done. Wet up to 600mm, so it's set to red. Change it if you disagree."); }
      }
    }
    $$("[data-read]", v).forEach(function (b) {
      b.onclick = function () { var tr = b.closest("tr"); b.innerHTML = '<span class="spin" style="border-color:rgba(20,23,45,.2);border-top-color:#14172D"></span>'; setTimeout(function () { setReading(tr, R.walls[+tr.dataset.w].readings[+tr.dataset.h]); }, reduce ? 0 : 380); };
    });
    var ra = $("#readAll");
    if (ra) ra.onclick = function () {
      ra.disabled = true; ra.innerHTML = '<span class="spin"></span> Reading';
      var rows = $$("tr[data-w]", v).filter(function (tr) { return st.readings[+tr.dataset.w][+tr.dataset.h] == null; });
      rows.reverse().forEach(function (tr, i) { setTimeout(function () { setReading(tr, R.walls[+tr.dataset.w].readings[+tr.dataset.h]); }, reduce ? 0 : i * 160); });
    };

    // Photos
    function drawThumbs() {
      var box = $("#thumbs"); box.innerHTML = "";
      st.photos.forEach(function (pid) {
        var b = document.createElement("button"); b.className = "thumb"; b.setAttribute("aria-label", "Mark up photo");
        var c = document.createElement("canvas"); b.appendChild(c);
        var tag = document.createElement("span"); tag.className = "thumb__tag"; tag.textContent = S.photos[pid].shapes.length ? "Marked up" : "Tap to mark up"; b.appendChild(tag);
        box.appendChild(b);
        renderTo(c, pid, 600);
        b.onclick = function () { markup(pid, drawThumbs); };
      });
      var left = R.todo ? ["lounge", "salts"].filter(function (p) { return st.photos.indexOf(p) < 0; }) : [];
      if (left.length) {
        var a = document.createElement("button"); a.className = "thumb thumb--add";
        a.innerHTML = "<span>" + I.cam + "Take a photo</span>";
        a.onclick = function () { st.photos.push(left[0]); drawThumbs(); markup(left[0], drawThumbs); };
        box.appendChild(a);
      }
    }
    drawThumbs();

    // Voice note
    var mic = $("#mic"), wave = $("#wave"), bars = $$("i", wave), recT, animT;
    mic.onclick = function () {
      if (mic.classList.contains("is-rec")) return stopRec();
      mic.classList.add("is-rec"); mic.innerHTML = I.stop; wave.classList.add("is-rec");
      $("#micHint").textContent = "Recording. Tap again to stop.";
      $("#coachText").textContent = "Recording. Talk, or just wait. It stops on its own.";
      animT = setInterval(function () { bars.forEach(function (b) { b.style.height = (6 + Math.random() * 30) + "px"; }); }, 110);
      recT = setTimeout(stopRec, 4200);
    };
    function stopRec() {
      clearTimeout(recT); clearInterval(animT);
      mic.classList.remove("is-rec"); mic.innerHTML = I.mic; wave.classList.remove("is-rec");
      bars.forEach(function (b) { b.style.height = "6px"; });
      $("#micHint").textContent = "Typing up your note...";
      var ta = $("#notes"), txt = R.voice || "Checked again, no change.", start = ta.value ? ta.value + "\n" : "", i = 0;
      ta.classList.add("typing");
      (function type() {
        i += reduce ? txt.length : 3; ta.value = start + txt.slice(0, i); st.notes = ta.value;
        if (i < txt.length) return setTimeout(type, 18);
        ta.classList.remove("typing");
        $("#micHint").textContent = "Note typed up. You can edit it.";
        setTimeout(function () { coach.event("voice"); }, 300);
        if (R.todo) {
          var added = 0;
          R.observations.forEach(function (o) { if (st.obs.indexOf(o) < 0) { st.obs.push(o); added++; } });
          $$("#obs .chip").forEach(function (c) { c.classList.toggle("is-on", st.obs.indexOf(c.dataset.o) >= 0); });
          if (added) toast("Ticked " + added + " findings from your note.");
        }
      })();
    }
    $("#notes").oninput = function (e) { st.notes = e.target.value; };
    $$("#obs .chip").forEach(function (c) { c.onclick = function () { var o = c.dataset.o, k = st.obs.indexOf(o); if (k >= 0) st.obs.splice(k, 1); else st.obs.push(o); c.classList.toggle("is-on"); }; });
    $$("#rag button").forEach(function (b) { b.onclick = function () { st.rag = b.dataset.v; $$("#rag button").forEach(function (x) { x.classList.toggle("is-on", x === b); }); }; });

    act('<button class="btn" id="save">' + (R.todo && !st.done ? "Save room" : "Back to rooms") + "</button>");
    $("#save").onclick = function () {
      if (R.todo) {
        if (st.readings.some(function (w) { return w.some(function (x) { return x == null; }); })) return toast("Take the readings first.");
        if (!st.photos.length) return toast("Take at least one photo.");
        if (!st.rag) return toast("Give the room a rating.");
        if (!S.photos.lounge.shapes.length && st.photos.indexOf("lounge") >= 0) S.photos.lounge.shapes = ED.photos.lounge.example.slice();
        st.done = true;
        toast("Front room saved.");
      }
      back();
    };
  };

  /* ---------- Photo markup ---------- */
  var imgCache = {};
  function getImg(pid) {
    if (!imgCache[pid]) imgCache[pid] = new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.src = ED.photos[pid].src; });
    return imgCache[pid];
  }
  function drawShapes(ctx, shapes, w, h) {
    var lw = Math.max(3, w * 0.009), fs = Math.round(w * 0.032);
    shapes.forEach(function (s) {
      if (s.t === "arrow") {
        var x1 = s.x1 * w, y1 = s.y1 * h, x2 = s.x2 * w, y2 = s.y2 * h, a = Math.atan2(y2 - y1, x2 - x1), hl = lw * 4.2;
        [["rgba(255,255,255,.95)", lw + 4], ["#FF6600", lw]].forEach(function (p) {
          ctx.strokeStyle = p[0]; ctx.fillStyle = p[0]; ctx.lineWidth = p[1]; ctx.lineCap = "round"; ctx.lineJoin = "round";
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hl * .6, y2 - Math.sin(a) * hl * .6); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - hl * Math.cos(a - .45), y2 - hl * Math.sin(a - .45));
          ctx.lineTo(x2 - hl * Math.cos(a + .45), y2 - hl * Math.sin(a + .45)); ctx.closePath();
          if (p[0] !== "#FF6600") ctx.stroke(); ctx.fill();
        });
      } else if (s.t === "note") {
        ctx.font = "600 " + fs + 'px "Public Sans", system-ui, sans-serif';
        var tw = ctx.measureText(s.text).width, pad = fs * .5, bw = tw + pad * 2, bh = fs * 1.6;
        var x = Math.min(Math.max(4, s.x * w), w - bw - 4), y = Math.min(Math.max(4, s.y * h - bh / 2), h - bh - 4);
        ctx.fillStyle = "rgba(20,23,45,.9)";
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, fs * .3); else ctx.rect(x, y, bw, bh); ctx.fill();
        ctx.fillStyle = "#FF6600"; ctx.fillRect(x, y, fs * .22, bh);
        ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.fillText(s.text, x + pad, y + bh / 2 + 1);
      }
    });
  }
  function renderTo(canvas, pid, w, shapes) {
    shapes = shapes || S.photos[pid].shapes;
    return getImg(pid).then(function (img) {
      var h = Math.round(w * img.naturalHeight / img.naturalWidth);
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, w, h);
      drawShapes(ctx, shapes, w, h);
      return canvas;
    });
  }
  window.EDrenderPhoto = function (pid, w) {
    var shapes = S.photos[pid].shapes.length ? null : ED.photos[pid].example;
    var c = document.createElement("canvas");
    return getImg(pid).then(function (img) {
      var h = Math.round(w * img.naturalHeight / img.naturalWidth); c.width = w; c.height = h;
      var ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, w, h);
      drawShapes(ctx, shapes || S.photos[pid].shapes, w, h);
      return c.toDataURL("image/jpeg", .82);
    });
  };

  function markup(pid, done) {
    var P = S.photos[pid], tool = "arrow", drag = null, pendingNote = null;
    var el = document.createElement("div"); el.className = "mk"; el.dataset.coached = "1";
    el.innerHTML = '<div class="mk__top"><b>Mark up the photo</b></div><div class="mk__stage"><canvas></canvas></div><p class="mk__hint" id="mkHint"></p>' +
      '<div class="mk__note" id="mkNote" hidden><input id="mkText" maxlength="40" placeholder="Type a short note" aria-label="Note text"><button class="btn btn--sm" id="mkAdd">Add</button></div>' +
      '<div class="mk__tools"><button class="tool is-on" data-tool="arrow">' + I.arrow + 'Arrow</button><button class="tool" data-tool="note">' + I.note + 'Note</button><button class="tool" data-undo>' + I.undo + "Undo</button></div>" +
      '<div class="mk__foot"><button class="btn btn--ghost" data-cancel style="flex:0 0 auto">Cancel</button><button class="btn" data-save>Save photo</button></div>';
    $("#app").appendChild(el);
    var bar = $("#coachBar"); el.style.top = (bar.offsetTop + bar.offsetHeight) + "px";
    var cv = $("canvas", el), shapes = P.shapes.slice();
    coach.push([
      { sel: ".mk canvas", text: "Drag your finger across the photo to draw an arrow at the tide mark.", label: "Drag on the photo", on: "arrow", manual: true, inside: true },
      { sel: '[data-tool="note"]', text: "Now tap Note to add a label." },
      { sel: ".mk canvas", text: "Tap the photo where the note should go.", label: "Tap the photo", on: "notepos", manual: true, inside: true },
      { sel: "#mkAdd", text: "The note's typed in for you. Tap Add.", allow: "#mkText" },
      { sel: "[data-save]", text: "Tap Save photo. It goes straight into the report.", allow: "[data-undo], [data-tool]" },
    ]);
    function hint() {
      $("#mkHint", el).innerHTML = tool === "arrow" ? "Drag on the photo to draw an arrow." : "Tap the photo where the note should go.";
      if (!shapes.length && !el.dataset.coached) $("#mkHint", el).innerHTML += ' <button class="link" data-eg style="color:#FF8A3D">Or fill in an example</button>';
      var eg = $("[data-eg]", el); if (eg) eg.onclick = function () { shapes = ED.photos[pid].example.slice(); redraw(); hint(); };
    }
    function redraw(extra) { renderTo(cv, pid, 1200, shapes.concat(extra || [])); }
    redraw(); hint();
    function pt(e) { var r = cv.getBoundingClientRect(); return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }; }
    cv.addEventListener("pointerdown", function (e) {
      var p = pt(e);
      if (tool === "arrow") { drag = { t: "arrow", x1: p.x, y1: p.y, x2: p.x, y2: p.y }; cv.setPointerCapture(e.pointerId); }
      else { pendingNote = p; $("#mkNote", el).hidden = false; var inp = $("#mkText", el); inp.value = shapes.some(function (x) { return x.t === "note"; }) ? "" : "Tide mark at 900mm"; $("#mkHint", el).textContent = "Type the note, then tap Add."; coach.event("notepos"); }
    });
    cv.addEventListener("pointermove", function (e) { if (!drag) return; var p = pt(e); drag.x2 = p.x; drag.y2 = p.y; redraw([drag]); });
    cv.addEventListener("pointerup", function () {
      if (!drag) return;
      if (Math.hypot(drag.x2 - drag.x1, drag.y2 - drag.y1) > .03) { shapes.push(drag); coach.event("arrow"); }
      drag = null; redraw(); hint();
    });
    function addNote() {
      var t = $("#mkText", el).value.trim(); if (!t || !pendingNote) return;
      shapes.push({ t: "note", x: pendingNote.x, y: pendingNote.y, text: t }); pendingNote = null;
      $("#mkNote", el).hidden = true; redraw(); hint();
    }
    $("#mkAdd", el).onclick = addNote;
    $("#mkText", el).onkeydown = function (e) { if (e.key === "Enter") addNote(); };
    $$("[data-tool]", el).forEach(function (b) { b.onclick = function () { tool = b.dataset.tool; $$("[data-tool]", el).forEach(function (x) { x.classList.toggle("is-on", x === b); }); hint(); }; });
    $("[data-undo]", el).onclick = function () { shapes.pop(); redraw(); hint(); };
    $("[data-cancel]", el).onclick = function () { el.remove(); coach.pop(false); done && done(); };
    $("[data-save]", el).onclick = function () { P.shapes = shapes; el.remove(); toast("Photo saved to the report."); done && done(); coach.pop(true); };
  }

  /* ---------- Floor plan ---------- */
  var ROOMS_PLAN = [
    { id: "kitchen", name: "Kitchen", x: 20, y: 20, w: 260, h: 90 },
    { id: "rear", name: "Rear room", x: 20, y: 110, w: 170, h: 110 },
    { id: "front", name: "Front room", x: 20, y: 220, w: 170, h: 120 },
    { id: "hall", name: "Hall", x: 190, y: 110, w: 90, h: 230 },
  ];
  function planSVG(pins, forImage) {
    var f = forImage ? "Arial, Helvetica, sans-serif" : "inherit";
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 390" width="600" height="780">';
    s += '<rect width="300" height="390" fill="#fff"/>';
    s += '<rect x="20" y="346" width="260" height="34" fill="#ECEDF2"/><text x="214" y="368" text-anchor="middle" font-family="' + f + '" font-size="11" fill="#5B6075">FRONT PATH (STREET SIDE)</text>';
    ROOMS_PLAN.forEach(function (r) {
      s += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" fill="#F7F8FB" stroke="#14172D" stroke-width="2"/>';
      s += '<text x="' + (r.x + 10) + '" y="' + (r.y + 20) + '" font-family="' + f + '" font-size="12" font-weight="700" fill="#14172D">' + r.name + "</text>";
    });
    for (var i = 0; i < 9; i++) s += '<line x1="200" x2="270" y1="' + (150 + i * 12) + '" y2="' + (150 + i * 12) + '" stroke="#A0A5B8" stroke-width="1"/>';
    s += '<rect x="20" y="20" width="260" height="320" fill="none" stroke="#14172D" stroke-width="5"/>';
    s += '<line x1="60" x2="150" y1="340" y2="340" stroke="#9FC3E8" stroke-width="5"/><line x1="236" x2="266" y1="340" y2="340" stroke="#fff" stroke-width="6"/>';
    s += '<text x="286" y="230" font-family="' + f + '" font-size="9" fill="#5B6075" transform="rotate(90 286 230)" text-anchor="middle">PARTY WALL</text>';
    pins.forEach(function (p, i) {
      var c = { red: "#D7362B", amber: "#E79A00", green: "#22915A" }[p.rag];
      s += '<g class="pin"><circle cx="' + p.x + '" cy="' + p.y + '" r="12" fill="' + c + '" stroke="#fff" stroke-width="3"/><text x="' + p.x + '" y="' + (p.y + 4.5) + '" text-anchor="middle" font-family="' + f + '" font-size="13" font-weight="700" fill="#fff">' + (i + 1) + "</text></g>";
    });
    return s + "</svg>";
  }
  window.EDplanPNG = function () {
    return new Promise(function (res) {
      var img = new Image();
      img.onload = function () { var c = document.createElement("canvas"); c.width = 900; c.height = 1170; c.getContext("2d").drawImage(img, 0, 0, 900, 1170); res({ data: c.toDataURL("image/png"), w: 900, h: 1170 }); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(planSVG(S.pins, true));
    });
  };
  function roomAt(x, y) {
    if (y > 342) return "Outside front";
    for (var i = 0; i < ROOMS_PLAN.length; i++) { var r = ROOMS_PLAN[i]; if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.name; }
    return "Outside";
  }

  SCREENS.plan = function (v) {
    title("Floor plan");
    var rag = "red";
    v.innerHTML = '<h2 class="h">Pin the problems</h2><p class="sub">Tap the plan where you found damp. Try the front room walls.</p>' +
      '<div class="rag" id="pinRag" style="margin-bottom:10px">' + ["red", "amber", "green"].map(function (r) { return '<button data-v="' + r + '" class="' + (r === rag ? "is-on" : "") + '">' + { red: "Red pin", amber: "Amber pin", green: "Green pin" }[r] + "</button>"; }).join("") + "</div>" +
      '<div class="plan" id="plan"></div><div class="row row--between" style="margin-top:10px"><span class="small" id="pinCount"></span><button class="link" id="undoPin">Undo last pin</button></div>' +
      '<ol class="small" id="pinList" style="padding-left:18px;margin:8px 0 0"></ol>';
    function draw() {
      $("#plan").innerHTML = planSVG(S.pins);
      $("#pinCount").textContent = S.pins.length + " pin" + (S.pins.length === 1 ? "" : "s");
      $("#pinList").innerHTML = S.pins.map(function (p) { return "<li>" + esc(p.label) + "</li>"; }).join("");
      var svg = $("#plan svg");
      svg.onclick = function (e) {
        var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        var p = pt.matrixTransform(svg.getScreenCTM().inverse());
        var where = roomAt(p.x, p.y);
        var label = where === "Front room" ? "Front room: rising damp, tide mark and salts" : where + ": " + { red: "needs work now", amber: "needs work soon", green: "checked, no damp" }[rag];
        S.pins.push({ x: Math.round(p.x), y: Math.round(p.y), rag: rag, label: label });
        draw();
        coach.event("pin");
      };
    }
    draw();
    $$("#pinRag button").forEach(function (b) { b.onclick = function () { rag = b.dataset.v; $$("#pinRag button").forEach(function (x) { x.classList.toggle("is-on", x === b); }); }; });
    $("#undoPin").onclick = function () { S.pins.pop(); draw(); };
    act('<button class="btn" id="go">Next: findings and quote</button>');
    $("#go").onclick = function () {
      if (!S.pins.some(function (p) { return /^Front room/.test(p.label); })) {
        S.pins.push({ x: 70, y: 318, rag: "red", label: "Front room: rising damp, tide mark and salts" });
        toast("Added a pin for the front room.");
      }
      go("findings");
    };
  };

  /* ---------- Findings and quote ---------- */
  function totals() {
    var sub = 0; ED.works.forEach(function (w) { if (S.works[w.id]) sub += w.price; });
    var vat = Math.round(sub * .2); return { sub: sub, vat: vat, total: sub + vat };
  }
  SCREENS.findings = function (v) {
    title("Findings and quote");
    var order = { red: 0, amber: 1, green: 2 };
    var areas = ED.rooms.slice().sort(function (a, b) { return order[S.rooms[a.id].rag] - order[S.rooms[b.id].rag]; });
    v.innerHTML = '<h2 class="h">Findings</h2><p class="sub">Built from what you logged. This is the order the customer sees them.</p>' +
      '<div class="card">' + areas.map(function (r, i) { var g = S.rooms[r.id].rag; return '<div class="find"' + (i ? ' style="margin-top:14px"' : "") + '><span class="find__bar ' + g + '"></span><div><b>' + esc(r.name) + ' <span class="pill pill--' + g + '" style="margin-left:4px">' + { red: "Red", amber: "Amber", green: "Green" }[g] + "</span></b><p>" + esc(r.summary) + "</p></div></div>"; }).join("") + "</div>" +
      '<div class="row row--between" style="margin:20px 0 8px"><p class="lbl" style="margin:0">Recommended work</p><span class="eg">Example figures</span></div>' +
      '<div class="card" id="works">' + ED.works.map(function (w) { return '<label class="work"><input type="checkbox" id="' + w.id + '"' + (S.works[w.id] ? " checked" : "") + '><span class="t">' + esc(w.text) + '</span><span class="p">' + money(w.price) + "</span></label>"; }).join("") +
      '<div class="tot" id="tot"></div></div><p class="small">Untick anything the customer doesn\'t need. The quote updates straight away.</p>';
    function tot() { var t = totals(); $("#tot").innerHTML = "<span>Subtotal</span><b>" + money(t.sub) + "</b><span>VAT at 20%</span><b>" + money(t.vat) + '</b><span class="big">Total</span><b class="big">' + money(t.total) + "</b>"; }
    tot();
    $$("#works input").forEach(function (c) { c.onchange = function () { S.works[c.id] = c.checked; tot(); }; });
    act('<button class="btn" id="go">Next: customer signs</button>');
    $("#go").onclick = function () { go("custsign"); };
  };

  /* ---------- Signatures ---------- */
  function sigPad(box, onChange) {
    box.innerHTML = '<canvas></canvas><div class="sig__line"></div><p class="sig__ph">Sign here with your finger</p><div class="sig__foot"><span>' + esc(box.dataset.who) + '</span><button class="link" data-clear>Clear</button></div>';
    var c = $("canvas", box), ctx, dpr = Math.min(2, window.devicePixelRatio || 1), drawing = false, has = false, last;
    function size() { var r = c.getBoundingClientRect(); c.width = r.width * dpr; c.height = r.height * dpr; ctx = c.getContext("2d"); ctx.scale(dpr, dpr); ctx.lineWidth = 2.6; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#14172D"; }
    size();
    function p(e) { var r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    c.addEventListener("pointerdown", function (e) { drawing = true; last = p(e); c.setPointerCapture(e.pointerId); $(".sig__ph", box).style.display = "none"; });
    c.addEventListener("pointermove", function (e) { if (!drawing) return; var q = p(e); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.quadraticCurveTo(last.x, last.y, q.x, q.y); ctx.stroke(); last = q; if (!has) { has = true; } });
    c.addEventListener("pointerup", function () { if (!drawing) return; drawing = false; if (has) onChange(c.toDataURL("image/png")); });
    $("[data-clear]", box).onclick = function () { ctx.clearRect(0, 0, c.width, c.height); has = false; $(".sig__ph", box).style.display = ""; onChange(null); };
    return {
      fake: function () { // draws a sample signature for a quick demo
        var r = c.getBoundingClientRect(), w = r.width, h = r.height, cx = w * .2, cy = h * .58;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        for (var t = 0; t <= 1; t += .01) { ctx.lineTo(cx + t * w * .6, cy - Math.sin(t * 18) * h * .12 * (1 - t * .5) - t * h * .08); }
        ctx.stroke(); has = true; $(".sig__ph", box).style.display = "none"; onChange(c.toDataURL("image/png"));
      },
    };
  }

  SCREENS.custsign = function (v) {
    title("Customer signs");
    v.innerHTML = '<h2 class="h">Hand the phone to ' + esc(J.first) + '</h2><p class="sub">' + esc(J.customer) + ' signs to confirm the survey took place today and these areas were checked:</p>' +
      '<div class="chips" style="margin-bottom:14px">' + ED.rooms.map(function (r) { return '<span class="chip">' + esc(r.name) + "</span>"; }).join("") + "</div>" +
      '<div class="sig" id="sig" data-who="' + esc(J.customer) + ", " + esc(J.dateShort) + '"></div>' +
      '<p class="small" style="margin-top:10px">This isn\'t agreeing to any work. ' + esc(J.first) + ' gets the full report once Chris has checked and signed it.</p><button class="link" id="fake">Sign for me (demo)</button>';
    var pad = sigPad($("#sig"), function (d) { S.custSig = d; $("#go").disabled = !d; if (d) coach.event("sig"); });
    $("#fake").onclick = function () { pad.fake(); };
    act('<button class="btn" id="go" disabled>Done, back to Chris</button>');
    $("#go").onclick = function () { go("review"); };
  };

  SCREENS.review = function (v) {
    title("Check and sign");
    var t = totals(), nRead = 0, nPh = photoOrder().length;
    ED.rooms.forEach(function (r) { S.rooms[r.id].readings.forEach(function (w) { nRead += w.filter(function (x) { return x != null; }).length; }); });
    v.innerHTML = '<div class="lock">' + I.lock + "<span>Nothing goes to " + esc(J.first) + " until you've checked the report and signed it.</span></div>" +
      '<h2 class="h">Check the report</h2><p class="sub">Open the PDF and have a look through. Change anything by going back.</p>' +
      '<div class="card"><ul class="checks">' +
        "<li>" + I.tick + ED.rooms.length + " areas rated red, amber or green</li>" +
        "<li>" + I.tick + nRead + " moisture readings</li>" +
        "<li>" + I.tick + nPh + " marked-up photos and a floor plan with " + S.pins.length + " pins</li>" +
        "<li>" + I.tick + "Quote: " + money(t.total) + " including VAT (example figures)</li>" +
        "<li>" + I.tick + "Aftercare and guarantee</li>" +
        "<li>" + I.tick + "Written to PCA standards</li>" +
        "<li>" + I.tick + "Signed by " + esc(J.customer) + " on the day</li>" +
      '</ul><button class="btn btn--ghost" id="prev" style="width:100%;margin-top:14px">' + I.pdf + "Open the PDF to check it</button></div>" +
      '<p class="lbl">Your signature</p><div class="sig" id="sig" data-who="Chris Smith, Easy Damp"></div><button class="link" id="fake">Sign for me (demo)</button>';
    var pad = sigPad($("#sig"), function (d) { S.chrisSig = d; $("#go").disabled = !d; if (d) coach.event("sig"); });
    $("#fake").onclick = function () { pad.fake(); };
    $("#prev").onclick = function () { openPdf($("#prev")); };
    act('<button class="btn" id="go" disabled>Approve and send to ' + esc(J.first) + "</button>");
    $("#go").onclick = function () {
      var b = $("#go"); b.disabled = true; b.innerHTML = '<span class="spin"></span> Building the report';
      makePdf().then(function () { go("sent"); }, function () { b.disabled = false; b.textContent = "Try again"; toast("Couldn't build the PDF. Check your connection and try again."); });
    };
  };

  /* ---------- PDF ---------- */
  function makePdf() {
    S.photoOrder = photoOrder();
    return window.buildReport(S).then(function (blob) { if (S.pdf) URL.revokeObjectURL(S.pdf); S.pdf = URL.createObjectURL(blob); return S.pdf; });
  }
  window.__edPdf = function () { return S.pdf; }; // used by the QA script
  function openPdf(btn) {
    var w = window.open("", "_blank"), old = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = '<span class="spin" style="border-color:rgba(20,23,45,.2);border-top-color:#14172D"></span> Building the PDF';
    makePdf().then(function (url) {
      btn.disabled = false; btn.innerHTML = old;
      if (w) w.location.href = url; else location.href = url;
    }, function () { btn.disabled = false; btn.innerHTML = old; if (w) w.close(); toast("Couldn't build the PDF. Check your connection and try again."); });
  }
  function download() {
    var go2 = function (url) { var a = document.createElement("a"); a.href = url; a.download = "Easy Damp survey report - " + J.address + " (sample).pdf"; document.body.appendChild(a); a.click(); a.remove(); };
    if (S.pdf) go2(S.pdf); else makePdf().then(go2);
  }

  SCREENS.sent = function (v) {
    title("Sent");
    stack = [];
    $("#back").hidden = true;
    v.innerHTML = '<div class="done"><div class="done__ic">' + I.tick + '</div><h2 class="h">Report sent to ' + esc(J.first) + '</h2><p class="sub">By email and text, with the PDF attached and buttons to book the work or pay a deposit.</p></div>' +
      '<div class="card"><div class="msg__h">Text to ' + esc(J.phone) + '</div><div class="msg">Hi ' + esc(J.first) + ", it's Chris from Easy Damp. Thanks for having me round today. Your damp survey report is ready: it shows what needs doing first, the photos, and a fixed price. Any questions, just ring me on " + esc(ED.company.phone) + ".</div></div>" +
      '<p class="small" style="text-align:center">Demo: nothing was actually sent.</p>' +
      '<div class="row" style="margin-top:6px"><button class="btn btn--ghost" id="dl">' + I.down + 'Download PDF</button><button class="btn btn--ghost" id="op">' + I.pdf + "Open PDF</button></div>";
    $("#dl").onclick = download;
    $("#op").onclick = function () { if (S.pdf) window.open(S.pdf, "_blank"); else openPdf($("#op")); };
    act('<button class="btn" id="go">What happens next</button>');
    $("#go").onclick = function () { go("after"); };
  };

  SCREENS.after = function (v) {
    title("After it's sent");
    var t = totals();
    v.innerHTML = '<h2 class="h">What happens next</h2><p class="sub">The follow-ups go out on their own. A preview of each is below.</p><ol class="tl">' +
      '<li class="is-done"><div class="tl__when">Today, 14:05</div><div class="tl__what">Report sent by email and text</div></li>' +
      '<li class="is-done"><div class="tl__when">Today, 14:31</div><div class="tl__what">' + esc(J.first) + " opened the report</div></li>" +
      '<li class="is-next"><div class="tl__when">Thursday, 10:00 (if no reply)</div><div class="tl__what">Follow-up message</div><div class="msg"><div class="msg__h">Text to ' + esc(J.first) + "</div>Hi " + esc(J.first) + ", Chris from Easy Damp here. Just checking you got the report OK. Happy to go through any of it on the phone, or you can book a date straight from the report.</div></li>" +
      '<li><div class="tl__when">When ' + esc(J.first) + ' books</div><div class="tl__what">Deposit paid and date booked</div><div class="small">' + money(ED.deposit) + " deposit (example). Quote total " + money(t.total) + ". The job goes straight into the diary.</div></li>" +
      '<li><div class="tl__when">Job finished</div><div class="tl__what">Guarantee certificate sent</div></li>' +
      '<li><div class="tl__when">Two days after the job</div><div class="tl__what">Review request</div><div class="msg"><div class="msg__h">Text to ' + esc(J.first) + "</div>Hi " + esc(J.first) + ", thanks again for choosing Easy Damp. If you're happy with the work, a quick Google review would mean a lot to a small firm like ours. It only takes a minute: [link]</div></li>" +
      "</ol>" +
      '<p class="small" style="text-align:center">Demo: nothing here is sent for real.</p>';
    act('<button class="btn btn--ghost" id="dl">' + I.down + 'PDF</button><button class="btn" id="again">Start again</button>');
    $("#dl").onclick = download;
    $("#again").onclick = restart;
  };

  /* ---------- Book / deposit links from the PDF ---------- */
  function hashSheet() {
    var h = location.hash;
    if (h !== "#book" && h !== "#deposit") return;
    sheet('<h2 class="h">' + (h === "#book" ? "Book the work" : "Pay a deposit") + '</h2><p class="sub">This is where ' + esc(J.first) + (h === "#book" ? " would pick a start date that suits them, straight from the report." : " would pay the deposit by card to lock in the date.") + '</p><p class="quote">Demo only. No booking is made and no payment is taken.</p><button class="btn" data-close style="width:100%;margin-top:16px">OK</button>');
  }

  function restart() { $$(".mk").forEach(function (m) { m.remove(); }); S = fresh(); stack = []; cur = null; go("welcome"); }
  $("#restart").onclick = restart;
  $("#back").onclick = back;
  go("welcome");
  hashSheet();
  window.addEventListener("hashchange", hashSheet);
})();
