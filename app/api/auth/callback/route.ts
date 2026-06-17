import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/auth/callback — exchange a Supabase OAuth/magic-link code for a
// session, then redirect into the app.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=missing_code`);
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${appUrl}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
    return NextResponse.redirect(`${appUrl}${next}`);
  } catch {
    return NextResponse.redirect(`${appUrl}/auth/login?error=auth_unconfigured`);
  }
}
