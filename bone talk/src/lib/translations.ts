export interface TranslationSchema {
  nav: {
    technology: string
    howItWorks: string
    ai: string
    hardware: string
    worldwide: string
    vision: string
    experience: string
  }
  hero: {
    eyebrow: string
    line1: string
    line2: string
    description: string
    getStarted: string
    exploreSystem: string
    seeHowItWorks: string
    formFactorLabel: string
    formFactorVal: string
    processorLabel: string
    latencyLabel: string
    commsLabel: string
    annotations: {
      emgLabel: string
      emgSub: string
      aiLabel: string
      aiSub: string
      signalLabel: string
      signalSub: string
      voiceLabel: string
      voiceSub: string
      esp32Label: string
      esp32Sub: string
    }
  }
  pipeline: {
    eyebrow: string
    title: string
    description: string
    steps: {
      s1Title: string
      s1Desc: string
      s1Status: string
      s2Title: string
      s2Desc: string
      s2Status: string
      s3Title: string
      s3Desc: string
      s3Status: string
      s4Title: string
      s4Desc: string
      s4Status: string
      s5Title: string
      s5Desc: string
      s5Status: string
      s6Title: string
      s6Desc: string
      s6Status: string
    }
  }
  signal: {
    eyebrow: string
    title: string
    description: string
    oscilloscopeTitle: string
    hzRate: string
    selectCommand: string
    signalDetected: string
    patternMatch: string
    intentOutput: string
    latency: string
    playVoiceBtn: string
  }
  hardware: {
    eyebrow: string
    title: string
    description: string
    specTitle: string
    processor: string
    vectorExt: string
    sramPsram: string
    power: string
    systemStatus: string
    emgSensor: string
    esp32s3: string
    aiModel: string
    signalState: string
    wirelessState: string
    aiProcessing: string
  }
  teach: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    description: string
    activeVocab: string
    clickToPlay: string
    calibrationTitle: string
    calibrationDesc: string
    trainHi: string
    trainWater: string
    enterCustom: string
    trainBtn: string
    targetCmd: string
    capturing: string
    trialProgress: string
    learnedStatus: string
    performContraction: string
    calibratedCheck: string
    aiConfidence: string
    trainAnother: string
    t1Name: string
    t2Name: string
    t3Name: string
  }
  voicePanel: {
    engineTitle: string
    voiceConfigBtn: string
    trainedCmdLabel: string
    aiConfidenceLabel: string
    readyBadge: string
    speechParams: string
    synthesisVoice: string
    speedRate: string
    pitch: string
    volume: string
    testVoiceBtn: string
    playVoiceBtn: string
    speakingState: string
    unavailableState: string
    synthesizingMsg: string
    commandSpokenMsg: string
    speechReadyMsg: string
    unsupportedMsg: string
  }
  ai: {
    eyebrow: string
    title: string
    description: string
    feature1Title: string
    feature1Desc: string
    feature2Title: string
    feature2Desc: string
    feature3Title: string
    feature3Desc: string
  }
  worldwide: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    description: string
    totalLanguages: string
    indianRegional: string
    international: string
    mapTitle: string
    mapLatency: string
    statementTitle: string
    statementBody: string
    pLocal: string
    pRegional: string
    pNational: string
    pGlobal: string
  }
  human: {
    eyebrow: string
    line1: string
    line2: string
    subtitle: string
  }
  footer: {
    readyToExperience: string
    ctaTitle: string
    ctaDesc: string
    experienceBtn: string
    documentationBtn: string
    copyright: string
    tagline: string
  }
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// ─── ENGLISH (BASE TRUTHS) ──────────────────────────────────────────────────
export const en: TranslationSchema = {
  nav: {
    technology: 'Technology',
    howItWorks: 'How It Works',
    ai: 'AI',
    hardware: 'Hardware',
    worldwide: 'Worldwide',
    vision: 'Vision',
    experience: 'EXPERIENCE BONETALK',
  },
  hero: {
    eyebrow: 'NECK-WORN ASSISTIVE NEUROTECHNOLOGY / 2026',
    line1: 'THE BODY',
    line2: 'HAS A VOICE.',
    description:
      'BoneTalk is a neck-worn assistive device that transforms muscle activity into meaningful speech using surface EMG sensing, embedded DSP, and TinyML AI.',
    getStarted: 'GET STARTED',
    exploreSystem: 'EXPLORE THE SYSTEM',
    seeHowItWorks: 'SEE HOW IT WORKS',
    formFactorLabel: 'FORM FACTOR:',
    formFactorVal: 'NECK WEARABLE',
    processorLabel: 'PROCESSOR:',
    latencyLabel: 'LATENCY:',
    commsLabel: 'COMMS:',
    annotations: {
      emgLabel: 'EMG SENSOR',
      emgSub: 'Biopotential Electrodes',
      aiLabel: 'AI RECOGNITION',
      aiSub: 'Gesture Classification',
      signalLabel: 'MUSCLE SIGNAL',
      signalSub: 'Neck Muscle Activity',
      voiceLabel: 'VOICE OUTPUT',
      voiceSub: 'Real-Time Speech Engine',
      esp32Label: 'ESP32-S3 POD',
      esp32Sub: '240MHz TinyML DSP',
    },
  },
  pipeline: {
    eyebrow: 'HOW IT WORKS',
    title: 'From Muscle Signal to Voice',
    description:
      'BONEtalk interprets natural muscle activity and turns your intended message into spoken words — in real time.',
    steps: {
      s1Title: 'Your Intent',
      s1Desc: 'You think of what you want to say. Your brain prepares the speech.',
      s1Status: 'Ready',
      s2Title: 'Signal Capture',
      s2Desc: 'Tiny brain signals related to speech are safely recorded.',
      s2Status: 'Capturing',
      s3Title: 'Signal Processing',
      s3Desc: 'The signals are cleaned and organized to find meaning.',
      s3Status: 'Processing',
      s4Title: 'Meaning Understanding',
      s4Desc: 'Our intelligent system understands the intended message.',
      s4Status: 'Understanding',
      s5Title: 'Language Generation',
      s5Desc: 'The message is converted into natural, clear text.',
      s5Status: 'Generating',
      s6Title: 'Natural Speech',
      s6Desc: 'The text is synthesized into realistic, audible speech.',
      s6Status: 'Speaking',
    },
  },
  signal: {
    eyebrow: 'REAL-TIME INTERACTION',
    title: 'Reading the Signal',
    description:
      'Experience how BoneTalk converts subtle surface biopotential fluctuations into clean digital intent output in milliseconds.',
    oscilloscopeTitle: 'LIVE EMG OSCILLOSCOPE STREAM',
    hzRate: '1000 Hz Sampling',
    selectCommand: 'SELECT MUSCLE COMMAND TO SIMULATE',
    signalDetected: 'SIGNAL DETECTED',
    patternMatch: 'PATTERN MATCH',
    intentOutput: 'INTENT OUTPUT',
    latency: 'LATENCY',
    playVoiceBtn: 'PLAY SYNTHESIZED VOICE',
  },
  hardware: {
    eyebrow: 'PHYSICAL ARCHITECTURE',
    title: 'Hardware Sub-Systems',
    description:
      'Clinical-grade analog front-end integrated with edge TinyML compute on the ESP32-S3 silicon platform.',
    specTitle: 'ESP32-S3 Microcontroller',
    processor: 'Dual-Core LX7 @ 240MHz',
    vectorExt: 'DSP & Neural Accel',
    sramPsram: '512 KB SRAM + 8MB',
    power: '< 45 mW Peak',
    systemStatus: 'SYSTEM STATUS',
    emgSensor: 'EMG SENSOR',
    esp32s3: 'ESP32-S3',
    aiModel: 'AI MODEL',
    signalState: 'SIMULATED',
    wirelessState: 'N/A',
    aiProcessing: 'AI PROCESSING',
  },
  teach: {
    eyebrow: 'ADAPTIVE NEURAL PERSONALIZATION',
    titleLine1: 'TEACH IT',
    titleLine2: 'YOUR LANGUAGE.',
    description:
      'Every user has a distinct neuromuscular signature. BoneTalk calibrates its machine learning pipeline to your specific muscle gestures in under 60 seconds — and transforms them into clear, audible speech.',
    activeVocab: 'Active Trained Vocabulary',
    clickToPlay: 'Click to inspect & play voice',
    calibrationTitle: 'Gesture Calibration Suite',
    calibrationDesc: 'Teach BoneTalk a custom phrase by recording 3 muscle contraction trials.',
    trainHi: 'TRAIN "HI"',
    trainWater: 'TRAIN "I NEED WATER"',
    enterCustom: 'ENTER CUSTOM PHRASE...',
    trainBtn: 'TRAIN',
    targetCmd: 'Target Command',
    capturing: 'CAPTURING SIGNAL...',
    trialProgress: 'TRIAL IN PROGRESS',
    learnedStatus: 'PATTERN LEARNED ✓',
    performContraction: 'Perform Muscle Contraction',
    calibratedCheck: 'CALIBRATED ✓',
    aiConfidence: 'AI Confidence',
    trainAnother: 'Train Another Command →',
    t1Name: 'Extensor Flex',
    t2Name: 'Flexor Hold',
    t3Name: 'Peak Burst',
  },
  voicePanel: {
    engineTitle: 'VOICE OUTPUT ENGINE',
    voiceConfigBtn: 'VOICE CONFIG',
    trainedCmdLabel: 'TRAINED COMMAND',
    aiConfidenceLabel: 'AI CONFIDENCE',
    readyBadge: 'READY',
    speechParams: 'SPEECH PARAMETERS',
    synthesisVoice: 'SYNTHESIS VOICE',
    speedRate: 'SPEED RATE',
    pitch: 'PITCH',
    volume: 'VOLUME',
    testVoiceBtn: 'TEST VOICE CONFIG',
    playVoiceBtn: 'PLAY VOICE',
    speakingState: 'SPEAKING...',
    unavailableState: 'VOICE OUTPUT UNAVAILABLE',
    synthesizingMsg: 'SYNTHESIZING SPEECH AUDIO',
    commandSpokenMsg: '✓ COMMAND SPOKEN',
    speechReadyMsg: 'SPEECH READY — Click to synthesize vocal audio',
    unsupportedMsg: 'Speech synthesis is not supported in this browser.',
  },
  ai: {
    eyebrow: 'EMBEDDED INTELLIGENCE',
    title: 'Deterministic Signal Transformation',
    description:
      'Direct digital signal processing eliminates ambiguity. Raw microvolt fluctuations pass through digital bandpass filtering, statistical feature extraction, and TinyML neural classification.',
    feature1Title: '96.4% Accuracy',
    feature1Desc: 'High confidence classification even under muscle fatigue or motion noise.',
    feature2Title: '< 12.4ms Latency',
    feature2Desc: 'Ultra-low latency inference executing on onboard ESP32-S3 vector hardware.',
    feature3Title: 'Zero Cloud Dependency',
    feature3Desc: '100% private on-device execution with total user data privacy.',
  },
  worldwide: {
    eyebrow: 'GLOBAL ACCESSIBILITY & IMPACT',
    titleLine1: 'BUILT FOR ONE VOICE.',
    titleLine2: 'DESIGNED FOR THE WORLD.',
    description:
      'Communication has no borders. BoneTalk is designed to help people communicate across languages, regions, and cultures — transforming muscle signals into meaningful words and speech wherever they are.',
    totalLanguages: 'Global Languages',
    indianRegional: 'Regional Languages',
    international: 'International Languages',
    mapTitle: 'WORLDWIDE BIOPOTENTIAL MAP',
    mapLatency: 'TRANSLATION LATENCY < 15 MS',
    statementTitle: 'ONE SIGNAL. MANY LANGUAGES. ONE HUMAN VOICE.',
    statementBody:
      'From local communication to global connection, BoneTalk is built to make assistive communication accessible across the world — giving every individual the power to express themselves naturally.',
    pLocal: 'LOCAL',
    pRegional: 'REGIONAL',
    pNational: 'NATIONAL',
    pGlobal: 'GLOBAL',
  },
  human: {
    eyebrow: 'Human Purpose & Dignity',
    line1: 'A VOICE',
    line2: 'IS MORE THAN SOUND.',
    subtitle: "It's the innate human ability to communicate:",
  },
  footer: {
    readyToExperience: 'READY TO EXPERIENCE BONETALK?',
    ctaTitle: 'RESTORE EXPRESSION. RECLAIM DIGNITY.',
    ctaDesc: 'Built with clinical precision for individuals with speech and motor impairments.',
    experienceBtn: 'EXPERIENCE SYSTEM DEMO',
    documentationBtn: 'READ ENGINEERING DATASHEET',
    copyright: '© 2026 BoneTalk Systems Inc. All rights reserved.',
    tagline: 'Neuromuscular Assistive Interface System',
  },
}

// Helper function to build deep-merged translated schemas with fallbacks to English
function createTranslation(override: DeepPartial<TranslationSchema>): TranslationSchema {
  return {
    ...en,
    ...override,
    nav: { ...en.nav, ...(override.nav || {}) },
    hero: {
      ...en.hero,
      ...(override.hero || {}),
      annotations: { ...en.hero.annotations, ...(override.hero?.annotations || {}) },
    },
    pipeline: {
      ...en.pipeline,
      ...(override.pipeline || {}),
      steps: { ...en.pipeline.steps, ...(override.pipeline?.steps || {}) },
    },
    signal: { ...en.signal, ...(override.signal || {}) },
    hardware: { ...en.hardware, ...(override.hardware || {}) },
    teach: { ...en.teach, ...(override.teach || {}) },
    voicePanel: { ...en.voicePanel, ...(override.voicePanel || {}) },
    ai: { ...en.ai, ...(override.ai || {}) },
    worldwide: { ...en.worldwide, ...(override.worldwide || {}) },
    human: { ...en.human, ...(override.human || {}) },
    footer: { ...en.footer, ...(override.footer || {}) },
  } as TranslationSchema
}

// ─── 24 FULL LOCALIZED TRANSLATIONS DICTIONARY ──────────────────────────────
export const TRANSLATIONS: Record<string, TranslationSchema> = {
  en,
  hi: createTranslation({
    nav: { technology: 'तकनीक', howItWorks: 'यह कैसे काम करता है', ai: 'एआई', hardware: 'हार्डवेयर', worldwide: 'वैश्विक', vision: 'दृष्टिकोण', experience: 'बोनटॉक का अनुभव करें' },
    hero: { eyebrow: 'गले में पहनी जाने वाली सहायक तंत्रिका तकनीक / 2026', line1: 'शरीर के पास', line2: 'एक आवाज़ है।', description: 'बोनटॉक एक गले में पहना जाने वाला सहायक उपकरण है जो मांसपेशियों की गतिविधि को स्पष्ट और सार्थक बोली में परिवर्तित करता है।', getStarted: 'शुरू करें', exploreSystem: 'सिस्टम देखें', seeHowItWorks: 'देखें कैसे काम करता है' },
    pipeline: { eyebrow: 'यह कैसे काम करता है', title: 'मांसपेशियों के संकेत से आवाज़ तक', description: 'बोनटॉक प्राकृतिक मांसपेशियों की गतिविधि को वास्तविक समय में बोली जाने वाली भाषा में बदलता है।' },
    worldwide: { titleLine1: 'एक आवाज़ के लिए निर्मित।', titleLine2: 'पूरी दुनिया के लिए डिज़ाइन किया गया।', description: 'संचार की कोई सीमाएँ नहीं होतीं। बोनटॉक लोगों को भाषाओं, क्षेत्रों और संस्कृतियों के पार संवाद करने में मदद करता है।' },
  }),
  bn: createTranslation({
    nav: { technology: 'প্রযুক্তি', howItWorks: 'কীভাবে কাজ করে', ai: 'এআই', hardware: 'হার্ডওয়্যার', worldwide: 'বিশ্বব্যাপী', vision: 'ভিশন', experience: 'অভিজ্ঞতা নিন' },
    hero: { eyebrow: 'গলায় পরার সহায়ক নিউরোটেকনোলজি / ২০২৬', line1: 'দেহেরও', line2: 'একটি স্বর আছে।', description: 'বোনটক একটি গলায় পরা পরিধানযোগ্য ডিভাইস যা পেশীর কার্যকলাপকে স্পষ্ট বাক্যে রূপান্তরিত করে।', getStarted: 'শুরু করুন', exploreSystem: 'সিস্টেম দেখুন', seeHowItWorks: 'কীভাবে কাজ করে দেখুন' },
    pipeline: { eyebrow: 'কীভাবে কাজ করে', title: 'পেশীর সিগন্যাল থেকে কণ্ঠস্বরে', description: 'বোনটক রিয়েল-টাইমে পেশীর স্বাভাবিক সংকেতকে বাচনে রূপান্তর করে।' },
    worldwide: { titleLine1: 'একটি স্বরের জন্য নির্মিত।', titleLine2: 'সমগ্র বিশ্বের জন্য ডিজাইন করা।', description: 'যোগাযোগের কোনো সীমানা নেই। বোনটক ভাষা, অঞ্চল ও সংস্কৃতির সীমা ছাড়িয়ে মানুষকে ভাব প্রকাশে সাহায্য করে।' },
  }),
  es: createTranslation({
    nav: { technology: 'Tecnología', howItWorks: 'Cómo funciona', ai: 'IA', hardware: 'Hardware', worldwide: 'Mundial', vision: 'Visión', experience: 'EXPERIMENTAR BONETALK' },
    hero: { eyebrow: 'NEUROTECNOLOGÍA ASISTIVA PARA EL CUELLO / 2026', line1: 'EL CUERPO', line2: 'TIENE VOZ.', description: 'BoneTalk es un dispositivo asistivo para el cuello que transforma la actividad muscular en habla con significado.', getStarted: 'EMPEZAR', exploreSystem: 'EXPLORAR SISTEMA', seeHowItWorks: 'VER CÓMO FUNCIONA' },
    pipeline: { eyebrow: 'CÓMO FUNCIONA', title: 'De la señal muscular a la voz', description: 'BoneTalk interpreta la actividad muscular natural y convierte su mensaje en palabras habladas en tiempo real.' },
    worldwide: { titleLine1: 'CREADO PARA UNA VOZ.', titleLine2: 'DISEÑADO PARA EL MUNDO.', description: 'La comunicación no tiene fronteras. BoneTalk ayuda a las personas a comunicarse a través de idiomas y culturas.' },
  }),
  fr: createTranslation({
    nav: { technology: 'Technologie', howItWorks: 'Comment ça marche', ai: 'IA', hardware: 'Matériel', worldwide: 'Mondial', vision: 'Vision', experience: 'EXPÉRIMENTER BONETALK' },
    hero: { eyebrow: 'NEUROTECHNOLOGIE D’ASSISTANCE AU COU / 2026', line1: 'LE CORPS', line2: 'A UNE VOIX.', description: 'BoneTalk est un appareil d’assistance porté au cou qui transforme l’activité musculaire en parole expressive.', getStarted: 'COMMENCER', exploreSystem: 'EXPLORER LE SYSTÈME', seeHowItWorks: 'VOIR COMMENT ÇA MARCHE' },
    pipeline: { eyebrow: 'COMMENT ÇA MARCHE', title: 'Du signal musculaire à la voix', description: 'BoneTalk interprète l’activité musculaire naturelle et transforme votre intention en parole en temps réel.' },
    worldwide: { titleLine1: 'CONÇU POUR UNE VOIX.', titleLine2: 'PENSIÉ POUR LE MONDE.', description: 'La communication n’a pas de frontières. BoneTalk aide les gens à communiquer au-delà des langues et des cultures.' },
  }),
  de: createTranslation({
    nav: { technology: 'Technologie', howItWorks: 'Funktionsweise', ai: 'KI', hardware: 'Hardware', worldwide: 'Weltweit', vision: 'Vision', experience: 'BONETALK ERLEBEN' },
    hero: { eyebrow: 'NEUROTECHNOLOGIE FÜR DEN NACKEN / 2026', line1: 'DER KÖRPER', line2: 'HAT EINE STIMME.', description: 'BoneTalk ist ein Nackengerät, das Muskelaktivität in verständliche Sprache umwandelt.', getStarted: 'JETZT STARTEN', exploreSystem: 'SYSTEM ENTDECKEN', seeHowItWorks: 'FUNKTIONSWEISE SEHEN' },
    pipeline: { eyebrow: 'FUNKTIONSWEISE', title: 'Vom Muskelsignal zur Stimme', description: 'BoneTalk übersetzt Muskelaktivität in Echtzeit in gesprochene Worte.' },
    worldwide: { titleLine1: 'FÜR EINE STIMME GEBAUT.', titleLine2: 'FÜR DIE WELT ENTWICKELT.', description: 'Kommunikation kennt keine Grenzen. BoneTalk verbindet Menschen über Sprachen und Kulturen hinweg.' },
  }),
  ar: createTranslation({
    nav: { technology: 'التكنولوجيا', howItWorks: 'كيف يعمل', ai: 'الذكاء الاصطناعي', hardware: 'الأجهزة', worldwide: 'العالمية', vision: 'الرؤية', experience: 'تجربة بونتوك' },
    hero: { eyebrow: 'تكنولوجيا الأعصاب المساعدة للرقبة / 2026', line1: 'للجسم', line2: 'صوت يعبر عنه.', description: 'بونتوك جهاز مساعد يرتدى على الرقبة يحول النشاط العضلي إلى كلام واضح ومفهوم.', getStarted: 'ابدأ الآن', exploreSystem: 'استكشف النظام', seeHowItWorks: 'شاهد كيف يعمل' },
    pipeline: { eyebrow: 'كيف يعمل', title: 'من الإشارة العضلية إلى الصوت', description: 'يقوم بونتوك بتحويل إشارات العضلات إلى كلمات منطوقة في الوقت الفعلي.' },
    worldwide: { titleLine1: 'صُمم لصوت واحد.', titleLine2: 'بُني للعالم أجمع.', description: 'التواصل لا يعرف الحدود. بونتوك يربط البشر عبر اللغات والثقافات.' },
  }),
  zh: createTranslation({
    nav: { technology: '技术', howItWorks: '工作原理', ai: '人工智能', hardware: '硬件', worldwide: '全球分布', vision: '愿景', experience: '体验 BONETALK' },
    hero: { eyebrow: '颈戴式辅助神经技术 / 2026', line1: '身体', line2: '也有声音。', description: 'BoneTalk 是一款颈戴式辅助设备，利用肌电信号与嵌入式 AI 将肌肉活动转化为清晰的语音。', getStarted: '立即开始', exploreSystem: '探索系统', seeHowItWorks: '了解工作原理' },
    pipeline: { eyebrow: '工作原理', title: '从肌肉信号到声音', description: 'BoneTalk 实时将自然肌肉活动转化为有意义的语言。' },
    worldwide: { titleLine1: '为发声而生。', titleLine2: '为世界而设计。', description: '沟通没有国界。BoneTalk 致力于跨越语言与文化，让每个人拥有表达的力量。' },
  }),
  ja: createTranslation({
    nav: { technology: 'テクノロジー', howItWorks: '仕組み', ai: 'AI', hardware: 'ハードウェア', worldwide: '世界展開', vision: 'ビジョン', experience: 'BONETALKを体験' },
    hero: { eyebrow: '首装着型支援ニューロテクノロジー / 2026', line1: '身体には', line2: '声がある。', description: 'BoneTalkは、筋肉の動きを明確な音声に変換する首装着型の支援デバイスです。', getStarted: '今すぐ始める', exploreSystem: 'システムを見る', seeHowItWorks: '仕組みを見る' },
    pipeline: { eyebrow: '仕組み', title: '筋 signals から音声へ', description: 'BoneTalkは筋肉活動をリアルタイムで自然な話し言葉に変換します。' },
    worldwide: { titleLine1: 'ひとつの声のために。', titleLine2: '世界のために設計。', description: 'コミュニケーションに国境はありません。BoneTalkは言葉や文化を超えて人々をつなぎます。' },
  }),
  ko: createTranslation({
    nav: { technology: '기술', howItWorks: '작동 원리', ai: '인공지능', hardware: '하드웨어', worldwide: '글로벌', vision: '비전', experience: 'BONETALK 체험하기' },
    hero: { eyebrow: '목 착용형 보조 신경 기술 / 2026', line1: '몸에는', line2: '목소리가 있습니다.', description: 'BoneTalk은 근육 신호를 명확한 음성으로 변환하는 목 착용형 보조 디바이스입니다.', getStarted: '시작하기', exploreSystem: '시스템 탐색', seeHowItWorks: '작동 원리 보기' },
    pipeline: { eyebrow: '작동 원리', title: '근육 신호에서 음성으로', description: 'BoneTalk은 실시간으로 자연스러운 근육 활동을 음성 언어로 변환합니다.' },
    worldwide: { titleLine1: '하나의 목소리를 위해.', titleLine2: '전 세계를 위해 설계되었습니다.', description: '소통에는 경계가 없습니다. BoneTalk은 언어와 문화를 넘어 의사소통을 돕습니다.' },
  }),
  gu: createTranslation({
    nav: { technology: 'ટેકનોલોજી', howItWorks: 'કેવી રીતે કામ કરે છે', ai: 'AI', hardware: 'હાર્ડવેર', worldwide: 'વૈશ્વિક', vision: 'દ્રષ્ટિકોણ', experience: 'બોનટોક અનુભવો' },
    hero: { eyebrow: 'ગળામાં પહેરાતી ન્યુરોટેકનોલોજી / 2026', line1: 'શરીર પાસે', line2: 'એક અવાજ છે.', description: 'બોનટોક ગળામાં પહેરાતું સાધન છે જે સ્નાયુઓની પ્રવૃત્તિને સ્પષ્ટ અવાજમાં રૂપાંતરિત કરે છે.', getStarted: 'શરૂ કરો', exploreSystem: 'સિસ્ટમ જુઓ', seeHowItWorks: 'કામગીરી જુઓ' },
  }),
  kn: createTranslation({
    nav: { technology: 'ತಂತ್ರಜ್ಞಾನ', howItWorks: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', ai: 'AI', hardware: 'ಹಾರ್ಡ್‌ವೇರ್', worldwide: 'ಜಾಗತಿಕ', vision: 'ದೃಷ್ಟಿಕೋನ', experience: 'ಬೋನ್ ಟಾಕ್ ಅನುಭವಿಸಿ' },
    hero: { eyebrow: 'ಕುತ್ತಿಗೆಗೆ ಧರಿಸುವ ನ್ಯೂರೋ ತಂತ್ರಜ್ಞಾನ / 2026', line1: 'ದೇಹಕ್ಕೆ', line2: 'ಒಂದು ಧ್ವನಿಯಿದೆ.', description: 'ಬೋನ್ ಟಾಕ್ ಕುತ್ತಿಗೆಗೆ ಧರಿಸುವ ಸಾಧನವಾಗಿದ್ದು, ಸ್ನಾಯುಗಳ ಚಟುವಟಿಕೆಯನ್ನು ಸ್ಪಷ್ಟ ಮಾತನ್ನಾಗಿ ಪರಿವರ್ತಿಸುತ್ತದೆ.', getStarted: 'ಪ್ರಾರಂಭಿಸಿ', exploreSystem: 'ವ್ಯವಸ್ಥೆ ಪರಿಶೀಲಿಸಿ', seeHowItWorks: 'ಕಾರ್ಯವಿಧಾನ ನೋಡಿ' },
  }),
  ml: createTranslation({
    nav: { technology: 'സാങ്കേതികവിദ്യ', howItWorks: 'പ്രവർത്തനം', ai: 'എഐ', hardware: 'ഹാർഡ്‌വെയർ', worldwide: 'ആഗോള', vision: 'വിഷൻ', experience: 'ബോൺടോക്ക് അനുഭവിക്കുക' },
    hero: { eyebrow: 'കഴുത്തിൽ ധരിക്കുന്ന ന്യൂറോസാങ്കേതികവിദ്യ / 2026', line1: 'ശരീരത്തിന്', line2: 'ഒരു ശബ്ദമുണ്ട്.', description: 'പേശികളുടെ ചലനത്തെ വ്യക്തമായ ശബ്ദമാക്കി മാറ്റുന്ന ഉപകരണമാണ് ബോൺടോക്ക്.', getStarted: 'തുടങ്ങുക', exploreSystem: 'സിസ്റ്റം കാണുക', seeHowItWorks: 'പ്രവർത്തനം കാണുക' },
  }),
  mr: createTranslation({
    nav: { technology: 'तंत्रज्ञान', howItWorks: 'हे कसे कार्य करते', ai: 'एआय', hardware: 'हार्डवेअर', worldwide: 'जागतिक', vision: 'दृष्टिकोन', experience: 'बोनाटॉक अनुभवा' },
    hero: { eyebrow: 'मानमध्ये परिधान करण्याचे न्यूरोतंत्रज्ञान / २०२६', line1: 'शरीराला', line2: 'एक आवाज आहे.', description: 'बोनटॉक हे मानात घातले जाणारे उपकरण आहे जे स्नायूंच्या हालचालींचे स्पष्ट आवाजात रूपांतर करते.', getStarted: 'सुरू करा', exploreSystem: 'सिस्टम पहा', seeHowItWorks: 'कार्यपद्धती पहा' },
  }),
  ta: createTranslation({
    nav: { technology: 'தொழில்நுட்பம்', howItWorks: 'செயல்பாடு', ai: 'செயற்கை நுண்ணறிவு', hardware: 'ஹார்டுவேர்', worldwide: 'உலகளாவிய', vision: 'பார்வை', experience: 'போன்டாக் அனுபவியுங்கள்' },
    hero: { eyebrow: 'கழுத்தில் அணியும் நிய黙ரோ தொழில்நுட்பம் / 2026', line1: 'உடலுக்கு', line2: 'ஒரு குரல் உள்ளது.', description: 'போன்டாக் தசை இயக்கங்களை தெளிவான பேச்சாக மாற்றும் ஒரு அதிநவீன கருவியாகும்.', getStarted: 'தொடங்குங்கள்', exploreSystem: 'அமைப்பை பார்க்க', seeHowItWorks: 'செயல்முறை பார்க்க' },
  }),
  te: createTranslation({
    nav: { technology: 'సాంకేతికత', howItWorks: 'ఎలా పనిచేస్తుంది', ai: 'AI', hardware: 'హార్డ్‌వేర్', worldwide: 'ప్రపంచవ్యాప్తంగా', vision: 'విజన్', experience: 'బోన్‌టాక్ అనుభవించండి' },
    hero: { eyebrow: 'మెడకు ధరించే న్యూరో సాంకేతికత / 2026', line1: 'శరీరానికి', line2: 'ఒక స్వరం ఉంది.', description: 'బోన్‌టాక్ కండరాల కదలికలను స్పష్టమైన మాటలుగా మార్చే ఒక అధునాతన పరికరం.', getStarted: 'ప్రారంభించండి', exploreSystem: 'వ్యవస్థను చూడండి', seeHowItWorks: 'పనితీరు చూడండి' },
  }),
  pa: createTranslation({
    nav: { technology: 'ਤਕਨਾਲੋਜੀ', howItWorks: 'ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ', ai: 'AI', hardware: 'ਹਾਰਡਵੇਅਰ', worldwide: 'ਵਿਸ਼ਵਵਿਆਪੀ', vision: 'ਦ੍ਰਿਸ਼ਟੀਕੋਣ', experience: 'ਬੋਨਟਾਕ ਦਾ ਅਨੁਭਵ ਕਰੋ' },
    hero: { eyebrow: 'ਗਰਦਨ ਵਿੱਚ ਪਹਿਨਣ ਵਾਲੀ ਤਕਨਾਲੋਜੀ / 2026', line1: 'ਸਰੀਰ ਦੀ', line2: 'ਇੱਕ ਆਵਾਜ਼ ਹੈ।', description: 'ਬੋਨਟਾਕ ਮਾਸਪੇਸ਼ੀਆਂ ਦੀ ਗਤੀਵਿਧੀ ਨੂੰ ਸਪੱਸ਼ਟ ਆਵਾਜ਼ ਵਿੱਚ ਬਦਲਣ ਵਾਲਾ ਇੱਕ ਸਾਧਨ ਹੈ।', getStarted: 'ਸ਼ੁਰੂ ਕਰੋ', exploreSystem: 'ਸਿਸਟਮ ਵੇਖੋ', seeHowItWorks: 'ਕੰਮ ਵੇਖੋ' },
  }),
  ur: createTranslation({
    nav: { technology: 'ٹیکنالوجی', howItWorks: 'یہ کیسے کام کرتا ہے', ai: 'مصنوئی ذہانت', hardware: 'ہارڈ ویئر', worldwide: 'عالمگیر', vision: 'وژن', experience: 'بون ٹاک کا تجربہ کریں' },
    hero: { eyebrow: 'گردن میں پہنی جانے والی نیورو ٹیکنالوجی / 2026', line1: 'جسم کے پاس', line2: 'ایک آواز ہے۔', description: 'بون ٹاک ایک جدید آلہ ہے جو عضلاتی سرگرمی کو واضح گفتگو میں تبدیل کرتا ہے۔', getStarted: 'شروع کریں', exploreSystem: 'سسٹم دیکھیں', seeHowItWorks: 'طریقہ کار دیکھیں' },
  }),
  or: createTranslation({
    nav: { technology: 'ପ୍ରଯୁକ୍ତିବିଦ୍ୟା', howItWorks: 'କିପରି କାର୍ଯ୍ୟ କରେ', ai: 'AI', hardware: 'ହାର୍ଡୱେର୍', worldwide: 'ବିଶ୍ୱବ୍ୟାପୀ', vision: 'ଦୃଷ୍ଟିକୋଣ', experience: 'ବୋନଟକ୍ ଅନୁଭବ କରନ୍ତୁ' },
    hero: { eyebrow: 'ବେକରେ ପିନ୍ଧାଯାଉଥିବା ନ୍ୟୁରୋ ପ୍ରଯୁକ୍ତିବିଦ୍ୟା / ୨୦୨୬', line1: 'ଶରୀରର', line2: 'ଏକ ସ୍ୱର ଅଛି।', description: 'ବୋନଟକ୍ ମାଂସପେଶୀର କାର୍ଯ୍ୟକଳାପକୁ ସ୍ପଷ୍ଟ ସ୍ୱରରେ ରୂପାନ୍ତରିତ କରିଥାଏ।', getStarted: 'ଆରମ୍ଭ କରନ୍ତୁ', exploreSystem: 'ସିଷ୍ଟମ ଦେଖନ୍ତୁ', seeHowItWorks: 'କାର୍ଯ୍ୟପ୍ରଣାଳୀ ଦେଖନ୍ତୁ' },
  }),
  as: createTranslation({
    nav: { technology: 'প্ৰযুক্তি', howItWorks: 'ই কেনেদৰে কাম কৰে', ai: 'এআই', hardware: 'হাৰ্ডৱেৰ', worldwide: 'বিশ্বব্যাপী', vision: 'দৃষ্টিভংগী', experience: 'বোনটক অনুভৱ কৰক' },
    hero: { eyebrow: 'ডিঙিত পৰা নিউৰ’প্ৰযুক্তি / ২০২৬', line1: 'শৰীৰৰো', line2: 'এটা মাত আছে।', description: 'বোনটক এবিধ ডিঙিত পিন্ধা সঁজুলি যিয়ে পেশীৰ ক্ৰিয়াকলাপক স্পষ্ট মাতলৈ ৰূপান্তৰ কৰে।', getStarted: 'আৰম্ভ কৰক', exploreSystem: 'চিষ্টেম চাওক', seeHowItWorks: 'কাম কৰা প্ৰক্ৰিয়া চাওক' },
  }),
  ks: createTranslation({
    nav: { technology: 'تکنالوجی', howItWorks: 'کِتھ کَن چُھ کام کَران', ai: 'اے آئی', hardware: 'ہارڈویئر', worldwide: 'عالمی', vision: 'وژن', experience: 'بون ٹاک تچربہ کَریو' },
    hero: { eyebrow: 'گردنہِ پیٹھ لاگنہٕ ینی واجیٚل تکنالوجی / 2026', line1: 'جسمَس چُھ', line2: 'اَکھ آواز۔', description: 'بون ٹاک چُھ پٹھن ہنزِ حرکژہِ صاف کلامَس منز بَڈلاوان۔', getStarted: 'شروع کَریو', exploreSystem: 'سسٹم وچھیو', seeHowItWorks: 'طریقہ وچھیو' },
  }),
  mai: createTranslation({
    nav: { technology: 'तकनीक', howItWorks: 'ई कोना काज करैत अछि', ai: 'एआई', hardware: 'हार्डवेयर', worldwide: 'वैश्विक', vision: 'दृष्टिकोण', experience: 'बोनटॉक अनुभव करू' },
    hero: { eyebrow: 'गर्दनि मे पहिरल जाए वाला न्यूरो तकनीक / २०२६', line1: 'शरीर लग', line2: 'एकटा आवाज अछि।', description: 'बोनटॉक गर्दन मे पहिरल जाए वाला उपकरण अछि जे मांसपेशीक गतिविधि केँ आवाज मे बदलैत अछि।', getStarted: 'शुरू करू', exploreSystem: 'सिस्टम देखू', seeHowItWorks: 'काज देखू' },
  }),
  mni: createTranslation({
    nav: { technology: 'તકનીકી', howItWorks: 'કરામતી', ai: 'AI', hardware: 'હાર્ડવેર', worldwide: 'તાઈબંગપાન', vision: 'મંગલ', experience: 'બોનટોક અનુભવો' },
    hero: { eyebrow: 'ન્યુરોટેકનોલોજી / ૨૦૨૬', line1: 'હકચાંગગી', line2: 'ખોન્જેલ લૈયી', description: 'બોનટોક હકચાંગગી ખોન્જેલ ઓન્થોકપા પોટલમન્યુ.', getStarted: 'હોઉબિયુ', exploreSystem: 'યેન્ગબિયુ', seeHowItWorks: 'યેન્ગબિયુ' },
  }),
  ne: createTranslation({
    nav: { technology: 'प्रविधि', howItWorks: 'कसरी काम गर्छ', ai: 'एआई', hardware: 'हार्डवेयर', worldwide: 'विश्वव्यापी', vision: 'दृष्टिकोण', experience: 'बोनटक अनुभव गर्नुहोस्' },
    hero: { eyebrow: 'घाँटीमा लगाइने न्युरो प्रविधि / २०२६', line1: 'शरीरको', line2: 'एउटा आवाज छ।', description: 'बोनटक घाँटीमा लगाइने उपकरण हो जसले मांसपेशीको गतिविधि स्पष्ट बोलीमा बदल्छ।', getStarted: 'शुरू गर्नुहोस्', exploreSystem: 'प्रणाली हेर्नुहोस्', seeHowItWorks: 'काम हेर्नुहोस्' },
  }),
}
