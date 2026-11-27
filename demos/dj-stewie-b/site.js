// Demo only. The date form stays on the page and requests nothing.
(function () {
  "use strict";

  function field(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function realDate(value) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!m) return false;
    var day = +m[1];
    var month = +m[2];
    var year = +m[3];
    if (month < 1 || month > 12 || day < 1 || year < 1000) return false;
    var dt = new Date(year, month - 1, day);
    return dt.getFullYear() === year && dt.getMonth() === month - 1 && dt.getDate() === day;
  }

  function bindCheckDate(doc) {
    var form = doc.getElementById("check-date");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var note = doc.getElementById("check-date-note");
      if (!note) return;
      var date = field(form, "date");
      var kind = field(form, "event");
      var person = field(form, "name");
      var number = field(form, "number");
      note.hidden = false;
      if (!date || !kind || !person || !number) {
        note.textContent = "Add the date, the type of event, your name and your number.";
        return;
      }
      if (!realDate(date)) {
        note.textContent = "Use the date as dd/mm/yyyy.";
        return;
      }
      note.textContent = "This is a demo. Nothing has been sent or saved. On a live site, the enquiry would be waiting when the night is done.";
    });
  }

  function bindReveal(doc) {
    var root = doc.documentElement;
    if (!root || !root.classList) return;
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline", "view()")) return;
    if (typeof IntersectionObserver !== "function") return;
    root.classList.add("motion");
    var nodes = doc.querySelectorAll("[data-reveal]");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18 });
    for (var i = 0; i < nodes.length; i++) io.observe(nodes[i]);
  }

  var api = { bindCheckDate: bindCheckDate, bindReveal: bindReveal };
  var globalRoot = typeof globalThis !== "undefined" ? globalThis : window;
  globalRoot.DJStewieDemo = api;

  if (typeof document !== "undefined") {
    bindCheckDate(document);
    bindReveal(document);
  }
})();
