// Notification fan-out: persists an in-app notification and (optionally) sends a
// transactional email. Always called from trusted server code with the
// service-role client so it can write regardless of the acting user.
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email";

interface NotifyInput {
  profileId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  email?: { to: string; subject: string; html: string };
}

export async function notify(admin: SupabaseClient, input: NotifyInput): Promise<void> {
  await admin.from("notifications").insert({
    profile_id: input.profileId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    data: input.data ?? {},
  });

  if (input.email) {
    await sendEmail(input.email);
  }
}
