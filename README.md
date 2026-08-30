# Pola Bicaramu — Beleef NLP Practice Companion

> **Practice companion berbasis chat** yang mengirim situasi kerja singkat ke alumni training NLP.
> Peserta menjawab bebas, sistem mendeteksi pola bahasa (toward/away), lalu memantulkan pola itu sebagai refleksi naratif — bukan skor, bukan kuis.

**Client:** Het NLP Instituut (Belanda)
**Stack:** Next.js 16 · React 19 · Tailwind CSS · Prisma · PostgreSQL · Serwist (PWA)

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Setup Lokal](#setup-lokal)
  - [1. Clone & Install](#1-clone--install)
  - [2. Database PostgreSQL](#2-database-postgresql)
  - [3. Environment Variables](#3-environment-variables)
  - [4. Migrasi & Seed Database](#4-migrasi--seed-database)
  - [5. Jalankan Development Server](#5-jalankan-development-server)
- [Deployment Production](#deployment-production)
  - [Railway](#railway)
  - [Vercel](#vercel)
- [Panduan CMS Admin](#panduan-cms-admin)
  - [Login Admin](#login-admin)
  - [Kelola Skenario](#kelola-skenario)
  - [Kelola Keyword](#kelola-keyword)
  - [Kelola Template Cermin](#kelola-template-cermin)
  - [Dashboard](#dashboard)
- [Halaman per Halaman](#halaman-per-halaman)
  - [Landing / Onboarding (`/`)](#landing--onboarding-)
  - [Chat Check-in (`/chat`)](#chat-check-in-chat)
  - [Cermin Pola (`/cermin`)](#cermin-pola-cermin)
  - [Demo Teaser (`/teaser`)](#demo-teaser-teaser)
  - [Admin Login (`/admin/login`)](#admin-login-adminlogin)
  - [Admin Dashboard (`/admin`)](#admin-dashboard-admin)
  - [Admin Skenario (`/admin/scenarios`)](#admin-skenario-adminscenarios)
  - [Admin Keyword (`/admin/keywords`)](#admin-keyword-adminkeywords)
  - [Admin Template (`/admin/templates`)](#admin-template-admintemplates)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Core Logic — Deteksi Pola](#core-logic--deteksi-pola)
- [Multi-Bahasa](#multi-bahasa)
- [PWA (Progressive Web App)](#pwa-progressive-web-app)
- [GDPR & Privacy](#gdpr--privacy)
- [Struktur Folder](#struktur-folder)
- [Scripts](#scripts)

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) — fullstack |
| UI | React 19 + Tailwind CSS 3 |
| Icons | Lucide React |
| Database | PostgreSQL 15 + Prisma ORM 5 |
| Auth Admin | Session/cookie-based (bcryptjs) |
| PWA | Serwist (service worker) |
| Validation | Zod 4 |
| Deployment | Railway (app + Postgres) |
| Peserta | Anonim — hanya `sessionId` lokal (localStorage) |

---

## Prasyarat

- **Node.js** ≥ 20.9.0
- **npm** (bundled with Node)
- **PostgreSQL** 15+ (atau Docker)
- **Git**

---

## Setup Lokal

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/nlp-institute.git
cd nlp-institute
npm install
```

### 2. Database PostgreSQL

**Opsi A — Docker (recommended):**

```bash
docker compose up -d
```

Ini menjalankan PostgreSQL di port `5440` dengan:
- User: `admin`
- Password: `password123`
- Database: `nlp_institute`

**Opsi B — PostgreSQL lokal:**

Buat database manual:

```sql
CREATE DATABASE nlp_institute;
```

### 3. Environment Variables

Copy `.env.example` → `.env` lalu sesuaikan:

```bash
cp .env.example .env
```

Isi `.env`:

```env
# Database connection string
DATABASE_URL="postgresql://admin:password123@localhost:5440/nlp_institute"

# Secret untuk session admin (ganti ke string random 64+ karakter)
ADMIN_SESSION_SECRET="change-me-to-random-64-char-string"
```

> **Catatan:** Jika menggunakan Docker Compose bawaan, `DATABASE_URL` di atas sudah sesuai. Jika menggunakan PostgreSQL lokal atau cloud (Neon/Supabase), sesuaikan host, port, user, dan password.

### 4. Migrasi & Seed Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema ke database (development)
npx prisma db push

# Isi data awal (skenario, keyword, template, admin)
npx prisma db seed
```

**Data seed yang dibuat:**
- 12 skenario (4 per bahasa: ID, EN, NL)
- 39 keyword (toward & away per bahasa)
- 6 mirror template (2 per bahasa)
- 1 admin account: `admin@nlp-institute.com` / `admin123`

> ⚠️ **Ganti password admin** setelah setup pertama lewat Admin CMS.

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Deployment Production

### Railway

Project sudah dikonfigurasi untuk Railway via `railway.json`.

1. Push ke GitHub repository
2. Connect repository di [Railway](https://railway.app)
3. Tambahkan PostgreSQL service di Railway dashboard
4. Set environment variables:
   - `DATABASE_URL` — dari Railway PostgreSQL service
   - `ADMIN_SESSION_SECRET` — random string 64+ karakter
5. Railway otomatis build (`prisma generate && next build`) dan start (`npm run start`)
6. Jalankan seed pertama kali:
   ```bash
   railway run npx prisma db seed
   ```

### Vercel

1. Connect repository di Vercel
2. Gunakan PostgreSQL external (Neon/Supabase) — set `DATABASE_URL`
3. Set `ADMIN_SESSION_SECRET`
4. Build command sudah benar: `prisma generate && next build`

---

## Panduan CMS Admin

Admin CMS memungkinkan pengelolaan konten **tanpa perlu edit kode atau redeploy**. Semua perubahan langsung aktif.

### Login Admin

1. Buka `/admin/login`
2. Masukkan email dan password
   - Default: `admin@nlp-institute.com` / `admin123`
3. Setelah login, redirect ke Dashboard

### Kelola Skenario

**Path:** `/admin/scenarios`

Skenario adalah situasi kerja yang ditampilkan ke peserta di halaman chat.

| Aksi | Cara |
|---|---|
| **Tambah skenario** | Klik tombol "Tambah" → isi teks skenario, pilih bahasa (`id`/`en`/`nl`), kategori (`toward-away`), dan urutan tampil |
| **Edit skenario** | Klik skenario di list → ubah teks/kategori/urutan → simpan |
| **Hapus skenario** | Klik tombol hapus di skenario. ⚠️ Semua respons terkait ikut terhapus (cascade) |
| **Aktifkan/nonaktifkan** | Toggle status `active`. Skenario nonaktif tidak tampil ke peserta tapi datanya tetap ada |
| **Atur urutan** | Ubah field `order`. Skenario ditampilkan ke peserta sesuai urutan ini |

**Tips:**
- Pastikan ada minimal 4 skenario aktif per bahasa supaya cermin pola bisa dihasilkan
- Gunakan kategori `toward-away` untuk materi meta programs
- Urutan menentukan skenario mana yang tampil duluan ke peserta

### Kelola Keyword

**Path:** `/admin/keywords`

Keyword adalah kata/frasa yang dipakai sistem untuk mendeteksi pola toward/away dari jawaban peserta.

| Aksi | Cara |
|---|---|
| **Tambah keyword** | Klik "Tambah" → isi frasa, pilih bahasa, kategori, dan direction (`toward` atau `away`) |
| **Edit keyword** | Klik keyword di list → ubah → simpan |
| **Hapus keyword** | Klik tombol hapus |

**Contoh keyword:**

| Bahasa | Direction | Contoh Frasa |
|---|---|---|
| ID | toward | mencapai, ingin, supaya bisa, menuju, meraih |
| ID | away | menghindari, supaya tidak, jangan sampai, mencegah |
| EN | toward | achieve, want, goal, towards, obtain |
| EN | away | avoid, prevent, problem, don't want |
| NL | toward | bereiken, willen, doel, resultaat |
| NL | away | vermijden, voorkomen, probleem, niet willen |

**Tips:**
- Gunakan lowercase — sistem otomatis lowercase jawaban peserta saat matching
- Frasa multi-kata bisa dipakai (mis. "supaya tidak", "so we don't")
- Makin banyak keyword, makin akurat deteksi pola
- Setiap kombinasi `language + category + phrase` harus unik

### Kelola Template Cermin

**Path:** `/admin/templates`

Template cermin adalah kalimat refleksi naratif yang ditampilkan ke peserta setelah cukup banyak jawaban terkumpul.

| Aksi | Cara |
|---|---|
| **Tambah template** | Klik "Tambah" → tulis template dengan placeholder → pilih bahasa & kategori |
| **Edit template** | Klik template di list → ubah → simpan |
| **Hapus template** | Klik tombol hapus |
| **Aktifkan/nonaktifkan** | Toggle status `active` |

**Placeholder yang tersedia:**

| Placeholder | Isi |
|---|---|
| `{count}` | Total jumlah respons peserta |
| `{toward_count}` | Jumlah respons yang terdeteksi "toward" |
| `{away_count}` | Jumlah respons yang terdeteksi "away" |
| `{dominant_pattern}` | Pola dominan peserta ("toward" atau "away") |

**Contoh template:**
```
Dari {count} hal yang kamu ceritakan, kamu {toward_count} kali menjelaskan
langkahmu lewat apa yang ingin kamu capai — dan {away_count} kali lewat
apa yang ingin kamu hindari.
```

### Dashboard

**Path:** `/admin`

Dashboard menampilkan ringkasan:
- Jumlah skenario aktif
- Jumlah total respons masuk (agregat, bukan per individu)
- Quick links ke halaman kelola skenario, keyword, dan template

---

## Halaman per Halaman

### Landing / Onboarding (`/`)

**Fungsi:** Halaman pertama yang dilihat peserta.

- Framing singkat: "bukan kuis, ini cermin cara kamu bicara"
- Input nama/inisial (opsional)
- Consent notice GDPR sebelum mulai — peserta harus setuju bahwa jawaban disimpan sementara
- Tombol "Mulai" → generate `sessionId` di localStorage → redirect ke `/chat`

### Chat Check-in (`/chat`)

**Fungsi:** Interface utama peserta, bergaya chat/WhatsApp.

- Menampilkan skenario aktif berikutnya (yang belum pernah dijawab oleh `sessionId` ini)
- Input jawaban bebas (textarea)
- Setelah submit → sistem deteksi pola di background → balasan netral ("Oke, dicatat")
- Setelah menjawab cukup skenario (default 4) → cermin pola muncul otomatis
- Tombol "Skenario berikutnya" untuk lanjut

### Cermin Pola (`/cermin`)

**Fungsi:** Menampilkan refleksi naratif pola bicara peserta.

- Mengambil semua respons peserta berdasarkan `sessionId`
- Menghitung jumlah toward vs away
- Mengisi template cermin dengan data aktual
- Ditampilkan sebagai refleksi, bukan skor/penilaian
- Tombol "Hapus data saya" untuk right to erasure (GDPR)

### Demo Teaser (`/teaser`)

**Fungsi:** Mode demo single-shot untuk sales.

- Tampilkan 1 skenario → peserta jawab
- Hasil instan langsung tampil (tanpa simpan ke database)
- CTA: "Mau ini untuk seluruh timmu?" → link ke kontak Het NLP Instituut

### Admin Login (`/admin/login`)

**Fungsi:** Form login admin sederhana.

- Input email + password
- Validasi terhadap tabel `Admin` di database
- Session cookie setelah berhasil login

### Admin Dashboard (`/admin`)

**Fungsi:** Ringkasan data CMS.

- Jumlah skenario aktif per bahasa
- Jumlah respons masuk (agregat)
- Navigasi ke halaman kelola

### Admin Skenario (`/admin/scenarios`)

**Fungsi:** CRUD skenario.

- List semua skenario (dengan filter bahasa & kategori)
- Tambah/edit/hapus skenario
- Toggle active/inactive
- Atur urutan tampil

### Admin Keyword (`/admin/keywords`)

**Fungsi:** CRUD keyword deteksi pola.

- List keyword (filter per bahasa, kategori, direction)
- Tambah/edit/hapus keyword
- Setiap keyword punya direction: `toward` atau `away`

### Admin Template (`/admin/templates`)

**Fungsi:** CRUD template cermin pola.

- List template (filter per bahasa & kategori)
- Tambah/edit/hapus template
- Gunakan placeholder `{count}`, `{toward_count}`, `{away_count}`, `{dominant_pattern}`

---

## API Reference

### Public (Peserta)

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/api/scenario/next?sessionId=&lang=` | Ambil skenario berikutnya yang belum dijawab |
| `POST` | `/api/response` | Submit jawaban → deteksi pola → simpan |
| `GET` | `/api/mirror?sessionId=` | Generate cermin pola dari histori respons |
| `POST` | `/api/teaser` | Mode single-shot: 1 jawaban → hasil instan |

### Admin (Auth Required)

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/admin/login` | Login admin |
| `POST` | `/api/admin/logout` | Logout admin |
| `GET` / `POST` | `/api/admin/scenarios` | List & buat skenario |
| `PATCH` / `DELETE` | `/api/admin/scenarios/[id]` | Update & hapus skenario |
| `GET` / `POST` | `/api/admin/keywords` | List & buat keyword |
| `PATCH` / `DELETE` | `/api/admin/keywords/[id]` | Update & hapus keyword |
| `GET` / `POST` | `/api/admin/templates` | List & buat template |
| `PATCH` / `DELETE` | `/api/admin/templates/[id]` | Update & hapus template |

---

## Database Schema

```
┌─────────────────┐     ┌─────────────────┐
│    Scenario      │     │     Keyword      │
├─────────────────┤     ├─────────────────┤
│ id        (PK)  │     │ id        (PK)  │
│ language        │     │ language        │
│ text            │     │ category        │
│ category        │     │ phrase          │
│ order           │     │ direction       │
│ active          │     │ createdAt       │
│ createdAt       │     └─────────────────┘
│ updatedAt       │
│ responses[] ────┼──┐   ┌─────────────────┐
└─────────────────┘  │   │ MirrorTemplate  │
                     │   ├─────────────────┤
┌─────────────────┐  │   │ id        (PK)  │
│    Response      │  │   │ language        │
├─────────────────┤  │   │ category        │
│ id        (PK)  │  │   │ template        │
│ sessionId       │  │   │ active          │
│ scenarioId (FK)─┼──┘   │ createdAt       │
│ text            │       └─────────────────┘
│ detectedDirection│
│ matchedKeywords[]│      ┌─────────────────┐
│ createdAt       │       │     Admin        │
│ expiresAt       │       ├─────────────────┤
└─────────────────┘       │ id        (PK)  │
                          │ email     (UQ)  │
                          │ passwordHash    │
                          └─────────────────┘
```

**Relasi:**
- `Scenario` → `Response[]` (one-to-many, cascade delete)
- `Response.scenarioId` → `Scenario.id` (foreign key)

---

## Core Logic — Deteksi Pola

Sistem menggunakan **keyword matching heuristik** (bukan ML classifier):

1. Ambil `Response.text`, lowercase
2. Cocokkan terhadap daftar `Keyword` (filter per `language` dan `category`)
3. Hitung jumlah match `toward` vs `away`
4. Simpan `detectedDirection` di respons: `toward` / `away` / `neutral`
5. Simpan `matchedKeywords[]` untuk transparansi
6. Generate cermin pola: agregasi seluruh respons per `sessionId` → isi ke `MirrorTemplate`

File terkait:
- `src/lib/pattern-detector.ts` — logika deteksi pola
- `src/lib/mirror-generator.ts` — generate cermin dari template

---

## Multi-Bahasa

Aplikasi mendukung 3 bahasa: **Indonesia (id)**, **English (en)**, **Nederlands (nl)**.

- Setiap `Scenario`, `Keyword`, dan `MirrorTemplate` punya field `language`
- Peserta memilih bahasa di onboarding
- API filter konten berdasarkan parameter `lang`
- Teks UI (label, tombol) dikelola di `src/lib/i18n.ts`

---

## PWA (Progressive Web App)

Aplikasi dikonfigurasi sebagai PWA via Serwist:

- Service worker: `src/app/sw.ts`
- Config: `next.config.ts` (disabled di development)
- Output: `public/sw.js`
- Peserta bisa "install" aplikasi di homescreen HP

---

## GDPR & Privacy

Karena klien berbasis di Belanda (EU), aplikasi menerapkan privacy-by-design:

- **Data minimization** — hanya simpan `sessionId`, teks jawaban, dan hasil deteksi
- **Consent** — modal consent di onboarding sebelum data disimpan
- **Right to erasure** — peserta bisa hapus data sendiri tanpa login
- **Data retention** — field `expiresAt` di `Response` untuk auto-delete terjadwal
- **Anonim** — tidak ada akun peserta, hanya `sessionId` lokal

---

## Struktur Folder

```
nlp-institute/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (skenario, keyword, template, admin)
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing / Onboarding
│   │   ├── globals.css        # Global styles
│   │   ├── sw.ts              # Service worker (PWA)
│   │   ├── chat/              # Chat check-in page
│   │   ├── cermin/            # Cermin pola page
│   │   ├── teaser/            # Demo teaser page
│   │   ├── admin/
│   │   │   ├── login/         # Admin login
│   │   │   ├── layout.tsx     # Admin layout (auth guard)
│   │   │   ├── page.tsx       # Admin dashboard
│   │   │   ├── scenarios/     # CRUD skenario
│   │   │   ├── keywords/      # CRUD keyword
│   │   │   └── templates/     # CRUD template cermin
│   │   └── api/
│   │       ├── admin/         # Admin API routes
│   │       ├── scenario/      # Scenario API (next)
│   │       ├── response/      # Submit response API
│   │       ├── mirror/        # Generate mirror API
│   │       └── teaser/        # Teaser API
│   ├── components/
│   │   ├── chat/              # Chat UI components
│   │   ├── layout/            # Layout components
│   │   └── consent-modal.tsx  # GDPR consent modal
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       ├── auth.ts            # Admin auth utilities
│       ├── session.ts         # Session management
│       ├── pattern-detector.ts # Toward/away detection logic
│       ├── mirror-generator.ts # Mirror template rendering
│       ├── i18n.ts            # Internationalization strings
│       └── utils.ts           # General utilities
├── .env.example               # Environment variable template
├── docker-compose.yml         # PostgreSQL local dev
├── next.config.ts             # Next.js + Serwist config
├── railway.json               # Railway deployment config
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies & scripts
```

---

## Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan development server (dengan webpack, tanpa PWA) |
| `npm run build` | Build production (`prisma generate && next build`) |
| `npm run start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |
| `npm run seed` | Seed database dengan data awal |
| `npx prisma studio` | Buka Prisma Studio (GUI database browser) |
| `npx prisma db push` | Push schema ke database |
| `npx prisma generate` | Generate Prisma Client |
| `docker compose up -d` | Jalankan PostgreSQL via Docker |
| `docker compose down` | Hentikan PostgreSQL Docker |

---

## License

Private project — Het NLP Instituut × UMM Hackathon.
