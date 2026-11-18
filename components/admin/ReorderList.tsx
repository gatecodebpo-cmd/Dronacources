"use client";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { RESOURCES } from "@/lib/admin/resources";
import { api } from "./api";
import s from "./admin.module.css";

type Row = { _id: string; [k: string]: any };

/** Drag-to-reorder list for small ordered modules (hero slides, stats, FAQs). Order persists on Save. */
export function ReorderList({ resourceKey }: { resourceKey: string }) {
  const r = RESOURCES[resourceKey]!;
  const toast = useToast();
  const [items, setItems] = useState<Row[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/admin/${r.key}?limit=100&sort=order`).then((d) => setItems(d.items)).catch((e) => toast(e.message, "error"));
  }, [r.key, toast]);

  const move = (i: number, d: -1 | 1) => {
    const next = [...items!];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    setItems(next);
    setDirty(true);
  };

  async function save() {
    setBusy(true);
    try {
      await api(`/api/admin/${r.key}/actions`, { action: "reorder", ids: items!.map((i) => i._id) });
      toast("Order saved. The live site is updated.");
      setDirty(false);
    } catch (e: any) {
      toast(e.message, "error");
    }
    setBusy(false);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className={s.toolbar} style={{ justifyContent: "flex-end" }}>
        <span className={s.muted} style={{ marginRight: "auto" }}>
          Drag the handle or use the arrow buttons, then save.
        </span>
        <Button variant="outline" size="sm" disabled={!dirty} loading={busy} onClick={save}>
          Save order
        </Button>
        <Link href={`/admin/${r.key}/new`} className={buttonClass({ size: "sm" })}>
          <Plus size={16} /> New {r.singular.toLowerCase()}
        </Link>
      </div>
      {!items ? (
        [0, 1, 2].map((i) => <Skeleton key={i} h={64} r={12} />)
      ) : !items.length ? (
        <EmptyState title={`No ${r.label.toLowerCase()} yet`} action={<Link href={`/admin/${r.key}/new`} className={buttonClass({ size: "sm" })}>New {r.singular.toLowerCase()}</Link>} />
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={(v) => (setItems(v), setDirty(true))} className={s.reorder}>
          {items.map((it, i) => (
            <Item key={it._id} item={it} index={i} count={items.length} label={String(it[r.labelField] ?? "")} sub={r.columns[1] ? it[r.columns[1].key] : undefined} href={`/admin/${r.key}/${it._id}`} onMove={move} />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}

function Item({ item, index, count, label, sub, href, onMove }: { item: Row; index: number; count: number; label: string; sub?: any; href: string; onMove: (i: number, d: -1 | 1) => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} className={s.reorderItem} whileDrag={{ scale: 1.02, boxShadow: "var(--shadow-lg)" }}>
      <span className={s.grip} onPointerDown={(e) => controls.start(e)} aria-hidden>
        <GripVertical size={18} />
      </span>
      <div>
        <strong className={s.cellMain}>{label}</strong>
        {sub != null && typeof sub !== "object" && <span className={s.muted}>{String(sub)}</span>}
      </div>
      {item.isActive === false && <Badge>Hidden</Badge>}
      <button className={s.iconAction} onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move ${label} up`}>
        <ArrowUp size={16} />
      </button>
      <button className={s.iconAction} onClick={() => onMove(index, 1)} disabled={index === count - 1} aria-label={`Move ${label} down`}>
        <ArrowDown size={16} />
      </button>
      <Link href={href} className={s.iconAction} aria-label={`Edit ${label}`}>
        <Pencil size={16} />
      </Link>
    </Reorder.Item>
  );
}
