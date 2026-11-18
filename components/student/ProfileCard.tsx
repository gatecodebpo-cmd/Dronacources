"use client";
import { LogOut, Pencil } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { useLang } from "@/components/providers/Providers";
import s from "./Dashboard.module.css";

type P = { name: string; email: string; phone: string; state: string };

export function ProfileCard({ user }: { user: P }) {
  const { t } = useLang();
  const toast = useToast();
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState(user);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/me/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Could not save your profile.");
    setEdit(false);
    toast("Profile updated");
    router.refresh();
  }

  return (
    <section className={s.panel} aria-labelledby="profile">
      <div className={s.panelHead}>
        <h2 id="profile">Profile</h2>
        {!edit && (
          <Button variant="ghost" size="sm" icon={<Pencil size={15} />} onClick={() => setEdit(true)}>
            Edit
          </Button>
        )}
      </div>
      {edit ? (
        <form onSubmit={save} className={s.profileForm}>
          <Input name="name" label="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
          <Input name="phone" label="Mobile" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <Input name="state" label="State" value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} hint="Used for your State rank." />
          {err && (
            <p className={s.err} role="alert">
              {err}
            </p>
          )}
          <div className={s.row}>
            <Button type="submit" loading={busy}>
              Save changes
            </Button>
            <Button type="button" variant="ghost" onClick={() => (setEdit(false), setF(user))}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className={s.profile}>
          <div className={s.row}>
            <Avatar name={user.name} size={56} ring />
            <div>
              <strong>{user.name}</strong>
              <p className={s.muted}>{user.email}</p>
            </div>
          </div>
          <dl className={s.dl}>
            <div>
              <dt>Mobile</dt>
              <dd>{user.phone || "Not added"}</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>{user.state || "Not added"}</dd>
            </div>
          </dl>
          <Button variant="outline" block icon={<LogOut size={16} />} onClick={() => signOut({ callbackUrl: "/" })}>
            {t("nav.logout")}
          </Button>
        </div>
      )}
    </section>
  );
}
