import { Hono } from "hono";
import { handle } from "hono/vercel";
import { BTECH_CATEGORIES } from "../src/db/schema/poster-platform.js";
import {
  CATEGORY_METADATA,
  CATEGORY_TO_TEMPLATE_MAP,
} from "../src/constants/categories.js";
import { PREDEFINED_POSTER_TEMPLATES } from "../src/poster-engine/templates-seed.js";
import { exportPosterBuffer } from "../src/poster-engine/exporter.js";
import type { PosterAspectFormat } from "../src/poster-engine/renderer.js";

const app = new Hono().basePath("/api");

app.get("/health", c => {
  return c.json({
    status: "ok",
    service: "ktu-btech-poster-platform-vercel",
    runtime: "vercel-serverless",
    timestamp: new Date().toISOString(),
  });
});

app.get("/categories", c => {
  return c.json({
    categories: BTECH_CATEGORIES,
    metadata: CATEGORY_METADATA,
  });
});

app.get("/templates", c => {
  return c.json(PREDEFINED_POSTER_TEMPLATES);
});

app.get("/templates/:id", c => {
  const id = c.req.param("id");
  const tpl = PREDEFINED_POSTER_TEMPLATES.find(t => t.id === id);
  if (!tpl) return c.json({ error: "Template not found" }, 404);
  return c.json(tpl);
});

app.get("/announcements", async c => {
  try {
    const res = await fetch(
      "https://api.ktu.edu.in/ktu-web-portal-api/anon/announcemnts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        body: JSON.stringify({ pageNumber: 0, dataSize: 25 }),
      }
    );

    if (res.ok) {
      const data = (await res.json()) as { content?: Record<string, unknown>[] };
      const items = (data.content || []).map((item, idx: number) => {
        const subject = String(item["subject"] || "");
        const message = String(item["message"] || "");
        const fullText = `${subject} ${message}`;
        let category = "Other Notifications";
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

        const suggestedTemplateId =
          CATEGORY_TO_TEMPLATE_MAP[category as keyof typeof CATEGORY_TO_TEMPLATE_MAP] ||
          "minimal-academic";

        return {
          id: Number(item["id"] || 1000 + idx),
          announcementId: Number(item["id"] || 1000 + idx),
          title: subject,
          shortDescription: message ? message.slice(0, 240) : "",
          fullDescription: message,
          category,
          publishedDate: String(item["formattedPublishedDate"] || "Recent"),
          posterStatus: "not_generated",
          suggestedTemplateId,
          attachments: (item["attachments"] as unknown[]) || [],
        };
      });

      return c.json({
        items,
        pagination: { total: items.length, page: 1, limit: 25, totalPages: 1 },
      });
    }
  } catch {
    // Falls back gracefully
  }

  return c.json({
    items: [],
    pagination: { total: 0, page: 1, limit: 25, totalPages: 1 },
  });
});

app.post("/posters/export", async c => {
  try {
    const body = (await c.req.json()) as {
      templateId: string;
      format: PosterAspectFormat;
      announcement: {
        id: number;
        title: string;
        category: string;
        shortDescription?: string | undefined;
        publishedDate: string;
        extractedDetails?: {
          semester?: string | null | undefined;
          academicYear?: string | null | undefined;
          registrationDeadline?: string | null | undefined;
          examinationDate?: string | null | undefined;
          officialReference?: string | null | undefined;
        } | undefined;
      };
      overrides?: {
        customTitle?: string | undefined;
        customSubtitle?: string | undefined;
        customCategory?: string | undefined;
        accentColor?: string | undefined;
        fontSize?: number | undefined;
      } | undefined;
    };

    const template =
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: "Failed to export poster", message }, 500);
  }
});

export default handle(app);

