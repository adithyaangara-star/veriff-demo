import { router } from "expo-router";
import { Camera } from "expo-camera";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import WebView, { type WebViewNavigation } from "react-native-webview";

import { WebviewStrings } from "@/src/features/veriff/constants/strings";
import {
  WEBVIEW_CUSTOM_URL_PROTOCOL,
  WEBVIEW_FAILURE_PATH,
  WEBVIEW_FAILURE_TITLE,
  WEBVIEW_PENDING_PATH,
  WEBVIEW_PENDING_TITLE,
  WEBVIEW_VERIFF_HOST_SUFFIX,
  WEBVIEW_VERIFF_PENDING_PATHNAME,
  WebviewAppRouteToken,
} from "@/src/features/veriff/constants/webview-url-patterns";
import { Colors } from "@/src/shared/constants/colors";
import { Layout } from "@/src/shared/constants/layout";
import { useAppSelector } from "@/src/shared/lib/store/store";

type FlowOutcome = "pending" | "failure" | null;
type CallbackTarget = "pending" | "failure" | "resubmission" | null;

function parseAppCallback(url: URL): CallbackTarget {
  const pathParts = url.pathname.toLowerCase().split("/").filter(Boolean);
  const hostPart = url.hostname.toLowerCase();
  const allParts = [hostPart, ...pathParts].filter(Boolean);

  if (allParts.includes(WebviewAppRouteToken.failure)) {
    return "failure";
  }
  if (allParts.includes(WebviewAppRouteToken.resubmission)) {
    return "resubmission";
  }
  if (
    allParts.includes(WebviewAppRouteToken.pending) ||
    allParts.includes(WebviewAppRouteToken.success)
  ) {
    return "pending";
  }

  return null;
}

function parseOutcome(url: string, title?: string): FlowOutcome {
  try {
    const u = new URL(url);
    const pathname = u.pathname.toLowerCase();
    const search = u.search.toLowerCase();
    const hash = u.hash.toLowerCase();
    const host = u.hostname.toLowerCase();

    if (u.protocol === WEBVIEW_CUSTOM_URL_PROTOCOL) {
      const callbackTarget = parseAppCallback(u);
      if (callbackTarget === "failure") {
        return "failure";
      }
      if (callbackTarget) {
        return "pending";
      }
    }

    if (
      host.endsWith(WEBVIEW_VERIFF_HOST_SUFFIX) &&
      pathname.includes(WEBVIEW_VERIFF_PENDING_PATHNAME)
    ) {
      return "pending";
    }

    const inspect = `${pathname}${search}${hash}`;
    if (WEBVIEW_FAILURE_PATH.test(inspect)) {
      return "failure";
    }
    if (WEBVIEW_PENDING_PATH.test(inspect)) {
      return "pending";
    }

    if (title) {
      if (WEBVIEW_FAILURE_TITLE.test(title)) {
        return "failure";
      }
      if (WEBVIEW_PENDING_TITLE.test(title)) {
        return "pending";
      }
    }
  } catch {
    return null;
  }

  return null;
}

export const VeriffHostedWebviewScreen = () => {
  const verificationUrl = useAppSelector(
    (state) => state.veriff.verificationUrl,
  );
  const webViewRef = React.useRef<WebView>(null);
  const [exited, setExited] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [permissionState, setPermissionState] = React.useState<
    "checking" | "granted" | "denied"
  >("checking");
  const [permissionError, setPermissionError] = React.useState<string | null>(
    null,
  );

  const goPending = React.useCallback(() => {
    setExited(true);
    webViewRef.current?.stopLoading();
    queueMicrotask(() => {
      router.replace("/verification/pending" as never);
    });
  }, []);

  const goFailure = React.useCallback((reason?: string) => {
    setExited(true);
    webViewRef.current?.stopLoading();
    queueMicrotask(() => {
      router.replace({
        pathname: "/verification/failure" as never,
        params: reason ? { reason } : undefined,
      });
    });
  }, []);

  const handleOutcome = React.useCallback(
    (outcome: FlowOutcome) => {
      if (outcome === "pending") {
        goPending();
        return true;
      }
      if (outcome === "failure") {
        goFailure(WebviewStrings.exitReasonFlow);
        return true;
      }
      return false;
    },
    [goFailure, goPending],
  );

  React.useEffect(() => {
    const requestPermissions = async () => {
      setPermissionState("checking");
      setPermissionError(null);
      try {
        const [cameraPermission, microphonePermission] = await Promise.all([
          Camera.requestCameraPermissionsAsync(),
          Camera.requestMicrophonePermissionsAsync(),
        ]);
        const granted =
          cameraPermission.granted && microphonePermission.granted;
        setPermissionState(granted ? "granted" : "denied");
        if (!granted) {
          setPermissionError(WebviewStrings.permissionsRequired);
        }
      } catch (error) {
        setPermissionState("denied");
        setPermissionError(
          error instanceof Error
            ? error.message
            : WebviewStrings.permissionsRequestFailed,
        );
      }
    };

    void requestPermissions();
  }, []);

  if (!verificationUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>{WebviewStrings.linkMissingTitle}</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => goFailure(WebviewStrings.missingUrlReason)}
        >
          <Text style={styles.primaryText}>{WebviewStrings.goToFailure}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.heading}>{WebviewStrings.headerTitle}</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => goFailure(WebviewStrings.exitReasonUser)}
          >
            <Text style={styles.secondaryText}>{WebviewStrings.exit}</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={goPending}>
            <Text style={styles.secondaryText}>{WebviewStrings.submitted}</Text>
          </Pressable>
        </View>
      </View> */}
      {loadError ? (
        <View style={styles.loadErrorBanner}>
          <Text style={styles.loadErrorText}>{loadError}</Text>
        </View>
      ) : null}
      {permissionState === "checking" ? (
        <View style={styles.permissionContainer}>
          <ActivityIndicator color={Colors.accent} />
          <Text style={styles.permissionText}>
            {WebviewStrings.requestingCamera}
          </Text>
        </View>
      ) : null}
      {permissionState === "denied" ? (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>
            {WebviewStrings.permissionsTitle}
          </Text>
          <Text style={styles.permissionText}>
            {permissionError ?? WebviewStrings.permissionsFallback}
          </Text>
          <View style={styles.permissionActions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                void Linking.openSettings();
              }}
            >
              <Text style={styles.secondaryText}>
                {WebviewStrings.openSettings}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {permissionState === "granted" && !exited ? (
        <WebView
          ref={webViewRef}
          source={{ uri: verificationUrl }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          allowsFullscreenVideo
          mixedContentMode="always"
          onShouldStartLoadWithRequest={(request) => {
            const outcome = parseOutcome(request.url);
            if (handleOutcome(outcome)) {
              return false;
            }
            return true;
          }}
          onNavigationStateChange={(navState: WebViewNavigation) => {
            const outcome = parseOutcome(navState.url, navState.title);
            handleOutcome(outcome);
          }}
          onError={(event) => {
            setLoadError(
              event.nativeEvent.description ?? WebviewStrings.loadPageFallback,
            );
          }}
          startInLoadingState
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  heading: { color: Colors.textPrimary, fontSize: 20, fontWeight: "700" },
  headerActions: { flexDirection: "row", gap: 8 },
  secondaryButton: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Layout.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 12,
  },
  loadErrorBanner: {
    backgroundColor: Colors.bannerErrorBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loadErrorText: { color: Colors.bannerErrorText, fontSize: 12 },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  permissionTitle: {
    color: Colors.textPrimary,
    fontWeight: "700",
    fontSize: 18,
  },
  permissionText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
  permissionActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: Colors.textPrimary,
    fontWeight: "800",
    fontSize: 24,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Layout.radiusLg,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryText: { color: Colors.white, fontWeight: "700" },
});
