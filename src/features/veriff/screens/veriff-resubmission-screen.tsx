import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { ResubmissionStrings } from "@/src/features/veriff/constants/strings";
import { resetVerification } from "@/src/features/veriff/store/veriff.slice";
import { Colors } from "@/src/shared/constants/colors";
import { Layout } from "@/src/shared/constants/layout";
import { useAppDispatch } from "@/src/shared/lib/store/store";

export const VeriffResubmissionScreen = () => {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams<{ reason?: string }>();
  const reason = typeof params.reason === "string" ? params.reason : undefined;

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/status-resubmission.png")}
        style={styles.icon}
      />
      <Text style={styles.title}>{ResubmissionStrings.title}</Text>
      <Text style={styles.body}>{reason ?? ResubmissionStrings.defaultReason}</Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          dispatch(resetVerification());
          router.replace("/");
        }}
      >
        <Text style={styles.buttonText}>{ResubmissionStrings.continue}</Text>
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
  icon: {
    width: Layout.statusIconSize,
    height: Layout.statusIconSize,
    resizeMode: "contain",
    marginBottom: 6,
  },
  title: {
    color: Colors.accent,
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
  button: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    borderRadius: Layout.radiusLg,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  buttonText: { color: Colors.onAccent, fontWeight: "700" },
});
