import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

import { submissionsReducer } from "@/src/features/veriff/store/submissions.slice";
import { veriffReducer } from "@/src/features/veriff/store/veriff.slice";
import { persistStorage } from "@/src/shared/lib/store/persist-storage";

const rootReducer = combineReducers({
  veriff: veriffReducer,
  submissions: submissionsReducer,
});

const persistConfig = {
  key: "veriffDemo",
  version: 1,
  storage: persistStorage,
  whitelist: ["submissions"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
