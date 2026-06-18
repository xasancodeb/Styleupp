// Input sanitisation for user-generated text that may be rendered later.
// We strip control characters, neutralise HTML, and collapse whitespace.

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes HTML-significant characters to prevent injection when rendered. */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// ASCII control characters except tab (09), newline (0A) and carriage-return (0D).
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/** Trims, removes control chars, and caps length. Use for stored free text. */
export function sanitizeText(input: unknown, maxLength = 4000): string {
  if (typeof input !== "string") return "";
  return input.replace(CONTROL_CHARS, "").replace(/[ \t]+\n/g, "\n").trim().slice(0, maxLength);
}

const CONTACT_PATTERNS: RegExp[] = [
  // Email addresses
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
  // Phone numbers (7+ digits, allowing spaces/dashes/parens/+)
  /(\+?\d[\d\s().-]{6,}\d)/g,
  // Common messaging handles / links
  /\b(?:wa\.me|t\.me|instagram\.com|whatsapp|telegram|signal)\b[^\s]*/gi,
  /https?:\/\/[^\s]+/gi,
];

/**
 * Detects whether a message body contains contact details (email, phone,
 * social handles or links). Used to gate message visibility server-side until
 * 24h before the appointment.
 */
export function containsContactInfo(text: string): boolean {
  return CONTACT_PATTERNS.some((re) => {
    re.lastIndex = 0;
    return re.test(text);
  });
}

/** Replaces detected contact details with a redaction marker. */
export function redactContactInfo(text: string): string {
  let out = text;
  for (const re of CONTACT_PATTERNS) {
    re.lastIndex = 0;
    out = out.replace(re, "[contact hidden until 24h before your session]");
  }
  return out;
}
