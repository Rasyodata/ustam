import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/** İzin ister, Expo push token alır ve backend'e kaydeder. */
export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null; // emülatörde push yok

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  const auth = await AsyncStorage.getItem("accessToken");
  if (auth && token) {
    await fetch(`${BASE}/push/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth}` },
      body: JSON.stringify({ token, platform: Platform.OS }),
    }).catch(() => void 0);
  }
  return token;
}

/** App açılışında/oturum sonrası push kaydını tetikleyen hook. */
export function usePushRegistration() {
  useEffect(() => {
    registerForPush().catch(() => void 0);
  }, []);
}
