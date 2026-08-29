"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/layout/header";
import { translations, Language, getLangFromCookies } from "@/lib/i18n";

export default function CerminPage() {
  const router = useRouter();
  const [mirrorData, setMirrorData] = useState<{
    mirror: string;
    stats: { count: number; towardCount: number; awayCount: number; dominantPattern: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>("id");
  
  useEffect(() => {
    const currentLang = getLangFromCookies();
    setLang(currentLang);
    
    const sid = localStorage.getItem("pola-session-id");
    if (!sid) {
      router.push("/");
      return;
    }
    fetch(`/api/mirror?sessionId=${sid}&lang=${currentLang}`)
      .then(r => r.json())
      .then(data => {
        if (data.ready) setMirrorData({ mirror: data.mirror, stats: data.stats });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const t = translations[lang];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!mirrorData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="flex justify-center mb-4">
          <Sparkles className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.mirrorNotReadyTitle}</h2>
        <p className="text-gray-500 mb-6">{t.mirrorNotReadyDesc}</p>
        <button onClick={() => router.push("/chat")} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
          {t.backToChat}
        </button>
      </div>
    );
  }

  const total = mirrorData.stats.towardCount + mirrorData.stats.awayCount;
  const towardPct = total > 0 ? Math.round((mirrorData.stats.towardCount / total) * 100) : 50;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header lang={lang} />
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-6">
          <Sparkles className="w-12 h-12 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900 mt-2">{t.mirrorTitle}</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-700 leading-relaxed">{mirrorData.mirror}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">{t.patternSpectrum}</h3>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Toward ({mirrorData.stats.towardCount})</span>
            <span>Away ({mirrorData.stats.awayCount})</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden flex bg-gray-100">
            <div className="bg-emerald-500 transition-all" style={{ width: `${towardPct}%` }} />
            <div className="bg-orange-400 transition-all" style={{ width: `${100 - towardPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">{t.basedOn.replace("{count}", String(mirrorData.stats.count))}</p>
        </div>

        <button
          onClick={() => router.push("/chat")}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
        >
          {t.backToChat}
        </button>
      </div>
    </div>
  );
}
