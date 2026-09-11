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

  // --- Üyeler + 30 küçük tamir ilanı (üyeler açmış gibi) ---
  const memberNames = ["Ayşe K.", "Mehmet D.", "Zeynep A.", "Can B.", "Elif S.", "Murat T.", "Fatma Ö.", "Emre G.", "Selin U.", "Hakan V."];
  const members: { id: string }[] = [];
  for (let i = 0; i < memberNames.length; i++) {
    const m = await prisma.user.upsert({
      where: { email: `uye${i + 1}@ustam.app` },
      update: {},
      create: {
        email: `uye${i + 1}@ustam.app`,
        phone: `+9055500${String(10000 + i)}`,
        passwordHash: pass,
        displayName: memberNames[i],
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        roles: { create: [{ role: "CUSTOMER" }] },
      },
    });
    members.push(m);
  }

  // [kategori slug, başlık, açıklama, şehir, aciliyet, minBütçe, maxBütçe] — küçük tamiratlar
  const SEED: [string, string, string, string, string, number, number][] = [
    ["plumbing", "Banyo lavabosu tıkandı, açılsın", "Banyo lavabosu tıkandı, acil açılması gerekiyor.", "İstanbul", "URGENT", 250, 500],
    ["plumbing", "Musluk contası değişimi", "Mutfak musluğu damlatıyor, conta değişimi yeterli.", "Ankara", "WITHIN_WEEK", 200, 450],
    ["plumbing", "Acil gider açma", "Tuvalet gideri tıkalı, acil müdahale lazım.", "İzmir", "EMERGENCY", 300, 650],
    ["plumbing", "Klozet iç takım değişimi", "Rezervuar akıtıyor, iç takım değişsin.", "İstanbul", "FLEXIBLE", 300, 700],
    ["electrical", "Salon avizesi montajı", "Yeni aldığım avizenin montajını istiyorum.", "Bursa", "FLEXIBLE", 300, 600],
    ["electrical", "2 priz + 1 anahtar değişimi", "Yanmış priz ve anahtarların değişimi.", "İstanbul", "WITHIN_WEEK", 250, 550],
    ["electrical", "Sigorta atıyor, kontrol", "Sigorta sürekli atıyor, kontrol edilsin.", "Adana", "URGENT", 300, 700],
    ["painting", "Tek oda boya rötuşu", "Bir odanın duvarlarında rötuş boyası.", "İzmir", "WITHIN_WEEK", 800, 1800],
    ["painting", "Tavan rutubet lekesi boyası", "Tavandaki rutubet lekesi boyanacak.", "Antalya", "FLEXIBLE", 600, 1400],
    ["painting", "Çocuk odası boyama", "Çocuk odası tek renk boyanacak.", "Bursa", "FLEXIBLE", 900, 2000],
    ["construction", "Duvarda çatlak sıva tamiri", "Salon duvarındaki çatlak sıva tamiri.", "İstanbul", "FLEXIBLE", 500, 1500],
    ["construction", "Kırık fayans değişimi (3 adet)", "Banyoda 3 kırık fayans değişecek.", "Konya", "WITHIN_WEEK", 400, 900],
    ["construction", "Kapı pervazı tamiri", "Şişen kapı pervazı tamir/ayar edilecek.", "Ankara", "FLEXIBLE", 350, 800],
    ["appliance", "Çamaşır makinesi tamiri", "Çamaşır makinesi su almıyor, tamir.", "Adana", "URGENT", 400, 1000],
    ["appliance", "Buzdolabı soğutmuyor", "Buzdolabı soğutmuyor, servis gerekiyor.", "İstanbul", "EMERGENCY", 500, 1200],
    ["appliance", "Bulaşık makinesi kurulumu", "Yeni bulaşık makinesi kurulumu.", "Konya", "FLEXIBLE", 300, 600],
    ["appliance", "Klima montajı (1 adet)", "1 adet split klima montajı.", "İzmir", "WITHIN_WEEK", 900, 1800],
    ["appliance", "Kombi bakımı", "Yıllık kombi bakımı yapılacak.", "İstanbul", "FLEXIBLE", 500, 1000],
    ["appliance", "Klima gazı dolumu", "Klima soğutmuyor, gaz dolumu lazım.", "İzmir", "WITHIN_WEEK", 600, 1100],
    ["ironwork", "Balkon korkuluğu kaynak tamiri", "Gevşeyen korkuluk kaynakla sabitlensin.", "Ankara", "FLEXIBLE", 500, 1200],
    ["ironwork", "Demir kapı menteşe tamiri", "Demir kapı menteşesi sarktı, tamir.", "İzmir", "WITHIN_WEEK", 400, 900],
    ["roofing", "Çatı kiremit değişimi", "Birkaç kırık kiremit değişecek.", "Bursa", "URGENT", 800, 2000],
    ["roofing", "Dere oluk temizliği/onarım", "Tıkalı oluk temizlenip onarılacak.", "Antalya", "WITHIN_WEEK", 500, 1200],
    ["roofing", "Çatı akıntısı küçük onarım", "Yağmurda az su alıyor, küçük onarım.", "Bursa", "WITHIN_WEEK", 1000, 2500],
    ["manufacturing", "Ahşap raf imalatı (küçük)", "Duvara monte 2 küçük ahşap raf.", "Gaziantep", "FLEXIBLE", 700, 1500],
    ["manufacturing", "Ferforje küçük pencere kafesi", "1 pencere için ferforje kafes.", "Gaziantep", "FLEXIBLE", 1200, 2500],
    ["plumbing", "Şofben/su ısıtıcı montajı", "Yeni şofben montajı yapılacak.", "İstanbul", "FLEXIBLE", 400, 900],
    ["electrical", "Spot aydınlatma montajı (5 adet)", "Salona 5 adet spot montajı.", "Ankara", "FLEXIBLE", 500, 1100],
    ["painting", "Kapı/pervaz vernik", "İç kapılara vernik/rötuş.", "İzmir", "FLEXIBLE", 500, 1200],
    ["construction", "Silikon/derz yenileme (banyo)", "Banyo küvet çevresi silikon yenileme.", "İstanbul", "FLEXIBLE", 300, 700],
  ];

  const catCache: Record<string, string | undefined> = {};
  const cityCache: Record<string, string | undefined> = {};
  const catId = async (slug: string) => {
    if (!(slug in catCache)) catCache[slug] = (await prisma.category.findUnique({ where: { slug } }))?.id;
    return catCache[slug];
  };
  const cityId = async (name: string) => {
    if (!(name in cityCache)) cityCache[name] = (await prisma.city.findFirst({ where: { name } }))?.id;
    return cityCache[name];
  };

  let created = 0;
  for (let i = 0; i < SEED.length; i++) {
    const [slug, title, desc, city, urg, min, max] = SEED[i];
    const cid = await catId(slug);
    const cyid = await cityId(city);
    if (!cid || !cyid) continue;
    const owner = members[i % members.length];
    const exists = await prisma.listing.findFirst({ where: { ownerId: owner.id, title } });
    if (exists) continue;
    await prisma.listing.create({
      data: {
        ownerId: owner.id,
        categoryId: cid,
        cityId: cyid,
        title,
        description: desc,
        urgency: urg as any,
        budgetType: "RANGE",
        budgetMin: new Prisma.Decimal(min),
        budgetMax: new Prisma.Decimal(max),
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    created++;
  }
  console.log(`  ✓ ${members.length} üye + ${created} küçük tamir ilanı (üyeler tarafından) oluşturuldu`);

  // --- Ustalar (kategorilere yayılmış, puanlı, seviye çeşitliliği) ---
  // [email, işletme adı, kategori slug, hizmet şehirleri, kind, puan, yorum, tamamlanan iş, doğrulanmış]
  const PROVIDERS: [string, string, string, string[], any, number, number, number, boolean][] = [
    ["u.tesisat@ustam.app", "Usta Su Tesisat", "plumbing", ["İstanbul", "Ankara"], "TECHNICAL_SERVICE", 4.9, 64, 210, true],
    ["u.tesisat2@ustam.app", "Hızlı Tesisat", "plumbing", ["İzmir"], "INDIVIDUAL", 4.6, 28, 40, true],
    ["u.elektrik@ustam.app", "Yıldız Elektrik", "electrical", ["İstanbul", "Bursa"], "TECHNICAL_SERVICE", 4.8, 52, 130, true],
    ["u.elektrik2@ustam.app", "Voltaj Elektrik", "electrical", ["Ankara"], "INDIVIDUAL", 4.4, 15, 22, false],
    ["u.insaat@ustam.app", "Kale İnşaat Tadilat", "construction", ["İstanbul"], "CONTRACTOR", 4.7, 40, 90, true],
    ["u.insaat2@ustam.app", "Sağlam Tadilat", "construction", ["Konya", "Adana"], "INDIVIDUAL", 4.3, 12, 15, false],
    ["u.boya@ustam.app", "Renk Boya Badana", "painting", ["İzmir", "İstanbul"], "TECHNICAL_SERVICE", 4.9, 70, 160, true],
    ["u.boya2@ustam.app", "Badanacı Ercan", "painting", ["Bursa"], "INDIVIDUAL", 4.5, 20, 30, false],
    ["u.demir@ustam.app", "Demir Ustası Kaynak", "ironwork", ["Ankara", "İstanbul"], "MANUFACTURER", 5.0, 48, 120, true],
    ["u.demir2@ustam.app", "Ferforje Sanat", "ironwork", ["İzmir"], "INDIVIDUAL", 4.6, 18, 26, true],
    ["u.cati@ustam.app", "Çatı Ustası Hasan", "roofing", ["Bursa", "İstanbul"], "INDIVIDUAL", 4.8, 41, 98, true],
    ["u.cati2@ustam.app", "İzolasyon Pro", "roofing", ["Antalya"], "TECHNICAL_SERVICE", 4.4, 10, 12, false],
    ["u.beyaz@ustam.app", "Teknik Servis Plus", "appliance", ["İstanbul", "Ankara", "İzmir"], "TECHNICAL_SERVICE", 4.7, 60, 140, true],
    ["u.beyaz2@ustam.app", "Beyaz Eşya Doktoru", "appliance", ["Adana"], "INDIVIDUAL", 4.5, 33, 55, true],
    ["u.imalat@ustam.app", "Metal İmalat A.Ş.", "manufacturing", ["İzmir", "Gaziantep"], "MANUFACTURER", 5.0, 64, 210, true],
    ["u.imalat2@ustam.app", "Ahşap Atölye", "manufacturing", ["Gaziantep"], "INDIVIDUAL", 4.6, 22, 34, false],
  ];

  let provCreated = 0;
  for (let i = 0; i < PROVIDERS.length; i++) {
    const [email, name, slug, cities, kind, rating, reviews, jobs, verified] = PROVIDERS[i];
    const cid = await catId(slug);
    if (!cid) continue;
    const cityIds = (await Promise.all(cities.map((c) => cityId(c)))).filter(Boolean) as string[];
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        phone: `+9053200${String(10000 + i)}`,
        passwordHash: pass,
        displayName: name,
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
        roles: { create: [{ role: "PROVIDER" }] },
        providerProfile: {
          create: {
            kind,
            businessName: name,
            verified,
            verifiedAt: verified ? new Date() : null,
            avgRating: rating,
            reviewCount: reviews,
            completedJobs: jobs,
            categories: { create: [{ categoryId: cid }] },
            serviceAreas: { create: cityIds.map((id) => ({ cityId: id })) },
          },
        },
      },
    });
    provCreated++;
  }
  console.log(`  ✓ ${provCreated} usta (kategorilere yayılmış, puanlı) oluşturuldu`);

  console.log("🌱 Seed tamam.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
