import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import crypto from "node:crypto";
import fs from "node:fs";
import { DatabaseInstance } from "../db/types.js";
import { PosterPlatformRepository } from "../db/repositories/poster-platform-repository.js";
import { AnnouncementsRepository } from "../db/repositories/announcements-repository.js";
import { fetchAnnouncements } from "../api/services/ktu/fetch-announcements.js";
import {
  BTechCategory,
  BTECH_CATEGORIES,
  syncAuditLogs,
  announcementEnrichments,
} from "../db/schema/poster-platform.js";
import {
  CATEGORY_METADATA,
  CATEGORY_TO_TEMPLATE_MAP,
} from "../constants/categories.js";
import { PREDEFINED_POSTER_TEMPLATES } from "../poster-engine/templates-seed.js";
import {
  renderPosterSvg,
  exportPosterBuffer,
} from "../poster-engine/exporter.js";
import {
  renderPosterHtmlDocument,
  POSTER_DIMENSIONS,
  type PosterAspectFormat,
} from "../poster-engine/renderer.js";
import { selectTemplateForAnnouncement } from "../poster-engine/smart-selector.js";
import findCourseFiltersFromText from "../utils/find-course-filters-from-text.js";
import { AnnouncementFilter } from "../constants/courses.js";
import logger from "../utils/logger.js";
import { eq } from "drizzle-orm";

export function createWebApiServer(dbInstance: DatabaseInstance) {
  const app = new Hono();
  const posterRepo = new PosterPlatformRepository(dbInstance);
  const announcementsRepo = new AnnouncementsRepository(dbInstance);

  // Ensure storage directory exists
  try {
    fs.mkdirSync("./storage/posters", { recursive: true });
  } catch {
    // Directory may already exist
  }

  // Middlewares
  app.use("*", cors());

  app.use("/*", async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    logger.info(
      { method: c.req.method, path: c.req.path, status: c.res.status, duration },
      "Web API request"
    );
  });

  // Serve static generated posters
  app.use("/static/posters/*", serveStatic({ root: "./storage/posters" }));

  // Health check
  app.get("/health", c => {
    return c.json({
      status: "ok",
      service: "ktu-btech-web-platform-api",
      timestamp: new Date().toISOString(),
    });
  });

  // 1. Dashboard Overview Metrics
  app.get("/api/dashboard/stats", async c => {
    try {
      const stats = await posterRepo.getDashboardStats();
      return c.json(stats);
    } catch (err) {
      logger.error({ err }, "Failed to fetch dashboard stats");
      return c.json({ error: "Failed to fetch dashboard stats" }, 500);
    }
  });

  // 2. Announcements List, Search & Filter
  app.get("/api/announcements", async c => {
    try {
      const category = c.req.query("category");
      const semester = c.req.query("semester");
      const academicYear = c.req.query("academicYear");
      const posterStatus = c.req.query("posterStatus");
      const search = c.req.query("search");
      const btechOnlyQuery = c.req.query("btechOnly");
      const btechOnly = btechOnlyQuery !== undefined ? btechOnlyQuery === "true" : true;
      const page = Math.max(1, parseInt(c.req.query("page") || "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "50", 10)));

      const result = await posterRepo.getAnnouncements({
        category,
        semester,
        academicYear,
        posterStatus,
        search,
        btechOnly,
        page,
        limit,
      });

      return c.json(result);
    } catch (err) {
      logger.error({ err }, "Failed to fetch announcements");
      return c.json({ error: "Failed to fetch announcements" }, 500);
    }
  });

  // 3. Single Announcement Details
  app.get("/api/announcements/:id", async c => {
    try {
      const id = parseInt(c.req.param("id"), 10);
      if (isNaN(id)) {
        return c.json({ error: "Invalid announcement ID" }, 400);
      }

      const announcement = await posterRepo.getAnnouncementById(id);
      if (!announcement) {
        return c.json({ error: "Announcement not found" }, 404);
      }

      return c.json(announcement);
    } catch (err) {
      logger.error({ err }, "Failed to fetch announcement details");
      return c.json({ error: "Failed to fetch announcement details" }, 500);
    }
  });

  // 4. Update Announcement Metadata / Category Manual Override
  app.patch("/api/announcements/:id", async c => {
    try {
      const id = parseInt(c.req.param("id"), 10);
      if (isNaN(id)) {
        return c.json({ error: "Invalid announcement ID" }, 400);
      }

      const body = (await c.req.json()) as {
        category?: BTechCategory;
        semester?: string | null;
        academicYear?: string | null;
        extractedDetails?: Partial<typeof announcementEnrichments.$inferSelect.extractedDetails>;
        processingStatus?: "pending" | "processing" | "completed" | "failed" | "archived";
        posterStatus?: "not_generated" | "pending_approval" | "generating" | "generated" | "failed";
      };

      const suggestedTemplateId = body.category
        ? CATEGORY_TO_TEMPLATE_MAP[body.category]
        : undefined;

      const updated = await posterRepo.updateEnrichment(id, {
        category: body.category,
        suggestedTemplateId,
        semester: body.semester,
        academicYear: body.academicYear,
        extractedDetails: body.extractedDetails,
        processingStatus: body.processingStatus,
        posterStatus: body.posterStatus,
      });

      if (!updated) {
        return c.json({ error: "Announcement enrichment record not found" }, 404);
      }

      return c.json(updated);
    } catch (err) {
      logger.error({ err }, "Failed to update announcement enrichment");
      return c.json({ error: "Failed to update announcement" }, 500);
    }
  });

  // 5. Trigger Official KTU Announcement Fetch & Classification Now
  app.post("/api/announcements/fetch-now", async c => {
    const startedAt = Date.now();
    try {
      const ktuItems = await fetchAnnouncements({
        pageNumber: 0,
        dataSize: 25,
      });

      let newBtechCount = 0;
      let updatedCount = 0;

      // 1. Persist raw announcements in the existing announcements table
      const transformedAnnouncements = ktuItems.map(item =>
        AnnouncementsRepository.transformFromApi(item)
      );
      await announcementsRepo.bulkUpsert(transformedAnnouncements);

      // 2. Enrich & classify announcements
      for (const item of ktuItems) {
        const fullText = `${item.subject} ${item.message || ""}`;
        const courses = findCourseFiltersFromText(fullText);
        const isBtech = courses.has(AnnouncementFilter.BTECH) || courses.has(AnnouncementFilter.ALL);

        const contentHash = crypto
          .createHash("sha256")
          .update(`${item.id}-${item.subject}-${item.message || ""}`)
          .digest("hex");

        const existing = await dbInstance
          .select()
          .from(announcementEnrichments)
          .where(eq(announcementEnrichments.announcementId, item.id))
          .limit(1);

        // Simple deterministic category classification
        let category: BTechCategory = "Other Notifications";
        const lower = fullText.toLowerCase();
        if (lower.includes("result") || lower.includes("grade card")) {
          category = "Examination Results";
        } else if (lower.includes("revaluation") || lower.includes("scrutiny")) {
          category = "Revaluation";
        } else if (lower.includes("time table") || lower.includes("timetable")) {
          category = "Time Table";
        } else if (lower.includes("registration")) {
          category = "Registration";
        } else if (lower.includes("supplementary")) {
          category = "Supplementary Examinations";
        } else if (lower.includes("fee") || lower.includes("remittance")) {
          category = "Fee Notifications";
        } else if (lower.includes("calendar")) {
          category = "Academic Calendar";
        } else if (lower.includes("circular")) {
          category = "Circulars";
        } else if (lower.includes("exam") || lower.includes("examination")) {
          category = "Examination Notifications";
        }

        const suggestedTemplateId = CATEGORY_TO_TEMPLATE_MAP[category] || "minimal-academic";

        const extractedDetails = {
          mainHeading: item.subject,
          shortTitle: item.subject.length > 80 ? `${item.subject.slice(0, 77)}...` : item.subject,
          importantDate: item.formattedPublishedDate,
          registrationDeadline: null,
          examinationDate: null,
          semester: null,
          academicYear: null,
          scheme: null,
          officialReference: null,
          importantInstructions: item.message ? [item.message.slice(0, 160)] : [],
          pdfExtractedTextSnippet: null,
        };

        if (existing.length === 0) {
          if (isBtech) newBtechCount++;
          await dbInstance.insert(announcementEnrichments).values({
            announcementId: item.id,
            externalKtuId: `KTU-${item.id}`,
            isBtechRelevant: isBtech,
            category,
            shortDescription: item.message ? item.message.slice(0, 240) : "",
            fullDescription: item.message || "",
            sourceUrl: "https://ktu.edu.in/Menu/announcements",
            originalPdfUrl: item.attachments[0]
              ? `/api/announcements/${item.id}/attachment/${item.attachments[0].encryptId}`
              : null,
            extractedDetails,
            processingStatus: "completed",
            posterStatus: "not_generated",
            suggestedTemplateId,
            contentHash,
          });
        } else if (existing[0] && existing[0].contentHash !== contentHash) {
          updatedCount++;
          await dbInstance
            .update(announcementEnrichments)
            .set({
              shortDescription: item.message ? item.message.slice(0, 240) : "",
              fullDescription: item.message || "",
              extractedDetails,
              contentHash,
              updatedAt: new Date(),
            })
            .where(eq(announcementEnrichments.id, existing[0].id));
        }
      }

      const durationMs = Date.now() - startedAt;

      const [log] = await dbInstance
        .insert(syncAuditLogs)
        .values({
          sourceName: "KTU Official Portal (/anon/announcemnts)",
          status: "success",
          fetchedCount: ktuItems.length,
          newBtechCount,
          updatedCount,
          postersTriggered: 0,
          durationMs,
        })
        .returning();

      return c.json({
        status: "ok",
        fetchedCount: ktuItems.length,
        newBtechCount,
        updatedCount,
        log,
      });
    } catch (err: unknown) {
      const durationMs = Date.now() - startedAt;
      const detail = err instanceof Error ? err.message : String(err);
      logger.error({ err }, "Manual KTU fetch failed");

      await dbInstance.insert(syncAuditLogs).values({
        sourceName: "KTU Official Portal (/anon/announcemnts)",
        status: "failed",
        fetchedCount: 0,
        newBtechCount: 0,
        updatedCount: 0,
        postersTriggered: 0,
        durationMs,
        errorMessage: detail,
      });

      return c.json({ error: "Failed to fetch from KTU API", detail }, 502);
    }
  });

  // 6. Categories List & Metadata
  app.get("/api/categories", c => {
    return c.json({
      categories: BTECH_CATEGORIES,
      metadata: CATEGORY_METADATA,
    });
  });

  // 7. Templates List & Details
  app.get("/api/templates", async c => {
    try {
      const templates = await posterRepo.getTemplates();
      if (templates.length > 0) {
        return c.json(templates);
      }
      return c.json(PREDEFINED_POSTER_TEMPLATES);
    } catch (err) {
      logger.error({ err }, "Failed to fetch templates");
      return c.json(PREDEFINED_POSTER_TEMPLATES);
    }
  });

  app.get("/api/templates/:id", async c => {
    const id = c.req.param("id");
    const tpl =
      (await posterRepo.getTemplateById(id)) ||
      PREDEFINED_POSTER_TEMPLATES.find(t => t.id === id);
    if (!tpl) {
      return c.json({ error: "Template not found" }, 404);
    }
    return c.json(tpl);
  });

  // 8. Generated Posters
  app.get("/api/posters", async c => {
    try {
      const posters = await posterRepo.getPosters();
      return c.json(posters);
    } catch (err) {
      logger.error({ err }, "Failed to fetch generated posters");
      return c.json({ error: "Failed to fetch generated posters" }, 500);
    }
  });

  app.get("/api/posters/:id", async c => {
    const id = parseInt(c.req.param("id"), 10);
    if (isNaN(id)) return c.json({ error: "Invalid poster ID" }, 400);

    const poster = await posterRepo.getPosterById(id);
    if (!poster) return c.json({ error: "Poster not found" }, 404);
    return c.json(poster);
  });

  // 9. Generate & Save Poster
  app.post("/api/posters/generate", async c => {
    try {
      const body = (await c.req.json()) as {
        announcementId: number;
        templateId?: string;
        format?: PosterAspectFormat;
        overrides?: {
          customTitle?: string;
          customSubtitle?: string;
          customCategory?: BTechCategory;
          accentColor?: string;
          customSemester?: string;
          customAcademicYear?: string;
          customDeadline?: string;
          customExamDate?: string;
          customRef?: string;
        };
      };

      const announcement = await posterRepo.getAnnouncementById(body.announcementId);
      if (!announcement) {
        return c.json({ error: "Announcement not found" }, 404);
      }

      const format: PosterAspectFormat = body.format || "instagram_portrait";
      let template =
        (body.templateId
          ? (await posterRepo.getTemplateById(body.templateId)) ||
            PREDEFINED_POSTER_TEMPLATES.find(t => t.id === body.templateId)
          : null) ||
        (announcement.suggestedTemplateId
          ? (await posterRepo.getTemplateById(announcement.suggestedTemplateId)) ||
            PREDEFINED_POSTER_TEMPLATES.find(t => t.id === announcement.suggestedTemplateId)
          : null) ||
        selectTemplateForAnnouncement({
          title: announcement.title,
          category: announcement.category,
        });

      const dims = POSTER_DIMENSIONS[format];

      const created = await posterRepo.createPoster({
        announcementId: announcement.announcementId,
        templateId: template.id,
        formatKey: format,
        width: dims.width,
        height: dims.height,
        exportFormat: "png",
        renderedFields: {
          title: body.overrides?.customTitle || announcement.title,
          category: body.overrides?.customCategory || announcement.category,
          publishedDate: announcement.publishedDate,
        },
        customOverrides: {
          fontSizeScale: 1.0,
          textAlign: "left",
          logoPosition: "top-left",
          ...(body.overrides ?? {}),
        },
        fileUrl: `/api/posters/render-svg?announcementId=${announcement.announcementId}&format=${format}`,
        generationMode: "manual",
      });

      return c.json(created, 201);
    } catch (err) {
      logger.error({ err }, "Failed to generate poster");
      return c.json({ error: "Failed to generate poster" }, 500);
    }
  });

  // 10. Render Poster (SVG or HTML)
  app.get("/api/posters/:id/render", async c => {
    try {
      const id = parseInt(c.req.param("id"), 10);
      if (isNaN(id)) return c.json({ error: "Invalid poster ID" }, 400);

      const poster = await posterRepo.getPosterById(id);
      if (!poster) return c.json({ error: "Poster not found" }, 404);

      const announcement = await posterRepo.getAnnouncementById(poster.announcementId);
      if (!announcement) return c.json({ error: "Announcement not found" }, 404);

      const template =
        (await posterRepo.getTemplateById(poster.templateId)) ||
        PREDEFINED_POSTER_TEMPLATES.find(t => t.id === poster.templateId) ||
        PREDEFINED_POSTER_TEMPLATES[0]!;

      const renderType = c.req.query("type") || "svg";

      if (renderType === "html") {
        const html = renderPosterHtmlDocument({
          template,
          format: poster.formatKey,
          placeholders: {
            TITLE: announcement.title,
            DESCRIPTION: announcement.shortDescription,
            CATEGORY: announcement.category,
            PUBLISHED_DATE: announcement.publishedDate,
            SEMESTER: announcement.semester ?? undefined,
            ACADEMIC_YEAR: announcement.academicYear ?? undefined,
            DEADLINE: announcement.registrationDeadline ?? undefined,
            EXAM_DATE: announcement.examinationDate ?? undefined,
            OFFICIAL_REF: announcement.officialReference ?? undefined,
          },
        });
        return c.html(html);
      }

      const svg = renderPosterSvg({
        template,
        announcement,
        format: poster.formatKey,
      });

      c.header("Content-Type", "image/svg+xml; charset=utf-8");
      return c.body(svg);
    } catch (err) {
      logger.error({ err }, "Failed to render poster");
      return c.json({ error: "Failed to render poster" }, 500);
    }
  });

  // 11. Approve Poster
  app.post("/api/posters/:id/approve", async c => {
    try {
      const id = parseInt(c.req.param("id"), 10);
      if (isNaN(id)) return c.json({ error: "Invalid poster ID" }, 400);

      const approved = await posterRepo.approvePoster(id);
      if (!approved) return c.json({ error: "Poster not found" }, 404);

      return c.json({ status: "approved", poster: approved });
    } catch (err) {
      logger.error({ err }, "Failed to approve poster");
      return c.json({ error: "Failed to approve poster" }, 500);
    }
  });

  // 12. Direct Studio Export
  app.post("/api/posters/export", async c => {
    try {
      const body = (await c.req.json()) as {
        templateId: string;
        format: PosterAspectFormat;
        announcement: {
          id: number;
          title: string;
          category: BTechCategory;
          shortDescription?: string;
          publishedDate: string;
          extractedDetails?: {
            semester?: string | null;
            academicYear?: string | null;
            registrationDeadline?: string | null;
            examinationDate?: string | null;
            officialReference?: string | null;
          };
        };
        overrides?: {
          customTitle?: string;
          customSubtitle?: string;
          customCategory?: BTechCategory;
          accentColor?: string;
          customSemester?: string;
          customAcademicYear?: string;
          customDeadline?: string;
          customExamDate?: string;
          customRef?: string;
        };
      };

      const template =
        (await posterRepo.getTemplateById(body.templateId)) ||
        PREDEFINED_POSTER_TEMPLATES.find(t => t.id === body.templateId) ||
        PREDEFINED_POSTER_TEMPLATES[0]!;

      const result = await exportPosterBuffer({
        template,
        announcement: body.announcement,
        format: body.format || "instagram_portrait",
        overrides: body.overrides,
      });

      c.header("Content-Type", result.mimeType);
      c.header("Content-Disposition", `attachment; filename="${result.filename}"`);
      return c.body(new Uint8Array(result.data));
    } catch (err) {
      logger.error({ err }, "Failed to export poster");
      return c.json({ error: "Failed to export poster" }, 500);
    }
  });

  // 9. Scheduler & Platform Settings
  app.get("/api/settings/scheduler", async c => {
    try {
      const settings = await posterRepo.getSettings();
      return c.json(settings);
    } catch (err) {
      logger.error({ err }, "Failed to fetch scheduler settings");
      return c.json({ error: "Failed to fetch scheduler settings" }, 500);
    }
  });

  app.put("/api/settings/scheduler", async c => {
    try {
      const body = (await c.req.json()) as {
        fetchIntervalMinutes?: number;
        posterGenerationMode?: "manual_approval" | "fully_automatic";
        defaultExportFormat?: "instagram_portrait" | "instagram_story" | "square_post" | "landscape";
        btechOnlyFilter?: boolean;
      };
      const updated = await posterRepo.updateSettings({
        fetchIntervalMinutes: body.fetchIntervalMinutes,
        posterGenerationMode: body.posterGenerationMode,
        defaultExportFormat: body.defaultExportFormat,
        btechOnlyFilter: body.btechOnlyFilter,
      });
      return c.json(updated);
    } catch (err) {
      logger.error({ err }, "Failed to update scheduler settings");
      return c.json({ error: "Failed to update scheduler settings" }, 500);
    }
  });

  // 10. Sync Audit Logs
  app.get("/api/sync/audit-logs", async c => {
    try {
      const logs = await posterRepo.getAuditLogs();
      return c.json(logs);
    } catch (err) {
      logger.error({ err }, "Failed to fetch audit logs");
      return c.json({ error: "Failed to fetch audit logs" }, 500);
    }
  });

  return app;
}
