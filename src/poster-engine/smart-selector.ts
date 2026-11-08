import { BTechCategory } from "../db/schema/poster-platform.js";
import { CATEGORY_TO_TEMPLATE_MAP } from "../constants/categories.js";
import {
  PREDEFINED_POSTER_TEMPLATES,
  PosterTemplateDefinition,
} from "./templates-seed.js";

export interface SelectorOptions {
  category: BTechCategory;
  title?: string;
  isUrgent?: boolean;
  preferredTemplateId?: string;
}

export function selectTemplateForAnnouncement(
  options: SelectorOptions
): PosterTemplateDefinition {
  const { category, title = "", isUrgent = false, preferredTemplateId } = options;

  // 1. Manual user or system override
  if (preferredTemplateId) {
    const matched = PREDEFINED_POSTER_TEMPLATES.find(
      t => t.id === preferredTemplateId
    );
    if (matched) return matched;
  }

  // 2. High-urgency keyword detection
  const lowerTitle = title.toLowerCase();
  const hasUrgentKeyword =
    isUrgent ||
    lowerTitle.includes("postponed") ||
    lowerTitle.includes("rescheduled") ||
    lowerTitle.includes("urgent") ||
    lowerTitle.includes("alert") ||
    lowerTitle.includes("attention");

  if (hasUrgentKeyword) {
    const alertTemplate = PREDEFINED_POSTER_TEMPLATES.find(
      t => t.id === "bold-exam-alert"
    );
    if (alertTemplate) return alertTemplate;
  }

  // 3. Category-to-template deterministic mapping
  const mappedTemplateId = CATEGORY_TO_TEMPLATE_MAP[category];
  if (mappedTemplateId) {
    const template = PREDEFINED_POSTER_TEMPLATES.find(
      t => t.id === mappedTemplateId
    );
    if (template) return template;
  }

  // 4. Default fallback to minimal-academic or first template
  return (
    PREDEFINED_POSTER_TEMPLATES.find(t => t.id === "minimal-academic") ??
    PREDEFINED_POSTER_TEMPLATES[0]!
  );
}

