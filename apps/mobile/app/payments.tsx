import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { api } from "../src/api";

const COLORS: Record<string, string> = {
  HELD: "#5eead4",
  RELEASED: "#34d399",
  REFUNDED: "#97a3be",
  PENDING: "#ffb347",
  FAILED: "#f87171",
};

export default function Payments() {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.myPayments().then(setItems).catch(() => setError(true));
  }, []);

  return (
    <View style={s.c}>
      <Text style={s.title}>💳 Ödemelerim</Text>
      {error && <Text style={s.meta}>{t("errors.unauthorized")}</Text>}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.listing?.title ?? item.listingId}</Text>
              <Text style={s.meta}>
                {Number(item.amount).toLocaleString()} {item.currency} · komisyon{" "}
                {Number(item.commission).toLocaleString()} {item.currency}
              </Text>
            </View>
            <Text style={[s.badge, { color: COLORS[item.status] ?? "#eaf0ff" }]}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={!error ? <Text style={s.meta}>—</Text> : null}
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#0f1420", padding: 16 },
  title: { color: "#eaf0ff", fontSize: 22, fontWeight: "800", marginBottom: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b2335",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  name: { color: "#eaf0ff", fontWeight: "700" },
  meta: { color: "#97a3be", fontSize: 13, marginTop: 4 },
  badge: { fontWeight: "800", fontSize: 12 },
});
