import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { api } from "../src/api";

export default function Post() {
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function submit() {
    try {
      await api.createListing({ title, description, urgency: "FLEXIBLE" });
      Alert.alert("✅", t("notifications.listingMatch"));
      router.back();
    } catch {
      Alert.alert("⚠️", t("errors.generic"));
    }
  }

  return (
    <View style={s.c}>
      <Text style={s.label}>{t("listing.title")}</Text>
      <TextInput value={title} onChangeText={setTitle} style={s.input} placeholderTextColor="#97a3be" />
      <Text style={s.label}>{t("listing.description")}</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={[s.input, { height: 120 }]}
        placeholderTextColor="#97a3be"
      />
      <TouchableOpacity style={s.btn} onPress={submit}>
        <Text style={s.btnText}>{t("listing.create")} →</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#0f1420", padding: 16 },
  label: { color: "#97a3be", marginTop: 14, marginBottom: 6, fontWeight: "600" },
  input: { backgroundColor: "#1b2335", borderRadius: 12, padding: 14, color: "#eaf0ff" },
  btn: { backgroundColor: "#ff7a1a", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 24 },
  btnText: { color: "#1a1205", fontWeight: "800", fontSize: 16 },
});
