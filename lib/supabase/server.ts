// Cookie-based Supabase clients for the server (App Router). These read and
// refresh the auth session from the request cookies so server components, route
// handlers and middleware all see a consistent, authenticated user.
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Non-throwing env access with safe placeholders, so a server component or
// route never 500s purely because credentials aren't configured yet — auth
// simply resolves to "logged out" and data calls fail gracefully.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-key";

function url(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
}
function anonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;
}
function serviceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_KEY;
}

/**
 * Request-scoped client bound to the user's session cookies. Use in server
 * components and route handlers. RLS evaluates as the signed-in user.
 */
export async function supabaseServer(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(url(), anonKey(), {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(toSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component where cookies are read-only — the
            // middleware refreshes the session instead, so this is safe to ignore.
          }
        },
      },
    }
  );
}

/**
 * Privileged service-role client. Bypasses RLS — only for trusted server code
 * (webhooks, admin mutations, payouts). Never expose to the browser.
 */
export function supabaseAdmin(): SupabaseClient {
  return createClient(url(), serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface SessionUser {
  id: string;
  email: string;
  role: "client" | "stylist" | "admin";
  fullName: string | null;
  emailVerified: boolean;
}

/** Returns the authenticated user + profile, or null when not signed in. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email_verified")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    role: (profile?.role as SessionUser["role"]) ?? "client",
    fullName: (profile?.full_name as string) ?? null,
    emailVerified: Boolean(profile?.email_verified ?? user.email_confirmed_at),
  };
}
