// Centralised request validation using zod. Route handlers call `parseBody`
// and receive either typed data or a ready-made 400 response.
import { NextResponse } from "next/server";
import { z } from "zod";

export { z };

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

export async function parseBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { ok: false, response: NextResponse.json({ error: message || "Invalid request." }, { status: 400 }) };
  }
  return { ok: true, data: result.data };
}

// ─────────────────────────────── schemas ────────────────────────────────────
const isoDateTime = z.string().datetime({ offset: true }).or(z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date"));

export const createBookingSchema = z.object({
  stylistId: z.string().min(1).max(120),
  serviceId: z.string().min(1).max(120),
  scheduledFor: isoDateTime,
  notes: z.string().max(1000).optional(),
});

export const updateBookingSchema = z.object({
  action: z.enum(["cancel", "reschedule", "confirm", "complete"]),
  scheduledFor: isoDateTime.optional(),
  reason: z.string().max(500).optional(),
});

export const messageSchema = z.object({
  bookingId: z.string().uuid(),
  body: z.string().min(1, "Message can't be empty.").max(4000),
});

export const reviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const availabilitySchema = z.object({
  rules: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6).nullable().optional(),
        specificDate: z.string().nullable().optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        slotMinutes: z.number().int().min(15).max(240).default(60),
        isAvailable: z.boolean().default(true),
      })
    )
    .max(60),
});

export const stylistProfileSchema = z.object({
  displayName: z.string().min(2).max(120),
  tagline: z.string().max(200).optional(),
  bio: z.string().max(3000).optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  specialties: z.array(z.string().max(60)).max(20).optional(),
  sessionTypes: z.array(z.enum(["virtual", "in-person", "hybrid"])).max(3).optional(),
  languages: z.array(z.string().max(40)).max(20).optional(),
  startingPrice: z.number().min(0).max(100000).optional(),
  portfolioImages: z.array(z.string().url()).max(24).optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(15).max(480),
  price: z.number().min(0).max(100000),
  sessionType: z.enum(["virtual", "in-person", "hybrid"]),
});

export const applicationReviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const reviewModerationSchema = z.object({
  status: z.enum(["published", "hidden", "pending"]),
});

export const stylistApplicationSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  city: z.string().max(120).nullish(),
  country: z.string().max(120).nullish(),
  years_experience: z.number().int().min(0).max(80).nullish(),
  specialties: z.array(z.string().max(60)).max(20).default([]),
  portfolio_url: z.string().url().nullish().or(z.literal("")),
  about: z.string().max(3000).nullish(),
});

export const colorResultSchema = z.object({
  season: z.enum(["spring", "summer", "autumn", "winter"]),
  answers: z.record(z.string(), z.number()).default({}),
});

export const archetypeSchema = z.object({
  archetype: z.enum(["classic", "creative", "minimalist", "romantic", "edge"]),
});

export const savedStylistSchema = z.object({
  stylistSlug: z.string().min(1).max(120),
});

export const referralSchema = z.object({
  email: z.string().email(),
});
