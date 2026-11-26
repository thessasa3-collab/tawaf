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
  menuOpenLabel: string;
  menuCloseLabel: string;
  navOps: string;
  localFallbackBtn: string;
  sourceAiBadge: string;
  sourceLocalBadge: string;
  persistedBadge: string;
  savingCaseText: string;
  deleteCaseBtn: string;
  confirmDeleteText: string;
  cancelBtn: string;
  statusLabel: string;
  statusOpen: string;
  statusDispatched: string;
  statusResolved: string;
  responderNotesLabel: string;
  opsTitle: string;
  opsSubtitle: string;
  opsLoginTitle: string;
  opsSetupTitle: string;
  opsSetupDesc: string;
  opsAdminTab: string;
  opsResponderTab: string;
  opsPasscodeLabel: string;
  opsPasscodePlaceholder: string;
  opsUsernameLabel: string;
  opsPasswordLabel: string;
  opsLoginBtn: string;
  opsSetupBtn: string;
  opsLogoutBtn: string;
  opsSearchPlaceholder: string;
  opsAllLevels: string;
  opsAllZones: string;
  opsAllStatuses: string;
  opsRefreshBtn: string;
  opsNoCases: string;
  opsSaveBtn: string;
  opsSavingBtn: string;
  opsLoadToCardBtn: string;
  opsNotesPlaceholder: string;
  opsTeamTitle: string;
  opsAddResponderBtn: string;
  opsDisplayNameLabel: string;
  opsRoleLabel: string;
  opsRoleResponder: string;
  opsRoleAdmin: string;
  opsStatsTotal: string;
  opsStatsCritical: string;
  opsStatsOpen: string;
  opsAuthError: string;
  // GPS with Consent
  gpsSectionTitle: string;
  gpsConsentLabel: string;
  gpsCaptureBtn: string;
  gpsCapturingBtn: string;
  gpsClearBtn: string;
  gpsAccuracyLabel: string;
  gpsNearestZoneNote: string;
  gpsOutsideHaramNote: string;
  gpsDeniedError: string;
  gpsIframeBlockedError: string;
  gpsHttpsError: string;
  gpsTimeoutError: string;
  gpsUnavailableError: string;
  gpsUnsupportedError: string;
  gpsOpenStandaloneBtn: string;
  gpsManualBtn: string;
  gpsManualDetailLabel: string;
  gpsManualDetailPlaceholder: string;
  gpsLabelShort: string;
  // Voice Input
  voiceStartBtn: string;
  voiceStopBtn: string;
  voiceTranscribingBtn: string;
  voicePermissionError: string;
  voiceIframeBlockedError: string;
  voiceHttpsError: string;
  voiceNoMicError: string;
  voiceMicInUseError: string;
  voiceTranscribeError: string;
  voiceUnsupportedError: string;
  // QR Code
  qrTitle: string;
  qrSubtitle: string;
  qrOfflineReady: string;
  qrCaseBannerTitle: string;
  qrCaseBannerDesc: string;
  // AI First-Aid Assistant
  assistantBtn: string;
  assistantTitle: string;
  assistantSubtitle: string;
  assistantPlaceholder: string;
  assistantSendBtn: string;
  assistantContextBadge: string;
  assistantOfflineNotice: string;
  assistantWelcome: string;
  assistantQuick1: string;
  assistantQuick2: string;
  assistantQuick3: string;
  // Offline First-Aid Guidelines
  navOfflineGuide: string;
  offlineGuideTitle: string;
  offlineGuideSubtitle: string;
  offlineGuideBadge: string;
  offlineGuideSearchPlaceholder: string;
  offlineCatAll: string;
  offlineCatEmergency: string;
  offlineCatHeat: string;
  offlineCatTrauma: string;
  offlineCatChronic: string;
  offlineDoNotLabel: string;
  // Accessibility & Read Aloud
  a11yBtn: string;
  a11yTitle: string;
  a11ySubtitle: string;
  a11yContrastLabel: string;
  a11yContrastDesc: string;
  a11yFontSizeLabel: string;
  a11yFontNormal: string;
  a11yFontLarge: string;
  a11yFontXLarge: string;
  a11yDyslexiaLabel: string;
  a11yDyslexiaDesc: string;
  a11yMotionLabel: string;
  a11yMotionDesc: string;
  a11yResetBtn: string;
  readAloudBtn: string;
  stopReadingBtn: string;
  skipToMain: string;
  // PWA & Offline Banner
  pwaInstallBtn: string;
  pwaInstalledBadge: string;
  pwaIosTitle: string;
  pwaIosStep1: string;
  pwaIosStep2: string;
  offlineBannerTitle: string;
  offlineBannerDesc: string;
  // Extra 3D views
  viewSide: string;
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
    menuOpenLabel: 'فتح القائمة',
    menuCloseLabel: 'إغلاق القائمة',
    navOps: 'لوحة المسعفين',
    localFallbackBtn: 'استخدام الفرز المحلي الفوري الآن',
    sourceAiBadge: 'تحليل ذكي (AI)',
    sourceLocalBadge: 'فرز محلي فوري',
    persistedBadge: 'محفوظ في السجل',
    savingCaseText: 'جارٍ حفظ البلاغ في قاعدة البيانات...',
    deleteCaseBtn: 'حذف البلاغ',
    confirmDeleteText: 'تأكيد الحذف؟',
    cancelBtn: 'إلغاء',
    statusLabel: 'حالة البلاغ',
    statusOpen: 'قيد الانتظار',
    statusDispatched: 'تم توجيه الإسعاف',
    statusResolved: 'مكتمل / تم التعامل',
    responderNotesLabel: 'ملاحظات المسعف الميداني',
    opsTitle: 'مركز متابعة البلاغات الميدانية (للمسعفين)',
    opsSubtitle: 'عرض، تحديث حالة الاستجابة، تصفية وإدارة بلاغات الفرز المحفوظة',
    opsLoginTitle: 'تسجيل دخول الطاقم الإسعافي والمشرفين',
    opsSetupTitle: 'إعداد رمز المشرف الأول (تشغيل أولي)',
    opsSetupDesc: 'لم يتم ضبط رمز مرور المشرف على الخادم بعد. أنشئ رمز مرور قوياً (٨ أحرف على الأقل) لحماية لوحة المسعفين.',
    opsAdminTab: 'دخول المشرف',
    opsResponderTab: 'حساب مسعف',
    opsPasscodeLabel: 'رمز مرور المشرف',
    opsPasscodePlaceholder: 'أدخل رمز المرور...',
    opsUsernameLabel: 'اسم المستخدم',
    opsPasswordLabel: 'كلمة المرور',
    opsLoginBtn: 'دخول إلى اللوحة',
    opsSetupBtn: 'تفعيل وحفظ رمز المشرف',
    opsLogoutBtn: 'تسجيل الخروج',
    opsSearchPlaceholder: 'بحث برقم البلاغ أو الأعراض...',
    opsAllLevels: 'كل المستويات',
    opsAllZones: 'كل المناطق',
    opsAllStatuses: 'كل الحالات',
    opsRefreshBtn: 'تحديث',
    opsNoCases: 'لا توجد بلاغات مطابقة للفلاتر الحالية.',
    opsSaveBtn: 'حفظ التحديث',
    opsSavingBtn: 'جارٍ الحفظ...',
    opsLoadToCardBtn: 'عرض في البطاقة والطباعة',
    opsNotesPlaceholder: 'أضف ملاحظات الفحص الحيوي أو نقطة الاستلام...',
    opsTeamTitle: 'إدارة حسابات المسعفين الميدانيين',
    opsAddResponderBtn: 'إضافة حساب مسعف',
    opsDisplayNameLabel: 'الاسم الكامل',
    opsRoleLabel: 'الصلاحية',
    opsRoleResponder: 'مسعف ميداني',
    opsRoleAdmin: 'مشرف',
    opsStatsTotal: 'إجمالي البلاغات',
    opsStatsCritical: 'حالات حرجة (أحمر)',
    opsStatsOpen: 'قيد الانتظار',
    opsAuthError: 'تعذر التحقق من بيانات الدخول. يرجى المحاولة مرة أخرى.',
    gpsSectionTitle: 'تحديد الموقع الجغرافي الدقيق (GPS)',
    gpsConsentLabel: 'أوافق على مشاركة إحداثيات موقعي الجغرافي مع طاقم الإسعاف لتسريع الوصول إليّ',
    gpsCaptureBtn: 'تحديد موقعي الحالي الآن',
    gpsCapturingBtn: 'جارٍ تحديد الإحداثيات...',
    gpsClearBtn: 'إلغاء الإحداثيات',
    gpsAccuracyLabel: 'دقة التحديد',
    gpsNearestZoneNote: 'أقرب نطاق مقترح في الحرم:',
    gpsOutsideHaramNote: 'يبدو أن الموقع خارج النطاق المباشر للمسجد الحرام؛ يمكنك تعديل المنطقة يدوياً.',
    gpsDeniedError: 'رفض المتصفح أو النظام الوصول للموقع (PERMISSION_DENIED). تأكد من تفعيل الموقع لـ Edge في Windows ثم أعد المحاولة أو حدد موقعك يدوياً.',
    gpsIframeBlockedError: 'بيئة المعاينة المضمنة (iframe / Permissions Policy) تمنع الوصول التلقائي للموقع رغم تفعيله في المتصفح. افتح الرابط في نافذة مستقلة أو حدد موقعك يدوياً أدناه.',
    gpsHttpsError: 'تحديد الموقع الجغرافي يتطلب اتصالاً آمناً (HTTPS). يرجى فتح التطبيق عبر HTTPS أو استخدام التحديد اليدوي.',
    gpsTimeoutError: 'انتهت مهلة تحديد الموقع الجغرافي (TIMEOUT). يمكنك إعادة المحاولة أو تحديد موقعك يدوياً أدناه.',
    gpsUnavailableError: 'تعذر على خدمة الموقع في الجهاز تحديد الإحداثيات حالياً (POSITION_UNAVAILABLE). يرجى تحديد موقعك يدوياً أدناه.',
    gpsUnsupportedError: 'المتصفح الحالي لا يدعم خدمة تحديد الموقع الجغرافي.',
    gpsOpenStandaloneBtn: 'فتح التطبيق في تبويب مستقل',
    gpsManualBtn: 'تحديد الموقع يدوياً',
    gpsManualDetailLabel: 'تفاصيل الموقع اليدوي (رقم الباب / الدور / العمود - اختياري)',
    gpsManualDetailPlaceholder: 'مثال: باب الملك عبدالعزيز - الدور الأرضي - بجانب عمود ١٤',
    gpsLabelShort: 'إحداثيات GPS المعتمدة',
    voiceStartBtn: 'إدخال صوتي',
    voiceStopBtn: 'إيقاف التسجيل',
    voiceTranscribingBtn: 'جارٍ التحويل لنص...',
    voicePermissionError: 'تم رفض إذن الميكروفون (NotAllowedError). يرجى السماح للمتصفح بالوصول للميكروفون أو كتابة الأعراض.',
    voiceIframeBlockedError: 'سياسة الإطار المضمن (iframe / Permissions Policy) تمنع الميكروفون في نافذة المعاينة الحالية رغم تفعيله في Edge. افتح التطبيق في تبويب مستقل أو اكتب الأعراض.',
    voiceHttpsError: 'تشغيل الميكروفون يتطلب رابط HTTPS آمن.',
    voiceNoMicError: 'لم يتم العثور على ميكروفون متصل أو مفعّل في النظام (NotFoundError).',
    voiceMicInUseError: 'الميكروفون قيد الاستخدام من تطبيق آخر أو تعذرت قراءته (NotReadableError).',
    voiceTranscribeError: 'تعذر تحويل الصوت لنص. يمكنك التحدث بوضوح وإعادة المحاولة أو كتابة الأعراض.',
    voiceUnsupportedError: 'الإدخال الصوتي غير مدعوم في هذا المتصفح.',
    qrTitle: 'رمز QR لحالة المريض',
    qrSubtitle: 'امسح الرمز ضوئياً لقراءة بيانات الفرز والموقع فوراً حتى دون إنترنت',
    qrOfflineReady: 'يعمل دون إنترنت',
    qrCaseBannerTitle: 'تم مسح رمز حالة مريض عبر QR',
    qrCaseBannerDesc: 'رقم البلاغ المرجعي:',
    assistantBtn: 'المساعد الذكي',
    assistantTitle: 'المساعد الذكي للإسعافات الأولية',
    assistantSubtitle: 'إرشادات فورية مساندة داخل المسجد الحرام وفق بروتوكولات السلامة',
    assistantPlaceholder: 'اسأل عن خطوة إسعافية (مثل: كيف أساعد مصاباً بضربة شمس؟)...',
    assistantSendBtn: 'إرسال',
    assistantContextBadge: 'مرتبط ببيانات الحالة الحالية',
    assistantOfflineNotice: 'أنت غير متصل بالإنترنت — يتم عرض الإرشادات الإسعافية المخزنة محلياً.',
    assistantWelcome: 'مرحباً بك في المساعد الذكي للإسعافات الأولية بطواف. صف لي سؤالك أو اختر من الحالات السريعة أدناه، وتذكر الاتصال بـ ٩٩٧ فوراً عند فقدان الوعي أو ألم الصدر.',
    assistantQuick1: 'كيف أتعامل مع ضربة شمس في الساحات؟',
    assistantQuick2: 'ما خطوات وضعية الإفاقة لمغمى عليه؟',
    assistantQuick3: 'كيف أسعف هبوط السكر لمعتمر واعٍ؟',
    navOfflineGuide: 'دليل بلا إنترنت',
    offlineGuideTitle: 'دليل الإسعافات الأولية المتاح دون إنترنت',
    offlineGuideSubtitle: 'بروتوكولات طبية موثوقة محفوظة على جهازك للاستخدام الفوري داخل الحرم حتى عند انقطاع الشبكة',
    offlineGuideBadge: 'متاح 100% دون إنترنت',
    offlineGuideSearchPlaceholder: 'ابحث في الإرشادات (إغماء، ضربة شمس، نزيف، كسر، سكر)...',
    offlineCatAll: 'الكل',
    offlineCatEmergency: 'حالات حرجة',
    offlineCatHeat: 'الحرارة والجفاف',
    offlineCatTrauma: 'الإصابات والكسور',
    offlineCatChronic: 'الأمراض المزمنة',
    offlineDoNotLabel: 'تحذير — ممنوع القيام به:',
    a11yBtn: 'سهولة الوصول',
    a11yTitle: 'إعدادات سهولة الوصول لضعاف البصر وذوي الإعاقة',
    a11ySubtitle: 'تخصيص التباين، حجم الخط، التباعد، والقراءة الصوتية الفورية',
    a11yContrastLabel: 'وضع التباين العالي',
    a11yContrastDesc: 'خلفية داكنة وحدود ذهبية عالية الوضوح لضعاف البصر',
    a11yFontSizeLabel: 'حجم النص والعناوين',
    a11yFontNormal: 'قياسي',
    a11yFontLarge: 'كبير +١٢٪',
    a11yFontXLarge: 'كبير جداً +٢٥٪',
    a11yDyslexiaLabel: 'تباعد القراءة المريح',
    a11yDyslexiaDesc: 'زيادة المسافات بين السطور والكلمات لتسهيل القراءة',
    a11yMotionLabel: 'تقليل الحركة والانتقالات',
    a11yMotionDesc: 'إيقاف المؤثرات المتحركة لراحة العين',
    a11yResetBtn: 'استعادة الإعدادات الافتراضية',
    readAloudBtn: 'قراءة صوتية',
    stopReadingBtn: 'إيقاف الصوت',
    skipToMain: 'تجاوز إلى محتوى الفرز الرئيسي',
    pwaInstallBtn: 'تثبيت التطبيق',
    pwaInstalledBadge: 'مثبّت كتطبيق',
    pwaIosTitle: 'تثبيت تطبيق طواف على iPhone / iPad',
    pwaIosStep1: '١. اضغط على زر المشاركة (Share) في شريط متصفح Safari بالأسفل.',
    pwaIosStep2: '٢. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen) ثم اضغط إضافة.',
    offlineBannerTitle: 'أنت تعمل الآن في وضع عدم الاتصال (Offline Mode)',
    offlineBannerDesc: 'الفرز المحلي السريع، القراءة الصوتية، رمز QR، ودليل الإسعافات الأولية تعمل كاملة دون إنترنت.',
    viewSide: 'جانبية',
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
    menuOpenLabel: 'Open menu',
    menuCloseLabel: 'Close menu',
    navOps: 'Responder Desk',
    localFallbackBtn: 'Run Instant Local Triage Now',
    sourceAiBadge: 'AI Triage',
    sourceLocalBadge: 'Local Rapid Triage',
    persistedBadge: 'Saved to Server',
    savingCaseText: 'Saving case record...',
    deleteCaseBtn: 'Delete Case',
    confirmDeleteText: 'Confirm delete?',
    cancelBtn: 'Cancel',
    statusLabel: 'Case Status',
    statusOpen: 'Open',
    statusDispatched: 'Dispatched',
    statusResolved: 'Resolved',
    responderNotesLabel: 'Paramedic Field Notes',
    opsTitle: 'Haram Responder Operations Desk',
    opsSubtitle: 'View, filter, update dispatch status, and manage saved triage cases',
    opsLoginTitle: 'Medical Responder & Supervisor Sign-In',
    opsSetupTitle: 'First-Run Supervisor Setup',
    opsSetupDesc: 'No server supervisor passcode is configured yet. Claim a strong passcode (min 8 chars) to protect the Responder Desk.',
    opsAdminTab: 'Supervisor Passcode',
    opsResponderTab: 'Responder Account',
    opsPasscodeLabel: 'Supervisor Passcode',
    opsPasscodePlaceholder: 'Enter passcode...',
    opsUsernameLabel: 'Username',
    opsPasswordLabel: 'Password',
    opsLoginBtn: 'Sign In to Desk',
    opsSetupBtn: 'Claim Supervisor Passcode',
    opsLogoutBtn: 'Sign Out',
    opsSearchPlaceholder: 'Search by case ID or symptoms...',
    opsAllLevels: 'All Priorities',
    opsAllZones: 'All Zones',
    opsAllStatuses: 'All Statuses',
    opsRefreshBtn: 'Refresh',
    opsNoCases: 'No triage cases match the current filters.',
    opsSaveBtn: 'Save Update',
    opsSavingBtn: 'Saving...',
    opsLoadToCardBtn: 'Open in Card & Print',
    opsNotesPlaceholder: 'Add vitals, ambulance unit, or handover notes...',
    opsTeamTitle: 'Responder Team Accounts',
    opsAddResponderBtn: 'Add Responder',
    opsDisplayNameLabel: 'Full Name',
    opsRoleLabel: 'Role',
    opsRoleResponder: 'Responder',
    opsRoleAdmin: 'Supervisor (Admin)',
    opsStatsTotal: 'Total Cases',
    opsStatsCritical: 'Critical (RED)',
    opsStatsOpen: 'Open Queue',
    opsAuthError: 'Unable to verify credentials. Please try again.',
    gpsSectionTitle: 'Precise GPS Location (With Patient Consent)',
    gpsConsentLabel: 'I consent to share my GPS coordinates with medical responders to speed up arrival',
    gpsCaptureBtn: 'Capture Current GPS',
    gpsCapturingBtn: 'Locating GPS...',
    gpsClearBtn: 'Remove GPS',
    gpsAccuracyLabel: 'Accuracy',
    gpsNearestZoneNote: 'Nearest suggested Haram zone:',
    gpsOutsideHaramNote: 'Coordinates appear outside immediate Al-Haram perimeter; you may adjust zone manually.',
    gpsDeniedError: 'Location permission denied (PERMISSION_DENIED). Enable location for Edge in Windows or select your location manually.',
    gpsIframeBlockedError: 'Embedded preview iframe (Permissions Policy) is blocking GPS even though browser permissions are enabled. Open in a standalone tab or enter your location manually below.',
    gpsHttpsError: 'Geolocation requires a secure HTTPS connection. Please open over HTTPS or select your location manually.',
    gpsTimeoutError: 'Location request timed out (TIMEOUT). You can retry or enter your Haram location manually below.',
    gpsUnavailableError: 'Device location service could not determine coordinates right now (POSITION_UNAVAILABLE). Please select your location manually.',
    gpsUnsupportedError: 'Geolocation is not supported by this browser.',
    gpsOpenStandaloneBtn: 'Open in Standalone Tab',
    gpsManualBtn: 'Enter Location Manually',
    gpsManualDetailLabel: 'Manual Location Details (Gate / Floor / Pillar - Optional)',
    gpsManualDetailPlaceholder: 'e.g. King Abdulaziz Gate - Ground Floor - Pillar 14',
    gpsLabelShort: 'Consented GPS',
    voiceStartBtn: 'Voice Input',
    voiceStopBtn: 'Stop Recording',
    voiceTranscribingBtn: 'Transcribing...',
    voicePermissionError: 'Microphone access denied (NotAllowedError). Allow mic permission in Edge/Windows or type symptoms.',
    voiceIframeBlockedError: 'Embedded preview iframe (Permissions Policy) blocks microphone access here despite browser settings. Open in a standalone tab or type symptoms.',
    voiceHttpsError: 'Microphone access requires a secure HTTPS connection.',
    voiceNoMicError: 'No active microphone input device detected (NotFoundError).',
    voiceMicInUseError: 'Microphone is busy in another app or hardware failed to start (NotReadableError).',
    voiceTranscribeError: 'Unable to transcribe audio right now. Please retry or type symptoms.',
    voiceUnsupportedError: 'Voice input is not supported on this browser.',
    qrTitle: 'Patient Case QR Code',
    qrSubtitle: 'Scan to read triage priority, symptoms & GPS instantly even offline',
    qrOfflineReady: 'Works Offline',
    qrCaseBannerTitle: 'Case Reference Loaded from QR Scan',
    qrCaseBannerDesc: 'Reference ID:',
    assistantBtn: 'AI Assistant',
    assistantTitle: 'Smart First-Aid Assistant',
    assistantSubtitle: 'Immediate Al-Haram bystander guidance aligned with 997 protocols',
    assistantPlaceholder: 'Ask a first-aid question (e.g. how to cool heatstroke?)...',
    assistantSendBtn: 'Send',
    assistantContextBadge: 'Linked to Active Patient Triage',
    assistantOfflineNotice: 'You are offline — showing locally cached first-aid guidance.',
    assistantWelcome: 'Welcome to the Tawaf Smart First-Aid Assistant. Ask any emergency first-aid question or pick a quick scenario below. Always call 997 immediately for chest pain or unconsciousness.',
    assistantQuick1: 'How do I treat heatstroke in the courtyard?',
    assistantQuick2: 'How to place an unconscious person in recovery position?',
    assistantQuick3: 'First aid for low blood sugar in an alert pilgrim?',
    navOfflineGuide: 'Offline Guide',
    offlineGuideTitle: 'Offline-Available First-Aid Guidelines',
    offlineGuideSubtitle: 'Verified emergency protocols stored locally on your device for instant access inside Al-Haram without internet',
    offlineGuideBadge: '100% Available Offline',
    offlineGuideSearchPlaceholder: 'Search protocols (heatstroke, fainting, bleeding, fracture)...',
    offlineCatAll: 'All',
    offlineCatEmergency: 'Critical',
    offlineCatHeat: 'Heat & Hydration',
    offlineCatTrauma: 'Trauma & Bleeding',
    offlineCatChronic: 'Chronic Care',
    offlineDoNotLabel: 'Warning — Do NOT:',
    a11yBtn: 'Accessibility',
    a11yTitle: 'Accessibility Options for Visual & Motor Needs',
    a11ySubtitle: 'Customize high contrast, text size, spacing, and offline voice read-aloud',
    a11yContrastLabel: 'High Contrast Mode',
    a11yContrastDesc: 'Dark high-legibility surface with bright gold outlines',
    a11yFontSizeLabel: 'Text & Heading Scale',
    a11yFontNormal: 'Standard',
    a11yFontLarge: 'Large +12%',
    a11yFontXLarge: 'Extra +25%',
    a11yDyslexiaLabel: 'Comfortable Reading Spacing',
    a11yDyslexiaDesc: 'Wider line height and word spacing for easier scanning',
    a11yMotionLabel: 'Reduce Motion',
    a11yMotionDesc: 'Disable transitions and animated shimmer effects',
    a11yResetBtn: 'Reset Defaults',
    readAloudBtn: 'Read Aloud',
    stopReadingBtn: 'Stop Audio',
    skipToMain: 'Skip to Main Triage Workspace',
    pwaInstallBtn: 'Install App',
    pwaInstalledBadge: 'App Installed',
    pwaIosTitle: 'Install Tawaf App on iPhone / iPad',
    pwaIosStep1: '1. Tap the Share button in Safari at the bottom of your screen.',
    pwaIosStep2: '2. Choose "Add to Home Screen" and tap Add.',
    offlineBannerTitle: 'Offline Mode Active',
    offlineBannerDesc: 'Local rapid triage, voice read-aloud, QR codes, and first-aid protocols remain fully operational.',
    viewSide: 'Side View',
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
    menuOpenLabel: 'مینو کھولیں',
    menuCloseLabel: 'مینو بند کریں',
    navOps: 'طبی عملہ ڈیسک',
    localFallbackBtn: 'فوری مقامی درجہ بندی استعمال کریں',
    sourceAiBadge: 'AI تجزیہ',
    sourceLocalBadge: 'فوری مقامی درجہ بندی',
    persistedBadge: 'سرور پر محفوظ',
    savingCaseText: 'کیس محفوظ کیا جا رہا ہے...',
    deleteCaseBtn: 'کیس حذف کریں',
    confirmDeleteText: 'حذف کی تصدیق کریں؟',
    cancelBtn: 'منسوخ کریں',
    statusLabel: 'کیس کی صورتحال',
    statusOpen: 'زیرِ التواء',
    statusDispatched: 'ایمبولینس روانہ',
    statusResolved: 'مکمل / نمٹا دیا گیا',
    responderNotesLabel: 'پیرامیڈک کے نوٹس',
    opsTitle: 'حرم طبی عملہ آپریشنز ڈیسک',
    opsSubtitle: 'محفوظ کیسز دیکھیں، فلٹر کریں، صورتحال اپڈیٹ کریں اور ریکارڈ منظم کریں',
    opsLoginTitle: 'طبی عملے اور سپروائزر کا لاگ ان',
    opsSetupTitle: 'ابتدائی سپروائزر پاس کوڈ سیٹ اپ',
    opsSetupDesc: 'سرور پر ابھی سپروائزر پاس کوڈ سیٹ نہیں ہے۔ ڈیسک کو محفوظ بنانے کے لیے کم از کم 8 حروف کا پاس کوڈ مقرر کریں۔',
    opsAdminTab: 'سپروائزر پاس کوڈ',
    opsResponderTab: 'طبی عملہ اکاؤنٹ',
    opsPasscodeLabel: 'سپروائزر پاس کوڈ',
    opsPasscodePlaceholder: 'پاس کوڈ درج کریں...',
    opsUsernameLabel: 'صارف نام',
    opsPasswordLabel: 'پاس ورڈ',
    opsLoginBtn: 'ڈیسک میں لاگ ان کریں',
    opsSetupBtn: 'پاس کوڈ محفوظ کریں',
    opsLogoutBtn: 'لاگ آؤٹ',
    opsSearchPlaceholder: 'کیس نمبر یا علامات تلاش کریں...',
    opsAllLevels: 'تمام ترجیحات',
    opsAllZones: 'تمام مقامات',
    opsAllStatuses: 'تمام حالات',
    opsRefreshBtn: 'تازہ کریں',
    opsNoCases: 'موجودہ فلٹرز کے مطابق کوئی کیس نہیں ملا۔',
    opsSaveBtn: 'تبدیلی محفوظ کریں',
    opsSavingBtn: 'محفوظ ہو رہا ہے...',
    opsLoadToCardBtn: 'کارڈ اور پرنٹ میں کھولیں',
    opsNotesPlaceholder: 'وائٹلز یا ایمبولینس کی تفصیل لکھیں...',
    opsTeamTitle: 'طبی عملے کے اکاؤنٹس',
    opsAddResponderBtn: 'نیا اکاؤنٹ شامل کریں',
    opsDisplayNameLabel: 'پورا نام',
    opsRoleLabel: 'کردار',
    opsRoleResponder: 'پیرامیڈک',
    opsRoleAdmin: 'سپروائزر',
    opsStatsTotal: 'کل کیسز',
    opsStatsCritical: 'انتہائی سنگین',
    opsStatsOpen: 'زیرِ التواء',
    opsAuthError: 'لاگ ان کی تصدیق نہیں ہو سکی۔ دوبارہ کوشش کریں۔',
    gpsSectionTitle: 'مریض کی رضامندی سے GPS مقام کا تعین',
    gpsConsentLabel: 'میں فوری مدد کے لیے طبی عملے کے ساتھ اپنا GPS مقام شیئر کرنے کی اجازت دیتا ہوں',
    gpsCaptureBtn: 'موجودہ GPS مقام حاصل کریں',
    gpsCapturingBtn: 'مقام تلاش کیا جا رہا ہے...',
    gpsClearBtn: 'مقام ہٹائیں',
    gpsAccuracyLabel: 'درستگی',
    gpsNearestZoneNote: 'حرم میں قریبی تجویز کردہ مقام:',
    gpsOutsideHaramNote: 'مقام مسجد الحرام کے براہِ راست احاطے سے باہر لگتا ہے؛ آپ مقام دستی طور پر منتخب کر سکتے ہیں۔',
    gpsDeniedError: 'لوکیشن کی اجازت مسترد کر دی گئی (PERMISSION_DENIED)۔ براؤزر اور ونڈوز میں اجازت فعال کریں یا دستی مقام درج کریں۔',
    gpsIframeBlockedError: 'پری ویو فریم (iframe Permissions Policy) لوکیشن تک رسائی روک رہا ہے۔ ایپ کو نئے ٹیب میں کھولیں یا نیچے دستی مقام منتخب کریں۔',
    gpsHttpsError: 'جی پی ایس لوکیشن کے لیے محفوظ HTTPS کنکشن درکار ہے۔',
    gpsTimeoutError: 'لوکیشن حاصل کرنے کا وقت ختم ہو گیا (TIMEOUT)۔ دوبارہ کوشش کریں یا دستی مقام درج کریں۔',
    gpsUnavailableError: 'اس وقت ڈیوائس لوکیشن دستیاب نہیں ہے (POSITION_UNAVAILABLE)۔ براہِ کرم دستی مقام منتخب کریں۔',
    gpsUnsupportedError: 'اس براؤزر میں GPS دستیاب نہیں ہے۔',
    gpsOpenStandaloneBtn: 'نئے ٹیب میں کھولیں',
    gpsManualBtn: 'مقام دستی درج کریں',
    gpsManualDetailLabel: 'دستی مقام کی تفصیل (گیٹ / منزل / ستون نمبر - اختیاری)',
    gpsManualDetailPlaceholder: 'مثال: باب الملک عبدالعزیز - گراؤنڈ فلور - ستون 14',
    gpsLabelShort: 'تصدیق شدہ GPS',
    voiceStartBtn: 'آواز سے لکھیں',
    voiceStopBtn: 'ریکارڈنگ روکیں',
    voiceTranscribingBtn: 'تحریر میں تبدیلی...',
    voicePermissionError: 'مائیکروفون کی اجازت مسترد ہوئی (NotAllowedError)۔ براؤزر/ونڈوز میں مائیکروفون فعال کریں۔',
    voiceIframeBlockedError: 'ایمبیڈڈ پری ویو فریم (iframe Permissions Policy) مائیکروفون کو روک رہا ہے۔ نئے ٹیب میں کھولیں یا علامات ٹائپ کریں۔',
    voiceHttpsError: 'مائیکروفون کے لیے محفوظ HTTPS کنکشن ضروری ہے۔',
    voiceNoMicError: 'کوئی فعال مائیکروفون ڈیوائس نہیں ملی (NotFoundError)۔',
    voiceMicInUseError: 'مائیکروفون کسی اور ایپ میں مصروف ہے (NotReadableError)۔',
    voiceTranscribeError: 'آواز کو تحریر میں تبدیل نہیں کیا جا سکا۔ دوبارہ کوشش کریں یا ٹائپ کریں۔',
    voiceUnsupportedError: 'اس براؤزر میں وائس ان پٹ دستیاب نہیں ہے۔',
    qrTitle: 'مریض کی حالت کا QR کوڈ',
    qrSubtitle: 'انٹرنیٹ کے بغیر بھی فوری تفصیلات اور مقام پڑھنے کے لیے اسکین کریں',
    qrOfflineReady: 'آف لائن دستیاب',
    qrCaseBannerTitle: 'QR اسکین سے کیس نمبر موصول ہوا',
    qrCaseBannerDesc: 'کیس ریفرنس:',
    assistantBtn: 'سمارٹ اسسٹنٹ',
    assistantTitle: 'ابتدائی طبی امداد کا سمارٹ اسسٹنٹ',
    assistantSubtitle: 'مسجد الحرام میں 997 پروٹوکول کے مطابق فوری رہنمائی',
    assistantPlaceholder: 'طبی امداد سے متعلق سوال پوچھیں (مثلاً: ہیٹ اسٹروک میں کیا کریں؟)...',
    assistantSendBtn: 'بھیجیں',
    assistantContextBadge: 'موجودہ کیس سے منسلک',
    assistantOfflineNotice: 'آپ آف لائن ہیں — مقامی طور پر محفوظ ابتدائی طبی ہدایات دکھائی جا رہی ہیں۔',
    assistantWelcome: 'طواف سمارٹ فرسٹ ایڈ اسسٹنٹ میں خوش آمدید۔ اپنا سوال پوچھیں یا نیچے سے عام حالت منتخب کریں۔ بے ہوشی یا سینے کے درد میں فوراً 997 پر کال کریں۔',
    assistantQuick1: 'صحن میں ہیٹ اسٹروک کا فوری علاج کیسے کریں؟',
    assistantQuick2: 'بے ہوش شخص کو ریکوری پوزیشن میں کیسے لٹائیں؟',
    assistantQuick3: 'ہوش میں موجود معتمر کی شوگر کم ہونے پر کیا کریں؟',
    navOfflineGuide: 'آف لائن گائیڈ',
    offlineGuideTitle: 'انٹرنیٹ کے بغیر دستیاب ابتدائی طبی ہدایات',
    offlineGuideSubtitle: 'نیٹ ورک نہ ہونے پر بھی حرم میں فوری استعمال کے لیے آپ کے آلے پر محفوظ طبی رہنمائی',
    offlineGuideBadge: '100% آف لائن دستیاب',
    offlineGuideSearchPlaceholder: 'ہدایات تلاش کریں (بے ہوشی، ہیٹ اسٹروک، خون، فریکچر)...',
    offlineCatAll: 'تمام',
    offlineCatEmergency: 'ہنگامی حالات',
    offlineCatHeat: 'گرمی اور پانی کی کمی',
    offlineCatTrauma: 'چوٹ اور خون',
    offlineCatChronic: 'دائمی امراض',
    offlineDoNotLabel: 'انتباہ — ہرگز نہ کریں:',
    a11yBtn: 'رسائی (Accessibility)',
    a11yTitle: 'بصری و جسمانی معذوری کے حامل افراد کے لیے سہولیات',
    a11ySubtitle: 'زیادہ کنٹراسٹ، فونٹ سائز، الفاظ کا فاصلہ اور صوتی تلاوت کی ترتیبات',
    a11yContrastLabel: 'ہائی کنٹراسٹ موڈ',
    a11yContrastDesc: 'کمزور بینائی کے لیے گہرا پس منظر اور نمایاں سنہری لکیریں',
    a11yFontSizeLabel: 'تحریر کا سائز',
    a11yFontNormal: 'معمول',
    a11yFontLarge: 'بڑا +12%',
    a11yFontXLarge: 'بہت بڑا +25%',
    a11yDyslexiaLabel: 'پڑھنے میں آسانی کا فاصلہ',
    a11yDyslexiaDesc: 'سطروں اور الفاظ کے درمیان اضافی فاصلہ',
    a11yMotionLabel: 'حرکت کم کریں',
    a11yMotionDesc: 'اینیمیشن اور چمکدار اثرات بند کریں',
    a11yResetBtn: 'پہلے جیسا کریں',
    readAloudBtn: 'آواز میں سنیں',
    stopReadingBtn: 'آواز بند کریں',
    skipToMain: 'مرکزی حصے پر جائیں',
    pwaInstallBtn: 'ایپ انسٹال کریں',
    pwaInstalledBadge: 'ایپ انسٹال ہے',
    pwaIosTitle: 'iPhone / iPad پر طواف ایپ انسٹال کریں',
    pwaIosStep1: '1. نیچے سفاری (Safari) بار میں Share بٹن پر ٹیپ کریں۔',
    pwaIosStep2: '2. "Add to Home Screen" منتخب کر کے Add دبائیں۔',
    offlineBannerTitle: 'آپ آف لائن موڈ میں کام کر رہے ہیں',
    offlineBannerDesc: 'مقامی درجہ بندی، صوتی تلاوت، QR کوڈ اور ابتدائی طبی گائیڈ مکمل طور پر کام کر رہے ہیں۔',
    viewSide: 'سائیڈ کا رخ',
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
    menuOpenLabel: 'Buka menu',
    menuCloseLabel: 'Tutup menu',
    navOps: 'Meja Paramedis',
    localFallbackBtn: 'Gunakan Triase Lokal Instan',
    sourceAiBadge: 'Analisis AI',
    sourceLocalBadge: 'Triase Lokal Cepat',
    persistedBadge: 'Tersimpan di Server',
    savingCaseText: 'Menyimpan laporan kasus...',
    deleteCaseBtn: 'Hapus Kasus',
    confirmDeleteText: 'Konfirmasi hapus?',
    cancelBtn: 'Batal',
    statusLabel: 'Status Kasus',
    statusOpen: 'Menunggu',
    statusDispatched: 'Ambulans Dikirim',
    statusResolved: 'Selesai',
    responderNotesLabel: 'Catatan Lapangan Paramedis',
    opsTitle: 'Pusat Operasi Paramedis Masjidil Haram',
    opsSubtitle: 'Lihat, filter, perbarui status evakuasi, dan kelola kasus triase tersimpan',
    opsLoginTitle: 'Masuk Petugas Medis & Pengawas',
    opsSetupTitle: 'Pengaturan Awal Kode Pengawas',
    opsSetupDesc: 'Belum ada kode pengawas di server. Buat kode sandi kuat (minimal 8 karakter) untuk mengamankan panel petugas.',
    opsAdminTab: 'Kode Pengawas',
    opsResponderTab: 'Akun Petugas',
    opsPasscodeLabel: 'Kode Sandi Pengawas',
    opsPasscodePlaceholder: 'Masukkan kode sandi...',
    opsUsernameLabel: 'Nama Pengguna',
    opsPasswordLabel: 'Kata Sandi',
    opsLoginBtn: 'Masuk ke Panel',
    opsSetupBtn: 'Simpan Kode Pengawas',
    opsLogoutBtn: 'Keluar',
    opsSearchPlaceholder: 'Cari ID kasus atau gejala...',
    opsAllLevels: 'Semua Prioritas',
    opsAllZones: 'Semua Area',
    opsAllStatuses: 'Semua Status',
    opsRefreshBtn: 'Muat Ulang',
    opsNoCases: 'Tidak ada kasus triase yang sesuai dengan filter.',
    opsSaveBtn: 'Simpan Pembaruan',
    opsSavingBtn: 'Menyimpan...',
    opsLoadToCardBtn: 'Tampilkan di Kartu & Cetak',
    opsNotesPlaceholder: 'Tambahkan catatan tanda vital atau unit ambulans...',
    opsTeamTitle: 'Akun Tim Medis Lapangan',
    opsAddResponderBtn: 'Tambah Petugas',
    opsDisplayNameLabel: 'Nama Lengkap',
    opsRoleLabel: 'Peran',
    opsRoleResponder: 'Paramedis',
    opsRoleAdmin: 'Pengawas (Admin)',
    opsStatsTotal: 'Total Kasus',
    opsStatsCritical: 'Kritis (MERAH)',
    opsStatsOpen: 'Antrean Terbuka',
    opsAuthError: 'Gagal memverifikasi kredensial. Silakan coba lagi.',
    gpsSectionTitle: 'Lokasi GPS Akurat (Dengan Izin Pasien)',
    gpsConsentLabel: 'Saya setuju membagikan koordinat GPS kepada tim medis untuk mempercepat pertolongan',
    gpsCaptureBtn: 'Ambil Lokasi GPS Sekarang',
    gpsCapturingBtn: 'Mencari koordinat...',
    gpsClearBtn: 'Hapus GPS',
    gpsAccuracyLabel: 'Akurasi',
    gpsNearestZoneNote: 'Zona Masjidil Haram terdekat:',
    gpsOutsideHaramNote: 'Koordinat berada di luar area Masjidil Haram; Anda dapat memilih zona secara manual.',
    gpsDeniedError: 'Izin lokasi ditolak (PERMISSION_DENIED). Aktifkan izin lokasi di Edge & Windows atau pilih lokasi manual.',
    gpsIframeBlockedError: 'Iframe pratinjau (Permissions Policy) memblokir akses GPS meski izin browser aktif. Buka di tab mandiri atau pilih lokasi secara manual.',
    gpsHttpsError: 'Geolokasi memerlukan koneksi HTTPS yang aman.',
    gpsTimeoutError: 'Waktu pencarian lokasi habis (TIMEOUT). Coba lagi atau masukkan lokasi secara manual.',
    gpsUnavailableError: 'Layanan lokasi perangkat tidak dapat menentukan koordinat saat ini (POSITION_UNAVAILABLE). Silakan pilih secara manual.',
    gpsUnsupportedError: 'Geolokasi tidak didukung oleh browser ini.',
    gpsOpenStandaloneBtn: 'Buka di Tab Mandiri',
    gpsManualBtn: 'Isi Lokasi Manual',
    gpsManualDetailLabel: 'Detail Lokasi Manual (Pintu / Lantai / Pilar - Opsional)',
    gpsManualDetailPlaceholder: 'Contoh: Pintu Raja Abdulaziz - Lantai Dasar - Pilar 14',
    gpsLabelShort: 'GPS Terverifikasi',
    voiceStartBtn: 'Input Suara',
    voiceStopBtn: 'Hentikan Rekam',
    voiceTranscribingBtn: 'Mengubah ke teks...',
    voicePermissionError: 'Izin mikrofon ditolak (NotAllowedError). Aktifkan mikrofon di Edge/Windows atau ketik gejala.',
    voiceIframeBlockedError: 'Iframe pratinjau (Permissions Policy) memblokir akses mikrofon di jendela ini. Buka di tab mandiri atau ketik gejala.',
    voiceHttpsError: 'Akses mikrofon memerlukan koneksi HTTPS yang aman.',
    voiceNoMicError: 'Perangkat mikrofon aktif tidak ditemukan (NotFoundError).',
    voiceMicInUseError: 'Mikrofon sedang digunakan aplikasi lain atau gagal diakses (NotReadableError).',
    voiceTranscribeError: 'Gagal mengubah suara ke teks. Silakan coba lagi atau ketik gejala.',
    voiceUnsupportedError: 'Input suara tidak didukung di browser ini.',
    qrTitle: 'Kode QR Kondisi Pasien',
    qrSubtitle: 'Pindai untuk membaca prioritas triase, keluhan & GPS seketika bahkan offline',
    qrOfflineReady: 'Aktif Offline',
    qrCaseBannerTitle: 'Referensi Kasus dari Pindai QR',
    qrCaseBannerDesc: 'ID Referensi:',
    assistantBtn: 'Asisten Pintar',
    assistantTitle: 'Asisten Pintar Pertolongan Pertama',
    assistantSubtitle: 'Panduan cepat di Masjidil Haram sesuai protokol 997',
    assistantPlaceholder: 'Tanyakan langkah pertolongan pertama (mis. cara atasi heatstroke)...',
    assistantSendBtn: 'Kirim',
    assistantContextBadge: 'Terhubung ke Kasus Aktif',
    assistantOfflineNotice: 'Anda sedang offline — menampilkan panduan pertolongan pertama tersimpan lokal.',
    assistantWelcome: 'Selamat datang di Asisten Pertolongan Pertama Tawaf. Ajukan pertanyaan darurat atau pilih topik cepat di bawah. Hubungi 997 segera untuk nyeri dada atau pingsan.',
    assistantQuick1: 'Bagaimana menangani heatstroke di pelataran?',
    assistantQuick2: 'Cara memposisikan pasien pingsan ke posisi pemulihan?',
    assistantQuick3: 'Pertolongan gula darah rendah bagi jamaah yang sadar?',
    navOfflineGuide: 'Panduan Offline',
    offlineGuideTitle: 'Panduan Pertolongan Pertama Offline',
    offlineGuideSubtitle: 'Protokol medis terverifikasi yang tersimpan di perangkat untuk akses instan tanpa internet',
    offlineGuideBadge: '100% Tersedia Offline',
    offlineGuideSearchPlaceholder: 'Cari panduan (heatstroke, pingsan, pendarahan, patah)...',
    offlineCatAll: 'Semua',
    offlineCatEmergency: 'Kritis',
    offlineCatHeat: 'Panas & Dehidrasi',
    offlineCatTrauma: 'Cedera & Luka',
    offlineCatChronic: 'Penyakit Kronis',
    offlineDoNotLabel: 'Peringatan — JANGAN lakukan:',
    a11yBtn: 'Aksesibilitas',
    a11yTitle: 'Aksesibilitas untuk Tunanetra & Disabilitas',
    a11ySubtitle: 'Atur kontras tinggi, ukuran teks, jarak baca, dan pembacaan suara offline',
    a11yContrastLabel: 'Mode Kontras Tinggi',
    a11yContrastDesc: 'Latar gelap kontras tinggi dengan garis tepi emas terang',
    a11yFontSizeLabel: 'Ukuran Teks',
    a11yFontNormal: 'Normal',
    a11yFontLarge: 'Besar +12%',
    a11yFontXLarge: 'Sangat Besar +25%',
    a11yDyslexiaLabel: 'Jarak Baca Nyaman',
    a11yDyslexiaDesc: 'Lebarkan jarak baris dan kata agar lebih mudah dibaca',
    a11yMotionLabel: 'Kurangi Gerakan',
    a11yMotionDesc: 'Matikan animasi dan efek kilau visual',
    a11yResetBtn: 'Atur Ulang',
    readAloudBtn: 'Bacakan Suara',
    stopReadingBtn: 'Hentikan Suara',
    skipToMain: 'Langsung ke Area Triase Utama',
    pwaInstallBtn: 'Instal Aplikasi',
    pwaInstalledBadge: 'Aplikasi Terpasang',
    pwaIosTitle: 'Instal Aplikasi Tawaf di iPhone / iPad',
    pwaIosStep1: '1. Ketuk tombol Bagikan (Share) pada bilah bawah Safari.',
    pwaIosStep2: '2. Pilih "Tambahkan ke Layar Utama" lalu ketuk Tambah.',
    offlineBannerTitle: 'Mode Offline Aktif',
    offlineBannerDesc: 'Triase cepat lokal, pembacaan suara, kode QR, dan panduan medis tetap berjalan penuh.',
    viewSide: 'Tampak Samping',
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

