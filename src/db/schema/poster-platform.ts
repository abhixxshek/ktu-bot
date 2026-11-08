import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { announcements } from "./announcements.js";

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

export interface ExtractedAnnouncementDetails {
  mainHeading: string;
  shortTitle: string;
  importantDate: string | null;
  registrationDeadline: string | null;
  examinationDate: string | null;
  semester: string | null;
  academicYear: string | null;
  scheme: string | null;
  officialReference: string | null;
  importantInstructions: string[];
  pdfExtractedTextSnippet: string | null;
}

export const announcementEnrichments = pgTable(
  "announcement_enrichments",
  {
    id: serial("id").primaryKey(),
    announcementId: integer("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    externalKtuId: varchar("external_ktu_id", { length: 128 }).notNull(),
    isBtechRelevant: boolean("is_btech_relevant").default(true).notNull(),
    category: varchar("category", { length: 64 })
      .$type<BTechCategory>()
      .default("Other Notifications")
      .notNull(),
    isCategoryManualOverride: boolean("is_category_manual_override")
      .default(false)
      .notNull(),
    shortDescription: text("short_description"),
    fullDescription: text("full_description"),
    academicYear: varchar("academic_year", { length: 32 }),
    semester: varchar("semester", { length: 32 }),
    sourceUrl: text("source_url").notNull(),
    originalPdfUrl: text("original_pdf_url"),
    extractedDetails: jsonb("extracted_details")
      .$type<ExtractedAnnouncementDetails>()
      .notNull(),
    processingStatus: varchar("processing_status", { length: 32 })
      .$type<"pending" | "processing" | "completed" | "failed" | "archived">()
      .default("pending")
      .notNull(),
    posterStatus: varchar("poster_status", { length: 32 })
      .$type<"not_generated" | "pending_approval" | "generating" | "generated" | "failed">()
      .default("not_generated")
      .notNull(),
    suggestedTemplateId: varchar("suggested_template_id", { length: 64 }),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    detectedAt: timestamp("detected_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => [
    uniqueIndex("enrichments_announcement_id_idx").on(table.announcementId),
    index("enrichments_category_idx").on(table.category),
    index("enrichments_poster_status_idx").on(table.posterStatus),
    index("enrichments_btech_idx").on(table.isBtechRelevant),
  ]
);

export const posterTemplates = pgTable("poster_templates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  styleKey: varchar("style_key", { length: 64 }).notNull(),
  description: text("description").notNull(),
  defaultCategories: jsonb("default_categories")
    .$type<BTechCategory[]>()
    .notNull(),
  designTokens: jsonb("design_tokens")
    .$type<{
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
    }>()
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const generatedPosters = pgTable(
  "generated_posters",
  {
    id: serial("id").primaryKey(),
    announcementId: integer("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    templateId: varchar("template_id", { length: 64 })
      .notNull()
      .references(() => posterTemplates.id),
    formatKey: varchar("format_key", { length: 32 })
      .$type<"instagram_portrait" | "instagram_story" | "square_post" | "landscape">()
      .notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    exportFormat: varchar("export_format", { length: 16 })
      .$type<"png" | "jpeg">()
      .default("png")
      .notNull(),
    renderedFields: jsonb("rendered_fields")
      .$type<Record<string, string>>()
      .notNull(),
    customOverrides: jsonb("custom_overrides")
      .$type<{
        fontSizeScale: number;
        textAlign: "left" | "center" | "right";
        accentColor?: string | undefined;
        backgroundOverride?: string | undefined;
        logoPosition: "top-left" | "top-right" | "bottom-right" | "hidden";
        customBgImageUrl?: string | undefined;
      }>()
      .notNull(),
    fileUrl: text("file_url").notNull(),
    generationMode: varchar("generation_mode", { length: 16 })
      .$type<"manual" | "auto">()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => [
    index("generated_posters_announcement_idx").on(table.announcementId),
  ]
);

export const platformSettings = pgTable("platform_settings", {
  id: integer("id").primaryKey().default(1),
  fetchIntervalMinutes: integer("fetch_interval_minutes").default(15).notNull(),
  posterGenerationMode: varchar("poster_generation_mode", { length: 32 })
    .$type<"manual_approval" | "fully_automatic">()
    .default("manual_approval")
    .notNull(),
  defaultExportFormat: varchar("default_export_format", { length: 32 })
    .$type<"instagram_portrait" | "instagram_story" | "square_post" | "landscape">()
    .default("instagram_portrait")
    .notNull(),
  btechOnlyFilter: boolean("btech_only_filter").default(true).notNull(),
  officialKtuSources: jsonb("official_ktu_sources")
    .$type<
      Array<{ id: string; name: string; endpoint: string; enabled: boolean }>
    >()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const syncAuditLogs = pgTable("sync_audit_logs", {
  id: serial("id").primaryKey(),
  sourceName: varchar("source_name", { length: 128 }).notNull(),
  status: varchar("status", { length: 32 })
    .$type<"success" | "partial" | "failed">()
    .notNull(),
  fetchedCount: integer("fetched_count").default(0).notNull(),
  newBtechCount: integer("new_btech_count").default(0).notNull(),
  updatedCount: integer("updated_count").default(0).notNull(),
  postersTriggered: integer("posters_triggered").default(0).notNull(),
  durationMs: integer("duration_ms").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

