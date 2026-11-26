import { LanguageCode } from '../i18n';

export type GuidelineCategory = 'emergency' | 'heat' | 'trauma' | 'chronic';

export interface OfflineGuideline {
  id: string;
  category: GuidelineCategory;
  priority: 'critical' | 'urgent' | 'stable';
  title: Record<LanguageCode, string>;
  summary: Record<LanguageCode, string>;
  steps: Record<LanguageCode, string[]>;
  doNot: Record<LanguageCode, string>;
}

export const OFFLINE_GUIDELINES: OfflineGuideline[] = [
  {
    id: 'cardiac-cpr',
    category: 'emergency',
    priority: 'critical',
    title: {
      ar: 'توقف القلب والتنفس أو ألم الصدر الحاد',
      en: 'Cardiac Arrest or Acute Chest Pain',
      ur: 'دل کا دورہ، سانس رکنا یا سینے میں شدید درد',
      id: 'Henti Jantung atau Nyeri Dada Akut',
    },
    summary: {
      ar: 'بروتوكول الاستجابة الفورية عند ألم الصدر الضاغط أو توقف النبض داخل المسجد الحرام.',
      en: 'Immediate response protocol for crushing chest pain or cardiac arrest inside Al-Haram.',
      ur: 'مسجد الحرام میں سینے کے شدید درد یا نبض رکنے کی صورت میں فوری امداد کا طریقہ۔',
      id: 'Protokol respons cepat untuk nyeri dada menekan atau henti jantung di Masjidil Haram.',
    },
    steps: {
      ar: [
        'اطلب الهلال الأحمر ٩٩٧ فوراً أو وجّه أقرب مصلٍ لإبلاغ رجال الأمن في الساحة.',
        'إن كان المريض واعياً، أجلسه بوضع نصف جالس مع إرخاء الإحرام وتفريق المتجمهرين.',
        'إن فقد الوعي وتوقف تنفسه الطبيعي، ابدأ ضغطات الصدر السريعة (١٠٠–١٢٠ ضغطة/دقيقة) وسط الصدر واطلب جهاز AED.',
      ],
      en: [
        'Call 997 immediately or send a bystander to alert the nearest security officer.',
        'If conscious, seat in a semi-upright position, loosen clothing/Ihram, and clear bystanders.',
        'If unresponsive and not breathing normally, start chest compressions (100–120/min) at center of chest and request an AED.',
      ],
      ur: [
        'فوراً 997 پر کال کریں یا قریبی سکیورٹی اہلکار کو مطلع کریں۔',
        'اگر ہوش میں ہو تو نیم بیٹھی حالت میں بٹھائیں، احرام ڈھیلا کریں اور ہجوم ہٹائیں۔',
        'اگر بے ہوش ہو اور سانس نہ آ رہی ہو تو فوراً سینے کے وسط میں دباؤ (100-120 فی منٹ) شروع کریں اور AED منگوائیں۔',
      ],
      id: [
        'Segera hubungi 997 atau minta orang sekitar melapor ke petugas keamanan terdekat.',
        'Jika sadar, posisikan setengah duduk, longgarkan ihram, dan jauhkan kerumunan.',
        'Jika tidak sadar dan tidak bernapas normal, mulai kompresi dada (100–120/menit) di tengah dada dan minta AED.',
      ],
    },
    doNot: {
      ar: 'لا تسمح للمصاب بالمشي إلى نقطة الإسعاف أو تناول أي سوائل.',
      en: 'Do not allow the patient to walk or drink fluids.',
      ur: 'مریض کو چلنے نہ دیں اور نہ کوئی مشروب پلائیں۔',
      id: 'Jangan biarkan pasien berjalan atau minum cairan.',
    },
  },
  {
    id: 'heatstroke-protocol',
    category: 'heat',
    priority: 'critical',
    title: {
      ar: 'ضربة الشمس الحرجة وتوقف التعرق',
      en: 'Critical Heatstroke & Altered Mental Status',
      ur: 'شدید ہیٹ اسٹروک اور ذہنی الجھن',
      id: 'Heatstroke Kritis & Penurunan Kesadaran',
    },
    summary: {
      ar: 'حالة مهددة للحياة تتطلب التبريد النشط الفوري قبل وأثناء وصول فرقة الإسعاف.',
      en: 'Life-threatening hyperthermia requiring rapid active cooling while awaiting ambulance transport.',
      ur: 'جان لیوا گرمی کی حالت جس میں ایمبولینس آنے تک فوری ٹھنڈک پہنچانا ضروری ہے۔',
      id: 'Hipertermia mengancam nyawa yang butuh pendinginan aktif segera sambil menunggu ambulans.',
    },
    steps: {
      ar: [
        'انقل المصاب فوراً إلى داخل التوسعة المكيفة أو منطقة مظللة.',
        'انزع الطبقات الإضافية ورش الجلد بماء فاتر مع توجيه الهواء أو استخدام كمادات باردة على الرقبة والإبطين وأعلى الفخذ.',
        'اتصل بـ ٩٩٧ للبدء بالسوائل الوريدية المبردة داخل وحدة ضربات الشمس.',
      ],
      en: [
        'Move the pilgrim immediately into an air-conditioned indoor hall or shaded area.',
        'Expose skin safely, mist with tepid water/fan air, and place cold packs at neck, armpits, and groin.',
        'Call 997 immediately for urgent IV cooling management.',
      ],
      ur: [
        'مریض کو فوراً ایئر کنڈیشنڈ ہال یا سایہ دار جگہ منتقل کریں۔',
        'گردن، بغلوں اور رانوں پر ٹھنڈے پیک رکھیں اور ہلکے ٹھنڈے پانی سے جلد کو تر کر کے ہوا دیں۔',
        'فوری ڈرپ اور ہیٹ اسٹروک یونٹ کے لیے 997 پر کال کریں۔',
      ],
      id: [
        'Segera pindahkan jamaah ke ruang ber-AC atau tempat teduh.',
        'Semprot kulit dengan air sejuk, kipasi, dan tempelkan kompres dingin di leher, ketiak, serta lipat paha.',
        'Hubungi 997 segera untuk terapi cairan infus dingin.',
      ],
    },
    doNot: {
      ar: 'لا تجبر المصاب المشوش أو شبه الغائب عن الوعي على شرب الماء.',
      en: 'Never force fluids into a confused or drowsy person.',
      ur: 'غنودگی یا بے ہوشی میں زبردستی پانی نہ پلائیں۔',
      id: 'Jangan memaksa pasien yang linglung atau mengantuk untuk minum.',
    },
  },
  {
    id: 'heat-exhaustion',
    category: 'heat',
    priority: 'urgent',
    title: {
      ar: 'الإجهاد الحراري والجفاف والدوخة',
      en: 'Heat Exhaustion, Dehydration & Dizziness',
      ur: 'گرمی کی تھکن، پانی کی کمی اور چکر',
      id: 'Kelelahan Panas, Dehidrasi & Pusing',
    },
    summary: {
      ar: 'تدبير أولي سريع للتعرق الغزير والإرهاق في الساحات قبل تطوره لضربة شمس.',
      en: 'Early intervention for heavy sweating and dizziness in open courtyards before progression.',
      ur: 'کھلے صحن میں زیادہ پسینہ اور کمزوری کی ابتدائی دیکھ بھال۔',
      id: 'Penanganan awal keringat berlebih dan pusing di pelataran agar tidak berlanjut ke heatstroke.',
    },
    steps: {
      ar: [
        'أجلس أو أرح المصاب في الظل بعيداً عن حرارة الرخام وأشعة الشمس.',
        'ارفع الساقين قليلاً عن مستوى الجسم إن كان واعياً تماماً ولا يعاني من ضيق تنفس.',
        'أعطه رشفات تدريجية من ماء زمزم المعتدل أو محلول الجفاف، واطلب كرسياً متحركاً لإكمال التوجه للعيادة.',
      ],
      en: [
        'Rest the pilgrim in shade inside a cool corridor away from hot stone and sunlight.',
        'Elevate legs slightly (~20 cm) if fully alert and breathing comfortably.',
        'Provide slow sips of cool water or ORS and arrange wheelchair transfer to a Haram clinic.',
      ],
      ur: [
        'مریض کو دھوپ اور گرم فرش سے ہٹا کر ٹھنڈے سایہ دار حصے میں لٹائیں۔',
        'اگر مکمل ہوش میں ہو اور سانس ٹھیک ہو تو ٹانگیں ہلکی سی اونچی کریں۔',
        'تھوڑا تھوڑا پانی یا او آر ایس پلائیں اور کلینک تک جانے کے لیے وہیل چیئر استعمال کریں۔',
      ],
      id: [
        'Istirahatkan jamaah di tempat teduh dan sejuk jauh dari paparan matahari langsung.',
        'Tinggikan kaki sedikit bila sadar penuh dan tidak sesak napas.',
        'Berikan tegukan air sedikit demi sedikit atau oralit, lalu gunakan kursi roda menuju klinik.',
      ],
    },
    doNot: {
      ar: 'لا تترك المصاب يستأنف الطواف أو السعي قبل زوال الدوخة تماماً.',
      en: 'Do not resume Tawaf or Sai until dizziness and tachycardia fully resolve.',
      ur: 'چکر مکمل ختم ہونے تک طواف یا سعی دوبارہ شروع نہ کریں۔',
      id: 'Jangan melanjutkan tawaf atau sai sebelum pusing benar-benar hilang.',
    },
  },
  {
    id: 'hypoglycemia',
    category: 'chronic',
    priority: 'urgent',
    title: {
      ar: 'هبوط سكر الدم المفاجئ لمرضى السكري',
      en: 'Acute Hypoglycemia (Low Blood Sugar)',
      ur: 'شوگر کی اچانک کمی (ہائپوگلائسیمیا)',
      id: 'Hipoglikemia Akut (Gula Darah Rendah)',
    },
    summary: {
      ar: 'التعامل مع الرعشة والتعرق البارد والشحوب الناتج عن الجهد وتأخر الوجبات.',
      en: 'Managing sudden tremors, cold sweat, and weakness caused by exertion or insulin timing.',
      ur: 'مشقت یا انسولین کے بعد کپکپی، ٹھنڈے پسینے اور کمزوری کا فوری حل۔',
      id: 'Penanganan gemetar, keringat dingin, dan lemas akibat kelelahan atau obat diabetes.',
    },
    steps: {
      ar: [
        'أجلس المريض فوراً وتأكد من قدرته الكاملة على البلع والتركيز.',
        'أعطه ١٥–٢٠ غرام سكر سريع الامتصاص: ٣ تمرات، نصف كوب عصير محلى، أو ملعقة عسل.',
        'انتظر ١٥ دقيقة ثم توجّه لأقرب نقطة إسعاف لقياس سكر الدم وتناول وجبة خفيفة.',
      ],
      en: [
        'Seat the pilgrim safely and verify they are alert and able to swallow without coughing.',
        'Give 15–20g fast-acting sugar: 3 dates, half a cup of sweet juice, or glucose gel.',
        'Wait 15 minutes and visit the nearest medical post to confirm blood glucose recovery.',
      ],
      ur: [
        'مریض کو محفوظ جگہ بٹھائیں اور دیکھیں کہ وہ ہوش میں ہے اور آسانی سے نگل سکتا ہے۔',
        'فوراً 3 کھجوریں، آدھا کپ میٹھا جوس یا گلوکوز جیل دیں۔',
        '15 منٹ بعد قریبی طبی مرکز میں شوگر چیک کروائیں۔',
      ],
      id: [
        'Dudukkan jamaah dan pastikan sadar penuh serta mampu menelan dengan aman.',
        'Berikan 15–20g gula cepat serap: 3 kurma, setengah gelas jus manis, atau madu.',
        'Tunggu 15 menit lalu periksa ulang kadar gula di pos medis terdekat.',
      ],
    },
    doNot: {
      ar: 'يُمنع وضع الطعام أو السوائل في فم المريض إذا كان شبه غائب عن الوعي.',
      en: 'Do not place food or liquids in the mouth if drowsy or semi-conscious.',
      ur: 'نیم بے ہوشی کی حالت میں منہ میں کھانا یا جوس ہرگز نہ ڈالیں۔',
      id: 'Dilarang memasukkan makanan atau cairan jika pasien mengantuk berat atau tidak sadar.',
    },
  },
  {
    id: 'unconscious-recovery',
    category: 'emergency',
    priority: 'critical',
    title: {
      ar: 'وضعية الإفاقة الجانبية للمغمى عليه (مع وجود تنفس)',
      en: 'Recovery Position for Unconscious Breathing Patient',
      ur: 'سانس چلتی ہوئی بے ہوشی میں ریکوری پوزیشن',
      id: 'Posisi Pemulihan untuk Pasien Pingsan yang Bernapas',
    },
    summary: {
      ar: 'حماية مجرى التنفس ومنع انسداده باللسان أو القيء لحين وصول فريق ٩٩٧.',
      en: 'Protecting the airway from obstruction or aspiration until Saudi Red Crescent arrives.',
      ur: 'ایمبولینس کی آمد تک سانس کے راستے کو کھلا اور محفوظ رکھنے کا طریقہ۔',
      id: 'Menjaga jalan napas tetap terbuka dan mencegah tersedak hingga tim 997 tiba.',
    },
    steps: {
      ar: [
        'تأكد من وجود تنفس منتظم لمدة ١٠ ثوانٍ، ثم اتصل بـ ٩٩٧ فوراً.',
        'أدر المصاب بلطف على جانبه الأيمن أو الأيسر مع ثني الركبة العلوية لتثبيت الجسم.',
        'أمِل الرأس للخلف قليلاً لفتح مجرى الهواء وافحص التنفس باستمرار حتى وصول المسعفين.',
      ],
      en: [
        'Confirm steady breathing for up to 10 seconds and call 997 immediately.',
        'Gently roll the person onto their side, bending the top knee forward for stability.',
        'Tilt head slightly back/chin up so the airway drains freely and monitor breathing continuously.',
      ],
      ur: [
        '10 سیکنڈ تک باقاعدہ سانس کی تصدیق کریں اور فوراً 997 پر کال کریں۔',
        'مریض کو نرمی سے ایک کروٹ پر لٹائیں اور اوپر والا گھٹنا آگے موڑ کر سہارا دیں۔',
        'سانس کا راستہ کھلا رکھنے کے لیے سر کو ہلکا سا پیچھے جھکائیں اور نگرانی رکھیں۔',
      ],
      id: [
        'Pastikan pasien bernapas teratur maksimal 10 detik lalu hubungi 997 segera.',
        'Miringkan tubuh pasien perlahan ke satu sisi dan tekuk lutut atas ke depan sebagai penahan.',
        'Tengadahkan kepala sedikit agar jalan napas terbuka dan pantau napas terus-menerus.',
      ],
    },
    doNot: {
      ar: 'لا تضع وسادة مرتفعة تحت الرأس ولا ترش الماء داخل الفم أو الأنف.',
      en: 'Do not place a thick pillow under the head or pour water onto the face/mouth.',
      ur: 'سر کے نیچے اونچا تکیہ نہ رکھیں اور منہ یا ناک میں پانی نہ ڈالیں۔',
      id: 'Jangan ganjal kepala terlalu tinggi atau menyiram air ke mulut pasien.',
    },
  },
  {
    id: 'bleeding-control',
    category: 'trauma',
    priority: 'urgent',
    title: {
      ar: 'إيقاف النزيف الخارجي والجروح الحادة',
      en: 'External Bleeding & Laceration Control',
      ur: 'بیرونی خون بہنا اور زخم پر قابو پانا',
      id: 'Menghentikan Pendarahan Luar & Luka Robek',
    },
    summary: {
      ar: 'السيطرة الفورية على النزيف عبر الضغط المباشر النظيف وتقليل فقدان الدم.',
      en: 'Immediate hemorrhage control via steady direct pressure with sterile cloth or gauze.',
      ur: 'صاف کپڑے یا پٹی کے براہِ راست دباؤ سے خون بہنے کو روکنے کا طریقہ۔',
      id: 'Pengendalian pendarahan segera melalui penekanan langsung yang bersih.',
    },
    steps: {
      ar: [
        'ارتدِ قفازات نظيفة إن توفرت أو استخدم شاشاً معقماً أو منشفة إحرام نظيفة.',
        'اضغط مباشرة وبثبات على موضع النزيف لمدة ١٠ دقائق متواصلة دون رفع الضماد.',
        'إذا تشبع الشاش بالدم، أضف طبقة جديدة فوقه مباشرة واطلب الإسعاف إن استمر النزيف.',
      ],
      en: [
        'Wear clean gloves if available and cover the wound with sterile gauze or clean cloth.',
        'Apply firm, continuous direct pressure for 10 full minutes without lifting to peek.',
        'If blood soaks through, place additional gauze directly on top and call 997 if heavy.',
      ],
      ur: [
        'اگر میسر ہو تو دستانے پہنیں اور زخم پر صاف پٹی یا کپڑا رکھیں۔',
        'بغیر اٹھائے مسلسل 10 منٹ تک مضبوط اور براہِ راست دباؤ برقرار رکھیں۔',
        'اگر کپڑا خون سے بھیگ جائے تو اسی کے اوپر مزید پٹی رکھیں، اور زیادہ خون ہو تو 997 پر کال کریں۔',
      ],
      id: [
        'Gunakan sarung tangan bila ada dan tutup luka dengan kasa steril atau kain bersih.',
        'Tekan langsung secara mantap selama 10 menit penuh tanpa mengangkat kain.',
        'Jika darah menembus, tumpuk kasa baru di atasnya dan hubungi 997 bila pendarahan berat.',
      ],
    },
    doNot: {
      ar: 'لا تنزع الضماد الأول عن الجرح حتى لا يتجدد النزيف ولا تربط عاصبة عشوائياً.',
      en: 'Do not peel off the first blood-soaked pad or tie makeshift tourniquets carelessly.',
      ur: 'پہلی بھیگی ہوئی پٹی زخم سے نہ اتاریں اور بغیر تربیت کے ٹورنیکٹ نہ باندھیں۔',
      id: 'Jangan melepas kasa pertama yang sudah menempel atau memasang torniket sembarangan.',
    },
  },
  {
    id: 'fractures-wheelchair',
    category: 'trauma',
    priority: 'urgent',
    title: {
      ar: 'اشتباه الكسور والالتواءات وإصابات السقوط',
      en: 'Suspected Fractures, Sprains & Falls',
      ur: 'ہڈی ٹوٹنے، موچ اور گرنے کی چوٹیں',
      id: 'Dugaan Patah Tulang, Keseleo & Cedera Jatuh',
    },
    summary: {
      ar: 'تثبيت العضو المصاب في وضعه وعدم تحريك المريض إلا بكرسي متحرك أو نقالة.',
      en: 'Immobilizing the injured limb in place and arranging wheelchair or stretcher transport.',
      ur: 'متاثرہ حصے کو حرکت دیے بغیر سہارا دینا اور وہیل چیئر یا اسٹریچر منگوانا۔',
      id: 'Imobilisasi anggota gerak yang cedera dan evakuasi dengan kursi roda atau tandu.',
    },
    steps: {
      ar: [
        'ثبّت الطرف المصاب في الوضع الذي وُجد عليه دون محاولة إرجاع العظم أو سحبه.',
        'استخدم كمادات باردة ملفوفة بقماش لتخفيف التورم في حالات الالتواء البسيط.',
        'اطلب خدمة العربات أو نقالة الهلال الأحمر لنقل المصاب بأمان إلى نقطة الرعاية.',
      ],
      en: [
        'Support and immobilize the limb as found without attempting to straighten or realign.',
        'Apply wrapped cold compresses to reduce swelling in suspected ankle/joint sprains.',
        'Request a Haram wheelchair or 997 stretcher before moving the patient.',
      ],
      ur: [
        'ہڈی کو سیدھا کرنے یا کھینچنے کی کوشش کیے بغیر متاثرہ حصے کو اسی حالت میں سہارا دیں۔',
        'موچ اور سوجن کم کرنے کے لیے کپڑے میں لپٹی برف یا ٹھنڈی پٹی رکھیں۔',
        'مریض کو منتقل کرنے کے لیے وہیل چیئر یا 997 اسٹریچر طلب کریں۔',
      ],
      id: [
        'Topang dan fiksasi anggota gerak pada posisi ditemukannya tanpa mencoba meluruskan.',
        'Tempelkan kompres dingin terbungkus kain untuk mengurangi bengkak pada keseleo.',
        'Minta kursi roda Haram atau tandu 997 sebelum memindahkan pasien.',
      ],
    },
    doNot: {
      ar: 'لا تدلك موضع الكسر ولا تجبر المصاب على الوقوف على القدم المصابة.',
      en: 'Do not massage suspected fractures or allow weight-bearing on the injured limb.',
      ur: 'ٹوٹے ہوئے حصے کی مالش نہ کریں اور نہ متاثرہ پاؤں پر وزن ڈالنے دیں۔',
      id: 'Jangan memijat area patah tulang atau membiarkan pasien menumpu pada kaki yang cedera.',
    },
  },
  {
    id: 'choking-aid',
    category: 'emergency',
    priority: 'critical',
    title: {
      ar: 'الاختناق وانسداد مجرى التنفس بجسم غريب',
      en: 'Choking & Airway Obstruction',
      ur: 'گلا گھٹنا اور سانس کی نالی میں رکاوٹ',
      id: 'Tersedak & Sumbatan Jalan Napas',
    },
    summary: {
      ar: 'إسعاف فوري للمعتمر غير القادر على السعال أو الكلام بسبب الغصة.',
      en: 'Urgent Heimlich/back-blow protocol when a conscious person cannot cough or speak.',
      ur: 'کھانے یا کسی چیز کے پھنسنے سے سانس بند ہونے پر فوری طبی امداد۔',
      id: 'Penanganan darurat bila jamaah tersedak dan tidak mampu batuk atau berbicara.',
    },
    steps: {
      ar: [
        'إذا كان يسعل بقوة شجعه على الاستمرار بالسعال ولا تضرب ظهره.',
        'إذا عجز عن الكلام أو التنفس: أعطِ ٥ ضربات حازمة بين لوحي الكتف مع إمالة الجذع للأمام.',
        'تبعها بـ ٥ ضغطات بطنية (فوق السرة وأسفل القفص الصدري) بالتناوب مع الاتصال بـ ٩٩٧.',
      ],
      en: [
        'If coughing forcefully, encourage continued coughing without interfering.',
        'If unable to speak or breathe: lean forward and deliver 5 firm back blows between shoulder blades.',
        'Alternate with 5 upward abdominal thrusts above the navel (chest thrusts if pregnant) and call 997.',
      ],
      ur: [
        'اگر مریض زور سے کھانس رہا ہو تو کھانستے رہنے کی ترغیب دیں۔',
        'اگر بول یا سانس نہ لے سکے تو آگے جھکا کر دونوں کندھوں کے درمیان 5 مضبوط تھپکیاں دیں۔',
        'اس کے بعد ناف کے اوپر 5 پیٹ کے دباؤ (ہیملچ) دیں اور 997 پر کال کریں۔',
      ],
      id: [
        'Jika masih bisa batuk kuat, dorong pasien untuk terus batuk.',
        'Jika tidak bisa bicara atau bernapas: condongkan badan ke depan dan beri 5 tepukan mantap di antara tulang belikat.',
        'Lanjutkan bergantian dengan 5 hentakan perut di atas pusar dan segera hubungi 997.',
      ],
    },
    doNot: {
      ar: 'لا تُدخل أصابعك في الحلق بشكل عشوائي لدفع الجسم الغريب للأسفل.',
      en: 'Never perform blind finger sweeps that may push the object deeper.',
      ur: 'بغیر دیکھے گلے میں انگلی ڈال کر رکاوٹ کو اندر دھکیلنے کی کوشش نہ کریں۔',
      id: 'Jangan memasukkan jari secara membabi buta ke tenggorokan karena dapat mendorong benda lebih dalam.',
    },
  },
];
