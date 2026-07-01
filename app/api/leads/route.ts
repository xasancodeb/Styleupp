import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { parseBody } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const leadSchema = z.object({
  type: z.enum(["newsletter", "waitlist", "question"]),
  email: z.string().email().max(254),
  payload: z.record(z.string(), z.string().max(2000)).default({}),
});

// POST /api/leads — newsletter signups, city waitlist and pre-booking
// questions from the marketing site. Public, rate limited.
export async function POST(request: Request) {
  const limited = rateLimit(request, "leads", 20);
  if (limited) return limited;

  const parsed = await parseBody(request, leadSchema);
  if (!parsed.ok) return parsed.response;
  const d = parsed.data;

  const payload = Object.fromEntries(
    Object.entries(d.payload ?? {}).map(([k, v]) => [sanitizeText(k, 60), sanitizeText(v, 2000)])
  );

  try {
    const { error } = await supabaseAdmin()
      .from("leads")
      .insert({ type: d.type, email: d.email, payload });
    if (error) {
      console.error("[leads] insert failed:", error.message);
      return NextResponse.json({ error: "Could not save right now. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[leads]", err);
    return NextResponse.json({ error: "Could not save right now. Please try again." }, { status: 500 });
  }
}
