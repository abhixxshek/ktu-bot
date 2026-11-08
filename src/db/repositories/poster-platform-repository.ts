import { eq, desc, and, count, gte, ilike, or } from "drizzle-orm";
import { DatabaseInstance } from "../types.js";
import {
  announcementEnrichments,
  posterTemplates,
  generatedPosters,
  platformSettings,
  syncAuditLogs,
  BTechCategory,
  ExtractedAnnouncementDetails,
} from "../schema/poster-platform.js";
import { announcements } from "../schema/announcements.js";

export interface AnnouncementFilterOptions {
  category?: string | undefined;
  semester?: string | undefined;
  academicYear?: string | undefined;
  posterStatus?: string | undefined;
  search?: string | undefined;
  btechOnly?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export class PosterPlatformRepository {
  private db: DatabaseInstance;

  constructor(dbInstance: DatabaseInstance) {
    this.db = dbInstance;
  }

  async getDashboardStats() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalRes] = await this.db
      .select({ count: count() })
      .from(announcementEnrichments);
    const [thisWeekRes] = await this.db
      .select({ count: count() })
      .from(announcementEnrichments)
      .where(gte(announcementEnrichments.detectedAt, oneWeekAgo));
    const [postersRes] = await this.db
      .select({ count: count() })
      .from(generatedPosters);
    const [pendingRes] = await this.db
      .select({ count: count() })
      .from(announcementEnrichments)
      .where(eq(announcementEnrichments.posterStatus, "pending_approval"));
    const [failedRes] = await this.db
      .select({ count: count() })
      .from(announcementEnrichments)
      .where(eq(announcementEnrichments.processingStatus, "failed"));

    const recentLogs = await this.db
      .select()
      .from(syncAuditLogs)
      .orderBy(desc(syncAuditLogs.createdAt))
      .limit(10);

    const totalCount = Number(totalRes?.count ?? 0);
    const postersCount = Number(postersRes?.count ?? 0);

    return {
      totalAnnouncements: totalCount,
      newAnnouncements: totalCount - postersCount > 0 ? totalCount - postersCount : 0,
      announcementsThisWeek: Number(thisWeekRes?.count ?? 0),
      postersGenerated: postersCount,
      pendingApproval: Number(pendingRes?.count ?? 0),
      failedTasks: Number(failedRes?.count ?? 0),
      recentLogs,
    };
  }

  async getAnnouncements(options: AnnouncementFilterOptions = {}) {
    const {
      category,
      semester,
      academicYear,
      posterStatus,
      search,
      btechOnly = true,
      page = 1,
      limit = 50,
    } = options;

    const offset = (page - 1) * limit;
    const conditions = [];

    if (btechOnly) {
      conditions.push(eq(announcementEnrichments.isBtechRelevant, true));
    }
    if (category && category !== "ALL") {
      conditions.push(eq(announcementEnrichments.category, category as BTechCategory));
    }
    if (semester && semester !== "ALL") {
      conditions.push(eq(announcementEnrichments.semester, semester));
    }
    if (academicYear && academicYear !== "ALL") {
      conditions.push(eq(announcementEnrichments.academicYear, academicYear));
    }
    if (posterStatus && posterStatus !== "ALL") {
      conditions.push(
        eq(
          announcementEnrichments.posterStatus,
          posterStatus as "not_generated" | "pending_approval" | "generating" | "generated" | "failed"
        )
      );
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(announcementEnrichments.shortDescription, q),
          ilike(announcementEnrichments.fullDescription, q),
          ilike(announcements.subject, q)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRow] = await this.db
      .select({ count: count() })
      .from(announcementEnrichments)
      .leftJoin(announcements, eq(announcementEnrichments.announcementId, announcements.id))
      .where(whereClause);

    const rows = await this.db
      .select({
        enrichment: announcementEnrichments,
        announcement: announcements,
      })
      .from(announcementEnrichments)
      .leftJoin(announcements, eq(announcementEnrichments.announcementId, announcements.id))
      .where(whereClause)
      .orderBy(desc(announcementEnrichments.detectedAt))
      .limit(limit)
      .offset(offset);

    const total = Number(totalRow?.count ?? 0);

    return {
      items: rows.map(r => ({
        id: r.enrichment.id,
        announcementId: r.enrichment.announcementId,
        externalKtuId: r.enrichment.externalKtuId,
        title: r.announcement?.subject ?? r.enrichment.extractedDetails.mainHeading,
        shortDescription: r.enrichment.shortDescription ?? "",
        fullDescription: r.enrichment.fullDescription ?? r.announcement?.message ?? "",
        category: r.enrichment.category,
        isCategoryManualOverride: r.enrichment.isCategoryManualOverride,
        publishedDate: r.announcement?.publishedAt
          ? new Date(r.announcement.publishedAt).toISOString()
          : r.enrichment.extractedDetails.importantDate ?? "",
        academicYear: r.enrichment.academicYear,
        semester: r.enrichment.semester,
        scheme: r.enrichment.extractedDetails.scheme,
        registrationDeadline: r.enrichment.extractedDetails.registrationDeadline,
        examinationDate: r.enrichment.extractedDetails.examinationDate,
        officialReference: r.enrichment.extractedDetails.officialReference,
        importantInstructions: r.enrichment.extractedDetails.importantInstructions,
        sourceUrl: r.enrichment.sourceUrl,
        originalPdfUrl: r.enrichment.originalPdfUrl,
        detectedAt: r.enrichment.detectedAt,
        processingStatus: r.enrichment.processingStatus,
        posterStatus: r.enrichment.posterStatus,
        suggestedTemplateId: r.enrichment.suggestedTemplateId ?? "minimal-academic",
        attachments: r.announcement?.attachments ?? [],
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getAnnouncementById(id: number) {
    const rows = await this.db
      .select({
        enrichment: announcementEnrichments,
        announcement: announcements,
      })
      .from(announcementEnrichments)
      .leftJoin(announcements, eq(announcementEnrichments.announcementId, announcements.id))
      .where(
        or(
          eq(announcementEnrichments.id, id),
          eq(announcementEnrichments.announcementId, id)
        )
      )
      .limit(1);

    if (rows.length === 0 || !rows[0]) return null;

    const r = rows[0];
    const posters = await this.db
      .select()
      .from(generatedPosters)
      .where(eq(generatedPosters.announcementId, r.enrichment.announcementId));

    return {
      id: r.enrichment.id,
      announcementId: r.enrichment.announcementId,
      externalKtuId: r.enrichment.externalKtuId,
      title: r.announcement?.subject ?? r.enrichment.extractedDetails.mainHeading,
      shortDescription: r.enrichment.shortDescription ?? "",
      fullDescription: r.enrichment.fullDescription ?? r.announcement?.message ?? "",
      category: r.enrichment.category,
      isCategoryManualOverride: r.enrichment.isCategoryManualOverride,
      publishedDate: r.announcement?.publishedAt
        ? new Date(r.announcement.publishedAt).toISOString()
        : r.enrichment.extractedDetails.importantDate ?? "",
      academicYear: r.enrichment.academicYear,
      semester: r.enrichment.semester,
      scheme: r.enrichment.extractedDetails.scheme,
      registrationDeadline: r.enrichment.extractedDetails.registrationDeadline,
      examinationDate: r.enrichment.extractedDetails.examinationDate,
      officialReference: r.enrichment.extractedDetails.officialReference,
      importantInstructions: r.enrichment.extractedDetails.importantInstructions,
      sourceUrl: r.enrichment.sourceUrl,
      originalPdfUrl: r.enrichment.originalPdfUrl,
      detectedAt: r.enrichment.detectedAt,
      processingStatus: r.enrichment.processingStatus,
      posterStatus: r.enrichment.posterStatus,
      suggestedTemplateId: r.enrichment.suggestedTemplateId ?? "minimal-academic",
      attachments: r.announcement?.attachments ?? [],
      extractedDetails: r.enrichment.extractedDetails,
      posters,
    };
  }

  async updateEnrichment(
    id: number,
    patch: {
      category?: BTechCategory | undefined;
      suggestedTemplateId?: string | undefined;
      semester?: string | null | undefined;
      academicYear?: string | null | undefined;
      extractedDetails?: Partial<ExtractedAnnouncementDetails> | undefined;
      processingStatus?: "pending" | "processing" | "completed" | "failed" | "archived" | undefined;
      posterStatus?: "not_generated" | "pending_approval" | "generating" | "generated" | "failed" | undefined;
    }
  ) {
    const existing = await this.db
      .select()
      .from(announcementEnrichments)
      .where(eq(announcementEnrichments.id, id))
      .limit(1);

    if (existing.length === 0 || !existing[0]) return null;

    const current = existing[0];
    const newDetails: ExtractedAnnouncementDetails = {
      ...current.extractedDetails,
      ...(patch.extractedDetails ?? {}),
    };

    const [updated] = await this.db
      .update(announcementEnrichments)
      .set({
        category: patch.category ?? current.category,
        isCategoryManualOverride: patch.category !== undefined ? true : current.isCategoryManualOverride,
        suggestedTemplateId: patch.suggestedTemplateId ?? current.suggestedTemplateId,
        semester: patch.semester !== undefined ? patch.semester : current.semester,
        academicYear: patch.academicYear !== undefined ? patch.academicYear : current.academicYear,
        extractedDetails: newDetails,
        processingStatus: patch.processingStatus ?? current.processingStatus,
        posterStatus: patch.posterStatus ?? current.posterStatus,
        updatedAt: new Date(),
      })
      .where(eq(announcementEnrichments.id, id))
      .returning();

    return updated;
  }

  async getTemplates() {
    return this.db.select().from(posterTemplates).where(eq(posterTemplates.isActive, true));
  }

  async getTemplateById(id: string) {
    const [res] = await this.db
      .select()
      .from(posterTemplates)
      .where(eq(posterTemplates.id, id))
      .limit(1);
    return res ?? null;
  }

  async getPosters(limit = 100) {
    return this.db
      .select()
      .from(generatedPosters)
      .orderBy(desc(generatedPosters.createdAt))
      .limit(limit);
  }

  async getPosterById(id: number) {
    const [res] = await this.db
      .select()
      .from(generatedPosters)
      .where(eq(generatedPosters.id, id))
      .limit(1);
    return res ?? null;
  }

  async createPoster(data: typeof generatedPosters.$inferInsert) {
    const [created] = await this.db.insert(generatedPosters).values(data).returning();
    return created;
  }

  async approvePoster(posterId: number) {
    const [poster] = await this.db
      .select()
      .from(generatedPosters)
      .where(eq(generatedPosters.id, posterId))
      .limit(1);

    if (!poster) return null;

    // Update announcement enrichment poster status to "generated"
    await this.db
      .update(announcementEnrichments)
      .set({
        posterStatus: "generated",
        updatedAt: new Date(),
      })
      .where(eq(announcementEnrichments.announcementId, poster.announcementId));

    return poster;
  }

  async getSettings() {
    const [res] = await this.db.select().from(platformSettings).limit(1);
    return res ?? null;
  }

  async updateSettings(patch: {
    fetchIntervalMinutes?: number | undefined;
    posterGenerationMode?: "manual_approval" | "fully_automatic" | undefined;
    defaultExportFormat?: "instagram_portrait" | "instagram_story" | "square_post" | "landscape" | undefined;
    btechOnlyFilter?: boolean | undefined;
  }) {
    const [updated] = await this.db
      .update(platformSettings)
      .set({
        ...patch,
        updatedAt: new Date(),
      })
      .where(eq(platformSettings.id, 1))
      .returning();

    return updated;
  }

  async getAuditLogs(limit = 50) {
    return this.db
      .select()
      .from(syncAuditLogs)
      .orderBy(desc(syncAuditLogs.createdAt))
      .limit(limit);
  }
}
