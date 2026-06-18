// Supabase client factories. Everything is lazily initialised so that a missing
// env var never throws at module-evaluation / build time — only when a client is
// actually requested at runtime.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

// We use an untyped client surface here. The hand-written Database types in
// database.types.ts document the schema for readers, but feeding them to the
// generic client triggers `never` inference in the query builder, so query
// results are treated as loosely typed and validated at the route boundary.
type DB = SupabaseClient;

// Safe placeholders. When env vars are absent (e.g. a preview deployed before
// secrets were configured) we still construct a client with valid-looking
// placeholders so the UI NEVER hard-crashes — network calls simply fail and are
// handled gracefully (logged-out browsing keeps working). Once real env vars are
// present at build/runtime, the real values are used.
const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

function supabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
}
function supabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;
}

/** Whether real Supabase credentials are configured. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Anonymous server-side client created on demand. Safe to call in route
 * handlers; respects RLS as the anon role.
 */
export function getSupabase(): DB {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let browserClient: DB | null = null;

/**
 * Singleton browser client. Uses the SSR browser client so the session is
 * stored in cookies — that lets middleware and server components read the same
 * authenticated session. Never throws, so the nav/UI can't crash on a missing
 * key; calls simply no-op until real credentials are configured.
 */
export function supabaseBrowser(): DB {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(supabaseUrl(), supabaseAnonKey());
  return browserClient;
}

/**
 * Privileged server client using the service-role key. Bypasses RLS — only use
 * in trusted server code (webhooks, admin routes) and never expose to the client.
 */
export function serverClient(): DB {
  return createClient(supabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client scoped to a specific user's access token. RLS policies evaluate as
 * that user, which is what we want for per-user API routes.
 */
export function userScopedClient(accessToken: string): DB {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Pulls the bearer token out of an incoming request's Authorization header. */
export function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}
