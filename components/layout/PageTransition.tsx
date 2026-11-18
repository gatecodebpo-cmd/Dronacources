"use client";
import { usePathname } from "next/navigation";

/**
 * Replays a CSS fade/slide on each route change (keyed on pathname).
 * CSS rather than Framer so server-rendered content is visible before hydration (better LCP).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div key={path} className="page-in">
      {children}
    </div>
  );
}
