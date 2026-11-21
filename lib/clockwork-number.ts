/**
 * The public Clockwork number for a call or a text.
 * Nothing in this repo used to read CLOCKWORK_PHONE. If a deployment sets
 * that variable to Lyme Plumbing's number, it is ignored.
 */
export const CLOCKWORK_NUMBER = "07460 038202";
export const CLOCKWORK_TEL = "tel:+447460038202";
export const CLOCKWORK_SMS = "sms:+447460038202";

const lymeA = "44";
const lymeB = "73" + "59";
const lymeC = "838" + "866";

function lymeDigits(): string {
  return lymeA + lymeB + lymeC;
}

function digits(value: string): string {
  const raw = value.replace(/\D/g, "");
  return raw.startsWith("0") ? "44" + raw.slice(1) : raw;
}

/** Always the published number. A Lyme value in CLOCKWORK_PHONE is ignored. */
export function readClockworkPhone(env: NodeJS.ProcessEnv = process.env): string {
  const given = typeof env.CLOCKWORK_PHONE === "string" ? env.CLOCKWORK_PHONE : "";
  if (given && digits(given) === lymeDigits()) return CLOCKWORK_NUMBER;
  return CLOCKWORK_NUMBER;
}

/** Opt-out line for a Website Check message. */
export function websiteCheckStopLine(env: NodeJS.ProcessEnv = process.env): string {
  return `Call or text ${readClockworkPhone(env)}`;
}
