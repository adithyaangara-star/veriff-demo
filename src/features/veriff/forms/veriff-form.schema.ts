import * as yup from "yup";

import type { FlowMode } from "@/src/features/veriff/types/veriff";

export type VeriffFormValues = {
  firstName: string;
  lastName: string;
  idNumber?: string;
  documentNumber: string;
  documentType: "PASSPORT" | "ID_CARD" | "DRIVERS_LICENSE";
  documentCountry: string;
  flowMode: FlowMode;
};

export const veriffFormSchema: yup.ObjectSchema<VeriffFormValues> = yup
  .object({
    firstName: yup.string().trim().required("First name is required"),
    lastName: yup.string().trim().required("Last name is required"),
    idNumber: yup.string().trim().optional(),
    documentNumber: yup.string().trim().required("Document number is required"),
    documentType: yup
      .mixed<VeriffFormValues["documentType"]>()
      .oneOf(["PASSPORT", "ID_CARD", "DRIVERS_LICENSE"])
      .required(),
    documentCountry: yup.string().trim().length(2, "Use 2-letter country code").required(),
    flowMode: yup.mixed<FlowMode>().oneOf(["doc-only", "doc-selfie"]).required(),
  })
  .required();
