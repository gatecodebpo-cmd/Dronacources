"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/utils";
import s from "./Carousel.module.css";

/**
 * Native scroll-snap carousel: touch swipe and trackpad for free, mouse drag added,
 * arrow buttons scroll by one page. Item width is set with --item (CSS length).
 */
export function Carousel({ children, label, itemWidth = "min(340px, 82vw)", className }: { children: ReactNode; label: string; itemWidth?: string; className?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(update, []);

  const page = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <div className={cx(s.root, className)} role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={track}
        className={s.track}
        style={{ ["--item" as string]: itemWidth }}
        onScroll={update}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !track.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 5) {
            d.moved = true;
            track.current.classList.add(s.dragging!);
          }
          track.current.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          track.current?.classList.remove(s.dragging!);
          setTimeout(() => (drag.current = null), 0);
        }}
        onPointerLeave={() => {
          track.current?.classList.remove(s.dragging!);
          drag.current = null;
        }}
        onClickCapture={(e) => {
          if (drag.current?.moved) e.preventDefault(); // don't follow a link after a drag
        }}
      >
        {Children.map(children, (c, i) => (
          <div className={s.slide} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${Children.count(children)}`}>
            {c}
          </div>
        ))}
      </div>
      <div className={s.controls}>
        <button onClick={() => page(-1)} disabled={edge.start} aria-label="Previous slides">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => page(1)} disabled={edge.end} aria-label="Next slides">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
