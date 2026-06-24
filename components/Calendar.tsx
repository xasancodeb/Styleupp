"use client";

import { useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Month calendar for picking a booking date. Navigates up to `monthsAhead`
 * months forward; past dates and Sundays (closed) are disabled.
 */
export default function Calendar({
  value,
  onChange,
  monthsAhead = 4,
}: {
  value: string | null;
  onChange: (dateISO: string) => void;
  monthsAhead?: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + monthsAhead, 1);

  const [view, setView] = useState(() => {
    if (value) {
      const d = new Date(`${value}T00:00:00`);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return firstThisMonth;
  });

  const canPrev = view > firstThisMonth;
  const canNext = view < maxMonth;

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset for the 1st of the month.
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div style={{ marginTop: "0.85rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <button
          type="button"
          onClick={() => canPrev && setView(new Date(year, month - 1, 1))}
          disabled={!canPrev}
          aria-label="Previous month"
          style={{ ...navBtn, opacity: canPrev ? 1 : 0.3, cursor: canPrev ? "pointer" : "default" }}
        >
          ‹
        </button>
        <strong className="font-serif" style={{ fontSize: "1.05rem", fontWeight: 600 }}>
          {MONTHS[month]} {year}
        </strong>
        <button
          type="button"
          onClick={() => canNext && setView(new Date(year, month + 1, 1))}
          disabled={!canNext}
          aria-label="Next month"
          style={{ ...navBtn, opacity: canNext ? 1 : 0.3, cursor: canNext ? "pointer" : "default" }}
        >
          ›
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.35rem" }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", paddingBottom: "0.25rem" }}>
            {w}
          </div>
        ))}

        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const ds = iso(d);
          const isPast = d < today;
          const isSunday = d.getDay() === 0; // closed
          const disabled = isPast || isSunday;
          const selected = value === ds;
          return (
            <button
              key={ds}
              type="button"
              disabled={disabled}
              onClick={() => onChange(ds)}
              aria-label={d.toDateString()}
              aria-pressed={selected}
              style={{
                aspectRatio: "1 / 1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                border: `1px solid ${selected ? "var(--ink)" : "transparent"}`,
                background: selected ? "var(--ink)" : "transparent",
                color: selected ? "var(--paper)" : disabled ? "var(--faint)" : "var(--ink)",
                fontSize: "0.92rem",
                fontWeight: selected ? 600 : 400,
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.35 : 1,
                transition: "background 0.15s ease, border-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!disabled && !selected) e.currentTarget.style.background = "var(--accent-soft)";
              }}
              onMouseLeave={(e) => {
                if (!disabled && !selected) e.currentTarget.style.background = "transparent";
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: "1.1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
