"use client";

import { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { translations, Language } from "@/lib/i18n";

interface HeaderProps {
  showDelete?: boolean;
  onDelete?: () => void;
  lang?: Language;
}

export function Header({ showDelete = false, onDelete, lang = "id" }: HeaderProps) {
  const [confirming, setConfirming] = useState(false);
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        <h1 className="font-bold text-lg">{t.appTitle}</h1>
      </div>

      {showDelete && (
        <div>
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-xs">{t.deleteConfirm}</span>
              <button
                onClick={() => { onDelete?.(); setConfirming(false); }}
                className="text-xs bg-red-500 px-2 py-1 rounded hover:bg-red-600 transition-colors"
              >
                {t.deleteYes}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
              >
                {t.deleteCancel}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center text-xs bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1.5" /> {t.deleteBtn}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
