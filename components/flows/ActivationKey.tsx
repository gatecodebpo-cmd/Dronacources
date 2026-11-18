"use client";
import { m } from "framer-motion";
import { CheckCircle2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Overlay";
import { useToast } from "@/components/ui/Toast";
import { useLang } from "@/components/providers/Providers";

export function ActivationKeyButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  return (
    <>
      <button className={className ?? buttonClass({ variant: "ghost", size: "sm" })} onClick={() => setOpen(true)}>
        {children ?? (
          <>
            <KeyRound size={16} /> <span>{t("nav.activationKey")}</span>
          </>
        )}
      </button>
      <ActivationKeyModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function ActivationKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { message: string; href: string }>(null);

  const close = () => {
    onClose();
    setTimeout(() => (setDone(null), setCode(""), setError("")), 300);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{6,24}$/.test(clean)) return setError("Enter the code exactly as printed, e.g. DRONA-AF26-7K3P.");
    setBusy(true);
    setError("");
    const res = await fetch("/api/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: clean }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "That code could not be redeemed. Check it and try again.");
    setDone({ message: data.message, href: data.href ?? "/dashboard" });
    toast("Activation key redeemed");
    router.refresh();
  }

  return (
    <Modal open={open} onClose={close} title="Redeem an activation key" size="sm">
      {status === "unauthenticated" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <p style={{ color: "var(--color-muted)" }}>Log in first so we can add the unlocked tests to your account.</p>
          <Link href="/login?callbackUrl=/dashboard" className={buttonClass({ block: true })} onClick={close}>
            Log in to continue
          </Link>
        </div>
      ) : done ? (
        <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: "grid", gap: 16, justifyItems: "center", textAlign: "center" }}>
          <m.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }} style={{ color: "var(--color-success)" }}>
            <CheckCircle2 size={64} strokeWidth={1.5} />
          </m.span>
          <h3 style={{ fontSize: "var(--fs-lg)" }}>Unlocked</h3>
          <p style={{ color: "var(--color-muted)" }}>{done.message}</p>
          <Link href={done.href} className={buttonClass({ block: true })} onClick={close}>
            Go to my content
          </Link>
        </m.div>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
          <p style={{ color: "var(--color-muted)", fontSize: "var(--fs-sm)" }}>Activation keys come with printed books and partner offers. Each key works once.</p>
          <Input
            name="code"
            label="Activation key"
            placeholder="DRONA-XXXX-XXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={error}
            autoComplete="off"
            icon={<KeyRound size={18} />}
            style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            data-autofocus
          />
          <Button type="submit" loading={busy} block>
            Redeem key
          </Button>
        </form>
      )}
    </Modal>
  );
}
