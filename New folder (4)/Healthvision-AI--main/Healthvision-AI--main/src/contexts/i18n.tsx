import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "bn";

const DICT: Record<string, { en: string; bn: string }> = {
  // Nav
  "nav.home": { en: "Home", bn: "হোম" },
  "nav.symptoms": { en: "Symptoms", bn: "লক্ষণ" },
  "nav.analysis": { en: "Analysis", bn: "বিশ্লেষণ" },
  "nav.chat": { en: "Chat", bn: "চ্যাট" },
  "nav.dashboard": { en: "Dashboard", bn: "ড্যাশবোর্ড" },
  "nav.scans": { en: "Scans", bn: "স্ক্যান" },
  "nav.history": { en: "History", bn: "ইতিহাস" },
  "nav.appointments": { en: "Appointments", bn: "অ্যাপয়েন্টমেন্ট" },
  "nav.vitals": { en: "Vitals", bn: "ভাইটালস" },
  "nav.consult": { en: "Consult", bn: "পরামর্শ" },
  "nav.signin": { en: "Sign In", bn: "সাইন ইন" },
  "nav.signout": { en: "Sign out", bn: "সাইন আউট" },

  // Common
  "common.confidence": { en: "Confidence", bn: "আত্মবিশ্বাস" },
  "common.loading": { en: "Loading…", bn: "লোড হচ্ছে…" },
  "common.error": { en: "Something went wrong.", bn: "কিছু ভুল হয়েছে।" },
  "common.retry": { en: "Retry", bn: "আবার চেষ্টা করুন" },
  "common.cancel": { en: "Cancel", bn: "বাতিল" },
  "common.save": { en: "Save", bn: "সংরক্ষণ" },
  "common.close": { en: "Close", bn: "বন্ধ করুন" },
  "common.download": { en: "Download", bn: "ডাউনলোড" },
  "common.view": { en: "View", bn: "দেখুন" },
  "common.delete": { en: "Delete", bn: "মুছুন" },
  "common.submit": { en: "Submit", bn: "জমা দিন" },
  "common.search": { en: "Search", bn: "অনুসন্ধান" },
  "common.disclaimer": {
    en: "Informational only — not a substitute for professional medical advice.",
    bn: "শুধুমাত্র তথ্যের জন্য — পেশাদার চিকিৎসা পরামর্শের বিকল্প নয়।",
  },

  // Scans gallery
  "scans.title": { en: "Medical Scans Gallery", bn: "মেডিকেল স্ক্যান গ্যালারি" },
  "scans.subtitle": {
    en: "Your uploaded scans and AI analyses.",
    bn: "আপনার আপলোড করা স্ক্যান এবং AI বিশ্লেষণ।",
  },
  "scans.empty": { en: "No scans yet.", bn: "এখনও কোনো স্ক্যান নেই।" },
  "scans.download": { en: "Download PDF", bn: "PDF ডাউনলোড" },
  "scans.view": { en: "View details", bn: "বিস্তারিত দেখুন" },
  "scans.findings": { en: "Findings", bn: "ফলাফল" },
  "scans.impressions": { en: "Impressions", bn: "ইমপ্রেশন" },
  "scans.cautions": { en: "Cautions", bn: "সতর্কতা" },
  "scans.fullImage": { en: "Open full image", bn: "পূর্ণ ছবি খুলুন" },

  // History
  "history.title": { en: "Symptom Check History", bn: "লক্ষণ পরীক্ষার ইতিহাস" },
  "history.subtitle": { en: "Reopen past assessments.", bn: "অতীত মূল্যায়ন আবার খুলুন।" },
  "history.empty": { en: "No assessments yet.", bn: "এখনও কোনো মূল্যায়ন নেই।" },
  "history.reopen": { en: "Reopen", bn: "আবার খুলুন" },
  "history.close": { en: "Close", bn: "বন্ধ করুন" },
  "history.downloadPdf": { en: "Download PDF", bn: "PDF ডাউনলোড" },
  "history.redFlags": { en: "Red flags", bn: "সতর্ক সংকেত" },
  "history.conditions": { en: "Possible conditions", bn: "সম্ভাব্য অবস্থা" },
  "history.nextSteps": { en: "Recommended next steps", bn: "প্রস্তাবিত পরবর্তী পদক্ষেপ" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (stored === "en" || stored === "bn") setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  const t = (k: string) => DICT[k]?.[lang] ?? k;
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { lang: "en" as Lang, setLang: () => {}, t: (k: string) => DICT[k]?.en ?? k };
  return ctx;
}
