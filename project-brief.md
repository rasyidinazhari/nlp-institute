# Project Brief — Beleef NLP ("Pola Bicaramu")

**Case:** Het NLP Instituut × UMM Hackathon 72 Hours
**Tim:** 3 Developer
**Status:** Draft v1

---

## 1. Ringkasan Produk

Practice companion berbasis chat yang mengirim situasi kerja singkat secara berkala ke alumni training NLP (manager/eksekutif). Peserta menjawab bebas, sistem mendeteksi pola bahasa (toward/away) dari kata-kata yang mereka pilih sendiri, lalu memantulkan pola itu sebagai refleksi naratif ("cermin pola") — bukan skor, bukan kuis.

**Konteks pemakaian yang dipilih:** self-guided, di sela-sela/setelah training selesai (bukan dipakai live di dalam sesi training, karena trainer sengaja tetap analog).

**Materi NLP yang dipakai (v1):** Meta programs — toward/away language. Materi lain (VAK, logische niveaus, meta model) memakai mekanik & struktur yang sama, tinggal ganti isi konten.

**Formula inti yang dikejar:** Fun + Refleksi + Repetisi (tervalidasi langsung oleh 20 alumni Elke).

---

## 2. Tech Stack

| Layer | Pilihan |
|---|---|
| Framework | Next.js (App Router), fullstack — frontend + API routes dalam satu project |
| UI | React + Tailwind + **shadcn/ui** |
| Database | PostgreSQL + Prisma ORM |
| Auth admin | Session/cookie-based sederhana atau NextAuth Credentials provider — 1 admin saja, tanpa role/permission system |
| Deployment | Vercel (app) + Neon/Supabase (Postgres) |
| Peserta | Anonim, tanpa akun — hanya `sessionId` lokal (localStorage/cookie) |

---

## 3. Database Schema (Prisma — kasar, untuk direfine saat build)

```prisma
model Scenario {
  id        String   @id @default(cuid())
  text      String
  category  String   // e.g. "toward-away", "vak", dst — untuk multi-materi ke depan
  order     Int      @default(0)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  responses Response[]
}

model Keyword {
  id        String   @id @default(cuid())
  category  String   // harus match Scenario.category
  phrase    String
  direction String   // "toward" | "away"
}

model MirrorTemplate {
  id        String   @id @default(cuid())
  category  String
  template  String   // berisi placeholder {count}, {topic}, dll
}

model Response {
  id                String   @id @default(cuid())
  sessionId         String   // anonim, bukan user account
  scenarioId        String
  scenario          Scenario @relation(fields: [scenarioId], references: [id])
  text              String
  detectedDirection String?  // "toward" | "away" | "neutral"
  createdAt         DateTime @default(now())
}

model Admin {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
}
```

---

## 4. Daftar Halaman (Pages)

### Peserta (public, no-auth)
| Halaman | Path | Deskripsi |
|---|---|---|
| Landing / Onboarding | `/` | Framing singkat ("bukan kuis, ini cermin cara kamu bicara"), input nama/inisial opsional, tombol mulai |
| Chat Check-in | `/chat` | Interface chat bergaya WhatsApp — menampilkan skenario aktif berikutnya, input jawaban bebas |
| Cermin Pola | `/cermin` (atau muncul sebagai chat bubble khusus di `/chat`) | Refleksi naratif setelah cukup jumlah respons terkumpul |
| Demo Teaser (sales) | `/teaser` | Mode single-shot: 1 skenario → hasil instan → CTA "Mau ini untuk seluruh timmu?" |

### Admin (auth required)
| Halaman | Path | Deskripsi |
|---|---|---|
| Login | `/admin/login` | Form email + password sederhana |
| Dashboard | `/admin` | Ringkasan jumlah skenario aktif, jumlah respons masuk (agregat, bukan per individu) |
| Kelola Skenario | `/admin/scenarios` | List + create/edit/delete skenario, toggle active, atur kategori & urutan |
| Kelola Keyword | `/admin/keywords` | List + create/edit/delete kata kunci per kategori/direction |
| Kelola Template Cermin | `/admin/templates` | List + create/edit template kalimat refleksi |

---

## 5. Daftar API Endpoints

### Public (peserta)
| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/scenario/next` | Ambil skenario berikutnya untuk `sessionId` tertentu (belum pernah dijawab) |
| POST | `/api/response` | Submit jawaban peserta → trigger deteksi pola → simpan `Response` |
| GET | `/api/mirror?sessionId=` | Ambil/generate cermin pola berdasarkan histori respons session tsb |
| POST | `/api/teaser` | Mode single-shot: kirim 1 jawaban → langsung return hasil instan (tanpa simpan histori) |

### Admin (auth required)
| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/admin/login` | Autentikasi admin |
| POST | `/api/admin/logout` | Hapus session |
| GET/POST | `/api/admin/scenarios` | List & create skenario |
| PATCH/DELETE | `/api/admin/scenarios/[id]` | Update & hapus skenario |
| GET/POST | `/api/admin/keywords` | List & create keyword |
| PATCH/DELETE | `/api/admin/keywords/[id]` | Update & hapus keyword |
| GET/POST | `/api/admin/templates` | List & create mirror template |
| PATCH/DELETE | `/api/admin/templates/[id]` | Update & hapus template |

---

## 6. Core Logic — Deteksi Pola

1. Ambil `Response.text`, lowercase.
2. Cocokkan terhadap `Keyword` list (per `category` yang sedang aktif).
3. Hitung jumlah match `toward` vs `away`.
4. Simpan `detectedDirection` di response: `toward` / `away` / `neutral` (kalau tidak ada match jelas).
5. Untuk generate cermin pola: agregasi seluruh `Response.detectedDirection` milik satu `sessionId`, isi ke `MirrorTemplate` yang sesuai (placeholder `{count}`, `{topic}`, dst).

**Catatan penting:** heuristic keyword-matching, bukan ML classifier — sesuai brief ("NLP theory accuracy is not graded", yang dinilai mechanics & experience). Transparan dan mudah didemokan ke juri.

---

## 7. User Flow

### Flow Peserta (utama)
```
Landing (/) 
  → isi inisial opsional → generate sessionId lokal
  → masuk /chat
  → tampil skenario #1 → user jawab bebas → submit
  → sistem simpan + deteksi pola (tidak ditampilkan ke user)
  → balasan chat netral ("Oke, dicatat.")
  → [jeda / kembali lagi hari lain — simulasikan di demo dengan tombol "skenario berikutnya"]
  → skenario #2, #3, #4 dengan pola yang sama
  → setelah N respons (misal 4) → Cermin Pola muncul otomatis sebagai chat bubble
  → tombol "Lihat check-in berikutnya" → loop berlanjut
```

### Flow Sales Teaser
```
/teaser → tampil 1 skenario → user jawab
  → hasil instan langsung tampil (tanpa perlu histori)
  → CTA "Mau ini untuk seluruh timmu?" (link ke kontak/WA Het NLP Instituut)
```

### Flow Admin
```
/admin/login → autentikasi
  → /admin dashboard
  → kelola scenarios/keywords/templates (CRUD)
  → perubahan langsung reflect ke endpoint publik (tanpa redeploy)
```

---

## 8. Fitur — MVP vs Stretch

### MVP (wajib, prioritas 12–48 jam)
- [ ] Chat interface dasar (kirim/terima bubble, styling shadcn)
- [ ] Skenario tersimpan di DB, endpoint ambil skenario berikutnya
- [ ] Submit jawaban bebas + deteksi pola keyword-based
- [ ] Cermin pola muncul setelah N respons
- [ ] Minimal 4 skenario placeholder + keyword list siap pakai
- [ ] Deploy dengan link publik yang bisa dicoba juri

### Stretch (kalau waktu memungkinkan, 48–66 jam)
- [ ] Admin CMS dengan login sungguhan (CRUD scenario/keyword/template)
- [ ] Mode teaser (`/teaser`) untuk sales demo
- [ ] Multi-kategori materi (toggle antar materi NLP, bukan cuma toward/away)
- [ ] Animasi/polish transisi chat agar terasa lebih hidup

### Out of Scope (sesuai brief)
- Native app / VR-AR
- Sistem role & permission admin kompleks
- Kurikulum NLP lengkap dari nol
- Akun/login untuk peserta

---

## 9. Pembagian Kerja (3 Developer)

| Dev | Fokus | Deliverable |
|---|---|---|
| Dev 1 | Backend logic — Prisma schema, API routes, deteksi pola | `/api/*` endpoints jalan + logic toward/away teruji |
| Dev 2 | Frontend/experience — chat UI, cermin pola, teaser page | `/`, `/chat`, `/cermin`, `/teaser` dengan shadcn components |
| Dev 3 | Content + Admin CMS + deployment | Seed data skenario/keyword, `/admin/*` pages, setup Vercel + Neon/Supabase |

**Prinsip:** mechanic inti (Dev 1 & 2) tidak boleh terganggu oleh CMS. Kalau Dev 3 selesai lebih cepat atau mechanic inti butuh bantuan, Dev 3 pindah bantu Dev 1/2 dulu — CMS baru dikejar setelah mechanic inti solid.

---

## 10. Konten Placeholder (siap pakai untuk seed data)

**Kategori:** `toward-away`

**Scenarios:**
1. "Tim-mu baru saja gagal memenuhi deadline besar. Apa yang langsung ada di kepalamu?"
2. "Kamu sedang menyusun target untuk kuartal berikutnya. Bagaimana kamu menuliskannya dalam satu kalimat ke tim?"
3. "Seorang bawahan datang minta saran soal karier. Apa pertanyaan pertama yang kamu ajukan ke dia?"
4. "Rapat evaluasi tahunan akan datang. Apa yang ingin kamu pastikan TIDAK terjadi lagi tahun ini?"

**Keywords (toward):** mencapai, ingin, supaya bisa, menuju, meraih, hasil yang, target

**Keywords (away):** menghindari, supaya tidak, jangan sampai, mencegah, biar tidak, masalahnya

**Mirror template contoh:**
> "Dari {count} hal yang kamu ceritakan minggu ini, kamu {toward_count} kali menjelaskan langkahmu lewat apa yang ingin kamu capai — dan {away_count} kali lewat apa yang ingin kamu hindari. Bukan berarti salah satu lebih baik — tapi tim-mu mendengar polanya juga, setiap hari."

---

## 11. GDPR & Privacy Considerations

Klien berbasis di Belanda (Uni Eropa) — GDPR compliance bukan sekadar nilai tambah, tapi relevan langsung dengan konteks bisnis klien. Ini juga memperkuat requirement brief yang sudah ada: *"Privacy-friendly. If there's reflective personal input from participants, don't store it as personal data without reason. No account required."*

### Prinsip yang dipegang
- **Data minimization** — hanya simpan `sessionId`, teks jawaban, dan hasil deteksi pola. Tidak menyimpan IP address, device fingerprint, lokasi, atau metadata lain yang tidak perlu untuk fungsi cermin pola.
- **Legal basis: consent** — karena `Response.text` berpotensi termasuk data pribadi (opini/cara berpikir seseorang), pengumpulan datanya perlu consent eksplisit, bukan cuma asumsi "legitimate interest."
- **Purpose limitation** — data jawaban hanya dipakai untuk generate cermin pola pribadi peserta itu sendiri, tidak dipakai untuk profiling lintas individu atau dijual/dibagi ke pihak lain.
- **Right to erasure** — peserta bisa hapus data mereka sendiri kapan saja, tanpa perlu hubungi admin (karena tidak ada akun untuk verifikasi identitas).
- **Data retention terbatas** — data tidak disimpan selamanya secara default.
- **EU data residency** — pilih region hosting database di EU (Neon/Supabase punya opsi region Frankfurt/EU-Central) agar data tidak keluar yurisdiksi EU.

### Perubahan pada desain akibat prinsip ini

**Onboarding (`/`)** — tambah 1 langkah consent singkat sebelum masuk ke `/chat`:
> "Jawabanmu disimpan sementara untuk menampilkan pola bicaramu ke diri sendiri. Tidak dibagikan ke siapa pun, dan bisa kamu hapus kapan saja. [Lanjut] [Baca detail]"

**Schema tambahan:**
```prisma
model Response {
  // ...field sebelumnya tetap sama
  expiresAt DateTime? // untuk auto-delete terjadwal, misal createdAt + 90 hari
}
```

**Fitur baru — Hapus Data Peserta:**
- Endpoint: `DELETE /api/response?sessionId=` → hapus semua `Response` milik sessionId tsb
- UI: tombol kecil "Hapus data saya" di halaman `/chat` atau `/cermin`, tanpa perlu login (karena sessionId tersimpan lokal di browser peserta sendiri, jadi otomatis hanya bisa hapus datanya sendiri)

**Retention otomatis:**
- Set `expiresAt` saat `Response` dibuat (createdAt + 90 hari, angka bisa didiskusikan)
- Untuk hackathon: cukup tunjukkan logic-nya ada (field + query filter `expiresAt > now()`), tidak perlu bangun cron job production-grade — cukup dijelaskan di demo/dokumentasi sebagai mekanisme yang sudah disiapkan

**Deployment:**
- Pilih region database di EU saat setup Neon/Supabase (bukan default US)

### Update daftar fitur

Tambahan ke **MVP**:
- [ ] Consent notice di onboarding sebelum data disimpan
- [ ] Endpoint & tombol hapus data peserta (right to erasure)

Tambahan ke **Stretch**:
- [ ] Auto-delete data terjadwal (cron/scheduled function) berbasis `expiresAt`
- [ ] Halaman privacy notice singkat yang bisa diakses dari onboarding

### Kenapa ini kuat untuk storytelling ke juri

Ini bisa masuk one-pager sebagai poin diferensiasi tambahan: institut NLP kompetitor masih pena & kertas (sesuai insight dari call dengan Elke), jadi kalau tim menunjukkan kesadaran privacy-by-design sejak awal — bukan ditempel belakangan — ini jadi bukti kalian paham konteks bisnis klien secara serius, bukan cuma bikin fitur menarik tanpa mikirin implikasinya.

---

## 12. Catatan untuk One-Pager (deliverable terpisah)

Ingat brief minta one-pager berisi: mekanik inti & alasannya, konteks yang dipilih & alasannya, cara tetap reusable, rencana integrasi kurikulum asli. Poin reusability yang bisa diangkat:
- Struktur `category` di Scenario/Keyword/MirrorTemplate memungkinkan ganti materi NLP tanpa ubah kode
- CMS admin (walau minimal) menjawab kebutuhan Elke untuk kelola konten sendiri
- Model bisnis "development berkelanjutan" yang disebut Elke di call selaras dengan arsitektur yang gampang diperluas (tambah kategori materi baru = tambah data, bukan tulis ulang mekanik)
