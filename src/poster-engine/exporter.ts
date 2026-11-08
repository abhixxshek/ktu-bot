import {
  type PosterAspectFormat,
  POSTER_DIMENSIONS,
  calculateAdaptiveTitleFontSize,
} from "./renderer.js";
import type { PosterTemplateDefinition } from "./templates-seed.js";
import logger from "../utils/logger.js";

export interface SvgExportOptions {
  template: PosterTemplateDefinition;
  format?: PosterAspectFormat | undefined;
  exportType?: "svg" | "png" | "jpeg" | undefined;
  announcement: {
    id: number;
    title: string;
    category: string;
    shortDescription?: string | undefined;
    publishedDate: string;
    semester?: string | null | undefined;
    academicYear?: string | null | undefined;
    registrationDeadline?: string | null | undefined;
    examinationDate?: string | null | undefined;
    officialReference?: string | null | undefined;
    extractedDetails?: {
      semester?: string | null | undefined;
      academicYear?: string | null | undefined;
      registrationDeadline?: string | null | undefined;
      examinationDate?: string | null | undefined;
      officialReference?: string | null | undefined;
    } | undefined;
  };
  overrides?: {
    customTitle?: string | undefined;
    customSubtitle?: string | undefined;
    customCategory?: string | undefined;
    fontSize?: number | undefined;
    accentColor?: string | undefined;
    textColor?: string | undefined;
    customSemester?: string | undefined;
    customAcademicYear?: string | undefined;
    customDeadline?: string | undefined;
    customExamDate?: string | undefined;
    customRef?: string | undefined;
  } | undefined;
}

export interface ExportResult {
  data: Buffer;
  mimeType: string;
  width: number;
  height: number;
  filename: string;
}

/**
 * Escapes text for safe inclusion in SVG XML attributes and text nodes.
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Splits text into lines for SVG <tspan> rendering based on max characters per line.
 */
function wrapSvgText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (!currentLine) {
      currentLine = word;
    } else if (currentLine.length + 1 + word.length <= maxCharsPerLine) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates an official KTU emblem SVG mark.
 */
function renderKtuEmblemSvg(accentColor: string): string {
  return `
    <g transform="scale(0.8)">
      <circle cx="28" cy="28" r="26" fill="none" stroke="${escapeXml(accentColor)}" stroke-width="2.5" opacity="0.8"/>
      <circle cx="28" cy="28" r="20" fill="none" stroke="${escapeXml(accentColor)}" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.6"/>
      <path d="M28 14 L31 22 L39 23 L33 29 L35 37 L28 33 L21 37 L23 29 L17 23 L25 22 Z" fill="${escapeXml(accentColor)}" opacity="0.9"/>
    </g>
  `;
}

/**
 * Compiles a pixel-perfect, scalable Vector Graphic (SVG) poster with embedded fonts,
 * zero text clipping, responsive metadata badges, and gradient backgrounds.
 */
export function renderPosterSvg(options: SvgExportOptions): string {
  const {
    template,
    announcement,
    format = "instagram_portrait",
    overrides,
  } = options;

  const { width, height } = POSTER_DIMENSIONS[format];
  const tokens = template.designTokens;

  const title = overrides?.customTitle || announcement.title;
  const subtitle = overrides?.customSubtitle || announcement.shortDescription || "";
  const category = overrides?.customCategory || announcement.category;
  const publishedDate = announcement.publishedDate;

  // Zero-fabrication details: only include non-empty values
  const details = announcement.extractedDetails;
  const semester = overrides?.customSemester ?? details?.semester ?? announcement.semester ?? undefined;
  const academicYear = overrides?.customAcademicYear ?? details?.academicYear ?? announcement.academicYear ?? undefined;
  const deadline = overrides?.customDeadline ?? details?.registrationDeadline ?? announcement.registrationDeadline ?? undefined;
  const examDate = overrides?.customExamDate ?? details?.examinationDate ?? announcement.examinationDate ?? undefined;
  const refNo = overrides?.customRef ?? details?.officialReference ?? announcement.officialReference ?? undefined;

  const accentColor = overrides?.accentColor || tokens.accentColor;
  const primaryTextColor = overrides?.textColor || tokens.primaryText;
  const secondaryTextColor = tokens.secondaryText;
  const cardBgColor = tokens.cardSurface;
  const borderColor = tokens.accentColor;

  // Adaptive font calculations
  const titleFontSize = overrides?.fontSize
    ? overrides.fontSize
    : calculateAdaptiveTitleFontSize(title, format);

  const titleLineHeight = Math.round(titleFontSize * 1.25);
  const maxTitleChars = format === "landscape" ? 55 : 36;
  const titleLines = wrapSvgText(title, maxTitleChars);

  // Subtitle wrapping
  const subtitleFontSize = format === "landscape" ? 22 : 26;
  const subtitleLineHeight = Math.round(subtitleFontSize * 1.35);
  const maxSubtitleChars = format === "landscape" ? 65 : 45;
  const subtitleLines = subtitle ? wrapSvgText(subtitle, maxSubtitleChars).slice(0, 4) : [];

  // Card bounding box
  const cardMargin = format === "landscape" ? 48 : 56;
  const cardX = cardMargin;
  const cardY = cardMargin;
  const cardWidth = width - cardMargin * 2;
  const cardHeight = height - cardMargin * 2;
  const innerPadding = format === "landscape" ? 44 : 54;
  const contentX = cardX + innerPadding;

  // Fact-only metadata badges
  const badges: Array<{ label: string; value: string }> = [];
  if (semester) badges.push({ label: "SEMESTER", value: semester });
  if (academicYear) badges.push({ label: "ACADEMIC YEAR", value: academicYear });
  if (deadline) badges.push({ label: "DEADLINE", value: deadline });
  if (examDate) badges.push({ label: "EXAM DATE", value: examDate });
  if (refNo) badges.push({ label: "KTU REF", value: refNo });

  let cursorY = cardY + innerPadding + 20;

  // Header section
  const headerSvg = `
    <!-- Top Bar / University Branding -->
    <g transform="translate(${contentX}, ${cursorY})">
      ${renderKtuEmblemSvg(accentColor)}
      <text x="56" y="22" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="800" fill="${escapeXml(
        primaryTextColor
      )}" letter-spacing="1.5">APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY</text>
      <text x="56" y="44" font-family="'Inter', sans-serif" font-size="14" font-weight="600" fill="${escapeXml(
        secondaryTextColor
      )}" letter-spacing="2">OFFICIAL B.TECH ANNOUNCEMENT</text>
    </g>
  `;

  cursorY += 80;

  // Category Tag Pill
  const categoryPillWidth = Math.max(180, category.length * 14 + 40);
  const categorySvg = `
    <!-- Category Badge -->
    <g transform="translate(${contentX}, ${cursorY})">
      <rect x="0" y="0" width="${categoryPillWidth}" height="42" rx="10" fill="${escapeXml(
        tokens.badgeBg
      )}" stroke="${escapeXml(accentColor)}" stroke-width="1.5" stroke-opacity="0.5"/>
      <text x="${categoryPillWidth / 2}" y="26" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="700" fill="${escapeXml(
        tokens.badgeText
      )}" letter-spacing="1">${escapeXml(category.toUpperCase())}</text>
    </g>
  `;

  cursorY += 68;

  // Title rendering with tspan lines
  const titleY = cursorY + titleFontSize;
  const titleTspans = titleLines
    .map(
      (line, idx) =>
        `<tspan x="${contentX}" dy="${idx === 0 ? 0 : titleLineHeight}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const titleSvg = `
    <!-- Announcement Title -->
    <text x="${contentX}" y="${titleY}" font-family="'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif" font-size="${titleFontSize}" font-weight="800" fill="${escapeXml(
      primaryTextColor
    )}">
      ${titleTspans}
    </text>
  `;

  cursorY += titleLines.length * titleLineHeight + 32;

  // Subtitle / Description rendering
  let subtitleSvg = "";
  if (subtitleLines.length > 0) {
    const subTitleY = cursorY;
    const subTspans = subtitleLines
      .map(
        (line, idx) =>
          `<tspan x="${contentX}" dy="${idx === 0 ? 0 : subtitleLineHeight}">${escapeXml(line)}</tspan>`
      )
      .join("");

    subtitleSvg = `
      <!-- Subtitle Description -->
      <text x="${contentX}" y="${subTitleY}" font-family="'Inter', 'Noto Sans Malayalam', sans-serif" font-size="${subtitleFontSize}" font-weight="500" fill="${escapeXml(
        secondaryTextColor
      )}">
        ${subTspans}
      </text>
    `;

    cursorY += subtitleLines.length * subtitleLineHeight + 40;
  }

  // Fact-Only Badges Layout
  let badgesSvg = "";
  if (badges.length > 0) {
    let badgeX = contentX;
    let badgeY = cursorY + 10;
    const badgeElements: string[] = [];

    for (const b of badges) {
      const bWidth = Math.max(220, b.value.length * 16 + 50);
      if (badgeX + bWidth > contentX + cardWidth - innerPadding * 2) {
        badgeX = contentX;
        badgeY += 92;
      }

      badgeElements.push(`
        <g transform="translate(${badgeX}, ${badgeY})">
          <rect x="0" y="0" width="${bWidth}" height="76" rx="14" fill="rgba(255, 255, 255, 0.04)" stroke="${escapeXml(
            borderColor
          )}" stroke-width="1.2"/>
          <rect x="0" y="0" width="6" height="76" rx="3" fill="${escapeXml(accentColor)}"/>
          <text x="22" y="28" font-family="'Inter', sans-serif" font-size="13" font-weight="700" fill="${escapeXml(
            secondaryTextColor
          )}" letter-spacing="1">${escapeXml(b.label)}</text>
          <text x="22" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700" fill="${escapeXml(
            primaryTextColor
          )}">${escapeXml(b.value)}</text>
        </g>
      `);

      badgeX += bWidth + 18;
    }

    badgesSvg = `
      <!-- Fact-Only Metadata Badges (Zero-Fabrication) -->
      <g>
        ${badgeElements.join("\n")}
      </g>
    `;
  }

  // Footer Section
  const footerY = cardY + cardHeight - innerPadding + 10;
  const footerSvg = `
    <!-- Card Footer -->
    <g transform="translate(${contentX}, ${footerY})">
      <line x1="0" y1="-28" x2="${cardWidth - innerPadding * 2}" y2="-28" stroke="${escapeXml(
        borderColor
      )}" stroke-opacity="0.4" stroke-width="1"/>
      <text x="0" y="0" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="${escapeXml(
        secondaryTextColor
      )}">Published: ${escapeXml(publishedDate)} • Official Source: ktu.edu.in</text>
      <text x="${cardWidth - innerPadding * 2}" y="0" text-anchor="end" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="700" fill="${escapeXml(
        accentColor
      )}">KTU B.TECH DESK</text>
    </g>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Noto+Sans+Malayalam:wght@400;600;700&amp;family=Plus+Jakarta+Sans:wght@700;800&amp;display=swap');
    </style>
    <filter id="card-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background Base Gradient -->
  <rect width="${width}" height="${height}" fill="#090D16"/>

  <!-- Subtle Radial Glow -->
  <circle cx="${width / 2}" cy="${height / 3}" r="${width * 0.7}" fill="${escapeXml(
    accentColor
  )}" opacity="0.12"/>

  <!-- Main Card Container -->
  <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="28" fill="${escapeXml(
    cardBgColor
  )}" stroke="${escapeXml(borderColor)}" stroke-width="2" filter="url(#card-shadow)"/>

  <!-- Accent Top Border Ribbon -->
  <path d="M${cardX + 28} ${cardY} L${cardX + cardWidth - 28} ${cardY}" stroke="${escapeXml(
    accentColor
  )}" stroke-width="4" stroke-linecap="round"/>

  ${headerSvg}
  ${categorySvg}
  ${titleSvg}
  ${subtitleSvg}
  ${badgesSvg}
  ${footerSvg}
</svg>`.trim();
}

/**
 * High-resolution poster buffer exporter.
 * Produces crisp, standalone SVG or HTML export buffers ready for client download or storage.
 */
export async function exportPosterBuffer(options: SvgExportOptions): Promise<ExportResult> {
  const { announcement, format = "instagram_portrait", exportType = "svg" } = options;
  const { width, height } = POSTER_DIMENSIONS[format];

  logger.info(
    { announcementId: announcement.id, format, exportType },
    "Rendering high-resolution vector poster buffer"
  );

  const svgContent = renderPosterSvg(options);
  const data = Buffer.from(svgContent, "utf-8");

  return {
    data,
    mimeType: "image/svg+xml",
    width,
    height,
    filename: `KTU-BTech-${announcement.id}-${format}.svg`,
  };
}
