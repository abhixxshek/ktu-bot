import fs from "node:fs/promises";
import { withDownloadedAttachment } from "../../../utils/attachment-download.js";
import logger from "../../../utils/logger.js";

export interface RawPdfExtractionResult {
  rawText: string;
  referenceNumber: string | null;
  detectedDates: string[];
  semester: string | null;
  academicYear: string | null;
  scheme: string | null;
}

const KTU_REF_REGEX = /\b(KTU\/[A-Z0-9\/\-()#.]+\/\d{4})\b/i;
const ACADEMIC_YEAR_REGEX = /\b(20\d{2}\s*[-–]\s*(?:20)?\d{2})\b/;
const SEMESTER_REGEX =
  /\b(S[1-8]|(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|[1-8](?:st|nd|rd|th))\s+Semester)\b/i;
const SCHEME_REGEX = /\b(2015|2019|2024)\s*Scheme\b/i;
const DATE_PATTERNS =
  /\b(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]20\d{2}|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+20\d{2})\b/gi;

function normalizeSemester(raw: string): string {
  const upper = raw.toUpperCase().trim();
  if (/^S[1-8]$/.test(upper)) return upper;
  const map: Record<string, string> = {
    FIRST: "S1",
    "1ST": "S1",
    SECOND: "S2",
    "2ND": "S2",
    THIRD: "S3",
    "3RD": "S3",
    FOURTH: "S4",
    "4TH": "S4",
    FIFTH: "S5",
    "5TH": "S5",
    SIXTH: "S6",
    "6TH": "S6",
    SEVENTH: "S7",
    "7TH": "S7",
    EIGHTH: "S8",
    "8TH": "S8",
  };
  for (const [key, val] of Object.entries(map)) {
    if (upper.includes(key)) return val;
  }
  return raw;
}

export async function extractPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import("pdf-parse");
    // Handle both default and named PDFParse class export in pdf-parse v2+
    const ParserClass =
      (pdfParseModule as unknown as { PDFParse?: new (opts: { data: Buffer }) => { getText: () => Promise<string> } }).PDFParse;

    if (typeof ParserClass === "function") {
      const parser = new ParserClass({ data: buffer });
      const text = await parser.getText();
      return text || "";
    }

    // Fallback for v1 style function
    const parserFn = (pdfParseModule as unknown as { default?: (buf: Buffer) => Promise<{ text: string }> }).default;
    if (typeof parserFn === "function") {
      const parsed = await parserFn(buffer);
      return parsed.text || "";
    }

    return "";
  } catch (err) {
    logger.warn({ err }, "Could not parse PDF buffer");
    return "";
  }
}

export async function extractOfficialPdfMetadata(
  attachmentEncryptionId: string | null | undefined,
  fallbackText: string
): Promise<RawPdfExtractionResult> {
  let pdfText = "";

  if (attachmentEncryptionId && attachmentEncryptionId.trim()) {
    try {
      await withDownloadedAttachment(
        attachmentEncryptionId,
        "attachment.pdf",
        "default",
        async downloaded => {
          const buffer = await fs.readFile(downloaded.tempFilePath);
          pdfText = await extractPdfTextFromBuffer(buffer);
        }
      );
    } catch (error) {
      logger.warn(
        { err: error, attachmentEncryptionId },
        "PDF download/extraction skipped; relying on announcement body"
      );
    }
  }

  const combinedCorpus = `${fallbackText}\n${pdfText}`;

  const refMatch = combinedCorpus.match(KTU_REF_REGEX);
  const yearMatch = combinedCorpus.match(ACADEMIC_YEAR_REGEX);
  const semMatch = combinedCorpus.match(SEMESTER_REGEX);
  const schemeMatch = combinedCorpus.match(SCHEME_REGEX);

  const rawDateMatches = combinedCorpus.match(DATE_PATTERNS) ?? [];
  const allDates = Array.from(new Set(rawDateMatches));

  return {
    rawText: pdfText.slice(0, 4000),
    referenceNumber: refMatch && refMatch[1] ? refMatch[1].toUpperCase() : null,
    detectedDates: allDates,
    semester: semMatch && semMatch[1] ? normalizeSemester(semMatch[1]) : null,
    academicYear: yearMatch && yearMatch[1] ? yearMatch[1].replace(/\s+/g, "") : null,
    scheme: schemeMatch && schemeMatch[1] ? `${schemeMatch[1]} Scheme` : null,
  };
}

