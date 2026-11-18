import {
  Award, BadgeCheck, Banknote, BarChart3, Bike, BookOpen, BookOpenCheck, Brain, Briefcase, Building2, Calculator, Car,
  ClipboardCheck, Code2, Compass, Cpu, Crosshair, FileText, Flag, FlaskConical, Gavel, Globe2, GraduationCap, HardHat,
  HeartPulse, Landmark, Laptop, Library, LineChart, Medal, Microscope, Monitor, Palette, PenTool, Plane, Presentation,
  Radar, RefreshCcw, School, ScrollText, Shield, ShieldCheck, Ship, Siren, Star, Stethoscope, Target, Timer, TrainFront,
  Trophy, Umbrella, Users, Wallet, Wrench, Zap, Anchor, Languages, Factory, Wind, Swords, Cog, type LucideIcon,
} from "lucide-react";

// Curated set so client bundles don't pull in all of lucide. Admin icon pickers list these names.
export const ICONS: Record<string, LucideIcon> = {
  Award, BadgeCheck, Banknote, BarChart3, Bike, BookOpen, BookOpenCheck, Brain, Briefcase, Building2, Calculator, Car,
  ClipboardCheck, Code2, Compass, Cpu, Crosshair, FileText, Flag, FlaskConical, Gavel, Globe2, GraduationCap, HardHat,
  HeartPulse, Landmark, Laptop, Library, LineChart, Medal, Microscope, Monitor, Palette, PenTool, Plane, Presentation,
  Radar, RefreshCcw, School, ScrollText, Shield, ShieldCheck, Ship, Siren, Star, Stethoscope, Target, Timer, TrainFront,
  Trophy, Umbrella, Users, Wallet, Wrench, Zap, Anchor, Languages, Factory, Wind, Swords, Cog,
};

export const ICON_NAMES = Object.keys(ICONS).sort();

export function Icon({ name, size = 22, className }: { name?: string; size?: number; className?: string }) {
  const C = (name && ICONS[name]) || BookOpen;
  return <C size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}
