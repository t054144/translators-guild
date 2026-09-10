// CUP.KW — product configuration
//
// Dimensions and colours are taken from the real tumbler: a straight-wall
// navy cylinder with a threaded lid, a centre straw port, and a punchcard dot
// field down the front between the CODED mark and the [ NAME ] label.

export type Texture = "smooth" | "glossy" | "matte";
export type SizeKey = "450" | "750" | "1000";
export type ThermalState = "ambient" | "cold" | "hot";

export type ColorDef = {
  id: string;
  en: string;
  ar: string;
  /** shell colour at room temperature */
  base: string;
  /** where the shell shifts when it's holding something cold */
  cold: string;
  /** where it shifts when it's holding something hot */
  hot: string;
};

/**
 * CODED Navy is the original — the colourway of the tumbler as designed, and
 * the one the collab box ships in, unchanged.
 */
export const COLORS: ColorDef[] = [
  { id: "coded-navy", en: "CODED Navy",    ar: "كحلي كوديد",     base: "#2E3A50", cold: "#7099CF", hot: "#171E2B" },
  { id: "moudhi-rose", en: "Moudhi Rose",  ar: "وردي مضاوي",     base: "#D96A85", cold: "#FFB3C6", hot: "#8E2F4C" },
  { id: "ink", en: "Ink Black",             ar: "أسود حبري",      base: "#1C1D22", cold: "#3E4C63", hot: "#0C0D10" },
  { id: "pearl", en: "Pearl White",         ar: "أبيض لؤلؤي",     base: "#EFEBE3", cold: "#D5E7F5", hot: "#DCC7B2" },
  { id: "desert-sand", en: "Desert Sand",   ar: "رمل الصحراء",    base: "#CDB08A", cold: "#EBDCC4", hot: "#96754A" },
  { id: "matcha", en: "Matcha",             ar: "ماتشا",          base: "#6E8C3A", cold: "#A9C46C", hot: "#3F5320" },
  { id: "pistachio", en: "Pistachio",       ar: "فستقي",          base: "#A3C08C", cold: "#D0E5C0", hot: "#697F53" },
  { id: "terracotta", en: "Terracotta",     ar: "طيني",           base: "#BC5F3C", cold: "#E59E82", hot: "#7E3318" },
  { id: "butter", en: "Butter",             ar: "زبدي",           base: "#EBC964", cold: "#F9E7AE", hot: "#C4901D" },
  { id: "lavender", en: "Lavender",         ar: "خزامى",          base: "#AE9ED6", cold: "#D8CDF2", hot: "#6F5AA6" },
  { id: "sea-glass", en: "Sea Glass",       ar: "زجاج البحر",     base: "#82BEB8", cold: "#BDE5E1", hot: "#478B84" },
  { id: "midnight", en: "Midnight",         ar: "منتصف الليل",    base: "#242A4A", cold: "#4C6BA8", hot: "#111024" },
  { id: "cherry", en: "Cherry",             ar: "كرزي",           base: "#B72A3C", cold: "#E9788A", hot: "#71101D" },
  { id: "cocoa", en: "Cocoa",               ar: "كاكاو",          base: "#57392C", cold: "#8A6858", hot: "#2E170E" },
  { id: "sunset", en: "Sunset Orange",      ar: "برتقالي الغروب", base: "#E77A2C", cold: "#F9B27A", hot: "#B54705" },
  { id: "mint", en: "Mint",                 ar: "نعناعي",         base: "#96D9BD", cold: "#C8F1E1", hot: "#57A183" },
  { id: "steel", en: "Brushed Steel",       ar: "فولاذ مصقول",    base: "#B3B8BE", cold: "#D4E2EF", hot: "#897A71" },
  { id: "bubblegum", en: "Bubblegum",       ar: "علكة",           base: "#EE93C1", cold: "#FAC5DE", hot: "#BC538D" },
  { id: "olive", en: "Olive",               ar: "زيتوني",         base: "#767445", cold: "#A5A26C", hot: "#494722" },
  { id: "cloud", en: "Cloud Grey",          ar: "رمادي سحابي",    base: "#C8CCD0", cold: "#DDEBF5", hot: "#AEA096" },

  // ── second run ──
  { id: "saffron", en: "Saffron",           ar: "زعفراني",        base: "#E0A32E", cold: "#F4D48B", hot: "#A96F0C" },
  { id: "pomegranate", en: "Pomegranate",   ar: "رماني",          base: "#9E2B3E", cold: "#D3697C", hot: "#61121F" },
  { id: "date", en: "Date",                 ar: "تمري",           base: "#6E4A2E", cold: "#9E7A5C", hot: "#422615" },
  { id: "cardamom", en: "Cardamom",         ar: "هيل",            base: "#9DA97C", cold: "#C8D2AC", hot: "#6B7550" },
  { id: "gulf-teal", en: "Gulf Teal",       ar: "فيروزي",         base: "#17808C", cold: "#5FBEC6", hot: "#05505A" },
  { id: "plum", en: "Dusk Plum",            ar: "برقوقي",         base: "#6B3F63", cold: "#9E7396", hot: "#43213E" },
  { id: "indigo", en: "Indigo",             ar: "نيلي",           base: "#3A4B9E", cold: "#7C8DD6", hot: "#1F2A62" },
  { id: "camel", en: "Camel",               ar: "جملي",           base: "#C29A6B", cold: "#E3C9A5", hot: "#8E6538" },
  { id: "graphite", en: "Graphite",         ar: "جرافيت",         base: "#3A3D42", cold: "#5F6B78", hot: "#1E2024" },
  { id: "coral", en: "Coral",               ar: "مرجاني",         base: "#F0705C", cold: "#FBA694", hot: "#B8402C" },
  { id: "lime", en: "Lime",                 ar: "ليموني",         base: "#C7D93C", cold: "#E4F08A", hot: "#8FA010" },
  { id: "sky", en: "Sky",                   ar: "سماوي",          base: "#6FB6E8", cold: "#AEDCF7", hot: "#3B7FB0" },
  { id: "blush", en: "Blush",               ar: "زهري فاتح",      base: "#EFC9C2", cold: "#FBE4E0", hot: "#C1908A" },
  { id: "forest", en: "Forest",             ar: "غابة",           base: "#2F5D3A", cold: "#5E9270", hot: "#17351F" },
  { id: "oud", en: "Oud",                   ar: "عودي",           base: "#4A3040", cold: "#7A5A6E", hot: "#2A1725" },
  { id: "canary", en: "Canary",             ar: "كناري",          base: "#F2C111", cold: "#FBE380", hot: "#BE8C00" },
];

/** The colour the lit dots burn in. */
export const DOT_COLORS = [
  { id: "white", en: "White", ar: "أبيض", hex: "#FFFFFF" },
  { id: "cream", en: "Cream", ar: "كريمي", hex: "#F6EFE2" },
  { id: "ink", en: "Ink", ar: "حبري", hex: "#15171C" },
  { id: "gold", en: "Gold", ar: "ذهبي", hex: "#D9A94A" },
  { id: "silver", en: "Silver", ar: "فضي", hex: "#C8CDD3" },
  { id: "blush", en: "Blush", ar: "خدودي", hex: "#F3C2CE" },
  { id: "sky", en: "Sky", ar: "سماوي", hex: "#8FC9F0" },
  { id: "matcha", en: "Matcha", ar: "ماتشا", hex: "#8FA857" },
];

/** What gets fed through the punchcard field. */
export const FIELD_MODES = [
  {
    id: "grid" as const, en: "Grid", ar: "شبكة",
    enDesc: "The field as the shell is manufactured — a plain, uniform punched grid. No engraving.",
    arDesc: "الحقل كما يُصنع على القشرة — شبكة مثقوبة منتظمة. بلا نقش.",
  },
  {
    id: "name" as const, en: "Name", ar: "الاسم",
    enDesc: "Your name feeds through the field as dot-matrix letters, reading top to bottom.",
    arDesc: "اسمك يمرّ عبر الحقل كحروف نقطية، تُقرأ من الأعلى للأسفل.",
  },
  {
    id: "sigil" as const, en: "Sigil", ar: "الرمز",
    enDesc: "A mirrored mark derived from your name's own signature. Nobody else gets this one.",
    arDesc: "رمز متناظر مشتقّ من بصمة اسمك. لا أحد غيرك يحصل عليه.",
  },
  {
    id: "life" as const, en: "Life", ar: "الحياة",
    enDesc: "Conway's Game of Life, seeded from your name and left to run. Pick the generation you like.",
    arDesc: "لعبة الحياة لكونواي، تبدأ من اسمك وتُترك تعمل. اختر الجيل الذي يعجبك.",
  },
  {
    id: "draw" as const, en: "Draw", ar: "ارسم",
    enDesc: "Punch the dots yourself, one at a time.",
    arDesc: "اثقب النقاط بنفسك، واحدة تلو الأخرى.",
  },
];

export const TEXTURES: { id: Texture; en: string; ar: string; enDesc: string; arDesc: string }[] = [
  { id: "matte", en: "Matte", ar: "مطفي", enDesc: "Powder-coated, soft to hold, no fingerprints. The original finish.", arDesc: "طلاء بودرة، ناعم في اليد، لا يترك بصمات. التشطيب الأصلي." },
  { id: "smooth", en: "Smooth", ar: "ناعم", enDesc: "Satin. Halfway between matte and mirror.", arDesc: "ساتان. بين المطفي واللامع." },
  { id: "glossy", en: "Glossy", ar: "لامع", enDesc: "High-shine lacquer. The dots read like inlay.", arDesc: "طلاء لامع. النقاط تبدو كالتطعيم." },
];

export type SizeDef = {
  id: SizeKey;
  ml: number;
  oz: number;
  priceKD: number;
  en: string;
  ar: string;
  /** real-world millimetres — these drive the 3D geometry directly */
  heightMm: number;
  diameterMm: number;
  enBlurb: string;
  arBlurb: string;
};

export const SIZES: SizeDef[] = [
  {
    id: "450", ml: 450, oz: 15, priceKD: 6, en: "450 ml", ar: "٤٥٠ مل",
    heightMm: 200, diameterMm: 70,
    enBlurb: "The daily. Fits every car holder and every handbag.",
    arBlurb: "الرفيق اليومي. يناسب كل حمّالة سيارة وكل حقيبة.",
  },
  {
    id: "750", ml: 750, oz: 25, priceKD: 9, en: "750 ml", ar: "٧٥٠ مل",
    heightMm: 255, diameterMm: 78,
    enBlurb: "The favourite. A full day of iced coffee in one pour.",
    arBlurb: "الأكثر طلباً. يوم كامل من القهوة المثلجة بصبّة واحدة.",
  },
  {
    id: "1000", ml: 1000, oz: 34, priceKD: 11, en: "1 Litre", ar: "١ لتر",
    heightMm: 300, diameterMm: 85,
    enBlurb: "The desk anchor. Gym, office, road trip — refill once.",
    arBlurb: "مرساة المكتب. النادي، الدوام، السفر — تعبئة واحدة تكفي.",
  },
];

export const PEDAZL_STONES = [
  { id: "crystal", en: "Clear Crystal", ar: "كريستال شفاف", hex: "#EAF4FF", spec: "#FFFFFF" },
  { id: "gold", en: "Gold", ar: "ذهبي", hex: "#E5B75A", spec: "#FFF3D0" },
  { id: "rose-gold", en: "Rose Gold", ar: "ذهبي وردي", hex: "#E8A08C", spec: "#FFE2D8" },
  { id: "silver", en: "Silver", ar: "فضي", hex: "#D6DBE1", spec: "#FFFFFF" },
  { id: "black-diamond", en: "Black Diamond", ar: "ألماس أسود", hex: "#3A3A42", spec: "#9AA0AC" },
  { id: "sapphire", en: "Sapphire", ar: "أزرق سافير", hex: "#2C5BD8", spec: "#A8C4FF" },
  { id: "emerald", en: "Emerald", ar: "زمردي", hex: "#1F8A5B", spec: "#8CE8BC" },
  { id: "ruby", en: "Ruby", ar: "ياقوتي", hex: "#C41F45", spec: "#FF9AB0" },
  { id: "pink-ice", en: "Pink Ice", ar: "وردي مثلج", hex: "#F2A0C4", spec: "#FFD9EC" },
  { id: "aurora", en: "Aurora", ar: "أورورا", hex: "#B48CE8", spec: "#E8D4FF" },
];

export const PEDAZL_PRICE_PER_CHAR = 0.35; // KD
export const PEDAZL_IMAGE_PRICE = 4.5; // KD
export const ENGRAVE_PRICE = 0.75; // KD — any punchcard engraving
export const GLOSSY_PRICE = 0.5;
export const SMOOTH_PRICE = 0.25;

/** The CODED × Moudhi collaboration box */
export const COLLAB_BOX = {
  priceKD: 8.5,
  en: "CODED × Moudhi Collection Box",
  ar: "بوكس مجموعة كوديد × مضاوي",
  /** Offer runs for four days */
  countdownDays: 4,
};

// NOTE: saysaco has no logo file yet, so its `logo` is empty and PartnerLogo
// renders the brand-coloured wordmark instead of firing a 404. Drop
// saysaco.png into public/partners/ and set its path to switch it on.
export const VOUCHER_PARTNERS = [
  { id: "pick",         en: "Pick",          ar: "بيك",        logo: "/partners/pick.png",         brand: "#6B2C86", ink: "#FFFFFF", enPerk: "Free 12oz signature latte",       arPerk: "لاتيه سيجنتشر ١٢ أونصة مجاناً" },
  { id: "ananas",       en: "Ananas",        ar: "أناناس",     logo: "/partners/ananas.png",       brand: "#79913A", ink: "#F0E6A8", enPerk: "Buy one dessert, get one",         arPerk: "حلى + حلى مجاناً" },
  { id: "goodday",      en: "Good Day",      ar: "قود داي",    logo: "/partners/goodday.png",      brand: "#2F62C4", ink: "#FFFFFF", enPerk: "30% off your first order",         arPerk: "خصم ٣٠٪ على أول طلب" },
  { id: "saysaco",      en: "Saysaco",       ar: "سيساكو",     logo: "",      brand: "#E8A020", ink: "#3A2A08", enPerk: "Free refill, all month",           arPerk: "تعبئة مجانية طول الشهر" },
  { id: "matchamatcha", en: "Matcha Matcha", ar: "ماتشا ماتشا", logo: "/partners/matchamatcha.png", brand: "#E8A81E", ink: "#3A2A08", enPerk: "Free ceremonial matcha upgrade",   arPerk: "ترقية ماتشا سيريمونيال مجاناً" },
];

/** Labelled anatomy of the tumbler, used by the 3D exploded view */
export type PartId = "lid" | "strawPort" | "straw" | "gasket" | "innerWall" | "vacuum" | "outerWall" | "punchcard" | "base";

export const PARTS: { id: PartId; en: string; ar: string; enDesc: string; arDesc: string }[] = [
  { id: "lid", en: "Threaded Lid", ar: "الغطاء اللولبي", enDesc: "Triple-thread seal in a third of a turn. Comes off completely for a proper clean.", arDesc: "إغلاق ثلاثي اللولب بثلث لفة. يُفكّ بالكامل لتنظيف حقيقي." },
  { id: "strawPort", en: "Centre Straw Port", ar: "منفذ الشفاطة المركزي", enDesc: "The raised boss in the middle of the lid. Straw in, or plug it and drink from the rim.", arDesc: "النتوء في وسط الغطاء. أدخل الشفاطة، أو سدّه واشرب من الحافة." },
  { id: "straw", en: "Reusable Straw", ar: "الشفاطة القابلة لإعادة الاستخدام", enDesc: "Colour-matched, food-grade, removable — and recyclable with everything else.", arDesc: "بنفس اللون، آمنة غذائياً، قابلة للإزالة — وقابلة للتدوير مع الباقي." },
  { id: "gasket", en: "Silicone Gasket", ar: "الحلقة السيليكون", enDesc: "The reason it never leaks. Pops out for cleaning, snaps back in one press.", arDesc: "السبب في أنه لا يرشح أبداً. تُخرج للتنظيف وتعود بضغطة واحدة." },
  { id: "innerWall", en: "18/8 Inner Wall", ar: "الجدار الداخلي ١٨/٨", enDesc: "Food-grade stainless steel. No metallic aftertaste, no staining from coffee or matcha.", arDesc: "ستانلس ستيل غذائي. لا طعم معدني ولا تصبّغ من القهوة أو الماتشا." },
  { id: "vacuum", en: "Vacuum Chamber", ar: "غرفة التفريغ", enDesc: "The airless gap between the walls. This is what holds cold for 32 hours and hot for 14.", arDesc: "الفراغ الهوائي بين الجدارين. هو ما يحفظ البرودة ٣٢ ساعة والحرارة ١٤ ساعة." },
  { id: "outerWall", en: "Thermochromic Shell", ar: "القشرة المتغيّرة اللون", enDesc: "The outer skin carries the colour — and its shade shifts with what's inside. Cold lifts it, hot deepens it.", arDesc: "القشرة الخارجية تحمل اللون — وتتغير درجته حسب ما بالداخل. البارد يفتحه والحار يعمّقه." },
  { id: "punchcard", en: "Punchcard Field", ar: "حقل النقاط", enDesc: "The dot field between the CODED mark and your name plate. Your engraving lives here — same name, same pattern, forever.", arDesc: "حقل النقاط بين شعار كوديد ولوحة اسمك. نقشك يسكن هنا — نفس الاسم، نفس النقشة، للأبد." },
  { id: "base", en: "No-Slip Base", ar: "القاعدة المانعة للانزلاق", enDesc: "Recessed silicone ring. Silent on a desk, steady in a cup holder.", arDesc: "حلقة سيليكون غائرة. صامتة على المكتب وثابتة في حمّالة الكوب." },
];

export const THERMAL_SPECS = {
  coldHours: 32,
  hotHours: 14,
  iceHours: 60,
};
