"use client";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Pilcrow, Plus, Quote, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import type { Field } from "@/lib/admin/resources";
import { ICON_NAMES, Icon } from "@/lib/icons";
import { cx } from "@/lib/utils";
import { useOptions } from "./api";
import s from "./admin.module.css";

type P = { field: Field; value: any; onChange: (v: any) => void; error?: string };

const opt = (o: string | { value: string; label: string }) => (typeof o === "string" ? { value: o, label: o.replace(/_/g, " ") } : o);

function Wrap({ field, error, children, htmlFor }: { field: Field; error?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label className={s.label} htmlFor={htmlFor}>
        {field.label}
        {field.required && <span aria-hidden> *</span>}
      </label>
      {children}
      {error ? <p className={s.error} role="alert">{error}</p> : field.hint && <p className={s.hint}>{field.hint}</p>}
    </div>
  );
}

export function FieldInput({ field, value, onChange, error }: P) {
  const id = `f-${field.name}`;
  const label = (
    <>
      {field.label}
      {field.required && <span aria-hidden> *</span>}
    </>
  );
  switch (field.type) {
    case "textarea":
      return <Textarea id={id} label={label} hint={field.hint} error={error} value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={field.wide ? 5 : 3} />;
    case "number":
      return <Input id={id} type="number" step="any" label={label} hint={field.hint} error={error} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "password":
      return <Input id={id} type="password" autoComplete="new-password" label={label} hint={field.hint} error={error} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "date":
      return <Input id={id} type="date" label={label} hint={field.hint} error={error} value={value ? String(value).slice(0, 10) : ""} onChange={(e) => onChange(e.target.value)} />;
    case "datetime":
      return <Input id={id} type="datetime-local" label={label} hint={field.hint} error={error} value={toLocalInput(value)} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")} />;
    case "boolean":
      return (
        <div>
          <label className={s.switch}>
            <input type="checkbox" role="switch" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
            {field.label}
          </label>
          {field.hint && <p className={s.hint}>{field.hint}</p>}
        </div>
      );
    case "select":
      return (
        <Select id={id} label={label} hint={field.hint} error={error} value={value == null ? "" : String(value)} onChange={(e) => onChange(e.target.value)} placeholder={field.required ? "Choose…" : "None"} options={(field.options ?? []).map(opt)} />
      );
    case "ref":
      return <RefSelect field={field} value={value} onChange={onChange} error={error} />;
    case "refs":
      return <RefsPicker field={field} value={value} onChange={onChange} error={error} />;
    case "richtext":
      return (
        <Wrap field={field} error={error}>
          <RichText value={value ?? ""} onChange={onChange} label={field.label} />
        </Wrap>
      );
    case "image":
      return (
        <Wrap field={field} error={error}>
          <ImageField value={value ?? ""} onChange={onChange} label={field.label} />
        </Wrap>
      );
    case "strings":
      return (
        <Wrap field={field} error={error}>
          <StringsField value={value ?? []} onChange={onChange} label={field.label} />
        </Wrap>
      );
    case "objects":
      return (
        <Wrap field={field} error={error}>
          <ObjectsField field={field} value={value ?? []} onChange={onChange} />
        </Wrap>
      );
    case "colour":
      return (
        <Wrap field={field} error={error} htmlFor={id}>
          <div className={s.colour}>
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value ?? "") ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={`${field.label} picker`} />
            <Input id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="#0B1F3A" />
          </div>
        </Wrap>
      );
    case "icon":
      return (
        <Wrap field={field} error={error}>
          <div className={s.iconGrid} role="group" aria-label={field.label}>
            {ICON_NAMES.map((n) => (
              <button type="button" key={n} aria-pressed={value === n} title={n} aria-label={n} onClick={() => onChange(n)}>
                <Icon name={n} size={20} />
              </button>
            ))}
          </div>
        </Wrap>
      );
    case "options4":
      return null; // rendered by OptionsField (needs correctIndex too)
    default:
      return <Input id={id} label={label} hint={field.hint} error={error} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

function toLocalInput(v: any) {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/** Four answer inputs; the correct one (from correctIndex) is highlighted. */
export function OptionsField({ value, correct, onChange, error }: { value: string[]; correct: number; onChange: (v: string[]) => void; error?: string }) {
  const v = [0, 1, 2, 3].map((i) => value?.[i] ?? "");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <span className={s.label}>Options *</span>
      {v.map((o, i) => (
        <div key={i} className={s.optRow}>
          <span className={cx(s.optKey, Number(correct) === i && s.optCorrect)} aria-hidden>
            {"ABCD"[i]}
          </span>
          <Input aria-label={`Option ${"ABCD"[i]}`} value={o} onChange={(e) => onChange(v.map((x, j) => (j === i ? e.target.value : x)))} style={{ flex: 1 }} />
        </div>
      ))}
      {error && <p className={s.error}>{error}</p>}
    </div>
  );
}

function RefSelect({ field, value, onChange, error }: P) {
  const opts = useOptions(field.ref);
  return <Select id={`f-${field.name}`} label={<>{field.label}{field.required && <span aria-hidden> *</span>}</>} hint={field.hint} error={error} value={value ? String(value) : ""} onChange={(e) => onChange(e.target.value)} placeholder={field.required ? "Choose…" : "None"} options={opts} />;
}

function RefsPicker({ field, value, onChange, error }: P) {
  const opts = useOptions(field.ref);
  const [q, setQ] = useState("");
  const [onlySel, setOnlySel] = useState(false);
  const sel: string[] = (value ?? []).map(String);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return opts.filter((o) => (!onlySel || sel.includes(o.value)) && (!n || o.label.toLowerCase().includes(n))).slice(0, 300);
  }, [opts, q, onlySel, sel]);
  const toggle = (id: string) => onChange(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  return (
    <Wrap field={field} error={error}>
      <div className={s.picker}>
        <div className={s.pickerHead}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${field.label.toLowerCase()}`} aria-label={`Search ${field.label}`} />
          <span className={s.muted}>{sel.length} selected</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOnlySel((x) => !x)}>
            {onlySel ? "Show all" : "Show selected"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...new Set([...sel, ...shown.map((o) => o.value)])])}>
            Select shown
          </Button>
          {sel.length > 0 && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
              Clear
            </Button>
          )}
        </div>
        <div className={s.pickerList} role="group" aria-label={field.label}>
          {shown.map((o) => (
            <label key={o.value} className={s.pickerItem}>
              <input type="checkbox" checked={sel.includes(o.value)} onChange={() => toggle(o.value)} />
              <span>{o.label}</span>
            </label>
          ))}
          {!shown.length && <p className={s.muted} style={{ padding: 8 }}>{opts.length ? "No matches." : "Loading…"}</p>}
        </div>
      </div>
    </Wrap>
  );
}

function StringsField({ value, onChange, label }: { value: string[]; onChange: (v: string[]) => void; label: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (t) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div className={s.builder}>
      {value.map((v, i) => (
        <div key={i} className={s.builderInline}>
          <Input aria-label={`${label} ${i + 1}`} value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" className={s.iconAction} aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <X size={16} />
          </button>
        </div>
      ))}
      <div className={s.builderInline}>
        <Input aria-label={`Add to ${label}`} placeholder="Type and press Enter" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <Button type="button" variant="outline" size="sm" icon={<Plus size={15} />} onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}

function ObjectsField({ field, value, onChange }: { field: Field; value: any[]; onChange: (v: any[]) => void }) {
  const set = (i: number, k: string, v: any) => onChange(value.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  return (
    <div className={s.builder}>
      {value.map((row, i) => (
        <div key={i} className={s.builderRow}>
          <div>
            {field.of!.map((sf) => (
              <FieldInput key={sf.name} field={{ ...sf, name: `${field.name}.${i}.${sf.name}` }} value={row?.[sf.name]} onChange={(v) => set(i, sf.name, v)} />
            ))}
          </div>
          <button type="button" className={cx(s.iconAction, s.iconDanger)} aria-label={`Remove ${field.label} item ${i + 1}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <div>
        <Button type="button" variant="outline" size="sm" icon={<Plus size={15} />} onClick={() => onChange([...value, {}])}>
          Add {field.label.toLowerCase().replace(/s$/, "")}
        </Button>
      </div>
    </div>
  );
}

function ImageField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const toast = useToast();
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast("Images must be 2 MB or smaller.", "error");
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(data.error ?? "Upload failed.", "error");
    onChange(data.url);
    toast("Image uploaded");
  }
  return (
    <div
      className={cx(s.drop, over && s.dropActive)}
      onDragOver={(e) => (e.preventDefault(), setOver(true))}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        upload(e.dataTransfer.files[0]);
      }}
    >
      {value ? <img src={value} alt={`${label} preview`} className={s.dropPreview} /> : <span className={s.dropPreview}><ImagePlus size={22} /></span>}
      <div className={s.dropText}>
        <span className={s.muted}>{busy ? "Uploading…" : "Drop an image here, or"}</span>
        <div className={s.builderInline}>
          <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} loading={busy}>
            Choose file
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Remove
            </Button>
          )}
        </div>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL" aria-label={`${label} URL`} />
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => (upload(e.target.files?.[0]), (e.target.value = ""))} />
      </div>
    </div>
  );
}

/** Minimal rich-text editor: contentEditable + execCommand. Output is sanitised server-side. */
function RichText({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(null);
  useEffect(() => {
    // only push external value changes into the DOM, never echo our own edits (keeps the caret)
    if (ref.current && value !== last.current) {
      ref.current.innerHTML = value;
      last.current = value;
    }
  }, [value]);
  const emit = () => {
    last.current = ref.current!.innerHTML;
    onChange(last.current);
  };
  const cmd = (c: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(c, false, arg);
    emit();
  };
  const tools: [string, React.ReactNode, () => void][] = [
    ["Paragraph", <Pilcrow key="p" size={16} />, () => cmd("formatBlock", "<p>")],
    ["Heading 2", <Heading2 key="h2" size={16} />, () => cmd("formatBlock", "<h2>")],
    ["Heading 3", <Heading3 key="h3" size={16} />, () => cmd("formatBlock", "<h3>")],
    ["Bold", <Bold key="b" size={16} />, () => cmd("bold")],
    ["Italic", <Italic key="i" size={16} />, () => cmd("italic")],
    ["Bulleted list", <List key="ul" size={16} />, () => cmd("insertUnorderedList")],
    ["Numbered list", <ListOrdered key="ol" size={16} />, () => cmd("insertOrderedList")],
    ["Quote", <Quote key="q" size={16} />, () => cmd("formatBlock", "<blockquote>")],
    [
      "Link",
      <Link2 key="a" size={16} />,
      () => {
        const url = prompt("Link URL (https://…)");
        if (url && /^(https?:|mailto:|\/)/.test(url)) cmd("createLink", url);
      },
    ],
    ["Insert table", <span key="t">Table</span>, () => cmd("insertHTML", "<table><thead><tr><th>Section</th><th>Questions</th><th>Marks</th></tr></thead><tbody><tr><td></td><td></td><td></td></tr></tbody></table><p></p>")],
  ];
  return (
    <div className={s.rte}>
      <div className={s.rteBar} role="toolbar" aria-label={`${label} formatting`}>
        {tools.map(([t, icon, fn]) => (
          <button key={t} type="button" title={t} aria-label={t} onMouseDown={(e) => e.preventDefault()} onClick={fn}>
            {icon}
          </button>
        ))}
      </div>
      <div ref={ref} className={cx("prose", s.rteBody)} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label={label} onInput={emit} onBlur={emit} />
    </div>
  );
}
