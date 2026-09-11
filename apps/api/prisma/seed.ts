/**
 * Ustam — veritabanı seed (örnek veri).
 * Çalıştır: pnpm --filter @ustam/api prisma:seed
 */
import { PrismaClient, Prisma } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

type Tr = { tr: string; en: string; de: string; fr: string; es: string };

interface CatSeed {
  slug: string;
  icon: string;
  names: Tr;
  children?: { slug: string; names: Tr }[];
}

const CATEGORIES: CatSeed[] = [
  {
    slug: "plumbing",
    icon: "🚰",
    names: { tr: "Tesisat & Su", en: "Plumbing & Water", de: "Sanitär & Wasser", fr: "Plomberie & Eau", es: "Fontanería y Agua" },
    children: [
      { slug: "faucet-repair", names: { tr: "Musluk Tamiri", en: "Faucet Repair", de: "Wasserhahn-Reparatur", fr: "Réparation de robinet", es: "Reparación de grifo" } },
      { slug: "leak-fix", names: { tr: "Su Kaçağı", en: "Leak Fix", de: "Leckage-Reparatur", fr: "Fuite d'eau", es: "Reparación de fugas" } },
      { slug: "drain", names: { tr: "Gider Açma", en: "Drain Cleaning", de: "Rohrreinigung", fr: "Débouchage", es: "Desatasco" } },
    ],
  },
  {
    slug: "electrical",
    icon: "💡",
    names: { tr: "Elektrik", en: "Electrical", de: "Elektrik", fr: "Électricité", es: "Electricidad" },
    children: [
      { slug: "wiring", names: { tr: "Tesisat Çekimi", en: "Wiring", de: "Verkabelung", fr: "Câblage", es: "Cableado" } },
      { slug: "lighting", names: { tr: "Aydınlatma", en: "Lighting", de: "Beleuchtung", fr: "Éclairage", es: "Iluminación" } },
    ],
  },
  {
    slug: "construction",
    icon: "🏗️",
    names: { tr: "İnşaat & Tadilat", en: "Construction & Renovation", de: "Bau & Renovierung", fr: "Construction & Rénovation", es: "Construcción y Reforma" },
    children: [
      { slug: "renovation", names: { tr: "Komple Tadilat", en: "Full Renovation", de: "Komplettsanierung", fr: "Rénovation complète", es: "Reforma integral" } },
      { slug: "tiling", names: { tr: "Fayans & Seramik", en: "Tiling", de: "Fliesenarbeiten", fr: "Carrelage", es: "Alicatado" } },
    ],
  },
  { slug: "painting", icon: "🎨", names: { tr: "Boya & Badana", en: "Painting", de: "Malerarbeiten", fr: "Peinture", es: "Pintura" } },
  {
    slug: "ironwork",
    icon: "🔩",
    names: { tr: "Demir & Kaynak İşleri", en: "Ironwork & Welding", de: "Eisen- & Schweißarbeiten", fr: "Ferronnerie & Soudure", es: "Herrería y Soldadura" },
    children: [
      { slug: "railings", names: { tr: "Korkuluk & Ferforje", en: "Railings", de: "Geländer", fr: "Garde-corps", es: "Barandillas" } },
      { slug: "doors-gates", names: { tr: "Demir Kapı & Kafes", en: "Doors & Gates", de: "Türen & Tore", fr: "Portes & portails", es: "Puertas y portones" } },
    ],
  },
  { slug: "roofing", icon: "🏠", names: { tr: "Çatı & İzolasyon", en: "Roofing & Insulation", de: "Dach & Dämmung", fr: "Toiture & Isolation", es: "Tejados y Aislamiento" } },
  { slug: "appliance", icon: "🧰", names: { tr: "Beyaz Eşya Teknik Servis", en: "Appliance Repair", de: "Geräte-Reparatur", fr: "Réparation d'électroménager", es: "Reparación de electrodomésticos" } },
  {
    slug: "manufacturing",
    icon: "🏭",
    names: { tr: "İmalat & Üretim", en: "Manufacturing & Production", de: "Fertigung & Produktion", fr: "Fabrication & Production", es: "Fabricación y Producción" },
    children: [
      { slug: "metal-fab", names: { tr: "Metal İmalat", en: "Metal Fabrication", de: "Metallverarbeitung", fr: "Fabrication métallique", es: "Fabricación metálica" } },
      { slug: "furniture-make", names: { tr: "Mobilya İmalatı", en: "Furniture Making", de: "Möbelherstellung", fr: "Fabrication de meubles", es: "Fabricación de muebles" } },
    ],
  },
];

const CITIES: { name: string; code: string; districts: string[] }[] = [
  { name: "İstanbul", code: "34", districts: ["Kadıköy", "Beşiktaş", "Üsküdar", "Şişli", "Bakırköy"] },
  { name: "Ankara", code: "06", districts: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak"] },
  { name: "İzmir", code: "35", districts: ["Konak", "Karşıyaka", "Bornova", "Buca"] },
  { name: "Bursa", code: "16", districts: ["Osmangazi", "Nilüfer", "Yıldırım"] },
  { name: "Antalya", code: "07", districts: ["Muratpaşa", "Kepez", "Konyaaltı"] },
  { name: "Adana", code: "01", districts: ["Seyhan", "Çukurova"] },
  { name: "Konya", code: "42", districts: ["Selçuklu", "Meram"] },
  { name: "Gaziantep", code: "27", districts: ["Şahinbey", "Şehitkamil"] },
];

const LOCALES = ["tr", "en", "de", "fr", "es"] as const;

async function main() {
  console.log("🌱 Seed başlıyor…");

  // Kategoriler + alt kategoriler
  let catCount = 0;
  for (const [i, c] of CATEGORIES.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        icon: c.icon,
        order: i,
        translations: { create: LOCALES.map((l) => ({ locale: l, name: c.names[l] })) },
      },
    });
    catCount++;
    for (const [j, child] of (c.children ?? []).entries()) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          slug: child.slug,
          parentId: parent.id,
          order: j,
          translations: { create: LOCALES.map((l) => ({ locale: l, name: child.names[l] })) },
        },
      });
      catCount++;
    }
  }
  console.log(`  ✓ ${catCount} kategori (alt kategoriler dahil)`);

  // Şehirler + ilçeler
  let districtCount = 0;
  for (const city of CITIES) {
    const c = await prisma.city.upsert({
      where: { code: city.code },
      update: {},
      create: { name: city.name, code: city.code },
    });
    for (const d of city.districts) {
      await prisma.district.upsert({
        where: { cityId_name: { cityId: c.id, name: d } },
        update: {},
        create: { cityId: c.id, name: d },
      });
      districtCount++;
    }
  }
  console.log(`  ✓ ${CITIES.length} şehir, ${districtCount} ilçe`);

  // Süper admin
  const adminPass = await argon2.hash("Admin123!", { type: argon2.argon2id });
  await prisma.user.upsert({
    where: { email: "admin@ustam.app" },
    update: {},
    create: {
      email: "admin@ustam.app",
      passwordHash: adminPass,
      displayName: "Ustam Admin",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      roles: { create: [{ role: "SUPER_ADMIN" }, { role: "ADMIN" }] },
    },
  });
  console.log("  ✓ Süper admin: admin@ustam.app / Admin123!");

  // Örnek müşteri + usta + ilan + teklif
  const pass = await argon2.hash("Demo123!", { type: argon2.argon2id });
  const customer = await prisma.user.upsert({
    where: { email: "musteri@ustam.app" },
    update: {},
    create: {
      email: "musteri@ustam.app",
      phone: "+905001112233",
      passwordHash: pass,
      displayName: "Ahmet Yılmaz",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      roles: { create: [{ role: "CUSTOMER" }] },
    },
  });
  const provider = await prisma.user.upsert({
    where: { email: "usta@ustam.app" },
    update: {},
    create: {
      email: "usta@ustam.app",
      phone: "+905004445566",
      passwordHash: pass,
      displayName: "Mehmet Usta",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      roles: { create: [{ role: "PROVIDER" }] },
      providerProfile: {
        create: { kind: "INDIVIDUAL", businessName: "Mehmet Usta Tesisat", verified: true, avgRating: 4.8, reviewCount: 37, completedJobs: 52 },
      },
    },
  });

  const plumbing = await prisma.category.findUnique({ where: { slug: "plumbing" } });
  const istanbul = await prisma.city.findUnique({ where: { code: "34" } });
  if (plumbing && istanbul) {
    const existing = await prisma.listing.findFirst({ where: { ownerId: customer.id } });
    if (!existing) {
      const listing = await prisma.listing.create({
        data: {
          ownerId: customer.id,
          categoryId: plumbing.id,
          cityId: istanbul.id,
          title: "Mutfak musluğu damlatıyor, değişsin",
          description:
            "Mutfaktaki eviye bataryası sürekli damlatıyor. Yenisiyle değişmesini istiyorum. Malzeme dahil teklif bekliyorum.",
          urgency: "URGENT",
          budgetType: "RANGE",
          budgetMin: new Prisma.Decimal(1500),
          budgetMax: new Prisma.Decimal(2500),
          status: "PUBLISHED",
          publishedAt: new Date(),
          offerCount: 1,
        },
      });
      await prisma.offer.create({
        data: {
          listingId: listing.id,
          providerId: provider.id,
          price: new Prisma.Decimal(1800),
          message: "Bugün gelebilirim, malzeme dahil 2 yıl garantili.",
          estimatedDays: 1,
        },
      });
      console.log("  ✓ Örnek ilan + teklif oluşturuldu");
    }
  }
  console.log("  ✓ Demo kullanıcılar: musteri@ustam.app, usta@ustam.app / Demo123!");

  console.log("🌱 Seed tamam.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
