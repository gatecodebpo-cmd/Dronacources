"use client";
import { BookOpen } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/cards/Cards";
import { EmptyState } from "@/components/ui/Misc";
import { Tabs } from "@/components/ui/Tabs";
import type { ProductLite } from "@/lib/types";
import s from "./Content.module.css";

/** E-Library grouped by collection ("shelf"), as on the current site. */
export function ShelfBrowser({ products, shelves }: { products: ProductLite[]; shelves: string[] }) {
  const initial = useSearchParams().get("shelf");
  const [shelf, setShelf] = useState(initial && shelves.includes(initial) ? initial : "ALL");
  const list = shelf === "ALL" ? products : products.filter((p) => p.shelf === shelf);
  return (
    <div>
      <Tabs
        variant="pill"
        value={shelf}
        onChange={setShelf}
        className={s.filters}
        tabs={[{ id: "ALL", label: "All", count: products.length }, ...shelves.map((x) => ({ id: x, label: x, count: products.filter((p) => p.shelf === x).length }))]}
      />
      <div id={`panel-${shelf}`} role="tabpanel" aria-labelledby={`tab-${shelf}`} style={{ marginTop: "var(--sp-8)" }}>
        {list.length ? (
          <div className={s.grid3}>
            {list.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<BookOpen size={28} />} title={`${shelf} is coming soon`} text="New titles for this collection are being added to the E-Library." />
        )}
      </div>
    </div>
  );
}
