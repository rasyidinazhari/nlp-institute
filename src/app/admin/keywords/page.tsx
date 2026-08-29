"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2 } from "lucide-react";

interface Keyword {
  id: string;
  phrase: string;
  direction: string;
  category: string;
  language: string;
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Keyword | null>(null);
  const [form, setForm] = useState({ phrase: "", direction: "toward", category: "toward-away", language: "id" });
  const [filter, setFilter] = useState<string>("all");
  const [langFilter, setLangFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/keywords");
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      setKeywords(data);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (editing) {
      await fetch(`/api/admin/keywords/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ phrase: "", direction: "toward", category: "toward-away", language: "id" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus keyword ini?")) return;
    await fetch(`/api/admin/keywords/${id}`, { method: "DELETE" });
    fetchData();
  };

  const filtered = keywords.filter(k => 
    (filter === "all" || k.direction === filter) &&
    (langFilter === "all" || k.language === langFilter)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Keywords</h2>
        <button
          onClick={() => { setEditing(null); setForm({ phrase: "", direction: "toward", category: "toward-away", language: "id" }); setShowForm(true); }}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tambah
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "toward", "away"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              filter === f ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "Semua Arah" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="w-px h-8 bg-gray-200 mx-2" />
        {["all", "id", "en", "nl"].map(f => (
          <button
            key={f}
            onClick={() => setLangFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
              langFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "Semua Bahasa" : f.toUpperCase()}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? "Edit" : "Tambah"} Keyword</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={form.phrase}
              onChange={e => setForm({ ...form, phrase: e.target.value })}
              placeholder="Kata/frasa..."
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={form.direction}
              onChange={e => setForm({ ...form, direction: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="toward">Toward</option>
              <option value="away">Away</option>
            </select>
            <select
              value={form.language}
              onChange={e => setForm({ ...form, language: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="id">ID</option>
              <option value="en">EN</option>
              <option value="nl">NL</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700">Simpan</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-100">Batal</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filtered.map(k => (
          <div key={k.id} className="bg-white rounded-lg p-3 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">{k.language || 'ID'}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                k.direction === "toward" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
              }`}>
                {k.direction}
              </span>
              <span className="text-sm text-gray-800">{k.phrase}</span>
            </div>
            <div className="flex gap-1 self-end sm:self-auto">
              <button onClick={() => { setEditing(k); setForm({ phrase: k.phrase, direction: k.direction, category: k.category, language: k.language || "id" }); setShowForm(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-500"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(k.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
