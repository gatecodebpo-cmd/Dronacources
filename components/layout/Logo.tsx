import Image from "next/image";
import Link from "next/link";
import s from "./Logo.module.css";

/** Drona's own badge logo (taken from the current dronacourses.com). */
export function LogoMark({ size = 36 }: { size?: number }) {
  return <Image src="/brand/drona-logo.png" alt="" width={size} height={Math.round(size * 1.1)} style={{ width: size, height: "auto" }} unoptimized />;
}

/** Badge + wordmark. A logo uploaded in Site Settings replaces the badge. */
export function Logo({ tagline, onDark, logo }: { tagline?: string; onDark?: boolean; logo?: string }) {
  return (
    <Link href="/" className={s.logo} data-dark={onDark || undefined}>
      {logo ? <img src={logo} alt="" width={44} height={44} className={s.mark} /> : <Image src="/brand/drona-logo.png" alt="" width={44} height={48} className={s.mark} priority unoptimized />}
      <span className={s.text}>
        <span className={s.name}>Drona</span>
        {tagline && <span className={s.tag}>{tagline}</span>}
      </span>
    </Link>
  );
}
