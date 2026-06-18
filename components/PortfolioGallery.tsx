"use client";

import { useEffect, useState } from "react";

export default function PortfolioGallery({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (images.length === 0) return null;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "0.6rem",
          marginTop: "1rem",
        }}
      >
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            aria-label={`View look ${i + 1}`}
            style={{
              border: "none",
              padding: 0,
              cursor: "zoom-in",
              borderRadius: 10,
              overflow: "hidden",
              aspectRatio: "4 / 5",
              background: "var(--accent-soft)",
            }}
          >
            <img
              src={src}
              alt={`${name} — look ${i + 1}`}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(20, 18, 14, 0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <button
            onClick={() => setOpen(null)}
            aria-label="Close"
            style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", color: "#fff", fontSize: "2rem", cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((i) => (i === null ? i : (i - 1 + images.length) % images.length));
            }}
            aria-label="Previous"
            style={{ position: "absolute", left: 16, background: "none", border: "none", color: "#fff", fontSize: "2.4rem", cursor: "pointer", opacity: 0.8 }}
          >
            ‹
          </button>
          <img
            src={images[open]}
            alt={`${name} — look ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "min(680px, 92vw)", maxHeight: "86vh", objectFit: "contain", borderRadius: 12, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((i) => (i === null ? i : (i + 1) % images.length));
            }}
            aria-label="Next"
            style={{ position: "absolute", right: 16, background: "none", border: "none", color: "#fff", fontSize: "2.4rem", cursor: "pointer", opacity: 0.8 }}
          >
            ›
          </button>
          <div style={{ position: "absolute", bottom: 22, color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
            {open + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
