export type LanguageCode = 'ar' | 'en' | 'ur' | 'id';

export type BodyPartId =
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'back'
  | 'left_arm'
  | 'right_arm'
  | 'left_leg'
  | 'right_leg'
  | 'feet';

export interface LanguageMeta {
  code: LanguageCode;
  nativeLabel: string;
  dir: 'rtl' | 'ltr';
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'ar', nativeLabel: 'العربية', dir: 'rtl' },
  { code: 'en', nativeLabel: 'English', dir: 'ltr' },
  { code: 'ur', nativeLabel: 'اردو', dir: 'rtl' },
  { code: 'id', nativeLabel: 'Bahasa Indonesia', dir: 'ltr' },
];

export const BODY_PART_LABELS: Record<BodyPartId, Record<LanguageCode, string>> = {
  head: {
    ar: 'الرأس والوجه',
    en: 'Head & Face',
    ur: 'سر اور چہرہ',
    id: 'Kepala & Wajah',
  },
  neck: {
    ar: 'الرقبة والكتفان',
    en: 'Neck & Shoulders',
    ur: 'گردن اور کندھے',
    id: 'Leher & Bahu',
  },
  chest: {
    ar: 'الصدر والقلب',
    en: 'Chest & Heart',
    ur: 'سینہ اور دل',
    id: 'Dada & Jantung',
  },
  abdomen: {
    ar: 'البطن والمعدة',
    en: 'Abdomen & Stomach',
    ur: 'پیٹ اور معدہ',
    id: 'Perut & Lambung',
  },
  back: {
    ar: 'الظهر والعمود الفقري',
    en: 'Upper & Lower Back',
    ur: 'کمر اور ریڑھ کی ہڈی',
    id: 'Punggung & Tulang Belakang',
  },
  left_arm: {
    ar: 'الذراع الأيسر',
    en: 'Left Arm & Hand',
    ur: 'بایاں بازو اور ہاتھ',
    id: 'Lengan & Tangan Kiri',
  },
  right_arm: {
    ar: 'الذراع الأيمن',
    en: 'Right Arm & Hand',
    ur: 'دایاں بازو اور ہاتھ',
    id: 'Lengan & Tangan Kanan',
  },
  left_leg: {
    ar: 'الساق والركبة اليسرى',
    en: 'Left Leg & Knee',
    ur: 'بایاں گھٹنا اور ٹانگ',
    id: 'Kaki & Lutut Kiri',
  },
  right_leg: {
    ar: 'الساق والركبة اليمنى',
    en: 'Right Leg & Knee',
    ur: 'دایاں گھٹنا اور ٹانگ',
    id: 'Kaki & Lutut Kanan',
  },
  feet: {
    ar: 'القدمان والكاحلان',
    en: 'Feet & Ankles',
    ur: 'پاؤں اور ٹخنے',
    id: 'Telapak Kaki & Pergelangan',
  },
};

export interface UIStrings {
  brandName: string;
  brandSub: string;
  navTriage: string;
  navBody3D: string;
  navParamedic: string;
  navPoints: string;
  emergencyBtn: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDesc: string;
  stripLangs: string;
  strip3D: string;
  stripCard: string;
  body3DTitle: string;
  body3DHint: string;
  viewFront: string;
  viewBack: string;
  viewReset: string;
  selectedAreaLabel: string;
  noAreaSelected: string;
  clearAreaBtn: string;
  hideControls: string;
  showControls: string;
  formTitle: string;
  formSubtitle: string;
  symptomsLabel: string;
  symptomsPlaceholder: string;
  symptomsHelp: string;
  charsUnit: string;
  presetsLabel: string;
  awarenessLabel: string;
  awareConscious: string;
  awareConfused: string;
  awareUnconscious: string;
  zoneLabel: string;
  ageLabel: string;
  agePlaceholder: string;
  submitBtn: string;
  submittingBtn: string;
  retryingBtn: string;
  retryConnectionBtn: string;
  reloadPageBtn: string;
  resetBtn: string;
  errorTitle: string;
  aiFallbackError: string;
  successTitle: string;
  resultEmptyTitle: string;
  resultEmptyDesc: string;
  stepsTitle: string;
  safetyTitle: string;
  call997Btn: string;
  printCardBtn: string;
  paramedicTitle: string;
  paramedicSubtitle: string;
  paramedicImpression: string;
  paramedicActions: string;
  paramedicEquipment: string;
  paramedicPrecautions: string;
  paramedicEvac: string;
  printCardHeader: string;
  printCardSub: string;
  printCardCaseId: string;
  printCardPriority: string;
  printCardArea: string;
  printCardZone: string;
  printCardAwareness: string;
  printCardAge: string;
  printCardNotProvided: string;
  printCardSymptoms: string;
  printCardNote: string;
  historyTitle: string;
  clearHistory: string;
  levelsTitle: string;
  levelsSub: string;
  pointsTitle: string;
  pointsSub: string;
  navHealthReminders: string;
  healthRemindersTitle: string;
  healthRemindersSub: string;
  healthRemindersSource: string;
  footerNote: string;
  modalTitle: string;
  modalDesc: string;
  modalCall997: string;
  modalCall911: string;
  modalClose: string;
}

export const UI_TRANSLATIONS: Record<LanguageCode, UIStrings> = {
  ar: {
    brandName: 'طواف',
    brandSub: 'الخدمات الإسعافية لضيوف الرحمن',
    navTriage: 'الفرز الأولي',
    navBody3D: 'تحديد موضع الألم',
    navParamedic: 'تقرير المسعفين',
    navPoints: 'نقاط الإسعاف',
    emergencyBtn: 'طوارئ ٩٩٧',
    heroEyebrow: 'بوابة الرعاية الميدانية · المسجد الحرام بمكة المكرمة',
    heroTitle: 'نظام طواف للفرز الإسعافي الأولي وتوجيه المسعفين لضيوف الرحمن',
    heroDesc:
      'منصة إرشادية متعددة اللغات تمكّن المعتمر أو المرافق من تحديد موضع الألم على المجسم ثلاثي الأبعاد ووصف الأعراض، لإصدار تصنيف فوري وبطاقة إسعاف قابلة للطباعة وتقرير مهني للمسعفين.',
    stripLangs: '٤ لغات رئيسية للمعتمرين',
    strip3D: 'مجسم ثلاثي الأبعاد لتحديد الألم',
    stripCard: 'بطاقة إسعاف + تقرير للمسعفين',
    body3DTitle: '١. حدّد منطقة الألم على المجسم ثلاثي الأبعاد',
    body3DHint: 'قم بتدوير الجسم أو اضغط مباشرة على موضع الألم أو الإصابة',
    viewFront: 'واجهة أمامية',
    viewBack: 'واجهة خلفية',
    viewReset: 'إعادة الضبط',
    selectedAreaLabel: 'المنطقة المحددة:',
    noAreaSelected: 'لم يتم تحديد منطقة (اختياري)',
    clearAreaBtn: 'إلغاء التحديد',
    hideControls: 'إخفاء أزرار العرض',
    showControls: 'إظهار أزرار العرض',
    formTitle: '٢. بيانات الحالة والأعراض',
    formSubtitle: 'اكتب وصف الشكوى أو اختر من الحالات الشائعة أدناه',
    symptomsLabel: 'وصف حالة المريض والأعراض الحالية',
    symptomsPlaceholder:
      'مثال: المعتمر يشعر بألم ضاغط في الصدر مع تعرق بارد ودوخة أثناء الطواف...',
    symptomsHelp: 'أدخل ٤ أحرف على الأقل تصف الحالة بوضوح',
    charsUnit: 'حرف',
    presetsLabel: 'حالات شائعة في الحرم للتعبئة السريعة:',
    awarenessLabel: 'درجة الوعي والاستجابة',
    awareConscious: 'واعٍ ومتجاوب',
    awareConfused: 'تشوش أو دوار',
    awareUnconscious: 'فاقد للوعي',
    zoneLabel: 'الموقع داخل المسجد الحرام',
    ageLabel: 'العمر التقريبي (اختياري)',
    agePlaceholder: 'مثال: 55',
    submitBtn: 'إصدار الفرز وبطاقة الإسعاف',
    submittingBtn: 'جارٍ تحليل الحالة بالذكاء الاصطناعي...',
    retryingBtn: 'النموذج يشهد ضغطاً مؤقتاً — جارٍ إعادة المحاولة...',
    retryConnectionBtn: 'إعادة المحاولة',
    reloadPageBtn: 'إعادة تحميل الصفحة',
    resetBtn: 'مسح الحقول',
    errorTitle: 'تعذر إتمام الفرز الأولي',
    aiFallbackError: 'تعذر الاتصال بخدمة التحليل الذكي حالياً. يرجى المحاولة مرة أخرى.',
    successTitle: 'تم الفرز الأولي وإعداد بطاقة الإسعاف وتقرير المسعفين',
    resultEmptyTitle: 'نتيجة الفرز والبطاقة الإسعافية',
    resultEmptyDesc:
      'حدد منطقة الألم على المجسم ثلاثي الأبعاد وأدخل الأعراض لإصدار التصنيف الطبي، تقرير المسعفين، وبطاقة الطباعة.',
    stepsTitle: 'إجراءات الإسعاف الأولي الفوري',
    safetyTitle: 'تنبيه السلامة:',
    call997Btn: 'اتصال مباشر بالهلال الأحمر ٩٩٧',
    printCardBtn: 'طباعة بطاقة الحالة لعرضها على الإسعاف',
    paramedicTitle: 'تقرير وتوجيهات المسعفين الميدانيين',
    paramedicSubtitle: 'ملخص سريري مختصر يُعرض لفرقة الهلال الأحمر عند الوصول',
    paramedicImpression: 'الاحتمال السريري المبدئي',
    paramedicActions: 'أولويات التدخل الميداني (ABCDE)',
    paramedicEquipment: 'التجهيزات ووسيلة النقل المقترحة',
    paramedicPrecautions: 'محاذير وموانع ميدانية',
    paramedicEvac: 'مسار الإخلاء المقترح داخل الحرم',
    printCardHeader: 'بطاقة فرز إسعافي أولي — طواف (المسجد الحرام)',
    printCardSub: 'تُعرض هذه البطاقة على فريق الإسعاف أو الهلال الأحمر ٩٩٧',
    printCardCaseId: 'رقم البلاغ المرجعي',
    printCardPriority: 'تصنيف الأولوية',
    printCardArea: 'موضع الألم المحدد',
    printCardZone: 'الموقع بالحرم',
    printCardAwareness: 'مستوى الوعي',
    printCardAge: 'العمر',
    printCardNotProvided: 'غير محدد',
    printCardSymptoms: 'وصف الحالة المدخل',
    printCardNote: 'هذا الفرز إرشادي مبدئي لتسريع استجابة المسعفين.',
    historyTitle: 'سجل الحالات للجلسة الحالية',
    clearHistory: 'مسح السجل',
    levelsTitle: 'مستويات الفرز المعتمدة في خدمة ضيوف الرحمن',
    levelsSub: 'توافق معايير التصنيف الثلاثي لتسريع الاستجابة الطبية في الحرم المكي',
    pointsTitle: 'نقاط الرعاية وأرقام الطوارئ في المسجد الحرام',
    pointsSub: 'مواقع مراكز تجمع مكة الصحي وفرق الهلال الأحمر الميدانية على مدار الساعة',
    navHealthReminders: 'توجيهات صحية',
    healthRemindersTitle: 'أمور يجب أن تتذكرها للصحة في العمرة',
    healthRemindersSub:
      'أبرز الإرشادات الوقائية والصحية المستخلصة من دليل العمرة والزيارة بوزارة الحج والعمرة ووزارة الصحة',
    healthRemindersSource: 'المصدر الإرشادي: بوابة وزارة الحج والعمرة (دليل العمرة · الصحة)',
    footerNote:
      'منصة طواف — واجهة فرز أولي إرشادية لضيوف الرحمن ولا تغني عن التقييم الطبي المباشر.',
    modalTitle: 'بلاغ إسعاف فوري داخل المسجد الحرام',
    modalDesc:
      'في الحالات الحرجة اتصل فوراً بالهلال الأحمر ٩٩٧ أو أبلغ أقرب رجل أمن مع ذكر رقم الباب أو العمود ومستوى الأولوية.',
    modalCall997: 'اتصال بالهلال الأحمر السعودي ٩٩٧',
    modalCall911: 'اتصال بالعمليات الموحدة ٩١١',
    modalClose: 'إغلاق',
  },
  en: {
    brandName: 'Tawaf',
    brandSub: 'Pilgrim First-Aid Triage Service',
    navTriage: 'Initial Triage',
    navBody3D: '3D Pain Locator',
    navParamedic: 'Paramedic Brief',
    navPoints: 'Care Points',
    emergencyBtn: 'Emergency 997',
    heroEyebrow: 'Field Care Portal · Al-Haram Al-Makki, Makkah',
    heroTitle: 'Tawaf Initial Medical Triage & Paramedic Dispatch Brief for Pilgrims',
    heroDesc:
      'A multilingual rapid-triage interface enabling pilgrims and companions to pinpoint pain on a 3D body model, assess severity, print a responder triage card, and share clinical guidance with paramedics.',
    stripLangs: '4 Pilgrim Languages',
    strip3D: 'Interactive 3D Pain Locator',
    stripCard: 'Printable Card + Paramedic Report',
    body3DTitle: '1. Pinpoint Pain Area on the 3D Body Model',
    body3DHint: 'Rotate the 3D figure or tap directly on the painful or injured area',
    viewFront: 'Front View',
    viewBack: 'Back View',
    viewReset: 'Reset View',
    selectedAreaLabel: 'Selected Area:',
    noAreaSelected: 'None selected (optional)',
    clearAreaBtn: 'Clear Selection',
    hideControls: 'Hide Controls',
    showControls: 'Show Controls',
    formTitle: '2. Patient Condition & Symptoms',
    formSubtitle: 'Describe the complaint or choose a common Haram scenario below',
    symptomsLabel: 'Describe Patient Symptoms & Condition',
    symptomsPlaceholder:
      'Example: Pilgrim feels crushing chest pain with cold sweat and dizziness during Tawaf...',
    symptomsHelp: 'Enter at least 4 characters clearly describing the symptoms',
    charsUnit: 'chars',
    presetsLabel: 'Quick-fill common Al-Haram scenarios:',
    awarenessLabel: 'Consciousness & Responsiveness',
    awareConscious: 'Alert & Responsive',
    awareConfused: 'Confused / Dizzy',
    awareUnconscious: 'Unresponsive',
    zoneLabel: 'Location Inside Al-Haram',
    ageLabel: 'Approximate Age (Optional)',
    agePlaceholder: 'e.g. 55',
    submitBtn: 'Run Triage & Generate Pass',
    submittingBtn: 'Analyzing symptoms with AI...',
    retryingBtn: 'Model busy — retrying connection...',
    retryConnectionBtn: 'Retry Connection',
    reloadPageBtn: 'Reload Page',
    resetBtn: 'Reset Form',
    errorTitle: 'Unable to Complete Triage',
    aiFallbackError: 'Unable to reach the AI triage service right now. Please try again.',
    successTitle: 'Triage Completed — Ambulance Card & Paramedic Brief Ready',
    resultEmptyTitle: 'Triage Result & Ambulance Pass',
    resultEmptyDesc:
      'Select a pain zone on the 3D body and enter symptoms to generate priority classification, responder tips, and a printable triage card.',
    stepsTitle: 'Immediate First-Aid Actions',
    safetyTitle: 'Safety Notice:',
    call997Btn: 'Call Saudi Red Crescent 997',
    printCardBtn: 'Print Triage Card for Ambulance',
    paramedicTitle: 'Paramedic & Responder Advisory Report',
    paramedicSubtitle: 'Concise field handover brief for Red Crescent teams upon arrival',
    paramedicImpression: 'Suspected Clinical Pathway',
    paramedicActions: 'Priority Field Interventions (ABCDE)',
    paramedicEquipment: 'Recommended Equipment & Transport',
    paramedicPrecautions: 'Field Precautions & Contraindications',
    paramedicEvac: 'Haram Evacuation Guidance',
    printCardHeader: 'Tawaf First-Aid Triage Pass — Al-Haram Al-Makki',
    printCardSub: 'Present this card to Saudi Red Crescent (997) or Haram paramedics',
    printCardCaseId: 'Case Reference',
    printCardPriority: 'Triage Priority',
    printCardArea: '3D Pain Area',
    printCardZone: 'Haram Location',
    printCardAwareness: 'Consciousness',
    printCardAge: 'Age',
    printCardNotProvided: 'Not specified',
    printCardSymptoms: 'Reported Symptoms',
    printCardNote: 'Preliminary field guidance to accelerate emergency medical handover.',
    historyTitle: 'Session Triage Log',
    clearHistory: 'Clear Log',
    levelsTitle: 'Standard 3-Tier Haram Triage Levels',
    levelsSub: 'Structured severity classification to accelerate emergency care in Makkah',
    pointsTitle: 'Medical Care Points & Emergency Numbers in Al-Haram',
    pointsSub: '24/7 Makkah Health Cluster clinics and Saudi Red Crescent mobile units',
    navHealthReminders: 'Health Guide',
    healthRemindersTitle: 'Health Things to Remember for Umrah',
    healthRemindersSub:
      'Essential preventive health guidance adapted from the Ministry of Hajj & Umrah and Saudi Ministry of Health Umrah Guide',
    healthRemindersSource: 'Reference: Ministry of Hajj & Umrah Portal (Umrah · Health)',
    footerNote:
      'Tawaf — Preliminary field triage guidance for pilgrims; does not replace direct medical evaluation.',
    modalTitle: 'Immediate Ambulance Dispatch in Al-Haram',
    modalDesc:
      'For critical cases, call 997 immediately or alert the nearest security officer with your exact gate/pillar number and triage level.',
    modalCall997: 'Call Red Crescent 997',
    modalCall911: 'Call Unified Security 911',
    modalClose: 'Close',
  },
  ur: {
    brandName: 'طواف',
    brandSub: 'ضوف الرحمن ہنگامی طبی سہولت',
    navTriage: 'ابتدائی معائنہ',
    navBody3D: 'درد کا مقام',
    navParamedic: 'طبی عملے کی رپورٹ',
    navPoints: 'طبی مراکز',
    emergencyBtn: 'ایمرجنسی 997',
    heroEyebrow: 'میدانی طبی پورٹل · مسجد الحرام، مکہ مکرمہ',
    heroTitle: 'معتمرین کے لیے طواف ابتدائی طبی درجہ بندی اور ایمبولینس رہنمائی نظام',
    heroDesc:
      'چار زبانوں پر مشتمل ایک فوری طبی نظام جو زائرین کو 3D جسم پر درد کا مقام منتخب کرنے، علامات درج کرنے، ایمبولینس کارڈ پرنٹ کرنے اور طبی عملے کے لیے کلینیکل رپورٹ تیار کرنے میں مدد دیتا ہے۔',
    stripLangs: 'معتمرین کے لیے 4 زبانیں',
    strip3D: '3D جسم پر درد کا انتخاب',
    stripCard: 'پرنٹ کارڈ + طبی عملے کی رپورٹ',
    body3DTitle: '1. 3D جسم پر درد یا چوٹ کی جگہ منتخب کریں',
    body3DHint: 'ماڈل کو گھمائیں یا براہِ راست متاثرہ حصے پر کلک کریں',
    viewFront: 'سامنے کا رخ',
    viewBack: 'پیچھے کا رخ',
    viewReset: 'دوبارہ سیٹ',
    selectedAreaLabel: 'منتخب حصہ:',
    noAreaSelected: 'کوئی حصہ منتخب نہیں (اختیاری)',
    clearAreaBtn: 'انتخاب ختم کریں',
    hideControls: 'کنٹرول چھپائیں',
    showControls: 'کنٹرول دکھائیں',
    formTitle: '2. مریض کی حالت اور علامات',
    formSubtitle: 'تکلیف کی تفصیل لکھیں یا نیچے دی گئی عام حالتوں میں سے منتخب کریں',
    symptomsLabel: 'مریض کی حالت اور موجودہ علامات درج کریں',
    symptomsPlaceholder:
      'مثال: طواف کے دوران سینے میں شدید دباؤ، ٹھنڈا پسینہ اور چکر آ رہے ہیں...',
    symptomsHelp: 'کم از کم 4 حروف میں واضح علامات لکھیں',
    charsUnit: 'حروف',
    presetsLabel: 'فوری انتخاب کے لیے حرم کی عام طبی حالتیں:',
    awarenessLabel: 'ہوش و حواس کی کیفیت',
    awareConscious: 'ہوش میں اور متوجہ',
    awareConfused: 'غنو دگی یا چکر',
    awareUnconscious: 'بے ہوش',
    zoneLabel: 'مسجد الحرام میں مقام',
    ageLabel: 'تقریباً عمر (اختیاری)',
    agePlaceholder: 'مثال: 55',
    submitBtn: 'درجہ بندی اور ایمبولینس کارڈ بنائیں',
    submittingBtn: 'AI کے ذریعے علامات کا تجزیہ جاری ہے...',
    retryingBtn: 'ماڈل پر رش ہے — دوبارہ رابطہ کیا جا رہا ہے...',
    retryConnectionBtn: 'دوبارہ کوشش کریں',
    reloadPageBtn: 'صفحہ دوبارہ لوڈ کریں',
    resetBtn: 'فارم صاف کریں',
    errorTitle: 'درجہ بندی مکمل نہ ہو سکی',
    aiFallbackError: 'اس وقت AI سروس سے رابطہ ممکن نہیں ہو سکا۔ براہِ کرم دوبارہ کوشش کریں۔',
    successTitle: 'درجہ بندی مکمل — ایمبولینس کارڈ اور طبی رپورٹ تیار ہے',
    resultEmptyTitle: 'درجہ بندی کا نتیجہ اور ایمبولینس کارڈ',
    resultEmptyDesc:
      'طبی ترجیح، پیرامیڈک رپورٹ اور پرنٹ ایبل کارڈ حاصل کرنے کے لیے 3D ماڈل پر جگہ منتخب کریں اور علامات درج کریں۔',
    stepsTitle: 'فوری ابتدائی طبی امداد کے اقدامات',
    safetyTitle: 'حفاظتی انتباہ:',
    call997Btn: 'سعودی ہلال احمر 997 پر کال کریں',
    printCardBtn: 'ایمبولینس کو دکھانے کے لیے کارڈ پرنٹ کریں',
    paramedicTitle: 'طبی عملے (پیرامیڈکس) کے لیے مشورتی رپورٹ',
    paramedicSubtitle: 'ایمبولینس ٹیم کی آمد پر دکھانے کے لیے مختصر کلینیکل خلاصہ',
    paramedicImpression: 'ممکنہ طبی کیفیت',
    paramedicActions: 'فوری طبی ترجیحات (ABCDE)',
    paramedicEquipment: 'مطلوبہ آلات اور منتقلی کا طریقہ',
    paramedicPrecautions: 'میدانی احتیاطی تدابیر',
    paramedicEvac: 'حرم سے منتقلی کی رہنمائی',
    printCardHeader: 'طواف ابتدائی طبی کارڈ — مسجد الحرام',
    printCardSub: 'یہ کارڈ سعودی ہلال احمر (997) یا طبی عملے کو دکھائیں',
    printCardCaseId: 'کیس نمبر',
    printCardPriority: 'ہنگامی ترجیح',
    printCardArea: 'درد کا منتخب مقام',
    printCardZone: 'حرم میں جگہ',
    printCardAwareness: 'ہوش کی حالت',
    printCardAge: 'عمر',
    printCardNotProvided: 'درج نہیں',
    printCardSymptoms: 'درج شدہ علامات',
    printCardNote: 'ایمبولینس کی فوری کارروائی میں مدد کے لیے ابتدائی رہنمائی۔',
    historyTitle: 'موجودہ سیشن کا ریکارڈ',
    clearHistory: 'ریکارڈ صاف کریں',
    levelsTitle: 'حرم مکی میں طبی درجہ بندی کے تین معیارات',
    levelsSub: 'مریض کی سنگینی کے مطابق فوری طبی رسائی کا نظام',
    pointsTitle: 'مسجد الحرام میں طبی مراکز اور ایمرجنسی نمبرز',
    pointsSub: 'چوبیس گھنٹے فعال ہیلتھ کلینکس اور ہلال احمر کی موبائل ٹیمیں',
    navHealthReminders: 'صحت کی ہدایات',
    healthRemindersTitle: 'عمرہ کے دوران صحت کے لیے یاد رکھنے والی اہم باتیں',
    healthRemindersSub:
      'وزارتِ حج و عمرہ اور سعودی وزارتِ صحت کے رہنما اصولوں سے ماخوذ بنیادی احتیاطی تدابیر',
    healthRemindersSource: 'حوالہ: وزارتِ حج و عمرہ پورٹل (عمرہ · صحت)',
    footerNote:
      'طواف — زائرین کے لیے ابتدائی طبی رہنمائی نظام؛ یہ براہِ راست ڈاکٹر کے معائنے کا متبادل نہیں۔',
    modalTitle: 'مسجد الحرام میں فوری ایمبولینس طلب کریں',
    modalDesc:
      'سنگین صورتحال میں فوراً 997 پر کال کریں یا قریبی سکیورٹی اہلکار کو اپنا گیٹ نمبر اور طبی درجہ بندی بتائیں۔',
    modalCall997: 'ہلال احمر 997 پر کال کریں',
    modalCall911: 'یونیفائیڈ سکیورٹی 911 پر کال کریں',
    modalClose: 'بند کریں',
  },
  id: {
    brandName: 'Tawaf',
    brandSub: 'Layanan Triase Medis Jamaah',
    navTriage: 'Triase Awal',
    navBody3D: 'Lokasi Nyeri 3D',
    navParamedic: 'Laporan Paramedis',
    navPoints: 'Pos Medis',
    emergencyBtn: 'Darurat 997',
    heroEyebrow: 'Portal Layanan Lapangan · Masjidil Haram, Makkah',
    heroTitle: 'Sistem Triase Pertolongan Pertama & Panduan Paramedis Masjidil Haram',
    heroDesc:
      'Antarmuka multibahasa bagi jamaah dan pendamping untuk menandai lokasi nyeri pada model tubuh 3D, menilai tingkat kegawatan, mencetak kartu untuk ambulans, serta menyiapkan laporan klinis bagi paramedis.',
    stripLangs: '4 Bahasa Utama Jamaah',
    strip3D: 'Model Tubuh 3D Interaktif',
    stripCard: 'Kartu Cetak + Laporan Paramedis',
    body3DTitle: '1. Tandai Area Nyeri pada Model Tubuh 3D',
    body3DHint: 'Putar model tubuh atau ketuk langsung bagian yang sakit atau cedera',
    viewFront: 'Tampak Depan',
    viewBack: 'Tampak Belakang',
    viewReset: 'Reset Kamera',
    selectedAreaLabel: 'Area Dipilih:',
    noAreaSelected: 'Belum dipilih (opsional)',
    clearAreaBtn: 'Hapus Pilihan',
    hideControls: 'Sembunyikan Kontrol',
    showControls: 'Tampilkan Kontrol',
    formTitle: '2. Kondisi & Gejala Pasien',
    formSubtitle: 'Jelaskan keluhan pasien atau pilih kondisi umum di bawah ini',
    symptomsLabel: 'Deskripsi Kondisi & Gejala Saat Ini',
    symptomsPlaceholder:
      'Contoh: Jamaah merasakan nyeri dada menekan disertai keringat dingin dan pusing saat tawaf...',
    symptomsHelp: 'Masukkan minimal 4 huruf yang menjelaskan keluhan secara jelas',
    charsUnit: 'huruf',
    presetsLabel: 'Isi cepat kondisi umum di Masjidil Haram:',
    awarenessLabel: 'Tingkat Kesadaran & Respons',
    awareConscious: 'Sadar & Responsif',
    awareConfused: 'Linglung / Pusing',
    awareUnconscious: 'Tidak Sadar',
    zoneLabel: 'Lokasi di Dalam Masjidil Haram',
    ageLabel: 'Perkiraan Usia (Opsional)',
    agePlaceholder: 'Contoh: 55',
    submitBtn: 'Evaluasi Triase & Buat Kartu',
    submittingBtn: 'Menganalisis gejala dengan AI...',
    retryingBtn: 'Model sedang padat — mencoba ulang koneksi...',
    retryConnectionBtn: 'Coba Lagi',
    reloadPageBtn: 'Muat Ulang Halaman',
    resetBtn: 'Bersihkan Form',
    errorTitle: 'Triase Tidak Dapat Diproses',
    aiFallbackError: 'Tidak dapat terhubung ke layanan triase AI saat ini. Silakan coba lagi.',
    successTitle: 'Triase Selesai — Kartu Ambulans & Laporan Paramedis Siap',
    resultEmptyTitle: 'Hasil Triase & Kartu Ambulans',
    resultEmptyDesc:
      'Pilih area nyeri pada model 3D dan isi gejala untuk melihat prioritas medis, saran paramedis, dan kartu siap cetak.',
    stepsTitle: 'Langkah Pertolongan Pertama Segera',
    safetyTitle: 'Peringatan Keselamatan:',
    call997Btn: 'Hubungi Bulan Sabit Merah 997',
    printCardBtn: 'Cetak Kartu Triase untuk Ambulans',
    paramedicTitle: 'Laporan & Rekomendasi untuk Paramedis',
    paramedicSubtitle: 'Ringkasan klinis ringkas untuk ditunjukkan kepada tim medis 997',
    paramedicImpression: 'Dugaan Jalur Klinis',
    paramedicActions: 'Prioritas Intervensi Lapangan (ABCDE)',
    paramedicEquipment: 'Peralatan & Transportasi Disarankan',
    paramedicPrecautions: 'Kewaspadaan & Kontraindikasi Lapangan',
    paramedicEvac: 'Panduan Evakuasi Masjidil Haram',
    printCardHeader: 'Kartu Triase Medis Tawaf — Masjidil Haram',
    printCardSub: 'Tunjukkan kartu ini kepada petugas Bulan Sabit Merah (997)',
    printCardCaseId: 'ID Kasus',
    printCardPriority: 'Prioritas Triase',
    printCardArea: 'Area Nyeri 3D',
    printCardZone: 'Lokasi Haram',
    printCardAwareness: 'Kesadaran',
    printCardAge: 'Usia',
    printCardNotProvided: 'Tidak diisi',
    printCardSymptoms: 'Gejala Tercatat',
    printCardNote: 'Panduan triase awal untuk mempercepat penanganan tim medis.',
    historyTitle: 'Riwayat Triase Sesi Ini',
    clearHistory: 'Hapus Riwayat',
    levelsTitle: 'Tiga Tingkat Prioritas Triase Masjidil Haram',
    levelsSub: 'Klasifikasi standar untuk mempercepat respons gawat darurat jamaah',
    pointsTitle: 'Pos Kesehatan & Nomor Darurat Masjidil Haram',
    pointsSub: 'Klinik Klaster Kesehatan Makkah & tim medis 24 jam di area Masjidil Haram',
    navHealthReminders: 'Panduan Sehat',
    healthRemindersTitle: 'Hal yang Perlu Diingat untuk Kesehatan Saat Umrah',
    healthRemindersSub:
      'Panduan pencegahan kesehatan utama dari Kementerian Haji & Umrah serta Kementerian Kesehatan Arab Saudi',
    healthRemindersSource: 'Referensi: Portal Kementerian Haji & Umrah (Umrah · Kesehatan)',
    footerNote:
      'Tawaf — Panduan triase lapangan awal bagi jamaah; tidak menggantikan pemeriksaan dokter langsung.',
    modalTitle: 'Panggilan Ambulans Darurat di Masjidil Haram',
    modalDesc:
      'Untuk kasus kritis segera hubungi 997 atau petugas keamanan terdekat dengan menyebutkan nomor pintu dan tingkat prioritas.',
    modalCall997: 'Hubungi Bulan Sabit Merah 997',
    modalCall911: 'Hubungi Keamanan Terpadu 911',
    modalClose: 'Tutup',
  },
};

export interface HealthReminderCard {
  id: string;
  number: string;
  category: Record<LanguageCode, string>;
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
}

export const HEALTH_REMINDER_CARDS: HealthReminderCard[] = [
  {
    id: 'vaccinations',
    number: '01',
    category: {
      ar: 'الاستعداد قبل السفر',
      en: 'Pre-Travel Readiness',
      ur: 'سفر سے قبل تیاری',
      id: 'Persiapan Pra-Perjalanan',
    },
    title: {
      ar: 'التطعيمات والاشتراطات الصحية',
      en: 'Mandatory & Recommended Vaccinations',
      ur: 'لازمی اور تجویز کردہ ویکسینیشن',
      id: 'Vaksinasi Wajib & Rekomendasi',
    },
    description: {
      ar: 'استكمل التطعيمات المعتمدة قبل السفر كالمكورات السحائية والإنفلونزا الموسمية وأي لقاحات تطلبها وزارة الصحة السعودية.',
      en: 'Complete required vaccines before travel including meningococcal, seasonal influenza, and any updated Saudi MoH requirements.',
      ur: 'سفر سے پہلے گردن توڑ بخار، موسمی فلو اور سعودی وزارتِ صحت کی تمام مطلوبہ ویکسین مکمل کروائیں۔',
      id: 'Lengkapi vaksinasi wajib sebelum keberangkatan termasuk meningitis, influenza musiman, serta ketentuan Kemenkes Saudi.',
    },
  },
  {
    id: 'chronic-meds',
    number: '02',
    category: {
      ar: 'الأمراض المزمنة',
      en: 'Chronic Care',
      ur: 'دائمی امراض',
      id: 'Penyakit Kronis',
    },
    title: {
      ar: 'حمل الأدوية والتقرير الطبي',
      en: 'Sufficient Medications & Medical ID',
      ur: 'وافر ادویات اور طبی رپورٹ',
      id: 'Obat Cukup & Kartu Medis',
    },
    description: {
      ar: 'استشر طبيبك قبل السفر، واحمل كمية كافية من أدويتك (السكري، الضغط، القلب، بخاخ الربو) مع تقرير طبي وسوار تعريفي.',
      en: 'Consult your physician beforehand and carry enough medications (diabetes, BP, cardiac, asthma inhaler) plus a medical report.',
      ur: 'ڈاکٹر سے مشورہ کریں، شوگر، بلڈ پریشر، دل یا دمہ کی دوائیاں کافی مقدار میں اور طبی رپورٹ ساتھ رکھیں۔',
      id: 'Konsultasikan ke dokter sebelum berangkat dan bawa stok obat rutin (diabetes, hipertensi, jantung, asma) beserta catatan medis.',
    },
  },
  {
    id: 'heat-hydration',
    number: '03',
    category: {
      ar: 'الوقاية الميدانية',
      en: 'Heat & Hydration',
      ur: 'گرمی سے بچاؤ',
      id: 'Pencegahan Panas',
    },
    title: {
      ar: 'المظلة الشمسية وشرب الماء بانتظام',
      en: 'Sun Protection & Regular Hydration',
      ur: 'دھوپ سے تحفظ اور باقاعدہ پانی پینا',
      id: 'Payung Pelindung & Hidrasi Rutin',
    },
    description: {
      ar: 'تجنب التعرض المباشر للشمس باستخدام مظلة فاتحة اللون، واحرص على شرب المياه والسوائل باستمرار للوقاية من الجفاف والإجهاد الحراري.',
      en: 'Use a light-colored umbrella against direct sun and drink water regularly throughout the day to prevent heat exhaustion.',
      ur: 'تیز دھوپ سے بچنے کے لیے ہلکے رنگ کی چھتری استعمال کریں اور پانی کی کمی سے بچنے کے لیے وقفے وقفے سے پانی پئیں۔',
      id: 'Gunakan payung berwarna terang di area terbuka dan minum air secara teratur untuk mencegah dehidrasi serta kelelahan panas.',
    },
  },
  {
    id: 'respiratory-hygiene',
    number: '04',
    category: {
      ar: 'النظافة والعدوى',
      en: 'Respiratory Safety',
      ur: 'صفائی اور تحفظ',
      id: 'Kebersihan & Masker',
    },
    title: {
      ar: 'الكمامة وغسل اليدين وسلامة الغذاء',
      en: 'Masks, Hand Hygiene & Food Safety',
      ur: 'ماسک، ہاتھوں کی صفائی اور محفوظ خوراک',
      id: 'Masker, Cuci Tangan & Pangan Aman',
    },
    description: {
      ar: 'ارتدِ الكمامة في الأماكن المزدحمة، واغسل أو عقّم يديك بانتظام، وتجنب الأطعمة المكشوفة حفاظاً على سلامتك.',
      en: 'Wear a mask in crowded areas, wash or sanitize hands frequently, and avoid uncovered food to prevent infections.',
      ur: 'بھیڑ والی جگہوں پر ماسک پہنیں، ہاتھ باقاعدگی سے دھوئیں یا سینیٹائز کریں اور کھلی غذاؤں سے پرہیز کریں۔',
      id: 'Kenakan masker di area padat, cuci tangan atau gunakan sanitizer rutin, dan hindari makanan terbuka.',
    },
  },
  {
    id: 'crowd-concessions',
    number: '05',
    category: {
      ar: 'التيسير والراحة',
      en: 'Pacing & Mobility',
      ur: 'آسانی اور آرام',
      id: 'Keringanan & Mobilitas',
    },
    title: {
      ar: 'استخدام الكرسي المتحرك وتجنب الذروة',
      en: 'Use Wheelchairs & Off-Peak Hours',
      ur: 'وہیل چیئر کا استعمال اور کم رش کے اوقات',
      id: 'Gunakan Kursi Roda & Hindari Puncak Padat',
    },
    description: {
      ar: 'اختر أوقاتاً أقل ازدحاماً لأداء المناسك وفق تصريح نسك، ولا تتردد في استخدام الكرسي المتحرك عند الشعور بالإجهاد البدني.',
      en: 'Choose less crowded Nusuk windows for rituals and use a wheelchair during Tawaf or Masa whenever fatigued.',
      ur: 'نسک پرمٹ کے مطابق کم رش کے اوقات منتخب کریں اور تھکن محسوس ہونے پر طواف و سعی میں وہیل چیئر استعمال کریں۔',
      id: 'Pilih waktu ibadah yang lebih lengang sesuai izin Nusuk dan gunakan kursi roda saat tubuh merasa lelah.',
    },
  },
  {
    id: 'seek-care-early',
    number: '06',
    category: {
      ar: 'الاستجابة الطبية',
      en: 'Prompt Care',
      ur: 'فوری طبی رجوع',
      id: 'Respons Medis Cepat',
    },
    title: {
      ar: 'التوجه الفوري لأقرب مركز صحي',
      en: 'Seek Immediate Medical Care on Symptoms',
      ur: 'علامات ظاہر ہوتے ہی قریبی مرکز جائیں',
      id: 'Segera ke Pos Kesehatan Saat Ada Gejala',
    },
    description: {
      ar: 'توجّه فوراً لأقرب مرفق صحي في الحرم أو اتصل بـ ٩٩٧ عند الشعور بألم في الصدر، ضيق تنفس، دوار شديد، أو إعياء مفاجئ.',
      en: 'Visit the nearest Al-Haram health clinic or call 997 immediately if you experience chest pain, dyspnea, or severe dizziness.',
      ur: 'سینے میں درد، سانس کی تنگی، شدید چکر یا اچانک کمزوری محسوس ہونے پر فوراً قریبی طبی مرکز جائیں یا 997 پر کال کریں۔',
      id: 'Segera datangi klinik Masjidil Haram terdekat atau hubungi 997 bila mengalami nyeri dada, sesak napas, atau pusing berat.',
    },
  },
];

