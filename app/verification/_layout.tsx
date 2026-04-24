import { Stack } from "expo-router";
import React from "react";

export default function VerificationLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="webview" options={{ headerShown: false }} />
      <Stack.Screen name="pending" options={{ headerShown: false }} />
      <Stack.Screen name="success" options={{ headerShown: false }} />
      <Stack.Screen name="failure" options={{ headerShown: false }} />
      <Stack.Screen name="resubmission" options={{ headerShown: false }} />
    </Stack>
  );
}
