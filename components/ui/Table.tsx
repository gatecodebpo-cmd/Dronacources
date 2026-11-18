import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import s from "./Table.module.css";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx(s.wrap, className)}>
      <table className={s.table}>{children}</table>
    </div>
  );
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav className={s.pager} aria-label="Pagination">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
        <ChevronLeft size={18} />
      </button>
      {nums.map((n, i) => (
        <span key={n} className={s.pageWrap}>
          {i > 0 && n - nums[i - 1]! > 1 && <span className={s.gap}>…</span>}
          <button onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined} className={cx(n === page && s.current)}>
            {n}
          </button>
        </span>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page >= pages} aria-label="Next page">
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
