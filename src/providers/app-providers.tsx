import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { Colors } from "@/src/shared/constants/colors";
import { queryClient } from "@/src/shared/lib/query/query-client";
import { persistor, store } from "@/src/shared/lib/store/store";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const bootstrap = async () => {
      setReady(true);
      await SplashScreen.hideAsync();
    };

    bootstrap().catch(async () => {
      setReady(true);
      await SplashScreen.hideAsync();
    });
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors.background,
            }}
          >
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        }
      >
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </PersistGate>
    </Provider>
  );
};
