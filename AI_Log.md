# AI Log - Komponen Kriptografi TaniKu (v0.1)

## Alat yang Digunakan

- Gemini (Google AI)

## Tujuan

Merancang modul Digital Signature (Ed25519) untuk keabsahan QR Code batch panen TaniKu serta menyusun skenario uji otomatis.

## Ringkasan Perintah & Output

- **Prompts:** Permintaan perancangan modul kriptografi dasar, pengujian otomatis, dan dokumentasi README sesuai rubrik Sub-CPMK 3.
- **Bagian yang Digunakan:** Struktur modul `batchSigner.ts`, pengujian `batchSigner.test.ts`, dan dokumentasi `README.md`.
- **Pemeriksaan:** Pengujian dijalankan menggunakan `npm test` dengan hasil 4/4 tes berhasil (_PASS_).

# AI Log - Bagian Pengembangan Web (TaniKu v0.1)

## 📅 Ringkasan Informasi Sesi

- **Fokus Utama:** Restrukturisasi Proyek Web (Next.js), Komponen UI, Dynamic Routes, Integrasi `localStorage`, dan Resolusi Konfigurasi TypeScript/Jest.
- **Hasil Akhir:** Rilis Antarmuka Web TaniKu v0.1 (Katalog Konsumen, Portal Agen QC, dan Detail Batch).

---

## 🛠️ Riwayat Interaksi & Diskusi Utama

### 1. Rekonstruksi Proyek Murni Modul 1

- **Permasalahan:** Terjadi konflik direktori dan struktur bawaan Next.js yang terikat dengan proyek terdahulu saat inisialisasi awal.
- **Instruksi Pengembang:** Menginginkan cara pembersihan total berbasis instruksi Modul 1 tanpa error.
- **Solusi AI:**
  - Mengamankan modul kriptografi `src/batchSigner.ts` dan folder `test/` ke direktori sementara.
  - Melakukan re-inisialisasi proyek menggunakan `npx create-next-app@latest tubestaniku` dengan memilih opsi _recommended defaults_ (TypeScript, Tailwind CSS, App Router, `@/*` path alias).
  - Mengembalikan modul kriptografi dan menyelaraskan dependensi `package.json`.

---

### 2. Resolusi Path Alias `@/*` dan Error Transpilation Component

- **Permasalahan:** Muncul galat `Cannot find module '@/data/mockBatches'` pada komponen `ProductCard.tsx` dan panel _Problems_ VS Code.
- **Solusi AI:**
  - Konfigurasi ulang `"baseUrl": "."` dan `"paths": { "@/*": ["./src/*"] }` pada `tsconfig.json`.
  - Mengatasi duplikasi folder `app/` di tingkat root yang bentrok dengan `src/app/`.
  - Memberikan instruksi _Restart TS Server_ di VS Code untuk memperbarui indeks modul TypeScript.

---

### 3. Pemahaman Konsep Dynamic Routes (`[id]`)

- **Pertanyaan Pengembang:** Mengonfirmasi sintaks penamaan folder `src/app/batch/[id]/page.tsx` pada Next.js App Router.
- **Penjelasan AI:** Menjelaskan bahwa nama folder berkurung siku `[id]` merupakan penanda _Dynamic Route_ dalam Next.js App Router untuk menangkap _URL parameter_ secara dinamis (misal: `/batch/BATCH-20261013-001`) melalui props `params.id`.

---

### 4. Integrasi Persistensi Data Lokal (`localStorage`)

- **Permasalahan:** Data panen baru yang di-submit melalui Portal Agen QC (`/qc`) tidak muncul secara otomatis di Katalog Utama (`/`).
- **Solusi AI:**
  - Menambahkan alur penyimpanan `localStorage.setItem('taniku_batches', ...)` pada penanganan formulir `src/app/qc/page.tsx`.
  - Mengubah `src/app/page.tsx` menjadi Client Component (`'use client'`) untuk membaca dan menggabungkan data `localStorage` dengan mock data statis secara dinamis saat _component mount_.

---

### 5. Penyelarasan Lingkungan Pengujian Kriptografi (Jest vs. Next.js SWC)

- **Permasalahan:** Eksekusi `npm test` mengalami kegagalan sintaks (`Unexpected token`) karena Jest membaca _Babel parser_ bawaan Next.js untuk memproses file TypeScript test.
- **Solusi AI:**
  - Memasang `ts-jest` dan `@types/jest` sebagai dependensi pengembangan.
  - Membuat berkas konfigurasi `jest.config.js` untuk menegaskan eksekusi pengujian berkas `.ts` secara khusus menggunakan `ts-jest`, memisahkan parser pengujian dari kompilator UI Next.js.

---

## 📈 Verifikasi Akhir Kualitas AI & Web

1. **Pengujian Kriptografi (Jest):** `PASS` (4 skenario uji lulus 100%).
2. **Kinerja & Aksesibilitas (Lighthouse):** Skor Accessibility ≥ 85 pada mode Desktop & Mobile.
3. **Respon Antarmuka:** Bebas galat konsol pada halaman Katalog (`/`), Portal Agen QC (`/qc`), dan Detail Batch (`/batch/[id]`).

---

## 📅 Sesi Keamanan & Komputasi Siber (14 Oktober 2026)

- **Fokus:** Analisis Ancaman & Risiko (Threat Modeling STRIDE & Risk Register) untuk Penanda `sec-0.1`.
- **Aktivitas:**
  1. Membuat `docs/sec/asset-inventory.md` untuk pemetaan komponen dan data sensitif TaniKu v0.1.
  2. Menyusun `docs/sec/dfd.md` dengan 2 Trust Boundary, ID Elemen DFD, dan penandaan Kriptografi Ed25519.
  3. Mengidentifikasi 10 ancaman spesifik berkategori STRIDE pada `docs/sec/threat-model.md`.
  4. Menyusun `docs/sec/risk-register.md` berisi evaluasi Likelihood/Impact berbasis kondisi nyata produk dan 5 rencana kontrol prioritas untuk Tugas 2 & 3.

  ***

_Log ini disusun otomatis sebagai lampiran bukti transparansi penggunaan AI Assistant dalam pemenuhan Milestone 1 TaniKu._
