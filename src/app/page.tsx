"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Globe } from "lucide-react";
import { ConsentModal } from "@/components/consent-modal";
import { translations, Language } from "@/lib/i18n";

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [showConsent, setShowConsent] = useState(false);
  const [lang, setLang] = useState<Language>("id");
  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem("pola-language") as Language;
    if (savedLang && (savedLang === "id" || savedLang === "en" || savedLang === "nl")) {
      setLang(savedLang);
    }
  }, []);

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("pola-language", newLang);
    document.cookie = `pola-language=${newLang}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
  };

  const handleStart = () => {
    setShowConsent(true);
  };

  const handleConsent = async () => {
    // Generate session via API or locally
    const sessionId = crypto.randomUUID();
    localStorage.setItem("pola-session-id", sessionId);
    if (name.trim()) {
      localStorage.setItem("pola-name", name.trim());
    }
    document.cookie = `pola-session-id=${sessionId}; path=/; max-age=${90 * 24 * 60 * 60}; samesite=lax`;
    document.cookie = `pola-consent=true; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
    document.cookie = `pola-language=${lang}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
    router.push("/chat");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
        <Globe className="w-4 h-4 text-gray-500" />
        <select 
          value={lang} 
          onChange={(e) => handleLangChange(e.target.value as Language)}
          className="text-sm bg-transparent outline-none text-gray-700 cursor-pointer"
        >
          <option value="id">Indonesia</option>
          <option value="en">English</option>
          <option value="nl">Nederlands</option>
        </select>
      </div>

      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <MessageCircle className="w-16 h-16 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.appTitle}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {t.notQuiz}<br />
          {lang === "id" && <>Ini <span className="font-semibold text-emerald-700">cermin cara kamu bicara</span> sebagai leader.</>}
          {lang === "en" && <>This is a <span className="font-semibold text-emerald-700">mirror of how you speak</span> as a leader.</>}
          {lang === "nl" && <>Dit is een <span className="font-semibold text-emerald-700">spiegel van hoe je spreekt</span> als leider.</>}
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <p className="text-sm text-gray-500 mb-4">
            {t.description}
          </p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4"
          />

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors text-lg"
          >
            {t.startBtn}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Practice companion dari Het NLP Instituut
        </p>
      </div>

      {showConsent && <ConsentModal onAccept={handleConsent} lang={lang} />}
    </main>
  );
}
