// Demo only. The date form stays on the page and requests nothing.
(function () {
  "use strict";

  function field(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el && typeof el.value === "string" ? el.value.trim() : "";
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
      note.textContent = "This is a demo. Nothing has been sent or saved. On a live site, the enquiry would be waiting when the night is done.";
    });
  }

  function bindPlayers(doc) {
    var nodes = doc.querySelectorAll("[data-placeholder]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener("click", function (event) {
        var btn = event.currentTarget;
        var id = btn.getAttribute("aria-controls");
        var note = id ? doc.getElementById(id) : null;
        if (!note) return;
        note.hidden = false;
        btn.setAttribute("aria-pressed", "true");
      });
    }
  }

  var api = { bindCheckDate: bindCheckDate, bindPlayers: bindPlayers };
  var root = typeof globalThis !== "undefined" ? globalThis : window;
  root.DJStewieDemo = api;

  if (typeof document !== "undefined") {
    bindCheckDate(document);
    bindPlayers(document);
  }
})();
