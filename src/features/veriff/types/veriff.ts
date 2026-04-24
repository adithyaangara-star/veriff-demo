export type FlowMode = "doc-only" | "doc-selfie";

export type VeriffStartPayload = {
  firstName: string;
  lastName: string;
  idNumber?: string;
  documentNumber: string;
  documentType: "PASSPORT" | "ID_CARD" | "DRIVERS_LICENSE";
  documentCountry: string;
  flowMode: FlowMode;
  vendorData?: string;
};

export type VeriffSessionResponse = {
  sessionId: string;
  status: "created";
  verificationUrl?: string;
};

export type SessionStatus =
  | "created"
  | "submitted"
  | "approved"
  | "declined"
  | "rejected"
  | "resubmission"
  | "pending";

export type SessionStatusResponse = {
  sessionId: string;
  status: SessionStatus;
  code?: number;
  reason?: string;
  updatedAt?: string;
};
