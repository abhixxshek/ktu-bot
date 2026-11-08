import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyAndExtractBTechAnnouncement } from "../../../../src/api/services/classifier/btech-classifier.js";
import { type RawPdfExtractionResult } from "../../../../src/api/services/classifier/pdf-text-extractor.js";

test("B.Tech Relevance & 14-Category Classification", async t => {
  const dummyPdfMeta: RawPdfExtractionResult = {
    rawText: "",
    referenceNumber: null,
    detectedDates: [],
    semester: null,
    academicYear: null,
    scheme: null,
  };

  await t.test("correctly identifies B.Tech relevance for B.Tech announcements", () => {
    const result = classifyAndExtractBTechAnnouncement(
      "B.Tech S6 (Regular & Supplementary) Examination May 2026 - Course & Exam Registration Opened",
      "Online course registration for B.Tech Sixth Semester is open through the KTU e-Governance portal.",
      "08-05-2026",
      dummyPdfMeta
    );

    assert.equal(result.isBtechRelevant, true);
    assert.equal(result.category, "Registration");
    assert.equal(result.suggestedTemplateId, "registration-reminder");
  });

  await t.test("flags non-B.Tech exclusive announcements (e.g. M.Arch only)", () => {
    const result = classifyAndExtractBTechAnnouncement(
      "APJAKTU - Examination (PG-Valuation) - Supplementary Exam registration to M Arch S3 Examinations Dec 2025",
      "It is hereby informed that Supplementary Exam Registrations to M Arch S3 are opened.",
      "05-05-2026",
      dummyPdfMeta
    );

    assert.equal(result.isBtechRelevant, false);
  });

  await t.test("classifies Examination Results and matches results-announcement template", () => {
    const result = classifyAndExtractBTechAnnouncement(
      "Publication of B.Tech S3 (Regular & Supplementary) Examination Results - Dec 2025",
      "The provisional results of B.Tech Third Semester are published in the KTU portal.",
      "06-05-2026",
      dummyPdfMeta
    );

    assert.equal(result.category, "Examination Results");
    assert.equal(result.suggestedTemplateId, "results-announcement");
  });

  await t.test("classifies Time Table and matches examination-timetable template", () => {
    const result = classifyAndExtractBTechAnnouncement(
      "Detailed Time Table of B.Tech S4 & S8 Regular/Supplementary Examinations - May/June 2026",
      "The detailed date and slot-wise timetable for B.Tech S4 and S8 is published herewith.",
      "05-05-2026",
      dummyPdfMeta
    );

    assert.equal(result.category, "Time Table");
    assert.equal(result.suggestedTemplateId, "examination-timetable");
  });

  await t.test("classifies Revaluation and matches important-notification template", () => {
    const result = classifyAndExtractBTechAnnouncement(
      "Revaluation & Answer Script Copy Registration - B.Tech S5 Examination",
      "Online registration for Revaluation and Answer Script Copy is enabled.",
      "03-05-2026",
      dummyPdfMeta
    );

    assert.equal(result.category, "Revaluation");
    assert.equal(result.suggestedTemplateId, "important-notification");
  });

  await t.test("strictly enforces zero-hallucination policy for missing dates and references", () => {
    const result = classifyAndExtractBTechAnnouncement(
      "B.Tech S2 General Academic Notice",
      "Guidelines for laboratory classes.",
      "01-05-2026",
      dummyPdfMeta
    );

    assert.equal(result.extractedDetails.registrationDeadline, null);
    assert.equal(result.extractedDetails.examinationDate, null);
    assert.equal(result.extractedDetails.officialReference, null);
  });

  await t.test("extracts literal deadlines and references when present in official source", () => {
    const pdfWithDetails: RawPdfExtractionResult = {
      rawText: "Reference: KTU/EX-II#1/2490/2026. The last date for online fee remittance is 22-05-2026.",
      referenceNumber: "KTU/EX-II#1/2490/2026",
      detectedDates: ["22-05-2026"],
      semester: "S6",
      academicYear: "2025-26",
      scheme: "2019 Scheme",
    };

    const result = classifyAndExtractBTechAnnouncement(
      "B.Tech S6 Examination Notification",
      "Students can submit up to 22-05-2026 without fine.",
      "08-05-2026",
      pdfWithDetails
    );

    assert.equal(result.extractedDetails.registrationDeadline, "22-05-2026");
    assert.equal(result.extractedDetails.officialReference, "KTU/EX-II#1/2490/2026");
    assert.equal(result.extractedDetails.semester, "S6");
    assert.equal(result.extractedDetails.scheme, "2019 Scheme");
  });
});

