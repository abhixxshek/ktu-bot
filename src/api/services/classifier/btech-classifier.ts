import {
  type BTechCategory,
  type ExtractedAnnouncementDetails,
} from "../../../db/schema/poster-platform.js";
import { type RawPdfExtractionResult } from "./pdf-text-extractor.js";
import findCourseFiltersFromText from "../../../utils/find-course-filters-from-text.js";
import { AnnouncementFilter } from "../../../constants/courses.js";
import { CATEGORY_TO_TEMPLATE_MAP } from "../../../constants/categories.js";

export interface ClassificationOutput {
  isBtechRelevant: boolean;
  category: BTechCategory;
  suggestedTemplateId: string;
  extractedDetails: ExtractedAnnouncementDetails;
}

const CATEGORY_RULES: Array<{
  category: BTechCategory;
  pattern: RegExp;
  weight: number;
}> = [
  {
    category: "Examination Results",
    pattern: /\b(results?|results?\s+published|grade\s+cards?|provisional\s+results?)\b/i,
    weight: 12,
  },
  {
    category: "Revaluation",
    pattern: /\b(revaluations?|answer\s+scripts?\s+copy|scrutiny)\b/i,
    weight: 11,
  },
  {
    category: "Time Table",
    pattern: /\b(time\s*tables?|timetables?|detailed\s+time\s+tables?|slot\s+schedules?)\b/i,
    weight: 10,
  },
  {
    category: "Academic Calendar",
    pattern: /\b(academic\s+calendars?|semester\s+calendars?|commencement\s+of\s+classes)\b/i,
    weight: 9,
  },
  {
    category: "Registration",
    pattern: /\b(course\s+registrations?|exam(?:inations?)?\s+registrations?|portal\s+open\s+for\s+registration)\b/i,
    weight: 9,
  },
  {
    category: "Supplementary Examinations",
    pattern: /\b(supplementary(?:\s+exams?)?|fe\s+exams?|special\s+supplementary)\b/i,
    weight: 8,
  },
  {
    category: "Fee Notifications",
    pattern: /\b(fees?|fines?|super\s+fines?|remittances?|payment\s+dates?|e-payment)\b/i,
    weight: 8,
  },
  {
    category: "Examination Schedule",
    pattern: /\b(exam(?:inations?)?\s+schedules?|rescheduled|postponed\s+examinations?)\b/i,
    weight: 7,
  },
  {
    category: "Examination Notifications",
    pattern: /\b(examination\s+notifications?|exam\s+notifications?|hall\s+tickets?|valuation\s+camps?)\b/i,
    weight: 6,
  },
  {
    category: "Academic Notifications",
    pattern: /\b(syllabus|syllabi|curriculum|credit\s+transfers?|internships?|minors?|honours?|b\.tech)\b/i,
    weight: 5,
  },
  {
    category: "Student Services",
    pattern: /\b(scholarships?|grace\s+marks?|migrations?|transcripts?|provisional\s+certificates?|grievances?)\b/i,
    weight: 6,
  },
  {
    category: "College Notifications",
    pattern: /\b(affiliations?|principals?|college\s+transfers?|inter\s+colleges?|faculties)\b/i,
    weight: 6,
  },
  {
    category: "Circulars",
    pattern: /\b(circulars?|directives?|guidelines?|standard\s+operating)\b/i,
    weight: 5,
  },
];

export function classifyBTechAnnouncement(
  fullText: string,
  _hasAttachments = false
): ClassificationOutput {
  return classifyAndExtractBTechAnnouncement(fullText, null, new Date().toISOString().split("T")[0]!, {
    rawText: fullText,
    referenceNumber: null,
    detectedDates: [],
    academicYear: null,
    semester: null,
    scheme: null,
  });
}

export function classifyAndExtractBTechAnnouncement(
  title: string,
  bodyText: string | null,
  publishedDateStr: string,
  pdfMeta: RawPdfExtractionResult
): ClassificationOutput {
  const cleanTitle = title.trim();
  const cleanBody = (bodyText ?? "").trim();
  const fullText = `${cleanTitle}\n${cleanBody}\n${pdfMeta.rawText}`;

  // 1. Determine B.Tech Relevance using regex course filters
  const detectedCourses = findCourseFiltersFromText(`${cleanTitle} ${cleanBody}`);
  const explicitlyBtech =
    /\b(b\.?\s*tech|bachelor\s+of\s+technology|engineering|all\s+programs|general)\b/i.test(
      fullText
    );

  const hasBtechFilter =
    detectedCourses.has(AnnouncementFilter.BTECH) ||
    detectedCourses.has(AnnouncementFilter.ALL);

  const explicitlyNonBtechOnly =
    detectedCourses.size > 0 &&
    !hasBtechFilter &&
    !explicitlyBtech;

  const isBtechRelevant = !explicitlyNonBtechOnly;

  // 2. Score Category
  let bestCategory: BTechCategory = "Other Notifications";
  let highestScore = 0;

  for (const rule of CATEGORY_RULES) {
    const titleMatch = rule.pattern.test(cleanTitle) ? rule.weight * 2 : 0;
    const bodyMatch =
      rule.pattern.test(cleanBody) || rule.pattern.test(pdfMeta.rawText)
        ? rule.weight
        : 0;
    const total = titleMatch + bodyMatch;
    if (total > highestScore) {
      highestScore = total;
      bestCategory = rule.category;
    }
  }

  // 3. Extract Specific Dates strictly from source text (Never fabricate)
  let registrationDeadline: string | null = null;
  let examinationDate: string | null = null;

  const deadlineContextMatch = fullText.match(
    /(?:last\s+date|deadline|on\s+or\s+before|extended\s+up\s*to|till)[^.\n]{0,45}?(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]20\d{2}|\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i
  );
  if (deadlineContextMatch && deadlineContextMatch[1]) {
    registrationDeadline = deadlineContextMatch[1];
  }

  const examDateContextMatch = fullText.match(
    /(?:exam(?:ination)?\s+(?:commences|starts|scheduled)\s+(?:on|from)|date\s+of\s+exam)[^.\n]{0,45}?(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]20\d{2}|\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i
  );
  if (examDateContextMatch && examDateContextMatch[1]) {
    examinationDate = examDateContextMatch[1];
  }

  // Extract concise bullet instructions strictly from sentences present in source
  const rawSentences = (cleanBody || pdfMeta.rawText)
    .split(/(?<=[.?!])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 180);

  const importantInstructions = rawSentences.slice(0, 3);

  const shortTitle =
    cleanTitle.length > 85 ? `${cleanTitle.slice(0, 82).trim()}...` : cleanTitle;

  const suggestedTemplateId =
    CATEGORY_TO_TEMPLATE_MAP[bestCategory] ?? "minimal-academic";

  return {
    isBtechRelevant,
    category: bestCategory,
    suggestedTemplateId,
    extractedDetails: {
      mainHeading: cleanTitle,
      shortTitle,
      importantDate: pdfMeta.detectedDates[0] ?? publishedDateStr ?? null,
      registrationDeadline,
      examinationDate,
      semester: pdfMeta.semester,
      academicYear: pdfMeta.academicYear,
      scheme: pdfMeta.scheme,
      officialReference: pdfMeta.referenceNumber,
      importantInstructions,
      pdfExtractedTextSnippet: pdfMeta.rawText ? pdfMeta.rawText.slice(0, 500) : null,
    },
  };
}
