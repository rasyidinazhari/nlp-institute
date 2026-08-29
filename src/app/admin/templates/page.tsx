"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit2, Trash2 } from "lucide-react";

interface Template {
  id: string;
  template: string;
  category: string;
  language: string;
  active: boolean;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState({ template: "", category: "toward-away", language: "id", active: true });

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/templates");
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      setTemplates(data);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (editing) {
      await fetch(`/api/admin/templates/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm({ template: "", category: "toward-away", language: "id", active: true });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus template ini?")) return;
    await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
    fetchData();
  };

  // Preview with sample data
  const previewTemplate = (t: string) => {
    return t
      .replace(/\{count\}/g, "4")
      .replace(/\{toward_count\}/g, "3")
      .replace(/\{away_count\}/g, "1")
      .replace(/\{dominant_pattern\}/g, "toward");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mirror Templates</h2>
        <button
          onClick={() => { setEditing(null); setForm({ template: "", category: "toward-away", language: "id", active: true }); setShowForm(true); }}
          className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          + Tambah
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 border border-gray-200 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? "Edit" : "Tambah"} Template</h3>
          <textarea
            value={form.template}
            onChange={e => setForm({ ...form, template: e.target.value })}
            placeholder="Template refleksi... Gunakan {count}, {toward_count}, {away_count}, {dominant_pattern}"
            rows={4}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-xs text-gray-400 mb-3">Placeholder: {'{count}'}, {'{toward_count}'}, {'{away_count}'}, {'{dominant_pattern}'}</p>
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
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
              Aktif
            </label>
          </div>
          {form.template && (
            <div className="bg-amber-50 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-amber-700 mb-1">Preview:</p>
              <p className="text-sm text-gray-700">{previewTemplate(form.template)}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleSave} className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700">Simpan</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-100">Batal</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">{t.template}</p>
                <div className="bg-amber-50 rounded-lg p-2 mb-2">
                  <p className="text-xs text-amber-700 font-medium mb-0.5">Preview:</p>
                  <p className="text-xs text-gray-600">{previewTemplate(t.template)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase font-bold">{t.language || 'ID'}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{t.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${t.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    {t.active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 self-end sm:self-auto">
                <button onClick={() => { setEditing(t); setForm({ template: t.template, category: t.category, language: t.language || "id", active: t.active }); setShowForm(true); }} className="p-1 rounded hover:bg-gray-100 text-gray-500"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
