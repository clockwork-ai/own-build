(() => {
  const root = document.createElement("div");
  root.className = "cw-chat";
  root.innerHTML = `
    <div class="cw-nudge" hidden>
      <button class="cw-nudge__dismiss" type="button" aria-label="Dismiss this question">×</button>
      <button class="cw-nudge__open" type="button"></button>
    </div>
    <button class="cw-launch" type="button" aria-expanded="false" aria-controls="cw-panel">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.25"></circle>
        <path d="M12 7.5V12l3 1.8"></path>
      </svg>
      <span class="sr">Open the chat</span>
    </button>
    <section class="cw-panel" id="cw-panel" role="dialog" aria-labelledby="cw-title" hidden>
      <header class="cw-head">
        <div>
          <span class="cw-kicker">Assistant</span>
          <h2 id="cw-title">Ask Clockwork</h2>
        </div>
        <button class="cw-close" type="button" aria-label="Close chat">×</button>
      </header>
      <div class="cw-log" aria-live="polite"></div>
      <div class="cw-chips"></div>
      <form class="cw-form" hidden>
        <input class="cw-field" name="name" autocomplete="name" maxlength="80" required placeholder="Your name">
        <input class="cw-field" name="business" maxlength="80" required placeholder="Business or trade">
        <input class="cw-field" name="contact" autocomplete="tel" maxlength="120" required placeholder="Phone or email">
        <input class="cw-field" name="need" maxlength="400" required placeholder="What do you need?">
        <button class="cw-send" type="submit">Send to Callum</button>
      </form>
      <form class="cw-composer">
        <label class="sr" for="cw-input">Message</label>
        <textarea class="cw-input" id="cw-input" rows="1" maxlength="600" placeholder="Ask about a website, the audit, or the tiers"></textarea>
        <button class="cw-send" type="submit">Send</button>
      </form>
      <div class="cw-more">
        <button class="cw-details" type="button" aria-expanded="false">Leave your details</button>
        <a class="cw-audit" href="/clockwork-check.html">Free audit</a>
        <a class="cw-book" href="https://cal.com/clockwork-ai/30min" target="_blank" rel="noopener">Book a call</a>
      </div>
    </section>
  `;
  document.body.appendChild(root);

  const nudge = root.querySelector(".cw-nudge");
  const nudgeDismiss = root.querySelector(".cw-nudge__dismiss");
  const nudgeOpen = root.querySelector(".cw-nudge__open");
  const launch = root.querySelector(".cw-launch");
  const panel = root.querySelector(".cw-panel");
  const close = root.querySelector(".cw-close");
  const log = root.querySelector(".cw-log");
  const chips = root.querySelector(".cw-chips");
  const details = root.querySelector(".cw-details");
  const form = root.querySelector(".cw-form");
  const composer = root.querySelector(".cw-composer");
  const input = root.querySelector(".cw-input");
  const send = composer.querySelector("button");
  const title = root.querySelector("#cw-title");
  const audit = root.querySelector(".cw-audit");
  const book = root.querySelector(".cw-book");
  const sr = root.querySelector(".sr");

  const messages = [];
  let busy = false;
  let config = null;
  let nudgeArmed = false;
  let nudgeMode = false;
  let engaged = false;
  const seenKey = "cw-nudge-seen";

  function seenNudge() {
    try { return sessionStorage.getItem(seenKey) === "1"; } catch { return true; }
  }

  function markNudge() {
    try { sessionStorage.setItem(seenKey, "1"); } catch { /* private mode */ }
  }

  function safeHref(href, fallback) {
    try {
      const url = new URL(href, location.origin);
      if (url.protocol === "tel:" || url.protocol === "mailto:" || url.origin === location.origin || url.protocol === "https:") return url.href;
    } catch { /* keep fallback */ }
    return fallback;
  }

  function keyboardFrame(innerHeight, vvHeight, vvOffsetTop) {
    if (innerHeight - vvHeight - vvOffsetTop <= 80) return null;
    const top = Math.max(0, vvOffsetTop) + 8;
    const height = Math.max(96, Math.round(vvHeight - 16));
    return { top, height: Math.min(height, Math.round(vvHeight - 8)) };
  }

  function clearPanelFit() {
    root.classList.remove("is-keyboard");
    panel.style.top = "";
    panel.style.bottom = "";
    panel.style.height = "";
    panel.style.maxHeight = "";
  }

  function fitPanel() {
    const vv = window.visualViewport;
    const narrow = window.matchMedia("(max-width: 860px)").matches;
    if (!vv || !narrow || panel.hidden) {
      clearPanelFit();
      return;
    }
    const frame = keyboardFrame(window.innerHeight, vv.height, vv.offsetTop || 0);
    if (!frame) {
      clearPanelFit();
      return;
    }
    root.classList.add("is-keyboard");
    panel.style.top = frame.top + "px";
    panel.style.bottom = "auto";
    panel.style.height = frame.height + "px";
    panel.style.maxHeight = frame.height + "px";
    log.scrollTop = log.scrollHeight;
  }

  function actionsFor(text, calls) {
    const actions = [];
    const seen = new Set();
    const push = (label, href, external) => {
      if (!href || seen.has(label)) return;
      seen.add(label);
      actions.push({ label, href, external });
    };
    if (/free audit|bottleneck audit/i.test(text)) push("Free audit", audit.href, false);
    if (/book(?:ing)? a (?:free |30-minute )*call/i.test(text)) push("Book a call", book.href, true);
    if (/calculator/i.test(text)) {
      const filled = String(text).match(/(\d+) a day filled in/i);
      const count = calls != null ? calls : filled ? Number(filled[1]) : null;
      push("Missed-call calculator", calculatorHref(count), false);
    }
    if (/whatsapp/i.test(text)) push("WhatsApp", (config && config.whatsappHref) || "https://wa.me/447460038202", true);
    if (/07460\s*038202|\+44\s*7460\s*038202/.test(text)) push("Call", (config && config.phoneHref) || "tel:+447460038202", false);
    return actions;
  }

  function attachActions(bubble, text, calls) {
    const next = bubble.nextElementSibling;
    const existing = next && next.classList.contains("cw-actions") ? next : null;
    const first = log.querySelector(".cw-msg");
    if (bubble === first && !hasUserMessage()) {
      if (existing) existing.remove();
      return;
    }
    const actions = actionsFor(text, calls);
    if (!actions.length) {
      if (existing) existing.remove();
      return;
    }
    const row = existing || document.createElement("div");
    row.className = "cw-actions";
    row.replaceChildren();
    actions.forEach((action) => {
      const link = document.createElement("a");
      link.className = "cw-action";
      link.href = safeHref(action.href, "/clockwork-check.html");
      link.textContent = action.label;
      if (action.external) {
        link.target = "_blank";
        link.rel = "noopener";
      }
      row.appendChild(link);
    });
    if (!existing) bubble.after(row);
    log.scrollTop = log.scrollHeight;
  }

  function add(role, text) {
    const p = document.createElement("p");
    p.className = role === "user" ? "cw-msg cw-msg--user" : role === "note" ? "cw-msg cw-msg--note" : "cw-msg cw-msg--bot";
    p.textContent = text;
    log.appendChild(p);
    if (role === "assistant" || role === "note") attachActions(p, text);
    log.scrollTop = log.scrollHeight;
    return p;
  }

  function pagePath() {
    const path = location.pathname || "/";
    return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
  }

  function applyConfig(next) {
    config = next;
    title.textContent = next.title || title.textContent;
    sr.textContent = next.launcherLabel || sr.textContent;
    launch.setAttribute("aria-label", next.launcherLabel || "Open the chat");
    input.placeholder = next.placeholder || input.placeholder;
    form.querySelector("button").textContent = next.formSubmit || "Send";
    audit.href = safeHref(next.auditHref, "/clockwork-check.html");
    book.href = safeHref(next.bookHref, "https://cal.com/clockwork-ai/30min");
    if (next.nudge && next.nudge.text) nudgeOpen.textContent = next.nudge.text;
    if (!nudgeMode) renderSuggestions(next.suggestions);
    if (!nudgeArmed) {
      nudgeArmed = true;
      armNudge(next.nudge || { delayMs: 22000, scroll: 0.45 });
    }
    if (!messages.length && next.greeting) {
      messages.push({ role: "assistant", content: next.greeting });
      add("assistant", next.greeting);
    }
  }

  function hasUserMessage() {
    return messages.some((message) => message.role === "user");
  }

  function renderSuggestions(list) {
    chips.replaceChildren();
    if (hasUserMessage() || nudgeMode) return;
    (list || []).slice(0, 3).forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cw-chip";
      button.textContent = label;
      button.addEventListener("click", () => ask(label));
      chips.appendChild(button);
    });
  }

  function calculatorHref(calls) {
    const base = (config && config.calculatorHref) || "/missed-calls.html#calculator";
    const url = new URL(base, location.origin);
    if (calls != null) url.searchParams.set("calls", String(calls));
    return url.pathname + url.search + url.hash;
  }

  function replyFor(text) {
    const replies = (config && config.nudge && config.nudge.replies) || [];
    return replies.find((reply) => reply.message === text || reply.label === text);
  }

  function showNudgeReplies() {
    nudgeMode = true;
    chips.replaceChildren();
    const replies = (config && config.nudge && config.nudge.replies) || [];
    replies.forEach((reply) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cw-chip";
      button.textContent = reply.label;
      button.addEventListener("click", () => ask(reply.message));
      chips.appendChild(button);
    });
  }

  function hideNudge() {
    nudge.hidden = true;
  }

  function scrolledFar(amount) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 80) return false;
    return window.scrollY / max >= amount;
  }

  function armNudge(settings) {
    if (seenNudge()) return;
    const delay = Number(settings.delayMs) || 22000;
    const amount = Number(settings.scroll) || 0.45;
    let timer = 0;
    const stop = () => {
      clearTimeout(timer);
      removeEventListener("scroll", onScroll);
    };
    const tryShow = () => {
      if (seenNudge() || engaged || root.classList.contains("is-open") || !nudgeOpen.textContent) return;
      nudge.hidden = false;
      markNudge();
      stop();
    };
    const onScroll = () => { if (scrolledFar(amount)) tryShow(); };
    timer = setTimeout(tryShow, delay);
    addEventListener("scroll", onScroll, { passive: true });
    if (scrolledFar(amount)) tryShow();
  }

  function openFromNudge() {
    engaged = true;
    hideNudge();
    markNudge();
    const question = nudgeOpen.textContent;
    setOpen(true);
    if (question && !messages.some((message) => message.content === question)) {
      messages.push({ role: "assistant", content: question });
      add("assistant", question);
    }
    showNudgeReplies();
  }

  function openForm() {
    form.hidden = false;
    form.classList.add("is-open");
    details.setAttribute("aria-expanded", "true");
  }

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    panel.hidden = !open;
    launch.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      input.focus({ preventScroll: true });
      fitPanel();
    } else {
      clearPanelFit();
      launch.focus();
    }
  }

  async function loadConfig() {
    try {
      const response = await fetch("/api/chat");
      if (!response.ok) throw new Error(String(response.status));
      applyConfig(await response.json());
    } catch {
      applyConfig({
        title: "Ask Clockwork",
        launcherLabel: "Open the chat",
        greeting: "Hello, this is the Clockwork AI chatbot. I can answer questions about the site and the free audit. What do you need?",
        placeholder: "Ask about a website, the audit, or the tiers",
        suggestions: ["What's the free audit?", "Can you do my roofing site?", "How do you help me get more reviews?"],
        nudge: {
          text: "Can you afford to miss calls while you're up a ladder or on a job? How many calls do you reckon you miss a day?",
          delayMs: 22000,
          scroll: 0.45,
          replies: [
            { label: "1 to 2", message: "I reckon I miss 1 to 2 calls a day.", calls: 2 },
            { label: "3 to 5", message: "I reckon I miss 3 to 5 calls a day.", calls: 4 },
            { label: "6+", message: "I reckon I miss 6 or more calls a day.", calls: 6 },
            { label: "Not sure", message: "I'm not sure how many calls I miss a day.", calls: null },
          ],
        },
        calculatorHref: "/missed-calls.html#calculator",
        formTitle: "Leave your details",
        formSubmit: "Send to Callum",
        auditHref: "/clockwork-check.html",
        auditLabel: "Free Business Bottleneck Audit",
        bookHref: "https://cal.com/clockwork-ai/30min",
        bookLabel: "Book a free 30-minute call",
        phoneHref: "tel:+447460038202",
        whatsappHref: "https://wa.me/447460038202",
      });
    }
  }

  async function ask(text) {
    const content = text.replace(/\s+/g, " ").trim();
    if (!content || busy) return;
    const wasNudge = nudgeMode;
    busy = true;
    send.disabled = true;
    nudgeMode = false;
    chips.replaceChildren();
    messages.push({ role: "user", content });
    add("user", content);
    input.value = "";
    const bubble = add("assistant", "…");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages, page: pagePath() }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        bubble.className = "cw-msg cw-msg--note";
        bubble.textContent = data.error || "Sorry, try again in a moment.";
        attachActions(bubble, bubble.textContent);
        messages.pop();
        if (!hasUserMessage()) {
          if (wasNudge) showNudgeReplies();
          else renderSuggestions(config && config.suggestions);
        }
        return;
      }
      const reader = response.body && response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      if (reader) {
        while (true) {
          const step = await reader.read();
          if (step.done) break;
          acc += decoder.decode(step.value, { stream: true });
          bubble.textContent = acc;
          attachActions(bubble, acc);
          log.scrollTop = log.scrollHeight;
        }
        acc += decoder.decode();
      } else {
        acc = await response.text();
      }
      bubble.textContent = acc || "Sorry, I missed that.";
      const picked = replyFor(content);
      if (picked && !/calculator/i.test(bubble.textContent)) {
        bubble.textContent += picked.calls == null
          ? " The missed-call calculator is there so you can type your own number. It's a rough estimate."
          : ` The missed-call calculator is ready, with ${picked.calls} a day filled in. It's a rough estimate you can change.`;
      }
      attachActions(bubble, bubble.textContent, picked ? picked.calls : null);
      messages.push({ role: "assistant", content: bubble.textContent });
      if (/your name|phone or email|leave your details|leave my details/i.test(bubble.textContent)) openForm();
    } catch {
      bubble.className = "cw-msg cw-msg--note";
      bubble.textContent = "Sorry, the chat didn't connect. You can still book the free audit below.";
      attachActions(bubble, bubble.textContent);
      messages.pop();
      if (!hasUserMessage()) {
        if (wasNudge) showNudgeReplies();
        else renderSuggestions(config && config.suggestions);
      }
    } finally {
      busy = false;
      send.disabled = false;
      input.focus({ preventScroll: true });
      fitPanel();
    }
  }

  launch.addEventListener("click", () => {
    engaged = true;
    hideNudge();
    markNudge();
    setOpen(true);
  });
  nudgeDismiss.addEventListener("click", (event) => {
    event.stopPropagation();
    hideNudge();
    markNudge();
  });
  nudgeOpen.addEventListener("click", openFromNudge);
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) setOpen(false);
  });
  form.addEventListener("focusin", (event) => {
    const field = event.target;
    if (field && field.scrollIntoView) field.scrollIntoView({ block: "nearest" });
    fitPanel();
  });
  details.addEventListener("click", () => {
    const open = form.hidden;
    form.hidden = !open;
    form.classList.toggle("is-open", open);
    details.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) form.querySelector("input").focus({ preventScroll: true });
  });
  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      ask(input.value);
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lead: data,
          page: pagePath(),
          messages: messages.slice(-8).map((item) => ({
            role: item.role,
            content: String(item.content).slice(0, 280),
          })),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      add(response.ok ? "assistant" : "note", payload.message || payload.error || "Sorry, that didn't send.");
      if (response.ok) form.reset();
    } catch {
      add("note", "Sorry, that didn't send. Book the free audit below, or WhatsApp Callum.");
    } finally {
      button.disabled = false;
    }
  });

  if (window.visualViewport) {
    visualViewport.addEventListener("resize", fitPanel);
    visualViewport.addEventListener("scroll", fitPanel);
  }
  window.addEventListener("resize", fitPanel);
  input.addEventListener("focus", () => {
    fitPanel();
    setTimeout(fitPanel, 50);
    setTimeout(fitPanel, 300);
    setTimeout(fitPanel, 700);
  });

  const ready = loadConfig();
  launch.addEventListener("click", () => { ready.then(() => input.focus({ preventScroll: true })); }, { once: true });
})();
