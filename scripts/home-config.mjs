// Homepage switches. The build reads these and writes them into the page, so the served HTML
// only ever holds what is switched on. Change a value here, push, and the next build picks it up.

// Dale / D&P on the homepage (his name, photos, figures, site, before and after).
// OFF until Dale has said yes to homepage use in so many words. When off, none of it is in
// the served page, and assets/dale is not published.
export const DALE_ON = false;
// Town shown on Dale's framed photo. Leave blank unless it is the real town for that photo.
export const DALE_JOB_TOWN = "";

// Hero headline. A is live. B to D are held for a test once there is 2 to 4 weeks of traffic.
export const HEADLINES = {
  A: "Your best work, seen by the next customer.",
  B: "Snap the job. Get found.",
  C: "Your work is brilliant. Your website should prove it.",
  D: "Do the job. We'll make sure everyone sees it.",
};
export const HEADLINE = "A";

// Where "Get your free Website Check" goes. One switch, three choices.
//   call  : book a free call (today's homepage behaviour, the default for the preview)
//   phone : tap to call
//   form  : the Website Check page or a form or calendar address, set in CHECK_TARGETS.form
export const CHECK_MODE = "call";
export const CHECK_TARGETS = {
  call: { href: "https://cal.com/clockwork-ai/30min", newTab: true },
  phone: { href: "tel:+447460038202", newTab: false },
  form: { href: "/clockwork-check", newTab: false },
};

// Dale's live Which? figures are read from his live homepage at build time. If that fails,
// the figures are left off the page rather than shown stale.
export const DALE_LIVE_URL = "https://dandproofingandbuilding.co.uk/";
