import type { PosterTemplateDefinition } from "./templates-seed.js";

export type PosterAspectFormat =
  | "instagram_portrait" // 1080 x 1350 (4:5)
  | "instagram_story" // 1080 x 1920 (9:16)
  | "square_post" // 1080 x 1080 (1:1)
  | "landscape"; // 1200 x 628 (1.91:1)

export const POSTER_DIMENSIONS: Record<
  PosterAspectFormat,
  { width: number; height: number; ratioLabel: string }
> = {
  instagram_portrait: {
    width: 1080,
    height: 1350,
    ratioLabel: "4:5 (1080 × 1350)",
  },
  instagram_story: {
    width: 1080,
    height: 1920,
    ratioLabel: "9:16 (1080 × 1920)",
  },
  square_post: {
    width: 1080,
    height: 1080,
    ratioLabel: "1:1 (1080 × 1080)",
  },
  landscape: {
    width: 1200,
    height: 628,
    ratioLabel: "1.91:1 (1200 × 628)",
  },
};

export interface PosterPlaceholderValues {
  CATEGORY: string;
  TITLE: string;
  DESCRIPTION?: string | undefined;
  IMPORTANT_DATE?: string | undefined;
  PUBLISHED_DATE?: string | undefined;
  SEMESTER?: string | undefined;
  ACADEMIC_YEAR?: string | undefined;
  DEADLINE?: string | undefined;
  EXAM_DATE?: string | undefined;
  OFFICIAL_REF?: string | undefined;
  SOURCE?: string | undefined;
  FOOTER?: string | undefined;
  MALAYALAM_SUBHEADING?: string | undefined;
}

export interface PosterStyleOverrides {
  fontSizeScale?: number;
  textAlign?: "left" | "center" | "right";
  accentColor?: string;
  backgroundOverride?: string;
  logoPosition?: "top-left" | "top-right" | "bottom-right" | "hidden";
}

export function calculateAdaptiveTitleFontSize(
  title: string,
  format: PosterAspectFormat,
  userScale = 1.0
): number {
  const len = title.trim().length;
  const baseMap: Record<PosterAspectFormat, number> = {
    instagram_portrait: 56,
    instagram_story: 62,
    square_post: 50,
    landscape: 38,
  };

  let size = baseMap[format];
  if (len > 160) {
    size *= 0.62;
  } else if (len > 120) {
    size *= 0.72;
  } else if (len > 85) {
    size *= 0.84;
  } else if (len < 40) {
    size *= 1.1;
  }

  return Math.round(size * userScale);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderPosterHtmlDocument(params: {
  template: PosterTemplateDefinition;
  format: PosterAspectFormat;
  placeholders: PosterPlaceholderValues;
  overrides?: PosterStyleOverrides;
}): string {
  const { template, format, placeholders, overrides } = params;
  const dims = POSTER_DIMENSIONS[format];
  const tokens = template.designTokens;

  const titleFontSize = calculateAdaptiveTitleFontSize(
    placeholders.TITLE,
    format,
    overrides?.fontSizeScale ?? 1.0
  );

  const bodyFontSize = format === "landscape" ? 22 : 28;
  const align =
    overrides?.textAlign ??
    (tokens.layoutVariant === "centered" ? "center" : "left");
  const accent = overrides?.accentColor || tokens.accentColor;
  const bg = overrides?.backgroundOverride || tokens.background;

  // Build only non-empty metadata badges (Zero-fabrication invariant)
  const metaPills: Array<{ label: string; value: string; highlight?: boolean }> = [];
  if (placeholders.SEMESTER && placeholders.SEMESTER.trim()) {
    metaPills.push({ label: "SEMESTER", value: placeholders.SEMESTER.trim() });
  }
  if (placeholders.ACADEMIC_YEAR && placeholders.ACADEMIC_YEAR.trim()) {
    metaPills.push({
      label: "ACADEMIC YEAR",
      value: placeholders.ACADEMIC_YEAR.trim(),
    });
  }
  const pubDate = placeholders.PUBLISHED_DATE || placeholders.IMPORTANT_DATE;
  if (pubDate && pubDate.trim()) {
    metaPills.push({
      label: "PUBLISHED",
      value: pubDate.trim(),
    });
  }
  if (placeholders.DEADLINE && placeholders.DEADLINE.trim()) {
    metaPills.push({
      label: "DEADLINE",
      value: placeholders.DEADLINE.trim(),
      highlight: true,
    });
  }
  if (placeholders.EXAM_DATE && placeholders.EXAM_DATE.trim()) {
    metaPills.push({
      label: "EXAM DATE",
      value: placeholders.EXAM_DATE.trim(),
      highlight: true,
    });
  }
  if (placeholders.OFFICIAL_REF && placeholders.OFFICIAL_REF.trim()) {
    metaPills.push({
      label: "KTU REF",
      value: placeholders.OFFICIAL_REF.trim(),
    });
  }

  const malayalamSub = placeholders.MALAYALAM_SUBHEADING?.trim() || "";
  const sourceText = placeholders.SOURCE || "Official Source: ktu.edu.in";
  const footerText =
    placeholders.FOOTER ||
    "APJ Abdul Kalam Technological University • B.Tech Updates";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${dims.width}px;
      height: ${dims.height}px;
      background: ${bg};
      font-family: ${tokens.fontFamilyBody};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: ${format === "landscape" ? "44px 56px" : "68px"};
      overflow: hidden;
      position: relative;
    }
    .poster-card {
      width: 100%;
      height: 100%;
      background: ${tokens.cardSurface};
      border: ${tokens.borderStyle};
      border-radius: 36px;
      padding: ${format === "landscape" ? "40px 48px" : "64px"};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 25px 60px -15px rgba(0,0,0,0.22);
      text-align: ${align};
    }
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .category-badge {
      display: inline-flex;
      align-items: center;
      padding: 12px 26px;
      border-radius: 999px;
      background: ${tokens.badgeBg};
      color: ${tokens.badgeText};
      font-weight: 800;
      font-size: ${format === "landscape" ? "18px" : "22px"};
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .ktu-brand {
      display: flex;
      align-items: center;
      gap: 14px;
      color: ${tokens.primaryText};
      font-weight: 700;
      font-size: 22px;
    }
    .ktu-crest {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: ${accent};
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 20px;
    }
    .main-content {
      margin: auto 0;
      display: flex;
      flex-direction: column;
      gap: ${format === "landscape" ? "18px" : "28px"};
    }
    .accent-bar {
      width: 96px;
      height: 8px;
      border-radius: 999px;
      background: ${accent};
      margin: ${align === "center" ? "0 auto" : align === "right" ? "0 0 0 auto" : "0"};
    }
    .malayalam-subheading {
      font-family: 'Noto Sans Malayalam', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: ${accent};
      line-height: 1.3;
    }
    .title {
      font-family: ${tokens.fontFamilyHeading};
      color: ${tokens.primaryText};
      font-size: ${titleFontSize}px;
      font-weight: 800;
      line-height: 1.22;
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: ${format === "landscape" ? 3 : 5};
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .description {
      color: ${tokens.secondaryText};
      font-size: ${bodyFontSize}px;
      line-height: 1.5;
      font-weight: 500;
      display: -webkit-box;
      -webkit-line-clamp: ${format === "landscape" ? 2 : 4};
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .meta-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: ${align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"};
      margin-top: 8px;
    }
    .meta-pill {
      padding: 14px 24px;
      border-radius: 18px;
      background: rgba(148, 163, 184, 0.12);
      border-left: 5px solid ${accent};
      text-align: left;
    }
    .meta-pill.highlight {
      background: ${tokens.badgeBg};
      border-left-color: ${accent};
    }
    .meta-label {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: ${tokens.secondaryText};
      text-transform: uppercase;
    }
    .meta-value {
      font-size: 22px;
      font-weight: 700;
      color: ${tokens.primaryText};
      margin-top: 4px;
    }
    .footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 24px;
      border-top: 1px solid rgba(148, 163, 184, 0.22);
      color: ${tokens.secondaryText};
      font-size: 18px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="poster-card">
    <div class="top-bar">
      <div class="category-badge">${escapeHtml(placeholders.CATEGORY)}</div>
      ${
        overrides?.logoPosition !== "hidden"
          ? `<div class="ktu-brand"><div class="ktu-crest">KTU</div><span>B.Tech Official</span></div>`
          : ""
      }
    </div>
    <div class="main-content">
      <div class="accent-bar"></div>
      ${
        malayalamSub
          ? `<div class="malayalam-subheading">${escapeHtml(malayalamSub)}</div>`
          : ""
      }
      <h1 class="title">${escapeHtml(placeholders.TITLE)}</h1>
      ${
        placeholders.DESCRIPTION
          ? `<p class="description">${escapeHtml(placeholders.DESCRIPTION)}</p>`
          : ""
      }
      ${
        metaPills.length > 0
          ? `<div class="meta-grid">
              ${metaPills
                .map(
                  pill => `
                <div class="meta-pill ${pill.highlight ? "highlight" : ""}">
                  <div class="meta-label">${escapeHtml(pill.label)}</div>
                  <div class="meta-value">${escapeHtml(pill.value)}</div>
                </div>`
                )
                .join("")}
            </div>`
          : ""
      }
    </div>
    <div class="footer-bar">
      <span>${escapeHtml(sourceText)}</span>
      <span>${escapeHtml(footerText)}</span>
    </div>
  </div>
</body>
</html>`;
}
