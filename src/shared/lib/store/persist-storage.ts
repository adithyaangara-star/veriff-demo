import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import type { Storage } from "redux-persist";

const fileNameForKey = (key: string): string =>
  `persist_${key.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

/**
 * Avoids @react-native-async-storage/async-storage (native module can be null in some builds).
 * Native: expo-file-system documentDirectory. Web: localStorage.
 */
export const persistStorage: Storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      try {
        return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    }
    const dir = FileSystem.documentDirectory;
    if (!dir) {
      return null;
    }
    const uri = `${dir}${fileNameForKey(key)}`;
    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) {
        return null;
      }
      return await FileSystem.readAsStringAsync(uri);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
      return;
    }
    const dir = FileSystem.documentDirectory;
    if (!dir) {
      throw new Error("expo-file-system documentDirectory is unavailable");
    }
    const uri = `${dir}${fileNameForKey(key)}`;
    await FileSystem.writeAsStringAsync(uri, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
      return;
    }
    const dir = FileSystem.documentDirectory;
    if (!dir) {
      return;
    }
    const uri = `${dir}${fileNameForKey(key)}`;
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      /* ignore */
    }
  },
};
