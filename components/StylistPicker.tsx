"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { STYLISTS } from "@/lib/data";

export default function StylistPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = value ? STYLISTS.find((s) => s.id === value) : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STYLISTS;
    return STYLISTS.filter((s) => `${s.name} ${s.city} ${s.country}`.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", marginTop: "0.75rem" }}>
      <button
        type="button"
        className="input"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", cursor: "pointer", textAlign: "left" }}
      >
        {selected ? (
          <span style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
            <span style={{ position: "relative", width: 30, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "var(--accent-soft)" }}>
              <Image src={selected.avatar} alt="" fill sizes="30px" style={{ objectFit: "cover" }} />
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selected.name} <span style={{ color: "var(--faint)" }}>· {selected.city}</span>
            </span>
          </span>
        ) : (
          <span style={{ color: "var(--faint)" }}>Select a stylist…</span>
        )}
        <span style={{ color: "var(--faint)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {open && (
        <div
          role="listbox"
          className="card"
          style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 40, padding: "0.5rem", maxHeight: 320, overflowY: "auto", boxShadow: "0 18px 44px rgba(29,26,21,0.16)" }}
        >
          <input
            className="input"
            autoFocus
            placeholder="Search stylists…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginBottom: "0.4rem", position: "sticky", top: 0 }}
          />
          {results.length === 0 ? (
            <p style={{ color: "var(--faint)", fontSize: "0.9rem", padding: "0.6rem 0.5rem" }}>No stylists match.</p>
          ) : (
            results.map((s) => {
              const active = s.id === value;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.7rem",
                    width: "100%",
                    textAlign: "left",
                    border: "none",
                    background: active ? "var(--accent-soft)" : "transparent",
                    borderRadius: 8,
                    padding: "0.5rem 0.6rem",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ position: "relative", width: 36, height: 44, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "var(--accent-soft)" }}>
                    <Image src={s.avatar} alt="" fill sizes="36px" style={{ objectFit: "cover" }} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 500, fontSize: "0.95rem" }}>{s.name}</span>
                    <span style={{ display: "block", color: "var(--faint)", fontSize: "0.8rem" }}>
                      {s.city}, {s.country} · from £{s.startingPrice}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
