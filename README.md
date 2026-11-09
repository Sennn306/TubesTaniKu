# TaniKu — Hyper-Local Micro-Hub Platform (v0.2)

TaniKu adalah platform aplikasi web rantai pasok pertanian terintegrasi yang dirancang untuk memotong rantai distribusi panjang dari petani ke konsumen secara langsung (_direct-to-consumer_ & _direct-to-business_). Melalui jaringan **Micro-Hub Desa**, **Verifikasi Mutu (Quality Control)**, dan pencatatan persisten berbasis PostgreSQL serta verifikasi kriptografi, TaniKu memastikan kepastian harga adil bagi petani serta transparansi kualitas bahan pangan segar bagi konsumen.

Proyek ini dikembangkan secara terintegrasi untuk memenuhi milestone perkuliahan **Pengembangan Aplikasi Web**, **Kriptografi**, dan **Keamanan Komputasi & Siber** di Universitas Pertamina.

---

## 🚀 Perkembangan Produk (v0.1 → v0.2)

Pada versi rilis **v0.2 (Milestone 2)**, TaniKu melakukan migrasi besar dari simulasi data sementara (_in-memory mock data_) menuju arsitektur _server-side_ yang penuh dan persisten:

1. **Integrasi PostgreSQL & Prisma ORM 7**: Implementasi basis data relasional PostgreSQL menggunakan Prisma Client terbaru dengan adapter `@prisma/adapter-pg`.
2. **Pemodelan Entitas Relasional 1:N**: Penyusunan skema dua entitas utama yang saling berelasi, yaitu `BatchPanen` (entitas induk) dan `QualityCheck` (entitas anak) dengan aturan proteksi integritas `onDelete: Restrict`.
3. **Logika Server & Server Actions**: Pengalihan seluruh fungsi pengelolaan data (CRUD) ke Next.js Server Actions dengan penanganan transaksi atomik (`prisma.$transaction`).
4. **Validasi Sisi Server (Zod)**: Penerapan validasi skema Zod pada seluruh masukan formulir untuk menjamin keabsahan tipe data, rentang nilai, serta penanganan galat duplikasi unik PostgreSQL (`P2002`).
5. **Data Pengujian & Seeding**: Penyediaan skema migrasi dan skrip _seeding_ idempoten (`prisma/seed.ts`) untuk memuat data sintetis pengujian awal.

---

## 🎯 Konsep & Permasalahan Produk

- **Permasalahan:** Rantai pasok pertanian tradisional yang terfragmentasi dan didominasi tengkulak menyebabkan margin keuntungan petani sangat kecil, risiko pemalsuan grade mutu panen, serta tingginya lonjakan harga di tingkat konsumen akhir.
- **Sasaran Pengguna:**
  1. **Petani & Agen QC Desa:** Mencatat, memverifikasi, mengulas mutu, dan melakukan digitalisasi grade hasil panen di titik kumpul (Micro-Hub).
  2. **Konsumen / Pembeli Bisnis (D2C/D2B):** Membeli komoditas pertanian segar yang terverifikasi mutu dan dapat dilacak asal-usulnya.

---

## 🌟 Fitur Utama Milestone 2

1. **Katalog & Detail Batch Panen Persisten (`/katalog` & `/katalog/[id]`):** Tampilan etalase dan pelacakan batch panen yang dibaca langsung dari PostgreSQL via Prisma Client.
2. **Portal Pengelolaan Batch Panen (`/batch` & `/katalog/tambah`):** Formulir penambahan dan perbaruan data batch panen dengan validasi Zod _server-side_ dan penolakan duplikat nama petani & komoditas.
3. **Pencatatan Inspeksi Mutu (`QualityCheck`):** Agen QC dapat menambahkan catatan hasil uji mutu, skor (1–5), dan nama pemeriksa pada setiap entitas batch panen.
4. **Penghapusan Transaksional**: Fitur penghapusan batch panen yang mengeksekusi transaksi atomik untuk membersihkan seluruh riwayat `QualityCheck` terkait sebelum menghapus entitas `BatchPanen`.
5. **Verifikasi Kriptografi (Ed25519)**: Modul penandatanganan digital data batch panen untuk menjamin integritas data dari potensi manipulasi.

---

## 📊 Pemodelan Data & Skema Database

Skema basis data dirancang menggunakan Prisma ORM 7 dengan dua entitas utama:

- **`BatchPanen`**: Menyimpan data identitas petani (`farmerName`), komoditas (`commodityName`), berat (`weightKg`), grade mutu (`grade`), status organik (`isOrganic`), dan waktu pembuatan (`createdAt`).
- **`QualityCheck`**: Menyimpan riwayat inspeksi mutu yang terhubung ke `BatchPanen` via `batchId`, mencakup nama pemeriksa (`inspectorName`), skor (`score`), catatan (`notes`), dan waktu inspeksi (`checkedAt`).

---

## 🛠️ Teknologi yang Digunakan

- **Framework Web:** Next.js 15+ (React 19, TypeScript, App Router, Server Actions)
- **Basis Data:** PostgreSQL
- **ORM & Database Client:** Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`, `@prisma/pg-worker`)
- **Validasi Data:** Zod
- **Styling & UI:** Tailwind CSS & Lucide Icons
- **Pengujian Unit & Kriptografi:** Jest & `ts-jest` (Node.js `crypto` Ed25519)
- **Aksesibilitas & Kinerja:** Google Chrome Lighthouse

---

## ⚙️ Petunjuk Menjalankan Aplikasi

### 1. Prasyarat Sistem

- Node.js versi 18.x atau lebih baru
- PostgreSQL Server yang sedang aktif

### 2. Kloning & Instalasi Dependensi

```bash
git clone [https://github.com/Sennn306/tubestaniku.git](https://github.com/Sennn306/tubestaniku.git)
cd tubestaniku
npm install
```
