"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { translations, Language } from "@/lib/i18n";

interface ConsentModalProps {
  onAccept: () => void;
  lang: Language;
}

export function ConsentModal({ onAccept, lang }: ConsentModalProps) {
  const [showDetail, setShowDetail] = useState(false);
  const t = translations[lang];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="text-center mb-4">
          <Lock className="w-10 h-10 mx-auto text-gray-800" />
          <h2 className="text-lg font-semibold text-gray-800 mt-2">{t.privacyTitle}</h2>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {t.privacyDesc}
        </p>

        {showDetail && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-xs text-gray-500 leading-relaxed">
            <p className="font-semibold text-gray-700 mb-2">{t.privacyDetails}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{t.privacy1}</li>
              <li>{t.privacy2}</li>
              <li>{t.privacy3}</li>
              <li>{t.privacy4}</li>
              <li>{t.privacy5}</li>
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={onAccept}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            {t.continueBtn}
          </button>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showDetail ? t.closeDetails : t.readDetails}
          </button>
        </div>
      </div>
    </div>
  );
}
