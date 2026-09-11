/** armut.com tarzı, grup bazlı popüler hizmetler (gerçek fotoğraflı kartlar). */
export interface ServiceItem {
  icon: string;
  tr: string;
  en: string;
  q: string; // fotoğraf anahtar kelimesi (loremflickr)
  pros: number;
  rating: number;
}

export const SERVICES: Record<string, ServiceItem[]> = {
  repair: [
    { icon: "🧰", tr: "Beyaz Eşya Tamiri", en: "Appliance Repair", q: "appliance,repair", pros: 280, rating: 4.8 },
    { icon: "♨️", tr: "Kombi Tamiri", en: "Boiler Repair", q: "boiler,heating", pros: 190, rating: 4.7 },
    { icon: "❄️", tr: "Klima Tamiri & Montaj", en: "AC Repair & Install", q: "air,conditioner", pros: 210, rating: 4.8 },
    { icon: "🚰", tr: "Musluk & Tesisat", en: "Faucet & Plumbing", q: "plumbing,faucet", pros: 320, rating: 4.9 },
    { icon: "💡", tr: "Elektrik Arıza", en: "Electrical Fault", q: "electrician,wiring", pros: 240, rating: 4.7 },
    { icon: "🎨", tr: "Boya & Badana", en: "Painting", q: "painting,wall", pros: 160, rating: 4.6 },
    { icon: "🧱", tr: "Fayans & Seramik", en: "Tiling", q: "tiles,tiling", pros: 120, rating: 4.7 },
    { icon: "🪛", tr: "Mobilya Montaj", en: "Furniture Assembly", q: "furniture,assembly", pros: 150, rating: 4.8 },
    { icon: "🚪", tr: "Kapı Tamiri", en: "Door Repair", q: "door,repair", pros: 90, rating: 4.6 },
    { icon: "💧", tr: "Su Kaçağı Tespiti", en: "Leak Detection", q: "water,leak", pros: 110, rating: 4.8 },
    { icon: "🔑", tr: "Çilingir", en: "Locksmith", q: "locksmith,key", pros: 130, rating: 4.7 },
    { icon: "🪚", tr: "Marangoz", en: "Carpentry", q: "carpenter,wood", pros: 85, rating: 4.7 },
  ],
  cleaning: [
    { icon: "🏠", tr: "Ev Temizliği", en: "Home Cleaning", q: "house,cleaning", pros: 320, rating: 4.8 },
    { icon: "📦", tr: "Boş Ev Temizliği", en: "Empty Home Cleaning", q: "cleaning,home", pros: 180, rating: 4.7 },
    { icon: "🛋️", tr: "Koltuk Yıkama", en: "Sofa Washing", q: "sofa,cleaning", pros: 240, rating: 4.9 },
    { icon: "🧶", tr: "Halı Yıkama", en: "Carpet Washing", q: "carpet,cleaning", pros: 210, rating: 4.8 },
    { icon: "🏢", tr: "Apartman Temizliği", en: "Apartment Cleaning", q: "building,cleaning", pros: 130, rating: 4.6 },
    { icon: "🏗️", tr: "İnşaat Sonrası Temizlik", en: "Post-Construction", q: "construction,cleaning", pros: 160, rating: 4.7 },
    { icon: "🐛", tr: "Böcek İlaçlama", en: "Pest Control", q: "pest,control", pros: 140, rating: 4.8 },
    { icon: "🪟", tr: "Cam Temizliği", en: "Window Cleaning", q: "window,cleaning", pros: 120, rating: 4.7 },
    { icon: "♨️", tr: "Petek Temizliği", en: "Radiator Cleaning", q: "radiator", pros: 95, rating: 4.6 },
    { icon: "💼", tr: "Ofis Temizliği", en: "Office Cleaning", q: "office,cleaning", pros: 110, rating: 4.7 },
    { icon: "👕", tr: "Evde Ütü Hizmeti", en: "In-Home Ironing", q: "ironing,laundry", pros: 70, rating: 4.8 },
    { icon: "🧴", tr: "Dezenfeksiyon", en: "Disinfection", q: "disinfection,spray", pros: 80, rating: 4.7 },
  ],
  moving: [
    { icon: "🚚", tr: "Evden Eve Nakliyat", en: "Home Moving", q: "moving,boxes", pros: 210, rating: 4.8 },
    { icon: "💼", tr: "Ofis Taşıma", en: "Office Moving", q: "office,moving", pros: 90, rating: 4.7 },
    { icon: "🛣️", tr: "Şehirler Arası Nakliyat", en: "Intercity Moving", q: "moving,truck", pros: 120, rating: 4.7 },
    { icon: "📦", tr: "Parça Eşya Taşıma", en: "Small Item Moving", q: "delivery,box", pros: 140, rating: 4.6 },
    { icon: "🏗️", tr: "Asansörlü Taşıma", en: "Lift Moving", q: "moving,lift", pros: 80, rating: 4.8 },
    { icon: "🎁", tr: "Paketleme Hizmeti", en: "Packing Service", q: "packing,boxes", pros: 70, rating: 4.7 },
    { icon: "🏬", tr: "Eşya Depolama", en: "Storage", q: "warehouse,storage", pros: 55, rating: 4.6 },
    { icon: "🎹", tr: "Piyano Taşıma", en: "Piano Moving", q: "piano", pros: 30, rating: 4.9 },
  ],
  tutoring: [
    { icon: "🧮", tr: "Matematik Dersi", en: "Math Tutoring", q: "mathematics,study", pros: 180, rating: 4.9 },
    { icon: "🔤", tr: "İngilizce Dersi", en: "English Tutoring", q: "english,learning", pros: 220, rating: 4.8 },
    { icon: "⚛️", tr: "Fizik Dersi", en: "Physics", q: "physics,science", pros: 70, rating: 4.7 },
    { icon: "🧪", tr: "Kimya Dersi", en: "Chemistry", q: "chemistry,lab", pros: 60, rating: 4.7 },
    { icon: "🎸", tr: "Gitar Dersi", en: "Guitar", q: "guitar", pros: 90, rating: 4.8 },
    { icon: "🎹", tr: "Piyano Dersi", en: "Piano", q: "piano,music", pros: 65, rating: 4.9 },
    { icon: "💻", tr: "Kodlama Dersi", en: "Coding", q: "coding,computer", pros: 75, rating: 4.8 },
    { icon: "📚", tr: "LGS / YKS Hazırlık", en: "Exam Prep", q: "exam,study", pros: 110, rating: 4.9 },
    { icon: "🏊", tr: "Yüzme Dersi", en: "Swimming", q: "swimming,pool", pros: 40, rating: 4.8 },
    { icon: "🇩🇪", tr: "Almanca Dersi", en: "German", q: "german,books", pros: 45, rating: 4.7 },
    { icon: "🇸🇦", tr: "Arapça Dersi", en: "Arabic Tutoring", q: "arabic,book", pros: 60, rating: 4.8 },
    { icon: "🇮🇷", tr: "Farsça Dersi", en: "Persian Tutoring", q: "persian,book", pros: 35, rating: 4.7 },
    { icon: "🛒", tr: "E-ticaret Eğitimi", en: "E-commerce Training", q: "ecommerce,online", pros: 70, rating: 4.8 },
    { icon: "🧾", tr: "Muhasebe Dersi", en: "Accounting Course", q: "accounting,finance", pros: 55, rating: 4.7 },
  ],
  other: [
    { icon: "📸", tr: "Fotoğrafçı", en: "Photographer", q: "photographer,camera", pros: 120, rating: 4.8 },
    { icon: "🎉", tr: "Organizasyon", en: "Events", q: "party,event", pros: 80, rating: 4.7 },
    { icon: "🌐", tr: "Web Tasarım", en: "Web Design", q: "web,design", pros: 95, rating: 4.8 },
    { icon: "🖌️", tr: "Grafik Tasarım", en: "Graphic Design", q: "graphic,design", pros: 70, rating: 4.7 },
    { icon: "🎥", tr: "Video Çekim", en: "Videography", q: "video,camera", pros: 55, rating: 4.8 },
    { icon: "🌿", tr: "Bahçıvanlık", en: "Gardening", q: "gardening,garden", pros: 65, rating: 4.7 },
    { icon: "💄", tr: "Kuaför & Güzellik", en: "Hair & Beauty", q: "hairdresser,salon", pros: 140, rating: 4.8 },
  ],
};

/** Anahtar kelimeye göre gerçek fotoğraf URL'si (ücretsiz, anahtarsız). */
export function serviceImage(q: string): string {
  return `https://loremflickr.com/600/400/${encodeURIComponent(q)}`;
}

export const POP_LABEL: Record<string, string> = {
  tr: "Popüler Hizmetler",
  en: "Popular Services",
  de: "Beliebte Dienste",
  fr: "Services populaires",
  es: "Servicios populares",
};
