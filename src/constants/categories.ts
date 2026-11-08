import { BTechCategory } from "../db/schema/poster-platform.js";

export const CATEGORY_TO_TEMPLATE_MAP: Record<BTechCategory, string> = {
  "Examination Notifications": "bold-exam-alert",
  "Examination Results": "results-announcement",
  "Registration": "registration-reminder",
  "Academic Notifications": "minimal-academic",
  "Time Table": "examination-timetable",
  "Examination Schedule": "modern-gradient",
  "Revaluation": "important-notification",
  "Supplementary Examinations": "bold-exam-alert",
  "Circulars": "academic-circular",
  "Fee Notifications": "corporate-blue",
  "Student Services": "clean-white",
  "College Notifications": "corporate-blue",
  "Academic Calendar": "minimal-academic",
  "Other Notifications": "premium-dark",
};

export interface CategoryInfo {
  name: BTechCategory;
  suggestedTemplateId: string;
  description: string;
}

export const CATEGORY_METADATA: CategoryInfo[] = [
  {
    name: "Examination Notifications",
    suggestedTemplateId: "bold-exam-alert",
    description: "Official notifications regarding regular, supplementary, and special B.Tech examinations.",
  },
  {
    name: "Examination Results",
    suggestedTemplateId: "results-announcement",
    description: "Provisional and regular semester examination results, grade cards, and pass percentages.",
  },
  {
    name: "Registration",
    suggestedTemplateId: "registration-reminder",
    description: "Course selection, portal exam registration deadlines, and college verification timelines.",
  },
  {
    name: "Academic Notifications",
    suggestedTemplateId: "minimal-academic",
    description: "Curriculum revisions, scheme rules, honours & minor regulations, and credit transfers.",
  },
  {
    name: "Time Table",
    suggestedTemplateId: "examination-timetable",
    description: "Slot-wise and date-wise exam timetables and session schedules.",
  },
  {
    name: "Examination Schedule",
    suggestedTemplateId: "modern-gradient",
    description: "Rescheduled dates, postponed exams, and exam session timing changes.",
  },
  {
    name: "Revaluation",
    suggestedTemplateId: "important-notification",
    description: "Revaluation fees, answer script copy applications, and scrutiny procedures.",
  },
  {
    name: "Supplementary Examinations",
    suggestedTemplateId: "bold-exam-alert",
    description: "Special and regular supplementary exams for junior/senior batches.",
  },
  {
    name: "Circulars",
    suggestedTemplateId: "academic-circular",
    description: "Official university circulars, Syndicate directives, and institution guidelines.",
  },
  {
    name: "Fee Notifications",
    suggestedTemplateId: "corporate-blue",
    description: "Examination fees, late remittance fines, super fines, and e-payment portals.",
  },
  {
    name: "Student Services",
    suggestedTemplateId: "clean-white",
    description: "Grace marks, sports/arts concessions, migration certificates, and transcripts.",
  },
  {
    name: "College Notifications",
    suggestedTemplateId: "corporate-blue",
    description: "Inter-college transfers, principal directives, and college affiliation notices.",
  },
  {
    name: "Academic Calendar",
    suggestedTemplateId: "minimal-academic",
    description: "Semester working days, series test schedules, and end-semester commencement dates.",
  },
  {
    name: "Other Notifications",
    suggestedTemplateId: "premium-dark",
    description: "General administrative, holiday, and miscellaneous university announcements.",
  },
];

