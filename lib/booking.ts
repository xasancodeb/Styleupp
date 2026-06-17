// Client-side booking store backed by localStorage so the demo behaves like a
// real product without requiring a logged-in Supabase session. Also exposes the
// availability + cancellation maths used by the booking flow and dashboard.

import { priceBreakdown } from "./stripe";

export type LocalBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  stylistId: string;
  stylistName: string;
  serviceId: string;
  serviceName: string;
  sessionType: string;
  scheduledFor: string; // ISO datetime
  durationMinutes: number;
  amount: number; // base
  fee: number;
  total: number;
  status: LocalBookingStatus;
  createdAt: string;
}

const KEY = "styleup.bookings";

function read(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Booking[]) : [];
  } catch {
    return [];
  }
}

function write(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(bookings));
}

export function getBookings(): Booking[] {
  return read().sort(
    (a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
  );
}

export interface NewBookingInput {
  stylistId: string;
  stylistName: string;
  serviceId: string;
  serviceName: string;
  sessionType: string;
  scheduledFor: string;
  durationMinutes: number;
  basePrice: number;
}

export function addBooking(input: NewBookingInput): Booking {
  const { base, fee, total } = priceBreakdown(input.basePrice);
  const booking: Booking = {
    id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    stylistId: input.stylistId,
    stylistName: input.stylistName,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    sessionType: input.sessionType,
    scheduledFor: input.scheduledFor,
    durationMinutes: input.durationMinutes,
    amount: base,
    fee,
    total,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  const all = read();
  all.push(booking);
  write(all);
  return booking;
}

export interface RefundOutcome {
  refundRate: number; // 0, 0.5 or 1
  refundAmount: number;
  policy: string;
}

/** Cancellation policy: >48h full refund, 24-48h 50%, <24h none. */
export function refundForBooking(booking: Booking, now: Date = new Date()): RefundOutcome {
  const hoursUntil = (new Date(booking.scheduledFor).getTime() - now.getTime()) / 36e5;
  if (hoursUntil >= 48) {
    return {
      refundRate: 1,
      refundAmount: round2(booking.total),
      policy: "Full refund (cancelled more than 48 hours before the session).",
    };
  }
  if (hoursUntil >= 24) {
    return {
      refundRate: 0.5,
      refundAmount: round2(booking.total * 0.5),
      policy: "50% refund (cancelled 24–48 hours before the session).",
    };
  }
  return {
    refundRate: 0,
    refundAmount: 0,
    policy: "No refund (cancelled less than 24 hours before the session).",
  };
}

export function cancelBooking(id: string): { booking: Booking; refund: RefundOutcome } | null {
  const all = read();
  const index = all.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const refund = refundForBooking(all[index]);
  all[index] = { ...all[index], status: "cancelled" };
  write(all);
  return { booking: all[index], refund };
}

export function getUpcoming(now: Date = new Date()): Booking[] {
  return getBookings().filter(
    (b) =>
      b.status !== "cancelled" &&
      b.status !== "completed" &&
      new Date(b.scheduledFor).getTime() >= now.getTime()
  );
}

export function getPast(now: Date = new Date()): Booking[] {
  return getBookings().filter(
    (b) =>
      b.status === "cancelled" ||
      b.status === "completed" ||
      new Date(b.scheduledFor).getTime() < now.getTime()
  );
}

// Working hours: 09:00–17:00 on the hour. Real availability would come from the
// stylist's calendar; here we generate a believable, stable set of slots.
const SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

export function availableSlots(dateISO: string): string[] {
  const date = new Date(dateISO);
  const day = date.getDay();
  // No Sunday sessions; Saturday is a shorter day.
  if (day === 0) return [];
  const hours = day === 6 ? SLOT_HOURS.filter((h) => h <= 13) : SLOT_HOURS;
  return hours.map((h) => `${String(h).padStart(2, "0")}:00`);
}

/** The next `count` bookable dates, skipping Sundays. */
export function nextAvailableDates(count = 14, from: Date = new Date()): string[] {
  const dates: string[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1); // start tomorrow
  while (dates.length < count) {
    if (cursor.getDay() !== 0) {
      dates.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
