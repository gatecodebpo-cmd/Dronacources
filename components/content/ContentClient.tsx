"use client";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { CalendarDays, Clock, Link2, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PostCard } from "@/components/cards/Cards";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/Misc";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import type { PostLite } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import s from "./Content.module.css";

export function PostBrowser({ posts }: { posts: PostLite[] }) {
  const [type, setType] = useState("ALL");
  const [cat, setCat] = useState("ALL");
  const byType = posts.filter((p) => type === "ALL" || p.type === type);
  const cats = [...new Set(byType.map((p) => p.category).filter(Boolean))] as string[];
  const list = useMemo(() => byType.filter((p) => cat === "ALL" || p.category === cat), [byType, cat]);
  const [first, ...rest] = list;

  return (
    <div>
      <div className={s.filters}>
        <Tabs
          variant="pill"
          value={type}
          onChange={(v) => (setType(v), setCat("ALL"))}
          tabs={[
            { id: "ALL", label: "All", count: posts.length },
            { id: "CURRENT_AFFAIRS", label: "Current affairs", count: posts.filter((p) => p.type === "CURRENT_AFFAIRS").length },
            { id: "BLOG", label: "Guides & strategy", count: posts.filter((p) => p.type === "BLOG").length },
          ]}
        />
        {cats.length > 1 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }} role="group" aria-label="Filter by topic">
            {["ALL", ...cats].map((c) => (
              <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} style={{ minHeight: 40 }}>
                <Badge tone={cat === c ? "gold" : "neutral"}>{c === "ALL" ? "All topics" : c}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={type + cat} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {!first ? (
            <EmptyState title="No posts yet" text="New current affairs digests are published every week." />
          ) : (
            <>
              <Link href={`/blog/${first.slug}`} className={s.featured}>
                <div className={s.featuredMedia}>
                  {first.coverImage && <Image src={first.coverImage} alt="" fill sizes="(max-width: 900px) 100vw, 640px" unoptimized={first.coverImage.endsWith(".svg")} />}
                </div>
                <div className={s.featuredBody}>
                  <Badge tone={first.type === "CURRENT_AFFAIRS" ? "gold" : "navy"}>{first.category}</Badge>
                  <h2>{first.title}</h2>
                  {first.excerpt && <p style={{ color: "var(--color-muted)" }}>{first.excerpt}</p>}
                  <div className={s.meta}>
                    <span>
                      <CalendarDays size={15} /> {fmtDate(first.publishedAt)}
                    </span>
                    <span>
                      <Clock size={15} /> {first.readMinutes} min read
                    </span>
                  </div>
                </div>
              </Link>
              <div className={s.grid3}>
                {rest.map((p) => (
                  <PostCard key={p._id} post={p} />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return <motion.div className={s.progress} style={{ scaleX }} aria-hidden />;
}

export function ShareButtons({ title }: { title: string }) {
  const toast = useToast();
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const links = [
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${t}%20${u}`, icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.8-1.1-4.6-4-4.8-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 1.9 1.1 1 2 1.3 2.3 1.4.3.2.5.1.6 0l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.3Z"/></svg> },
    { label: "Share on Telegram", href: `https://t.me/share/url?url=${u}&text=${t}`, icon: <Send size={18} /> },
    { label: "Share on X", href: `https://x.com/intent/post?text=${t}&url=${u}`, icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg> },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l.5-4H14V8.6c0-.4.2-.6.6-.6Z"/></svg> },
  ];
  return (
    <div className={s.share}>
      <p>Share</p>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} className={s.shareBtn}>
          {l.icon}
        </a>
      ))}
      <button
        className={s.shareBtn}
        aria-label="Copy link"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            toast("Link copied");
          } catch {
            toast("Couldn't copy. Select the address bar instead.", "error");
          }
        }}
      >
        <Link2 size={18} />
      </button>
    </div>
  );
}
