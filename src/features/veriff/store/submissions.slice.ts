import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { SessionStatus } from "@/src/features/veriff/types/veriff";

export type StoredSubmission = {
  serial: number;
  sessionId: string;
  status: SessionStatus;
  createdAt: string;
  reason?: string;
  code?: number;
};

export type SubmissionsState = {
  items: StoredSubmission[];
  nextSerial: number;
};

const initialState: SubmissionsState = {
  items: [],
  nextSerial: 1,
};

const submissionsSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    appendSubmission(
      state,
      action: PayloadAction<{
        sessionId: string;
        status?: StoredSubmission["status"];
      }>,
    ) {
      const status = action.payload.status ?? "created";
      state.items.push({
        serial: state.nextSerial,
        sessionId: action.payload.sessionId,
        status,
        createdAt: new Date().toISOString(),
      });
      state.nextSerial += 1;
    },
    updateSubmissionStatus(
      state,
      action: PayloadAction<{
        sessionId: string;
        status: StoredSubmission["status"];
        reason?: string;
        code?: number;
      }>,
    ) {
      const item = state.items.find((i) => i.sessionId === action.payload.sessionId);
      if (!item) {
        return;
      }
      item.status = action.payload.status;
      if (action.payload.reason !== undefined) {
        item.reason = action.payload.reason;
      }
      if (action.payload.code !== undefined) {
        item.code = action.payload.code;
      }
    },
  },
});

export const { appendSubmission, updateSubmissionStatus } = submissionsSlice.actions;
export const submissionsReducer = submissionsSlice.reducer;
