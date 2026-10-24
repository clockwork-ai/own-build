(() => {
  const root = document.createElement("div");
  root.className = "cw-chat";
  root.innerHTML = `
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
      <button class="cw-form-toggle" type="button" aria-expanded="false">Leave your details</button>
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
      <nav class="cw-links" aria-label="Next steps">
        <a class="cw-audit" href="/clockwork-check.html">Free audit</a>
        <a class="cw-book" href="https://cal.com/clockwork-ai/30min" target="_blank" rel="noopener">Book a call</a>
      </nav>
    </section>
  `;
  document.body.appendChild(root);

  const launch = root.querySelector(".cw-launch");
  const panel = root.querySelector(".cw-panel");
  const close = root.querySelector(".cw-close");
  const log = root.querySelector(".cw-log");
  const chips = root.querySelector(".cw-chips");
  const formToggle = root.querySelector(".cw-form-toggle");
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

  function safeHref(href, fallback) {
    try {
      const url = new URL(href, location.origin);
      if (url.origin === location.origin || url.protocol === "https:") return url.href;
    } catch { /* keep fallback */ }
    return fallback;
  }

  function add(role, text) {
    const p = document.createElement("p");
    p.className = role === "user" ? "cw-msg cw-msg--user" : role === "note" ? "cw-msg cw-msg--note" : "cw-msg cw-msg--bot";
    p.textContent = text;
    log.appendChild(p);
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
    formToggle.textContent = next.formTitle || formToggle.textContent;
    form.querySelector("button").textContent = next.formSubmit || "Send";
    audit.href = safeHref(next.auditHref, "/clockwork-check.html");
    audit.textContent = next.auditLabel || "Free audit";
    book.href = safeHref(next.bookHref, "https://cal.com/clockwork-ai/30min");
    book.textContent = next.bookLabel || "Book a call";
    chips.replaceChildren();
    (next.suggestions || []).forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cw-chip";
      button.textContent = label;
      button.addEventListener("click", () => ask(label));
      chips.appendChild(button);
    });
    if (!messages.length && next.greeting) {
      messages.push({ role: "assistant", content: next.greeting });
      add("assistant", next.greeting);
    }
  }

  function openForm() {
    form.hidden = false;
    form.classList.add("is-open");
    formToggle.setAttribute("aria-expanded", "true");
  }

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    panel.hidden = !open;
    launch.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) input.focus();
    else launch.focus();
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
        greeting: "Hello. I can answer questions about the site and the free audit. What do you need?",
        placeholder: "Ask about a website, the audit, or the tiers",
        suggestions: ["What's the free audit?", "Can you do my roofing site?"],
        formTitle: "Leave your details",
        formSubmit: "Send to Callum",
        auditHref: "/clockwork-check.html",
        auditLabel: "Free Business Bottleneck Audit",
        bookHref: "https://cal.com/clockwork-ai/30min",
        bookLabel: "Book a free 30-minute call",
      });
    }
  }

  async function ask(text) {
    const content = text.replace(/\s+/g, " ").trim();
    if (!content || busy) return;
    busy = true;
    send.disabled = true;
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
        messages.pop();
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
          log.scrollTop = log.scrollHeight;
        }
        acc += decoder.decode();
      } else {
        acc = await response.text();
      }
      bubble.textContent = acc || "Sorry, I missed that.";
      messages.push({ role: "assistant", content: bubble.textContent });
      if (/your name|phone or email|leave your details/i.test(bubble.textContent)) openForm();
    } catch {
      bubble.className = "cw-msg cw-msg--note";
      bubble.textContent = "Sorry, the chat didn't connect. You can still book the free audit below.";
      messages.pop();
    } finally {
      busy = false;
      send.disabled = false;
      input.focus();
    }
  }

  launch.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) setOpen(false);
  });
  formToggle.addEventListener("click", () => {
    const open = form.hidden;
    form.hidden = !open;
    form.classList.toggle("is-open", open);
    formToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) form.querySelector("input").focus();
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
        body: JSON.stringify({ lead: data, page: pagePath() }),
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

  const ready = loadConfig();
  launch.addEventListener("click", () => { ready.then(() => input.focus()); }, { once: true });
})();
