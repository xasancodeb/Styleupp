"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        aria-label="Notifications"
        onClick={toggle}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", position: "relative", lineHeight: 1 }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -6,
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 9999,
              fontSize: "0.65rem",
              fontWeight: 700,
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="card"
          style={{ position: "absolute", right: 0, top: "2.2rem", width: 320, maxHeight: 400, overflowY: "auto", padding: "0.5rem", zIndex: 60 }}
        >
          <div style={{ padding: "0.5rem 0.75rem", fontWeight: 700, fontSize: "0.85rem", color: "var(--dim)" }}>
            Notifications
          </div>
          {items.length === 0 ? (
            <p style={{ padding: "1rem 0.75rem", color: "var(--faint)", fontSize: "0.9rem" }}>You're all caught up.</p>
          ) : (
            items.slice(0, 12).map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "0.6rem 0.75rem",
                  borderRadius: "0.5rem",
                  background: n.read_at ? "transparent" : "rgba(196,146,58,0.08)",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{n.title}</div>
                {n.body && <div style={{ color: "var(--dim)", fontSize: "0.82rem", marginTop: "0.15rem" }}>{n.body}</div>}
                <div style={{ color: "var(--faint)", fontSize: "0.72rem", marginTop: "0.2rem" }}>
                  {new Date(n.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
