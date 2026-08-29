"use client";

import { useState, useEffect } from "react";
import { FileText, Key, MessageCircle } from "lucide-react";

interface Stats {
  scenarioCount: number;
  keywordCount: number;
  responseCount: number;
  sessionCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Fetch stats from multiple endpoints
    Promise.all([
      fetch("/api/admin/scenarios").then(r => r.json()),
      fetch("/api/admin/keywords").then(r => r.json()),
    ]).then(([scenarios, keywords]) => {
      const responseCount = scenarios.reduce((sum: number, s: { _count?: { responses: number } }) => sum + (s._count?.responses || 0), 0);
      setStats({
        scenarioCount: scenarios.length,
        keywordCount: keywords.length,
        responseCount,
        sessionCount: 0,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Skenario Aktif", value: stats?.scenarioCount ?? "-", icon: <FileText className="w-6 h-6 text-emerald-600" />, color: "emerald" },
    { label: "Keywords", value: stats?.keywordCount ?? "-", icon: <Key className="w-6 h-6 text-blue-600" />, color: "blue" },
    { label: "Total Respons", value: stats?.responseCount ?? "-", icon: <MessageCircle className="w-6 h-6 text-amber-600" />, color: "amber" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">Quick Links</h3>
        <div className="flex flex-wrap gap-2">
          <a href="/admin/scenarios" className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">Kelola Skenario</a>
          <a href="/admin/keywords" className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Kelola Keywords</a>
          <a href="/admin/templates" className="text-sm bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">Kelola Templates</a>
        </div>
      </div>
    </div>
  );
}
