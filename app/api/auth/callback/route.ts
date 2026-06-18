import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET /api/auth/callback — exchange a magic-link/OAuth/verification code for a
// cookie session, elevate admins by allow-list, then redirect into the app.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!code) return NextResponse.redirect(`${appUrl}/auth/login?error=missing_code`);

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=${encodeURIComponent(error.message)}`);
    }

    // Auto-grant admin to allow-listed emails on first sign-in.
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const email = data.user?.email?.toLowerCase();
    if (email && adminEmails.includes(email)) {
      await supabaseAdmin().from("profiles").update({ role: "admin" }).eq("id", data.user!.id);
    }

    return NextResponse.redirect(`${appUrl}${next}`);
  } catch {
    return NextResponse.redirect(`${appUrl}/auth/login?error=auth_unconfigured`);
  }
}
