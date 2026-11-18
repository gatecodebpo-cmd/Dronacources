"use client";
import { ArrowDown, ArrowUp, Download, ExternalLink, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { useCallback, useEffect, useRef, useState } from "react";
import { Badge, DemoBadge, type Tone } from "@/components/ui/Badge";
import { Button, buttonClass } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { EmptyState, Skeleton } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Overlay";
import { Pagination, Table } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { getPath, setPath } from "@/lib/admin/paths";
import { RESOURCES, type Column, type Resource } from "@/lib/admin/resources";
import { cx, fmtDate, inr } from "@/lib/utils";
import { api, useOptions } from "./api";
import s from "./admin.module.css";

const TONES: Record<string, Tone> = {
  PAID: "success", PUBLISHED: "success", CONVERTED: "success", UNUSED: "success", ADMIN: "navy",
  PENDING: "warning", NEW: "warning", DRAFT: "warning", HARD: "danger", FAILED: "danger", REFUNDED: "info",
  CONTACTED: "info", REDEEMED: "neutral", CLOSED: "neutral", EASY: "success", MEDIUM: "gold", EDITOR: "info", SUPPORT: "olive",
  QUIZ: "gold", MOCK: "navy", BLOG: "navy", CURRENT_AFFAIRS: "gold", BUNDLE: "gold", VIDEO_COURSE: "info", ELIBRARY: "olive",
};
const human = (v: string) => v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export function refLabel(v: any) {
  return v && typeof v === "object" ? v.name ?? v.title ?? v.email ?? v.code ?? v.question ?? v.label ?? "—" : v;
}

function Cell({ col, row }: { col: Column; row: any }) {
  const v = getPath(row, col.key);
  if (v == null || v === "") return <span className={s.muted}>—</span>;
  switch (col.format) {
    case "bool":
      return v ? <Badge tone="success">Yes</Badge> : <Badge>No</Badge>;
    case "date":
      return <>{fmtDate(v)}</>;
    case "datetime":
      return <>{new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</>;
    case "money":
      return <>{inr(Number(v))}</>;
    case "pct":
      return <>{v}%</>;
    case "count":
      return <>{Array.isArray(v) ? v.length : 0}</>;
    case "badge":
      return <Badge tone={TONES[v] ?? "neutral"}>{human(String(v))}</Badge>;
    case "image":
      return <img src={v} alt="" className={s.thumb} loading="lazy" />;
    default:
      return <>{String(refLabel(v))}</>;
  }
}

function Filter({ r, name, value, onChange }: { r: Resource; name: string; value: string; onChange: (v: string) => void }) {
  const f = r.fields.find((x) => x.name === name)!;
  const refOpts = useOptions(f.type === "ref" ? f.ref : undefined);
  const opts =
    f.type === "boolean"
      ? [{ value: "true", label: "Yes" }, { value: "false", label: "No" }]
      : f.type === "ref"
        ? refOpts
        : (f.options ?? []).map((o) => (typeof o === "string" ? { value: o, label: human(o) } : o));
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={`Filter by ${f.label}`}>
      <option value="">{f.type === "boolean" ? `${f.label}: any` : `All ${f.label.toLowerCase()}`}</option>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ResourceList({ resourceKey, extraFilter, compact }: { resourceKey: string; extraFilter?: Record<string, string>; compact?: boolean }) {
  const r = RESOURCES[resourceKey]!;
  const toast = useToast();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState(r.sort);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: any[]; total: number; pages: number } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ef = JSON.stringify(extraFilter ?? {}); // stable dep even when the caller passes a fresh object

  useEffect(() => {
    const t = setTimeout(() => (setDebounced(q), setPage(1)), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = useCallback(
    (extra: Record<string, string> = {}) => {
      const p = new URLSearchParams({ q: debounced, sort, page: String(page), limit: compact ? "10" : "20", ...extra });
      Object.entries({ ...filters, ...(JSON.parse(ef) as Record<string, string>) }).forEach(([k, v]) => v && p.set(`f_${k}`, v));
      return p;
    },
    [debounced, sort, page, filters, ef, compact],
  );

  const load = useCallback(async () => {
    setData(null);
    try {
      setData(await api(`/api/admin/${r.key}?${params()}`));
      setSelected([]);
    } catch (e: any) {
      toast(e.message, "error");
      setData({ items: [], total: 0, pages: 1 });
    }
  }, [r.key, params, toast]);
  useEffect(() => {
    load();
  }, [load]);

  async function remove(ids: string[]) {
    setBusy(true);
    try {
      await api(`/api/admin/${r.key}/actions`, { action: "delete", ids });
      toast(ids.length > 1 ? `${ids.length} records deleted` : `${r.singular} deleted`);
      setConfirm(null);
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
    setBusy(false);
  }

  async function exportCsv() {
    try {
      const all = await api(`/api/admin/${r.key}?${params({ export: "1", page: "1" })}`);
      const rows = all.items.map((it: any) => r.csv!.map((p) => {
        const v = getPath(it, p);
        return v instanceof Object ? JSON.stringify(v) : v ?? "";
      }));
      const blob = new Blob([Papa.unparse({ fields: r.csv!, data: rows })], { type: "text/csv;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `drona-${r.key}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  function importCsv(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        const rows = res.data.map((row) => {
          const o = {};
          Object.entries(row).forEach(([k, v]) => setPath(o, k.trim(), v));
          return o;
        });
        try {
          const out = await api(`/api/admin/${r.key}/actions`, { action: "import", rows });
          toast(`Imported ${out.inserted} rows${out.failed ? `, ${out.failed} skipped` : ""}`, out.failed ? "info" : "success");
          if (out.errors?.length) console.warn("Import errors:\n" + out.errors.join("\n"));
          load();
        } catch (e: any) {
          toast(e.message, "error");
        }
      },
      error: () => toast("Could not read that CSV file.", "error"),
    });
  }

  const toggleSort = (key: string) => {
    setSort((cur) => (cur === key ? `-${key}` : key));
    setPage(1);
  };
  const ids = data?.items.map((i) => String(i._id)) ?? [];
  const allChecked = ids.length > 0 && ids.every((id) => selected.includes(id));
  const editable = !r.noEdit;

  return (
    <div>
      {!compact && (
        <div className={s.toolbar}>
          <Input icon={<Search size={17} />} value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${r.label.toLowerCase()}`} aria-label={`Search ${r.label}`} disabled={!r.searchFields.length} />
          {(r.filters ?? []).filter((f) => !extraFilter?.[f]).map((f) => (
            <Filter key={f} r={r} name={f} value={filters[f] ?? ""} onChange={(v) => (setFilters((x) => ({ ...x, [f]: v })), setPage(1))} />
          ))}
          <div className={s.headActions} style={{ marginLeft: "auto" }}>
            {r.importable && (
              <>
                <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => (e.target.files?.[0] && importCsv(e.target.files[0]), (e.target.value = ""))} />
                <Button variant="outline" size="sm" icon={<Upload size={15} />} onClick={() => fileRef.current?.click()}>
                  Import CSV
                </Button>
              </>
            )}
            {r.csv && (
              <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={exportCsv}>
                Export CSV
              </Button>
            )}
            {!r.noCreate && (
              <Link href={`/admin/${r.key}/new`} className={buttonClass({ size: "sm" })}>
                <Plus size={16} /> New {r.singular.toLowerCase()}
              </Link>
            )}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className={s.bulkBar} role="status">
          {selected.length} selected
          <Button variant="danger" size="sm" icon={<Trash2 size={15} />} onClick={() => setConfirm(selected)}>
            Delete selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}

      {data && !data.items.length ? (
        <EmptyState
          title={debounced || Object.values(filters).some(Boolean) ? "Nothing matches these filters" : `No ${r.label.toLowerCase()} yet`}
          text={r.noCreate ? "Records appear here as students use the site." : `Create the first ${r.singular.toLowerCase()} to see it here.`}
          action={!r.noCreate && !compact ? <Link href={`/admin/${r.key}/new`} className={buttonClass({ size: "sm" })}>New {r.singular.toLowerCase()}</Link> : undefined}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              {!compact && (
                <th className={s.checkCell}>
                  <input type="checkbox" aria-label="Select all on this page" checked={allChecked} onChange={() => setSelected(allChecked ? [] : ids)} />
                </th>
              )}
              {r.columns.map((c) => (
                <th key={c.key} aria-sort={sort === c.key ? "ascending" : sort === `-${c.key}` ? "descending" : undefined}>
                  {c.sortable && !compact ? (
                    <button className={s.sortBtn} onClick={() => toggleSort(c.key)}>
                      {c.label}
                      {sort === c.key ? <ArrowUp size={13} /> : sort === `-${c.key}` ? <ArrowDown size={13} /> : null}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {!data
              ? Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    {!compact && <td />}
                    {r.columns.map((c) => (
                      <td key={c.key}>
                        <Skeleton h={14} w={c.format === "image" ? 52 : "80%"} />
                      </td>
                    ))}
                    <td />
                  </tr>
                ))
              : data.items.map((row) => {
                  const id = String(row._id);
                  const firstText = r.columns.findIndex((c) => c.format !== "image");
                  return (
                    <tr key={id}>
                      {!compact && (
                        <td className={s.checkCell}>
                          <input type="checkbox" aria-label="Select row" checked={selected.includes(id)} onChange={() => setSelected((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]))} />
                        </td>
                      )}
                      {r.columns.map((c, i) => (
                        <td key={c.key}>
                          {i === firstText ? (
                            <span className={s.cellMain}>
                              {editable ? (
                                <Link href={`/admin/${r.key}/${id}`}>
                                  <Cell col={c} row={row} />
                                </Link>
                              ) : (
                                <Cell col={c} row={row} />
                              )}{" "}
                              {row.isDemo && <DemoBadge />}
                            </span>
                          ) : (
                            <Cell col={c} row={row} />
                          )}
                        </td>
                      ))}
                      <td>
                        <div className={s.rowActions}>
                          {r.key === "attempts" && (
                            <a href={`/result/${id}`} target="_blank" rel="noreferrer" className={s.iconAction} aria-label="Open result page">
                              <ExternalLink size={16} />
                            </a>
                          )}
                          {editable && (
                            <Link href={`/admin/${r.key}/${id}`} className={s.iconAction} aria-label={`Edit ${r.singular}`}>
                              <Pencil size={16} />
                            </Link>
                          )}
                          {r.key !== "settings" && (
                            <button className={cx(s.iconAction, s.iconDanger)} aria-label={`Delete ${r.singular}`} onClick={() => setConfirm([id])}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </Table>
      )}

      {data && data.total > 0 && (
        <div className={s.listFoot}>
          <span>
            {data.total} {data.total === 1 ? "record" : "records"}
          </span>
          <Pagination page={page} pages={data.pages} onPage={setPage} />
        </div>
      )}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm && confirm.length > 1 ? `Delete ${confirm.length} records?` : `Delete this ${r.singular.toLowerCase()}?`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={() => confirm && remove(confirm)}>
              Delete
            </Button>
          </>
        }
      >
        <p className={s.muted}>This can't be undone. The public site updates as soon as you delete.</p>
      </Modal>
    </div>
  );
}
