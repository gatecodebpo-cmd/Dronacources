"use client";
import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";
import s from "./Overlay.module.css";

function useOverlay(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        // focus trap
        const f = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0]!, last = f[f.length - 1]!;
        if (e.shiftKey && document.activeElement === first) (last.focus(), e.preventDefault());
        else if (!e.shiftKey && document.activeElement === last) (first.focus(), e.preventDefault());
      }
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>("[data-autofocus],input,button")?.focus(), 50);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}

type Props = { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; size?: "sm" | "md" | "lg"; footer?: ReactNode; className?: string };

export function Modal({ open, onClose, title, children, size = "md", footer, className }: Props) {
  const ref = useOverlay(open, onClose);
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={s.wrap}>
          <m.div className={s.backdrop} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <m.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : undefined}
            className={cx(s.modal, s[size], className)}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 26, stiffness: 320 } }}
            exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.15 } }}
          >
            {title && (
              <header className={s.head}>
                <h2>{title}</h2>
                <button className={s.close} onClick={onClose} aria-label="Close dialog">
                  <X size={20} />
                </button>
              </header>
            )}
            <div className={s.body}>{children}</div>
            {footer && <footer className={s.foot}>{footer}</footer>}
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, children, side = "right", className }: Omit<Props, "size" | "footer"> & { side?: "right" | "left" | "bottom" }) {
  const ref = useOverlay(open, onClose);
  if (typeof document === "undefined") return null;
  const from = side === "bottom" ? { y: "100%" } : { x: side === "right" ? "100%" : "-100%" };
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={s.wrap}>
          <m.div className={s.backdrop} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <m.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === "string" ? title : "Panel"}
            className={cx(s.drawer, s[side], className)}
            initial={from}
            animate={{ x: 0, y: 0, transition: { type: "spring", damping: 30, stiffness: 300 } }}
            exit={{ ...from, transition: { duration: 0.22 } }}
          >
            {title && (
              <header className={s.head}>
                <h2>{title}</h2>
                <button className={s.close} onClick={onClose} aria-label="Close panel">
                  <X size={20} />
                </button>
              </header>
            )}
            <div className={s.drawerBody}>{children}</div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
