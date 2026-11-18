import { Children, type CSSProperties, type ReactNode } from "react";

/*
 * Scroll reveals as CSS scroll-driven animations (animation-timeline: view(), see globals.css).
 * Zero JavaScript and no hydration cost; browsers without support simply show the content.
 * Framer Motion is kept for interactive motion (tabs, drawers, carousels, charts, player).
 */

export function Reveal({ children, delay = 0, className, as: C = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" }) {
  return (
    <C className={`reveal ${className ?? ""}`} style={{ "--i": Math.round(delay * 10) } as CSSProperties}>
      {children}
    </C>
  );
}

/** Grid whose direct children fade up in sequence as they enter the viewport. */
export function Stagger({ children, className, as: C = "div" }: { children: ReactNode; className?: string; gap?: number; as?: "div" | "ul" }) {
  const Item = C === "ul" ? "li" : "div";
  return (
    <C className={className}>
      {Children.map(children, (c, i) =>
        c ? (
          <Item className="reveal" style={{ "--i": i % 4, display: "flex", flexDirection: "column" } as CSSProperties}>
            {c}
          </Item>
        ) : null,
      )}
    </C>
  );
}
