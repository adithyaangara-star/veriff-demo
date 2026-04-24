/**
 * Heuristics for detecting Veriff hosted flow outcomes from URL / document title.
 * Tuned for demo redirects and Veriff-hosted pages.
 */

export const WEBVIEW_PENDING_PATH =
  /(?:^|[/?#])(?:submitted|submission|finished|completed|complete|success|done|result|decision|thank|thanks)(?:$|[/?#])/i;

export const WEBVIEW_FAILURE_PATH =
  /(?:^|[/?#])(?:aborted|abort|canceled|cancelled|cancel|exit|close|failure|failed)(?:$|[/?#])/i;

export const WEBVIEW_PENDING_TITLE =
  /submitted|complete|thanks|get verified|verification complete/i;

export const WEBVIEW_FAILURE_TITLE = /cancel|failed|aborted|closed|exit/i;

export const WEBVIEW_VERIFF_HOST_SUFFIX = "veriff.com";

export const WEBVIEW_VERIFF_PENDING_PATHNAME = "get-verified";

/** Deep link scheme used in `parseAppCallback`. */
export const WEBVIEW_CUSTOM_URL_PROTOCOL = "veriffdemo:" as const;

export const WebviewAppRouteToken = {
  failure: "failure",
  resubmission: "resubmission",
  pending: "pending",
  success: "success",
} as const;
