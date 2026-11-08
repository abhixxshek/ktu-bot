import { test } from "node:test";
import assert from "node:assert/strict";
import {
  POSTER_DIMENSIONS,
  calculateAdaptiveTitleFontSize,
  renderPosterHtmlDocument,
} from "../../src/poster-engine/renderer.js";
import { selectTemplateForAnnouncement } from "../../src/poster-engine/smart-selector.js";
import { PREDEFINED_POSTER_TEMPLATES } from "../../src/poster-engine/templates-seed.js";

test("Poster Engine: Templates, Selector & Adaptive Renderer", async t => {
  const sampleTemplate = PREDEFINED_POSTER_TEMPLATES[0]!;

  await t.test("verifies exact dimensions for all 4 supported aspect ratios", () => {
    assert.deepEqual(POSTER_DIMENSIONS.instagram_portrait, {
      width: 1080,
      height: 1350,
      ratioLabel: "4:5 (1080 × 1350)",
    });
    assert.deepEqual(POSTER_DIMENSIONS.instagram_story, {
      width: 1080,
      height: 1920,
      ratioLabel: "9:16 (1080 × 1920)",
    });
    assert.deepEqual(POSTER_DIMENSIONS.square_post, {
      width: 1080,
      height: 1080,
      ratioLabel: "1:1 (1080 × 1080)",
    });
    assert.deepEqual(POSTER_DIMENSIONS.landscape, {
      width: 1200,
      height: 628,
      ratioLabel: "1.91:1 (1200 × 628)",
    });
  });

  await t.test("calculates adaptive font sizes to prevent text overflow", () => {
    const shortTitle = "B.Tech Exam Results";
    const longTitle =
      "APJAKTU - Detailed Notification Regarding the Rescheduling and Revaluation of B.Tech Eighth Semester Regular and Supplementary Examinations Scheduled for June 2026";

    const shortSize = calculateAdaptiveTitleFontSize(shortTitle, "instagram_portrait");
    const longSize = calculateAdaptiveTitleFontSize(longTitle, "instagram_portrait");

    assert.ok(
      shortSize > longSize,
      `Expected short title font (${shortSize}px) to be larger than long title font (${longSize}px)`
    );

    const scaledSize = calculateAdaptiveTitleFontSize(shortTitle, "instagram_portrait", 1.2);
    assert.equal(scaledSize, Math.round(shortSize * 1.2));
  });

  await t.test("renders valid HTML document with embedded dimensions and styles", () => {
    const html = renderPosterHtmlDocument({
      template: sampleTemplate,
      format: "instagram_portrait",
      placeholders: {
        CATEGORY: "Registration",
        TITLE: "B.Tech S6 Course Registration Opened",
        DESCRIPTION: "Students can register online via the KTU portal.",
        DEADLINE: "22-05-2026",
        SEMESTER: "S6",
        MALAYALAM_SUBHEADING: "സാങ്കേതിക സർവ്വകലാശാല അറിയിപ്പ്",
      },
    });

    assert.ok(html.includes("width: 1080px;"));
    assert.ok(html.includes("height: 1350px;"));
    assert.ok(html.includes("B.Tech S6 Course Registration Opened"));
    assert.ok(html.includes("22-05-2026"));
    assert.ok(html.includes("സാങ്കേതിക സർവ്വകലാശാല അറിയിപ്പ്"));
    assert.ok(html.includes("Noto Sans Malayalam"));
  });

  await t.test("strictly omits empty metadata badges (zero-fabrication invariant)", () => {
    const html = renderPosterHtmlDocument({
      template: sampleTemplate,
      format: "square_post",
      placeholders: {
        CATEGORY: "Academic Notifications",
        TITLE: "New Regulation Circular",
        // DEADLINE, EXAM_DATE, and SEMESTER are left undefined
      },
    });

    assert.ok(!html.includes("DEADLINE"));
    assert.ok(!html.includes("EXAM DATE"));
    assert.ok(!html.includes("SEMESTER"));
  });

  await t.test("smart template selector maps categories and detects urgent keywords", () => {
    const resultTemplate = selectTemplateForAnnouncement({
      category: "Examination Results",
    });
    assert.equal(resultTemplate.id, "results-announcement");

    const urgentTemplate = selectTemplateForAnnouncement({
      category: "Time Table",
      title: "Urgent Postponed Exam Notification",
    });
    assert.equal(urgentTemplate.id, "bold-exam-alert");

    const preferred = selectTemplateForAnnouncement({
      category: "Examination Results",
      preferredTemplateId: "premium-dark",
    });
    assert.equal(preferred.id, "premium-dark");
  });
});
