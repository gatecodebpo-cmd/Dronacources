"use client";
import {
  Award, Bell, BookOpen, Boxes, ChevronsLeft, ClipboardList, ExternalLink, FileText, FolderTree, GraduationCap, HelpCircle, Image as ImageIcon,
  Inbox, KeyRound, LayoutDashboard, LogOut, Megaphone, Menu, MessageSquareQuote, Newspaper, Receipt, Search, Settings, ShieldCheck,
  ShoppingBag, Ticket, TrendingUp, UserCog, Users, Zap, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Misc";
import { Drawer } from "@/components/ui/Overlay";
import { LogoMark } from "@/components/layout/Logo";
import { cx, fmtDate } from "@/lib/utils";
import s from "./Shell.module.css";

export const NAV_ICONS: Record<string, LucideIcon> = {
  categories: FolderTree, groups: Boxes, exams: GraduationCap, tests: ClipboardList, quizzes: Zap, questions: HelpCircle,
  products: ShoppingBag, coupons: Ticket, keys: KeyRound, orders: Receipt, students: Users, attempts: TrendingUp, leads: Inbox,
  users: UserCog, hero: ImageIcon, stats: Award, testimonials: MessageSquareQuote, toppers: ShieldCheck, faculty: BookOpen,
  blog: Newspaper, faqs: HelpCircle, announcements: Megaphone, pages: FileText, settings: Settings,
};

export type NavItem = { key: string; label: string; group: string };
type Lead = { _id: string; name: string; examInterest?: string; createdAt: string };

export function AdminShell({ user, nav, leads, newLeadCount, children }: { user: { name: string; email: string; role: string }; nav: NavItem[]; leads: Lead[]; newLeadCount: number; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const pathname = usePathname();
  useEffect(() => setMobile(false), [pathname]);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("drona-admin-collapsed") === "1");
    } catch {}
  }, []);
  const toggleCollapse = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("drona-admin-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  return (
    <div className={cx(s.shell, collapsed && s.collapsed)}>
      <aside className={s.sidebar} aria-label="Admin navigation">
        <SideNav nav={nav} collapsed={collapsed} />
        <button className={s.collapseBtn} onClick={toggleCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-pressed={collapsed}>
          <ChevronsLeft size={18} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>
      <Drawer open={mobile} onClose={() => setMobile(false)} side="left" title="Drona admin" className={s.mobileDrawer}>
        <SideNav nav={nav} collapsed={false} />
      </Drawer>
      <div className={s.main}>
        <TopBar user={user} nav={nav} leads={leads} newLeadCount={newLeadCount} onMenu={() => setMobile(true)} />
        <main className={s.content} id="main">
          {children}
        </main>
      </div>
    </div>
  );
}

function SideNav({ nav, collapsed }: { nav: NavItem[]; collapsed: boolean }) {
  const pathname = usePathname();
  const groups = [...new Set(nav.map((n) => n.group))];
  const link = (href: string, label: string, Icon: LucideIcon, active: boolean) => (
    <Link href={href} className={cx(s.navLink, active && s.navActive)} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined}>
      <Icon size={19} strokeWidth={1.75} aria-hidden />
      <span className={s.navLabel}>{label}</span>
    </Link>
  );
  return (
    <nav className={s.nav}>
      <Link href="/admin" className={s.brand}>
        <LogoMark size={32} />
        <span className={s.navLabel}>
          <strong>Drona</strong>
          <small>Admin</small>
        </span>
      </Link>
      {link("/admin", "Dashboard", LayoutDashboard, pathname === "/admin")}
      {groups.map((g) => (
        <div key={g} className={s.navGroup}>
          <p className={s.groupLabel}>{g}</p>
          {nav
            .filter((n) => n.group === g)
            .map((n) => (
              <span key={n.key}>{link(`/admin/${n.key}`, n.label, NAV_ICONS[n.key] ?? FileText, pathname.startsWith(`/admin/${n.key}`))}</span>
            ))}
        </div>
      ))}
    </nav>
  );
}

function TopBar({ user, nav, leads, newLeadCount, onMenu }: { user: { name: string; email: string; role: string }; nav: NavItem[]; leads: Lead[]; newLeadCount: number; onMenu: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<null | "bell" | "profile">(null);
  const ref = useRef<HTMLDivElement>(null);
  const hits = useMemo(() => (q.trim() ? nav.filter((n) => n.label.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : []), [q, nav]);

  useEffect(() => {
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setMenu(null);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => (document.removeEventListener("mousedown", close), document.removeEventListener("keydown", esc));
  }, []);

  return (
    <header className={s.topbar} ref={ref}>
      <button className={cx(s.iconBtn, s.menuBtn)} onClick={onMenu} aria-label="Open navigation">
        <Menu size={20} />
      </button>
      <form
        role="search"
        className={s.search}
        onSubmit={(e) => {
          e.preventDefault();
          if (hits[0]) (router.push(`/admin/${hits[0].key}`), setQ(""));
        }}
      >
        <Search size={17} aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to a module… (e.g. leads, exams)" aria-label="Search admin modules" />
        {hits.length > 0 && (
          <ul className={s.searchList} role="listbox">
            {hits.map((h) => {
              const I = NAV_ICONS[h.key] ?? FileText;
              return (
                <li key={h.key}>
                  <Link href={`/admin/${h.key}`} onClick={() => setQ("")}>
                    <I size={16} /> {h.label} <small>{h.group}</small>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </form>
      <div className={s.topActions}>
        <Link href="/" target="_blank" className={s.iconBtn} aria-label="Open public site in a new tab" title="View site">
          <ExternalLink size={19} />
        </Link>
        <div className={s.pop}>
          <button className={s.iconBtn} aria-label={`Notifications: ${newLeadCount} new leads`} aria-expanded={menu === "bell"} onClick={() => setMenu(menu === "bell" ? null : "bell")}>
            <Bell size={19} />
            {newLeadCount > 0 && <span className={s.dot}>{newLeadCount > 9 ? "9+" : newLeadCount}</span>}
          </button>
          {menu === "bell" && (
            <div className={s.menu} role="menu">
              <p className={s.menuHead}>New leads</p>
              {leads.length ? (
                leads.map((l) => (
                  <Link key={l._id} href={`/admin/leads?open=${l._id}`} className={s.menuItem} onClick={() => setMenu(null)} role="menuitem">
                    <strong>{l.name}</strong>
                    <small>
                      {l.examInterest || "General enquiry"} · {fmtDate(l.createdAt)}
                    </small>
                  </Link>
                ))
              ) : (
                <p className={s.menuEmpty}>No new leads. You're all caught up.</p>
              )}
              {nav.some((n) => n.key === "leads") && (
                <Link href="/admin/leads" className={s.menuFoot} onClick={() => setMenu(null)}>
                  Open the leads pipeline
                </Link>
              )}
            </div>
          )}
        </div>
        <div className={s.pop}>
          <button className={s.profileBtn} aria-expanded={menu === "profile"} onClick={() => setMenu(menu === "profile" ? null : "profile")} aria-label="Account menu">
            <Avatar name={user.name} size={34} />
            <span className={s.profileText}>
              <strong>{user.name}</strong>
              <small>{user.role.toLowerCase()}</small>
            </span>
          </button>
          {menu === "profile" && (
            <div className={s.menu} role="menu">
              <p className={s.menuHead}>{user.email}</p>
              <Link href="/" className={s.menuItem} role="menuitem">
                View public site
              </Link>
              <button className={s.menuItem} role="menuitem" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
