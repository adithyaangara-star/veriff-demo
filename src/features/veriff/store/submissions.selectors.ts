import { createSelector } from "@reduxjs/toolkit";

import type { StoredSubmission } from "@/src/features/veriff/store/submissions.slice";
import type { RootState } from "@/src/shared/lib/store/store";

const selectSubmissionsItems = (state: RootState) =>
  state.submissions?.items ?? [];

/** Ascending serial (1, 2, 3…). Memoized to keep a stable array reference when inputs are unchanged. */
export const selectSubmissionsSorted = createSelector(
  [selectSubmissionsItems],
  (items): StoredSubmission[] =>
    [...items].sort((a, b) => a.serial - b.serial),
);
