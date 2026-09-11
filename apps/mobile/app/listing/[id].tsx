import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { api } from "../../src/api";

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const [listing, setListing] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    if (id) api.listing(id).then(setListing).catch(() => setListing(null));
  }, [id]);

  async function sendReview() {
    if (!rating) {
      Alert.alert("⚠️", t("review.rating"));
      return;
    }
    try {
      await api.createReview(String(id), rating);
      setRated(true);
    } catch {
      Alert.alert("⚠️", t("errors.generic"));
    }
  }

  if (!listing) return <View style={s.c}><Text style={s.meta}>{t("common.loading")}</Text></View>;

  return (
    <ScrollView style={s.c}>
      <Text style={s.title}>{listing.title}</Text>
      <Text style={s.meta}>
        📍 {listing.city?.name} · {listing.offerCount} {t("listing.offers")}
      </Text>
      <Text style={s.desc}>{listing.description}</Text>

      <Text style={s.section}>{listing.offerCount} {t("listing.offers")}</Text>
      {(listing.offers ?? []).map((o: any) => (
        <View key={o.id} style={s.offer}>
          <View style={s.offerTop}>
            <Text style={s.who}>{o.provider?.displayName}</Text>
            <Text style={s.price}>{Number(o.price).toLocaleString()} {o.currency}</Text>
          </View>
          <Text style={s.meta}>{o.message}</Text>
        </View>
      ))}
      {(!listing.offers || listing.offers.length === 0) && (
        <Text style={s.meta}>{t("listing.noOffers")}</Text>
      )}

      {/* İş sonrası puanlama */}
      <Text style={s.section}>⭐ {t("review.leaveReview")}</Text>
      {rated ? (
        <Text style={[s.meta, { color: "#34d399" }]}>⭐ {t("review.rating")} ✓</Text>
      ) : (
        <View>
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Text style={{ fontSize: 34, color: n <= rating ? "#ffc14d" : "#3a4560" }}>
                  {n <= rating ? "★" : "☆"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.btn} onPress={sendReview}>
            <Text style={s.btnText}>{t("review.leaveReview")} →</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#0f1420", padding: 16 },
  title: { color: "#eaf0ff", fontSize: 24, fontWeight: "800" },
  meta: { color: "#97a3be", fontSize: 14, marginTop: 6 },
  desc: { color: "#cbd5ef", marginTop: 14, lineHeight: 22 },
  section: { color: "#eaf0ff", fontSize: 18, fontWeight: "700", marginTop: 24, marginBottom: 10 },
  offer: { backgroundColor: "#1b2335", borderRadius: 12, padding: 14, marginBottom: 10 },
  offerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  who: { color: "#eaf0ff", fontWeight: "700" },
  price: { color: "#ffb347", fontWeight: "800", fontSize: 16 },
  btn: { backgroundColor: "#ff7a1a", borderRadius: 12, padding: 14, alignItems: "center" },
  btnText: { color: "#1a1205", fontWeight: "800", fontSize: 15 },
});
