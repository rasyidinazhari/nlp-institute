"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, Edit2, Trash2 } from "lucide-react";

interface Scenario {
  id: string;
  text: string;
  category: string;
  language: string;
  order: number;
  active: boolean;
  _count?: { responses: number };
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ text: "", category: "toward-away", language: "id", order: 0, active: true });

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/scenarios");
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      setScenarios(data);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (editing) {
      await fetch(`/api/admin/scenarios/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ text: "", category: "toward-away", language: "id", order: 0, active: true });
    fetchData();
  };

  const handleEdit = (s: Scenario) => {
    setEditing(s);
    setForm({ text: s.text, category: s.category, language: s.language || "id", order: s.order, active: s.active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus skenario ini?")) return;
    await fetch(`/api/admin/scenarios/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleToggle = async (s: Scenario) => {
    await fetch(`/api/admin/scenarios/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Skenario</h2>
        <button
          onClick={() => { setEditing(null); setForm({ text: "", category: "toward-away", language: "id", order: 0, active: true }); setShowForm(true); }}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tambah
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? "Edit" : "Tambah"} Skenario</h3>
          <textarea
            value={form.text}
            onChange={e => setForm({ ...form, text: e.target.value })}
            placeholder="Teks skenario..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={form.language}
              onChange={e => setForm({ ...form, language: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="id">ID</option>
              <option value="en">EN</option>
              <option value="nl">NL</option>
            </select>
            <input
              type="text"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              placeholder="Kategori"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="number"
              value={form.order}
              onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              placeholder="Urutan"
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
              Aktif
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700">Simpan</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-100">Batal</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {scenarios.map(s => (
          <div key={s.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-800">{s.text}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-bold">{s.language || 'ID'}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s.category}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">#{s.order}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${s.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {s.active ? "Aktif" : "Nonaktif"}
                  </span>
                  {s._count && <span className="text-xs text-gray-400">{s._count.responses} respons</span>}
                </div>
              </div>
              <div className="flex gap-1 self-end sm:self-auto">
                <button onClick={() => handleToggle(s)} className="p-1 rounded hover:bg-gray-100 text-gray-500">{s.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                <button onClick={() => handleEdit(s)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
