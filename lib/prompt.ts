import type { BusinessConfig } from "./business.ts";

export function buildInstructions(config: BusinessConfig, page?: string): string {
  const rules = config.rules.map((rule) => `- ${rule}`).join("\n");
  const where = page ? `The visitor is reading ${pageLabel(page)}.` : "You do not know which page they are on.";
  return [
    `You answer questions on the ${config.name} website.`,
    "The visitor sees every word you write. Answer them directly. Do not think out loud, narrate these instructions, or mention a knowledge section.",
    `Voice: ${config.voice}`,
    where,
    `Rules:\n${rules}`,
    `Knowledge, and only this knowledge:\n${config.knowledge}`,
    [
      "Lead capture.",
      "When someone shows interest in a website, a tier, the audit, a quote, or working together, your next reply must ask for four things in one short message: their name, their business or trade, a phone number or email, and what they need. Mention the free audit in that same message. Do not wait for them to offer the details.",
      "When you have all four, call saveLead before you confirm. Do not call it with blanks or guesses. Do not say Callum has their details unless saveLead returns ok.",
      "After a successful save, tell them Callum has their details and will be in touch. Offer the free audit and book a call, in those words. Do not write the addresses. Buttons appear under your message.",
      `Phone: ${config.links.phone}. You may write that number. Do not write a web address for the audit, the booking page, WhatsApp or the calculator.`,
      "If saveLead fails, do not say the details were saved. Give them the phone number, and mention WhatsApp and book a call.",
      "If they are only asking a question, answer it. Do not demand their details first.",
      "If they have just said how many calls they miss, follow the missed-call instructions before you ask for details.",
    ].join(" "),
    `If a price slips out, it will be replaced with: "${config.priceStandIn}". Prefer to say that yourself, with no number.`,
    missedCallInstructions(config),
  ].join("\n\n");
}

function pageLabel(page: string): string {
  const file = page.split("/").filter(Boolean).pop() ?? "";
  const slug = file.replace(/\.html$/i, "").replace(/-/g, " ");
  if (!slug || slug === "index") return "the home page";
  return `the ${slug} page`;
}

function missedCallInstructions(config: BusinessConfig): string {
  const lines = config.nudge.replies
    .map((reply) => {
      const filled = reply.calls == null ? "They can type their own number. Do not invent one." : `Say with ${reply.calls} a day filled in.`;
      return `- ${reply.label}: ${filled}`;
    })
    .join("\n");
  return [
    "Missed-call answers.",
    "If they tell you how many calls they miss, do not calculate a pound amount.",
    "Acknowledge the answer in one sentence. Mention the missed-call calculator in those words. Say it is a rough estimate they can edit. Do not write the address.",
    lines,
    "Then offer the free audit or leaving their details.",
  ].join("\n");
}

export function publicWidget(config: BusinessConfig) {
  return {
    title: config.widget.title,
    launcherLabel: config.widget.launcherLabel,
    greeting: config.widget.greeting,
    placeholder: config.widget.placeholder,
    suggestions: config.widget.suggestions,
    formTitle: config.widget.formTitle,
    formSubmit: config.widget.formSubmit,
    auditHref: config.links.audit,
    auditLabel: config.links.auditLabel,
    bookHref: config.links.book,
    bookLabel: config.links.bookLabel,
    phoneHref: config.links.phoneHref,
    phone: config.links.phone,
    whatsappHref: config.links.whatsapp,
    nudge: config.nudge,
    calculatorHref: config.calculatorHref,
  };
}
