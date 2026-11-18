import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthArt, AuthForm } from "@/components/student/AuthForm";
import { getUser } from "@/lib/auth";
import s from "@/components/student/Auth.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Log in", description: "Log in to Drona to continue your mock tests and see your All-India rank." };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const user = await getUser();
  if (user) redirect(user.role === "STUDENT" ? "/dashboard" : "/admin");
  return (
    <div className={s.shell}>
      <AuthArt />
      <div className={s.formSide}>
        <AuthForm mode="login" callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
