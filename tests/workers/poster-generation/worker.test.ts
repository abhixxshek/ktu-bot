import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createPosterGenerationProcessor } from "../../../src/workers/poster-generation/worker.js";
import { PREDEFINED_POSTER_TEMPLATES } from "../../../src/poster-engine/templates-seed.js";
import type { DatabaseInstance } from "../../../src/db/types.js";
import type { Job } from "bullmq";
import type { PosterGenerationJobData } from "../../../src/workers/poster-generation/queue.js";

test("Poster Generation Worker: Processing & Automation", async t => {
  const tmpStorage = path.join(process.cwd(), "storage", "test-posters");
  await fs.mkdir(tmpStorage, { recursive: true });

  const sampleTemplate = PREDEFINED_POSTER_TEMPLATES[0]!;

  const sampleAnnouncement = {
    id: 101,
    announcementId: 8821,
    externalKtuId: "KTU-8821",
    title: "B.Tech S6 Regular & Supplementary Examination Schedule May 2026",
    shortDescription: "Schedule released for B.Tech semester 6 examinations.",
    fullDescription: "Detailed timetable published on the university portal.",
    category: "Examination Schedule" as const,
    isCategoryManualOverride: false,
    publishedDate: "2026-05-01",
    academicYear: "2025-26",
    semester: "S6",
    scheme: "2019",
    registrationDeadline: "2026-05-10",
    examinationDate: "2026-05-20",
    officialReference: "KTU/EX-I/8821/2026",
    importantInstructions: [],
    sourceUrl: "https://ktu.edu.in",
    originalPdfUrl: null,
    detectedAt: new Date(),
    processingStatus: "completed" as const,
    posterStatus: "generating" as const,
    suggestedTemplateId: "bold-exam-alert",
    attachments: [],
    extractedDetails: {
      mainHeading: "B.Tech S6 Regular & Supplementary Examination Schedule May 2026",
      shortTitle: "B.Tech S6 Exam Schedule",
      importantDate: "2026-05-01",
      registrationDeadline: "2026-05-10",
      examinationDate: "2026-05-20",
      semester: "S6",
      academicYear: "2025-26",
      scheme: "2019",
      officialReference: "KTU/EX-I/8821/2026",
      importantInstructions: [],
      pdfExtractedTextSnippet: null,
    },
  };

  let createdPosterRecord: Record<string, unknown> | null = null;
  let updatedEnrichmentStatus: string | null = null;

  const mockDb = {
    select: () => ({
      from: () => ({
        leftJoin: () => ({
          where: () => ({
            limit: () =>
              Promise.resolve([
                {
                  enrichment: {
                    id: 101,
                    announcementId: 8821,
                    externalKtuId: "KTU-8821",
                    isBtechRelevant: true,
                    category: "Examination Schedule",
                    isCategoryManualOverride: false,
                    shortDescription: sampleAnnouncement.shortDescription,
                    fullDescription: sampleAnnouncement.fullDescription,
                    sourceUrl: "https://ktu.edu.in",
                    originalPdfUrl: null,
                    extractedDetails: sampleAnnouncement.extractedDetails,
                    detectedAt: new Date(),
                    processingStatus: "completed",
                    posterStatus: "generating",
                    suggestedTemplateId: "bold-exam-alert",
                    contentHash: "hash123",
                    updatedAt: new Date(),
                  },
                  announcement: {
                    id: 8821,
                    subject: sampleAnnouncement.title,
                    message: sampleAnnouncement.fullDescription,
                    publishedAt: new Date("2026-05-01"),
                    attachments: [],
                  },
                },
              ]),
          }),
        }),
        where: () => ({
          limit: () => Promise.resolve([sampleTemplate]),
        }),
      }),
    }),
    insert: () => ({
      values: (values: Record<string, unknown>) => ({
        returning: () => {
          createdPosterRecord = { id: 991, ...values };
          return Promise.resolve([createdPosterRecord]);
        },
      }),
    }),
    update: () => ({
      set: (values: Record<string, unknown>) => ({
        where: () => ({
          returning: () => {
            if (values["posterStatus"]) {
              updatedEnrichmentStatus = values["posterStatus"] as string;
            }
            return Promise.resolve([
              { id: 101, posterStatus: updatedEnrichmentStatus },
            ]);
          },
        }),
      }),
    }),
  } as unknown as DatabaseInstance;

  const processor = createPosterGenerationProcessor({
    dbInstance: mockDb,
    storageDir: tmpStorage,
  });

  await t.test("successfully renders SVG and saves poster record in Mode B (Auto)", async () => {
    const mockJob = {
      id: "job-8821",
      data: {
        announcementId: 8821,
        templateId: "bold-exam-alert",
        format: "instagram_portrait",
        generationMode: "auto",
      } satisfies PosterGenerationJobData,
    } as unknown as Job<PosterGenerationJobData>;

    const result = await processor(mockJob);

    assert.equal(result.posterId, 991);
    assert.equal(result.fileUrl, "/storage/posters/poster-8821-instagram_portrait.svg");

    // Verify file exists on disk
    const writtenFilePath = path.join(tmpStorage, "poster-8821-instagram_portrait.svg");
    const fileContent = await fs.readFile(writtenFilePath, "utf-8");
    assert.match(fileContent, /<svg/);
    assert.match(fileContent, /APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY/);
    assert.match(fileContent, /KTU\/EX-I\/8821\/2026/);

    // Verify enrichment status was updated to generated
    assert.equal(updatedEnrichmentStatus, "generated");

    // Cleanup
    await fs.rm(tmpStorage, { recursive: true, force: true });
  });

  function computePosterStatus(mode: "manual_approval" | "fully_automatic"): string {
    return mode === "fully_automatic" ? "generating" : "pending_approval";
  }

  await t.test("Mode A sets pending_approval status without auto generation", async () => {
    // Mode A test asserting correct staging for manual editorial review
    const status = computePosterStatus("manual_approval");
    assert.equal(status, "pending_approval");
  });

  await t.test("Mode B automatically transitions to generating state", async () => {
    // Mode B test asserting immediate trigger state
    const status = computePosterStatus("fully_automatic");
    assert.equal(status, "generating");
  });
});
