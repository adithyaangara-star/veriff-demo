/** User-facing copy and default API messages for the Veriff flow. */

export const HomeStrings = {
  title: "Veriff demo",
  subtitle:
    "Start identity verification with a short form, then complete the flow in the secure browser view.",
  ctaPrimary: "Let's go",
  ctaSubmissions: "Submissions",
} as const;

export const SubmissionsStrings = {
  title: "Submissions",
  back: "Back",
  refresh: "Refresh",
  empty: "No submissions yet.",
  columnSerial: "#",
  columnSession: "Session",
  columnStatus: "Status",
} as const;

export const SessionFormStrings = {
  heading: "Session details",
  countryHint: "Use a 2-letter country code (e.g. US).",
  startVerification: "Start verification",
  backToHome: "Back to home",
  alertSessionFailedTitle: "Session failed",
  alertNoUrl: "No verification URL returned.",
  labelFirstName: "First name",
  labelLastName: "Last name",
  labelIdNumber: "ID number (optional)",
  labelDocumentNumber: "Document number",
  labelDocumentCountry: "Document country",
  sectionDocumentType: "Document type",
  sectionFlow: "Flow",
  phFirstName: "First name",
  phLastName: "Last name",
  phOptional: "Optional",
  phDocumentNumber: "Document number",
  phCountry: "US",
  /** Prefix for `vendorData` sent to Veriff (`app-<timestamp>`). */
  vendorDataPrefix: "app-",
} as const;

export const PendingStrings = {
  title: "Verification pending",
  body: "Please wait, verification under process. We will check status every 10 seconds.",
  continueHome: "Continue to home",
  missingSessionReason: "Session is missing.",
  declinedFallback: "Verification was declined.",
  resubmissionFallback: "Additional images/documents are required by Veriff.",
} as const;

export const SuccessStrings = {
  title: "Verification successful",
  body: "Your verification has been approved. You can continue to the home page.",
  continue: "Continue",
} as const;

export const FailureStrings = {
  title: "Verification rejected",
  defaultReason: "Verification was exited or declined. Please try again.",
  continue: "Continue",
} as const;

export const ResubmissionStrings = {
  title: "Resubmission required",
  defaultReason:
    "Veriff requested another attempt. Please review details and restart verification.",
  continue: "Continue",
} as const;

export const WebviewStrings = {
  exitReasonFlow: "Verification was exited.",
  exitReasonUser: "Verification was exited by user.",
  missingUrlReason: "Session is missing verification URL.",
  linkMissingTitle: "Verification link missing",
  goToFailure: "Go to failure",
  headerTitle: "Complete verification",
  exit: "Exit",
  submitted: "Submitted",
  requestingCamera: "Requesting camera access...",
  permissionsTitle: "Permissions needed",
  permissionsFallback: "Camera and microphone access are required.",
  openSettings: "Open settings",
  loadPageFallback: "Could not load hosted verification page.",
  permissionsRequired:
    "Camera and microphone permissions are required for verification.",
  permissionsRequestFailed: "Could not request camera permissions.",
} as const;

export const ApiMessages = {
  abandonedDefault: "Verification was not completed (abandoned).",
  sessionEndedDefault: "Verification session ended before completion.",
  decisionLogVerificationNull: "verification null — still processing",
} as const;

export const VeriffLogPrefix = "[Veriff]" as const;
