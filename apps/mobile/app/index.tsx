import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { api } from "../src/api";
import i18n from "../src/i18n";
import { LOCALES, type Locale } from "@ustam/shared";

const FLAGS: Record<Locale, string> = { tr: "🇹🇷", en: "🇬🇧", de: "🇩🇪", fr: "🇫🇷", es: "🇪🇸" };

export default function Home() {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [offline, setOffline] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    api
      .listings()
      .then((d) => setItems(d.items ?? []))
      .catch(() => setOffline(true));
  }, []);

  return (
    <View style={s.container}>
      {/* Dil değiştirici */}
      <View style={s.langRow}>
        {LOCALES.map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => {
              i18n.changeLanguage(l);
              force((n) => n + 1);
            }}
            style={[s.langChip, i18n.language === l && s.langChipActive]}
          >
            <Text style={s.langText}>{FLAGS[l]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.hero}>{t("home.heroTitle")}</Text>
      <TextInput
        placeholder={t("common.searchPlaceholder")}
        placeholderTextColor="#97a3be"
        style={s.search}
      />

      {offline && <Text style={s.offline}>⚙️ Backend kapalı — örnek akış. `pnpm dev` ile aç.</Text>}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        style={{ marginTop: 12 }}
        renderItem={({ item }) => (
          <Link href={`/listing/${item.id}`} asChild>
            <TouchableOpacity style={s.card}>
              <Text style={s.cardIcon}>{item.category?.icon ?? "🔧"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardMeta}>
                  📍 {item.location?.cityName ?? item.city?.name} · {item.offerCount} {t("listing.offers")}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={!offline ? <Text style={s.offline}>…</Text> : null}
      />

      <Link href="/post" asChild>
        <TouchableOpacity style={s.fab}>
          <Text style={s.fabText}>＋ {t("listing.create")}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0f1420" },
  langRow: { flexDirection: "row", gap: 6, marginBottom: 14 },
  langChip: { padding: 6, borderRadius: 8, backgroundColor: "#1b2335" },
  langChipActive: { backgroundColor: "#ff7a1a" },
  langText: { fontSize: 16 },
  hero: { color: "#eaf0ff", fontSize: 24, fontWeight: "800", marginBottom: 12 },
  search: { backgroundColor: "#1b2335", borderRadius: 12, padding: 14, color: "#eaf0ff" },
  offline: { color: "#ffb347", marginTop: 12, fontSize: 13 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#1b2335",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  cardIcon: { fontSize: 30 },
  cardTitle: { color: "#eaf0ff", fontWeight: "700", fontSize: 15 },
  cardMeta: { color: "#97a3be", fontSize: 13, marginTop: 4 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: "#ff7a1a",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
  },
  fabText: { color: "#1a1205", fontWeight: "800" },
});
