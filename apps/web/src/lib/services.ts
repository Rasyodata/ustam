/** armut.com tarzı, grup bazlı popüler hizmetler (resimli kartlar için). */
export interface ServiceItem {
  icon: string;
  tr: string;
  en: string;
  pros: number;
  rating: number;
}

export const SERVICES: Record<string, ServiceItem[]> = {
  repair: [
    { icon: "🧰", tr: "Beyaz Eşya Tamiri", en: "Appliance Repair", pros: 280, rating: 4.8 },
    { icon: "♨️", tr: "Kombi Tamiri", en: "Boiler Repair", pros: 190, rating: 4.7 },
    { icon: "❄️", tr: "Klima Tamiri & Montaj", en: "AC Repair & Install", pros: 210, rating: 4.8 },
    { icon: "🚰", tr: "Musluk & Tesisat", en: "Faucet & Plumbing", pros: 320, rating: 4.9 },
    { icon: "💡", tr: "Elektrik Arıza", en: "Electrical Fault", pros: 240, rating: 4.7 },
    { icon: "🎨", tr: "Boya & Badana", en: "Painting", pros: 160, rating: 4.6 },
    { icon: "🧱", tr: "Fayans & Seramik", en: "Tiling", pros: 120, rating: 4.7 },
    { icon: "🪛", tr: "Mobilya Montaj", en: "Furniture Assembly", pros: 150, rating: 4.8 },
    { icon: "🚪", tr: "Kapı Tamiri", en: "Door Repair", pros: 90, rating: 4.6 },
    { icon: "💧", tr: "Su Kaçağı Tespiti", en: "Leak Detection", pros: 110, rating: 4.8 },
    { icon: "🔑", tr: "Çilingir", en: "Locksmith", pros: 130, rating: 4.7 },
    { icon: "🪚", tr: "Marangoz", en: "Carpentry", pros: 85, rating: 4.7 },
  ],
  cleaning: [
    { icon: "🏠", tr: "Ev Temizliği", en: "Home Cleaning", pros: 320, rating: 4.8 },
    { icon: "📦", tr: "Boş Ev Temizliği", en: "Empty Home Cleaning", pros: 180, rating: 4.7 },
    { icon: "🛋️", tr: "Koltuk Yıkama", en: "Sofa Washing", pros: 240, rating: 4.9 },
    { icon: "🧶", tr: "Halı Yıkama", en: "Carpet Washing", pros: 210, rating: 4.8 },
    { icon: "🏢", tr: "Apartman Temizliği", en: "Apartment Cleaning", pros: 130, rating: 4.6 },
    { icon: "🏗️", tr: "İnşaat Sonrası Temizlik", en: "Post-Construction", pros: 160, rating: 4.7 },
    { icon: "🐛", tr: "Böcek İlaçlama", en: "Pest Control", pros: 140, rating: 4.8 },
    { icon: "🪟", tr: "Cam Temizliği", en: "Window Cleaning", pros: 120, rating: 4.7 },
    { icon: "♨️", tr: "Petek Temizliği", en: "Radiator Cleaning", pros: 95, rating: 4.6 },
    { icon: "💼", tr: "Ofis Temizliği", en: "Office Cleaning", pros: 110, rating: 4.7 },
    { icon: "👕", tr: "Evde Ütü Hizmeti", en: "In-Home Ironing", pros: 70, rating: 4.8 },
    { icon: "🧴", tr: "Dezenfeksiyon", en: "Disinfection", pros: 80, rating: 4.7 },
  ],
  moving: [
    { icon: "🚚", tr: "Evden Eve Nakliyat", en: "Home Moving", pros: 210, rating: 4.8 },
    { icon: "💼", tr: "Ofis Taşıma", en: "Office Moving", pros: 90, rating: 4.7 },
    { icon: "🛣️", tr: "Şehirler Arası Nakliyat", en: "Intercity Moving", pros: 120, rating: 4.7 },
    { icon: "📦", tr: "Parça Eşya Taşıma", en: "Small Item Moving", pros: 140, rating: 4.6 },
    { icon: "🏗️", tr: "Asansörlü Taşıma", en: "Lift Moving", pros: 80, rating: 4.8 },
    { icon: "🎁", tr: "Paketleme Hizmeti", en: "Packing Service", pros: 70, rating: 4.7 },
    { icon: "🏬", tr: "Eşya Depolama", en: "Storage", pros: 55, rating: 4.6 },
    { icon: "🎹", tr: "Piyano Taşıma", en: "Piano Moving", pros: 30, rating: 4.9 },
  ],
  tutoring: [
    { icon: "🧮", tr: "Matematik Dersi", en: "Math Tutoring", pros: 180, rating: 4.9 },
    { icon: "🔤", tr: "İngilizce Dersi", en: "English Tutoring", pros: 220, rating: 4.8 },
    { icon: "⚛️", tr: "Fizik Dersi", en: "Physics", pros: 70, rating: 4.7 },
    { icon: "🧪", tr: "Kimya Dersi", en: "Chemistry", pros: 60, rating: 4.7 },
    { icon: "🎸", tr: "Gitar Dersi", en: "Guitar", pros: 90, rating: 4.8 },
    { icon: "🎹", tr: "Piyano Dersi", en: "Piano", pros: 65, rating: 4.9 },
    { icon: "💻", tr: "Kodlama Dersi", en: "Coding", pros: 75, rating: 4.8 },
    { icon: "📚", tr: "LGS / YKS Hazırlık", en: "Exam Prep", pros: 110, rating: 4.9 },
    { icon: "🏊", tr: "Yüzme Dersi", en: "Swimming", pros: 40, rating: 4.8 },
    { icon: "🇩🇪", tr: "Almanca Dersi", en: "German", pros: 45, rating: 4.7 },
  ],
  other: [
    { icon: "📸", tr: "Fotoğrafçı", en: "Photographer", pros: 120, rating: 4.8 },
    { icon: "🎉", tr: "Organizasyon", en: "Events", pros: 80, rating: 4.7 },
    { icon: "🌐", tr: "Web Tasarım", en: "Web Design", pros: 95, rating: 4.8 },
    { icon: "🖌️", tr: "Grafik Tasarım", en: "Graphic Design", pros: 70, rating: 4.7 },
    { icon: "🎥", tr: "Video Çekim", en: "Videography", pros: 55, rating: 4.8 },
    { icon: "🌿", tr: "Bahçıvanlık", en: "Gardening", pros: 65, rating: 4.7 },
    { icon: "💄", tr: "Kuaför & Güzellik", en: "Hair & Beauty", pros: 140, rating: 4.8 },
  ],
};

export const POP_LABEL: Record<string, string> = {
  tr: "Popüler Hizmetler",
  en: "Popular Services",
  de: "Beliebte Dienste",
  fr: "Services populaires",
  es: "Servicios populares",
};
