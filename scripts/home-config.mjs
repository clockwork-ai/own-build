// Homepage switches. The build reads these and writes them into the page, so the served HTML
// only ever holds what is switched on. Change a value here, push, and the next build picks it up.

// Dale / D&P on the homepage (his name, photos, figures, site, before and after).
// He has agreed to this. When off, none of it is in the served page, and assets/dale is not published.
export const DALE_ON = true;
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
//   call  : book a free call
//   phone : tap to call. Live choice: those buttons open the phone dialler.
//   form  : the Website Check page, or a form or calendar address, set in CHECK_TARGETS.form
export const CHECK_MODE = "phone";
export const CHECK_TARGETS = {
  call: { href: "https://cal.com/clockwork-ai/30min", newTab: true },
  phone: { href: "tel:+447460038202", newTab: false },
  form: { href: "/clockwork-check", newTab: false },
};

// Dale's live Which? figures are read from his live homepage at build time. If that fails,
// the figures are left off the page rather than shown stale.
export const DALE_LIVE_URL = "https://dandproofingandbuilding.co.uk/";
// Dale's photo, logo and Which? badge are not kept in this repo. When DALE_ON, the build copies
// them from his live site into assets/dale. If one can't be fetched, the build stops rather than ship a gap.
export const DALE_ASSETS = {
  "dp-reroof.jpg": "https://dandproofingandbuilding.co.uk/brand_assets/fb-reroof-ridge-2.jpg",
  "dp-logo.png": "https://dandproofingandbuilding.co.uk/brand_assets/logo-dandp-crop.png",
  "badge-which.png": "https://dandproofingandbuilding.co.uk/brand_assets/badge-which.png",
};
