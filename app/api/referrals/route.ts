import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { parseBody, referralSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// GET /api/referrals — the user's referral code + sent invites + loyalty.
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();
  const [{ data: profile }, { data: referrals }, { data: milestones }] = await Promise.all([
    supabase.from("profiles").select("referral_code, loyalty_points").eq("id", auth.user.id).single(),
    supabase.from("referrals").select("*").eq("referrer_id", auth.user.id).order("created_at", { ascending: false }),
    supabase.from("loyalty_milestones").select("*").eq("profile_id", auth.user.id),
  ]);

  return NextResponse.json({
    code: profile?.referral_code ?? null,
    loyaltyPoints: profile?.loyalty_points ?? 0,
    referrals: referrals ?? [],
    milestones: milestones ?? [],
  });
}

// POST /api/referrals — invite someone by email.
export async function POST(request: Request) {
  const limited = rateLimit(request, "referrals:invite", 20);
  if (limited) return limited;

  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request, referralSchema);
  if (!parsed.ok) return parsed.response;

  const supabase = await supabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, full_name")
    .eq("id", auth.user.id)
    .single();
  const code = (profile?.referral_code as string) ?? "";

  const { error } = await supabase.from("referrals").insert({
    referrer_id: auth.user.id,
    referred_email: parsed.data.email,
    code,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  await sendEmail({
    to: parsed.data.email,
    subject: `${profile?.full_name ?? "A friend"} invited you to StyleUp`,
    html: `<p>You've been invited to StyleUp. Sign up with code <strong>${code}</strong> and you'll both earn rewards.</p>
           <p><a href="${appUrl}/auth/signup?ref=${code}">Create your account →</a></p>`,
  });

  return NextResponse.json({ invited: true }, { status: 201 });
}
