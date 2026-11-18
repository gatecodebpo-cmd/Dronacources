import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthArt, AuthForm } from "@/components/student/AuthForm";
import { getUser } from "@/lib/auth";
import s from "@/components/student/Auth.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create a free account", description: "Sign up free and take your first full-length mock test on Drona." };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  if (await getUser()) redirect("/dashboard");
  return (
    <div className={s.shell}>
      <AuthArt />
      <div className={s.formSide}>
        <AuthForm mode="signup" callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
