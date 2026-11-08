import type { Job } from "bullmq";
import fs from "node:fs/promises";
import path from "node:path";
import type { PosterGenerationJobData } from "./queue.js";
import type { DatabaseInstance } from "../../db/types.js";
import { PosterPlatformRepository } from "../../db/repositories/poster-platform-repository.js";
import { PREDEFINED_POSTER_TEMPLATES } from "../../poster-engine/templates-seed.js";
import { selectTemplateForAnnouncement } from "../../poster-engine/smart-selector.js";
import { renderPosterSvg } from "../../poster-engine/exporter.js";
import {
  POSTER_DIMENSIONS,
  type PosterAspectFormat,
} from "../../poster-engine/renderer.js";
import logger from "../../utils/logger.js";

export interface PosterWorkerDeps {
  dbInstance: DatabaseInstance;
  storageDir?: string | undefined;
}

export function createPosterGenerationProcessor(deps: PosterWorkerDeps) {
  const posterRepo = new PosterPlatformRepository(deps.dbInstance);
  const storageDir = deps.storageDir || "./storage/posters";

  return async function processPosterGeneration(
    job: Job<PosterGenerationJobData>
  ): Promise<{ posterId: number; fileUrl: string }> {
    const { announcementId, templateId, format = "instagram_portrait", generationMode, overrides } =
      job.data;

    logger.info(
      { jobId: job.id, announcementId, format, generationMode },
      "Processing poster generation background job"
    );

    const announcement = await posterRepo.getAnnouncementById(announcementId);
    if (!announcement) {
      throw new Error(`Announcement #${announcementId} not found in database`);
    }

    // 1. Resolve template
    let template =
      (templateId
        ? (await posterRepo.getTemplateById(templateId)) ||
          PREDEFINED_POSTER_TEMPLATES.find(t => t.id === templateId)
        : null) ||
      (announcement.suggestedTemplateId
        ? (await posterRepo.getTemplateById(announcement.suggestedTemplateId)) ||
          PREDEFINED_POSTER_TEMPLATES.find(t => t.id === announcement.suggestedTemplateId)
        : null) ||
      selectTemplateForAnnouncement({
        title: announcement.title,
        category: announcement.category,
      });

    if (!template) {
      template = PREDEFINED_POSTER_TEMPLATES[0]!;
    }

    const dims = POSTER_DIMENSIONS[format];

    // 2. Render SVG file
    const svgContent = renderPosterSvg({
      template,
      announcement,
      format,
      overrides,
    });

    // 3. Write file to storage
    await fs.mkdir(storageDir, { recursive: true });
    const filename = `poster-${announcement.announcementId}-${format}.svg`;
    const filePath = path.join(storageDir, filename);
    await fs.writeFile(filePath, svgContent, "utf-8");

    const fileUrl = `/storage/posters/${filename}`;

    // 4. Save to generatedPosters table
    const created = await posterRepo.createPoster({
      announcementId: announcement.announcementId,
      templateId: template.id,
      formatKey: format as PosterAspectFormat,
      width: dims.width,
      height: dims.height,
      exportFormat: "png",
      renderedFields: {
        title: overrides?.customTitle || announcement.title,
        category: overrides?.customCategory || announcement.category,
        publishedDate: announcement.publishedDate,
      },
      customOverrides: {
        fontSizeScale: 1.0,
        textAlign: "left",
        logoPosition: "top-left",
        accentColor: overrides?.accentColor,
      },
      fileUrl,
      generationMode,
    });

    if (!created) {
      throw new Error(`Failed to record generated poster for announcement #${announcementId}`);
    }

    // 5. Update enrichment status to generated
    await posterRepo.updateEnrichment(announcement.id, {
      posterStatus: "generated",
    });

    logger.info(
      {
        jobId: job.id,
        posterId: created.id,
        announcementId,
        templateId: template.id,
        format,
        fileUrl,
      },
      "Poster successfully generated and stored"
    );

    return { posterId: created.id, fileUrl };
  };
}
