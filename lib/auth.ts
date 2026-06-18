// Authorization helpers for route handlers. They return a discriminated result
// so handlers can early-return a clean JSON error without throwing.
import { NextResponse } from "next/server";
import { getSessionUser, type SessionUser } from "@/lib/supabase/server";

export type AuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse };

function deny(status: number, error: string): { ok: false; response: NextResponse } {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

/** Require any authenticated user. */
export async function requireUser(): Promise<AuthResult> {
  const user = await getSessionUser();
  if (!user) return deny(401, "You must be signed in.");
  return { ok: true, user };
}

/** Require an authenticated user whose email is verified. */
export async function requireVerifiedUser(): Promise<AuthResult> {
  const result = await requireUser();
  if (!result.ok) return result;
  if (!result.user.emailVerified) return deny(403, "Please verify your email first.");
  return result;
}

/** Require a user with one of the given roles. */
export async function requireRole(...roles: SessionUser["role"][]): Promise<AuthResult> {
  const result = await requireUser();
  if (!result.ok) return result;
  if (!roles.includes(result.user.role)) return deny(403, "You don't have access to this resource.");
  return result;
}

export const requireAdmin = () => requireRole("admin");
export const requireStylist = () => requireRole("stylist", "admin");
