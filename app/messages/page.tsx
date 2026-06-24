"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStylist } from "@/lib/data";

interface Booking {
  id: string;
  stylist_id: string;
  service_name: string;
  scheduled_for: string;
  status: string;
}

export default function MessagesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/bookings");
      if (res.status === 401) return setAuthError(true);
      const data = await res.json();
      setBookings(data.bookings ?? []);
    })();
  }, []);

  if (authError) {
    return (
      <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 520, textAlign: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>Sign in to view messages</h1>
        <Link href="/auth/login?next=/messages" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem", maxWidth: 760 }}>
      <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700 }}>Messages</h1>
      <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
        Chat with your stylist about each booking. Contact details unlock 24 hours before your session.
      </p>
      {bookings.length === 0 ? (
        <div className="card" style={{ padding: "2.5rem", textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ color: "var(--dim)" }}>No conversations yet. Book a session to start chatting.</p>
          <Link href="/explore" className="btn btn-primary" style={{ marginTop: "1rem" }}>Find a stylist</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.5rem" }}>
          {bookings.map((b) => (
            <Link key={b.id} href={`/messages/${b.id}`} className="card" style={{ padding: "1.1rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{getStylist(b.stylist_id)?.name ?? b.stylist_id}</strong>
                <div style={{ color: "var(--dim)", fontSize: "0.88rem" }}>{b.service_name}</div>
              </div>
              <span style={{ color: "var(--accent-dark)", fontWeight: 600 }}>Open →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
