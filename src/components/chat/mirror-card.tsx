"use client";

import { Sparkles, ArrowRight } from "lucide-react";
import { translations, Language } from "@/lib/i18n";

interface MirrorCardProps {
  mirrorText: string;
  stats: {
    count: number;
    towardCount: number;
    awayCount: number;
  };
  onContinue?: () => void;
  lang?: Language;
}

export function MirrorCard({ mirrorText, stats, onContinue, lang = "id" }: MirrorCardProps) {
  const t = translations[lang];
  const total = stats.towardCount + stats.awayCount;
  const towardPercent = total > 0 ? Math.round((stats.towardCount / total) * 100) : 50;
  const awayPercent = 100 - towardPercent;

  return (
    <div className="mx-3 my-4 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-orange-50 border border-amber-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-6 h-6 text-emerald-600" />
        <h3 className="font-semibold text-gray-800">{t.mirrorTitle}</h3>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-4">{mirrorText}</p>

      {/* Visual spectrum bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Toward ({stats.towardCount})</span>
          <span>Away ({stats.awayCount})</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${towardPercent}%` }}
          />
          <div
            className="bg-orange-400 transition-all duration-500"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center">
          {t.basedOn.replace("{count}", String(stats.count))}
        </p>
      </div>

      {onContinue && (
        <button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          {t.nextCheckin}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
