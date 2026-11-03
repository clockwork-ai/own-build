/* Builds the customer's A4 PDF report in the browser. Demo only. */
(function () {
  var C = { navy: "#14172D", orange: "#FF6600", ink: "#14172D", muted: "#5B6075", line: "#E2E5EE", bg: "#F3F4F8",
    red: "#D7362B", amber: "#E79A00", green: "#22915A", redT: "#FCE9E7", amberT: "#FDF3DD", greenT: "#E3F4EA" };
  var RAG = {
    red: { c: C.red, t: C.redT, label: "Red", long: "Needs work now" },
    amber: { c: C.amber, t: C.amberT, label: "Amber", long: "Needs work soon" },
    green: { c: C.green, t: C.greenT, label: "Green", long: "No action needed" },
  };
  var fontCache = null;

  function b64(buf) {
    var s = "", a = new Uint8Array(buf), i, n = 0x8000;
    for (i = 0; i < a.length; i += n) s += String.fromCharCode.apply(null, a.subarray(i, i + n));
    return btoa(s);
  }
  function loadFonts() {
    if (fontCache) return Promise.resolve(fontCache);
    return Promise.all(["400", "600", "800"].map(function (w) {
      return fetch("fonts/PublicSans-" + w + ".ttf").then(function (r) { return r.arrayBuffer(); }).then(b64);
    })).then(function (f) { fontCache = f; return f; });
  }
  function loadImg(src) {
    return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; });
  }
  function toData(img, type, q) {
    var c = document.createElement("canvas"); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
    c.getContext("2d").drawImage(img, 0, 0); return c.toDataURL(type || "image/png", q);
  }
  function money(n) { return "£" + n.toLocaleString("en-GB"); }

  window.buildReport = function (S) {
    var ED = window.ED, J = ED.job, CO = ED.company;
    var jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) return Promise.reject(new Error("PDF library not loaded"));
    var photoIds = S.photoOrder.slice();
    return Promise.all([
      loadFonts(),
      loadImg("img/logo-light.png").then(function (i) { return toData(i); }),
      loadImg("img/logo-dark.png").then(function (i) { return toData(i); }),
      loadImg("img/house.jpg").then(function (i) {
        var c = document.createElement("canvas"); c.width = 1200; c.height = 650;
        var sh = i.naturalWidth * 650 / 1200; c.getContext("2d").drawImage(i, 0, (i.naturalHeight - sh) * .45, i.naturalWidth, sh, 0, 0, 1200, 650);
        return c.toDataURL("image/jpeg", .85);
      }),
      Promise.all(photoIds.map(function (id) { return window.EDrenderPhoto(id, 1200); })),
      window.EDplanPNG(),
    ]).then(function (r) {
      var fonts = r[0], logoL = r[1], logoD = r[2], house = r[3], photos = r[4], plan = r[5];
      var doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
      doc.addFileToVFS("PS-400.ttf", fonts[0]); doc.addFont("PS-400.ttf", "PS", "normal");
      doc.addFileToVFS("PS-600.ttf", fonts[1]); doc.addFont("PS-600.ttf", "PS", "semibold");
      doc.addFileToVFS("PS-800.ttf", fonts[2]); doc.addFont("PS-800.ttf", "PS", "bold");
      doc.setProperties({ title: "Damp survey report, " + J.address + " (sample)", author: "Easy Damp", subject: "Rising damp survey" });

      var W = 210, H = 297, M = 18, CW = W - 2 * M, y = 0;
      var LOGO_R = 283 / 1336;
      function font(w, size, col) { doc.setFont("PS", w); doc.setFontSize(size); doc.setTextColor(col || C.ink); }
      function text(str, x, yy, opt) { doc.text(str, x, yy, opt || {}); }
      function para(str, x, yy, w, size, col, lh) {
        font("normal", size || 10.5, col || C.ink);
        var lines = doc.splitTextToSize(str, w);
        doc.text(lines, x, yy, { lineHeightFactor: lh || 1.45 });
        return yy + lines.length * (size || 10.5) * 0.3528 * (lh || 1.45);
      }
      function pageTop(title) {
        doc.addPage();
        doc.addImage(logoD, "PNG", M, 12, 34, 34 * LOGO_R);
        font("semibold", 8.5, C.muted); text("Rising damp survey  ·  " + J.address, W - M, 17, { align: "right" });
        doc.setFillColor(C.orange); doc.rect(M, 23, CW, 0.7, "F");
        font("bold", 20, C.ink); text(title, M, 37);
        return 47;
      }
      function need(h, title) { if (y + h > H - 24) y = pageTop(title + " (continued)"); }
      function ragPill(rag, x, yy) {
        var R = RAG[rag]; font("bold", 8, "#FFFFFF");
        var label = R.label.toUpperCase(); var w = doc.getTextWidth(label) + 6;
        doc.setFillColor(R.c); doc.roundedRect(x, yy - 3.6, w, 5.2, 1.4, 1.4, "F"); text(label, x + 3, yy);
        return w;
      }
      function button(label, x, yy, w, fill, url) {
        doc.setFillColor(fill); doc.roundedRect(x, yy, w, 12, 3, 3, "F");
        font("bold", 11.5, "#FFFFFF"); text(label, x + w / 2, yy + 7.8, { align: "center" });
        doc.link(x, yy, w, 12, { url: url });
      }

      /* 1. Cover */
      doc.setFillColor(C.navy); doc.rect(0, 0, W, 132, "F");
      doc.addImage(logoL, "PNG", M, 20, 64, 64 * LOGO_R);
      font("bold", 9.5, C.orange); text("DAMP SURVEY REPORT", M, 58);
      font("bold", 30, "#FFFFFF"); text("Rising damp survey", M, 72);
      font("normal", 13, "#DCDFEA"); text(J.address + " " + J.postcode, M, 82);
      var meta = [["Prepared for", J.customer], ["Survey date", J.date], ["Surveyed by", CO.surveyor], ["Report ref", J.ref]];
      meta.forEach(function (m, i) {
        var x = M + (i % 2) * 88, yy = 96 + Math.floor(i / 2) * 13;
        font("semibold", 8, "#A9AEC4"); text(m[0].toUpperCase(), x, yy);
        font("semibold", 11, "#FFFFFF"); text(m[1], x, yy + 5.5);
      });
      doc.addImage(house, "JPEG", M, 140, CW, CW * 650 / 1200, undefined, "FAST");
      y = 140 + CW * 650 / 1200 + 12;
      doc.setFillColor(C.orange); doc.rect(M, y - 4, 1.2, 12, "F");
      font("semibold", 11, C.ink); text("This report is written to PCA standards.", M + 5, y + 1);
      font("normal", 9, C.muted); text("Sample report for a demo. The customer, address and figures are made up.", M + 5, y + 6.5);
      font("semibold", 9.5, C.ink); text(CO.phone + "   ·   " + CO.email + "   ·   " + CO.web, W / 2, H - 14, { align: "center" });

      /* 2. At a glance */
      y = pageTop("At a glance");
      y = para("Dear " + J.first + ",", M, y, CW, 11);
      y = para("Thanks for having me round. I've been through the ground floor and checked the walls you were worried about. The short version: you've got rising damp in the front room and the hall, and the path outside has been built up over the damp-proof course, which is what's letting it in. It's very common in houses this age and it's fixable. Everything's laid out below, with what to look at first.", M, y + 1, CW, 11) + 2;
      font("semibold", 11, C.ink); text("Chris Smith, Easy Damp", M, y + 2); y += 12;

      font("bold", 13, C.ink); text("What to look at first", M, y); y += 7;
      var order = { red: 0, amber: 1, green: 2 };
      var areas = ED.rooms.slice().sort(function (a, b) { return order[S.rooms[a.id].rag] - order[S.rooms[b.id].rag]; });
      areas.forEach(function (rm) {
        var rag = S.rooms[rm.id].rag, R = RAG[rag];
        font("normal", 10, C.ink);
        var lines = doc.splitTextToSize(rm.summary, CW - 50);
        var h = Math.max(16, 9 + lines.length * 4.9);
        doc.setFillColor(R.t); doc.roundedRect(M, y, CW, h, 2.5, 2.5, "F");
        doc.setFillColor(R.c); doc.roundedRect(M, y, 4, h, 2, 2, "F"); doc.rect(M + 2, y, 2, h, "F");
        font("bold", 11.5, C.ink); text(rm.name, M + 9, y + 7);
        font("bold", 8.5, R.c); text(R.long.toUpperCase(), M + 9, y + 12.2);
        font("normal", 10, C.ink); doc.text(lines, M + 50, y + 7, { lineHeightFactor: 1.4 });
        y += h + 3;
      });
      y += 3;
      font("normal", 9, C.muted);
      text("Red: needs work now.   Amber: needs work soon, or it will get worse.   Green: no action needed.", M, y);

      /* 3. Readings */
      y = pageTop("Readings, room by room");
      y = para("Readings were taken with a moisture meter at set heights up each wall. They're shown on the meter's relative scale: under 17 is dry, 17 to 20 is at risk, and over 20 is wet. Meter readings are a guide. The pattern up the wall, with the salts and the tide mark, is what tells us it's rising damp.", M, y, CW, 10, C.muted) + 4;
      ED.rooms.forEach(function (rm) {
        var st = S.rooms[rm.id];
        var rows = rm.walls.length ? ED.heights.length : 0;
        need(26 + rows * 6.5, "Readings, room by room");
        font("bold", 13, C.ink); text(rm.name, M, y); ragPill(st.rag, M + doc.getTextWidth(rm.name) + 4, y - 0.3); y += 6;
        if (rm.walls.length) {
          var cols = rm.walls.length, colW = Math.min(52, (CW - 32) / cols);
          font("semibold", 8.5, C.muted); text("Height", M, y + 3);
          rm.walls.forEach(function (w, i) { text(w.name, M + 32 + i * colW, y + 3); });
          y += 5.5;
          ED.heights.slice().reverse().forEach(function (hgt, ri) {
            var idx = ED.heights.length - 1 - ri;
            doc.setDrawColor(C.line); doc.setLineWidth(0.2); doc.line(M, y, M + 32 + cols * colW, y);
            font("normal", 9.5, C.muted); text(hgt + "mm", M, y + 4.4);
            rm.walls.forEach(function (w, i) {
              var v = st.readings[i][idx];
              if (v == null) { font("normal", 9.5, C.muted); text("-", M + 32 + i * colW, y + 4.4); return; }
              var band = v > 20 ? "red" : v >= 17 ? "amber" : "green";
              var bw = (colW - 14) * Math.min(1, v / 30);
              doc.setFillColor(RAG[band].t); doc.roundedRect(M + 32 + i * colW, y + 1.2, colW - 14, 4, 1, 1, "F");
              doc.setFillColor(RAG[band].c); doc.roundedRect(M + 32 + i * colW, y + 1.2, bw, 4, 1, 1, "F");
              font("bold", 9.5, C.ink); text(String(v), M + 32 + i * colW + colW - 11, y + 4.6);
            });
            y += 6.5;
          });
          y += 2;
        }
        var obs = st.obs.length ? "Found: " + st.obs.join(", ") + "." : "";
        var note = st.notes ? st.notes : "";
        if (obs) y = para(obs, M, y + 2, CW, 9.5, C.ink);
        if (note) y = para(note, M, y + 1, CW, 9.5, C.muted);
        y += 7;
      });

      /* Floor plan */
      y = pageTop("Where the problems are");
      var pw = 120, ph = pw * plan.h / plan.w;
      doc.addImage(plan.data, "PNG", M, y, pw, ph);
      var ly = y + 4;
      font("bold", 10.5, C.ink); text("Pins", M + pw + 8, ly); ly += 6;
      S.pins.forEach(function (p, i) {
        doc.setFillColor(RAG[p.rag].c); doc.circle(M + pw + 10.5, ly - 1.3, 2.6, "F");
        font("bold", 7.5, "#FFFFFF"); text(String(i + 1), M + pw + 10.5, ly - 0.2, { align: "center" });
        font("normal", 9.5, C.ink);
        var l = doc.splitTextToSize(p.label, CW - pw - 16); doc.text(l, M + pw + 15, ly); ly += l.length * 4.4 + 2.5;
      });

      /* Photos */
      y = pageTop("Photos");
      var colw = (CW - 8) / 2, imh = colw * 0.75;
      photos.forEach(function (ph, i) {
        var col = i % 2, x = M + col * (colw + 8);
        if (col === 0 && i > 0) y += imh + 18;
        if (y + imh + 14 > H - 24) { y = pageTop("Photos (continued)"); }
        doc.addImage(ph, "JPEG", x, y, colw, imh, undefined, "FAST");
        font("normal", 9, C.ink);
        doc.text(doc.splitTextToSize(ED.photos[photoIds[i]].caption, colw), x, y + imh + 5);
      });

      /* Quote */
      y = pageTop("Recommended work and quote");
      y = para("This is what I'd recommend to fix the damp and stop it coming back. It's a fixed price. It won't go up once we've started.", M, y, CW, 10.5) + 4;
      doc.setFillColor(C.amberT); doc.roundedRect(M, y - 4.2, 62, 6.2, 1.5, 1.5, "F");
      font("bold", 8.5, "#8A5A00"); text("EXAMPLE FIGURES FOR THIS DEMO", M + 3, y); y += 7;
      var works = ED.works.filter(function (w) { return S.works[w.id]; }), sub = 0;
      works.forEach(function (w) {
        font("normal", 10, C.ink);
        var l = doc.splitTextToSize(w.text, CW - 32);
        doc.setDrawColor(C.line); doc.setLineWidth(0.25); doc.line(M, y - 3.5, W - M, y - 3.5);
        doc.text(l, M, y + 1.2, { lineHeightFactor: 1.4 });
        font("bold", 10.5, C.ink); text(money(w.price), W - M, y + 1.2, { align: "right" });
        y += l.length * 4.9 + 5; sub += w.price;
      });
      var vat = Math.round(sub * 0.2);
      doc.setDrawColor(C.navy); doc.setLineWidth(0.6); doc.line(M + 90, y - 3.5, W - M, y - 3.5);
      [["Subtotal", money(sub)], ["VAT at 20%", money(vat)]].forEach(function (r) {
        font("normal", 10.5, C.muted); text(r[0], M + 90, y + 1); font("semibold", 10.5, C.ink); text(r[1], W - M, y + 1, { align: "right" }); y += 6.5;
      });
      font("bold", 13, C.ink); text("Total", M + 90, y + 2); text(money(sub + vat), W - M, y + 2, { align: "right" }); y += 9;
      font("normal", 10, C.muted); text("Deposit to book a date: " + money(ED.deposit) + ". The rest is due when the job's finished.", M + 90, y, { maxWidth: CW - 90 }); y += 14;
      font("normal", 9.5, C.muted); text("This quote is valid for 30 days from " + J.dateShort + ".", M, y); y += 9;
      var base = location.origin + location.pathname.replace(/[^/]*$/, "");
      button("Book the work", M, y, (CW - 6) / 2, C.orange, base + "#book");
      button("Pay a deposit", M + (CW + 6) / 2, y, (CW - 6) / 2, C.navy, base + "#deposit");
      y += 18;
      font("normal", 8.5, C.muted); text("Demo only. These buttons open a demo page and no payment is taken.", M, y);

      /* Aftercare */
      y = pageTop("Aftercare and guarantee");
      ED.aftercare.forEach(function (a) {
        need(22, "Aftercare and guarantee");
        font("bold", 11.5, C.ink); text(a[0], M, y);
        y = para(a[1], M, y + 5.5, CW, 10, C.ink) + 5;
      });
      need(70, "Aftercare and guarantee");
      y += 2;
      font("bold", 11.5, C.ink); text("What this survey covered", M, y);
      y = para("We inspected the ground floor walls and the outside of the front wall, as listed in this report. Furniture wasn't moved, and we didn't open up floors or look at the first floor. If anything changes, or you spot something we haven't covered, give us a ring.", M, y + 5.5, CW, 10, C.ink) + 8;

      var sw = (CW - 10) / 2;
      [["Checked and signed by", CO.surveyor + ", Easy Damp", S.chrisSig], ["Survey visit confirmed by", J.customer + " (customer)", S.custSig]].forEach(function (s, i) {
        var x = M + i * (sw + 10);
        font("semibold", 8.5, C.muted); text(s[0].toUpperCase(), x, y);
        doc.setFillColor(C.bg); doc.roundedRect(x, y + 3, sw, 26, 2, 2, "F");
        if (s[2]) doc.addImage(s[2], "PNG", x + 4, y + 4, sw - 8, 24);
        font("semibold", 10, C.ink); text(s[1], x, y + 35);
        font("normal", 9, C.muted); text(J.date, x, y + 40);
      });
      y += 52;
      doc.setFillColor(C.orange); doc.rect(M, y - 4, 1.2, 8, "F");
      font("semibold", 10.5, C.ink); text("This report is written to PCA standards.", M + 5, y + 1.2);

      /* Header/footer on every page after the cover */
      var n = doc.getNumberOfPages();
      for (var p = 2; p <= n; p++) {
        doc.setPage(p);
        doc.setDrawColor(C.line); doc.setLineWidth(0.3); doc.line(M, H - 17, W - M, H - 17);
        font("semibold", 8.5, C.ink); text("Easy Damp  ·  " + CO.phone + "  ·  " + CO.web, M, H - 12);
        text("Ref " + J.ref + "  ·  Page " + p + " of " + n, W - M, H - 12, { align: "right" });
        font("normal", 7.5, C.muted); text("Sample report for a demo. Fictional customer and address.", M, H - 8);
      }
      return doc.output("blob");
    });
  };
})();
