"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { extrasOf, type Stylist } from "@/lib/data";
import { formatGBP } from "@/lib/stripe";

/**
 * The rail.
 *
 * A grid of cards is how every marketplace presents people. Choosing a
 * stylist is not that: it is closer to going down a rail of clothes, pulling
 * out whatever stops you. So discovery here is one long horizontal rail you
 * flick through, with the portrait doing the talking.
 *
 * It takes a flick, a drag, the arrow keys, a trackpad swipe or the buttons,
 * and snaps to whichever face you land on. The grid still exists on /explore,
 * where the job is comparing a filtered set rather than browsing by feel.
 */
export default function StylistRail({ stylists }: { stylists: Stylist[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);

  // Drag state. `moved` is what separates a flick from a click on a card.
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
    const card = el.firstElementChild as HTMLElement | null;
    if (card) {
      const step = card.offsetWidth + 20; // card plus the gap
      setActive(Math.round(el.scrollLeft / step));
    }
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  function step(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const by = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: by * direction, behavior: "smooth" });
  }

  // ── pointer drag ─────────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    // Let the browser keep native touch scrolling; this is for mouse and pen.
    if (e.pointerType === "touch") return;
    const el = trackRef.current;
    if (!el) return;
    drag.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
  }

  function onPointerMove(e: React.PointerEvent) {
    const el = trackRef.current;
    if (!el || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }

  function endDrag() {
    drag.current.down = false;
    // Clear on the next frame so the click handler below still sees `moved`.
    requestAnimationFrame(() => {
      drag.current.moved = false;
    });
  }

  // A drag that ends on a card must not count as opening that stylist.
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <div className="rail-wrap">
      <div
        ref={trackRef}
        className="stylist-rail"
        role="group"
        aria-label="Stylists, scroll sideways to browse"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        {stylists.map((stylist) => {
          const vibe = extrasOf(stylist).vibes[0];
          return (
            <Link key={stylist.id} href={`/stylist/${stylist.id}`} className="rail-card" draggable={false}>
              <div className="photo rail-card-photo">
                <Image
                  src={stylist.avatar}
                  alt={stylist.name}
                  fill
                  sizes="(max-width: 700px) 78vw, 320px"
                  draggable={false}
                  style={{ objectFit: "cover" }}
                />
                <div className="rail-card-scrim" />
                <div className="rail-card-copy">
                  <div className="rail-card-vibe">{vibe}</div>
                  <h3 className="rail-card-name">{stylist.name}</h3>
                  <div className="rail-card-meta">
                    {stylist.city} · from {formatGBP(stylist.startingPrice)}
                  </div>
                </div>
              </div>
              <p className="rail-card-line">{stylist.tagline}</p>
            </Link>
          );
        })}
        {/* A tail stop, so the last portrait can sit clear of the edge. */}
        <span aria-hidden className="rail-tail" />
      </div>

      <div className="rail-controls">
        <div className="rail-progress" aria-hidden>
          {stylists.map((s, i) => (
            <span key={s.id} data-on={i === active} />
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="rail-btn" onClick={() => step(-1)} disabled={atStart} aria-label="Previous stylists">
            ←
          </button>
          <button className="rail-btn" onClick={() => step(1)} disabled={atEnd} aria-label="More stylists">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
