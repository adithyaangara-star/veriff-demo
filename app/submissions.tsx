import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { veriffApi } from "@/src/features/veriff/api/veriff.api";
import { SubmissionsStrings } from "@/src/features/veriff/constants/strings";
import { maskSessionId } from "@/src/features/veriff/lib/mask-session-id";
import { selectSubmissionsSorted } from "@/src/features/veriff/store/submissions.selectors";
import {
  type StoredSubmission,
  updateSubmissionStatus,
} from "@/src/features/veriff/store/submissions.slice";
import { Colors } from "@/src/shared/constants/colors";
import {
  store,
  useAppDispatch,
  useAppSelector,
} from "@/src/shared/lib/store/store";

export default function SubmissionsScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectSubmissionsSorted);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const rows = selectSubmissionsSorted(store.getState());
      for (const row of rows) {
        const status = await veriffApi.getStatus(row.sessionId);
        dispatch(
          updateSubmissionStatus({
            sessionId: row.sessionId,
            status: status.status,
            reason: status.reason,
            code: status.code,
          }),
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  return (
    <View style={styles.screen}>
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backHit}
          hitSlop={12}
        >
          <Text style={styles.backText}>{SubmissionsStrings.back}</Text>
        </Pressable>
        <Text style={styles.title}>{SubmissionsStrings.title}</Text>
        <Pressable onPress={() => void onRefresh()} style={styles.refreshHit}>
          <Text style={styles.refreshText}>{SubmissionsStrings.refresh}</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.sessionId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void onRefresh()}
            tintColor={Colors.accent}
          />
        }
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.listContent
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>{SubmissionsStrings.empty}</Text>
        }
        renderItem={({ item }: { item: StoredSubmission }) => (
          <View style={styles.row}>
            <Text style={styles.cellSerial}>{item.serial}</Text>
            <Text style={styles.cellId}>{maskSessionId(item.sessionId)}</Text>
            <Text style={styles.cellStatus}>{item.status}</Text>
          </View>
        )}
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.rowHeader}>
              <Text style={styles.headerSerial}>{SubmissionsStrings.columnSerial}</Text>
              <Text style={styles.headerId}>{SubmissionsStrings.columnSession}</Text>
              <Text style={styles.headerStatus}>{SubmissionsStrings.columnStatus}</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surfaceMuted,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  backHit: { paddingVertical: 4, paddingHorizontal: 4, minWidth: 56 },
  backText: { color: Colors.accent, fontWeight: "700", fontSize: 16 },
  refreshHit: { paddingVertical: 4, paddingHorizontal: 4, minWidth: 64 },
  refreshText: { color: Colors.accent, fontWeight: "700", fontSize: 16 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: { color: Colors.textDim, fontSize: 16 },
  rowHeader: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceMuted,
    marginBottom: 4,
  },
  headerSerial: {
    width: 40,
    color: Colors.textLabel,
    fontWeight: "700",
    fontSize: 12,
  },
  headerId: {
    flex: 1,
    color: Colors.textLabel,
    fontWeight: "700",
    fontSize: 12,
  },
  headerStatus: {
    width: 100,
    color: Colors.textLabel,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.surface,
  },
  cellSerial: {
    width: 40,
    color: Colors.textSecondary,
    fontWeight: "700",
    fontSize: 15,
  },
  cellId: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: "monospace",
  },
  cellStatus: {
    width: 100,
    color: Colors.textDim,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
  },
});
