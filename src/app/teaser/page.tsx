"use client";

import { useState, useEffect } from "react";
import { ScanFace, MessageCircle } from "lucide-react";

export default function TeaserPage() {
  const [scenario, setScenario] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{
    direction: string;
    mirrorText: string;
    towardMatches: string[];
    awayMatches: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"intro" | "answer" | "result">("intro");

  const scenarios = [
    "Tim-mu baru saja gagal memenuhi deadline besar. Apa yang langsung ada di kepalamu?",
    "Kamu sedang menyusun target untuk kuartal berikutnya. Bagaimana kamu menuliskannya dalam satu kalimat ke tim?",
    "Seorang bawahan datang minta saran soal karier. Apa pertanyaan pertama yang kamu ajukan ke dia?",
  ];

  useEffect(() => {
    setScenario(scenarios[Math.floor(Math.random() * scenarios.length)]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer }),
      });
      const data = await res.json();
      setResult(data);
      setStep("result");
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {step === "intro" && (
          <div className="text-center">
            <ScanFace className="w-12 h-12 mb-4 mx-auto text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Coba Cermin Pola</h1>
            <p className="text-gray-600 mb-6">
              Jawab satu pertanyaan — langsung lihat pola bicaramu.
            </p>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
              <p className="text-sm text-gray-500 mb-2">Situasi:</p>
              <p className="text-gray-800 font-medium leading-relaxed">{scenario}</p>
            </div>
            <button
              onClick={() => setStep("answer")}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              Jawab
            </button>
          </div>
        )}

        {step === "answer" && (
          <div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
              <p className="text-xs text-gray-400 mb-1">Situasi:</p>
              <p className="text-sm text-gray-700">{scenario}</p>
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Ketik jawabanmu di sini..."
              rows={4}
              className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4 resize-none"
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
            >
              {loading ? "Menganalisis..." : "Lihat Pola"}
            </button>
          </div>
        )}

        {step === "result" && result && (
          <div>
            <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl p-6 border border-amber-200 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ScanFace className="w-6 h-6 text-emerald-600" />
                <h3 className="font-semibold text-gray-800">Cermin Polamu</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">{result.mirrorText}</p>

              <div className="bg-white/60 rounded-xl p-3 text-xs text-gray-500">
                <p>Pola terdeteksi: <span className="font-semibold text-gray-700 capitalize">{result.direction}</span></p>
                {result.towardMatches.length > 0 && (
                  <p className="mt-1">Kata toward: <span className="text-emerald-600">{result.towardMatches.join(", ")}</span></p>
                )}
                {result.awayMatches.length > 0 && (
                  <p className="mt-1">Kata away: <span className="text-orange-600">{result.awayMatches.join(", ")}</span></p>
                )}
              </div>
            </div>

            <div className="bg-emerald-700 rounded-2xl p-6 text-white text-center">
              <p className="font-semibold text-lg mb-2">Mau ini untuk seluruh timmu?</p>
              <p className="text-sm text-emerald-100 mb-4">
                Practice companion yang membantu tim memahami pola komunikasi mereka.
              </p>
              <a
                href="https://wa.me/31612345678?text=Halo%2C%20saya%20tertarik%20dengan%20Pola%20Bicaramu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-emerald-700 font-semibold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" /> Hubungi Het NLP Instituut
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
