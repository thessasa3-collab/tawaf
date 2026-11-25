import {
  BODY_PART_LABELS,
  BodyPartId,
  LanguageCode,
} from './i18n';

export type TriageLevel = 'critical' | 'urgent' | 'stable';

export type HaramZone =
  | 'mataf'
  | 'masa'
  | 'courtyards'
  | 'prayer_halls'
  | 'gates';

export interface TriageInput {
  language: LanguageCode;
  symptoms: string;
  zone: HaramZone;
  ageText: string;
  conscious: 'conscious' | 'confused' | 'unconscious';
  bodyPart: BodyPartId | null;
}

export interface ResponderReport {
  clinicalImpression: string;
  immediateActions: string[];
  recommendedEquipment: string;
  fieldPrecautions: string;
  evacuationRoute: string;
}

export interface TriageResult {
  id: string;
  timestamp: string;
  level: TriageLevel;
  levelTitle: string;
  priorityCode: string;
  categoryTitle: string;
  summary: string;
  firstAidSteps: string[];
  warningSigns: string;
  nearestCarePoint: string;
  callEmergency: boolean;
  zoneLabel: string;
  ageValue: number | null;
  bodyPart: BodyPartId | null;
  bodyPartLabel: string | null;
  awarenessLabel: string;
  symptomsSnapshot: string;
  responderReport: ResponderReport;
}

export type ValidationError = {
  field: 'symptoms' | 'age';
  message: string;
};

export type TriageEvaluation =
  | { ok: true; result: TriageResult }
  | { ok: false; error: ValidationError };

export const HARAM_ZONES: Record<
  HaramZone,
  {
    labels: Record<LanguageCode, string>;
    medicalPoint: Record<LanguageCode, string>;
    evacNote: Record<LanguageCode, string>;
  }
> = {
  mataf: {
    labels: {
      ar: 'صحن المطاف',
      en: 'Mataf Courtyard',
      ur: 'صحنِ مطاف',
      id: 'Pelataran Tawaf (Mataf)',
    },
    medicalPoint: {
      ar: 'أقرب مركز إسعافي: المراكز المنتشرة بمحاذاة أروقة صحن المطاف وباب الملك عبدالعزيز.',
      en: 'Nearest Care Point: Medical posts along the Mataf colonnades and King Abdulaziz Gate.',
      ur: 'قریبی طبی مرکز: مطاف کے برآمدوں اور باب الملک عبدالعزیز کے قریب طبی مراکز۔',
      id: 'Pos Medis Terdekat: Klinik di sepanjang koridor Mataf dan Pintu Raja Abdulaziz.',
    },
    evacNote: {
      ar: 'الإخلاء عبر الممر الإسعافي المخصص باتجاه باب الملك عبدالعزيز أو باب إسماعيل مع فتح مسار عبر رجال الأمن.',
      en: 'Evacuate via the dedicated emergency corridor toward King Abdulaziz Gate or Bab Ismail with security escort.',
      ur: 'سکیورٹی کی مدد سے باب الملک عبدالعزیز یا باب اسماعیل کے ہنگامی راستے سے منتقلی کریں۔',
      id: 'Evakuasi melalui jalur darurat menuju Pintu Raja Abdulaziz atau Bab Ismail dengan pengawalan petugas.',
    },
  },
  masa: {
    labels: {
      ar: 'المسعى (الصفا والمروة)',
      en: 'Masa (Safa & Marwah)',
      ur: 'مسعیٰ (صفا اور مروہ)',
      id: 'Masa (Safa & Marwah)',
    },
    medicalPoint: {
      ar: 'أقرب مركز إسعافي: نقطة الإسعاف الأولي بجوار الصفا والمروة في الطابق الأرضي والأول.',
      en: 'Nearest Care Point: First-aid stations adjacent to Safa and Marwah on Ground & 1st Floors.',
      ur: 'قریبی طبی مرکز: صفا و مروہ کے ساتھ گراؤنڈ اور پہلی منزل پر ابتدائی طبی پوائنٹس۔',
      id: 'Pos Medis Terdekat: Pos pertolongan pertama di dekat bukit Safa dan Marwah lantai dasar & 1.',
    },
    evacNote: {
      ar: 'استخدم مصاعد الطوارئ الجانبية بالمسعى أو مخرج الساحة الشرقية القريب من عيادة باب علي.',
      en: 'Use the Masa service elevators or East Courtyard exit near Bab Ali medical clinic.',
      ur: 'مسعیٰ کی ایمرجنسی لفٹ یا باب علی کلینک کے قریب مشرقی صحن کا راستہ استعمال کریں۔',
      id: 'Gunakan lift darurat Masa atau pintu keluar pelataran timur dekat klinik Bab Ali.',
    },
  },
  courtyards: {
    labels: {
      ar: 'الساحات الخارجية',
      en: 'Outer Courtyards',
      ur: 'بیرونی صحن',
      id: 'Pelataran Luar',
    },
    medicalPoint: {
      ar: 'أقرب مركز إسعافي: المراكز الطبية الثابتة بالساحات الشمالية والشرقية ونقاط الهلال الأحمر.',
      en: 'Nearest Care Point: Fixed clinics in North & East Courtyards and Saudi Red Crescent mobile units.',
      ur: 'قریبی طبی مرکز: شمالی اور مشرقی صحنوں میں مستقل کلینکس اور ہلال احمر کی ٹیمیں۔',
      id: 'Pos Medis Terdekat: Klinik tetap di Pelataran Utara & Timur serta tim Bulan Sabit Merah.',
    },
    evacNote: {
      ar: 'وصول مباشر لعربات الجولف الإسعافية وسيارات الإسعاف عبر ساحات الطوارئ المحيطة.',
      en: 'Direct access for medical golf carts and ambulances via perimeter emergency lanes.',
      ur: 'ایمبولینس اور میڈیکل گالف کارٹس کے لیے براہِ راست رسائی دستیاب ہے۔',
      id: 'Akses langsung bagi mobil golf medis dan ambulans melalui jalur darurat pelataran.',
    },
  },
  prayer_halls: {
    labels: {
      ar: 'المصليات والتوسعة الداخلية',
      en: 'Indoor Prayer Halls',
      ur: 'اندرونی نماز ہال اور توسیع',
      id: 'Ruang Shalat Dalam',
    },
    medicalPoint: {
      ar: 'أقرب مركز إسعافي: المراكز الصحية الداخلية بتوسعة الملك فهد وتوسعة الملك عبدالله.',
      en: 'Nearest Care Point: Indoor health clinics inside King Fahd and King Abdullah expansions.',
      ur: 'قریبی طبی مرکز: شاہ فہد اور شاہ عبداللہ توسیع کے اندرونی ہیلتھ کلینکس۔',
      id: 'Pos Medis Terdekat: Klinik kesehatan di dalam perluasan Raja Fahd dan Raja Abdullah.',
    },
    evacNote: {
      ar: 'استعن بأقرب ممر خدمة أو مصعد لنقل المريض نحو مخارج الساحة الشمالية.',
      en: 'Use the nearest service aisle or elevator toward North Courtyard ambulance bays.',
      ur: 'شمالی صحن کی ایمبولینس بے کی طرف قریبی سروس گزرگاہ یا لفٹ استعمال کریں۔',
      id: 'Gunakan koridor layanan atau lift terdekat menuju area ambulans Pelataran Utara.',
    },
  },
  gates: {
    labels: {
      ar: 'الأبواب والمداخل الرئيسية',
      en: 'Main Gates & Entrances',
      ur: 'مرکزی دروازے اور داخلی راستے',
      id: 'Gerbang & Pintu Utama',
    },
    medicalPoint: {
      ar: 'أقرب مركز إسعافي: سيارات ومراكز الإسعاف المتمركزة عند باب الملك فهد وباب الفتح.',
      en: 'Nearest Care Point: Ambulances and clinics stationed outside King Fahd & Al-Fath Gates.',
      ur: 'قریبی طبی مرکز: باب الملک فہد اور باب الفتح کے باہر تعینات ایمبولینس اور مراکز۔',
      id: 'Pos Medis Terdekat: Ambulans & klinik yang bersiaga di Pintu Raja Fahd dan Al-Fath.',
    },
    evacNote: {
      ar: 'نقطة التقاء مباشرة لسيارات الهلال الأحمر ٩٩٧ عند مخرج البوابة.',
      en: 'Direct handover point for Saudi Red Crescent 997 ambulances right outside the gate.',
      ur: 'دروازے کے باہر ہلال احمر 997 کی ایمبولینس کے لیے براہِ راست منتقلی کا مقام۔',
      id: 'Titik serah terima langsung dengan ambulans Bulan Sabit Merah 997 di luar gerbang.',
    },
  },
};

export const QUICK_SYMPTOM_PRESETS: Array<{
  id: string;
  label: Record<LanguageCode, string>;
  symptoms: Record<LanguageCode, string>;
  conscious: 'conscious' | 'confused' | 'unconscious';
  bodyPart: BodyPartId;
}> = [
  {
    id: 'chest',
    label: {
      ar: 'ألم صدر وضيق تنفس',
      en: 'Chest pain & breathing difficulty',
      ur: 'سینے میں درد اور سانس کی تنگی',
      id: 'Nyeri dada & sesak napas',
    },
    symptoms: {
      ar: 'ألم ضاغط في الصدر مع ضيق في التنفس وتعرق بارد أثناء الطواف',
      en: 'Crushing chest pain with shortness of breath and cold sweating during Tawaf',
      ur: 'طواف کے دوران سینے میں دباؤ، سانس کی تکلیف اور ٹھنڈا پسینہ',
      id: 'Nyeri dada menekan disertai sesak napas dan keringat dingin saat tawaf',
    },
    conscious: 'conscious',
    bodyPart: 'chest',
  },
  {
    id: 'heat',
    label: {
      ar: 'إجهاد حراري ودوخة',
      en: 'Heat exhaustion & dizziness',
      ur: 'گرمی کی تھکن اور چکر',
      id: 'Kelelahan panas & pusing',
    },
    symptoms: {
      ar: 'دوخة شديدة وإرهاق مع تعرق غزير وعطش بسبب حرارة الشمس في الساحات',
      en: 'Severe dizziness, heavy sweating, and dehydration from sun exposure in the courtyard',
      ur: 'دھوپ کی وجہ سے شدید چکر، زیادہ پسینہ اور پانی کی کمی',
      id: 'Pusing berat, keringat berlebih, dan dehidrasi akibat panas matahari di pelataran',
    },
    conscious: 'conscious',
    bodyPart: 'head',
  },
  {
    id: 'sugar',
    label: {
      ar: 'هبوط سكر ورعشة',
      en: 'Low blood sugar & trembling',
      ur: 'شوگر کی کمی اور کپکپی',
      id: 'Gula darah rendah & gemetar',
    },
    symptoms: {
      ar: 'رجفة في اليدين وتعرق بارد وشحوب مع شعور بهبوط مفاجئ',
      en: 'Hand tremors, cold sweat, paleness, and sudden weakness',
      ur: 'ہاتھوں میں کپکپی، ٹھنڈا پسینہ، پیلاہٹ اور اچانک کمزوری',
      id: 'Tangan gemetar, keringat dingin, pucat, dan lemas mendadak',
    },
    conscious: 'confused',
    bodyPart: 'abdomen',
  },
  {
    id: 'faint',
    label: {
      ar: 'إغماء وفقدان وعي',
      en: 'Fainting & loss of consciousness',
      ur: 'بے ہوشی اور ہوش کھو دینا',
      id: 'Pingsan & hilang kesadaran',
    },
    symptoms: {
      ar: 'سقوط مفاجئ وفقدان وعي كامل وعدم استجابة للنداء',
      en: 'Sudden collapse, complete loss of consciousness, and unresponsive',
      ur: 'اچانک گرنا، مکمل بے ہوشی اور پکارنے پر کوئی ردعمل نہ دینا',
      id: 'Jatuh mendadak, tidak sadarkan diri, dan tidak merespons panggilan',
    },
    conscious: 'unconscious',
    bodyPart: 'head',
  },
  {
    id: 'foot',
    label: {
      ar: 'جرح أو احتكاك بالقدم',
      en: 'Foot wound or blister',
      ur: 'پاؤں میں زخم یا چھالے',
      id: 'Luka atau lecet pada kaki',
    },
    symptoms: {
      ar: 'جرح سطحي بسيط وتسلخ في القدم من المشي أثناء السعي دون نزيف حاد',
      en: 'Minor superficial skin blister and abrasion on the foot from walking without heavy bleeding',
      ur: 'چلنے کی وجہ سے پاؤں میں معمولی زخم اور چھالا، شدید خون نہیں بہہ رہا',
      id: 'Luka lecet ringan pada kaki akibat berjalan tanpa pendarahan hebat',
    },
    conscious: 'conscious',
    bodyPart: 'feet',
  },
];

function normalizeText(text: string): string {
  return text
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '')
    .toLowerCase();
}

function hasMeaningfulLetters(text: string): boolean {
  const lettersOnly = text.replace(/[\s\d\p{P}\p{S}]/gu, '');
  return lettersOnly.length >= 4;
}

function isRepeatedGibberish(text: string): boolean {
  const compact = text.replace(/\s+/g, '');
  if (compact.length < 4) return true;
  const uniqueChars = new Set(compact.split(''));
  return uniqueChars.size <= 2;
}

type ScenarioKey =
  | 'cardiac_respiratory'
  | 'unconscious_neuro'
  | 'heatstroke'
  | 'heat_exhaustion'
  | 'hypoglycemia'
  | 'musculoskeletal'
  | 'minor_wound'
  | 'general_confused'
  | 'general_stable';

interface ScenarioTemplate {
  level: TriageLevel;
  keywords: string[];
  title: Record<LanguageCode, string>;
  summary: Record<LanguageCode, string>;
  steps: Record<LanguageCode, string[]>;
  warning: Record<LanguageCode, string>;
  responder: {
    impression: Record<LanguageCode, string>;
    actions: Record<LanguageCode, string[]>;
    equipment: Record<LanguageCode, string>;
    precautions: Record<LanguageCode, string>;
  };
}

const SCENARIOS: Record<ScenarioKey, ScenarioTemplate> = {
  cardiac_respiratory: {
    level: 'critical',
    keywords: [
      'الم صدر', 'الم في الصدر', 'الم بالصدر', 'ضيق تنفس', 'ضيق في التنفس', 'اختناق',
      'لا يتنفس', 'ذبحه', 'خفقان', 'chest pain', 'shortness of breath', 'breathing',
      'سینے میں درد', 'سانس', 'nyeri dada', 'sesak napas', 'jantung',
    ],
    title: {
      ar: 'اشتباه أزمة قلبية أو ضيق تنفس حاد',
      en: 'Suspected Acute Cardiac or Respiratory Distress',
      ur: 'ممکنہ دل کا دورہ یا شدید سانس کی تکلیف',
      id: 'Dugaan Serangan Jantung atau Gangguan Napas Akut',
    },
    summary: {
      ar: 'الأعراض تشير إلى حالة طارئة حرجة (أحمر) تتطلب تدخلاً فورياً وعدم بذل أي مجهود أو مشي.',
      en: 'Symptoms indicate a life-threatening emergency (Red) requiring immediate ALS support and complete physical rest.',
      ur: 'علامات سنگین ہنگامی حالت (ریڈ) کی نشاندہی کرتی ہیں؛ فوری طبی امداد درکار ہے اور مریض کو چلنے نہ دیں۔',
      id: 'Gejala menunjukkan kondisi darurat kritis (Merah) yang membutuhkan penanganan segera dan istirahat total.',
    },
    steps: {
      ar: [
        'أجلس المريض في وضع نصف جالس مع إرخاء الإحرام حول الصدر والرقبة.',
        'امنع التجمهر لتأمين التهوية واطلب دعم الهلال الأحمر ٩٩٧ فوراً.',
        'لا تسمح للمريض بالمشي؛ انتظر وصول العربة الإسعافية في مكانه.',
      ],
      en: [
        'Keep the patient seated upright (semi-Fowler) and loosen Ihram/clothing around chest and neck.',
        'Clear bystanders for airflow and call Saudi Red Crescent 997 immediately.',
        'Do not allow the patient to walk; await stretcher transport in place.',
      ],
      ur: [
        'مریض کو نیم بیٹھی حالت میں رکھیں اور سینے و گردن کے گرد احرام ڈھیلا کریں۔',
        'تازہ ہوا کے لیے ہجوم کو دور ہٹائیں اور فوراً 997 پر کال کریں۔',
        'مریض کو ہرگز نہ چلائیں؛ اسٹریچر پہنچنے تک وہیں انتظار کریں۔',
      ],
      id: [
        'Posisikan pasien setengah duduk dan longgarkan kain ihram di sekitar dada serta leher.',
        'Jauhkan kerumunan untuk sirkulasi udara dan segera hubungi Bulan Sabit Merah 997.',
        'Jangan biarkan pasien berjalan; tunggu tandu atau ambulans di lokasi.',
      ],
    },
    warning: {
      ar: 'إذا توقف التنفس أو النبض، ابدأ الإنعاش القلبي الرئوي فوراً إذا كنت مؤهلاً.',
      en: 'If breathing or pulse stops, initiate CPR immediately if trained and request an AED.',
      ur: 'اگر سانس یا نبض رک جائے تو تربیت یافتہ شخص فوراً سی پی آر (CPR) شروع کرے۔',
      id: 'Jika napas atau nadi berhenti, segera lakukan RJP (CPR) bila terlatih dan minta AED.',
    },
    responder: {
      impression: {
        ar: 'متلازمة الشريان التاجي الحادة (ACS) أو فشل تنفسي حاد مرتبط بالإجهاد.',
        en: 'Suspected Acute Coronary Syndrome (ACS) / Acute Respiratory Compromise.',
        ur: 'ممکنہ ایکیوٹ کورونری سنڈروم (ACS) یا سانس کی شدید ناکامی۔',
        id: 'Dugaan Sindrom Koroner Akut (ACS) / Distres Pernapasan Akut.',
      },
      actions: {
        ar: [
          'تقييم مجرى الهواء والتنفس (ABC) وقياس SpO2 وضغط الدم ونبض القلب فوراً.',
          'توصيل جهاز تخطيط القلب (12-Lead ECG) وتحفيز الأكسجين إذا كان التشبع أقل من ٩٤٪.',
          'تأمين خط وريدي وتجهيز مزيل الرجفان الآلي (AED) قبل النقل.',
        ],
        en: [
          'Perform immediate ABC assessment, SpO2, BP, and continuous cardiac monitoring.',
          'Acquire 12-lead ECG and administer supplemental O2 if SpO2 < 94%.',
          'Establish IV access and keep AED/defibrillator pads ready during extraction.',
        ],
        ur: [
          'فوری طور پر ABC کا جائزہ لیں اور SpO2، بلڈ پریشر اور دل کی دھڑکن چیک کریں۔',
          '12 لیڈ ای سی جی (ECG) کریں اور اگر SpO2 94% سے کم ہو تو آکسیجن دیں۔',
          'آئی وی (IV) لائن لگائیں اور منتقلی کے دوران AED تیار رکھیں۔',
        ],
        id: [
          'Lakukan penilaian ABC segera, cek SpO2, tekanan darah, dan monitor jantung.',
          'Rekam EKG 12-sadapan dan berikan oksigen tambahan bila SpO2 < 94%.',
          'Pasang akses IV dan siapkan AED selama proses evakuasi.',
        ],
      },
      equipment: {
        ar: 'نقالة إسعافية (Stretcher) + جهاز مراقبة قلب وAED + أسطوانة أكسجين.',
        en: 'Full Stretcher + 12-Lead Cardiac Monitor/AED + Portable Oxygen.',
        ur: 'اسٹریچر + کارڈیک مانیٹر / AED + پورٹیبل آکسیجن۔',
        id: 'Tandu penuh + Monitor Jantung/AED + Oksigen portabel.',
      },
      precautions: {
        ar: 'يُمنع إعطاء السوائل عن طريق الفم؛ وتجنب إجهاد المريض بالوقوف أو المشي.',
        en: 'NPO (avoid oral fluids); strictly avoid upright ambulation during transfer.',
        ur: 'منہ کے ذریعے کوئی مائع نہ دیں اور مریض کو کھڑا ہونے یا چلنے سے روکیں۔',
        id: 'Puasakan cairan oral (NPO); larang pasien berdiri atau berjalan selama pemindahan.',
      },
    },
  },
  unconscious_neuro: {
    level: 'critical',
    keywords: [
      'اغماء', 'فاقد الوعي', 'فقدان وعي', 'لا يستجيب', 'تشنج', 'صرع', 'نزيف حاد',
      'سكته', 'تلعثم', 'unconscious', 'faint', 'collapse', 'seizure', 'stroke',
      'heavy bleeding', 'بے ہوش', 'دورہ', 'فالج', 'pingsan', 'tidak sadar', 'kejang',
    ],
    title: {
      ar: 'فقدان وعي أو تشنج أو نزيف حاد',
      en: 'Loss of Consciousness, Seizure, or Severe Bleeding',
      ur: 'بے ہوشی، دورہ یا شدید خون بہنا',
      id: 'Hilang Kesadaran, Kejang, atau Pendarahan Hebat',
    },
    summary: {
      ar: 'أولوية قصوى (أحمر): غياب الوعي أو النزيف الحاد يستدعي حماية مجرى الهواء والنقل العاجل.',
      en: 'Priority 1 (Red): Altered/absent consciousness or major hemorrhage requires immediate airway protection.',
      ur: 'ترجیح اول (ریڈ): بے ہوشی یا شدید خون بہنے میں فوری طور پر سانس کے راستے کا تحفظ ضروری ہے۔',
      id: 'Prioritas 1 (Merah): Penurunan kesadaran atau pendarahan berat memerlukan proteksi jalan napas segera.',
    },
    steps: {
      ar: [
        'تحقق من التنفس؛ إذا كان يتنفس وهو فاقد للوعي ضعه في وضعية الإفاقة الجانبية.',
        'في حال وجود نزيف، اضغط بشاش أو قماش نظيف بثبات على موضع النزيف.',
        'اتصل فوراً بـ ٩٩٧ وأبقِ محيط المريض خالياً من الزحام.',
      ],
      en: [
        'Check breathing; if breathing normally while unconscious, place in recovery side position.',
        'Apply firm direct pressure with clean gauze/cloth to any active severe bleeding.',
        'Call 997 immediately and keep bystanders clear.',
      ],
      ur: [
        'سانس چیک کریں؛ اگر سانس چل رہی ہو تو مریض کو ایک کروٹ (ریکوری پوزیشن) پر لٹائیں۔',
        'اگر خون بہہ رہا ہو تو صاف کپڑے یا پٹی سے براہِ راست دباؤ ڈالیں۔',
        'فوراً 997 پر کال کریں اور اردگرد بھیڑ نہ لگنے دیں۔',
      ],
      id: [
        'Periksa napas; jika bernapas namun tidak sadar, posisikan miring mantap (recovery position).',
        'Tekan langsung sumber pendarahan berat menggunakan kain atau kasa bersih.',
        'Segera hubungi 997 dan jaga area tetap lapang.',
      ],
    },
    warning: {
      ar: 'يُمنع منعاً باتاً سكب الماء في فم المصاب أو إعطاؤه أي شراب أثناء فقدان الوعي.',
      en: 'Never pour water or give oral fluids to an unconscious or convulsing patient.',
      ur: 'بے ہوش یا دورے کی حالت میں منہ میں پانی یا کوئی مشروب ہرگز نہ ڈالیں۔',
      id: 'Dilarang keras memasukkan air atau minuman ke mulut pasien yang tidak sadar.',
    },
    responder: {
      impression: {
        ar: 'إغماء حاد / نوبة صرع / اشتباه حادث وعائي دماغي أو صدمة نقص حجم الدم.',
        en: 'Syncope / Post-ictal state / Suspected CVA or Hemorrhagic Compromise.',
        ur: 'سنگین بے ہوشی / مرگی کا دورہ / فالج یا شدید خون کی کمی کا شبہ۔',
        id: 'Sinkop akut / Kejang / Dugaan Stroke (CVA) atau Syok Hipovolemik.',
      },
      actions: {
        ar: [
          'تأمين مجرى الهواء (Airway) مع مراعاة حماية الفقرات العنقية عند السقوط.',
          'قياس سكر الدم الفوري (Capillary Blood Glucose) لاستبعاد نقص السكر الحاد.',
          'فحص الحدقتين ومقياس جلاسكو للغيبوبة (GCS) والسيطرة على أي نزيف.',
        ],
        en: [
          'Secure airway patency with C-spine precaution if fall/trauma occurred.',
          'Check immediate point-of-care blood glucose to rule out severe hypoglycemia.',
          'Assess GCS, pupillary response, and hemorrhage control before rapid transport.',
        ],
        ur: [
          'سانس کی نالی (Airway) محفوظ کریں اور گرنے کی صورت میں گردن کی حفاظت کا خیال رکھیں۔',
          'ہائپوگلائسیمیا کو مسترد کرنے کے لیے فوری بلڈ شوگر چیک کریں۔',
          'جی سی ایس (GCS) اور آنکھوں کی پتلیوں کا معائنہ کر کے فوری ہسپتال منتقل کریں۔',
        ],
        id: [
          'Amankan jalan napas dengan proteksi tulang leher jika ada riwayat jatuh.',
          'Periksa kadar gula darah sewaktu segera untuk menyingkirkan hipoglikemia berat.',
          'Nilai GCS, respons pupil, dan kendalikan pendarahan sebelum transportasi cepat.',
        ],
      },
      equipment: {
        ar: 'نقالة صلبة + طوق عنق احتياطي + جهاز قياس السكر + حقيبة مجرى هواء وأكسجين.',
        en: 'Rigid Stretcher + Cervical Collar + Glucometer + Airway Kit & O2.',
        ur: 'اسٹریچر + سروائیکل کالر + گلوکومیٹر + ایئر وے کٹ اور آکسیجن۔',
        id: 'Tandu rigid + Penyangga leher + Glukometer + Kit Jalan Napas & Oksigen.',
      },
      precautions: {
        ar: 'خطر استنشاق السوائل (Aspiration) مرتفع؛ لا يُترك المريض مستلقياً على ظهره دون مراقبة مجرى الهواء.',
        en: 'High aspiration risk; maintain lateral recovery or suction-ready airway management.',
        ur: 'سانس کی نالی میں مائع جانے (Aspiration) کا خطرہ زیادہ ہے؛ مسلسل نگرانی رکھیں۔',
        id: 'Risiko aspirasi tinggi; pertahankan posisi miring mantap atau siapkan suction.',
      },
    },
  },
  heatstroke: {
    level: 'critical',
    keywords: [
      'ضربه شمس', 'هذيان', 'توقف التعرق', 'حراره مرتفعه جدا', 'heatstroke',
      'delirium', 'سن اسٹروک', 'شدید بخار', 'heat stroke', 'mengigau',
    ],
    title: {
      ar: 'اشتباه ضربة شمس حرجة',
      en: 'Suspected Severe Heatstroke',
      ur: 'شدید ہیٹ اسٹروک (لو لگنے) کا شبہ',
      id: 'Dugaan Heatstroke Berat (Sengatan Panas)',
    },
    summary: {
      ar: 'ارتفاع الحرارة المصحوب بتشوش ذهني حالة حرجة (أحمر) تتطلب تبريداً فورياً وتدخلاً طبياً.',
      en: 'Hyperthermia with altered mental state is a critical emergency (Red) needing rapid cooling.',
      ur: 'ذہنی الجھن کے ساتھ تیز حرارت ایک ہنگامی حالت (ریڈ) ہے جس میں فوری ٹھنڈک ضروری ہے۔',
      id: 'Hipertermia disertai gangguan kesadaran adalah kondisi kritis (Merah) yang butuh pendinginan cepat.',
    },
    steps: {
      ar: [
        'انقل المصاب فوراً إلى منطقة مظللة ومكيفة داخل المسجد الحرام.',
        'ابدأ بالتبريد باستخدام رش الماء الفاتر ووضع كمادات باردة على الرقبة والإبطين.',
        'اطلب الهلال الأحمر ٩٩٧ فوراً لتلقي السوائل الوريدية.',
      ],
      en: [
        'Move the patient immediately into a shaded, air-conditioned prayer hall.',
        'Begin active evaporative cooling with tepid water mist and cold packs on neck/armpits.',
        'Call 997 immediately for urgent IV cooling therapy.',
      ],
      ur: [
        'مریض کو فوراً مسجد کے اندر سایہ دار اور ٹھنڈی جگہ منتقل کریں۔',
        'گردن اور بغلوں پر ٹھنڈی پٹیاں رکھیں اور ہلکے ٹھنڈے پانی کا چھڑکاؤ کریں۔',
        'فوری طبی امداد اور ڈرپ کے لیے 997 پر کال کریں۔',
      ],
      id: [
        'Segera pindahkan pasien ke area teduh ber-AC di dalam Masjidil Haram.',
        'Lakukan pendinginan aktif dengan kompres dingin di leher dan ketiak.',
        'Segera hubungi 997 untuk terapi cairan intravena darurat.',
      ],
    },
    warning: {
      ar: 'تجنب إجبار المريض المشوش ذهنياً على الشرب.',
      en: 'Do not force oral fluids if the patient is confused or disoriented.',
      ur: 'اگر مریض حواس میں نہ ہو تو زبردستی پانی نہ پلائیں۔',
      id: 'Jangan paksa pasien minum jika kesadaran menurun atau linglung.',
    },
    responder: {
      impression: {
        ar: 'ضربة شمس كلاسيكية أو إجهادية (Exertional Heatstroke) مع اختلال التنظيم الحراري.',
        en: 'Exertional / Classic Heatstroke with CNS thermoregulatory dysfunction.',
        ur: 'شدید ہیٹ اسٹروک اور جسمانی درجہ حرارت کے نظام میں خرابی۔',
        id: 'Heatstroke Klasik / Eksersional dengan disfungsi termoregulasi SSP.',
      },
      actions: {
        ar: [
          'قياس درجة الحرارة المركزية والبدء الفوري ببروتوكول التبريد السريع (Cooling Unit).',
          'تركيب خط وريدي وإعطاء محلول ملحي مبرد (Normal Saline) مع مراقبة الوعي.',
          'نقل المريض لأقرب وحدة ضربات شمس مجهزة داخل مستشفيات الحرم.',
        ],
        en: [
          'Measure core temperature and initiate rapid active cooling protocol immediately.',
          'Start cooled IV Normal Saline infusion and monitor neurological status.',
          'Transport urgently to the nearest Makkah Heatstroke Unit.',
        ],
        ur: [
          'جسم کا درجہ حرارت ناپیں اور فوری کولنگ پروٹوکول شروع کریں۔',
          'آئی وی نارمل سلائن لگائیں اور اعصابی حالت کی نگرانی کریں۔',
          'قریبی ہیٹ اسٹروک یونٹ میں فوری منتقل کریں۔',
        ],
        id: [
          'Ukur suhu inti tubuh dan mulai protokol pendinginan aktif segera.',
          'Pasang infus NaCl dingin dan pantau status neurologis pasien.',
          'Rujuk segera ke Unit Penanganan Heatstroke terdekat di Makkah.',
        ],
      },
      equipment: {
        ar: 'نقالة + كمادات تبريد فورية + سوائل وريدية + مقياس حرارة رقمي.',
        en: 'Stretcher + Instant Ice Packs/Mist Fan + IV Fluids + Core Thermometer.',
        ur: 'اسٹریچر + آئس پیک + آئی وی فلوئڈ + تھرمامیٹر۔',
        id: 'Tandu + Kompres es instan + Cairan infus + Termometer.',
      },
      precautions: {
        ar: 'راقب حدوث تشنجات أو تدهور في التنفس أثناء التبريد السريع.',
        en: 'Monitor closely for shivering, seizures, or airway compromise during cooling.',
        ur: 'ٹھنڈا کرنے کے دوران کپکپی یا دورے پڑنے پر کڑی نظر رکھیں۔',
        id: 'Awasi risiko kejang atau gangguan jalan napas selama proses pendinginan.',
      },
    },
  },
  heat_exhaustion: {
    level: 'urgent',
    keywords: [
      'اجهاد حراري', 'دوخه', 'دوار', 'جفاف', 'غثيان', 'قيء', 'استفراغ', 'تعرق غزير',
      'شمس', 'ارهاق شديد', 'dizziness', 'dizzy', 'dehydration', 'heat', 'nausea',
      'vomit', 'چکر', 'گرمی', 'پیاس', 'قے', 'pusing', 'dehidrasi', 'panas', 'mual',
    ],
    title: {
      ar: 'إجهاد حراري أو دوخة وجفاف',
      en: 'Heat Exhaustion, Dizziness & Dehydration',
      ur: 'گرمی کی تھکن، چکر اور پانی کی کمی',
      id: 'Kelelahan Panas, Pusing & Dehidrasi',
    },
    summary: {
      ar: 'حالة عاجلة (أصفر) تتطلب التوجه لمنطقة مكيفة وتعويض السوائل ومراجعة النقطة الطبية.',
      en: 'Urgent priority (Yellow): requires immediate cooling, rest, and hydration assessment.',
      ur: 'فوری توجہ (یلو): ٹھنڈی جگہ آرام، نمکیات کی بحالی اور کلینک کا معائنہ ضروری ہے۔',
      id: 'Prioritas Mendesak (Kuning): perlu segera berteduh, hidrasi, dan evaluasi pos medis.',
    },
    steps: {
      ar: [
        'انقل المريض إلى الظل والمصليات المكيفة بعيداً عن الشمس.',
        'أرح المريض مستلقياً مع رفع الساقين قليلاً إذا كان واعياً تماماً.',
        'أعطه رشفات صغيرة من الماء أو محلول الجفاف، وتوجه لأقرب نقطة إسعاف.',
      ],
      en: [
        'Move the patient into a shaded, air-conditioned indoor area.',
        'Have the patient lie down with legs slightly elevated if fully conscious.',
        'Offer small sips of water/electrolytes and visit the nearest Haram clinic.',
      ],
      ur: [
        'مریض کو دھوپ سے ہٹا کر ایئر کنڈیشنڈ سایہ دار حصے میں لے جائیں۔',
        'اگر مکمل ہوش میں ہو تو لٹا کر ٹانگیں ہلکی سی اوپر اٹھائیں۔',
        'تھوڑا تھوڑا پانی یا او آر ایس پلائیں اور قریبی طبی مرکز جائیں۔',
      ],
      id: [
        'Pindahkan pasien ke ruang ber-AC yang teduh di dalam masjid.',
        'Baringkan pasien dengan kaki sedikit ditinggikan jika sadar penuh.',
        'Berikan tegukan air sedikit demi sedikit dan kunjungi pos medis terdekat.',
      ],
    },
    warning: {
      ar: 'إذا استمر القيء أو ظهر تشوش ذهني، اطلب الدعم الإسعافي فوراً.',
      en: 'If vomiting persists or confusion develops, escalate to emergency 997.',
      ur: 'اگر قے جاری رہے یا غنودگی طاری ہو تو فوراً 997 پر رابطہ کریں۔',
      id: 'Jika muntah berlanjut atau muncul linglung, segera hubungi darurat 997.',
    },
    responder: {
      impression: {
        ar: 'إنهاك حراري ونقص سوائل وأملاح ناتج عن الطواف/السعي في أجواء حارة.',
        en: 'Heat exhaustion & moderate dehydration secondary to pilgrimage exertion.',
        ur: 'گرمی اور مشقت کے باعث پانی اور نمکیات کی کمی (Heat Exhaustion)۔',
        id: 'Kelelahan panas & dehidrasi sedang akibat aktivitas ibadah.',
      },
      actions: {
        ar: [
          'قياس العلامات الحيوية (ضغط الدم، النبض، الحرارة) واستبعاد هبوط السكر.',
          'إعطاء محاليل الإرواء الفموي (ORS) أو خط وريدي إذا كان هناك قيء متكرر.',
          'المراقبة لمدة ١٥–٢٠ دقيقة في العيادة الميدانية حتى استقرار الضغط.',
        ],
        en: [
          'Assess vitals (orthostatic BP, HR, Temp) and check blood glucose.',
          'Administer ORS orally or IV crystalloid if persistent vomiting is present.',
          'Observe in shaded clinic for 15–20 minutes until hemodynamically stable.',
        ],
        ur: [
          'بلڈ پریشر، نبض، درجہ حرارت اور شوگر چیک کریں۔',
          'او آر ایس پلائیں یا مسلسل قے کی صورت میں آئی وی ڈرپ لگائیں۔',
          'کلینک میں 15 سے 20 منٹ مشاہدے میں رکھیں۔',
        ],
        id: [
          'Ukur tanda vital (TD, nadi, suhu) dan periksa gula darah.',
          'Berikan oralit (ORS) atau cairan IV bila pasien muntah terus-menerus.',
          'Observasi 15–20 menit di klinik hingga kondisi stabil.',
        ],
      },
      equipment: {
        ar: 'كرسي متحرك + جهاز ضغط وحرارة + محاليل إرواء فموي أو وريدية.',
        en: 'Wheelchair + Vital Signs Monitor + ORS / IV Crystalloids.',
        ur: 'وہیل چیئر + بی پی و شوگر مانیٹر + او آر ایس / آئی وی سیٹ۔',
        id: 'Kursi roda + Alat ukur tanda vital + Oralit / Set infus.',
      },
      precautions: {
        ar: 'تأكد من عدم وجود أعراض قلبية مرافقة لدى كبار السن قبل السماح باستكمال المناسك.',
        en: 'Rule out silent cardiac ischemia in elderly pilgrims before discharging.',
        ur: 'بزرگ زائرین کو اجازت دینے سے پہلے دل کے کسی عارضے کا امکان رد کریں۔',
        id: 'Pastikan tidak ada gangguan jantung tersembunyi pada jamaah lansia sebelum pulang.',
      },
    },
  },
  hypoglycemia: {
    level: 'urgent',
    keywords: [
      'هبوط سكر', 'نقص سكر', 'رعشه', 'رجفه', 'تعرق بارد', 'سكري', 'شحوب',
      'low sugar', 'hypoglycemia', 'tremor', 'diabetes', 'شوگر', 'کپکپی', 'gula darah',
      'gemetar', 'lemas',
    ],
    title: {
      ar: 'اشتباه هبوط سكر الدم',
      en: 'Suspected Hypoglycemia (Low Blood Sugar)',
      ur: 'بلڈ شوگر کم ہونے (ہائپوگلائسیمیا) کا شبہ',
      id: 'Dugaan Hipoglikemia (Gula Darah Rendah)',
    },
    summary: {
      ar: 'حالة عاجلة (أصفر) تستجيب بسرعة لإعطاء سكر سريع الامتصاص إذا كان المريض واعياً.',
      en: 'Urgent priority (Yellow): requires rapid glucose intake if awake and alert.',
      ur: 'فوری توجہ (یلو): اگر مریض ہوش میں ہو تو فوراً میٹھی چیز یا جوس دیں۔',
      id: 'Prioritas Mendesak (Kuning): memerlukan asupan gula cepat jika pasien sadar.',
    },
    steps: {
      ar: [
        'أجلس المريض في مكان آمن وتأكد من قدرته على البلع بوعي تام.',
        'أعطه عصيراً محلى أو ٣ تمرات أو ملعقة عسل فوراً.',
        'أعد الفحص بعد ١٥ دقيقة في أقرب مركز إسعافي بالحرم.',
      ],
      en: [
        'Seat the patient safely and verify full consciousness and swallowing ability.',
        'Give fast-acting sugar immediately (sweet juice, 3 dates, or glucose gel).',
        'Recheck at the nearest Haram medical post after 15 minutes.',
      ],
      ur: [
        'مریض کو محفوظ جگہ بٹھائیں اور یقین کر لیں کہ وہ نگلنے کے قابل ہے۔',
        'فوراً میٹھا جوس، تین کھجوریں یا شہد دیں۔',
        '15 منٹ بعد قریبی طبی مرکز میں شوگر دوبارہ چیک کروائیں۔',
      ],
      id: [
        'Dudukkan pasien dengan aman dan pastikan mampu menelan dengan baik.',
        'Berikan gula cepat serap (jus manis, 3 butir kurma, atau madu).',
        'Periksa ulang kadar gula darah setelah 15 menit di pos kesehatan.',
      ],
    },
    warning: {
      ar: 'لا تعطِ أي طعام أو عصير إذا كان المريض شبه غائب عن الوعي.',
      en: 'Do not give oral sugar if the patient is drowsy or unable to swallow safely.',
      ur: 'اگر مریض نیم بے ہوش ہو تو منہ کے ذریعے کچھ نہ دیں۔',
      id: 'Jangan berikan makanan atau minuman jika pasien mengantuk berat atau sulit menelan.',
    },
    responder: {
      impression: {
        ar: 'نوبة هبوط سكر الدم (Hypoglycemia) بسبب المجهود وتأخر الوجبات أو جرعة الإنسولين.',
        en: 'Acute Hypoglycemia related to fasting/exertion or diabetes medication.',
        ur: 'مشقت یا انسولین کے باعث بلڈ شوگر میں اچانک کمی۔',
        id: 'Hipoglikemia akut akibat kelelahan atau penggunaan obat diabetes.',
      },
      actions: {
        ar: [
          'فحص سكر الدم الشعيري (CBG) فوراً لتأكيد القراءة (< ٧٠ ملغ/دل).',
          'إعطاء ١٥–٢٠ غرام كربوهيدرات فموية للواعي، أو Dextrose 10%/50% وريدياً عند تعذر البلع.',
          'التأكد من تناول وجبة خفيفة بعد استقرار القراءة لمنع تكرار الهبوط.',
        ],
        en: [
          'Check capillary blood glucose immediately (< 70 mg/dL threshold).',
          'Administer 15–20g oral glucose if alert, or IV Dextrose / IM Glucagon if unable to swallow.',
          'Ensure complex carbohydrate snack once stabilized to prevent rebound drop.',
        ],
        ur: [
          'فوری بلڈ شوگر (CBG) ٹیسٹ کریں۔',
          'ہوش میں ہونے پر 15-20 گرام گلوکوز دیں، ورنہ IV ڈیکسٹروز لگائیں۔',
          'بہتری کے بعد ہلکی غذا یقینی بنائیں تاکہ شوگر دوبارہ نہ گرے۔',
        ],
        id: [
          'Cek gula darah kapiler segera (< 70 mg/dL).',
          'Berikan 15–20g glukosa oral jika sadar, atau Dextrose IV bila tidak bisa menelan.',
          'Pastikan pasien makan camilan karbohidrat setelah stabil.',
        ],
      },
      equipment: {
        ar: 'جهاز قياس السكر + جل جلوكوز / محلول Dextrose وريدي + كرسي متحرك.',
        en: 'Glucometer + Oral Glucose Gel / IV Dextrose + Wheelchair.',
        ur: 'گلوکومیٹر + گلوکوز جیل / آئی وی ڈیکسٹروز + وہیل چیئر۔',
        id: 'Glukometer + Gel glukosa / Infus Dextrose + Kursi roda.',
      },
      precautions: {
        ar: 'اسأل المرافقين عن نوع أدوية السكري (إنسولين أو أقراص) لتقدير مدة المراقبة.',
        en: 'Verify insulin or sulfonylurea use to assess risk of recurrent hypoglycemia.',
        ur: 'دوبارہ کمی کے خطرے کا اندازہ لگانے کے لیے شوگر کی دوائیوں کی تفصیل پوچھیں۔',
        id: 'Tanyakan riwayat insulin atau obat diabetes untuk menilai risiko hipoglikemia berulang.',
      },
    },
  },
  musculoskeletal: {
    level: 'urgent',
    keywords: [
      'كسر', 'التواء', 'سقوط', 'لا يستطيع المشي', 'خلع', 'تورم شديد', 'الم حاد',
      'الم بطن', 'fracture', 'sprain', 'broken', 'cannot walk', 'swelling',
      'فریکچر', 'موچ', 'ہڈی', 'patah', 'keseleo', 'bengkak', 'nyeri perut',
    ],
    title: {
      ar: 'إصابة حركية أو كسر أو ألم حاد',
      en: 'Suspected Fracture, Sprain, or Acute Localized Pain',
      ur: 'ہڈی ٹوٹنے، موچ یا شدید مقامی درد کا شبہ',
      id: 'Dugaan Patah Tulang, Keseleo, atau Nyeri Akut',
    },
    summary: {
      ar: 'حالة عاجلة (أصفر) تعيق الحركة وتستوجب تثبيت العضو وطلب كرسي متحرك أو نقالة.',
      en: 'Urgent priority (Yellow): immobilize the affected area and arrange wheelchair/stretcher.',
      ur: 'فوری توجہ (یلو): متاثرہ حصے کو حرکت نہ دیں اور وہیل چیئر یا اسٹریچر منگوائیں۔',
      id: 'Prioritas Mendesak (Kuning): imobilisasi area cedera dan gunakan kursi roda/tandu.',
    },
    steps: {
      ar: [
        'ثبّت الطرف المصاب في وضعيته دون محاولة رده أو تحريكه.',
        'اطلب كرسياً متحركاً أو مساعدة فريق النقل في الحرم.',
        'ضع كمادة باردة ملفوفة بقماش لتخفيف التورم لحين الفحص.',
      ],
      en: [
        'Immobilize the injured limb in the exact position found without straightening.',
        'Request a wheelchair or Haram transport team instead of walking.',
        'Apply a wrapped cold pack to reduce swelling until clinical assessment.',
      ],
      ur: [
        'متاثرہ حصے کو اسی حالت میں سہارا دیں اور سیدھا کرنے کی کوشش نہ کریں۔',
        'پیدل چلنے کے بجائے وہیل چیئر یا طبی عملے سے مدد لیں۔',
        'سوجن کم کرنے کے لیے کپڑے میں لپٹی برف کی پٹی رکھیں۔',
      ],
      id: [
        'Pertahankan posisi bagian tubuh yang cedera tanpa mencoba meluruskannya.',
        'Minta bantuan kursi roda atau tim evakuasi Masjidil Haram.',
        'Tempelkan kompres dingin yang dibungkus kain untuk mengurangi bengkak.',
      ],
    },
    warning: {
      ar: 'تجنب الضغط أو التحميل على الطرف المصاب نهائياً.',
      en: 'Avoid weight-bearing on the injured limb.',
      ur: 'زخمی ٹانگ یا پاؤں پر بالکل وزن نہ ڈالیں۔',
      id: 'Hindari menumpu berat badan pada anggota tubuh yang cedera.',
    },
    responder: {
      impression: {
        ar: 'إصابة عضلية هيكلية (التواء/كسر مغلق) أو ألم حاد يتطلب تقييماً تصويرياً.',
        en: 'Suspected musculoskeletal trauma (fracture/sprain) or acute abdominal pain.',
        ur: 'ہڈی یا جوڑ کی چوٹ (فریکچر/موچ) یا شدید درد جس کے لیے معائنہ درکار ہے۔',
        id: 'Trauma muskuloskeletal (fraktur/sprain) atau nyeri akut yang butuh evaluasi.',
      },
      actions: {
        ar: [
          'فحص التروية الدموية والإحساس الطرفي (Distal Pulse & Sensation) قبل التجبير.',
          'تثبيت الطرف المصاب بجبيرة مؤقتة (Splint) قبل النقل.',
          'تحويل الحالة لأقرب مستشفى لعمل الأشعة السينية عند الاشتباه بكسر.',
        ],
        en: [
          'Assess distal neurovascular status (pulse, capillary refill, sensation) pre-splinting.',
          'Apply padded splint immobilization prior to wheelchair/stretcher transfer.',
          'Refer for X-ray imaging if bony tenderness or deformity is present.',
        ],
        ur: [
          'پٹی باندھنے سے پہلے متاثرہ حصے کی نبض اور حس (Neurovascular status) چیک کریں۔',
          'منتقلی سے پہلے عارضی اسپلنٹ (Splint) سے جوڑ کو سہارا دیں۔',
          'فریکچر کے شبہ میں ایکسرے کے لیے قریبی ہسپتال بھیجیں۔',
        ],
        id: [
          'Periksa status neurovaskular distal (nadi dan sensasi) sebelum pembidaian.',
          'Pasang bidai (splint) sebelum memindahkan pasien.',
          'Rujuk untuk pemeriksaan rontgen bila dicurigai patah tulang.',
        ],
      },
      equipment: {
        ar: 'جبيرة تثبيت + كرسي متحرك أو نقالة + كمادات باردة + مسكنات وفق البروتوكول.',
        en: 'Splint Kit + Wheelchair/Stretcher + Cold Packs + Analgesia per protocol.',
        ur: 'اسپلنٹ کٹ + وہیل چیئر یا اسٹریچر + کولڈ پیک۔',
        id: 'Kit bidai + Kursi roda/Tandu + Kompres dingin.',
      },
      precautions: {
        ar: 'إذا كان الألم في البطن حاداً ومفاجئاً، يُمنع إعطاء مسكنات أو سوائل قبل فحص الطبيب.',
        en: 'If acute abdominal pain is present, keep NPO and avoid masking signs before MD exam.',
        ur: 'شدید پیٹ درد کی صورت میں ڈاکٹر کے معائنے سے پہلے کچھ کھانے پینے نہ دیں۔',
        id: 'Jika keluhan berupa nyeri perut akut, puasakan pasien sebelum diperiksa dokter.',
      },
    },
  },
  minor_wound: {
    level: 'stable',
    keywords: [
      'جرح سطحي', 'خدش', 'تسلخ', 'احتكاك', 'قدم', 'بثور', 'صداع خفيف', 'شد عضلي',
      'عطش', 'جرح بسيط', 'blister', 'scratch', 'minor', 'headache', 'cramp', 'foot',
      'چھالا', 'معمولی زخم', 'سر درد', 'lecet', 'luka ringan', 'pusing ringan', 'kram',
    ],
    title: {
      ar: 'إصابة سطحية أو إرهاق بدني بسيط',
      en: 'Minor Superficial Injury or Mild Fatigue',
      ur: 'معمولی زخم، چھالے یا ہلکی جسمانی تھکاوٹ',
      id: 'Luka Ringan atau Kelelahan Fisik Ringan',
    },
    summary: {
      ar: 'حالة مستقرة (أخضر): يمكن التعامل معها بالإسعاف الأولي البسيط والراحة في الظل.',
      en: 'Stable priority (Green): manageable with basic wound care, hydration, and rest.',
      ur: 'مستحکم حالت (گرین): سادہ پٹی، پانی اور آرام سے بہتر ہو سکتی ہے۔',
      id: 'Prioritas Stabil (Hijau): dapat ditangani dengan perawatan luka dasar dan istirahat.',
    },
    steps: {
      ar: [
        'استرح في منطقة مظللة ومكيفة داخل الحرم.',
        'نظّف الجرح أو التسلخ بماء نظيف وغطّه بضمادة معقمة جافة.',
        'اشرب ماءً معتدلاً قبل استكمال الطواف أو السعي.',
      ],
      en: [
        'Rest in a shaded, air-conditioned area inside the mosque.',
        'Clean any minor abrasion with clean water/saline and apply a sterile dressing.',
        'Hydrate calmly before resuming Tawaf or Masa.',
      ],
      ur: [
        'مسجد کے اندر ٹھنڈی اور سایہ دار جگہ پر آرام کریں۔',
        'معمولی زخم یا چھالے کو صاف پانی سے دھو کر جراثیم سے پاک پٹی باندھیں۔',
        'طواف یا سعی جاری رکھنے سے پہلے اعتدال سے پانی پی لیں۔',
      ],
      id: [
        'Beristirahat di area teduh dan ber-AC di dalam masjid.',
        'Bersihkan luka lecet dengan air bersih lalu tutup dengan plester steril.',
        'Minum air secukupnya sebelum melanjutkan tawaf atau sai.',
      ],
    },
    warning: {
      ar: 'إذا ظهرت دوخة شديدة أو ألم متزايد، أعد التقييم أو راجع أقرب نقطة صحية.',
      en: 'Seek medical re-evaluation if symptoms worsen or dizziness develops.',
      ur: 'اگر تکلیف بڑھے یا چکر آئیں تو قریبی طبی مرکز سے رجوع کریں۔',
      id: 'Segera periksakan diri ke pos medis bila gejala memberat atau muncul pusing hebat.',
    },
    responder: {
      impression: {
        ar: 'سحجة جلدية سطحية أو بثور احتكاك بالقدمين أو إجهاد بدني بسيط.',
        en: 'Superficial friction blister/abrasion or mild mechanical fatigue.',
        ur: 'پیدل چلنے سے معمولی چھالے، رگڑ یا ہلکی تھکن۔',
        id: 'Luka lecet gesekan ringan atau kelelahan fisik ringan.',
      },
      actions: {
        ar: [
          'غسل الموضع بمحلول ملحي معقم وتطبيق ضمادة واقية مضادة للاحتكاك.',
          'تقديم نصيحة وقائية بتجفيف القدمين وارتداء جوارب/أحذية مريحة عند الخروج.',
        ],
        en: [
          'Irrigate with sterile normal saline and apply non-adherent protective dressing.',
          'Advise foot hygiene and avoiding blister rupture to prevent secondary infection.',
        ],
        ur: [
          'زخم کو جراثیم سے پاک نارمل سلائن سے صاف کر کے حفاظتی پٹی لگائیں۔',
          'چھالوں کو نہ پھوڑنے اور پاؤں خشک رکھنے کا مشورہ دیں۔',
        ],
        id: [
          'Bersihkan area lecet dengan cairan NaCl steril dan pasang balutan pelindung.',
          'Edukasi jamaah agar tidak memecahkan lepuhan guna mencegah infeksi.',
        ],
      },
      equipment: {
        ar: 'حقيبة غيار جروح أولية (محلول ملحي + شاش معقم + لاصق طبي).',
        en: 'Basic Dressing Kit (Normal Saline + Sterile Gauze + Adhesive Plasters).',
        ur: 'بنیادی ڈریسنگ کٹ (نارمل سلائن + جراثیم سے پاک پٹی)۔',
        id: 'Kit Perawatan Luka Dasar (NaCl + Kasa Steril + Plester).',
      },
      precautions: {
        ar: 'اسأل المريض إن كان مصاباً بالسكري؛ فجروح القدم لدى مرضى السكري تستلزم عناية ومتابعة دقيقة.',
        en: 'Screen for diabetes; diabetic foot abrasions require careful follow-up and offloading.',
        ur: 'شوگر کے مرض کے بارے میں پوچھیں؛ ذیابیطس کے مریضوں کے پاؤں کے زخم کو خاص توجہ درکار ہوتی ہے۔',
        id: 'Tanyakan riwayat diabetes; luka kaki pada penderita diabetes memerlukan pemantauan ketat.',
      },
    },
  },
  general_confused: {
    level: 'urgent',
    keywords: [],
    title: {
      ar: 'تغيّر في التركيز أو إجهاد عام يحتاج تقييماً',
      en: 'Altered Alertness or Fatigue Requiring Assessment',
      ur: 'توجہ میں کمی یا تھکن جس کا معائنہ ضروری ہے',
      id: 'Penurunan Konsentrasi atau Kelelahan Perlu Evaluasi',
    },
    summary: {
      ar: 'نظراً لوجود تشوش أو عدم اتزان، تُصنّف الحالة كعاجلة (أصفر) لتقييمها طبياً.',
      en: 'Due to reported confusion or dizziness, this case is classified as Urgent (Yellow).',
      ur: 'چکر یا غنودگی کے پیش نظر اس کیس کو فوری توجہ (یلو) میں رکھا گیا ہے۔',
      id: 'Karena disertai pusing/linglung, kasus ini diklasifikasikan Mendesak (Kuning).',
    },
    steps: {
      ar: [
        'أجلس المريض في مكان هادئ ومكوف وبعيد عن الازدحام.',
        'راقب تنفسه ووعيه باستمرار ولا تتركه بمفرده.',
        'رافق المريض أو استدعِ المسعف الميداني في أقرب نقطة.',
      ],
      en: [
        'Seat the patient in a quiet, shaded spot away from crowd pressure.',
        'Keep the patient accompanied and monitor alertness continuously.',
        'Escort to or summon the nearest Haram medical post.',
      ],
      ur: [
        'مریض کو بھیڑ سے دور پرسکون اور ٹھنڈی جگہ بٹھائیں۔',
        'مریض کو اکیلا نہ چھوڑیں اور اس کے ہوش و حواس پر نظر رکھیں۔',
        'قریبی طبی مرکز لے جائیں یا فیلڈ پیرامیڈک کو بلائیں۔',
      ],
      id: [
        'Dudukkan pasien di tempat tenang dan sejuk jauh dari keramaian.',
        'Dampingi pasien terus-menerus dan pantau kesadarannya.',
        'Antar ke pos medis terdekat atau panggil petugas lapangan.',
      ],
    },
    warning: {
      ar: 'إذا ساء الوعي أو صعب الكلام، اطلب الإسعاف فوراً عبر ٩٩٧.',
      en: 'Escalate to 997 immediately if speech slurs or consciousness drops further.',
      ur: 'اگر بولنے میں دشواری یا بے ہوشی بڑھے تو فوراً 997 پر کال کریں۔',
      id: 'Segera hubungi 997 bila pasien sulit bicara atau kesadaran makin menurun.',
    },
    responder: {
      impression: {
        ar: 'اضطراب وعي مبدئي قد يرتبط بالجفاف أو اضطراب السكر أو الإجهاد الشديد.',
        en: 'Mild-to-moderate altered sensorium; evaluate glucose, hydration, and vitals.',
        ur: 'ہوش میں ہلکا خلل؛ بلڈ شوگر، پانی کی کمی اور وائٹلز کا معائنہ ضروری ہے۔',
        id: 'Perubahan kesadaran ringan-sedang; perlu cek gula darah, hidrasi, dan tanda vital.',
      },
      actions: {
        ar: [
          'قياس السكر الشعيري وضغط الدم ونسبة الأكسجين SpO2 فوراً.',
          'تقييم التاريخ الدوائي والأمراض المزمنة من خلال المرافقين أو سوار المعصم.',
        ],
        en: [
          'Obtain CBG, blood pressure, heart rate, temperature, and SpO2.',
          'Verify chronic conditions and medications via companion or medical ID.',
        ],
        ur: [
          'بلڈ شوگر، بلڈ پریشر، نبض اور SpO2 فوری چیک کریں۔',
          'ساتھیوں سے دائمی بیماریوں اور دوائیوں کی تفصیل معلوم کریں۔',
        ],
        id: [
          'Periksa gula darah, tekanan darah, suhu, dan saturasi oksigen (SpO2).',
          'Tanyakan riwayat penyakit kronis dan obat rutin kepada pendamping.',
        ],
      },
      equipment: {
        ar: 'جهاز قياس السكر + جهاز علامات حيوية + كرسي متحرك.',
        en: 'Glucometer + Vital Signs Kit + Wheelchair.',
        ur: 'گلوکومیٹر + وائٹل سائن کٹ + وہیل چیئر۔',
        id: 'Glukometer + Monitor Tanda Vital + Kursi Roda.',
      },
      precautions: {
        ar: 'راقب تطور الأعراض العصبية أو الحرارية قبل السماح بالمغادرة.',
        en: 'Do not discharge without clear return to baseline mental status.',
        ur: 'مکمل ہوش بحال ہونے تک مریض کو اکیلا واپس نہ بھیجیں۔',
        id: 'Jangan pulangkan pasien sebelum kesadaran kembali normal sepenuhnya.',
      },
    },
  },
  general_stable: {
    level: 'stable',
    keywords: [],
    title: {
      ar: 'حالة أولية مستقرة تتطلب متابعة بسيطة',
      en: 'Initially Stable Case Requiring Basic Care',
      ur: 'بنیادی طور پر مستحکم حالت — سادہ نگہداشت',
      id: 'Kondisi Awal Stabil dengan Perawatan Dasar',
    },
    summary: {
      ar: 'لم تظهر علامات خطورة حرجة في الوصف المدخل، وتُصنّف الحالة مبدئياً كمستقرة (أخضر).',
      en: 'No immediate life-threatening signs detected; preliminarily classified as Stable (Green).',
      ur: 'درج تفصیلات میں کوئی فوری سنگین خطرہ ظاہر نہیں ہوا؛ حالت فی الحال مستحکم (گرین) ہے۔',
      id: 'Tidak ditemukan tanda bahaya kritis; diklasifikasikan sementara sebagai Stabil (Hijau).',
    },
    steps: {
      ar: [
        'انقل المريض إلى منطقة مريحة ومظللة بعيداً عن الزحام.',
        'قدّم له الماء تدريجياً إذا كان واعياً وقادراً على البلع دون غثيان.',
        'راجع أقرب نقطة صحية داخل الحرم إذا لم تتحسن الأعراض خلال ١٥ دقيقة.',
      ],
      en: [
        'Rest in a shaded, comfortable area away from crowd congestion.',
        'Offer water gradually if fully alert without nausea.',
        'Visit the nearest Haram health clinic if symptoms persist past 15 minutes.',
      ],
      ur: [
        'بھیڑ سے ہٹ کر آرام دہ اور سایہ دار جگہ پر بیٹھیں۔',
        'اگر متلی نہ ہو تو آہستہ آہستہ پانی پی لیں۔',
        '15 منٹ میں بہتری نہ ہو تو قریبی طبی مرکز سے رجوع کریں۔',
      ],
      id: [
        'Beristirahat di area teduh yang nyaman jauh dari kepadatan.',
        'Berikan air minum bertahap bila sadar penuh dan tidak mual.',
        'Kunjungi pos medis terdekat jika keluhan tidak membaik dalam 15 menit.',
      ],
    },
    warning: {
      ar: 'أعد التقييم فوراً أو اتصل بـ ٩٩٧ إذا ظهر ألم بالصدر أو ضيق تنفس أو دوخة شديدة.',
      en: 'Reassess immediately or call 997 if chest pain, breathlessness, or severe dizziness starts.',
      ur: 'سینے میں درد، سانس کی تنگی یا شدید چکر کی صورت میں فوراً 997 پر کال کریں۔',
      id: 'Segera evaluasi ulang atau hubungi 997 bila muncul nyeri dada, sesak, atau pusing berat.',
    },
    responder: {
      impression: {
        ar: 'شكوى بدنية خفيفة غير مهددة للحياة تتطلب فحصاً روتينياً عند الحاجة.',
        en: 'Low-acuity presentation; routine supportive assessment as needed.',
        ur: 'کم شدت کی تکلیف؛ ضرورت پڑنے پر معمول کا طبی معائنہ کیا جا سکتا ہے۔',
        id: 'Keluhan ringan non-kritis; lakukan pemeriksaan suportif rutin bila diperlukan.',
      },
      actions: {
        ar: [
          'أخذ العلامات الحيوية الأساسية للاطمئنان (BP, HR, Temp).',
          'إرشاد المعتمر حول فترات الراحة وتجنب الذروة الحرارية.',
        ],
        en: [
          'Record baseline vital signs if patient presents to field clinic.',
          'Provide preventive hydration and pacing guidance for completing rituals safely.',
        ],
        ur: [
          'کلینک آنے کی صورت میں بنیادی وائٹل سائنز چیک کریں۔',
          'مناسک کی محفوظ ادائیگی کے لیے آرام اور پانی کی رہنمائی دیں۔',
        ],
        id: [
          'Catat tanda vital dasar jika pasien mengunjungi pos kesehatan.',
          'Berikan edukasi istirahat dan hidrasi yang cukup saat beribadah.',
        ],
      },
      equipment: {
        ar: 'حقيبة فحص حيوي أساسية ومستلزمات إسعاف أولي قياسية.',
        en: 'Standard Field First-Aid & Vital Signs Kit.',
        ur: 'بنیادی فرسٹ ایڈ اور وائٹل سائن کٹ۔',
        id: 'Kit Pertolongan Pertama & Pemeriksaan Vital Dasar.',
      },
      precautions: {
        ar: 'التأكد من خلو الحالة من أمراض مزمنة غير مستقرة لدى كبار السن.',
        en: 'Confirm no unstable chronic comorbidities in elderly pilgrims.',
        ur: 'بزرگ زائرین میں پرانی بیماریوں کی غیر مستحکم حالت نہ ہونے کی تصدیق کریں۔',
        id: 'Pastikan tidak ada penyakit penyerta kronis yang tidak stabil pada jamaah lansia.',
      },
    },
  },
};

const ERRORS_LOCALIZED: Record<
  LanguageCode,
  { empty: string; unclear: string; age: string }
> = {
  ar: {
    empty: 'يرجى إدخال وصف حالة المريض أو الأعراض الظاهرة قبل بدء الفرز الأولي.',
    unclear:
      'النص المُدخل غير كافٍ أو غير مفهوم طبياً. يرجى كتابة وصف واضح للأعراض (٤ أحرف على الأقل).',
    age: 'العمر التقريبي غير صحيح؛ يرجى إدخال رقم صحيح بين ١ و ١٢٠ سنة أو ترك الحقل فارغاً.',
  },
  en: {
    empty: 'Please enter a description of the patient symptoms before running triage.',
    unclear:
      'The entered text is too short or unclear. Please provide a clear symptom description (at least 4 letters).',
    age: 'Approximate age is invalid; enter a whole number between 1 and 120 or leave it blank.',
  },
  ur: {
    empty: 'ابتدائی معائنہ شروع کرنے سے پہلے براہِ کرم مریض کی علامات درج کریں۔',
    unclear:
      'درج کردہ عبارت ناکافی یا غیر واضح ہے۔ براہِ کرم کم از کم 4 حروف میں واضح علامات لکھیں۔',
    age: 'عمر درست نہیں ہے؛ براہِ کرم 1 سے 120 کے درمیان عدد درج کریں یا خالی چھوڑ دیں۔',
  },
  id: {
    empty: 'Silakan masukkan deskripsi kondisi atau gejala pasien sebelum memulai triase.',
    unclear:
      'Teks yang dimasukkan terlalu singkat atau tidak jelas. Tuliskan gejala dengan jelas (minimal 4 huruf).',
    age: 'Perkiraan usia tidak valid; masukkan angka bulat antara 1 hingga 120 atau kosongkan.',
  },
};

const LEVEL_METADATA: Record<
  TriageLevel,
  {
    titles: Record<LanguageCode, string>;
    codes: Record<LanguageCode, string>;
    callEmergency: boolean;
  }
> = {
  critical: {
    titles: {
      ar: 'أولوية قصوى — حالة حرجة (أحمر)',
      en: 'Priority 1 — Critical Emergency (Red)',
      ur: 'ترجیح اول — انتہائی سنگین حالت (ریڈ)',
      id: 'Prioritas 1 — Darurat Kritis (Merah)',
    },
    codes: {
      ar: 'المستوى ١ · أحمر',
      en: 'Level 1 · RED',
      ur: 'لیول 1 · ریڈ',
      id: 'Level 1 · MERAH',
    },
    callEmergency: true,
  },
  urgent: {
    titles: {
      ar: 'أولوية عاجلة — رعاية قريبة (أصفر)',
      en: 'Priority 2 — Urgent Care (Yellow)',
      ur: 'ترجیح دوم — فوری طبی توجہ (یلو)',
      id: 'Prioritas 2 — Perawatan Mendesak (Kuning)',
    },
    codes: {
      ar: 'المستوى ٢ · أصفر',
      en: 'Level 2 · YELLOW',
      ur: 'لیول 2 · یلو',
      id: 'Level 2 · KUNING',
    },
    callEmergency: false,
  },
  stable: {
    titles: {
      ar: 'أولوية منخفضة — حالة مستقرة (أخضر)',
      en: 'Priority 3 — Stable / Minor (Green)',
      ur: 'ترجیح سوم — مستحکم حالت (گرین)',
      id: 'Prioritas 3 — Stabil / Ringan (Hijau)',
    },
    codes: {
      ar: 'المستوى ٣ · أخضر',
      en: 'Level 3 · GREEN',
      ur: 'لیول 3 · گرین',
      id: 'Level 3 · HIJAU',
    },
    callEmergency: false,
  },
};

const AWARENESS_LABELS: Record<
  'conscious' | 'confused' | 'unconscious',
  Record<LanguageCode, string>
> = {
  conscious: {
    ar: 'واعٍ ومتجاوب',
    en: 'Alert & Responsive',
    ur: 'ہوش میں',
    id: 'Sadar & Responsif',
  },
  confused: {
    ar: 'تشوش أو دوار',
    en: 'Confused / Dizzy',
    ur: 'غنودگی یا چکر',
    id: 'Linglung / Pusing',
  },
  unconscious: {
    ar: 'فاقد للوعي',
    en: 'Unresponsive',
    ur: 'بے ہوش',
    id: 'Tidak Sadar',
  },
};

export function evaluateTriageCase(input: TriageInput): TriageEvaluation {
  const lang = input.language;
  const errMsgs = ERRORS_LOCALIZED[lang];
  const rawSymptoms = input.symptoms.trim();

  if (!rawSymptoms) {
    return {
      ok: false,
      error: { field: 'symptoms', message: errMsgs.empty },
    };
  }

  if (!hasMeaningfulLetters(rawSymptoms) || isRepeatedGibberish(rawSymptoms)) {
    return {
      ok: false,
      error: { field: 'symptoms', message: errMsgs.unclear },
    };
  }

  let ageValue: number | null = null;
  const trimmedAge = input.ageText
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  if (trimmedAge !== '') {
    const parsed = Number(trimmedAge);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 120) {
      return {
        ok: false,
        error: { field: 'age', message: errMsgs.age },
      };
    }
    ageValue = parsed;
  }

  const normalized = normalizeText(rawSymptoms);

  let scenarioKey: ScenarioKey | null = null;

  if (input.conscious === 'unconscious') {
    scenarioKey = 'unconscious_neuro';
  } else {
    const orderedKeys: ScenarioKey[] = [
      'cardiac_respiratory',
      'unconscious_neuro',
      'heatstroke',
      'heat_exhaustion',
      'hypoglycemia',
      'musculoskeletal',
      'minor_wound',
    ];
    for (const key of orderedKeys) {
      if (SCENARIOS[key].keywords.some((kw) => normalized.includes(normalizeText(kw)))) {
        scenarioKey = key;
        break;
      }
    }
  }

  // Integrate 3D anatomical selection when text keywords didn't match a specific high-acuity pattern
  if (!scenarioKey) {
    if (input.bodyPart === 'chest') {
      scenarioKey = 'cardiac_respiratory';
    } else if (input.conscious === 'confused') {
      scenarioKey = 'general_confused';
    } else if (input.bodyPart === 'head' || input.bodyPart === 'abdomen') {
      scenarioKey = 'general_confused';
    } else if (
      input.bodyPart === 'left_leg' ||
      input.bodyPart === 'right_leg' ||
      input.bodyPart === 'feet'
    ) {
      scenarioKey = 'minor_wound';
    } else {
      scenarioKey = 'general_stable';
    }
  }

  const template = SCENARIOS[scenarioKey];
  let finalLevel: TriageLevel = template.level;

  if (
    finalLevel === 'urgent' &&
    ageValue !== null &&
    ageValue >= 70 &&
    input.conscious === 'confused'
  ) {
    finalLevel = 'critical';
  }

  const meta = LEVEL_METADATA[finalLevel];
  const zoneInfo = HARAM_ZONES[input.zone];
  const now = new Date();
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'ur' ? 'ur-PK' : lang === 'id' ? 'id-ID' : 'en-GB';
  const timeStr = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const bodyPartLabel = input.bodyPart
    ? BODY_PART_LABELS[input.bodyPart][lang]
    : null;

  return {
    ok: true,
    result: {
      id: `TWF-${now.getTime().toString().slice(-4)}`,
      timestamp: timeStr,
      level: finalLevel,
      levelTitle: meta.titles[lang],
      priorityCode: meta.codes[lang],
      categoryTitle: template.title[lang],
      summary: template.summary[lang],
      firstAidSteps: template.steps[lang],
      warningSigns: template.warning[lang],
      nearestCarePoint: zoneInfo.medicalPoint[lang],
      callEmergency: meta.callEmergency,
      zoneLabel: zoneInfo.labels[lang],
      ageValue,
      bodyPart: input.bodyPart,
      bodyPartLabel,
      awarenessLabel: AWARENESS_LABELS[input.conscious][lang],
      symptomsSnapshot: rawSymptoms,
      responderReport: {
        clinicalImpression: template.responder.impression[lang],
        immediateActions: template.responder.actions[lang],
        recommendedEquipment: template.responder.equipment[lang],
        fieldPrecautions: template.responder.precautions[lang],
        evacuationRoute: zoneInfo.evacNote[lang],
      },
    },
  };
}

export interface AITriageResponsePayload {
  level: TriageLevel;
  categoryTitle: string;
  summary: string;
  firstAidSteps: string[];
  warningSigns: string;
  responderReport: {
    clinicalImpression: string;
    immediateActions: string[];
    recommendedEquipment: string;
    fieldPrecautions: string;
  };
}

export type TriageInputValidation =
  | { ok: true; symptoms: string; ageValue: number | null }
  | { ok: false; error: ValidationError };

export function validateTriageInput(input: TriageInput): TriageInputValidation {
  const errMsgs = ERRORS_LOCALIZED[input.language];
  const rawSymptoms = input.symptoms.trim();

  if (!rawSymptoms) {
    return {
      ok: false,
      error: { field: 'symptoms', message: errMsgs.empty },
    };
  }

  if (!hasMeaningfulLetters(rawSymptoms) || isRepeatedGibberish(rawSymptoms)) {
    return {
      ok: false,
      error: { field: 'symptoms', message: errMsgs.unclear },
    };
  }

  let ageValue: number | null = null;
  const trimmedAge = input.ageText
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
  if (trimmedAge !== '') {
    const parsed = Number(trimmedAge);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 120) {
      return {
        ok: false,
        error: { field: 'age', message: errMsgs.age },
      };
    }
    ageValue = parsed;
  }

  return { ok: true, symptoms: rawSymptoms, ageValue };
}

let aiCaseSeq = 0;

export function buildTriageResultFromAI(
  input: TriageInput,
  ageValue: number | null,
  rawSymptoms: string,
  ai: AITriageResponsePayload
): TriageResult {
  const lang = input.language;
  const finalLevel: TriageLevel =
    input.conscious === 'unconscious' ? 'critical' : ai.level;
  const meta = LEVEL_METADATA[finalLevel];
  const zoneInfo = HARAM_ZONES[input.zone];
  const now = new Date();
  aiCaseSeq = (aiCaseSeq + 1) % 100;
  const locale =
    lang === 'ar' ? 'ar-SA' : lang === 'ur' ? 'ur-PK' : lang === 'id' ? 'id-ID' : 'en-GB';
  const timeStr = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const bodyPartLabel = input.bodyPart ? BODY_PART_LABELS[input.bodyPart][lang] : null;

  return {
    id: `TWF-${now.getTime().toString().slice(-4)}-${String(aiCaseSeq).padStart(2, '0')}`,
    timestamp: timeStr,
    level: finalLevel,
    levelTitle: meta.titles[lang],
    priorityCode: meta.codes[lang],
    categoryTitle: ai.categoryTitle,
    summary: ai.summary,
    firstAidSteps: ai.firstAidSteps,
    warningSigns: ai.warningSigns,
    nearestCarePoint: zoneInfo.medicalPoint[lang],
    callEmergency: meta.callEmergency,
    zoneLabel: zoneInfo.labels[lang],
    ageValue,
    bodyPart: input.bodyPart,
    bodyPartLabel,
    awarenessLabel: AWARENESS_LABELS[input.conscious][lang],
    symptomsSnapshot: rawSymptoms,
    responderReport: {
      clinicalImpression: ai.responderReport.clinicalImpression,
      immediateActions: ai.responderReport.immediateActions,
      recommendedEquipment: ai.responderReport.recommendedEquipment,
      fieldPrecautions: ai.responderReport.fieldPrecautions,
      evacuationRoute: zoneInfo.evacNote[lang],
    },
  };
}

