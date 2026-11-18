"use client";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Misc";
import { Drawer } from "@/components/ui/Overlay";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { cx, fmtDate } from "@/lib/utils";
import { api } from "./api";
import { ResourceList } from "./ResourceList";
import s from "./admin.module.css";

const STAGES = [
  { id: "NEW", label: "New", tone: "warning" },
  { id: "CONTACTED", label: "Contacted", tone: "info" },
  { id: "CONVERTED", label: "Converted", tone: "success" },
  { id: "CLOSED", label: "Closed", tone: "neutral" },
] as const;

type Lead = { _id: string; name: string; phone?: string; email?: string; examInterest?: string; message?: string; sourcePage?: string; status: string; notes?: { text: string; by?: string; at?: string }[]; createdAt: string };

export function LeadsBoard() {
  const toast = useToast();
  const { data: session } = useSession();
  const params = useSearchParams();
  const [view, setView] = useState("board");
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [open, setOpen] = useState<string | null>(params.get("open"));
  const [over, setOver] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(() => api("/api/admin/leads?limit=100&sort=-createdAt").then((d) => setLeads(d.items)).catch((e) => toast(e.message, "error")), [toast]);
  useEffect(() => {
    load();
  }, [load]);

  async function patch(id: string, body: Partial<Lead>, msg: string) {
    const prev = leads;
    setLeads((l) => l!.map((x) => (x._id === id ? { ...x, ...body } : x))); // optimistic
    try {
      await api(`/api/admin/leads/${id}`, body, "PUT");
      toast(msg);
    } catch (e: any) {
      setLeads(prev);
      toast(e.message, "error");
    }
  }

  const lead = leads?.find((l) => l._id === open);

  return (
    <div>
      <Tabs variant="pill" value={view} onChange={setView} tabs={[{ id: "board", label: "Pipeline" }, { id: "table", label: "Table" }]} className={s.toolbar} />
      {view === "table" ? (
        <ResourceList resourceKey="leads" />
      ) : (
        <div className={s.board}>
          {STAGES.map((st) => {
            const items = leads?.filter((l) => l.status === st.id) ?? [];
            return (
              <section
                key={st.id}
                aria-label={`${st.label} leads`}
                className={cx(s.column, over === st.id && s.columnOver)}
                onDragOver={(e) => (e.preventDefault(), setOver(st.id))}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => {
                  setOver(null);
                  const id = e.dataTransfer.getData("text/plain");
                  const l = leads?.find((x) => x._id === id);
                  if (l && l.status !== st.id) patch(id, { status: st.id }, `${l.name} moved to ${st.label}`);
                }}
              >
                <div className={s.columnHead}>
                  <span>{st.label}</span>
                  <Badge tone={st.tone}>{leads ? items.length : "…"}</Badge>
                </div>
                {!leads
                  ? [0, 1].map((i) => <Skeleton key={i} h={96} r={12} />)
                  : items.map((l) => (
                      <button key={l._id} className={s.leadCard} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", l._id)} onClick={() => setOpen(l._id)} aria-label={`${l.name}, ${st.label}. Open details`}>
                        <strong>{l.name}</strong>
                        <span className={s.muted}>
                          {l.examInterest || "General enquiry"} · {fmtDate(l.createdAt)}
                        </span>
                        {l.message && <p>{l.message}</p>}
                        {!!l.notes?.length && <small className={s.muted}>{l.notes.length} note{l.notes.length > 1 ? "s" : ""}</small>}
                      </button>
                    ))}
                {leads && !items.length && <p className={s.muted} style={{ padding: 8 }}>Drag a lead here.</p>}
              </section>
            );
          })}
        </div>
      )}

      <Drawer open={!!lead} onClose={() => setOpen(null)} title={lead?.name ?? "Lead"}>
        {lead && (
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gap: 8 }}>
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className={buttonClass({ variant: "outline", size: "sm" })} style={{ justifyContent: "flex-start" }}>
                  <Phone size={15} /> {lead.phone}
                </a>
              )}
              {lead.email && (
                <a href={`mailto:${lead.email}`} className={buttonClass({ variant: "outline", size: "sm" })} style={{ justifyContent: "flex-start" }}>
                  <Mail size={15} /> {lead.email}
                </a>
              )}
              <p className={s.muted}>
                Interested in <strong>{lead.examInterest || "—"}</strong> · from {lead.sourcePage || "unknown page"} · {fmtDate(lead.createdAt)}
              </p>
              {lead.message && <p className={s.note}>{lead.message}</p>}
            </div>
            <div>
              <span className={s.label} id="stage-label">Stage</span>
              <div role="group" aria-labelledby="stage-label" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STAGES.map((st) => (
                  <Button key={st.id} size="sm" variant={lead.status === st.id ? "secondary" : "outline"} aria-pressed={lead.status === st.id} onClick={() => lead.status !== st.id && patch(lead._id, { status: st.id }, `Moved to ${st.label}`)}>
                    {st.label}
                  </Button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <span className={s.label}>Notes</span>
              {(lead.notes ?? []).map((n, i) => (
                <div key={i} className={s.note}>
                  {n.text}
                  <small>
                    {n.by || "Team"} {n.at && `· ${fmtDate(n.at)}`}
                  </small>
                </div>
              ))}
              <form
                style={{ display: "grid", gap: 8 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  const notes = [...(lead.notes ?? []), { text: note.trim(), by: session?.user?.name ?? "Team", at: new Date().toISOString() }];
                  patch(lead._id, { notes }, "Note added");
                  setNote("");
                }}
              >
                <Textarea aria-label="New note" placeholder="Called, shared AFCAT demo link…" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                <Button type="submit" size="sm" disabled={!note.trim()}>
                  Add note
                </Button>
              </form>
            </div>
            <Link href={`/admin/leads/${lead._id}`} className={s.crumb}>
              Edit all fields
            </Link>
          </div>
        )}
      </Drawer>
    </div>
  );
}
