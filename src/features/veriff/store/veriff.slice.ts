import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { FlowMode } from "@/src/features/veriff/types/veriff";

type VeriffState = {
  sessionId: string | null;
  verificationUrl: string | null;
  flowMode: FlowMode;
};

const initialState: VeriffState = {
  sessionId: null,
  verificationUrl: null,
  flowMode: "doc-selfie",
};

const veriffSlice = createSlice({
  name: "veriff",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ sessionId: string; flowMode: FlowMode; verificationUrl?: string }>,
    ) {
      state.sessionId = action.payload.sessionId;
      state.verificationUrl = action.payload.verificationUrl ?? null;
      state.flowMode = action.payload.flowMode;
    },
    resetVerification() {
      return initialState;
    },
  },
});

export const { setSession, resetVerification } = veriffSlice.actions;
export const veriffReducer = veriffSlice.reducer;
