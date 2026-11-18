import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { buttonClass } from "@/components/ui/Button";
import s from "./not-found.module.css";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className={s.wrap}>
      <div className={s.top}>
        <Logo />
      </div>
      <div className={s.card}>
        <div className={s.scope} aria-hidden>
          <span className={s.ring} />
          <span className={s.ring2} />
          <span className={s.cross} />
          <span className={s.blip} />
          <Compass size={44} strokeWidth={1.5} className={s.compass} />
        </div>
        <p className={s.code}>404</p>
        <h1>Off the map</h1>
        <p className={s.text}>The page you were looking for has moved or never existed. Let's get you back on course.</p>
        <div className={s.actions}>
          <Link href="/" className={buttonClass({})}>
            <Home size={18} /> Back to home
          </Link>
          <Link href="/exams" className={buttonClass({ variant: "outline" })}>
            <Search size={18} /> Find your exam
          </Link>
        </div>
      </div>
    </main>
  );
}
