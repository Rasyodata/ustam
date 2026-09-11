import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../src/i18n";
import { usePushRegistration } from "../src/push";

export default function RootLayout() {
  usePushRegistration();
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f1420" },
          headerTintColor: "#eaf0ff",
          contentStyle: { backgroundColor: "#0f1420" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Ustam" }} />
        <Stack.Screen name="listing/[id]" options={{ title: "İlan" }} />
        <Stack.Screen name="post" options={{ title: "İlan Ver" }} />
        <Stack.Screen name="payments" options={{ title: "Ödemelerim" }} />
        <Stack.Screen name="login" options={{ title: "Giriş" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
