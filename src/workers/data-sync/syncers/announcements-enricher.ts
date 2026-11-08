import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import type { Announcement } from "../../../types/service.types.js";
import type { DatabaseInstance } from "../../../db/types.js";
import {
  announcementEnrichments,
  platformSettings,
} from "../../../db/schema/poster-platform.js";
import { classifyBTechAnnouncement } from "../../../api/services/classifier/btech-classifier.js";
import { enqueuePosterGeneration } from "../../poster-generation/queue.js";
import logger from "../../../utils/logger.js";

export async function enrichAndClassifySyncedAnnouncements(
  items: Announcement[],
  db: DatabaseInstance
): Promise<{ enrichedCount: number; postersEnqueued: number }> {
  let enrichedCount = 0;
  let postersEnqueued = 0;

  // Retrieve current platform settings
  const [settings] = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, 1))
    .limit(1);

  const generationMode = settings?.posterGenerationMode ?? "manual_approval";
  const isAutoMode = generationMode === "fully_automatic";

  for (const item of items) {
    try {
      const fullText = `${item.subject} ${item.message || ""}`;
      const contentHash = crypto
        .createHash("sha256")
        .update(`${item.id}-${item.subject}-${item.message || ""}`)
        .digest("hex");

      const existing = await db
        .select()
        .from(announcementEnrichments)
        .where(eq(announcementEnrichments.announcementId, item.id))
        .limit(1);

      if (existing.length > 0 && existing[0]?.contentHash === contentHash) {
        // Content hasn't changed; skip
        continue;
      }

      // Classify B.Tech category and extract structured details
      const classified = classifyBTechAnnouncement(fullText, item.attachments.length > 0);

      // Mode A vs Mode B
      let posterStatus: "not_generated" | "pending_approval" | "generating" | "generated" =
        "not_generated";

      if (classified.isBtechRelevant) {
        posterStatus = isAutoMode ? "generating" : "pending_approval";
      }

      const extractedDetails = {
        mainHeading: item.subject,
        shortTitle:
          item.subject.length > 80 ? `${item.subject.slice(0, 77)}...` : item.subject,
        importantDate: item.formattedPublishedDate,
        registrationDeadline: classified.extractedDetails.registrationDeadline,
        examinationDate: classified.extractedDetails.examinationDate,
        semester: classified.extractedDetails.semester,
        academicYear: classified.extractedDetails.academicYear,
        scheme: classified.extractedDetails.scheme,
        officialReference: classified.extractedDetails.officialReference,
        importantInstructions: item.message ? [item.message.slice(0, 160)] : [],
        pdfExtractedTextSnippet: null,
      };

      if (existing.length === 0) {
        await db.insert(announcementEnrichments).values({
          announcementId: item.id,
          externalKtuId: `KTU-${item.id}`,
          isBtechRelevant: classified.isBtechRelevant,
          category: classified.category,
          shortDescription: item.message ? item.message.slice(0, 240) : "",
          fullDescription: item.message || "",
          sourceUrl: "https://ktu.edu.in/Menu/announcements",
          originalPdfUrl: item.attachments[0]
            ? `/api/announcements/${item.id}/attachment/${item.attachments[0].encryptId}`
            : null,
          extractedDetails,
          processingStatus: "completed",
          posterStatus,
          suggestedTemplateId: classified.suggestedTemplateId,
          contentHash,
        });
        enrichedCount++;
      } else if (existing[0]) {
        await db
          .update(announcementEnrichments)
          .set({
            category: classified.category,
            shortDescription: item.message ? item.message.slice(0, 240) : "",
            fullDescription: item.message || "",
            extractedDetails,
            contentHash,
            updatedAt: new Date(),
          })
          .where(eq(announcementEnrichments.id, existing[0].id));
        enrichedCount++;
      }

      // If Mode B (fully automatic), trigger background poster generation
      if (isAutoMode && classified.isBtechRelevant) {
        try {
          await enqueuePosterGeneration({
            announcementId: item.id,
            templateId: classified.suggestedTemplateId,
            generationMode: "auto",
          });
          postersEnqueued++;
        } catch (enqueueErr) {
          logger.warn(
            { err: enqueueErr, announcementId: item.id },
            "Failed to enqueue auto poster generation job"
          );
        }
      }
    } catch (err) {
      logger.error(
        { err, announcementId: item.id },
        "Error during announcement enrichment and classification"
      );
    }
  }

  logger.info(
    { totalChecked: items.length, enrichedCount, postersEnqueued, generationMode },
    "Completed announcement enrichment and poster trigger check"
  );

  return { enrichedCount, postersEnqueued };
}

