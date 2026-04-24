import Constants from "expo-constants";

type ExpoExtra = {
  veriffApiUrl?: string;
  veriffApiToken?: string;
  veriffApiSecret?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

const must = (value: string | undefined, envKey: string): string => {
  if (!value?.trim()) {
    throw new Error(`Missing ${envKey} (or expo extra equivalent).`);
  }
  return value.trim();
};

const veriffApiUrl =
  extra.veriffApiUrl ??
  process.env.EXPO_PUBLIC_VERIFF_API_URL ??
  "https://api.veriff.me/v1";

const veriffApiToken = must(
  extra.veriffApiToken ?? process.env.EXPO_PUBLIC_VERIFF_API_TOKEN,
  "EXPO_PUBLIC_VERIFF_API_TOKEN",
);

const veriffApiSecret = must(
  extra.veriffApiSecret ?? process.env.EXPO_PUBLIC_VERIFF_API_SECRET,
  "EXPO_PUBLIC_VERIFF_API_SECRET",
);

export const env = {
  veriffApiUrl: veriffApiUrl.replace(/\/$/, ""),
  veriffApiToken,
  veriffApiSecret,
} as const;
