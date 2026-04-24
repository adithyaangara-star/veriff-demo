/** Veriff REST paths (relative to API base URL). */
export const VERIFF_API_PATHS = {
  sessions: "/sessions",
} as const;

export const veriffSessionDecisionPath = (sessionId: string): string =>
  `${VERIFF_API_PATHS.sessions}/${sessionId}/decision`;

/** Session `verification` payload defaults sent to Veriff. */
export const VERIFF_VERIFICATION_DEFAULTS = {
  lang: "en",
  selfieFeature: "selfid",
} as const;
