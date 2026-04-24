import axios, { isAxiosError } from "axios";

import {
  VERIFF_API_PATHS,
  VERIFF_VERIFICATION_DEFAULTS,
  veriffSessionDecisionPath,
} from "@/src/features/veriff/constants/endpoints";
import { ApiMessages, VeriffLogPrefix } from "@/src/features/veriff/constants/strings";
import { VERIFF_HTTP_TIMEOUT_MS } from "@/src/features/veriff/constants/timing";
import { signPayload } from "@/src/features/veriff/lib/veriff-signature";
import type {
  SessionStatus,
  SessionStatusResponse,
  VeriffSessionResponse,
  VeriffStartPayload,
} from "@/src/features/veriff/types/veriff";
import { env } from "@/src/shared/config/env";

const normalizeStatus = (
  value: string | undefined,
  action?: string,
  reason?: string,
): SessionStatus | undefined => {
  const normalized = value?.trim().toLowerCase();
  const normalizedAction = action?.trim().toLowerCase();
  const normalizedReason = reason?.trim().toLowerCase();

  if (
    normalizedAction?.includes("resubmission") ||
    normalizedAction?.includes("resubmit") ||
    normalizedReason?.includes("resubmission") ||
    normalizedReason?.includes("resubmit")
  ) {
    return "resubmission";
  }

  if (!normalized) {
    return undefined;
  }
  if (normalized === "approved") {
    return "approved";
  }
  if (
    normalized === "declined" ||
    normalized === "rejected" ||
    normalized === "abandoned" ||
    normalized === "expired" ||
    normalized === "canceled" ||
    normalized === "cancelled"
  ) {
    return "rejected";
  }
  if (
    normalized.includes("resubmission") ||
    normalized.includes("resubmit") ||
    normalized.includes("retry")
  ) {
    return "resubmission";
  }
  if (normalized === "submitted") {
    return "submitted";
  }
  if (normalized === "created") {
    return "created";
  }
  if (normalized === "pending") {
    return "pending";
  }
  return undefined;
};

const toErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? error.message;
  }
  return (error as Error).message;
};

const buildSessionBody = (body: VeriffStartPayload) => {
  const person: {
    firstName: string;
    lastName: string;
    idNumber?: string;
  } = {
    firstName: body.firstName,
    lastName: body.lastName,
  };
  if (body.idNumber?.trim()) {
    person.idNumber = body.idNumber.trim();
  }

  return {
    verification: {
      person,
      document: {
        number: body.documentNumber,
        type: body.documentType,
        country: body.documentCountry,
      },
      features:
        body.flowMode === "doc-selfie"
          ? ([VERIFF_VERIFICATION_DEFAULTS.selfieFeature] as const)
          : [],
      lang: VERIFF_VERIFICATION_DEFAULTS.lang,
      vendorData: body.vendorData,
      timestamp: new Date().toISOString(),
    },
  };
};

type VeriffStartApiResponse = {
  verification: { id: string; url?: string };
};

type VeriffDecisionResponse = {
  status?: string;
  verification?: {
    id?: string;
    status?: string;
    reason?: string | null;
    reasonCode?: string | number | null;
    code?: number;
  } | null;
};

const veriffClient = axios.create({
  baseURL: env.veriffApiUrl,
  timeout: VERIFF_HTTP_TIMEOUT_MS,
});

export const veriffApi = {
  startSession: async (
    payload: VeriffStartPayload,
  ): Promise<VeriffSessionResponse> => {
    const dataBody = buildSessionBody(payload);
    try {
      const { data } = await veriffClient.post<VeriffStartApiResponse>(
        VERIFF_API_PATHS.sessions,
        dataBody,
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth-client": env.veriffApiToken,
            "x-hmac-signature": signPayload(dataBody, env.veriffApiSecret),
          },
        },
      );
      return {
        sessionId: data.verification.id,
        status: "created",
        verificationUrl: data.verification.url,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  getStatus: async (sessionId: string): Promise<SessionStatusResponse> => {
    const path = veriffSessionDecisionPath(sessionId);
    const url = `${env.veriffApiUrl}${path}`;
    try {
      const { data, status: httpStatus } =
        await veriffClient.get<VeriffDecisionResponse>(path, {
          headers: {
            "x-auth-client": env.veriffApiToken,
            "x-hmac-signature": signPayload(sessionId, env.veriffApiSecret),
          },
        });
      if (__DEV__) {
        console.log(`${VeriffLogPrefix} decision GET`, {
          url,
          httpStatus,
          body: data,
        });
      }
      const v = data.verification;

      // Veriff returns HTTP 200 with verification: null while no decision exists yet.
      if (v == null && data.status === "success") {
        if (__DEV__) {
          console.log(`${VeriffLogPrefix} decision mapped`, {
            sessionId,
            rawStatus: null,
            mappedStatus: "submitted",
            note: ApiMessages.decisionLogVerificationNull,
          });
        }
        return {
          sessionId,
          status: "submitted",
          updatedAt: new Date().toISOString(),
        };
      }

      const reasonHint =
        (typeof v?.reason === "string" && v.reason.trim() !== ""
          ? v.reason
          : undefined) ??
        (v?.reasonCode != null && String(v.reasonCode).trim() !== ""
          ? String(v.reasonCode)
          : undefined);

      const decisionStatus = normalizeStatus(
        v?.status,
        undefined,
        reasonHint,
      );
      let status: SessionStatus;
      if (
        decisionStatus === "approved" ||
        decisionStatus === "rejected" ||
        decisionStatus === "resubmission"
      ) {
        status = decisionStatus;
      } else {
        status = "pending";
      }

      const raw = v?.status?.trim().toLowerCase();
      let reasonOut =
        typeof v?.reason === "string" && v.reason.trim() !== "" ? v.reason : undefined;
      if (status === "rejected" && raw === "abandoned") {
        reasonOut = reasonOut ?? ApiMessages.abandonedDefault;
      }
      if (status === "rejected" && (raw === "expired" || raw === "canceled" || raw === "cancelled")) {
        reasonOut = reasonOut ?? ApiMessages.sessionEndedDefault;
      }

      if (__DEV__) {
        console.log(`${VeriffLogPrefix} decision mapped`, {
          sessionId,
          rawStatus: v?.status,
          mappedStatus: status,
          reason: reasonOut,
          code: v?.code,
        });
      }
      return {
        sessionId,
        status,
        reason: reasonOut,
        code: v?.code,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (__DEV__) {
        if (isAxiosError(error)) {
          console.log(`${VeriffLogPrefix} decision GET failed`, {
            url,
            httpStatus: error.response?.status,
            responseData: error.response?.data,
            message: error.message,
          });
        } else {
          console.log(`${VeriffLogPrefix} decision GET failed`, { url, error });
        }
      }
      return {
        sessionId,
        status: "pending",
        updatedAt: new Date().toISOString(),
      };
    }
  },
};
