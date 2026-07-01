// Transactional email via Resend's HTTP API (no SDK dependency). When
// RESEND_API_KEY is absent — local dev — emails are logged instead of sent, so
// nothing breaks and you can still see what would have gone out.

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || "StyleUp <onboarding@resend.dev>";
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:dev] → ${to} | ${subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromAddress(), to, subject, html, text: text ?? stripHtml(html) }),
    });
    if (!res.ok) {
      console.error(`[email] send failed (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] send error", err);
    return false;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ─────────────────────────── branded templates ──────────────────────────────
function layout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF8F5;padding:32px;border-radius:16px;color:#1A1612">
    <div style="font-size:24px;font-weight:700;margin-bottom:8px">Style<span style="color:#C4923A">Up</span></div>
    <h1 style="font-size:22px;margin:16px 0">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#4a4339">${bodyHtml}</div>
    <p style="font-size:12px;color:#9b9286;margin-top:28px">StyleUp · Personal styling, made personal.</p>
  </div>`;
}

export function bookingConfirmedEmail(opts: {
  name: string;
  stylist: string;
  service: string;
  when: string;
  total: string;
}): { subject: string; html: string } {
  return {
    subject: `Booking confirmed: ${opts.service} with ${opts.stylist}`,
    html: layout(
      "Your booking is confirmed",
      `<p>Hi ${opts.name || "there"},</p>
       <p>Your session is all set. Here are the details:</p>
       <ul>
         <li><strong>Stylist:</strong> ${opts.stylist}</li>
         <li><strong>Service:</strong> ${opts.service}</li>
         <li><strong>When:</strong> ${opts.when}</li>
         <li><strong>Total paid:</strong> ${opts.total}</li>
       </ul>
       <p>You can message your stylist any time from your dashboard. Contact details unlock 24 hours before your session.</p>`
    ),
  };
}

export function bookingCancelledEmail(opts: {
  name: string;
  service: string;
  when: string;
  refund: string;
}): { subject: string; html: string } {
  return {
    subject: `Booking cancelled: ${opts.service}`,
    html: layout(
      "Your booking was cancelled",
      `<p>Hi ${opts.name || "there"},</p>
       <p>Your <strong>${opts.service}</strong> session on ${opts.when} has been cancelled.</p>
       <p><strong>Refund:</strong> ${opts.refund}. Refunds return to your original payment method within 5–10 business days.</p>`
    ),
  };
}

export function bookingReminderEmail(opts: {
  name: string;
  stylist: string;
  when: string;
}): { subject: string; html: string } {
  return {
    subject: `Reminder: your session with ${opts.stylist}`,
    html: layout(
      "Your session is coming up",
      `<p>Hi ${opts.name || "there"},</p>
       <p>This is a friendly reminder about your upcoming session with <strong>${opts.stylist}</strong> on ${opts.when}.</p>
       <p>Your stylist's contact details are now available in your dashboard.</p>`
    ),
  };
}

export function stylistApprovedEmail(opts: { name: string }): { subject: string; html: string } {
  return {
    subject: "Welcome to StyleUp: your application is approved",
    html: layout(
      "You're in! 🎉",
      `<p>Hi ${opts.name || "there"},</p>
       <p>Congratulations! Your stylist application has been approved. Sign in to complete your onboarding, set your availability and connect payouts.</p>
       <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/stylist-dashboard" style="color:#C4923A">Go to your stylist dashboard →</a></p>`
    ),
  };
}
