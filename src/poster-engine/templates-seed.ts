import { BTechCategory } from "../db/schema/poster-platform.js";

export interface PosterTemplateDefinition {
  id: string;
  name: string;
  styleKey: string;
  description: string;
  defaultCategories: BTechCategory[];
  designTokens: {
    background: string;
    cardSurface: string;
    primaryText: string;
    secondaryText: string;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    borderStyle: string;
    fontFamilyHeading: string;
    fontFamilyBody: string;
    layoutVariant:
      | "centered"
      | "split-header"
      | "editorial-grid"
      | "urgent-banner"
      | "minimal-card";
  };
}

export const PREDEFINED_POSTER_TEMPLATES: PosterTemplateDefinition[] = [
  {
    id: "minimal-academic",
    name: "Minimal Academic",
    styleKey: "minimal-academic",
    description:
      "Swiss-inspired academic typography with warm ivory canvas and deep oxford navy accents.",
    defaultCategories: ["Academic Notifications", "Academic Calendar"],
    designTokens: {
      background: "#F8FAFC",
      cardSurface: "#FFFFFF",
      primaryText: "#0F172A",
      secondaryText: "#475569",
      accentColor: "#1E3A8A",
      badgeBg: "#DBEAFE",
      badgeText: "#1E3A8A",
      borderStyle: "2px solid #E2E8F0",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "editorial-grid",
    },
  },
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    styleKey: "modern-gradient",
    description:
      "Sleek indigo-to-violet mesh gradient with frosted glass content container.",
    defaultCategories: ["Examination Schedule"],
    designTokens: {
      background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #311042 100%)",
      cardSurface: "rgba(255, 255, 255, 0.08)",
      primaryText: "#FFFFFF",
      secondaryText: "#CBD5E1",
      accentColor: "#818CF8",
      badgeBg: "rgba(129, 140, 248, 0.2)",
      badgeText: "#C7D2FE",
      borderStyle: "1px solid rgba(255, 255, 255, 0.16)",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "minimal-card",
    },
  },
  {
    id: "premium-dark",
    name: "Premium Dark",
    styleKey: "premium-dark",
    description:
      "High-contrast obsidian carbon surface with emerald neon status highlights.",
    defaultCategories: ["Other Notifications"],
    designTokens: {
      background: "#090D16",
      cardSurface: "#111827",
      primaryText: "#F9FAFB",
      secondaryText: "#9CA3AF",
      accentColor: "#10B981",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeText: "#34D399",
      borderStyle: "1px solid #1F2937",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "split-header",
    },
  },
  {
    id: "clean-white",
    name: "Clean White",
    styleKey: "clean-white",
    description:
      "Ultra-crisp monochrome studio card with subtle slate dividers for maximum legibility.",
    defaultCategories: ["Student Services"],
    designTokens: {
      background: "#FFFFFF",
      cardSurface: "#F8FAFC",
      primaryText: "#09090B",
      secondaryText: "#52525B",
      accentColor: "#2563EB",
      badgeBg: "#EFF6FF",
      badgeText: "#1D4ED8",
      borderStyle: "1px solid #E4E4E7",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "centered",
    },
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    styleKey: "corporate-blue",
    description:
      "Authoritative university cobalt blue theme tailored for official fee and college notices.",
    defaultCategories: ["Fee Notifications", "College Notifications"],
    designTokens: {
      background: "linear-gradient(160deg, #0A2540 0%, #1D4ED8 100%)",
      cardSurface: "#FFFFFF",
      primaryText: "#0F172A",
      secondaryText: "#334155",
      accentColor: "#1D4ED8",
      badgeBg: "#DBEAFE",
      badgeText: "#1E40AF",
      borderStyle: "none",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "split-header",
    },
  },
  {
    id: "bold-exam-alert",
    name: "Bold Examination Alert",
    styleKey: "bold-exam-alert",
    description:
      "High-urgency crimson & amber alert banner engineered for B.Tech exam notifications.",
    defaultCategories: ["Examination Notifications", "Supplementary Examinations"],
    designTokens: {
      background: "linear-gradient(145deg, #450A0A 0%, #7F1D1D 60%, #991B1B 100%)",
      cardSurface: "#FEF2F2",
      primaryText: "#111827",
      secondaryText: "#374151",
      accentColor: "#DC2626",
      badgeBg: "#FEE2E2",
      badgeText: "#991B1B",
      borderStyle: "3px solid #FCA5A5",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "urgent-banner",
    },
  },
  {
    id: "important-notification",
    name: "Important Notification",
    styleKey: "important-notification",
    description:
      "Warm amber-gold priority callout layout ideal for revaluation and deadline updates.",
    defaultCategories: ["Revaluation"],
    designTokens: {
      background: "#18181B",
      cardSurface: "#27272A",
      primaryText: "#FAFAFA",
      secondaryText: "#D4D4D8",
      accentColor: "#F59E0B",
      badgeBg: "rgba(245, 158, 11, 0.2)",
      badgeText: "#FBBF24",
      borderStyle: "2px solid #F59E0B",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "urgent-banner",
    },
  },
  {
    id: "results-announcement",
    name: "Results Announcement",
    styleKey: "results-announcement",
    description:
      "Celebratory teal-emerald gradient highlighting published B.Tech semester exam results.",
    defaultCategories: ["Examination Results"],
    designTokens: {
      background: "linear-gradient(135deg, #064E3B 0%, #047857 55%, #0D9488 100%)",
      cardSurface: "#FFFFFF",
      primaryText: "#064E3B",
      secondaryText: "#334155",
      accentColor: "#059669",
      badgeBg: "#D1FAE5",
      badgeText: "#065F46",
      borderStyle: "none",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "centered",
    },
  },
  {
    id: "registration-reminder",
    name: "Registration Notice",
    styleKey: "registration-reminder",
    description:
      "Deadline-focused violet & cyan spotlight layout for course and exam registration.",
    defaultCategories: ["Registration"],
    designTokens: {
      background: "linear-gradient(135deg, #2E1065 0%, #4C1D95 50%, #1E3A8A 100%)",
      cardSurface: "rgba(15, 23, 42, 0.85)",
      primaryText: "#F8FAFC",
      secondaryText: "#CBD5E1",
      accentColor: "#38BDF8",
      badgeBg: "rgba(56, 189, 248, 0.2)",
      badgeText: "#7DD3FC",
      borderStyle: "1px solid rgba(56, 189, 248, 0.4)",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "split-header",
    },
  },
  {
    id: "examination-timetable",
    name: "Timetable Template",
    styleKey: "examination-timetable",
    description:
      "Structured grid-accented layout built for B.Tech slot and examination timetables.",
    defaultCategories: ["Time Table"],
    designTokens: {
      background: "#0F172A",
      cardSurface: "#1E293B",
      primaryText: "#F8FAFC",
      secondaryText: "#94A3B8",
      accentColor: "#6366F1",
      badgeBg: "rgba(99, 102, 241, 0.2)",
      badgeText: "#A5B4FC",
      borderStyle: "1px solid #334155",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "editorial-grid",
    },
  },
  {
    id: "academic-circular",
    name: "Official Circular",
    styleKey: "academic-circular",
    description:
      "Formal parchment-and-slate institutional layout for official KTU circulars and orders.",
    defaultCategories: ["Circulars"],
    designTokens: {
      background: "#F1F5F9",
      cardSurface: "#FFFFFF",
      primaryText: "#0F172A",
      secondaryText: "#475569",
      accentColor: "#0284C7",
      badgeBg: "#E0F2FE",
      badgeText: "#0369A1",
      borderStyle: "2px solid #CBD5E1",
      fontFamilyHeading: "'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif",
      fontFamilyBody: "'Inter', 'Noto Sans Malayalam', sans-serif",
      layoutVariant: "editorial-grid",
    },
  },
];

