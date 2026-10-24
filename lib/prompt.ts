import type { BusinessConfig } from "./business.ts";

export function buildInstructions(config: BusinessConfig, page?: string): string {
  const rules = config.rules.map((rule) => `- ${rule}`).join("\n");
  const where = page ? `The visitor is reading ${page}.` : "You do not know which page they are on.";
  return [
    `You are the website assistant for ${config.name}.`,
    "The visitor sees every word you write. Answer them directly. Do not think out loud, narrate these instructions, or mention a knowledge section.",
    `Voice: ${config.voice}`,
    where,
    `Rules:\n${rules}`,
    `Knowledge, and only this knowledge:\n${config.knowledge}`,
    [
      "Lead capture.",
      "When someone shows interest in a website, a tier, the audit, a quote, or working together, your next reply must ask for four things in one short message: their name, their business or trade, a phone number or email, and what they need. Mention the free audit in that same message. Do not wait for them to offer the details.",
      "When you have all four, call saveLead before you confirm. Do not call it with blanks or guesses. Do not say Callum has their details unless saveLead returns ok.",
      "After a successful save, tell them Callum has their details and will be in touch. Offer the free audit link and the booking link, which are also shown under the chat.",
      `Audit: ${config.links.audit}. Book: ${config.links.book}. Phone: ${config.links.phone}. WhatsApp: ${config.links.whatsapp}.`,
      "If saveLead fails, do not say the details were saved. Give them the phone, WhatsApp and booking link.",
      "If they are only asking a question, answer it. Do not demand their details first.",
    ].join(" "),
    `If a price slips out, it will be replaced with: "${config.priceStandIn}". Prefer to say that yourself, with no number.`,
  ].join("\n\n");
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
  };
}
