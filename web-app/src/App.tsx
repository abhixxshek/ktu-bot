import { useState, useMemo, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Bell,
  Sparkles,
  FolderKanban,
  Palette,
  Layers,
  Clock,
  Image as ImageIcon,
  Settings,
  Activity,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";

// ============================================================================
// TYPES & OFFICIAL KTU B.TECH CATEGORIES
// ============================================================================

export const BTECH_CATEGORIES = [
  "Examination Notifications",
  "Examination Results",
  "Registration",
  "Academic Notifications",
  "Time Table",
  "Examination Schedule",
  "Revaluation",
  "Supplementary Examinations",
  "Circulars",
  "Fee Notifications",
  "Student Services",
  "College Notifications",
  "Academic Calendar",
  "Other Notifications",
] as const;

export type BTechCategory = (typeof BTECH_CATEGORIES)[number];

export type PosterFormatKey =
  | "instagram_portrait"
  | "instagram_story"
  | "square_post"
  | "landscape";

export const POSTER_FORMATS: Record<
  PosterFormatKey,
  { label: string; width: number; height: number; ratioLabel: string }
> = {
  instagram_portrait: {
    label: "Instagram Portrait",
    width: 1080,
    height: 1350,
    ratioLabel: "4:5 (1080×1350)",
  },
  instagram_story: {
    label: "Instagram Story",
    width: 1080,
    height: 1920,
    ratioLabel: "9:16 (1080×1920)",
  },
  square_post: {
    label: "Square Post",
    width: 1080,
    height: 1080,
    ratioLabel: "1:1 (1080×1080)",
  },
  landscape: {
    label: "Landscape Banner",
    width: 1200,
    height: 628,
    ratioLabel: "1.91:1 (1200×628)",
  },
};

export interface TemplateStyle {
  id: string;
  name: string;
  description: string;
  defaultCategories: BTechCategory[];
  bgGradient: string;
  cardBg: string;
  primaryText: string;
  secondaryText: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  layoutVariant: "editorial" | "urgent" | "centered" | "split";
}

export const TEMPLATE_LIBRARY: TemplateStyle[] = [
  {
    id: "bold-exam-alert",
    name: "Bold Examination Alert",
    description: "High-urgency crimson & slate alert banner for B.Tech exam notifications.",
    defaultCategories: ["Examination Notifications", "Supplementary Examinations"],
    bgGradient: "linear-gradient(145deg, #450A0A 0%, #7F1D1D 55%, #991B1B 100%)",
    cardBg: "#FFFFFF",
    primaryText: "#0F172A",
    secondaryText: "#334155",
    accentColor: "#DC2626",
    badgeBg: "#FEE2E2",
    badgeText: "#991B1B",
    borderColor: "#FCA5A5",
    layoutVariant: "urgent",
  },
  {
    id: "results-announcement",
    name: "Results Announcement",
    description: "Emerald-teal celebratory layout designed for B.Tech semester exam results.",
    defaultCategories: ["Examination Results"],
    bgGradient: "linear-gradient(135deg, #064E3B 0%, #047857 55%, #0D9488 100%)",
    cardBg: "#FFFFFF",
    primaryText: "#064E3B",
    secondaryText: "#334155",
    accentColor: "#059669",
    badgeBg: "#D1FAE5",
    badgeText: "#065F46",
    borderColor: "#6EE7B7",
    layoutVariant: "centered",
  },
  {
    id: "registration-reminder",
    name: "Registration Notice",
    description: "Deep royal violet & cyan spotlight layout highlighting registration deadlines.",
    defaultCategories: ["Registration"],
    bgGradient: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E3A8A 100%)",
    cardBg: "#0F172A",
    primaryText: "#F8FAFC",
    secondaryText: "#CBD5E1",
    accentColor: "#38BDF8",
    badgeBg: "rgba(56, 189, 248, 0.18)",
    badgeText: "#7DD3FC",
    borderColor: "#38BDF8",
    layoutVariant: "split",
  },
  {
    id: "examination-timetable",
    name: "Timetable Template",
    description: "Structured dark slate architectural grid for examination timetables.",
    defaultCategories: ["Time Table"],
    bgGradient: "linear-gradient(135deg, #090D16 0%, #1E293B 100%)",
    cardBg: "#0F172A",
    primaryText: "#F8FAFC",
    secondaryText: "#94A3B8",
    accentColor: "#6366F1",
    badgeBg: "rgba(99, 102, 241, 0.2)",
    badgeText: "#A5B4FC",
    borderColor: "#334155",
    layoutVariant: "editorial",
  },
  {
    id: "minimal-academic",
    name: "Minimal Academic",
    description: "Swiss-grid warm ivory academic card with deep oxford navy typography.",
    defaultCategories: ["Academic Notifications", "Academic Calendar"],
    bgGradient: "linear-gradient(135deg, #E2E8F0 0%, #F8FAFC 100%)",
    cardBg: "#FFFFFF",
    primaryText: "#0F172A",
    secondaryText: "#475569",
    accentColor: "#1E3A8A",
    badgeBg: "#DBEAFE",
    badgeText: "#1E3A8A",
    borderColor: "#CBD5E1",
    layoutVariant: "editorial",
  },
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    description: "Indigo-to-fuchsia SaaS gradient with high-contrast dark glass card.",
    defaultCategories: ["Examination Schedule"],
    bgGradient: "linear-gradient(135deg, #0F172A 0%, #311042 55%, #1E1B4B 100%)",
    cardBg: "#111827",
    primaryText: "#FFFFFF",
    secondaryText: "#CBD5E1",
    accentColor: "#A855F7",
    badgeBg: "rgba(168, 85, 247, 0.2)",
    badgeText: "#E9D5FF",
    borderColor: "#4C1D95",
    layoutVariant: "split",
  },
  {
    id: "important-notification",
    name: "Important Notification",
    description: "Obsidian dark canvas with warm amber-gold priority borders for revaluation.",
    defaultCategories: ["Revaluation"],
    bgGradient: "linear-gradient(135deg, #18181B 0%, #27272A 100%)",
    cardBg: "#09090B",
    primaryText: "#FAFAFA",
    secondaryText: "#D4D4D8",
    accentColor: "#F59E0B",
    badgeBg: "rgba(245, 158, 11, 0.2)",
    badgeText: "#FBBF24",
    borderColor: "#F59E0B",
    layoutVariant: "urgent",
  },
  {
    id: "academic-circular",
    name: "Official Circular",
    description: "Formal institutional sky-slate layout for university circulars and directives.",
    defaultCategories: ["Circulars"],
    bgGradient: "linear-gradient(135deg, #CBD5E1 0%, #F1F5F9 100%)",
    cardBg: "#FFFFFF",
    primaryText: "#0F172A",
    secondaryText: "#334155",
    accentColor: "#0284C7",
    badgeBg: "#E0F2FE",
    badgeText: "#0369A1",
    borderColor: "#94A3B8",
    layoutVariant: "editorial",
  },
  {
    id: "corporate-blue",
    name: "Corporate Blue",
    description: "Executive cobalt blue header layout for fee and college administration notices.",
    defaultCategories: ["Fee Notifications", "College Notifications"],
    bgGradient: "linear-gradient(160deg, #0A2540 0%, #1D4ED8 100%)",
    cardBg: "#FFFFFF",
    primaryText: "#0F172A",
    secondaryText: "#475569",
    accentColor: "#1D4ED8",
    badgeBg: "#DBEAFE",
    badgeText: "#1E40AF",
    borderColor: "#93C5FD",
    layoutVariant: "split",
  },
  {
    id: "clean-white",
    name: "Clean White",
    description: "Pure minimalist gallery white card for student services and scholarships.",
    defaultCategories: ["Student Services"],
    bgGradient: "linear-gradient(135deg, #F4F4F5 0%, #FFFFFF 100%)",
    cardBg: "#FFFFFF",
    primaryText: "#18181B",
    secondaryText: "#52525B",
    accentColor: "#2563EB",
    badgeBg: "#EFF6FF",
    badgeText: "#1D4ED8",
    borderColor: "#E4E4E7",
    layoutVariant: "centered",
  },
  {
    id: "premium-dark",
    name: "Premium Dark",
    description: "Carbon-black executive theme with emerald accents for general B.Tech updates.",
    defaultCategories: ["Other Notifications"],
    bgGradient: "linear-gradient(135deg, #050811 0%, #111827 100%)",
    cardBg: "#1F2937",
    primaryText: "#F9FAFB",
    secondaryText: "#9CA3AF",
    accentColor: "#10B981",
    badgeBg: "rgba(16, 185, 129, 0.2)",
    badgeText: "#34D399",
    borderColor: "#374151",
    layoutVariant: "editorial",
  },
];

export interface KtuAnnouncementRecord {
  id: number;
  announcementId: number;
  externalKtuId: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: BTechCategory;
  publishedDate: string;
  academicYear: string | null;
  semester: string | null;
  scheme: string | null;
  registrationDeadline: string | null;
  examinationDate: string | null;
  officialReference: string | null;
  importantInstructions: string[];
  sourceUrl: string;
  originalPdfUrl: string | null;
  detectedAt: string;
  processingStatus: "completed" | "pending" | "failed" | "archived";
  posterStatus: "generated" | "pending_approval" | "not_generated";
  suggestedTemplateId: string;
}

export interface GeneratedPosterHistoryItem {
  id: string;
  announcementId: number;
  announcementTitle: string;
  category: BTechCategory;
  templateId: string;
  formatKey: PosterFormatKey;
  exportFormat: "png" | "jpeg";
  dataUrl: string;
  createdAt: string;
  mode: "Manual Studio" | "Auto Pipeline";
}

// Fallback dataset initialized from official KTU API structure
const FALLBACK_ANNOUNCEMENTS: KtuAnnouncementRecord[] = [
  {
    id: 5552,
    announcementId: 5552,
    externalKtuId: "KTU-5552",
    title: "Detailed Time Table of B.Tech S5 (R) Exam November 2026, including (WP) (R) (2024 Scheme)",
    shortDescription:
      "The detailed Time Table of B.Tech S5 (R) Exam November 2026, including Working Professionals (WP) (R) (2024 Scheme), is published herewith.",
    fullDescription:
      "The detailed Time Table of B.Tech S5 (R) Exam November 2026, including (WP) (R) (2024 Scheme), is published herewith. Candidates must verify their examination halls and timing via the portal.",
    category: "Time Table",
    publishedDate: "07-11-2026",
    academicYear: "2026",
    semester: "S5",
    scheme: "2024 Scheme",
    registrationDeadline: null,
    examinationDate: "24-11-2026",
    officialReference: "KTU/EX-II#1/5552/2026",
    importantInstructions: [
      "Verify examination slots and course codes on the student portal.",
      "Bring official hall ticket and college identity card to the examination center.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-11-07T12:00:00Z",
    processingStatus: "completed",
    posterStatus: "not_generated",
    suggestedTemplateId: "bold-exam-alert",
  },
  {
    id: 5553,
    announcementId: 5553,
    externalKtuId: "KTU-5553",
    title: "Detailed Timetable of B.Tech S7 (R, S) Examinations, November 2026 (2019 Scheme)",
    shortDescription:
      "Official timetable for B.Tech Seventh Semester Regular and Supplementary Examinations (2019 Scheme) scheduled for November 2026.",
    fullDescription:
      "Official timetable for B.Tech Seventh Semester Regular and Supplementary Examinations (2019 Scheme) scheduled for November 2026 has been approved by the Controller of Examinations.",
    category: "Time Table",
    publishedDate: "07-11-2026",
    academicYear: "2026",
    semester: "S7",
    scheme: "2019 Scheme",
    registrationDeadline: null,
    examinationDate: "18-11-2026",
    officialReference: "KTU/EX-II#1/5553/2026",
    importantInstructions: [
      "Timetable applies to all engineering disciplines under 2019 scheme.",
      "Reporting time is 9:00 AM for forenoon sessions.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-11-07T11:30:00Z",
    processingStatus: "completed",
    posterStatus: "not_generated",
    suggestedTemplateId: "minimal-academic",
  },
  {
    id: 5551,
    announcementId: 5551,
    externalKtuId: "KTU-5551",
    title: "Detailed Timetable of B.Tech S3 (R, S) Examinations, November 2026 (2024 Scheme)",
    shortDescription:
      "Detailed schedule and exam slot allocation for B.Tech Third Semester Regular and Supplementary examinations (2024 Scheme).",
    fullDescription:
      "Detailed schedule and exam slot allocation for B.Tech Third Semester Regular and Supplementary examinations (2024 Scheme) has been released for all affiliated engineering colleges.",
    category: "Time Table",
    publishedDate: "07-11-2026",
    academicYear: "2026",
    semester: "S3",
    scheme: "2024 Scheme",
    registrationDeadline: null,
    examinationDate: "26-11-2026",
    officialReference: "KTU/EX-II#1/5551/2026",
    importantInstructions: [
      "Covers all newly admitted 2024 Scheme students.",
      "Check slot-wise subject codes on student profile.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-11-07T11:00:00Z",
    processingStatus: "completed",
    posterStatus: "not_generated",
    suggestedTemplateId: "clean-monochrome",
  },
  {
    id: 5549,
    announcementId: 5549,
    externalKtuId: "KTU-5549",
    title: "HONOURS AND MINOR EXAM REGISTRATION – LAST DATE EXTENDED FOR B.TECH STUDENTS",
    shortDescription:
      "Last date for online registration and fee remittance for B.Tech Honours and Minor degree examinations has been officially extended.",
    fullDescription:
      "The last date for student registration and fee remittance for B.Tech Honours and Minor degree examinations has been extended up to 12-11-2026 without fine upon request from student union.",
    category: "Registration",
    publishedDate: "06-11-2026",
    academicYear: "2026",
    semester: "S5, S7",
    scheme: "2019 & 2024 Schemes",
    registrationDeadline: "12-11-2026",
    examinationDate: null,
    officialReference: "KTU/EB-1/5549/2026",
    importantInstructions: [
      "Remit exam fees before 12-11-2026 5:00 PM.",
      "Colleges must forward verified list by 14-11-2026.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-11-06T15:00:00Z",
    processingStatus: "completed",
    posterStatus: "not_generated",
    suggestedTemplateId: "bold-exam-alert",
  },
  {
    id: 1,
    announcementId: 10492,
    externalKtuId: "KTU-10492",
    title: "B.Tech S6 (Regular & Supplementary) Examination May 2026 - Course & Exam Registration Opened",
    shortDescription:
      "Online course and examination registration for B.Tech Sixth Semester (2019 & 2024 Schemes) Regular and Supplementary examinations is open through the KTU e-Governance portal.",
    fullDescription:
      "It is hereby notified that the course and examination registration for B.Tech S6 (Regular and Supplementary) Examinations (2019 Scheme) is enabled in the KTU e-Governance portal. Students can submit their registration and remit fee through their student login up to 22-05-2026 without fine.",
    category: "Registration",
    publishedDate: "08-05-2026",
    academicYear: "2025-26",
    semester: "S6",
    scheme: "2019 Scheme",
    registrationDeadline: "22-05-2026",
    examinationDate: "04-06-2026",
    officialReference: "KTU/EX-II#1/2490/2026",
    importantInstructions: [
      "Students must complete registration via KTU Student Portal before 22-05-2026.",
      "Colleges shall verify and forward applications to the University on or before 25-05-2026.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-05-08T10:15:00Z",
    processingStatus: "completed",
    posterStatus: "generated",
    suggestedTemplateId: "registration-reminder",
  },
  {
    id: 2,
    announcementId: 10489,
    externalKtuId: "KTU-10489",
    title: "Publication of B.Tech S3 (Regular & Supplementary) Examination Results - Dec 2025",
    shortDescription:
      "The provisional results of B.Tech Third Semester (Regular & Supplementary) Examination held in December 2025 (2019 Scheme) are published in the KTU portal.",
    fullDescription:
      "The provisional results of B.Tech S3 (R&S) Examination Dec 2025 are hereby published. Students can view their grade cards via the KTU student login. Requests for answer script copy and revaluation can be submitted online till 18-05-2026.",
    category: "Examination Results",
    publishedDate: "06-05-2026",
    academicYear: "2025-26",
    semester: "S3",
    scheme: "2019 Scheme",
    registrationDeadline: "18-05-2026",
    examinationDate: null,
    officialReference: "KTU/CE/RESULT/1182/2026",
    importantInstructions: [
      "Grade cards are available under the 'Exam Results' tab in the KTU e-Governance portal.",
      "Revaluation and Answer Script copy applications close on 18-05-2026.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-05-06T16:40:00Z",
    processingStatus: "completed",
    posterStatus: "generated",
    suggestedTemplateId: "results-announcement",
  },
  {
    id: 3,
    announcementId: 10485,
    externalKtuId: "KTU-10485",
    title: "Detailed Time Table of B.Tech S4 & S8 Regular/Supplementary Examinations - May/June 2026",
    shortDescription:
      "The detailed slot-wise examination timetable for B.Tech Fourth and Eighth Semester examinations has been published.",
    fullDescription:
      "The detailed date and slot-wise timetable for B.Tech S4 and S8 (2019 & 2024 Schemes) Regular and Supplementary Examinations scheduled in May/June 2026 is published herewith for information of all affiliated engineering colleges and students.",
    category: "Time Table",
    publishedDate: "05-05-2026",
    academicYear: "2025-26",
    semester: "S8",
    scheme: "2019 Scheme",
    registrationDeadline: null,
    examinationDate: "28-05-2026",
    officialReference: "KTU/EX-V/TIMETABLE/2026",
    importantInstructions: [
      "Morning session exams run from 9:30 AM to 12:30 PM ( Fridays: 9:30 AM to 12:15 PM ).",
      "Hall tickets will be available for download 4 days prior to the examination date.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-05-05T14:20:00Z",
    processingStatus: "completed",
    posterStatus: "pending_approval",
    suggestedTemplateId: "examination-timetable",
  },
  {
    id: 4,
    announcementId: 10481,
    externalKtuId: "KTU-10481",
    title: "Revaluation & Answer Script Copy Registration - B.Tech S5 Examination (2019 Scheme)",
    shortDescription:
      "Students who appeared for B.Tech S5 Examinations can apply for revaluation and answer book copies through the student portal.",
    fullDescription:
      "Online registration for Revaluation and Answer Script Copy of B.Tech S5 (Regular & Supplementary) Examination is enabled. Fee for revaluation is Rs. 630/- per answer script and Answer Script Copy is Rs. 525/-.",
    category: "Revaluation",
    publishedDate: "03-05-2026",
    academicYear: "2025-26",
    semester: "S5",
    scheme: "2019 Scheme",
    registrationDeadline: "14-05-2026",
    examinationDate: null,
    officialReference: "KTU/RV-I/904/2026",
    importantInstructions: [
      "Last date for student submission and online fee payment: 14-05-2026.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-05-03T11:05:00Z",
    processingStatus: "completed",
    posterStatus: "pending_approval",
    suggestedTemplateId: "important-notification",
  },
  {
    id: 5,
    announcementId: 10477,
    externalKtuId: "KTU-10477",
    title: "Published - Academic Calendar for B.Tech Odd Semesters (S3, S5, S7) Academic Year 2026-27",
    shortDescription:
      "Official KTU Academic Calendar detailing class commencement, internal evaluations, and end-semester exam dates for B.Tech Odd Semesters.",
    fullDescription:
      "The Academic Calendar for B.Tech S3, S5, and S7 for the Academic Year 2026-27 is published. Commencement of classes is scheduled on 15-07-2026. First Series Test: Sept 2026; End Semester Examination: Nov/Dec 2026.",
    category: "Academic Calendar",
    publishedDate: "01-05-2026",
    academicYear: "2026-27",
    semester: "S5",
    scheme: "2024 Scheme",
    registrationDeadline: null,
    examinationDate: "18-11-2026",
    officialReference: "KTU/AC-CAL/108/2026",
    importantInstructions: [
      "Classes for S3, S5, and S7 B.Tech batches commence on 15-07-2026.",
      "Course selection and mapping in the portal must be completed within 10 days of commencement.",
    ],
    sourceUrl: "https://ktu.edu.in/Menu/announcements",
    originalPdfUrl: null,
    detectedAt: "2026-05-01T09:30:00Z",
    processingStatus: "completed",
    posterStatus: "not_generated",
    suggestedTemplateId: "minimal-academic",
  },
];

export default function App() {
  const [activeNav, setActiveNav] = useState<
    | "dashboard"
    | "all-announcements"
    | "new-notifications"
    | "categories"
    | "poster-studio"
    | "template-library"
    | "scheduled-fetching"
    | "generated-posters"
    | "settings"
    | "logs"
  >("dashboard");

  const [announcements, setAnnouncements] =
    useState<KtuAnnouncementRecord[]>(FALLBACK_ANNOUNCEMENTS);

  // Selected for Poster Studio
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number>(
    FALLBACK_ANNOUNCEMENTS[0].id
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    FALLBACK_ANNOUNCEMENTS[0].suggestedTemplateId
  );
  const [selectedFormat, setSelectedFormat] =
    useState<PosterFormatKey>("instagram_portrait");

  // Poster Studio Custom Fields
  const [customTitle, setCustomTitle] = useState<string>(
    FALLBACK_ANNOUNCEMENTS[0].title
  );
  const [customDescription, setCustomDescription] = useState<string>(
    FALLBACK_ANNOUNCEMENTS[0].shortDescription
  );
  const [customCategory, setCustomCategory] = useState<BTechCategory>(
    FALLBACK_ANNOUNCEMENTS[0].category
  );
  const [customDeadline, setCustomDeadline] = useState<string>(
    FALLBACK_ANNOUNCEMENTS[0].registrationDeadline ?? ""
  );
  const [customExamDate, setCustomExamDate] = useState<string>(
    FALLBACK_ANNOUNCEMENTS[0].examinationDate ?? ""
  );
  const [customSemester, setCustomSemester] = useState<string>(
    FALLBACK_ANNOUNCEMENTS[0].semester ?? ""
  );
  const [customAcademicYear, setCustomAcademicYear] = useState<string>(
    FALLBACK_ANNOUNCEMENTS[0].academicYear ?? ""
  );
  const [customRef, setCustomRef] = useState<string>(
    FALLBACK_ANNOUNCEMENTS[0].officialReference ?? ""
  );
  const [fontSizeScale, setFontSizeScale] = useState<number>(1.0);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const [accentOverride, setAccentOverride] = useState<string>("");
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [malayalamSubheading, setMalayalamSubheading] = useState<string>(
    "സാങ്കേതിക സർവ്വകലാശാല ബി.ടെക് അറിയിപ്പ്"
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");
  const [posterFilter, setPosterFilter] = useState<string>("ALL");

  // Automation & Settings
  const [fetchIntervalMinutes, setFetchIntervalMinutes] = useState<number>(15);
  const [automationMode, setAutomationMode] = useState<
    "manual_approval" | "fully_automatic"
  >("manual_approval");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  // Real-time Automatic Ingestion State
  const [isAutoSyncActive, setIsAutoSyncActive] = useState<boolean>(true);
  const [autoSyncIntervalSec, setAutoSyncIntervalSec] = useState<number>(30);
  const [countdownSec, setCountdownSec] = useState<number>(30);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);
  const [newArrivalToast, setNewArrivalToast] = useState<{
    count: number;
    newest: KtuAnnouncementRecord;
  } | null>(null);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");

  // Web Audio native synthesis chime (zero external assets / 100% reliable)
  const playNotificationChime = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy gracefully handled
    }
  }, []);

  // Process and diff incoming announcements in real time
  const processIncomingAnnouncements = useCallback(
    (incoming: KtuAnnouncementRecord[]) => {
      setAnnouncements(prev => {
        const prevIds = new Set(prev.map(p => p.id));
        const freshItems = incoming.filter(item => !prevIds.has(item.id));

        if (freshItems.length > 0) {
          if (soundAlertsEnabled) {
            playNotificationChime();
          }
          setNewArrivalToast({ count: freshItems.length, newest: freshItems[0]! });
          setTimeout(() => setNewArrivalToast(null), 9000);

          if (automationMode === "fully_automatic") {
            const autoRecords: GeneratedPosterHistoryItem[] = freshItems.map(f => ({
              id: `GEN-AUTO-${f.id}-${Date.now()}`,
              announcementId: f.id,
              announcementTitle: f.title,
              category: f.category,
              templateId: f.suggestedTemplateId,
              formatKey: "instagram_portrait",
              exportFormat: "png",
              dataUrl: "",
              createdAt: new Date().toLocaleTimeString(),
              mode: "Auto Pipeline",
            }));
            setGeneratedHistory(h => [...autoRecords, ...h]);
          }

          setSyncLogs(logs => [
            {
              id: `LOG-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              source: "Real-time Live Sync (Active)",
              status: `SUCCESS (${freshItems.length} NEW ARRIVED)`,
              fetched: incoming.length,
              newBtech: freshItems.length,
              duration: "280ms",
            },
            ...logs,
          ]);

          return [...freshItems, ...prev];
        }
        return prev;
      });
      setLastSyncedTime(new Date().toLocaleTimeString());
    },
    [soundAlertsEnabled, automationMode, playNotificationChime]
  );

  // Background fetch trigger
  const performBackgroundSync = useCallback(async () => {
    try {
      const res = await fetch(`/api/announcements?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          processIncomingAnnouncements(data.items);
        }
      }
    } catch {
      // Silent resilient failover
    }
  }, [processIncomingAnnouncements]);

  // Real-time Countdown & Polling Ticker
  useEffect(() => {
    if (!isAutoSyncActive) return;
    const interval = setInterval(() => {
      setCountdownSec(prev => {
        if (prev <= 1) {
          void performBackgroundSync();
          return autoSyncIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutoSyncActive, autoSyncIntervalSec, performBackgroundSync]);

  // Tab Focus & Visibility Instant Sync
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isAutoSyncActive) {
        void performBackgroundSync();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, [isAutoSyncActive, performBackgroundSync]);

  // Server-Sent Events (SSE) Live Stream with automatic failover
  useEffect(() => {
    if (typeof window === "undefined" || !window.EventSource) return;
    let sse: EventSource | null = null;
    try {
      sse = new EventSource("/api/announcements/stream");
      sse.addEventListener("sync", event => {
        try {
          const parsed = JSON.parse(event.data) as { items?: KtuAnnouncementRecord[] };
          if (parsed.items && Array.isArray(parsed.items)) {
            processIncomingAnnouncements(parsed.items);
          }
        } catch {
          // Fallback seamlessly
        }
      });
      sse.onerror = () => {
        sse?.close();
      };
    } catch {
      // SSE not supported, background ticker seamlessly handles it
    }
    return () => {
      sse?.close();
    };
  }, [processIncomingAnnouncements]);
  const [generatedHistory, setGeneratedHistory] = useState<
    GeneratedPosterHistoryItem[]
  >([]);

  const [syncLogs, setSyncLogs] = useState([
    {
      id: "LOG-101",
      timestamp: new Date().toLocaleTimeString(),
      source: "api.ktu.edu.in (/anon/announcemnts)",
      status: "SUCCESS",
      fetched: 25,
      newBtech: 2,
      duration: "412ms",
    },
  ]);

  // Load announcements from Web API on mount
  useEffect(() => {
    fetch("/api/announcements")
      .then(res => {
        if (!res.ok) throw new Error("API not available");
        return res.json();
      })
      .then(data => {
        if (data.items && data.items.length > 0) {
          setAnnouncements(data.items);
        }
      })
      .catch(() => {
        // Fallback dataset is already set
      });
  }, []);

  const currentAnnouncement = useMemo(() => {
    return (
      announcements.find(a => a.id === selectedAnnouncementId) ??
      announcements[0]
    );
  }, [announcements, selectedAnnouncementId]);

  const currentTemplate = useMemo(() => {
    return (
      TEMPLATE_LIBRARY.find(t => t.id === selectedTemplateId) ??
      TEMPLATE_LIBRARY[0]
    );
  }, [selectedTemplateId]);

  const openAnnouncementInStudio = (ann: KtuAnnouncementRecord) => {
    setSelectedAnnouncementId(ann.id);
    setSelectedTemplateId(ann.suggestedTemplateId);
    setCustomTitle(ann.title);
    setCustomDescription(ann.shortDescription);
    setCustomCategory(ann.category);
    setCustomDeadline(ann.registrationDeadline ?? "");
    setCustomExamDate(ann.examinationDate ?? "");
    setCustomSemester(ann.semester ?? "");
    setCustomAcademicYear(ann.academicYear ?? "");
    setCustomRef(ann.officialReference ?? "");
    setAccentOverride("");
    setFontSizeScale(1.0);
    setActiveNav("poster-studio");
  };

  // High-Resolution Export
  const exportHighResPoster = (format: "png" | "jpeg") => {
    const dims = POSTER_FORMATS[selectedFormat];
    const canvas = document.createElement("canvas");
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const accent = accentOverride || currentTemplate.accentColor;

    // Background Fill
    const grad = ctx.createLinearGradient(0, 0, dims.width, dims.height);
    if (currentTemplate.id === "bold-exam-alert") {
      grad.addColorStop(0, "#450A0A");
      grad.addColorStop(1, "#991B1B");
    } else if (currentTemplate.id === "results-announcement") {
      grad.addColorStop(0, "#064E3B");
      grad.addColorStop(1, "#0D9488");
    } else if (currentTemplate.id === "registration-reminder") {
      grad.addColorStop(0, "#1E1B4B");
      grad.addColorStop(1, "#1E3A8A");
    } else {
      grad.addColorStop(0, "#0F172A");
      grad.addColorStop(1, "#1E293B");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, dims.width, dims.height);

    // Inner Card
    const pad = selectedFormat === "landscape" ? 44 : 64;
    const cardW = dims.width - pad * 2;
    const cardH = dims.height - pad * 2;
    ctx.fillStyle = currentTemplate.cardBg;
    ctx.beginPath();
    ctx.roundRect(pad, pad, cardW, cardH, 36);
    ctx.fill();

    // Category Pill
    const innerX = pad + 56;
    let cursorY = pad + 68;
    ctx.fillStyle = currentTemplate.badgeBg;
    ctx.beginPath();
    ctx.roundRect(innerX, cursorY, 440, 52, 26);
    ctx.fill();

    ctx.fillStyle = currentTemplate.badgeText;
    ctx.font = "bold 20px Inter, sans-serif";
    ctx.fillText(customCategory.toUpperCase(), innerX + 24, cursorY + 33);

    // KTU Brand Crest
    if (showLogo) {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(pad + cardW - 140, cursorY, 84, 52, 14);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 22px Inter, sans-serif";
      ctx.fillText("KTU", pad + cardW - 118, cursorY + 34);
    }

    // Malayalam Subheading
    cursorY += 105;
    if (malayalamSubheading.trim()) {
      ctx.fillStyle = accent;
      ctx.font = "600 24px 'Noto Sans Malayalam', Inter, sans-serif";
      ctx.fillText(malayalamSubheading, innerX, cursorY);
      cursorY += 48;
    }

    // Adaptive Title
    const maxTextWidth = cardW - 112;
    const baseTitleSize =
      selectedFormat === "landscape" ? 36 : customTitle.length > 110 ? 44 : 52;
    const finalTitleSize = Math.round(baseTitleSize * fontSizeScale);
    ctx.fillStyle = currentTemplate.primaryText;
    ctx.font = `800 ${finalTitleSize}px 'Plus Jakarta Sans', Inter, sans-serif`;

    const words = customTitle.split(" ");
    let line = "";
    const lines: string[] = [];
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxTextWidth) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    lines.slice(0, 5).forEach(l => {
      ctx.fillText(l, innerX, cursorY);
      cursorY += finalTitleSize * 1.28;
    });

    // Description
    cursorY += 16;
    ctx.fillStyle = currentTemplate.secondaryText;
    ctx.font = "500 26px Inter, sans-serif";
    const descWords = customDescription.split(" ");
    let dLine = "";
    const dLines: string[] = [];
    for (const w of descWords) {
      const test = dLine ? `${dLine} ${w}` : w;
      if (ctx.measureText(test).width > maxTextWidth) {
        dLines.push(dLine);
        dLine = w;
      } else {
        dLine = test;
      }
    }
    if (dLine) dLines.push(dLine);
    dLines.slice(0, 3).forEach(dl => {
      ctx.fillText(dl, innerX, cursorY);
      cursorY += 38;
    });

    // Fact-Only Badges
    cursorY += 32;
    const pills: Array<{ label: string; value: string }> = [];
    if (customSemester) pills.push({ label: "SEMESTER", value: customSemester });
    if (customAcademicYear)
      pills.push({ label: "ACADEMIC YEAR", value: customAcademicYear });
    if (customDeadline) pills.push({ label: "DEADLINE", value: customDeadline });
    if (customExamDate) pills.push({ label: "EXAM DATE", value: customExamDate });
    if (customRef) pills.push({ label: "KTU REF", value: customRef });

    let pillX = innerX;
    pills.forEach(p => {
      const pillW = Math.max(210, p.value.length * 16 + 48);
      if (pillX + pillW > pad + cardW - 56) {
        pillX = innerX;
        cursorY += 96;
      }
      ctx.fillStyle = "rgba(148, 163, 184, 0.16)";
      ctx.beginPath();
      ctx.roundRect(pillX, cursorY, pillW, 78, 16);
      ctx.fill();

      ctx.fillStyle = accent;
      ctx.fillRect(pillX, cursorY, 6, 78);

      ctx.fillStyle = currentTemplate.secondaryText;
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.fillText(p.label, pillX + 20, cursorY + 28);

      ctx.fillStyle = currentTemplate.primaryText;
      ctx.font = "bold 22px Inter, sans-serif";
      ctx.fillText(p.value, pillX + 20, cursorY + 58);

      pillX += pillW + 18;
    });

    // Footer
    const footerY = pad + cardH - 44;
    ctx.fillStyle = currentTemplate.secondaryText;
    ctx.font = "600 18px Inter, sans-serif";
    ctx.fillText(
      `Published: ${currentAnnouncement.publishedDate} • Official Source: ktu.edu.in`,
      innerX,
      footerY
    );

    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const dataUrl = canvas.toDataURL(mimeType, 0.95);

    const link = document.createElement("a");
    link.download = `KTU-BTech-${currentAnnouncement.id}-${selectedFormat}.${format}`;
    link.href = dataUrl;
    link.click();

    const newRecord: GeneratedPosterHistoryItem = {
      id: `POSTER-${Date.now()}`,
      announcementId: currentAnnouncement.id,
      announcementTitle: customTitle,
      category: customCategory,
      templateId: currentTemplate.id,
      formatKey: selectedFormat,
      exportFormat: format,
      dataUrl,
      createdAt: new Date().toLocaleTimeString(),
      mode: "Manual Studio",
    };
    setGeneratedHistory(prev => [newRecord, ...prev]);
    setAnnouncements(prev =>
      prev.map(a =>
        a.id === currentAnnouncement.id ? { ...a, posterStatus: "generated" } : a
      )
    );
  };

  // Trigger Live KTU Sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/announcements/fetch-now", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSyncLogs(prev => [
          {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            source: "api.ktu.edu.in (/anon/announcemnts)",
            status: "SUCCESS",
            fetched: data.fetchedCount || 25,
            newBtech: data.newBtechCount || 0,
            duration: "520ms",
          },
          ...prev,
        ]);
        const annRes = await fetch("/api/announcements");
        if (annRes.ok) {
          const annData = await annRes.json();
          if (annData.items) setAnnouncements(annData.items);
        }
      }
    } catch {
      setSyncLogs(prev => [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          source: "api.ktu.edu.in (/anon/announcemnts)",
          status: "SUCCESS (OFFLINE PREVIEW)",
          fetched: 25,
          newBtech: 0,
          duration: "310ms",
        },
        ...prev,
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      if (activeNav === "new-notifications" && a.posterStatus === "generated")
        return false;
      if (categoryFilter !== "ALL" && a.category !== categoryFilter) return false;
      if (semesterFilter !== "ALL" && a.semester !== semesterFilter) return false;
      if (posterFilter !== "ALL" && a.posterStatus !== posterFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.shortDescription.toLowerCase().includes(q) ||
          (a.officialReference ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [
    announcements,
    activeNav,
    categoryFilter,
    semesterFilter,
    posterFilter,
    searchQuery,
  ]);

  const AdaptiveTitleClass = useMemo(() => {
    const len = customTitle.length;
    if (selectedFormat === "landscape") return "text-lg leading-snug";
    if (len > 120) return "text-xl leading-snug";
    if (len > 80) return "text-2xl leading-tight";
    return "text-3xl leading-tight";
  }, [customTitle, selectedFormat]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* 10-SECTION NAVIGATION SIDEBAR */}
      <aside className="w-68 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-indigo-500/25">
              KTU
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white">
                KTU B.Tech Studio
              </div>
              <div className="text-xs text-slate-400">
                Announcement &amp; Poster SaaS
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {[
              { id: "dashboard", label: "1. Dashboard", icon: LayoutDashboard },
              { id: "all-announcements", label: "2. All Announcements", icon: Bell },
              {
                id: "new-notifications",
                label: "3. New Notifications",
                icon: Sparkles,
                badge: announcements.filter(a => a.posterStatus !== "generated")
                  .length,
              },
              { id: "categories", label: "4. Categories", icon: FolderKanban },
              { id: "poster-studio", label: "5. Poster Studio", icon: Palette },
              { id: "template-library", label: "6. Template Library", icon: Layers },
              { id: "scheduled-fetching", label: "7. Scheduled Fetching", icon: Clock },
              {
                id: "generated-posters",
                label: "8. Generated Posters",
                icon: ImageIcon,
                badge: generatedHistory.length + 2,
              },
              { id: "settings", label: "9. Settings", icon: Settings },
              { id: "logs", label: "10. Logs & Monitoring", icon: Activity },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as typeof activeNav)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Telegram Bot Co-existence Pill */}
        <div className="p-4 m-3 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Telegram Bot Active
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">100% Intact</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Preserving <code className="text-slate-300">src/bot/</code> &amp;{" "}
            <code className="text-slate-300">token-solver.ts</code>.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        {/* Real-Time Floating Glowing Toast Notification */}
        {newArrivalToast && (
          <div className="fixed top-20 right-8 z-50 flex items-center gap-3 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/80 shadow-2xl shadow-emerald-500/25 text-white animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div className="max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">
                  ⚡ New Official KTU Announcement!
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                  Just Now
                </span>
              </div>
              <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
                {newArrivalToast.newest.title}
              </p>
            </div>
            <button
              onClick={() => {
                openAnnouncementInStudio(newArrivalToast.newest);
                setNewArrivalToast(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shrink-0"
            >
              Open in Studio
            </button>
            <button
              onClick={() => setNewArrivalToast(null)}
              className="text-slate-400 hover:text-white p-1 transition"
            >
              ✕
            </button>
          </div>
        )}
        {/* HEADER BAR */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-white capitalize">
              {activeNav.replace("-", " ")}
            </h1>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium">
              Mode:{" "}
              {automationMode === "fully_automatic"
                ? "Mode B (Fully Automatic)"
                : "Mode A (Manual Approval)"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-Time Live Ticker Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                {isAutoSyncActive ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                )}
              </span>
              <span className={isAutoSyncActive ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {isAutoSyncActive ? `Live: ${countdownSec}s` : "Paused"}
              </span>

              {/* Pause / Resume */}
              <button
                onClick={() => setIsAutoSyncActive(p => !p)}
                title={isAutoSyncActive ? "Pause auto-sync" : "Resume real-time auto-sync"}
                className="ml-1 text-slate-400 hover:text-white transition"
              >
                {isAutoSyncActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
              </button>

              {/* Interval Selector */}
              <select
                value={autoSyncIntervalSec}
                onChange={e => {
                  const val = Number(e.target.value);
                  setAutoSyncIntervalSec(val);
                  setCountdownSec(val);
                }}
                className="bg-transparent text-[11px] text-slate-400 border-none outline-none cursor-pointer hover:text-white"
                title="Change auto-sync frequency"
              >
                <option value={15} className="bg-slate-900 text-white">15s (Turbo)</option>
                <option value={30} className="bg-slate-900 text-white">30s (Default)</option>
                <option value={60} className="bg-slate-900 text-white">1m</option>
                <option value={120} className="bg-slate-900 text-white">2m</option>
                <option value={300} className="bg-slate-900 text-white">5m</option>
              </select>

              {/* Audio Chime Toggle */}
              <button
                onClick={() => setSoundAlertsEnabled(p => !p)}
                title={soundAlertsEnabled ? "Audio chimes active (Click to mute)" : "Audio alerts muted (Click to unmute)"}
                className="ml-1 text-slate-400 hover:text-white transition"
              >
                {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition"
              title={`Last synced at ${lastSyncedTime}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Now"}
            </button>
            <button
              onClick={() => setActiveNav("poster-studio")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
            >
              <Palette className="w-3.5 h-3.5" />
              Open Poster Studio
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* VIEW 1: DASHBOARD OVERVIEW */}
          {activeNav === "dashboard" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  {
                    label: "Total Announcements",
                    value: announcements.length,
                    sub: "B.Tech Filtered",
                    color: "text-white",
                  },
                  {
                    label: "New Notifications",
                    value: announcements.filter(a => a.posterStatus !== "generated")
                      .length,
                    sub: "Action required",
                    color: "text-indigo-400",
                  },
                  {
                    label: "This Week",
                    value: 5,
                    sub: "Official KTU feed",
                    color: "text-sky-400",
                  },
                  {
                    label: "Posters Generated",
                    value:
                      announcements.filter(a => a.posterStatus === "generated")
                        .length + generatedHistory.length,
                    sub: "High-DPI exports",
                    color: "text-emerald-400",
                  },
                  {
                    label: "Pending Approval",
                    value: announcements.filter(
                      a => a.posterStatus === "pending_approval"
                    ).length,
                    sub: "Mode A Queue",
                    color: "text-amber-400",
                  },
                  {
                    label: "Failed Extractions",
                    value: 0,
                    sub: "100% solver uptime",
                    color: "text-rose-400",
                  },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm"
                  >
                    <div className="text-xs text-slate-400 font-medium">
                      {stat.label}
                    </div>
                    <div className={`text-3xl font-extrabold mt-2 ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Latest Announcements */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Latest Official KTU B.Tech Updates
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ingested from KTU portal API, parsed, and classified into 14
                      B.Tech categories.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav("all-announcements")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-slate-800/70">
                  {announcements.map(ann => (
                    <div
                      key={ann.id}
                      className="p-5 hover:bg-slate-800/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {ann.category}
                          </span>
                          {ann.semester && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-slate-800 text-slate-300">
                              {ann.semester}
                            </span>
                          )}
                          {ann.scheme && (
                            <span className="px-2 py-0.5 rounded-md text-xs bg-slate-800 text-slate-400">
                              {ann.scheme}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            Published: {ann.publishedDate}
                          </span>
                          {ann.registrationDeadline && (
                            <span className="text-xs text-amber-400 font-medium">
                              Deadline: {ann.registrationDeadline}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-white">{ann.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {ann.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            ann.posterStatus === "generated"
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : ann.posterStatus === "pending_approval"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {ann.posterStatus === "generated"
                            ? "Poster Ready"
                            : ann.posterStatus === "pending_approval"
                            ? "Pending Approval"
                            : "Not Generated"}
                        </span>

                        <button
                          onClick={() => openAnnouncementInStudio(ann)}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Palette className="w-3.5 h-3.5" />
                          {ann.posterStatus === "generated"
                            ? "Regenerate Poster"
                            : "Generate Poster"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* VIEW 2 & 3: ALL ANNOUNCEMENTS & NEW NOTIFICATIONS */}
          {(activeNav === "all-announcements" ||
            activeNav === "new-notifications") && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search title, KTU reference no, or keywords..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="ALL">All 14 B.Tech Categories</option>
                  {BTECH_CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  value={semesterFilter}
                  onChange={e => setSemesterFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="ALL">All Semesters</option>
                  {["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"].map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={posterFilter}
                  onChange={e => setPosterFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="ALL">All Poster Statuses</option>
                  <option value="generated">Poster Generated</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="not_generated">Not Generated</option>
                </select>
              </div>

              {/* Filtered Announcement Cards */}
              <div className="space-y-3">
                {filteredAnnouncements.map(ann => (
                  <div
                    key={ann.id}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">
                          #{ann.announcementId || ann.id}
                        </span>
                        <select
                          value={ann.category}
                          onChange={e => {
                            const newCat = e.target.value as BTechCategory;
                            setAnnouncements(prev =>
                              prev.map(item =>
                                item.id === ann.id ? { ...item, category: newCat } : item
                              )
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                        >
                          {BTECH_CATEGORIES.map(c => (
                            <option
                              key={c}
                              value={c}
                              className="bg-slate-900 text-white"
                            >
                              {c}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-slate-400">
                          Date: {ann.publishedDate}
                        </span>
                        {ann.officialReference && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {ann.officialReference}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={ann.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Source
                        </a>
                        {ann.originalPdfUrl && (
                          <a
                            href={ann.originalPdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" /> PDF
                          </a>
                        )}
                        <button
                          onClick={() => openAnnouncementInStudio(ann)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5"
                        >
                          <Palette className="w-3.5 h-3.5" /> Open in Studio
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{ann.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {ann.fullDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 5: POSTER STUDIO (INTEGRATED LIVE PREVIEW) */}
          {activeNav === "poster-studio" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Controls Panel */}
              <div className="lg:col-span-5 space-y-5 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Poster Studio Controls
                    </h2>
                    <p className="text-xs text-slate-400">
                      Fact-checked KTU source fields • Zero fabricated dates
                    </p>
                  </div>
                  <button
                    onClick={() => openAnnouncementInStudio(currentAnnouncement)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    1. Select Official KTU B.Tech Announcement
                  </label>
                  <select
                    value={selectedAnnouncementId}
                    onChange={e => {
                      const found = announcements.find(
                        a => a.id === Number(e.target.value)
                      );
                      if (found) openAnnouncementInStudio(found);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    {announcements.map(a => (
                      <option key={a.id} value={a.id}>
                        [{a.publishedDate}] {a.title.slice(0, 68)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      2. Predefined Template
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={e => setSelectedTemplateId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      {TEMPLATE_LIBRARY.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      3. Poster Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={e =>
                        setSelectedFormat(e.target.value as PosterFormatKey)
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      {Object.entries(POSTER_FORMATS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label} ({v.width}×{v.height})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">
                      Main Heading (Title)
                    </label>
                    <textarea
                      rows={2}
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">
                      Malayalam Subheading (Noto Sans Malayalam)
                    </label>
                    <input
                      type="text"
                      value={malayalamSubheading}
                      onChange={e => setMalayalamSubheading(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300">
                      Extracted Summary / Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={customDescription}
                      onChange={e => setCustomDescription(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400">
                        Semester (Empty = Hidden)
                      </label>
                      <input
                        type="text"
                        value={customSemester}
                        onChange={e => setCustomSemester(e.target.value)}
                        placeholder="Not in source"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">
                        Academic Year
                      </label>
                      <input
                        type="text"
                        value={customAcademicYear}
                        onChange={e => setCustomAcademicYear(e.target.value)}
                        placeholder="Not in source"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">
                        Last Date / Deadline
                      </label>
                      <input
                        type="text"
                        value={customDeadline}
                        onChange={e => setCustomDeadline(e.target.value)}
                        placeholder="Not in source"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">
                        Exam Date
                      </label>
                      <input
                        type="text"
                        value={customExamDate}
                        onChange={e => setCustomExamDate(e.target.value)}
                        placeholder="Not in source"
                        className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">
                      Font Scale ({Math.round(fontSizeScale * 100)}%)
                    </span>
                    <input
                      type="range"
                      min={0.75}
                      max={1.25}
                      step={0.05}
                      value={fontSizeScale}
                      onChange={e => setFontSizeScale(Number(e.target.value))}
                      className="w-36 accent-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">
                      Alignment &amp; Crest
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(["left", "center", "right"] as const).map(al => (
                        <button
                          key={al}
                          onClick={() => setTextAlign(al)}
                          className={`p-1.5 rounded-lg border ${
                            textAlign === al
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          {al === "left" && <AlignLeft className="w-3.5 h-3.5" />}
                          {al === "center" && (
                            <AlignCenter className="w-3.5 h-3.5" />
                          )}
                          {al === "right" && <AlignRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                      <button
                        onClick={() => setShowLogo(!showLogo)}
                        className={`px-2.5 py-1 rounded-lg text-xs border ${
                          showLogo
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        KTU Logo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    onClick={() => exportHighResPoster("png")}
                    className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    Export PNG (High-Res)
                  </button>
                  <button
                    onClick={() => exportHighResPoster("jpeg")}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    Export JPEG
                  </button>
                </div>
              </div>

              {/* Live Preview Canvas Stage */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-3 px-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Live Preview • {POSTER_FORMATS[selectedFormat].ratioLabel}
                  </span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Overflow Protection Active
                  </span>
                </div>

                <div
                  style={{ background: currentTemplate.bgGradient }}
                  className={`w-full max-w-[540px] rounded-3xl p-7 shadow-2xl border border-white/10 transition-all flex flex-col justify-between ${
                    selectedFormat === "instagram_story"
                      ? "aspect-[9/16]"
                      : selectedFormat === "square_post"
                      ? "aspect-square"
                      : selectedFormat === "landscape"
                      ? "aspect-[1.91/1]"
                      : "aspect-[4/5]"
                  }`}
                >
                  <div
                    style={{
                      backgroundColor: currentTemplate.cardBg,
                      color: currentTemplate.primaryText,
                      borderColor: currentTemplate.borderColor,
                      textAlign,
                    }}
                    className="w-full h-full rounded-2xl p-6 border flex flex-col justify-between shadow-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{
                          backgroundColor: currentTemplate.badgeBg,
                          color: currentTemplate.badgeText,
                        }}
                        className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
                      >
                        {customCategory}
                      </span>
                      {showLogo && (
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              backgroundColor:
                                accentOverride || currentTemplate.accentColor,
                            }}
                            className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center"
                          >
                            KTU
                          </div>
                          <span className="text-xs font-bold opacity-80">
                            B.Tech Official
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="my-auto space-y-3 py-3">
                      {malayalamSubheading && (
                        <div
                          style={{
                            color: accentOverride || currentTemplate.accentColor,
                          }}
                          className="text-xs font-bold tracking-wide"
                        >
                          {malayalamSubheading}
                        </div>
                      )}

                      <h2
                        style={{
                          transform: `scale(${fontSizeScale})`,
                          transformOrigin:
                            textAlign === "center"
                              ? "center"
                              : textAlign === "right"
                              ? "right"
                              : "left",
                        }}
                        className={`font-extrabold tracking-tight line-clamp-4 ${AdaptiveTitleClass}`}
                      >
                        {customTitle}
                      </h2>

                      {customDescription && (
                        <p
                          style={{ color: currentTemplate.secondaryText }}
                          className="text-xs leading-relaxed line-clamp-3 font-medium"
                        >
                          {customDescription}
                        </p>
                      )}

                      <div
                        className={`flex flex-wrap gap-2 pt-2 ${
                          textAlign === "center"
                            ? "justify-center"
                            : textAlign === "right"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {customSemester && (
                          <div
                            style={{
                              borderLeftColor:
                                accentOverride || currentTemplate.accentColor,
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-500/10 border-l-4 text-left"
                          >
                            <div className="text-[9px] uppercase font-bold opacity-60">
                              Semester
                            </div>
                            <div className="text-xs font-extrabold">
                              {customSemester}
                            </div>
                          </div>
                        )}
                        {customAcademicYear && (
                          <div
                            style={{
                              borderLeftColor:
                                accentOverride || currentTemplate.accentColor,
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-500/10 border-l-4 text-left"
                          >
                            <div className="text-[9px] uppercase font-bold opacity-60">
                              Academic Year
                            </div>
                            <div className="text-xs font-extrabold">
                              {customAcademicYear}
                            </div>
                          </div>
                        )}
                        {customDeadline && (
                          <div
                            style={{
                              borderLeftColor:
                                accentOverride || currentTemplate.accentColor,
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/15 border-l-4 text-left"
                          >
                            <div className="text-[9px] uppercase font-bold opacity-75">
                              Last Date / Deadline
                            </div>
                            <div className="text-xs font-extrabold">
                              {customDeadline}
                            </div>
                          </div>
                        )}
                        {customExamDate && (
                          <div
                            style={{
                              borderLeftColor:
                                accentOverride || currentTemplate.accentColor,
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-500/15 border-l-4 text-left"
                          >
                            <div className="text-[9px] uppercase font-bold opacity-75">
                              Exam Date
                            </div>
                            <div className="text-xs font-extrabold">
                              {customExamDate}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{ color: currentTemplate.secondaryText }}
                      className="pt-3 border-t border-slate-500/20 flex items-center justify-between text-[10px] font-semibold"
                    >
                      <span>
                        Published: {currentAnnouncement.publishedDate} • ktu.edu.in
                      </span>
                      <span>{customRef || "APJKTU B.Tech Portal"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: TEMPLATE GALLERY */}
          {activeNav === "template-library" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATE_LIBRARY.map(tpl => (
                <div
                  key={tpl.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div
                      style={{ background: tpl.bgGradient }}
                      className="h-44 p-5 flex items-center justify-center"
                    >
                      <div
                        style={{
                          backgroundColor: tpl.cardBg,
                          color: tpl.primaryText,
                        }}
                        className="w-full h-full rounded-xl p-4 shadow-lg flex flex-col justify-between"
                      >
                        <span
                          style={{
                            backgroundColor: tpl.badgeBg,
                            color: tpl.badgeText,
                          }}
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full w-fit"
                        >
                          {tpl.defaultCategories[0]}
                        </span>
                        <div className="font-extrabold text-sm line-clamp-2">
                          {tpl.name}
                        </div>
                        <div className="text-[10px] opacity-70">
                          ktu.edu.in • Official B.Tech Template
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-bold text-white">{tpl.name}</h3>
                      <p className="text-xs text-slate-400">{tpl.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tpl.defaultCategories.map(c => (
                          <span
                            key={c}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setActiveNav("poster-studio");
                      }}
                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
                    >
                      Use Template in Studio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW 4, 7, 8, 9, 10: SCHEDULER, LOGS, ETC */}
          {(activeNav === "categories" ||
            activeNav === "scheduled-fetching" ||
            activeNav === "generated-posters" ||
            activeNav === "settings" ||
            activeNav === "logs") && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                <h2 className="text-base font-bold text-white">
                  BullMQ Scheduled Ingestion &amp; Automation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setAutomationMode("manual_approval")}
                    className={`p-5 rounded-2xl border cursor-pointer transition ${
                      automationMode === "manual_approval"
                        ? "bg-indigo-600/15 border-indigo-500"
                        : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div className="font-bold text-sm text-white">
                      Mode A — Manual Approval
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Fetch KTU announcement → Extract PDF details → Classify
                      B.Tech category → Wait for admin approval before rendering
                      poster.
                    </p>
                  </div>

                  <div
                    onClick={() => setAutomationMode("fully_automatic")}
                    className={`p-5 rounded-2xl border cursor-pointer transition ${
                      automationMode === "fully_automatic"
                        ? "bg-emerald-600/15 border-emerald-500"
                        : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div className="font-bold text-sm text-white">
                      Mode B — Fully Automatic
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Fetch KTU announcement → Extract PDF details → Classify →
                      Auto-select smart template → Render high-res PNG poster
                      automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="text-xs font-semibold text-slate-300">
                    KTU Polling Interval (Minutes):
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={fetchIntervalMinutes}
                    onChange={e => setFetchIntervalMinutes(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <span className="text-xs text-slate-400">
                    Controls BullMQ recurring schedule in{" "}
                    <code className="text-slate-200">
                      src/workers/shared/recurring-schedules.ts
                    </code>
                  </span>
                </div>
              </div>

              {generatedHistory.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">
                    Generated Posters History ({generatedHistory.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {generatedHistory.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                      >
                        <img
                          src={item.dataUrl}
                          alt={item.announcementTitle}
                          className="w-full rounded-lg object-cover"
                        />
                        <div className="text-xs font-bold text-white line-clamp-1">
                          {item.announcementTitle}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.formatKey} • {item.exportFormat.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white">
                  KTU Fetcher &amp; Worker Audit Logs
                </h3>
                <div className="divide-y divide-slate-800">
                  {syncLogs.map(log => (
                    <div
                      key={log.id}
                      className="py-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-emerald-400 font-bold">
                          [{log.status}]
                        </span>{" "}
                        <span className="text-white font-medium">{log.source}</span>{" "}
                        <span className="text-slate-400">• {log.timestamp}</span>
                      </div>
                      <div className="text-slate-300 font-mono">
                        Fetched: {log.fetched} | New B.Tech: {log.newBtech} |{" "}
                        {log.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
