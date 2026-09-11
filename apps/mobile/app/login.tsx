import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { api } from "../src/api";

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    try {
      await api.login(email, password);
      router.replace("/");
    } catch {
      Alert.alert("⚠️", t("errors.invalidCredentials"));
    }
  }

  return (
    <View style={s.c}>
      <Text style={s.title}>{t("auth.loginTitle")}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder={t("auth.email")}
        autoCapitalize="none"
        keyboardType="email-address"
        style={s.input}
        placeholderTextColor="#97a3be"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={t("auth.password")}
        secureTextEntry
        style={s.input}
        placeholderTextColor="#97a3be"
      />
      <TouchableOpacity style={s.btn} onPress={submit}>
        <Text style={s.btnText}>{t("common.login")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#0f1420", padding: 16, justifyContent: "center" },
  title: { color: "#eaf0ff", fontSize: 24, fontWeight: "800", marginBottom: 20 },
  input: { backgroundColor: "#1b2335", borderRadius: 12, padding: 14, color: "#eaf0ff", marginBottom: 12 },
  btn: { backgroundColor: "#ff7a1a", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "#1a1205", fontWeight: "800", fontSize: 16 },
});
