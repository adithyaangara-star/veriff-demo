import type { VeriffFormValues } from "@/src/features/veriff/forms/veriff-form.schema";

export const SESSION_FORM_DOC_TYPES: VeriffFormValues["documentType"][] = [
  "PASSPORT",
  "ID_CARD",
  "DRIVERS_LICENSE",
];

/** Chip labels (API values stay PASSPORT / ID_CARD / DRIVERS_LICENSE). */
export const DOCUMENT_TYPE_LABELS: Record<
  VeriffFormValues["documentType"],
  string
> = {
  PASSPORT: "PASSPORT",
  ID_CARD: "ID CARD",
  DRIVERS_LICENSE: "DRIVERS LICENSE",
};

export const SESSION_FORM_FLOW_MODES: VeriffFormValues["flowMode"][] = [
  "doc-only",
  "doc-selfie",
];
