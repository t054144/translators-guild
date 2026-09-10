"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, { en: string; ar: string }>;

export const T: Dict = {
  // ── nav ──────────────────────────────────────────────
  "nav.shop": { en: "Shop", ar: "المتجر" },
  "nav.customize": { en: "Customise", ar: "صمّمه" },
  "nav.collab": { en: "CODED × Moudhi", ar: "كوديد × مضاوي" },
  "nav.tech": { en: "Technology", ar: "التقنية" },
  "nav.community": { en: "Community", ar: "المجتمع" },
  "nav.login": { en: "Log in", ar: "تسجيل الدخول" },
  "nav.signup": { en: "Sign up", ar: "حساب جديد" },
  "nav.account": { en: "Account", ar: "حسابي" },
  "nav.cart": { en: "Bag", ar: "الحقيبة" },
  "nav.logout": { en: "Log out", ar: "خروج" },

  // ── hero ─────────────────────────────────────────────
  "hero.eyebrow": { en: "Made in Kuwait · Fully recyclable", ar: "صُنع في الكويت · قابل لإعادة التدوير بالكامل" },
  "hero.title1": { en: "One thumbler.", ar: "ترمس واحد." },
  "hero.title2": { en: "Every temperature.", ar: "كل درجات الحرارة." },
  "hero.title3": { en: "Your name.", ar: "باسمك أنت." },
  "hero.sub": {
    en: "32 hours cold. 14 hours hot. A shell that shifts shade with whatever you pour in it — and a punchcard down the front that spells your name in dots.",
    ar: "٣٢ ساعة باردة. ١٤ ساعة حارة. قشرة تتغيّر درجتها مع ما تصبّه فيها — وبطاقة مثقوبة على الواجهة تكتب اسمك بالنقاط.",
  },
  "hero.cta": { en: "Build yours", ar: "ابدأ تصميمك" },
  "hero.cta2": { en: "See the collab box", ar: "شاهد بوكس التعاون" },
  "hero.scroll": { en: "Drag the thumbler to spin it", ar: "اسحب الترمس ليدور" },

  // ── 3D viewer ────────────────────────────────────────
  "v3.title": { en: "Every part, in the open", ar: "كل جزء، مكشوف" },
  "v3.sub": {
    en: "Spin it, open it, take it apart. Nine components, each one labelled — because you should know exactly what you're drinking out of.",
    ar: "أدره، افتحه، فكّكه. تسعة أجزاء، كل واحد موسوم — لأنك تستحق أن تعرف بالضبط ممّا تشرب.",
  },
  "v3.explode": { en: "Exploded view", ar: "عرض مفكّك" },
  "v3.assemble": { en: "Assemble", ar: "تجميع" },
  "v3.labels": { en: "Labels", ar: "التسميات" },
  "v3.spin": { en: "Auto-spin", ar: "دوران تلقائي" },
  "v3.cinematic": { en: "Cinematic", ar: "سينمائي" },
  "v3.reset": { en: "Reset view", ar: "إعادة العرض" },
  "v3.front": { en: "Front", ar: "أمام" },
  "v3.side": { en: "Side", ar: "جانب" },
  "v3.top": { en: "Top", ar: "أعلى" },
  "v3.bottom": { en: "Bottom", ar: "أسفل" },
  "v3.parts": { en: "components", ar: "أجزاء" },
  "v3.hint": { en: "Drag to orbit · scroll to zoom · tap a label to read", ar: "اسحب للدوران · مرّر للتكبير · اضغط أي تسمية للقراءة" },

  // ── customiser ───────────────────────────────────────
  "cz.title": { en: "The Customisation Studio", ar: "استوديو التصميم" },
  "cz.sub": {
    en: "Feed a name through the punchcard, pick from twenty shell colours, three finishes and three sizes, then set Pedazl crystals on anything you like. Every change is live on the model.",
    ar: "أدخل اسماً في البطاقة المثقوبة، اختر من عشرين لون قشرة وثلاث تشطيبات وثلاثة أحجام، ثم رصّ كريستال بيدازل على ما تشاء. كل تغيير يظهر مباشرة على المجسم.",
  },
  "cz.step.size": { en: "Size", ar: "الحجم" },
  "cz.step.color": { en: "Shell colour", ar: "لون القشرة" },
  "cz.step.dots": { en: "Engraving", ar: "النقش" },
  "cz.step.texture": { en: "Finish", ar: "التشطيب" },
  "cz.step.pedazl": { en: "Pedazl", ar: "بيدازل" },
  "cz.step.review": { en: "Review", ar: "المراجعة" },
  "cz.dotColor": { en: "Dot colour", ar: "لون النقاط" },

  // ── the engraving machine ────────────────────────────
  "eg.title": { en: "Engraving Machine", ar: "ماكينة النقش" },
  "eg.tagline": { en: "Same name, same pattern, forever.", ar: "نفس الاسم، نفس النقشة، للأبد." },
  "eg.sub": {
    en: "The dot field down the front of the shell is a punchcard. Feed it a name and it re-weaves itself, letter by letter, top to bottom — and the plate at the foot reads the same.",
    ar: "حقل النقاط على واجهة القشرة هو بطاقة مثقوبة. أدخل اسماً فيعيد نسج نفسه، حرفاً حرفاً، من الأعلى للأسفل — واللوحة في الأسفل تقرأ نفس الاسم.",
  },
  "eg.name": { en: "Name to engrave", ar: "الاسم المنقوش" },
  "eg.placeholder": { en: "YOUR NAME", ar: "اسمك" },
  "eg.chars": { en: "characters", ar: "حرف" },
  "eg.sigilCode": { en: "sigil", ar: "رمز" },
  "eg.latinOnly": {
    en: "The field is a Latin dot-matrix, so engraving takes A–Z, 0–9, & . and -",
    ar: "الحقل نقطي لاتيني، فالنقش يقبل A–Z و ٠–٩ و & . و -",
  },
  "eg.scroll": { en: "Punchcard scroll — the name feeds through the field.", ar: "بطاقة مثقوبة — الاسم يمرّ عبر الحقل." },
  "eg.mode": { en: "What runs through the field", ar: "ما يمرّ عبر الحقل" },
  "eg.gen": { en: "Generation", ar: "الجيل" },
  "eg.play": { en: "Run it", ar: "شغّلها" },
  "eg.pause": { en: "Freeze", ar: "تجميد" },
  "eg.reseed": { en: "Reseed", ar: "بذرة جديدة" },
  "eg.drawHint": { en: "Tap the grid to punch dots. The field is 9 across.", ar: "اضغط على الشبكة لثقب النقاط. الحقل ٩ نقاط عرضاً." },
  "eg.clear": { en: "Clear the field", ar: "أفرغ الحقل" },
  "eg.preview": { en: "Field preview", ar: "معاينة الحقل" },
  "eg.lit": { en: "lit", ar: "مضاءة" },
  "eg.plate": { en: "Name plate reads", ar: "لوحة الاسم تقرأ" },
  "cz.thermal": { en: "Thermal preview", ar: "معاينة الحرارة" },
  "cz.thermalHint": {
    en: "This is the same thumbler, three times. Watch the shell move.",
    ar: "هذا هو نفس الترمس، ثلاث مرات. راقب القشرة تتحرك.",
  },
  "cz.ambient": { en: "Empty", ar: "فارغ" },
  "cz.cold": { en: "Iced", ar: "مثلّج" },
  "cz.hot": { en: "Hot", ar: "حار" },
  "cz.pedazl.title": { en: "Pedazl it", ar: "بيدازل" },
  "cz.pedazl.sub": {
    en: "Hand-set crystals on anything: your name, your initials, or an image you upload. We trace it stone by stone.",
    ar: "كريستال مرصوص يدوياً على أي شيء: اسمك، أحرفك الأولى، أو صورة ترفعها. نرسمها حجراً حجراً.",
  },
  "cz.pedazl.none": { en: "No Pedazl", ar: "بدون بيدازل" },
  "cz.pedazl.text": { en: "Name / text", ar: "اسم / نص" },
  "cz.pedazl.initials": { en: "Initials", ar: "الأحرف الأولى" },
  "cz.pedazl.image": { en: "Upload an image", ar: "ارفع صورة" },
  "cz.pedazl.placeholder": { en: "Type it exactly how you want it set", ar: "اكتبه بالضبط كما تريده مرصوصاً" },
  "cz.pedazl.stone": { en: "Stone", ar: "الحجر" },
  "cz.pedazl.density": { en: "Stone density", ar: "كثافة الأحجام" },
  "cz.pedazl.light": { en: "Light", ar: "خفيف" },
  "cz.pedazl.full": { en: "Full", ar: "كامل" },
  "cz.pedazl.upload": { en: "Choose file", ar: "اختر ملف" },
  "cz.pedazl.uploaded": { en: "Image received — we'll trace it in crystals", ar: "تم استلام الصورة — سنرصّها بالكريستال" },
  "cz.addToBag": { en: "Add to bag", ar: "أضف إلى الحقيبة" },
  "cz.added": { en: "Added to your bag", ar: "أُضيف إلى حقيبتك" },
  "cz.summary": { en: "Your build", ar: "تصميمك" },
  "cz.total": { en: "Total", ar: "المجموع" },
  "cz.base": { en: "Base", ar: "الأساس" },
  "cz.reset": { en: "Start over", ar: "ابدأ من جديد" },
  "cz.share": { en: "Copy build link", ar: "انسخ رابط التصميم" },
  "cz.copied": { en: "Link copied", ar: "تم نسخ الرابط" },

  // ── sizes ────────────────────────────────────────────
  "sz.title": { en: "Three sizes, one silhouette", ar: "ثلاثة أحجام، شكل واحد" },
  "sz.engraved": { en: "Every size takes the engraving", ar: "كل حجم يقبل النقش" },
  "sz.sub": {
    en: "Same straight wall, same threaded lid, same vacuum chamber. Pick by how much of your day you want to cover.",
    ar: "نفس الجدار المستقيم، نفس الغطاء اللولبي، نفس غرفة التفريغ. اختر حسب كم من يومك تريد أن تغطي.",
  },
  "sz.holds": { en: "Holds", ar: "السعة" },
  "sz.height": { en: "Height", ar: "الارتفاع" },
  "sz.dia": { en: "Diameter", ar: "القطر" },
  "sz.pick": { en: "Customise this size", ar: "صمّم هذا الحجم" },

  // ── tech / recycling ─────────────────────────────────
  "tech.title": { en: "Why ours holds", ar: "لماذا يحفظ ترمسنا" },
  "tech.coldH": { en: "hours ice cold", ar: "ساعة باردة كالثلج" },
  "tech.hotH": { en: "hours piping hot", ar: "ساعة ساخنة" },
  "tech.iceH": { en: "hours ice unmelted", ar: "ساعة والثلج لم يذب" },
  "tech.vac.title": { en: "A vacuum, not insulation", ar: "تفريغ هوائي، لا عزل" },
  "tech.vac.body": {
    en: "Heat needs air to travel. We pull the air out from between the two steel walls, so there is nothing left for the temperature to move through. Your iced latte at 7am is still cold at 3pm the next day.",
    ar: "الحرارة تحتاج هواءً لتنتقل. نسحب الهواء من بين جداري الستانلس، فلا يبقى شيء تنتقل عبره الحرارة. لاتيك المثلج في السابعة صباحاً يبقى بارداً في الثالثة عصر اليوم التالي.",
  },
  "tech.recycle.title": { en: "Recyclable, all the way down", ar: "قابل لإعادة التدوير، حتى آخر جزء" },
  "tech.recycle.body": {
    en: "Most thumblers can't be recycled because the steel, plastic and silicone are bonded together. Ours come apart by hand in under a minute — every component separates into a single, clean material stream. Bring it back to us when you're done and we'll do it for you.",
    ar: "معظم الترامس لا يمكن تدويرها لأن الستانلس والبلاستيك والسيليكون ملتصقون. ترمسنا يُفكّك باليد في أقل من دقيقة — كل جزء ينفصل إلى مادة نقية واحدة. أعده إلينا عند انتهائك ونتولى الأمر.",
  },
  "tech.thermo.title": { en: "The shell tells you", ar: "القشرة تخبرك" },
  "tech.thermo.body": {
    en: "The thermochromic layer reads the temperature through the wall. Pour something iced and the colour lifts and brightens. Pour something hot and it deepens. It is not a gimmick — it is how you tell, across a room, whether your coffee is still worth drinking.",
    ar: "الطبقة المتغيّرة اللون تقرأ الحرارة عبر الجدار. صبّ شيئاً مثلجاً فيفتح اللون ويشعّ. صبّ شيئاً حاراً فيعمّق. ليست حيلة — بل كيف تعرف من آخر الغرفة إن كانت قهوتك لا تزال تستحق الشرب.",
  },

  // ── collab box ───────────────────────────────────────
  "cb.eyebrow": { en: "Limited drop · 4 days", ar: "إصدار محدود · ٤ أيام" },
  "cb.title": { en: "CODED × Moudhi Collection Box", ar: "بوكس مجموعة كوديد × مضاوي" },
  "cb.sub": {
    en: "The navy thumbler exactly as it was designed — the CODED mark, the stock punchcard grid, matte navy shell. No customisation, no changes. Boxed with vouchers from five of Kuwait's best.",
    ar: "الترمس الكحلي كما صُمّم بالضبط — شعار كوديد، وشبكة النقاط الأصلية، وقشرة كحلية مطفية. بلا تخصيص وبلا تغيير. معلّب مع قسائم من خمسة من الأفضل في الكويت.",
  },
  "cb.locked": { en: "Fixed colourway and engraving — not customisable", ar: "لون ونقش ثابتان — غير قابل للتخصيص" },
  "cb.inside": { en: "Inside the box", ar: "داخل البوكس" },
  "cb.vouchers": { en: "Five vouchers", ar: "خمس قسائم" },
  "cb.endsIn": { en: "Offer ends in", ar: "ينتهي العرض في" },
  "cb.days": { en: "Days", ar: "يوم" },
  "cb.hours": { en: "Hours", ar: "ساعة" },
  "cb.mins": { en: "Minutes", ar: "دقيقة" },
  "cb.secs": { en: "Seconds", ar: "ثانية" },
  "cb.claim": { en: "Claim the box", ar: "احصل على البوكس" },
  "cb.ended": { en: "This drop has closed", ar: "انتهى هذا الإصدار" },
  "cb.item1": { en: "750 ml CODED × Moudhi thumbler — matte navy, stock punchcard grid", ar: "ترمس كوديد × مضاوي ٧٥٠ مل — كحلي مطفي، بشبكة النقاط الأصلية" },
  "cb.item2": { en: "Matching reusable straw + cleaning brush", ar: "شفاطة قابلة لإعادة الاستخدام + فرشاة تنظيف" },
  "cb.item3": { en: "Numbered collector card", ar: "كرت مجموعة مرقّم" },
  "cb.item4": { en: "Five café vouchers", ar: "خمس قسائم مقاهي" },
  "cb.value": { en: "Voucher value alone", ar: "قيمة القسائم وحدها" },

  // ── community ────────────────────────────────────────
  "cm.title": { en: "Join the CUP.KW community", ar: "انضم إلى مجتمع CUP.KW" },
  "cm.sub": {
    en: "Early access to drops, a members-only colour every season, and first pick on collabs. No spam — we message when there's something worth carrying.",
    ar: "وصول مبكر للإصدارات، لون خاص بالأعضاء كل موسم، وأولوية في التعاونات. لا رسائل مزعجة — نراسلك فقط عندما يستحق الأمر.",
  },
  "cm.name": { en: "Full name", ar: "الاسم الكامل" },
  "cm.email": { en: "Email", ar: "البريد الإلكتروني" },
  "cm.phone": { en: "Phone (optional)", ar: "الهاتف (اختياري)" },
  "cm.city": { en: "Area in Kuwait", ar: "المنطقة في الكويت" },
  "cm.fav": { en: "Your go-to order", ar: "طلبك المعتاد" },
  "cm.join": { en: "Join the community", ar: "انضم للمجتمع" },
  "cm.joined": { en: "You're in. Check your inbox.", ar: "أنت معنا. تحقّق من بريدك." },
  "cm.perk1": { en: "48-hour early access to every drop", ar: "وصول مبكر ٤٨ ساعة لكل إصدار" },
  "cm.perk2": { en: "A members-only shell colour each season", ar: "لون قشرة خاص بالأعضاء كل موسم" },
  "cm.perk3": { en: "Free Pedazl on your first build", ar: "بيدازل مجاني على أول تصميم" },
  "cm.perk4": { en: "Recycle-back credit, doubled", ar: "رصيد إعادة التدوير، مضاعف" },
  "cm.members": { en: "members and counting", ar: "عضو والعدد يزيد" },

  // ── auth ─────────────────────────────────────────────
  "au.login.title": { en: "Welcome back", ar: "أهلاً بعودتك" },
  "au.login.sub": { en: "Your builds and your bag are where you left them.", ar: "تصاميمك وحقيبتك كما تركتها." },
  "au.signup.title": { en: "Create your account", ar: "أنشئ حسابك" },
  "au.signup.sub": { en: "Save your builds, track orders, and get member drops.", ar: "احفظ تصاميمك، تابع طلباتك، واحصل على إصدارات الأعضاء." },
  "au.email": { en: "Email", ar: "البريد الإلكتروني" },
  "au.password": { en: "Password", ar: "كلمة المرور" },
  "au.name": { en: "Full name", ar: "الاسم الكامل" },
  "au.confirm": { en: "Confirm password", ar: "تأكيد كلمة المرور" },
  "au.login.go": { en: "Log in", ar: "تسجيل الدخول" },
  "au.signup.go": { en: "Create account", ar: "إنشاء الحساب" },
  "au.noAccount": { en: "No account yet?", ar: "ليس لديك حساب؟" },
  "au.hasAccount": { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },
  "au.forgot": { en: "Forgot password?", ar: "نسيت كلمة المرور؟" },
  "au.or": { en: "or", ar: "أو" },
  "au.joinCommunity": { en: "Also add me to the CUP.KW community", ar: "أضفني أيضاً إلى مجتمع CUP.KW" },
  "au.mismatch": { en: "Passwords don't match", ar: "كلمتا المرور غير متطابقتين" },
  "au.short": { en: "Password must be at least 6 characters", ar: "كلمة المرور ٦ أحرف على الأقل" },
  "au.invalid": { en: "Enter a valid email", ar: "أدخل بريداً صحيحاً" },
  "au.welcome": { en: "Signed in", ar: "تم تسجيل الدخول" },

  // ── bag ──────────────────────────────────────────────
  "bag.title": { en: "Your bag", ar: "حقيبتك" },
  "bag.empty": { en: "Nothing here yet.", ar: "لا شيء هنا بعد." },
  "bag.emptyCta": { en: "Build a thumbler", ar: "صمّم ترمساً" },
  "bag.checkout": { en: "Checkout", ar: "إتمام الشراء" },
  "bag.remove": { en: "Remove", ar: "إزالة" },
  "bag.subtotal": { en: "Subtotal", ar: "المجموع الفرعي" },
  "bag.delivery": { en: "Delivery in Kuwait", ar: "التوصيل داخل الكويت" },
  "bag.free": { en: "Free", ar: "مجاني" },
  "bag.qty": { en: "Qty", ar: "الكمية" },
  "bag.soon": { en: "Payment gateway coming soon — your build is saved.", ar: "بوابة الدفع قريباً — تصميمك محفوظ." },

  // ── footer / misc ────────────────────────────────────
  "ft.tag": { en: "CUP.KW — Kuwait's thumbler, built to your spec.", ar: "CUP.KW — ترمس الكويت، مصمّم على مقاسك." },
  "ft.shop": { en: "Shop", ar: "المتجر" },
  "ft.about": { en: "About", ar: "عن المتجر" },
  "ft.care": { en: "Care & recycling", ar: "العناية وإعادة التدوير" },
  "ft.contact": { en: "Contact", ar: "تواصل" },
  "ft.rights": { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
  "ft.made": { en: "Designed in Kuwait", ar: "صُمّم في الكويت" },
  "kd": { en: "KD", ar: "د.ك" },
  "common.new": { en: "New", ar: "جديد" },
  "common.from": { en: "From", ar: "يبدأ من" },
  "common.loading": { en: "Loading", ar: "جاري التحميل" },
};

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** pick the en/ar field off a config object */
  pick: <O extends { en: string; ar: string }>(o: O) => string;
  /** render a number in the active locale's digits */
  num: (n: number, digits?: number) => string;
};

const I18nContext = createContext<Ctx | null>(null);

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("cupkw-lang") : null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem("cupkw-lang", lang);
    } catch {
      /* private mode */
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(() => setLangState((l) => (l === "en" ? "ar" : "en")), []);

  const t = useCallback(
    (key: string) => {
      const entry = T[key];
      if (!entry) return key;
      return entry[lang];
    },
    [lang]
  );

  const pick = useCallback(
    <O extends { en: string; ar: string }>(o: O) => (lang === "ar" ? o.ar : o.en),
    [lang]
  );

  const num = useCallback(
    (n: number, digits?: number) => {
      const s = digits === undefined ? String(n) : n.toFixed(digits);
      if (lang !== "ar") return s;
      return s.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, dir: lang === "ar" ? "rtl" : "ltr", t, setLang, toggle, pick, num }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
