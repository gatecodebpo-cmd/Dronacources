"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import s from "./Toast.module.css";

type Kind = "success" | "error" | "info";
type Item = { id: number; kind: Kind; text: string };
const Ctx = createContext<(text: string, kind?: Kind) => void>(() => {});

export const useToast = () => useContext(Ctx);

let seq = 0;
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const dismiss = (id: number) => setItems((l) => l.filter((i) => i.id !== id));
  const push = useCallback((text: string, kind: Kind = "success") => {
    const id = ++seq;
    setItems((l) => [...l.slice(-3), { id, kind, text }]);
    setTimeout(() => dismiss(id), 4500);
  }, []);
  const IconFor = { success: CheckCircle2, error: AlertTriangle, info: Info };

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className={s.region} role="status" aria-live="polite">
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const I = IconFor[t.kind];
            return (
              <motion.div
                key={t.id}
                layout
                className={`${s.toast} ${s[t.kind]}`}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
              >
                <I size={20} strokeWidth={1.75} aria-hidden />
                <p>{t.text}</p>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification" className={s.close}>
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
