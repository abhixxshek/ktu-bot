import { test } from "node:test";
import assert from "node:assert/strict";
import { createWebApiServer } from "../../src/web-api/server.js";
import { BTECH_CATEGORIES } from "../../src/db/schema/poster-platform.js";
import { DatabaseInstance } from "../../src/db/types.js";

test("Web API Server Endpoints", async t => {
  // Mock lightweight database instance for router tests
  const mockDb = {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              offset: () => Promise.resolve([]),
            }),
          }),
          limit: () => Promise.resolve([]),
        }),
        orderBy: () => ({
          limit: () => Promise.resolve([]),
        }),
      }),
    }),
  } as unknown as DatabaseInstance;

  const app = createWebApiServer(mockDb);

  await t.test("GET /health returns healthy status", async () => {
    const res = await app.request("/health");
    assert.equal(res.status, 200);

    const body = (await res.json()) as { status: string; service: string };
    assert.equal(body.status, "ok");
    assert.equal(body.service, "ktu-btech-web-platform-api");
  });

  await t.test("GET /api/categories returns all 14 official categories", async () => {
    const res = await app.request("/api/categories");
    assert.equal(res.status, 200);

    const body = (await res.json()) as {
      categories: string[];
      metadata: Array<{ name: string; suggestedTemplateId: string }>;
    };
    assert.equal(body.categories.length, 14);
    assert.deepEqual(body.categories, BTECH_CATEGORIES);
    assert.equal(body.metadata.length, 14);
  });

  await t.test("GET /api/templates returns predefined template presets", async () => {
    const res = await app.request("/api/templates");
    assert.equal(res.status, 200);

    const templates = (await res.json()) as Array<{ id: string; name: string }>;
    assert.ok(templates.length >= 11);
    const examTemplate = templates.find(tpl => tpl.id === "bold-exam-alert");
    assert.ok(examTemplate, "Expected bold-exam-alert template to exist");
    assert.equal(examTemplate.name, "Bold Examination Alert");
  });

  await t.test("POST /api/posters/export generates and streams vector SVG poster", async () => {
    const res = await app.request("/api/posters/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: "bold-exam-alert",
        format: "instagram_portrait",
        announcement: {
          id: 5501,
          title: "B.Tech S4 Regular & Supplementary Examination May 2026",
          category: "Examination Notifications",
          shortDescription: "Official schedule for S4 engineering students.",
          publishedDate: "2026-05-02",
          extractedDetails: {
            semester: "S4",
            academicYear: "2025-26",
            registrationDeadline: "2026-05-12",
          },
        },
      }),
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Content-Type"), "image/svg+xml");
    const svgText = await res.text();
    assert.match(svgText, /<svg/);
    assert.match(svgText, /B\.Tech S4 Regular &amp; Supplementary/);
    assert.match(svgText, /Examination May 2026/);
    assert.match(svgText, /2026-05-12/);
  });
});

