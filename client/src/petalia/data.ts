export const WA_NUMBER = "966500000000"; // رقم تجريبي قابل للتعديل قبل الإطلاق
export const waLink = (message: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

export const IMG = {
  redEditorial: "/images/bouquet-red-editorial.jpg",
  white: "/images/bouquet-white.jpg",
  peonyPink: "/images/peony-pink.jpg",
  roseBox: "/images/peony-rose-box.webp",
  peonyTall: "/images/peony-tall.jpg",
  redBouquet: "/images/red-roses-bouquet.webp",
  redVase: "/images/red-roses-vase.webp",
  tulips: "/images/white-roses-tulips.webp",
} as const;

export type Category = "roses" | "peony" | "tulip" | "box";
export type Product = {
  name: string;
  en: string;
  description: string;
  price: number;
  image: string;
  tag: string;
  category: Category;
  notes: string[];
};

export const products: Product[] = [
  { name: "باقة عشق", en: "A little love", description: "ورود حمراء منتقاة بتنسيق يفيض بالمشاعر.", price: 420, image: IMG.redBouquet, tag: "الأكثر طلبًا", category: "roses", notes: ["٢٤ وردة حمراء", "ورق عاجي فاخر", "بطاقة إهداء بخط اليد"] },
  { name: "صباح الورد", en: "Morning in bloom", description: "فاوانيا وردية وورود ناعمة لبداية جميلة.", price: 560, image: IMG.peonyPink, tag: "اختيار المحررة", category: "peony", notes: ["فاوانيا موسمية", "مزهرية زجاجية", "تنسيق منخفض"] },
  { name: "لمسة ربيع", en: "Spring note", description: "توليب موسمي وورود بيضاء بدرجات مبهجة.", price: 350, image: IMG.tulips, tag: "جديد", category: "tulip", notes: ["توليب أبيض", "صندوق خشبي", "لمسة خضراء"] },
  { name: "أبيض نقي", en: "Pure poetry", description: "ورود بيضاء بملامح هادئة وأنيقة.", price: 390, image: IMG.white, tag: "كلاسيكية", category: "roses", notes: ["ورود بيضاء", "أوكالبتوس", "مزهرية مربعة"] },
  { name: "حكاية ورد", en: "A story in petals", description: "مزيج فاخر من الأزهار بألوان متناغمة.", price: 480, image: IMG.redEditorial, tag: "تنسيق خاص", category: "roses", notes: ["أزهار موسمية", "إناء فضي", "تنسيق نحتي"] },
  { name: "لحظة فرح", en: "A joyful moment", description: "حزمة فاوانيا وردية تقول: يومك أجمل.", price: 320, image: IMG.peonyTall, tag: "للمناسبات", category: "peony", notes: ["فاوانيا وردية", "تغليف ناعم", "مقاس كبير"] },
  { name: "صندوق المحبة", en: "The rose box", description: "ورود وردية داخل صندوق أنيق بتفاصيل ناعمة.", price: 620, image: IMG.roseBox, tag: "هدية فاخرة", category: "box", notes: ["صندوق دائري", "ورود وفاوانيا", "تدوم طويلًا"] },
  { name: "أناقة الورد", en: "Quiet elegance", description: "تنسيق زهري يوازن بين الرقة والحضور.", price: 680, image: IMG.redVase, tag: "حصري", category: "roses", notes: ["مزهرية ذهبية", "ورود حمراء", "أغصان فضية"] },
];

export const productFilters: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "roses", label: "الورود" },
  { key: "peony", label: "الفاوانيا" },
  { key: "tulip", label: "التوليب" },
  { key: "box", label: "البوكسات" },
];

export const categories = [
  { title: "باقات الورد الطبيعي", en: "The signature bouquet", image: IMG.peonyTall },
  { title: "الورود الحمراء", en: "Say it in red", image: IMG.redBouquet },
  { title: "الورود الوردية", en: "Softly, in pink", image: IMG.peonyPink },
  { title: "تنسيقات التوليب", en: "Tulip season", image: IMG.tulips },
  { title: "بوكسات الورد", en: "A gift, beautifully", image: IMG.roseBox },
  { title: "تنسيقات المناسبات", en: "For the gathering", image: IMG.redEditorial },
];

export const occasions = [
  { title: "أعياد الميلاد", en: "Birthdays", image: IMG.peonyTall, line: "سنة جديدة تستحق باقة تشبهها." },
  { title: "حفلات الزواج", en: "Weddings", image: IMG.white, line: "بياضٌ هادئ ليوم لا يُنسى." },
  { title: "الخطوبة", en: "Engagements", image: IMG.roseBox, line: "وعدٌ أول، بلون وردي." },
  { title: "التخرج", en: "Graduation", image: IMG.peonyPink, line: "تهنئة تليق بالتعب الجميل." },
  { title: "الذكرى السنوية", en: "Anniversaries", image: IMG.redVase, line: "حكاية تكبر عامًا بعد عام." },
  { title: "هدايا رومانسية", en: "Romance", image: IMG.redBouquet, line: "حين يقول الأحمر كل شيء." },
  { title: "مناسبات خاصة", en: "Gatherings", image: IMG.tulips, line: "تفاصيل تزيّن الطاولة واللحظة." },
  { title: "بلا مناسبة", en: "Just because", image: IMG.redEditorial, line: "أجمل الهدايا تأتي بلا سبب." },
];

export const gallery = [
  { src: IMG.redBouquet, alt: "ورود حمراء فاخرة" },
  { src: IMG.peonyTall, alt: "فاوانيا وردية" },
  { src: IMG.roseBox, alt: "صندوق ورود" },
  { src: IMG.tulips, alt: "ورود وتوليب" },
  { src: IMG.white, alt: "تنسيق أبيض" },
  { src: IMG.redVase, alt: "ورود في مزهرية ذهبية" },
  { src: IMG.peonyPink, alt: "فاوانيا في مزهرية" },
  { src: IMG.redEditorial, alt: "تنسيق تحريري" },
];

/* ---------- Bouquet builder ---------- */
export type FlowerKind = "rose" | "peony" | "tulip" | "mixed";
export const flowerOptions: { key: FlowerKind; label: string; en: string; thumb: string; note: string }[] = [
  { key: "rose", label: "ورود طبيعية", en: "Roses", thumb: IMG.redBouquet, note: "كلاسيكية ورومانسية" },
  { key: "peony", label: "فاوانيا", en: "Peonies", thumb: IMG.peonyTall, note: "ممتلئة وناعمة" },
  { key: "tulip", label: "توليب", en: "Tulips", thumb: IMG.tulips, note: "بسيطة وأنيقة" },
  { key: "mixed", label: "مزيج موسمي", en: "Seasonal mix", thumb: IMG.redEditorial, note: "أزهار الموسم معًا" },
];

export const colorOptions = [
  { key: "blush", label: "وردي هادئ", swatch: ["#f3c6c9", "#e7a3ac", "#f8dcdc"] },
  { key: "red", label: "أحمر عميق", swatch: ["#8e0f22", "#b3162c", "#6d0a1a"] },
  { key: "ivory", label: "أبيض عاجي", swatch: ["#fbf6ee", "#f1e8d8", "#fffdf8"] },
  { key: "spring", label: "ألوان الربيع", swatch: ["#f6b6c4", "#ffd9a0", "#f4f0e6", "#d77f9b"] },
] as const;

export const sizeOptions = [
  { key: "s", label: "صغير", count: 7, height: 35, price: 260, note: "لفتة رقيقة" },
  { key: "m", label: "متوسط", count: 13, height: 45, price: 420, note: "الأكثر اختيارًا" },
  { key: "l", label: "كبير", count: 21, height: 60, price: 640, note: "حضور فاخر" },
] as const;

export const wrapOptions = [
  { key: "ivory", label: "ورق عاجي", color: "#efe6d8" },
  { key: "blush", label: "ورق وردي", color: "#e8bfc0" },
  { key: "linen", label: "تغليف كتان", color: "#b9a68a" },
  { key: "noir", label: "أسود ملكي", color: "#1f1a1c" },
] as const;

/** Closest real arrangement photo for a builder choice (falls back to the flower's own photo). */
const previewMap: Record<FlowerKind, Partial<Record<string, string>>> = {
  rose: { red: IMG.redBouquet, blush: IMG.roseBox, ivory: IMG.white, spring: IMG.tulips },
  peony: { ivory: IMG.peonyPink },
  tulip: {},
  mixed: { red: IMG.redEditorial, ivory: IMG.white, blush: IMG.roseBox, spring: IMG.roseBox },
};
export const previewImage = (flower: FlowerKind, color: string) => previewMap[flower][color] ?? flowerOptions.find(f => f.key === flower)!.thumb;
