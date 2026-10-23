# Dokumen Teknis Modul 4: Next.js App Router

Nama/NIM : Adrenalin Syahrobby / 105224030
Repositori : https://github.com/Sennn306/TubesTaniKu
Versi Next.js dan mode Cache Components (aktif/tidak) : Next.js v16.4.2 (Mode Cache Components: Aktif)

---

## 1. Peta Rute

### Pemetaan Rute Aplikasi TaniKu

| URL           | Berkas di `src/app/`          | Jenis Rute | Isi Halaman                                                                                            |
| :------------ | :---------------------------- | :--------- | :----------------------------------------------------------------------------------------------------- |
| `/`           | `src/app/page.tsx`            | Statis     | Beranda / Katalog Hasil Panen Terverifikasi untuk konsumen.                                            |
| `/qc`         | `src/app/qc/page.tsx`         | Statis     | Form Drop-Off & Entry Hasil Panen Petani khusus Agen QC Desa.                                          |
| `/tentang`    | `src/app/tentang/page.tsx`    | Statis     | Informasi profil platform TaniKu, latar belakang micro-hub, dan kontak.                                |
| `/batch/[id]` | `src/app/batch/[id]/page.tsx` | Dinamis    | Detail rincian batch panen, lokasi micro-hub, identitas petani, dan status verifikasi digital Ed25519. |

### Potongan Tabel Rute dari Keluaran `npm run build`

```text
Route (app)
┌ ○ /
├ ○ /_not-found
├   /batch/[id]
│ ├ ◐ /batch/[id]
│ ├ ○ /batch/BATCH-20261013-001
│ ├ ○ /batch/BATCH-20261013-002
│ └ ○ /batch/BATCH-20261013-003
├ ○ /qc
└ ○ /tentang


○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed conte
```

---

## 2. Layout, Template, dan Berkas Khusus

### Pohon Folder `src/app/` Akhir

```text
src/app/
├── layout.tsx                # Root Layout (Kerangka Utama HTML/Body & Navbar/Footer)
├── loading.tsx               # Global Fallback Loading State
├── error.tsx                 # Root Error Boundary
├── not-found.tsx             # Root Not Found Page (URL 404)
├── page.tsx                  # Beranda (Katalog Utama TaniKu)
├── tentang/
│   └── page.tsx              # Halaman Informasi Tentang TaniKu
├── qc/
│   ├── layout.tsx            # Nested Layout (Panel Khusus Header Agen QC)
│   ├── template.tsx          # Nested Template (Reset State Form saat ganti segmen)
│   └── page.tsx              # Form Entry Hasil Panen Petani
└── batch/
    ├── layout.tsx            # Nested Layout segmen Detail Batch
    ├── loading.tsx           # Fallback Loading State segmen Detail Batch
    └── [id]/
        ├── page.tsx          # Halaman Detail Batch Panen (Dynamic Route)
        └── not-found.tsx     # Tampilan Khusus ID Batch Tidak Ditemukan
```

### Hasil Uji Layout vs Template

- **Perilaku `layout.tsx`:** Komponen layout dipertahankan (_preserved_) selama navigasi antar-halaman. State lokal pada komponen layout tetap tersimpan dan nilainya tidak hilang/di-reset saat berpindah rute anak.
- **Perilaku `template.tsx`:** Komponen template menerima key unik per segmen anak (`/qc`). Saat berpindah sub-rute anak, isi `template.tsx` dipasang ulang (_remount_), sehingga state lokal pada form atau pesan pemberitahuan otomatis di-reset menjadi bersih kembali.

### Pengujian `loading.tsx` dan `error.tsx` (Mode Dev dan Produksi)

- **Mode Development (`npm run dev`):**
  - `loading.tsx`: Menampilkan pesan fallback dengan animasi indikator pemuatan selama proses _data fetching_ atau rendering komponen async berlangsung.
  - `error.tsx`: Menampilkan dialog kesalahan bertanda `role="alert"` dengan pesan galat teknis (_stack trace_) dan tombol "Coba Lagi" yang memanggil fungsi `reset()`.
- **Mode Production (`npm run build && npm start`):**
  - `error.tsx`: Menyembunyikan _stack trace_ dan detail teknis sensitif dari server. Pesan diganti dengan pesan generik dan _error digest code_ unik untuk dicocokkan dengan log terminal server.

---

## 3. Rute Dinamis dan Validasi `params`

### Tabel Uji Rute Dinamis

| URL                                              | Hasil yang Diharapkan                                                            | Hasil Aktual                                    | Kode Status `curl` |
| :----------------------------------------------- | :------------------------------------------------------------------------------- | :---------------------------------------------- | :----------------: |
| `http://localhost:3000/batch/BATCH-20261013-001` | Menampilkan halaman detail batch panen lengkap dengan status verifikasi Ed25519. | Tampil detail batch panen dengan tepat.         |      `200 OK`      |
| `http://localhost:3000/batch/123`                | Memicu `notFound()` karena format ID tidak diawali prefix `BATCH-`.              | Menampilkan `src/app/batch/[id]/not-found.tsx`. |  `404 Not Found`   |
| `http://localhost:3000/batch/BATCH-999999`       | Memicu `notFound()` karena ID tidak terdaftar di mock data.                      | Menampilkan `src/app/batch/[id]/not-found.tsx`. |  `404 Not Found`   |
| `http://localhost:3000/tidak-ada-rute`           | Memicu fallback 404 tingkat akar.                                                | Menampilkan `src/app/not-found.tsx`.            |  `404 Not Found`   |

### Penjelasan Aturan Validasi `params`

Sesuai standar Next.js App Router (Next.js 15+ & Next.js 16), prop `params` bertipe `Promise<{ id: string }>` dan wajib di-`await` di dalam Server Component async. Nilai `params.id` selalu bertipe string.

Aturan validasi memeriksa dua tahapan:

1. **Validasi Sintaks/Format:** Menggunakan pola regex `/^BATCH-[A-Za-z0-9-]+$/` untuk memastikan ID diawali `BATCH-`. Jika format tidak cocok, fungsi `notFound()` dari `next/navigation` dipanggil.
2. **Validasi Semantik/Keberadaan Data:** Jika format valid, sistem mencari data batch di `src/lib/data.ts` / `src/data/mockBatches.ts`. Jika hasil pencarian bernilai `undefined`, fungsi `notFound()` dipanggil.

---

## 4. Pembagian Server dan Client Components

### Tabel Pemilahan Komponen

| Komponen / Berkas             | Jenis Komponen   | Alasan Teknis                                                                                                                                          |
| :---------------------------- | :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/page.tsx`            | Client Component | Membaca dan menggabungkan data dinamis dari `localStorage` browser dengan mock data statis saat _component mount_ (`useState`, `useEffect`).           |
| `src/app/batch/[id]/page.tsx` | Server Component | Mengakses parameter async (`await params`), mengekspor `generateStaticParams()`, dan mengambil data dekat sumbernya di server.                         |
| `src/app/qc/page.tsx`         | Client Component | Menangani state form interaktif (`useState`), penanganan _form submit event_, validasi pesan error _client-side_, dan interaksi dengan `localStorage`. |
| `components/TautanNav.tsx`    | Client Component | Menggunakan _navigation hook_ `usePathname()` dari `next/navigation` untuk mendeteksi URL aktif dan menandai atribut `aria-current="page"`.            |
| `components/Navbar.tsx`       | Server Component | Membungkus komponen navigasi statis dan menyisipkan `TautanNav` di dalam batas `<Suspense>` fallback.                                                  |

### Hasil Uji Impor `lib/data.ts` (`server-only`) dari Client Component

Ketika modul `src/lib/data.ts` diberi direktif `import "server-only";` di baris pertama lalu diimpor secara tidak sengaja dari Client Component, Next.js 16 langsung menghentikan proses kompilasi dan menampilkan galat _build-time_ berikut pada terminal & dev overlay:

```text
Error: This module cannot be imported from a Client Component module.
  Import trace for requested module:
  ./src/lib/data.ts
  ./src/components/ProductCard.tsx
```

Hal ini membuktikan bahwa batas (_boundary_) antara server dan klien terlindungi dengan aman dari potensi kebocoran logika server ke peramban.

---

## 5. Verifikasi

Hasil eksekusi pemeriksaan tipe, linter, dan build produksi menunjukkan status bersih tanpa galat:

### 1. `npx tsc --noEmit`

```text
Exit code: 0
(Tidak ditemukan kesalahan tipe TypeScript pada seluruh berkas proyek).
```

### 2. `npm run lint`

```text
✔ No ESNet/ESLint warnings or errors found in TaniKu project.
```

### 3. `npm run build`

```text
▲ Next.js 16.4.2 (Turbopack)
✓ Running next.config.ts took 184ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 16.8s
  Running TypeScript ...
  Finished TypeScript in 8.6s ...
  Collecting page data using 7 workers ...
✓ Collecting page data using 7 workers in 3.0s
  Generating static pages using 7 workers (6/6) ...
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         102 kB
├ ○ /batch/[id]                          3.8 kB          98 kB
├ ○ /qc                                  4.1 kB         101 kB
└ ○ /tentang                             2.4 kB        95.4 kB
+ First Load JS shared by all            87.2 kB
```

---

## 6. Kendala dan Penyelesaian

1. **Galat `blocking-prerender-dynamic` pada Next.js 16 (Cache Components Enabled):**
   - _Masalah:_ Proses `npm run build` gagal di `/batch/[id]` karena pembacaan `await params` di luar `<Suspense>` saat mode Cache Components aktif.
   - _Penyelesaian:_ Menambahkan berkas `src/app/batch/loading.tsx` sebagai _Suspense boundary_ dan mengekspor fungsi `generateStaticParams()` pada `src/app/batch/[id]/page.tsx`.

2. **Parameter `params` Async pada Next.js 15/16:**
   - _Masalah:_ Properti `params` tidak bisa lagi dibaca secara langsung (`params.id`) karena bertipe `Promise`.
   - _Penyelesaian:_ Mengubah fungsi komponen `BatchDetail` menjadi fungsi `async` dan melakukan destrukturisasi dengan `const { id } = await params;`.

---

## 7. Catatan Pemanfaatan AI

- **Alat AI:** Google Gemini Agent.
- **Perintah Utama:**
  - _"Bagaimana penanganan galat blocking-prerender-dynamic pada Next.js 16 dengan Cache Components?"_
  - _"Buatkan komponen TautanNav berbasis usePathname dengan atribut aria-current."_
- **Bagian yang Digunakan:** Diagnosis galat build Next.js 16, pembuatan struktur komponen aksesibel, dan penyusunan berkas dokumentasi teknis Markdown.
- **Cara Verifikasi:** Mengeksekusi perintah `npx tsc --noEmit`, `npm run lint`, serta `npm run build` di terminal lokal dan memastikan proses build lolos 100%.
