"use client";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DemoBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { getPath, setPath } from "@/lib/admin/paths";
import { RESOURCES, type Field, type Resource } from "@/lib/admin/resources";
import { cx, slugify } from "@/lib/utils";
import { api } from "./api";
import { FieldInput, OptionsField } from "./Fields";
import { ResourceList } from "./ResourceList";
import s from "./admin.module.css";

function validate(r: Resource, v: any, isNew: boolean) {
  const errors: Record<string, string> = {};
  for (const f of r.fields) {
    const x = getPath(v, f.name);
    if (f.type === "password") {
      if (isNew && !x) errors[f.name] = "Set a password for the new account.";
      else if (x && String(x).length < 8) errors[f.name] = "Use at least 8 characters.";
      continue;
    }
    if (f.type === "options4") {
      if (!Array.isArray(x) || x.length < 4 || x.some((o: string) => !String(o ?? "").trim())) errors[f.name] = "Fill in all four options.";
      continue;
    }
    if (f.required && (x === undefined || x === null || String(x).trim() === "")) errors[f.name] = `${f.label} is required.`;
    if (f.type === "number" && x !== "" && x != null && !Number.isFinite(Number(x))) errors[f.name] = "Enter a number.";
    if (f.type === "colour" && x && !/^#[0-9a-f]{3,8}$/i.test(x)) errors[f.name] = "Use a hex colour like #F5A524.";
    if (f.type === "objects" && Array.isArray(x))
      x.forEach((row: any, i: number) => f.of!.forEach((sf) => sf.required && !String(row?.[sf.name] ?? "").trim() && (errors[f.name] = `Item ${i + 1}: ${sf.label} is required.`)));
  }
  return errors;
}

export function ResourceForm({ resourceKey, id }: { resourceKey: string; id?: string }) {
  const r = RESOURCES[resourceKey]!;
  const router = useRouter();
  const toast = useToast();
  const isNew = !id;
  const [values, setValues] = useState<any>(isNew ? structuredClone(r.defaults ?? {}) : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const slugTouched = useRef(!isNew);

  useEffect(() => {
    if (!id) return;
    api(`/api/admin/${r.key}/${id}`)
      .then((d) => setValues(d))
      .catch((e) => (toast(e.message, "error"), router.push(`/admin/${r.key}`)));
  }, [id, r.key, router, toast]);

  const sections = useMemo(() => {
    const m = new Map<string, Field[]>();
    r.fields.forEach((f) => {
      if (f.name === "correctIndex" && r.fields.some((x) => x.type === "options4")) return; // shown next to options
      const k = f.section ?? "Details";
      m.set(k, [...(m.get(k) ?? []), f]);
    });
    return [...m.entries()];
  }, [r]);

  const set = (name: string, v: any) => {
    setValues((cur: any) => {
      const next = setPath(structuredClone(cur), name, v);
      const src = r.fields.find((f) => f.name === "name" || f.name === "title");
      if (name === "slug") slugTouched.current = true;
      if (src && name === src.name && !slugTouched.current && r.fields.some((f) => f.name === "slug")) next.slug = slugify(String(v ?? ""));
      return next;
    });
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(r, values, isNew);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      toast("Fix the highlighted fields and save again.", "error");
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      if (isNew) {
        const out = await api(`/api/admin/${r.key}`, values);
        toast(`${r.singular} created`);
        router.push(`/admin/${r.key}/${out._id}`);
      } else {
        await api(`/api/admin/${r.key}/${id}`, values, "PUT");
        toast("Changes saved. The live site is updated.");
        router.refresh();
      }
    } catch (err: any) {
      toast(err.message, "error");
    }
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    try {
      await api(`/api/admin/${r.key}/${id}`, undefined, "DELETE");
      toast(`${r.singular} deleted`);
      router.push(`/admin/${r.key}`);
    } catch (err: any) {
      toast(err.message, "error");
      setBusy(false);
    }
  }

  const title = values ? getPath(values, r.labelField) : null;
  const aside = values && <Aside r={r} values={values} id={id} />;

  return (
    <div>
      <div className={s.pageHead}>
        <div>
          {r.key !== "settings" && (
            <Link href={`/admin/${r.key}`} className={s.crumb}>
              <ArrowLeft size={15} /> {r.label}
            </Link>
          )}
          <h1>
            {r.key === "settings" ? "Site settings" : isNew ? `New ${r.singular.toLowerCase()}` : String(title || r.singular).slice(0, 80)} {values?.isDemo && <DemoBadge />}
          </h1>
          {r.key === "settings" && <p>Brand, colours, contact details and defaults used across the public site. Changes go live on save.</p>}
        </div>
      </div>
      {!values ? (
        <div className={cx(s.panel, s.panelPad)} style={{ display: "grid", gap: 16 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} h={44} />
          ))}
        </div>
      ) : (
        <div className={cx(s.formLayout, aside && s.withAside)}>
          <form className={s.panel} onSubmit={save} noValidate>
            {sections.map(([name, fields]) => (
              <section key={name} className={s.section} aria-label={name}>
                {sections.length > 1 && <h2>{name}</h2>}
                <div className={s.grid}>
                  {fields.map((f) => (
                    <div key={f.name} className={cx((f.wide || ["richtext", "refs", "objects", "icon", "options4"].includes(f.type)) && s.wide)}>
                      {f.type === "options4" ? (
                        <div className={s.grid}>
                          <div className={s.wide}>
                            <OptionsField value={getPath(values, f.name) ?? []} correct={Number(values.correctIndex)} onChange={(v) => set(f.name, v)} error={errors[f.name]} />
                          </div>
                          <FieldInput field={r.fields.find((x) => x.name === "correctIndex")!} value={values.correctIndex} onChange={(v) => set("correctIndex", v)} error={errors.correctIndex} />
                        </div>
                      ) : (
                        <FieldInput field={f} value={getPath(values, f.name)} onChange={(v) => set(f.name, v)} error={errors[f.name]} />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <div className={s.stickyFoot}>
              {!isNew && r.key !== "settings" && (
                <Button type="button" variant="ghost" icon={<Trash2 size={16} />} onClick={() => setConfirm(true)} style={{ marginRight: "auto", color: "var(--color-danger)" }}>
                  Delete
                </Button>
              )}
              {r.key !== "settings" && (
                <Link href={`/admin/${r.key}`} className={s.crumb} style={{ margin: 0, padding: "0 12px", alignSelf: "center" }}>
                  Cancel
                </Link>
              )}
              <Button type="submit" loading={busy}>
                {isNew ? `Create ${r.singular.toLowerCase()}` : "Save changes"}
              </Button>
            </div>
          </form>
          {aside}
        </div>
      )}
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Delete this ${r.singular.toLowerCase()}?`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={remove}>
              Delete
            </Button>
          </>
        }
      >
        <p className={s.muted}>This can't be undone.</p>
      </Modal>
    </div>
  );
}

/** Context panel beside the form for modules that benefit from one. */
function Aside({ r, values, id }: { r: Resource; values: any; id?: string }) {
  if (r.key === "questions")
    return (
      <aside className={s.aside}>
        <div className={cx(s.panel, s.panelPad, s.qPreview)}>
          <h2>Preview</h2>
          <p style={{ fontWeight: 600 }}>{values.text || "Your question appears here."}</p>
          <ol>
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className={cx(Number(values.correctIndex) === i && s.qRight)}>
                <strong>{"ABCD"[i]}</strong> {values.options?.[i] || <span className={s.muted}>Option {"ABCD"[i]}</span>}
              </li>
            ))}
          </ol>
          {values.explanation && (
            <p className={s.muted}>
              <strong>Explanation:</strong> {values.explanation}
            </p>
          )}
        </div>
      </aside>
    );
  if (r.key === "settings") {
    const c = values.colours ?? {};
    const primary = c.primary || "#0B1F3A", light = c.primaryLight || "#16335C", accent = c.accent || "#F5A524", olive = c.olive || "#5B6B3A";
    return (
      <aside className={s.aside}>
        <div className={cx(s.panel, s.panelPad)} style={{ display: "grid", gap: 12 }}>
          <h2>Live preview</h2>
          <div className={s.swatches} aria-hidden>
            {[primary, light, accent, olive].map((x, i) => (
              <span key={i} style={{ background: x }} />
            ))}
          </div>
          <div className={s.miniSite}>
            <div className={s.miniHero} style={{ background: `linear-gradient(135deg, ${primary} 0%, ${light} 70%)` }}>
              <small style={{ color: accent, fontWeight: 600 }}>{values.tagline || "Tagline"}</small>
              <strong>{values.siteName || "Drona"}: Crack your dream exam</strong>
              <span style={{ opacity: 0.8 }}>{values.motto}</span>
              <span className={s.miniBtn} style={{ background: accent, color: "#1A1405" }}>
                Start Free Mock Test
              </span>
            </div>
            <div className={s.miniBody}>
              <span className={s.miniBtn} style={{ background: primary, color: "#fff" }}>Explore exams</span>
              <span className={s.miniBtn} style={{ background: `${olive}22`, color: olive }}>Defence</span>
            </div>
          </div>
          <p className={s.muted}>Colours apply to the whole public site after you save.</p>
        </div>
      </aside>
    );
  }
  if (r.key === "students" && id)
    return (
      <aside className={s.aside}>
        <div className={s.panel}>
          <div className={s.panelHead}>
            <h2>Recent attempts</h2>
          </div>
          <div className={s.flatTable}>
            <ResourceList resourceKey="attempts" extraFilter={{ user: id }} compact />
          </div>
        </div>
      </aside>
    );
  return null;
}
