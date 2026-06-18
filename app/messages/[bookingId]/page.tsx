"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Message {
  id: string;
  sender_id: string;
  body: string;
  visibility: string;
  created_at: string;
}

export default function ThreadPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockAt, setUnlockAt] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/messages/${bookingId}`);
    if (!res.ok) {
      setError((await res.json()).error ?? "Could not load conversation.");
      return;
    }
    const data = await res.json();
    setMessages(data.messages ?? []);
    setUnlocked(data.contactUnlocked);
    setUnlockAt(data.unlockAt);
  }, [bookingId]);

  useEffect(() => {
    void load();
    const timer = setInterval(load, 8000); // light polling
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, body }),
    });
    if (res.ok) {
      setBody("");
      // Remember which messages are mine for alignment.
      const data = await res.json();
      if (data.message?.sender_id) setMeId(data.message.sender_id);
      void load();
    } else {
      setError((await res.json()).error ?? "Could not send.");
    }
  }

  return (
    <div className="section" style={{ padding: "2rem 1.5rem 3rem", maxWidth: 680 }}>
      <Link href="/messages" style={{ color: "var(--accent-dark)", fontWeight: 600, fontSize: "0.9rem" }}>← All messages</Link>

      <div
        className="card"
        style={{
          marginTop: "1rem",
          padding: "1rem 1.25rem",
          background: unlocked ? "rgba(47,93,58,0.08)" : "rgba(196,146,58,0.08)",
          border: `1px solid ${unlocked ? "rgba(47,93,58,0.25)" : "rgba(196,146,58,0.25)"}`,
        }}
      >
        <strong>{unlocked ? "Contact details unlocked" : "Contact details are hidden"}</strong>
        <p style={{ color: "var(--dim)", fontSize: "0.88rem", marginTop: "0.2rem" }}>
          {unlocked
            ? "You can now share phone numbers and emails directly."
            : `For everyone's safety, phone numbers, emails and links are hidden until 24 hours before your session${unlockAt ? ` (${new Date(unlockAt).toLocaleString("en-GB")})` : ""}.`}
        </p>
      </div>

      <div className="card" style={{ marginTop: "1rem", padding: "1.25rem", minHeight: 320, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {messages.length === 0 ? (
          <p style={{ color: "var(--faint)", textAlign: "center", margin: "auto" }}>No messages yet. Say hello 👋</p>
        ) : (
          messages.map((m) => {
            const mine = meId ? m.sender_id === meId : false;
            return (
              <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%" }}>
                <div
                  style={{
                    background: mine ? "var(--dark)" : "#f1ede6",
                    color: mine ? "var(--bg)" : "var(--dark)",
                    padding: "0.6rem 0.9rem",
                    borderRadius: "0.9rem",
                    fontSize: "0.95rem",
                  }}
                >
                  {m.body}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--faint)", marginTop: "0.2rem", textAlign: mine ? "right" : "left" }}>
                  {new Date(m.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {error && <p style={{ color: "#b3261e", fontSize: "0.88rem", marginTop: "0.6rem" }}>{error}</p>}

      <form onSubmit={send} style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <input className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message…" />
        <button type="submit" className="btn btn-primary" disabled={!body.trim()}>Send</button>
      </form>
    </div>
  );
}
