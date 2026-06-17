// Shared enums and the Supabase schema typing used by server clients.

export type UserRole = "client" | "stylist" | "admin";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "refunded";
export type StylistStatus = "active" | "paused" | "suspended";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  color_season: string | null;
  created_at: string;
  updated_at: string;
}

export interface StylistRow {
  id: string;
  profile_id: string;
  display_name: string;
  tagline: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  specialties: string[];
  session_types: string[];
  starting_price: number;
  rating: number;
  sessions_completed: number;
  commission_tier: string;
  status: StylistStatus;
  created_at: string;
}

export interface StylistServiceRow {
  id: string;
  stylist_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  session_type: string;
  created_at: string;
}

export interface BookingRow {
  id: string;
  client_id: string;
  stylist_id: string;
  service_id: string | null;
  service_name: string;
  session_type: string;
  scheduled_for: string;
  amount: number;
  platform_fee: number;
  total: number;
  status: BookingStatus;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewRow {
  id: string;
  booking_id: string;
  client_id: string;
  stylist_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface StylistApplicationRow {
  id: string;
  full_name: string;
  email: string;
  city: string | null;
  country: string | null;
  years_experience: number | null;
  specialties: string[];
  portfolio_url: string | null;
  about: string | null;
  status: ApplicationStatus;
  created_at: string;
  reviewed_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow>; Update: Partial<ProfileRow> };
      stylists: { Row: StylistRow; Insert: Partial<StylistRow>; Update: Partial<StylistRow> };
      stylist_services: {
        Row: StylistServiceRow;
        Insert: Partial<StylistServiceRow>;
        Update: Partial<StylistServiceRow>;
      };
      bookings: { Row: BookingRow; Insert: Partial<BookingRow>; Update: Partial<BookingRow> };
      reviews: { Row: ReviewRow; Insert: Partial<ReviewRow>; Update: Partial<ReviewRow> };
      stylist_applications: {
        Row: StylistApplicationRow;
        Insert: Partial<StylistApplicationRow>;
        Update: Partial<StylistApplicationRow>;
      };
    };
  };
}
