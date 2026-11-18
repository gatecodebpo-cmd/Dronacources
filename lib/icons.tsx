import type { CSSProperties } from "react";

/** Icons admins can pick for categories/exams/services (rendered from the sprite). */
const PICKABLE = [
  "Award", "BadgeCheck", "Banknote", "BarChart3", "Bike", "BookOpen", "BookOpenCheck", "Brain", "Briefcase", "Building2", "Calculator", "Car",
  "ClipboardCheck", "Code2", "Compass", "Cpu", "Crosshair", "FileText", "Flag", "FlaskConical", "Gavel", "Globe2", "GraduationCap", "HardHat",
  "HeartPulse", "Landmark", "Laptop", "Library", "LineChart", "Medal", "Microscope", "Monitor", "Palette", "PenTool", "Plane", "Presentation",
  "Radar", "RefreshCcw", "School", "ScrollText", "Shield", "ShieldCheck", "Ship", "Siren", "Star", "Stethoscope", "Target", "Timer", "TrainFront",
  "Trophy", "Umbrella", "Users", "Wallet", "Wrench", "Zap", "Anchor", "Languages", "Factory", "Wind", "Swords", "Cog",
];
/** Fixed UI icons used by server-rendered cards, footer and home sections. */
const UI = [
  "ArrowRight", "CalendarDays", "Check", "CheckCircle2", "Clock", "FileQuestion", "Flame", "Lock", "Quote", "RotateCcw",
  "Mail", "MapPin", "Phone", "Send", "Facebook", "Instagram", "Linkedin", "Youtube",
];

export const ICON_NAMES = [...PICKABLE].sort();
/** Everything in public/icons.svg. Run `npm run icons` after changing these lists. */
export const SPRITE_ICONS = [...new Set([...PICKABLE, ...UI])].sort();
const KNOWN = new Set(SPRITE_ICONS);

type SvgIconProps = { name: string; size?: number; strokeWidth?: number; className?: string; fill?: string; style?: CSSProperties };

/** Lucide icon drawn from the shared sprite (/icons.svg): identical look, a few bytes of HTML. */
export function SvgIcon({ name, size = 24, strokeWidth = 2, className, fill = "none", style }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`/icons.svg#${KNOWN.has(name) ? name : "BookOpen"}`} />
    </svg>
  );
}

/** Admin-chosen icon by name, with the site's 1.75 stroke. */
export function Icon({ name, size = 22, className }: { name?: string; size?: number; className?: string }) {
  return <SvgIcon name={name || "BookOpen"} size={size} strokeWidth={1.75} className={className} />;
}
