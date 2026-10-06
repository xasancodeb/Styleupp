"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  CATEGORIES,
  OCCASIONS,
  categoryLabel,
  occasionLabel,
  type Category,
  type WardrobeItem,
  type Outfit,
} from "@/lib/wardrobe";

/**
 * The wardrobe: photograph what you own, and get outfits built from it.
 *
 * Photos are resized in the browser before upload. A phone camera file is
 * 3-5MB and nothing here needs that: 768px on the long edge is plenty for
 * Claude to read a garment, and it keeps the request small enough to feel
 * instant on mobile data.
 */
const MAX_EDGE = 768;

async function toResizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [building, setBuilding] = useState(false);
  const [occasion, setOccasion] = useState<string>(OCCASIONS[0].key);
  const [notes, setNotes] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast, confirm } = useToast();

  const load = useCallback(async () => {
    try {
      const [i, o] = await Promise.all([fetch("/api/wardrobe"), fetch("/api/wardrobe/outfits")]);
      if (i.status === 401) {
        setSignedOut(true);
        return;
      }
      setItems((await i.json()).items ?? []);
      if (o.ok) setOutfits((await o.json()).outfits ?? []);
    } catch {
      toast("Could not load your wardrobe.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 10);
    setUploading(list.length);

    // Sequential: each upload is a vision call, and firing ten at once just
    // trades a progress count for a rate limit.
    for (const file of list) {
      try {
        const image = await toResizedDataUrl(file);
        const res = await fetch("/api/wardrobe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast(data.error ?? "Could not add that piece.", "error");
        } else {
          setItems((prev) => [data.item, ...prev]);
        }
      } catch {
        toast(`Could not read ${file.name}.`, "error");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  async function remove(item: WardrobeItem) {
    if (!(await confirm(`Remove ${item.name} from your wardrobe?`))) return;
    const res = await fetch(`/api/wardrobe?id=${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Could not remove that piece.", "error");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  async function build() {
    setBuilding(true);
    try {
      const res = await fetch("/api/wardrobe/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not build outfits.", "error");
        return;
      }
      setOutfits((prev) => [...data.outfits, ...prev]);
      toast(`${data.outfits.length} new look${data.outfits.length === 1 ? "" : "s"} ready.`, "success");
    } catch {
      toast("Could not build outfits.", "error");
    } finally {
      setBuilding(false);
    }
  }

  async function discard(outfit: Outfit) {
    const res = await fetch(`/api/wardrobe/outfits?id=${outfit.id}`, { method: "DELETE" });
    if (res.ok) setOutfits((prev) => prev.filter((o) => o.id !== outfit.id));
  }

  const byId = new Map(items.map((i) => [i.id, i]));

  if (signedOut) {
    return (
      <div className="section" style={{ padding: "5rem 1.75rem", maxWidth: 520, textAlign: "center" }}>
        <span className="eyebrow" style={{ justifyContent: "center" }}>Your wardrobe</span>
        <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 2.8rem)", letterSpacing: "-0.04em", marginTop: "1rem" }}>
          Sign in to open your wardrobe
        </h1>
        <p style={{ color: "var(--dim)", marginTop: "0.8rem" }}>
          Your clothes stay private to you. Your stylist sees them only when you book a session.
        </p>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "1.75rem", flexWrap: "wrap" }}>
          <Link href="/auth/login" className="btn btn-primary">Sign in</Link>
          <Link href="/auth/signup" className="btn btn-outline">Create an account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ padding: "3rem 1.75rem 4rem" }}>
      <span className="eyebrow">Your wardrobe</span>
      <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2.3rem, 6vw, 3.6rem)", letterSpacing: "-0.045em", lineHeight: 1.04, marginTop: "0.9rem" }}>
        Outfits from clothes<br />you already own.
      </h1>
      <p className="lede" style={{ marginTop: "1.1rem" }}>
        Photograph what is in your wardrobe. We read each piece, remember its colour and cut,
        and build looks that work for your colouring. Nothing to buy.
      </p>

      {/* add pieces */}
      <div className="card" style={{ padding: "1.5rem", marginTop: "1.9rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.25rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>Add pieces</div>
          <p style={{ color: "var(--dim)", fontSize: "0.92rem", marginTop: "0.3rem", maxWidth: "52ch" }}>
            One garment per photo, laid flat or on a hanger. Up to ten at a time.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          {uploading > 0 && (
            <span style={{ color: "var(--dim)", fontSize: "0.9rem" }}>
              Reading {uploading} photo{uploading === 1 ? "" : "s"}…
            </span>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => void addFiles(e.target.files)}
            style={{ display: "none" }}
            id="wardrobe-upload"
          />
          <label htmlFor="wardrobe-upload" className="btn btn-primary" style={{ cursor: "pointer" }}>
            Add photos
          </label>
        </div>
      </div>

      {/* the outfit builder, only once there is enough to work with */}
      {items.length >= 3 && (
        <div className="card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
          <div style={{ fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
            Build me an outfit
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.9rem" }}>
            {OCCASIONS.map((o) => (
              <button key={o.key} className="tag-toggle" data-active={occasion === o.key} onClick={() => setOccasion(o.key)}>
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.7rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <input
              className="input"
              style={{ flex: "1 1 260px" }}
              placeholder="Anything else? e.g. it'll be cold, or no heels"
              value={notes}
              maxLength={300}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button onClick={build} disabled={building} className="btn btn-primary" style={{ opacity: building ? 0.6 : 1 }}>
              {building ? "Styling…" : "Build outfits"} <span className="arrow">→</span>
            </button>
          </div>
        </div>
      )}

      {/* outfits */}
      {outfits.length > 0 && (
        <section style={{ marginTop: "2.75rem" }}>
          <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(1.5rem, 3.5vw, 2rem)", letterSpacing: "-0.03em" }}>
            Your looks
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem", marginTop: "1.25rem" }}>
            {outfits.map((outfit) => {
              const pieces = outfit.itemIds.map((id) => byId.get(id)).filter(Boolean) as WardrobeItem[];
              // An outfit whose pieces have since been deleted is not worth a card.
              if (pieces.length === 0) return null;
              return (
                <article key={outfit.id} className="card outfit-card" style={{ padding: "1.4rem", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.8rem" }}>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>{outfit.title}</h3>
                      <div style={{ color: "var(--faint)", fontSize: "0.82rem", marginTop: "0.15rem" }}>
                        {occasionLabel(outfit.occasion)}
                      </div>
                    </div>
                    <button
                      onClick={() => void discard(outfit)}
                      aria-label={`Discard ${outfit.title}`}
                      style={{ background: "none", border: "none", color: "var(--faint)", cursor: "pointer", fontSize: "1.1rem", lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>

                  <div className="flatlay" style={{ marginTop: "0.9rem" }}>
                    {pieces.map((p) => (
                      <span key={p.id} className="photo" style={{ display: "block", position: "relative" }} title={p.name}>
                        <Image src={p.imageUrl} alt={p.name} fill sizes="64px" style={{ objectFit: "cover" }} />
                      </span>
                    ))}
                  </div>

                  {outfit.rationale && (
                    <p style={{ color: "var(--dim)", fontSize: "0.93rem", lineHeight: 1.6, marginTop: "0.9rem" }}>
                      {outfit.rationale}
                    </p>
                  )}
                  {outfit.missingPiece && (
                    <div style={{ marginTop: "auto", paddingTop: "0.9rem", fontSize: "0.88rem", color: "var(--accent)", fontWeight: 500 }}>
                      Worth adding: {outfit.missingPiece}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* the wardrobe itself */}
      <section style={{ marginTop: "2.75rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(1.5rem, 3.5vw, 2rem)", letterSpacing: "-0.03em" }}>
            Everything you own
          </h2>
          <span style={{ color: "var(--faint)", fontSize: "0.9rem" }}>
            {items.length} piece{items.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <p style={{ color: "var(--dim)", marginTop: "1.25rem" }}>Opening your wardrobe…</p>
        ) : items.length === 0 ? (
          <div className="card" style={{ padding: "3rem 2rem", marginTop: "1.25rem", textAlign: "center" }}>
            <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>Your wardrobe is empty.</p>
            <p style={{ color: "var(--dim)", marginTop: "0.5rem", maxWidth: "46ch", marginLeft: "auto", marginRight: "auto" }}>
              Start with the five things you wear most. That is usually enough for us to
              find combinations you have never tried.
            </p>
            <label htmlFor="wardrobe-upload" className="btn btn-primary" style={{ cursor: "pointer", marginTop: "1.4rem" }}>
              Add your first piece
            </label>
          </div>
        ) : (
          CATEGORIES.map((category: Category) => {
            const group = items.filter((i) => i.category === category);
            if (group.length === 0) return null;
            return (
              <div key={category} style={{ marginTop: "1.75rem" }}>
                <h3 style={{ fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--faint)" }}>
                  {categoryLabel(category)}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem", marginTop: "0.8rem" }}>
                  {group.map((item) => (
                    <figure key={item.id} style={{ margin: 0 }}>
                      <div className="photo" style={{ aspectRatio: "4 / 5", position: "relative" }}>
                        <Image src={item.imageUrl} alt={item.name} fill sizes="180px" style={{ objectFit: "cover" }} />
                        <button
                          onClick={() => void remove(item)}
                          aria-label={`Remove ${item.name}`}
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            border: "none",
                            background: "rgba(255,255,255,0.92)",
                            color: "var(--ink)",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <figcaption style={{ marginTop: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          {item.colorHex && (
                            <span aria-hidden style={{ width: 11, height: 11, borderRadius: "50%", background: item.colorHex, border: "1px solid var(--border)", flexShrink: 0 }} />
                          )}
                          <span style={{ fontSize: "0.88rem", fontWeight: 500, lineHeight: 1.3 }}>{item.name}</span>
                        </div>
                        {item.formality && (
                          <div style={{ color: "var(--faint)", fontSize: "0.78rem", marginTop: "0.2rem" }}>{item.formality}</div>
                        )}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
