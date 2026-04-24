import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { veriffApi } from "@/src/features/veriff/api/veriff.api";
import { PendingStrings } from "@/src/features/veriff/constants/strings";
import { VERIFF_STATUS_POLL_INTERVAL_MS } from "@/src/features/veriff/constants/timing";
import { updateSubmissionStatus } from "@/src/features/veriff/store/submissions.slice";
import { resetVerification } from "@/src/features/veriff/store/veriff.slice";
import { Colors } from "@/src/shared/constants/colors";
import { Layout } from "@/src/shared/constants/layout";
import { useAppDispatch, useAppSelector } from "@/src/shared/lib/store/store";

export const VeriffPendingScreen = () => {
  const dispatch = useAppDispatch();
  const sessionId = useAppSelector((state) => state.veriff.sessionId);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!sessionId) {
      router.replace({
        pathname: "/verification/failure" as never,
        params: { reason: PendingStrings.missingSessionReason },
      });
      return;
    }

    let active = true;
    const poll = async () => {
      try {
        const status = await veriffApi.getStatus(sessionId);
        if (!active) {
          return;
        }
        dispatch(
          updateSubmissionStatus({
            sessionId,
            status: status.status,
            reason: status.reason,
            code: status.code,
          }),
        );
        if (status.status === "approved") {
          router.replace("/verification/success" as never);
          return;
        }
        if (status.status === "declined" || status.status === "rejected") {
          router.replace({
            pathname: "/verification/failure" as never,
            params: { reason: status.reason ?? PendingStrings.declinedFallback },
          });
          return;
        }
        if (status.status === "resubmission") {
          router.replace({
            pathname: "/verification/resubmission" as never,
            params: {
              reason: status.reason ?? PendingStrings.resubmissionFallback,
            },
          });
          return;
        }
        setError(null);
      } catch (e) {
        if (!active) {
          return;
        }
        setError((e as Error).message);
      }
    };

    void poll();
    const timer = setInterval(() => {
      void poll();
    }, VERIFF_STATUS_POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [dispatch, sessionId]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.accent} size="large" />
      <Text style={styles.title}>{PendingStrings.title}</Text>
      <Text style={styles.body}>{PendingStrings.body}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => {
          dispatch(resetVerification());
          router.replace("/");
        }}
      >
        <Text style={styles.secondaryText}>{PendingStrings.continueHome}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 14,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  body: {
    color: Colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  error: { color: Colors.error, fontSize: 13, textAlign: "center" },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Layout.radiusLg,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryText: { color: Colors.textSecondary, fontWeight: "700" },
});
