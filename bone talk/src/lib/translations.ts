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
  story: {
    title1Line1: string
    title1Line2: string
    sub1: string
    emgLabel: string
    signalActive: string
    title2Line1: string
    title2Line2: string
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
    footerNote: string
    cmdSub: {
      yes: string
      no: string
      help: string
      water: string
    }
  }
  hardware: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    description: string
    specTitle: string
    hardwareParams: string
    clickToInspect: string
    processor: string
    vectorExt: string
    sramPsram: string
    power: string
    systemStatus: string
    emgSensor: string
    signalAcquisition: string
    esp32s3: string
    wirelessTelemetry: string
    aiModel: string
    signalState: string
    wirelessState: string
    aiProcessing: string
    specs: {
      emgTitle: string
      emgSummary: string
      emgElectrodes: string
      emgInputRange: string
      emgBandwidth: string
      emgImpedance: string
      afeTitle: string
      afeSummary: string
      afeAdcRes: string
      afeSamplingRate: string
      afeCmrr: string
      afeNoiseFloor: string
      mcuTitle: string
      mcuSummary: string
      mcuProcessor: string
      mcuVectorExt: string
      mcuSram: string
      mcuPower: string
      wirelessTitle: string
      wirelessSummary: string
      wirelessProtocol: string
      wirelessLatency: string
      wirelessRange: string
      wirelessSecurity: string
      aiTitle: string
      aiSummary: string
      aiModelSize: string
      aiInferenceSpeed: string
      aiFeatures: string
      aiAccuracy: string
    }
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
    titleLine1: string
    titleLine2: string
    description: string
    feature1Title: string
    feature1Desc: string
    feature2Title: string
    feature2Desc: string
    feature3Title: string
    feature3Desc: string
    steps: {
      s1: string
      s2: string
      s3: string
      s4: string
      s5: string
      s6: string
    }
  }
  worldwide: {
    eyebrow: string
    titleLine1: string
    titleLine2: string
    description: string
    totalSupported: string
    indianRegionalStat: string
    internationalStat: string
    totalLanguages: string
    indianRegional: string
    international: string
    mapTitle: string
    mapLatency: string
    statementTitle: string
    statementBody: string
    decentralizedTag: string
    globalSignalActive: string
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
  final: {
    r1Line1: string
    r1Line2: string
    r2Line1: string
    r2Line2: string
    subtitle: string
    coreActive: string
    signalFidelity: string
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
  systemStatus: {
    title: string
    website: string
    online: string
    aiEngine: string
    ready: string
    emgInterface: string
    engine3D: string
    languageEngine: string
    languages24: string
    globalAccess: string
    healthEndpoint: string
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
    experience: 'EXPERIENCE SAAKANTHA',
  },
  hero: {
    eyebrow: 'NECK-WORN ASSISTIVE NEUROTECHNOLOGY / 2026',
    line1: 'THE BODY',
    line2: 'HAS A VOICE.',
    description:
      'SAAKANTHA is a neck-worn assistive device that transforms muscle activity into meaningful speech using surface EMG sensing, embedded DSP, and TinyML AI.',
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
  story: {
    title1Line1: 'WHEN WORDS',
    title1Line2: 'CANNOT ESCAPE.',
    sub1: 'Communication should not depend on vocal chords.',
    emgLabel: 'EMG Signal Telemetry',
    signalActive: 'Signal Active',
    title2Line1: 'BUT MUSCLES',
    title2Line2: 'STILL SPEAK.',
  },
  pipeline: {
    eyebrow: 'HOW IT WORKS',
    title: 'From Muscle Signal to Voice',
    description:
      'SAAKANTHA interprets natural muscle activity and turns your intended message into spoken words — in real time.',
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
      'Sub-millivolt electrical telemetry captured directly from surface EMG electrodes. Click any command below to test real-time pattern matching.',
    oscilloscopeTitle: 'LIVE EMG OSCILLOSCOPE STREAM',
    hzRate: '1000 Hz Sampling',
    selectCommand: 'SELECT MUSCLE COMMAND TO SIMULATE',
    signalDetected: 'SIGNAL DETECTED',
    patternMatch: 'PATTERN MATCH',
    intentOutput: 'INTENT OUTPUT',
    latency: 'LATENCY',
    playVoiceBtn: 'PLAY SYNTHESIZED VOICE',
    footerNote: '⚡ Real-time neural inference powered by ESP32-S3 TinyML engine.',
    cmdSub: {
      yes: 'Single Flex (Extensor)',
      no: 'Double Twitch (Flexor)',
      help: 'Sustained Isometric Hold',
      water: 'Sequential Dual Burst',
    },
  },
  hardware: {
    eyebrow: 'PHYSICAL ARCHITECTURE',
    titleLine1: 'THE HARDWARE',
    titleLine2: 'BEHIND THE VOICE.',
    description:
      'Clinical-grade analog front-end integrated with edge TinyML compute on the ESP32-S3 silicon platform.',
    specTitle: 'TECHNICAL SPEC',
    hardwareParams: 'HARDWARE PARAMETERS',
    clickToInspect: 'Click elements in diagram to inspect sub-system',
    processor: 'Processor',
    vectorExt: 'Vector Extensions',
    sramPsram: 'SRAM / PSRAM',
    power: 'Power Consumption',
    systemStatus: 'SYSTEM STATUS',
    emgSensor: 'EMG SENSOR',
    signalAcquisition: 'ANALOG FRONT-END',
    esp32s3: 'ESP32-S3 POD',
    wirelessTelemetry: 'BLE / WI-FI TELEMETRY',
    aiModel: 'AI MODEL',
    signalState: 'SIMULATED',
    wirelessState: 'WIRELESS',
    aiProcessing: 'AI PROCESSING',
    specs: {
      emgTitle: 'EMG Surface Sensor Array',
      emgSummary: 'Clinical-grade Ag/AgCl differential surface electrode array measuring biopotential muscle activity with low contact impedance.',
      emgElectrodes: 'Electrodes',
      emgInputRange: 'Input Range',
      emgBandwidth: 'Bandwidth',
      emgImpedance: 'Impedance',
      afeTitle: 'Analog Front-End (AFE)',
      afeSummary: 'Ultra-low-noise instrumental amplifier with programmable gain (PGA) and integrated 24-bit delta-sigma ADC.',
      afeAdcRes: 'ADC Resolution',
      afeSamplingRate: 'Sampling Rate',
      afeCmrr: 'CMRR',
      afeNoiseFloor: 'Noise Floor',
      mcuTitle: 'ESP32-S3 Microcontroller',
      mcuSummary: '32-bit Xtensa dual-core LX7 microcontroller running at 240 MHz with vector instructions for TinyML inference.',
      mcuProcessor: 'Processor',
      mcuVectorExt: 'Vector Extensions',
      mcuSram: 'SRAM / PSRAM',
      mcuPower: 'Power Consumption',
      wirelessTitle: 'Wireless Telemetry System',
      wirelessSummary: 'Ultra-low latency Bluetooth 5.0 Low Energy (BLE) and 2.4 GHz Wi-Fi transceivers for continuous real-time streaming.',
      wirelessProtocol: 'Protocol',
      wirelessLatency: 'Latency',
      wirelessRange: 'Range',
      wirelessSecurity: 'Security',
      aiTitle: 'On-Device TinyML Classifier',
      aiSummary: 'Quantized neural network model executing real-time feature extraction and gesture pattern classification on embedded hardware.',
      aiModelSize: 'Model Size',
      aiInferenceSpeed: 'Inference Speed',
      aiFeatures: 'Features',
      aiAccuracy: 'Accuracy',
    },
  },
  teach: {
    eyebrow: 'ADAPTIVE NEURAL PERSONALIZATION',
    titleLine1: 'TEACH IT',
    titleLine2: 'YOUR LANGUAGE.',
    description:
      'Every user has a distinct neuromuscular signature. SAAKANTHA calibrates its machine learning pipeline to your specific muscle gestures in under 60 seconds — and transforms them into clear, audible speech.',
    activeVocab: 'Active Trained Vocabulary',
    clickToPlay: 'Click to inspect & play voice',
    calibrationTitle: 'Gesture Calibration Suite',
    calibrationDesc: 'Teach SAAKANTHA a custom phrase by recording 3 muscle contraction trials.',
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
    titleLine1: 'FROM SIGNAL',
    titleLine2: 'TO INTENT.',
    description:
      'Direct digital signal processing eliminates ambiguity. Raw microvolt fluctuations pass through digital bandpass filtering, statistical feature extraction, and TinyML neural classification.',
    feature1Title: '96.4% Accuracy',
    feature1Desc: 'High confidence classification even under muscle fatigue or motion noise.',
    feature2Title: '< 12.4ms Latency',
    feature2Desc: 'Ultra-low latency inference executing on onboard ESP32-S3 vector hardware.',
    feature3Title: 'Zero Cloud Dependency',
    feature3Desc: '100% private on-device execution with total user data privacy.',
    steps: {
      s1: 'RAW EMG SIGNAL',
      s2: 'BANDPASS FILTER',
      s3: 'FEATURE EXTRACTION',
      s4: 'PATTERN RECOGNITION',
      s5: 'NEURAL CLASSIFIER',
      s6: 'INTENT OUTPUT',
    },
  },
  worldwide: {
    eyebrow: 'GLOBAL ACCESSIBILITY & IMPACT',
    titleLine1: 'BUILT FOR ONE VOICE.',
    titleLine2: 'DESIGNED FOR THE WORLD.',
    description:
      'Communication has no borders. SAAKANTHA is designed to help people communicate across languages, regions, and cultures — transforming muscle signals into meaningful words and speech wherever they are.',
    totalSupported: 'TOTAL SUPPORTED',
    indianRegionalStat: 'INDIAN REGIONAL',
    internationalStat: 'INTERNATIONAL',
    totalLanguages: 'Global Languages',
    indianRegional: 'Regional Languages',
    international: 'International Languages',
    mapTitle: 'WORLDWIDE BIOPOTENTIAL MAP',
    mapLatency: 'TRANSLATION LATENCY < 15 MS',
    statementTitle: 'ONE SIGNAL. MANY LANGUAGES. ONE HUMAN VOICE.',
    statementBody:
      'From local communication to global connection, SAAKANTHA is built to make assistive communication accessible across the world — giving every individual the power to express themselves naturally.',
    decentralizedTag: 'DECENTRALIZED SPEECH SYNTHESIS',
    globalSignalActive: 'GLOBAL SIGNAL ACTIVE',
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
  final: {
    r1Line1: 'WHEN THE VOICE',
    r1Line2: 'IS SILENT,',
    r2Line1: 'COMMUNICATION',
    r2Line2: "DOESN'T HAVE TO BE.",
    subtitle: 'AI-Powered Assistive Communication System',
    coreActive: 'SAAKANTHA Core Active',
    signalFidelity: '100% Signal Fidelity',
  },
  footer: {
    readyToExperience: 'READY TO EXPERIENCE SAAKANTHA?',
    ctaTitle: 'RESTORE EXPRESSION. RECLAIM DIGNITY.',
    ctaDesc: 'Built with clinical precision for individuals with speech and motor impairments.',
    experienceBtn: 'EXPERIENCE SYSTEM DEMO',
    documentationBtn: 'READ ENGINEERING DATASHEET',
    copyright: '© 2026 SAAKANTHA Systems Inc. All rights reserved.',
    tagline: 'Neuromuscular Assistive Interface System',
  },
  systemStatus: {
    title: 'SAAKANTHA SYSTEM STATUS',
    website: 'WEBSITE',
    online: 'ONLINE',
    aiEngine: 'AI ENGINE',
    ready: 'READY',
    emgInterface: 'EMG INTERFACE',
    engine3D: '3D ENGINE',
    languageEngine: 'LANGUAGE ENGINE',
    languages24: '24 LANGUAGES',
    globalAccess: 'GLOBAL ACCESS',
    healthEndpoint: 'HEALTH API',
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
    story: { ...en.story, ...(override.story || {}) },
    pipeline: {
      ...en.pipeline,
      ...(override.pipeline || {}),
      steps: { ...en.pipeline.steps, ...(override.pipeline?.steps || {}) },
    },
    signal: {
      ...en.signal,
      ...(override.signal || {}),
      cmdSub: { ...en.signal.cmdSub, ...(override.signal?.cmdSub || {}) },
    },
    hardware: {
      ...en.hardware,
      ...(override.hardware || {}),
      specs: { ...en.hardware.specs, ...(override.hardware?.specs || {}) },
    },
    teach: { ...en.teach, ...(override.teach || {}) },
    voicePanel: { ...en.voicePanel, ...(override.voicePanel || {}) },
    ai: {
      ...en.ai,
      ...(override.ai || {}),
      steps: { ...en.ai.steps, ...(override.ai?.steps || {}) },
    },
    worldwide: { ...en.worldwide, ...(override.worldwide || {}) },
    human: { ...en.human, ...(override.human || {}) },
    final: { ...en.final, ...(override.final || {}) },
    footer: { ...en.footer, ...(override.footer || {}) },
    systemStatus: { ...en.systemStatus, ...(override.systemStatus || {}) },
  } as TranslationSchema
}

// ─── 24 FULL LOCALIZED TRANSLATIONS DICTIONARY ──────────────────────────────
export const TRANSLATIONS: Record<string, TranslationSchema> = {
  en,
  hi: createTranslation({
    nav: { technology: 'तकनीक', howItWorks: 'यह कैसे काम करता है', ai: 'एआई', hardware: 'हार्डवेयर', worldwide: 'वैश्विक', vision: 'दृष्टिकोण', experience: 'SAAKANTHA का अनुभव करें' },
    hero: {
      eyebrow: 'गले में पहनी जाने वाली सहायक तंत्रिका तकनीक / 2026',
      line1: 'शरीर के पास',
      line2: 'एक आवाज़ है।',
      description: 'SAAKANTHA एक गले में पहना जाने वाला सहायक उपकरण है जो मांसपेशियों की गतिविधि को स्पष्ट और सार्थक बोली में परिवर्तित करता है।',
      getStarted: 'शुरू करें',
      exploreSystem: 'सिस्टम देखें',
      seeHowItWorks: 'देखें कैसे काम करता है',
      annotations: {
        emgLabel: 'EMG सेंसर',
        emgSub: 'बायोपोटेंशियल इलेक्ट्रोड',
        aiLabel: 'AI पहचान',
        aiSub: 'इशारा वर्गीकरण',
        signalLabel: 'मांसपेशी संकेत',
        signalSub: 'गर्दन मांसपेशी गतिविधि',
        voiceLabel: 'आवाज़ आउटपुट',
        voiceSub: 'रियल-टाइम स्पीच इंजन',
        esp32Label: 'ESP32-S3 पॉड',
        esp32Sub: '240MHz TinyML DSP',
      },
    },
    story: {
      title1Line1: 'जब शब्द',
      title1Line2: 'बाहर नहीं आ पाते।',
      sub1: 'संचार केवल वोकल कॉर्ड पर निर्भर नहीं होना चाहिए।',
      emgLabel: 'EMG सिग्नल टेलीमेट्री',
      signalActive: 'सिग्नल सक्रिय',
      title2Line1: 'लेकिन मांसपेशियां',
      title2Line2: 'अब भी बोलती हैं।',
    },
    signal: {
      eyebrow: 'वास्तविक समय संपर्क',
      title: 'सिग्नल पढ़ना',
      description: 'सतह EMG इलेक्ट्रोड से सीधे प्राप्त विद्युत डेटा। वास्तविक समय पैटर्न मिलान के लिए नीचे दिए गए किसी भी आदेश पर क्लिक करें।',
      oscilloscopeTitle: 'लाइव EMG ऑसिलोस्कोप स्ट्रीम',
      selectCommand: 'सिमुलेट करने के लिए मांसपेशी कमांड चुनें',
      signalDetected: 'सिग्नल पता चला',
      patternMatch: 'पैटर्न मैच',
      intentOutput: 'इरादा आउटपुट',
      latency: 'विलंबता',
      playVoiceBtn: 'आवाज़ बजाएं',
      footerNote: '⚡ ESP32-S3 TinyML इंजन द्वारा संचालित वास्तविक समय तंत्रिका निष्पादन।',
      cmdSub: {
        yes: 'सिंगल फ्लेक्स (एक्सटेंसर)',
        no: 'डबल ट्विच (फ्लेक्सॉर)',
        help: 'निरंतर आइसोमेट्रिक होल्ड',
        water: 'क्रमिक डुअल बर्स्ट',
      },
    },
    hardware: {
      eyebrow: 'भौतिक वास्तुकला',
      titleLine1: 'आवाज़ के पीछे',
      titleLine2: 'हार्डवेयर।',
      description: 'ESP32-S3 सिलिकॉन प्लेटफॉर्म पर एज TinyML कंप्यूट के साथ एकीकृत क्लिनिकल-ग्रेड एनालॉग फ्रंट-एंड।',
      specTitle: 'तकनीकी विवरण',
      hardwareParams: 'हार्डवेयर पैरामीटर',
      clickToInspect: 'उप-प्रणाली का निरीक्षण करने के लिए आरेख में तत्वों पर क्लिक करें',
      processor: 'प्रोसेसर',
      vectorExt: 'वेक्टर एक्सटेंशन',
      sramPsram: 'SRAM / PSRAM',
      power: 'बिजली की खपत',
      emgSensor: 'EMG सेंसर',
      signalAcquisition: 'एनालॉग फ्रंट-एंड',
      esp32s3: 'ESP32-S3 पॉड',
      wirelessTelemetry: 'वायरलेस टेलीमेट्री',
      aiProcessing: 'AI प्रोसेसिंग',
      specs: {
        emgTitle: 'EMG सरफेस सेंसर ऐरे',
        emgSummary: 'कम संपर्क प्रतिबाधा के साथ बायोपोटेंशियल मांसपेशी गतिविधि को मापने वाला क्लिनिकल-ग्रेड इलेक्ट्रोड ऐरे।',
        emgElectrodes: 'इलेक्ट्रोड',
        emgInputRange: 'इनपुट रेंज',
        emgBandwidth: 'बैंडविड्थ',
        emgImpedance: 'प्रतिबाधा',
        afeTitle: 'एनालॉग फ्रंट-एंड (AFE)',
        afeSummary: 'प्रोग्राम करने योग्य लाभ और एकीकृत 24-बिट डेल्टा-सिग्मा ADC के साथ कम शोर वाला एम्पलीफायर।',
        afeAdcRes: 'ADC रिज़ॉल्यूशन',
        afeSamplingRate: 'सैंपलिंग दर',
        afeCmrr: 'CMRR',
        afeNoiseFloor: 'नॉइज़ फ़्लोर',
        mcuTitle: 'ESP32-S3 माइक्रोकंट्रोलर',
        mcuSummary: 'TinyML अनुमान के लिए वेक्टर निर्देशों के साथ 240 मेगाहर्ट्ज पर चलने वाला 32-बिट डुअल-कोर माइक्रोकंट्रोलर।',
        mcuProcessor: 'प्रोसेसर',
        mcuVectorExt: 'वेक्टर एक्सटेंशन',
        mcuSram: 'SRAM / PSRAM',
        mcuPower: 'बिजली की खपत',
        wirelessTitle: 'वायरलेस टेलीमेट्री सिस्टम',
        wirelessSummary: 'निरंतर वास्तविक समय स्ट्रीमिंग के लिए कम विलंबता ब्लूटूथ 5.0 और वाई-फाई।',
        wirelessProtocol: 'प्रोटोकॉल',
        wirelessLatency: 'विलंबता',
        wirelessRange: 'रेंज',
        wirelessSecurity: 'सुरक्षा',
        aiTitle: 'ऑन-डिवाइस TinyML क्लासिफायर',
        aiSummary: 'एंबेडेड हार्डवेयर पर वास्तविक समय फीचर निष्कर्षण और पैटर्न वर्गीकरण निष्पादित करने वाला तंत्रिका नेटवर्क।',
        aiModelSize: 'मॉडल का आकार',
        aiInferenceSpeed: 'अनुमान गति',
        aiFeatures: 'सुविधाएं',
        aiAccuracy: 'सटीकता',
      },
    },
    teach: {
      eyebrow: 'अनुकूली तंत्रिका वैयक्तीकरण',
      titleLine1: 'इसे अपनी भाषा',
      titleLine2: 'सिखाएं।',
      description: 'प्रत्येक उपयोगकर्ता का एक विशिष्ट तंत्रिका-मांसपेशी हस्ताक्षर होता है। SAAKANTHA 60 सेकंड से भी कम समय में आपकी मांसपेशियों के इशारों को सीखता है।',
      activeVocab: 'सक्रिय प्रशिक्षित शब्दावली',
      clickToPlay: 'आवाज़ सुनने के लिए क्लिक करें',
      calibrationTitle: 'इशारा अंशांकन सूट',
      calibrationDesc: '3 मांसपेशी संकुचन परीक्षणों को रिकॉर्ड करके SAAKANTHA को एक कस्टम वाक्यांश सिखाएं।',
      trainHi: 'प्रशिक्षित करें "हाय"',
      trainWater: 'प्रशिक्षित करें "मुझे पानी चाहिए"',
      enterCustom: 'कस्टम वाक्यांश दर्ज करें...',
      trainBtn: 'प्रशिक्षित करें',
      targetCmd: 'लक्ष्य कमांड',
      capturing: 'सिग्नल रिकॉर्ड हो रहा है...',
      trialProgress: 'परीक्षण जारी है',
      learnedStatus: 'पैटर्न सीखा गया ✓',
      performContraction: 'मांसपेशी संकुचन करें',
      calibratedCheck: 'कैलिब्रेटेड ✓',
      aiConfidence: 'AI सटीकता',
      trainAnother: 'दूसरा कमांड प्रशिक्षित करें →',
      t1Name: 'एक्सटेंसर फ्लेक्स',
      t2Name: 'फ्लेक्सॉर होल्ड',
      t3Name: 'पीक बर्स्ट',
    },
    voicePanel: {
      engineTitle: 'आवाज़ आउटपुट इंजन',
      voiceConfigBtn: 'आवाज़ सेटिंग्स',
      trainedCmdLabel: 'प्रशिक्षित कमांड',
      aiConfidenceLabel: 'AI सटीकता',
      readyBadge: 'तैयार',
      speechParams: 'वाणी पैरामीटर',
      synthesisVoice: 'संश्लेषण आवाज़',
      speedRate: 'गति दर',
      pitch: 'पिच',
      volume: 'मात्रा',
      testVoiceBtn: 'आवाज़ कॉन्फ़िगरेशन का परीक्षण करें',
      playVoiceBtn: 'आवाज़ चलाएं',
      speakingState: 'बोल रहा है...',
      unavailableState: 'आवाज़ आउटपुट अनुपलब्ध',
      synthesizingMsg: 'वाणी ऑडियो का संश्लेषण किया जा रहा है',
      commandSpokenMsg: '✓ कमांड बोला गया',
      speechReadyMsg: 'वाणी तैयार है — ऑडियो चलाने के लिए क्लिक करें',
      unsupportedMsg: 'इस ब्राउज़र में वाणी संश्लेषण समर्थित नहीं है।',
    },
    ai: {
      eyebrow: 'एंबेडेड बुद्धिमत्ता',
      titleLine1: 'सिग्नल से',
      titleLine2: 'इरादे तक।',
      description: 'सीधा डिजिटल सिग्नल प्रोसेसिंग अस्पष्टता को समाप्त करता है।',
      steps: {
        s1: 'रॉ EMG सिग्नल',
        s2: 'डिजिटल फ़िल्टर',
        s3: 'फीचर निष्कर्षण',
        s4: 'पैटर्न पहचान',
        s5: 'न्यूरल क्लासिफायर',
        s6: 'इरादा आउटपुट',
      },
    },
    pipeline: { eyebrow: 'यह कैसे काम करता है', title: 'मांसपेशियों के संकेत से आवाज़ तक', description: 'SAAKANTHA प्राकृतिक मांसपेशियों की गतिविधि को वास्तविक समय में बोली जाने वाली भाषा में बदलता है।' },
    worldwide: {
      eyebrow: 'वैश्विक पहुंच और प्रभाव',
      titleLine1: 'एक आवाज़ के लिए निर्मित।',
      titleLine2: 'पूरी दुनिया के लिए डिज़ाइन किया गया।',
      description: 'संचार की कोई सीमाएँ नहीं होतीं। SAAKANTHA लोगों को भाषाओं, क्षेत्रों और संस्कृतियों के पार संवाद करने में मदद करता है।',
      totalSupported: 'कुल समर्थित',
      indianRegionalStat: 'भारतीय क्षेत्रीय',
      internationalStat: 'अंतर्राष्ट्रीय',
      totalLanguages: 'वैश्विक भाषाएं',
      indianRegional: 'क्षेत्रीय भाषाएं',
      international: 'अंतर्राष्ट्रीय भाषाएं',
      mapTitle: 'विश्वव्यापी बायोपोटेंशियल मानचित्र',
      mapLatency: 'अनुवाद विलंबता < 15 एमएस',
      statementTitle: 'एक संकेत। कई भाषाएं। एक मानव आवाज़।',
      statementBody: 'स्थानीय संचार से लेकर वैश्विक संपर्क तक, SAAKANTHA को सहायक संचार को दुनिया भर में सुलभ बनाने के लिए बनाया गया है।',
      decentralizedTag: 'विकेंद्रीकृत वाणी संश्लेषण',
      globalSignalActive: 'वैश्विक सिग्नल सक्रिय',
      pLocal: 'स्थानीय',
      pRegional: 'क्षेत्रीय',
      pNational: 'राष्ट्रीय',
      pGlobal: 'वैश्विक',
    },
    human: { eyebrow: 'मानवीय उद्देश्य और गरिमा', line1: 'एक आवाज़', line2: 'ध्वनि से बढ़कर है।', subtitle: 'यह संवाद करने की जन्मजात मानवीय क्षमता है:' },
    final: { r1Line1: 'जब आवाज़', r1Line2: 'शांत हो जाती है,', r2Line1: 'तब भी संचार', r2Line2: 'रुकना नहीं चाहिए।', subtitle: 'AI-संचालित सहायक संचार प्रणाली', coreActive: 'SAAKANTHA कोर सक्रिय', signalFidelity: '100% सिग्नल सटीकता' },
  }),
  bn: createTranslation({
    nav: { technology: 'প্রযুক্তি', howItWorks: 'কীভাবে কাজ করে', ai: 'এআই', hardware: 'হার্ডওয়্যার', worldwide: 'বিশ্বব্যাপী', vision: 'ভিশন', experience: 'SAAKANTHA-এর অভিজ্ঞতা নিন' },
    hero: {
      eyebrow: 'গলায় পরার সহায়ক নিউরোটেকনোলজি / ২০২৬',
      line1: 'দেহেরও',
      line2: 'একটি স্বর আছে।',
      description: 'SAAKANTHA একটি গলায় পরা পরিধানযোগ্য ডিভাইস যা পেশীর কার্যকলাপকে স্পষ্ট বাক্যে রূপান্তরিত করে।',
      getStarted: 'শুরু করুন',
      exploreSystem: 'সিস্টেম দেখুন',
      seeHowItWorks: 'কীভাবে কাজ করে দেখুন',
      annotations: {
        emgLabel: 'EMG সেন্সর',
        emgSub: 'বায়োপটেনশিয়াল ইলেকট্রোড',
        aiLabel: 'AI সনাক্তকরণ',
        aiSub: 'ইঙ্গিত শ্রেণীকরণ',
        signalLabel: 'পেশীর সিগন্যাল',
        signalSub: 'ঘাড়ের পেশীর কার্যকলাপ',
        voiceLabel: 'ভয়েস আউটপুট',
        voiceSub: 'রিয়েল-টাইম স্পিচ ইঞ্জিন',
        esp32Label: 'ESP32-S3 পড',
        esp32Sub: '২৪০মেগাহার্টজ TinyML DSP',
      },
    },
    story: {
      title1Line1: 'যখন বাক্য',
      title1Line2: 'বের হতে পারে না।',
      sub1: 'যোগাযোগ শুধুমাত্র ভোকাল কর্ডের ওপর নির্ভর করা উচিত নয়।',
      emgLabel: 'EMG সিগন্যাল টেলিমেট্রি',
      signalActive: 'সিগন্যাল সক্রিয়',
      title2Line1: 'কিন্তু পেশীগুলো',
      title2Line2: 'এখনও কথা বলে।',
    },
    signal: {
      eyebrow: 'রিয়েল-টাইম ইন্টারেকশন',
      title: 'সিগন্যাল পাঠ করা',
      description: 'সারফেস EMG ইলেকট্রোড থেকে সংগৃহীত বায়োপটেনশিয়াল সিগন্যাল। প্যাটার্ন ম্যাচ টেস্ট করতে নিচের যেকোনো কমান্ড নির্বাচন করুন।',
      oscilloscopeTitle: 'লাইভ EMG অসিলোস্কোপ স্ট্রিম',
      selectCommand: 'পেশীর কমান্ড নির্বাচন করুন',
      signalDetected: 'সিগন্যাল শনাক্ত হয়েছে',
      patternMatch: 'প্যাটার্ন ম্যাচ',
      intentOutput: 'অভিপ্রায় আউটপুট',
      latency: 'লেটেন্সি',
      playVoiceBtn: 'কণ্ঠস্বর বাজান',
      footerNote: '⚡ ESP32-S3 TinyML ইঞ্জিন দ্বারা পরিচালিত রিয়েল-টাইম প্রসেসিং।',
      cmdSub: {
        yes: 'একক সংকোচন (এক্সটেনসর)',
        no: 'দ্বিগুণ ফ্লিক (ফ্লেক্সর)',
        help: 'দীর্ঘস্থায়ী আইসোমেট্রিক হোল্ড',
        water: 'পর্যায়ক্রমিক দ্বৈত সংকেত',
      },
    },
    hardware: {
      eyebrow: 'শারীরিক স্থাপত্য',
      titleLine1: 'কণ্ঠস্বরের নেপথ্যে',
      titleLine2: 'হার্ডওয়্যার।',
      description: 'ESP32-S3 সিলিকন প্ল্যাটফর্মে TinyML কম্পিউটের সাথে সমন্বিত ক্লিনিকাল-গ্রেড অ্যানালগ ফ্রন্ট-এন্ড।',
      specTitle: 'টেকনিক্যাল স্পেক',
      hardwareParams: 'হার্ডওয়্যার প্যারামিটার',
      clickToInspect: 'সাব-সিস্টেম পরীক্ষা করতে ডায়াগ্রামের উপাদানগুলোতে ক্লিক করুন',
      processor: 'প্রসেসর',
      vectorExt: 'ভেক্টর এক্সটেনশন',
      sramPsram: 'SRAM / PSRAM',
      power: 'বিদ্যুৎ ব্যবহার',
      emgSensor: 'EMG সেন্সর',
      signalAcquisition: 'অ্যানালগ ফ্রন্ট-এন্ড',
      esp32s3: 'ESP32-S3 পড',
      wirelessTelemetry: 'ওয়্যারলেস টেলিমেট্রি',
      aiProcessing: 'AI প্রসেসিং',
      specs: {
        emgTitle: 'EMG সারফেস সেন্সর অারে',
        emgSummary: 'ক্লিনিকাল-গ্রেড ইলেক্ট্রোডের মাধ্যমে বায়োপটেনশিয়াল পেশীর কার্যকলাপ পরিমাপক প্রযুক্তি।',
        emgElectrodes: 'ইলেকট্রোড',
        emgInputRange: 'ইনপুট রেঞ্জ',
        emgBandwidth: 'ব্যান্ডউইথ',
        emgImpedance: 'ইম্পিডেন্স',
        afeTitle: 'অ্যানালগ ফ্রন্ট-এন্ড (AFE)',
        afeSummary: 'প্রোগ্রামেবল গেইন এবং ২৪-বিট ডেল্টা-সিগমা ADC সহ লো-নয়েজ অ্যাম্প্লিফায়ার।',
        afeAdcRes: 'ADC রেজোলিউশন',
        afeSamplingRate: 'স্যাম্পলিং রেট',
        afeCmrr: 'CMRR',
        afeNoiseFloor: 'নয়েজ ফ্লোর',
        mcuTitle: 'ESP32-S3 মাইক্রোকন্ট্রোলার',
        mcuSummary: 'TinyML ইনফারেন্সের জন্য ২৪০ মেগাহার্টজে চলা ৩২-বিট ডুয়াল-কোর মাইক্রোকন্ট্রোলার।',
        mcuProcessor: 'প্রসেসর',
        mcuVectorExt: 'ভেক্টর এক্সটেনশন',
        mcuSram: 'SRAM / PSRAM',
        mcuPower: 'পাওয়ার ব্যবহার',
        wirelessTitle: 'ওয়্যারলেস টেলিমেট্রি সিস্টেম',
        wirelessSummary: 'রিয়েল-টাইম স্ট্রিমিংয়ের জন্য ব্লুটুথ ৫.০ এবং ওয়াই-ফাই।',
        wirelessProtocol: 'প্রোটোকল',
        wirelessLatency: 'লেটেন্সি',
        wirelessRange: 'রেঞ্জ',
        wirelessSecurity: 'সিকিউরিটি',
        aiTitle: 'অন-ডিভাইস TinyML ক্লাসিফায়ার',
        aiSummary: 'এমবেডেড হার্ডওয়্যারে রিয়েল-টাইমে পেশীর সিগন্যাল ও প্যাটার্ন শ্রেণীকরণকারী কৃত্রিম বুদ্ধিমত্তা।',
        aiModelSize: 'মডেল সাইজ',
        aiInferenceSpeed: 'ইনফারেন্স স্পিড',
        aiFeatures: 'ফিচারসমূহ',
        aiAccuracy: 'সঠিকতা',
      },
    },
    teach: {
      eyebrow: 'এডাপ্টিভ নিউরাল পার্সোনালাইজেশন',
      titleLine1: 'আপনার ভাষাই',
      titleLine2: 'শিক্ষা দিন।',
      description: 'প্রতিটি ব্যবহারকারীর একটি অনন্য পেশী সংকেত রয়েছে। SAAKANTHA ৬০ সেকেন্ডেও কম সময়ে আপনার পেশীর সংকেত ক্যালিব্রেট করে সেটিকে স্পষ্ট বাচনে পরিণত করে।',
      activeVocab: 'সক্রিয় প্রশিক্ষিত শব্দভাণ্ডার',
      clickToPlay: 'কণ্ঠস্বর শুনতে ক্লিক করুন',
      calibrationTitle: 'ইঙ্গিত ক্যালিব্রেশন স্যুট',
      calibrationDesc: '৩টি সংকোচন পরীক্ষা রেকর্ড করে SAAKANTHA-কে আপনার নিজস্ব বাক্য শেখান।',
      trainHi: 'প্রশিক্ষণ দিন "হাই"',
      trainWater: 'প্রশিক্ষণ দিন "আমার জল চাই"',
      enterCustom: 'কাস্টম বাক্য লিখুন...',
      trainBtn: 'প্রশিক্ষণ',
      targetCmd: 'টার্গেট কমান্ড',
      capturing: 'সিগন্যাল রেকর্ড হচ্ছে...',
      trialProgress: 'পরীক্ষা চলছে',
      learnedStatus: 'প্যাটার্ন শেখা হয়েছে ✓',
      performContraction: 'পেশীর সংকোচন করুন',
      calibratedCheck: 'ক্যালিব্রেটেড ✓',
      aiConfidence: 'AI সঠিকতা',
      trainAnother: 'অন্য কমান্ড প্রশিক্ষণ দিন →',
      t1Name: 'একক ফ্লেক্স',
      t2Name: 'ফ্লেক্সর হোল্ড',
      t3Name: 'পিক বার্স্ট',
    },
    voicePanel: {
      engineTitle: 'ভয়েস আউটপুট ইঞ্জিন',
      voiceConfigBtn: 'ভয়েস সেটিং',
      trainedCmdLabel: 'প্রশিক্ষিত কমান্ড',
      aiConfidenceLabel: 'AI সঠিকতা',
      readyBadge: 'প্রস্তুত',
      speechParams: 'স্পিচ প্যারামিটার',
      synthesisVoice: 'সিন্থেসিস ভয়েস',
      speedRate: 'গতির হার',
      pitch: 'পিচ',
      volume: 'ভলিউম',
      testVoiceBtn: 'ভয়েস সেটআপ টেস্ট করুন',
      playVoiceBtn: 'কণ্ঠস্বর বাজান',
      speakingState: 'কথা বলছে...',
      unavailableState: 'ভয়েস আউটপুট অনুপস্থিত',
      synthesizingMsg: 'কণ্ঠস্বর অডিও প্রসেসিং হচ্ছে',
      commandSpokenMsg: '✓ কমান্ড উচ্চারিত হয়েছে',
      speechReadyMsg: 'স্পিচ প্রস্তুত — অডিও শুনতে ক্লিক করুন',
      unsupportedMsg: 'এই ব্রাউজারে স্পিচ সিন্থেসিস সমর্থিত নয়।',
    },
    ai: {
      eyebrow: 'এমবেডেড বুদ্ধিমত্তা',
      titleLine1: 'পেশীর সিগন্যাল থেকে',
      titleLine2: 'অভিপ্রায় পর্যন্ত।',
      description: 'ডিজিটাল সিগন্যাল প্রসেসিং দ্বারা অস্পষ্টতা দূর করা হয়।',
      steps: {
        s1: 'রও EMG সিগন্যাল',
        s2: 'ডিজিটাল ফিল্টার',
        s3: 'ফিচার নিষ্কাশন',
        s4: 'প্যাটার্ন চিহ্নিতকরণ',
        s5: 'নিউরল ক্লাসিফায়ার',
        s6: 'অভিপ্রায় আউটপুট',
      },
    },
    pipeline: { eyebrow: 'কীভাবে কাজ করে', title: 'পেশীর সিগন্যাল থেকে কণ্ঠস্বরে', description: 'SAAKANTHA রিয়েল-টাইমে পেশীর স্বাভাবিক সংকেতকে বাচনে রূপান্তর করে।' },
    worldwide: {
      eyebrow: 'বিশ্বব্যাপী সুযোগ ও প্রভাব',
      titleLine1: 'একটি স্বরের জন্য নির্মিত।',
      titleLine2: 'সমগ্র বিশ্বের জন্য ডিজাইন করা।',
      description: 'যোগাযোগের কোনো সীমানা নেই। SAAKANTHA ভাষা, অঞ্চল ও সংস্কৃতির সীমা ছাড়িয়ে মানুষকে ভাব প্রকাশে সাহায্য করে।',
      totalSupported: 'মোট সমর্থিত',
      indianRegionalStat: 'ভারতীয় আঞ্চলিক',
      internationalStat: 'আন্তর্জাতিক',
      totalLanguages: 'বিশ্বব্যাপী ভাষা',
      indianRegional: 'আঞ্চলিক ভাষা',
      international: 'আন্তর্জাতিক ভাষা',
      mapTitle: 'বিশ্বব্যাপী বায়োপটেনশিয়াল ম্যাপ',
      mapLatency: 'অনুবাদ সময় < ১৫ মি.সে',
      statementTitle: 'একটি সংকেত। বহু ভাষা। এক মানব স্বর।',
      statementBody: 'স্থানীয় যোগাযোগ থেকে বৈশ্বিক সংযোগ পর্যন্ত, SAAKANTHA সহায়ক যোগাযোগকে বিশ্বব্যাপী সহজলভ্য করার জন্য নির্মিত।',
      decentralizedTag: 'বিকেন্দ্রীভূত স্পিচ সিন্থেসিস',
      globalSignalActive: 'গ্লোবাল সিগন্যাল সক্রিয়',
      pLocal: 'স্থানীয়',
      pRegional: 'আঞ্চলিক',
      pNational: 'জাতীয়',
      pGlobal: 'বিশ্বব্যাপী',
    },
    human: { eyebrow: 'মানবিক উদ্দেশ্য ও মর্যাদা', line1: 'একটি স্বর', line2: 'শব্দের চেয়েও বেশি কিছু।', subtitle: 'এটি মানুষের ভাব প্রকাশের জন্মগত অনুভূতি:' },
    final: { r1Line1: 'কণ্ঠস্বর যখন', r1Line2: 'নীরব হয়ে যায়,', r2Line1: 'যোগাযোগ তখনও', r2Line2: 'থেমে থাকে না।', subtitle: 'AI-চালিত সহায়ক যোগাযোগ ব্যবস্থা', coreActive: 'SAAKANTHA কোর সক্রিয়', signalFidelity: '১০০% সিগন্যাল সঠিকতা' },
  }),
}
