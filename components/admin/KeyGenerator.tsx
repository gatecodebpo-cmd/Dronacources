"use client";
import { Copy, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { RESOURCES } from "@/lib/admin/resources";
import { cx } from "@/lib/utils";
import { api } from "./api";
import { FieldInput } from "./Fields";
import s from "./admin.module.css";

/** Bulk-generate activation keys for a product or a set of tests. */
export function KeyGenerator({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const fields = RESOURCES.keys!.fields;
  const [count, setCount] = useState("10");
  const [prefix, setPrefix] = useState("DRONA");
  const [product, setProduct] = useState("");
  const [tests, setTests] = useState<string[]>([]);
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const out = await api("/api/admin/keys/actions", { action: "generate", count: Number(count), prefix, product: product || undefined, tests });
      setCodes(out.codes);
      toast(`${out.codes.length} keys generated`);
      onDone();
    } catch (err: any) {
      toast(err.message, "error");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={generate} className={cx(s.panel, s.panelPad)} style={{ display: "grid", gap: 16, marginBottom: 24 }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={18} /> Generate keys
      </h2>
      <div className={s.grid}>
        <Input label="How many" type="number" min={1} max={500} value={count} onChange={(e) => setCount(e.target.value)} />
        <Input label="Prefix" value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} hint="Codes look like DRONA-K7MP-3XQA" />
        <FieldInput field={fields.find((f) => f.name === "product")!} value={product} onChange={setProduct} />
        <div className={s.wide}>
          <FieldInput field={fields.find((f) => f.name === "tests")!} value={tests} onChange={setTests} />
        </div>
      </div>
      <div>
        <Button type="submit" loading={busy}>
          Generate {count || 0} keys
        </Button>
      </div>
      {codes.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <div className={s.toolbar} style={{ margin: 0 }}>
            <strong>New keys</strong>
            <Button type="button" variant="outline" size="sm" icon={<Copy size={15} />} onClick={() => navigator.clipboard.writeText(codes.join("\n")).then(() => toast("Copied to clipboard"))}>
              Copy all
            </Button>
          </div>
          <div className={s.codes}>
            {codes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
