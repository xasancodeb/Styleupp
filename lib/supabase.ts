// Supabase client factories. Everything is lazily initialised so that a missing
// env var never throws at module-evaluation / build time — only when a client is
// actually requested at runtime.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// We use an untyped client surface here. The hand-written Database types in
// database.types.ts document the schema for readers, but feeding them to the
// generic client triggers `never` inference in the query builder, so query
// results are treated as loosely typed and validated at the route boundary.
type DB = SupabaseClient;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Add it to your .env.local (see .env.example).`
    );
  }
  return value;
}

/**
 * Anonymous server-side client created on demand. Safe to call in route
 * handlers; respects RLS as the anon role.
 */
export function getSupabase(): DB {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let browserClient: DB | null = null;

/**
 * Singleton browser client. Reuses a single instance across the app so auth
 * state and realtime subscriptions are shared.
 */
export function supabaseBrowser(): DB {
  if (browserClient) return browserClient;
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  browserClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}

/**
 * Privileged server client using the service-role key. Bypasses RLS — only use
 * in trusted server code (webhooks, admin routes) and never expose to the client.
 */
export function serverClient(): DB {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Client scoped to a specific user's access token. RLS policies evaluate as
 * that user, which is what we want for per-user API routes.
 */
export function userScopedClient(accessToken: string): DB {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, anonKey, {
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
