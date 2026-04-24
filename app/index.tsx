import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HomeStrings } from "@/src/features/veriff/constants/strings";
import { Colors } from "@/src/shared/constants/colors";
import { Layout } from "@/src/shared/constants/layout";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{HomeStrings.title}</Text>
      <Text style={styles.subtitle}>{HomeStrings.subtitle}</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push("/verification")}
      >
        <Text style={styles.buttonText}>{HomeStrings.ctaPrimary}</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.push("/submissions")}
      >
        <Text style={styles.secondaryButtonText}>{HomeStrings.ctaSubmissions}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    gap: 20,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: Colors.textDim,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Layout.radiusLg,
    marginTop: 8,
  },
  buttonText: {
    color: Colors.onAccent,
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceMuted,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Layout.radiusLg,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 17,
    fontWeight: "700",
  },
});
