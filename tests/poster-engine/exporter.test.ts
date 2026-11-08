import { test } from "node:test";
import assert from "node:assert/strict";
import {
  renderPosterSvg,
  exportPosterBuffer,
} from "../../src/poster-engine/exporter.js";
import { PREDEFINED_POSTER_TEMPLATES } from "../../src/poster-engine/templates-seed.js";
import { POSTER_DIMENSIONS } from "../../src/poster-engine/renderer.js";

test("Poster Exporter: High-Resolution Vector & SVG Rasterization", async t => {
  const sampleTemplate = PREDEFINED_POSTER_TEMPLATES[0]!;
  const sampleAnnouncement = {
    id: 9942,
    title: "B.Tech S8 (Honours) Examination April 2026 - Time Table & Center List Released",
    category: "Time Table" as const,
    shortDescription: "Official schedule for S8 honours engineering degree examinations.",
    publishedDate: "2026-04-18",
    extractedDetails: {
      semester: "S8",
      academicYear: "2025-26",
      registrationDeadline: "2026-04-25",
      examinationDate: "2026-05-04",
      officialReference: "KTU/EX-II#9942/2026",
    },
  };

  await t.test("generates valid SVG XML with exact viewBox and dimensions for 4:5 portrait", () => {
    const svg = renderPosterSvg({
      template: sampleTemplate,
      announcement: sampleAnnouncement,
      format: "instagram_portrait",
    });

    const expected = POSTER_DIMENSIONS.instagram_portrait;
    assert.match(svg, new RegExp(`viewBox="0 0 ${expected.width} ${expected.height}"`));
    assert.match(svg, new RegExp(`width="${expected.width}"`));
    assert.match(svg, new RegExp(`height="${expected.height}"`));
    assert.match(svg, /APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY/);
    assert.match(svg, /TIME TABLE/);
    assert.match(svg, /S8/);
    assert.match(svg, /KTU\/EX-II#9942\/2026/);
  });

  await t.test("exports scalable vector buffer with image/svg+xml MIME type", async () => {
    const result = await exportPosterBuffer({
      template: sampleTemplate,
      announcement: sampleAnnouncement,
      format: "square_post",
    });

    assert.equal(result.mimeType, "image/svg+xml");
    assert.equal(result.width, 1080);
    assert.equal(result.height, 1080);
    assert.ok(result.data.length > 500);
    assert.equal(result.filename, "KTU-BTech-9942-square_post.svg");
  });

  await t.test("strictly omits missing/null extracted details (zero-fabrication)", () => {
    const emptyDetailsAnnouncement = {
      id: 9943,
      title: "General Circular - Campus Holiday Notification",
      category: "Circulars" as const,
      publishedDate: "2026-04-19",
      extractedDetails: {},
    };

    const svg = renderPosterSvg({
      template: sampleTemplate,
      announcement: emptyDetailsAnnouncement,
      format: "landscape",
    });

    // Should NOT contain fabricated badges
    assert.doesNotMatch(svg, />DEADLINE</);
    assert.doesNotMatch(svg, />EXAM DATE</);
    assert.doesNotMatch(svg, />KTU REF</);
    assert.doesNotMatch(svg, />SEMESTER</);
  });

  await t.test("respects studio user overrides for colors and custom text", () => {
    const svg = renderPosterSvg({
      template: sampleTemplate,
      announcement: sampleAnnouncement,
      format: "instagram_portrait",
      overrides: {
        customTitle: "MODIFIED CUSTOM STUDIO TITLE",
        accentColor: "#E11D48",
        customDeadline: "2026-05-10",
      },
    });

    assert.match(svg, /MODIFIED CUSTOM STUDIO TITLE/);
    assert.match(svg, /fill="#E11D48"/);
    assert.match(svg, /2026-05-10/);
  });
});

