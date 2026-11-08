import { createQueue } from "../shared/create-queue.js";
import type { PosterAspectFormat } from "../../poster-engine/renderer.js";
import logger from "../../utils/logger.js";

export const POSTER_GENERATION_QUEUE = "POSTER_GENERATION_QUEUE";

export interface PosterGenerationJobData {
  announcementId: number;
  templateId?: string | undefined;
  format?: PosterAspectFormat | undefined;
  generationMode: "manual" | "auto";
  overrides?: {
    customTitle?: string | undefined;
    customSubtitle?: string | undefined;
    customCategory?: string | undefined;
    accentColor?: string | undefined;
    fontSize?: number | undefined;
  } | undefined;
}

export const posterGenerationQueue = createQueue<PosterGenerationJobData>({
  name: POSTER_GENERATION_QUEUE,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100, age: 48 * 60 * 60 },
  },
});

export async function enqueuePosterGeneration(
  data: PosterGenerationJobData
): Promise<string> {
  const job = await posterGenerationQueue.add(
    `poster:generate:${data.announcementId}:${data.format || "instagram_portrait"}`,
    data,
    {
      jobId: `poster-${data.announcementId}-${data.format || "instagram_portrait"}-${Date.now()}`,
    }
  );

  logger.info(
    {
      queueName: POSTER_GENERATION_QUEUE,
      jobId: job.id,
      announcementId: data.announcementId,
      generationMode: data.generationMode,
    },
    "Enqueued poster generation job"
  );

  return job.id ?? `job-${data.announcementId}`;
}

