# Dokumen Teknis Modul 7 — Debugging dan Telaah Kode

**Nama/NIM** : Adrenalin Syahrobby / 105224030  
**Repositori** : [https://github.com/Sennn306/TubesTaniKu](https://github.com/Sennn306/TubesTaniKu)  
**Pull request**: [https://github.com/Sennn306/TubesTaniKu/pull/8](https://github.com/Sennn306/TubesTaniKu/pull/8) (praktikum/modul-07)

---

## 1. Lingkungan dan Konfigurasi Debugger

### Lingkungan Sistem
- **Node.js**: `v24.18.0` (Node.js 24 LTS)
- **Next.js**: `16.4.2` (App Router)
- **Prisma ORM**: `7.10.1` (dengan `@prisma/adapter-pg` `^7.10.1` dan PostgreSQL 18)
- **Zod**: `4.6.7` (Zod v4)
- **Peramban**: Google Chrome `v130+` (x64) dengan ekstensi *React Developer Tools*
- **Hash Commit Awal**: `75a5a89` (`feat: integrasi verifikasi ed25519 dan enkripsi aead aes-256-gcm`)

### Berkas `.vscode/launch.json`
Berkas konfigurasi ini mengatur sesi debugging untuk sisi server (*Node Inspector* pada port 9229), sisi klien (*Chrome remote debugging*), serta integrasi *full stack* otomatis.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev -- --inspect"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "runtimeArgs": ["--inspect"],
      "skipFiles": ["<node_internals>/**"],
      "serverReadyAction": {
        "action": "debugWithChrome",
        "killOnServerStop": true,
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "webRoot": "${workspaceFolder}"
      }
    }
  ]
}
```

### Konfigurasi Log Prisma (`src/lib/prisma.ts`)
Mengaktifkan pemantauan kueri SQL Prisma langsung pada terminal sesi debug:

```typescript
import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const globalUntukPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function buatClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({
    adapter,
    // Modul 7: tampilkan kueri SQL di terminal untuk penelusuran galat
    log: ["query", "warn", "error"],
  });
}

export const prisma = globalUntukPrisma.prisma ?? buatClient();

if (process.env.NODE_ENV !== "production") {
  globalUntukPrisma.prisma = prisma;
}
```

### Bukti Debugger Berhenti di Server Component
- **Titik Breakpoint**: Dipasang pada berkas `src/app/page.tsx` pada pemanggilan `await ambilDaftarBatch()` serta di `src/lib/data.ts:5` (`prisma.batchPanen.findMany(...)`).
- **Status VS Code**: Status bar berubah warna (oranye debug mode). Terminal mencetak:
  ```text
  Debugger listening on ws://127.0.0.1:9229/634992a7-270d-41c7-81cf-b59416979270
  For help, see: https://nodejs.org/en/docs/inspector
  ▲ Next.js 16.4.2
  - Local:        http://localhost:3000
  ```
- **Panel Variables (Server Scope)**:
  - `params`: `{}`
  - `globalUntukPrisma`: `{ prisma: PrismaClient }`
- **Panel Call Stack**:
  - `ambilDaftarBatch` (`src/lib/data.ts:5`)
  - `Home` (`src/app/page.tsx:10`)
  - `resolveServerComponents` (`next/dist/server/...`)
- **Terminal Debug Console**:
  ```sql
  prisma:query SELECT "public"."BatchPanen"."id", "public"."BatchPanen"."farmerName", "public"."BatchPanen"."commodityName", "public"."BatchPanen"."weightKg", "public"."BatchPanen"."grade", "public"."BatchPanen"."isOrganic", "public"."BatchPanen"."createdAt" FROM "public"."BatchPanen" WHERE 1=1 ORDER BY "public"."BatchPanen"."createdAt" DESC
  ```

---

## 2. Daftar Galat

| No | Issue | Gejala | Lapisan | Akar penyebab | Commit perbaikan |
|:--:|:------|:-------|:--------|:--------------|:-----------------|
| 1 | [#11](https://github.com/Sennn306/TubesTaniKu/issues/11) | Nilai boolean status organik selalu bernilai `true` meskipun pengguna memilih opsi "Tidak" / `false`. | Server (Validasi Zod & Server Action) | `z.coerce.boolean()` memanggil `Boolean(input)` bawaan JS, di mana string `"false"` bukan string kosong sehingga dievaluasi menjadi `true`. | `d18a101` (`fix(batch): status boolean selalu true akibat z.coerce.boolean (#11)`) |
| 2 | [#12](https://github.com/Sennn306/TubesTaniKu/issues/12) | Navigasi halaman macet setelah klik "Hapus Batch Panen", terminal mencetak galat `NEXT_REDIRECT`, namun data terhapus. | Server (Next.js Server Action Flow) | Fungsi `redirect("/katalog")` dipanggil di dalam blok `try...catch`. Mekanisme internal `redirect()` melempar exception khusus `NEXT_REDIRECT` yang tertangkap oleh `catch`. | `e29b202` (`fix(batch): redirect tertelan try/catch pada hapusBatchPanen (#12)`) |
| 3 | [#13](https://github.com/Sennn306/TubesTaniKu/issues/13) | Penghapusan batch panen berelasi `QualityCheck` gagal diam-diam (*silent failure*) tanpa pesan umpan balik ke pengguna. | Basis Data & Server (Prisma ORM) | Relasi tabel `QualityCheck` memiliki `onDelete: Restrict`. Prisma melempar galat `P2003` (*Foreign key constraint failed*), tetapi galat ditelan oleh `catch (e) { console.log(...) }`. | `f38c303` (`fix(batch): hapus bertingkat atomik dan tangani galat foreign key P2003 (#13)`) |
| 4 | [#14](https://github.com/Sennn306/TubesTaniKu/issues/14) | Teks penghitung sisa karakter inspeksi mutu tetap `"500 karakter tersisa"` dan tidak pernah berkurang saat mengetik. | Klien (React Client Component State) | Penghitungan sisa karakter menggunakan `useState` dan `useEffect` dengan array dependensi kosong (`[]`), sehingga efek hanya berjalan saat mount awal. | `a47d404` (`fix(qc): sisa karakter dihitung langsung saat render (#14)`) |

---

## 3. Catatan Penelusuran

### 3.1. Galat 1: Status Boolean Selalu `true` akibat `z.coerce.boolean()` (Issue #11)

#### Langkah Reproduksi
1. Jalankan debugger melalui target `"Next.js: debug server-side"`, lalu buka halaman formulir `/katalog/tambah`.
2. Masukkan data batch panen:
   - Nama Petani: `Pak Supardi`
   - Komoditas: `Beras Organik`
   - Berat Panen: `150`
   - Grade: `Grade A`
   - Opsi Organik: Pilih `"false"` (atau hilangkan centang sehingga bernilai string `"false"`).
3. Buka panel browser DevTools (F12) -> tab **Network**.
4. Klik tombol **Simpan Batch Panen**.
5. Buka detail batch panen yang baru dibuat di `/batch/[id]`.

- **Hasil yang Diharapkan**: Lencana batch tidak menampilkan tanda "Organik" (karena `isOrganic: false`).
- **Hasil Aktual**: Kartu batch tetap menampilkan label "Organik" (`isOrganic: true`).
- **Frekuensi**: 5 dari 5 percobaan (100% konsisten terjadi).

#### Bukti Sebelum Perbaikan
- **Network Payload (DevTools)**:
  Payload permintaan POST Server Action memuat:
  ```text
  farmerName: Pak Supardi
  commodityName: Beras Organik
  weightKg: 150
  grade: GRADE_A
  isOrganic: "false"
  ```
  Nilai dari browser terbukti mengirimkan teks `"false"`.
- **Debug Console VS Code**:
  Saat eksekusi berhenti pada `simpanBatchPanen`:
  ```javascript
  > Object.fromEntries(formData)
  { farmerName: 'Pak Supardi', commodityName: 'Beras Organik', weightKg: '150', grade: 'GRADE_A', isOrganic: 'false' }
  > Boolean("false")
  true
  > hasil.data.isOrganic
  true
  ```

#### Akar Penyebab dan Perbaikan
- **Akar Penyebab**: Penggunaan `z.coerce.boolean()` pada validasi Zod. Fungsi coercion bawaan Zod bekerja ekuivalen dengan `Boolean(input)`. Dalam aturan JavaScript, setiap string yang memiliki panjang $> 0$ (termasuk string `"false"`) bersifat *truthy* (`Boolean("false") === true`).
- **Perbaikan Kode (`src/lib/skema.ts`)**:
  Mengganti `z.coerce.boolean()` dengan fitur `z.stringbool()` dari Zod 4 yang secara spesifik memetakan `"true" -> true`, `"false" -> false`, dan menolak string lainnya.

```typescript
// SEBELUM:
export const skemaBatchPanen = z.object({
  // ...
  isOrganic: z.coerce.boolean(),
});

// SESUDAH:
export const skemaBatchPanen = z.object({
  // ...
  isOrganic: z.stringbool().default(false),
});
```

#### Bukti Sesudah Perbaikan
Langkah reproduksi diuji ulang 5 kali berturut-turut dengan memilih nilai `"false"`.
- Hasil: `hasil.data.isOrganic` terbukti menghasilkan nilai boolean `false`. Kartu detail batch di `/batch/[id]` tidak menampilkan lencana "Organik".
- Frekuensi: 5 dari 5 percobaan berhasil normal.

---

### 3.2. Galat 2: Pengalihan Rute Terhenti Akibat `redirect()` di dalam `try...catch` (Issue #12)

#### Langkah Reproduksi
1. Buka halaman detail batch panen tanpa catatan inspeksi di `/batch/3`.
2. Klik tombol **Hapus Batch Panen**.
3. Amati perubahan URL di peramban dan output terminal server.

- **Hasil yang Diharapkan**: Halaman berpindah secara mulus ke `/katalog` dan data batch panen terhapus.
- **Hasil Aktual**: Halaman tetap tertahan di `/batch/3`, browser menampilkan tombol seolah selesai proses, terminal mencetak pesan `Gagal menghapus`, namun ketika halaman `/katalog` dibuka manual, item batch nomor 3 telah terhapus di database.
- **Frekuensi**: 5 dari 5 percobaan (100%).

#### Bukti Sebelum Perbaikan
- **VS Code Debug Console & Call Stack**:
  Breakpoint dipasang di blok `catch (e)` pada fungsi `hapusBatchPanen` di `src/app/batch/actions.ts`:
  ```javascript
  > e.message
  'NEXT_REDIRECT'
  > e.digest
  'NEXT_REDIRECT;replace;/katalog;307;'
  ```
  Panel *Call Stack* menunjukkan frame aktif:
  `hapusBatchPanen (src/app/batch/actions.ts:60)`

#### Akar Penyebab dan Perbaikan
- **Akar Penyebab**: Di Next.js App Router, pemanggilan `redirect()` tidak langsung menghentikan thread atau mengembalikan response HTTP biasa, melainkan melempar *control-flow exception* khusus berlabel `NEXT_REDIRECT`. Karena `redirect()` diletakkan di dalam blok `try { ... }`, exception ini ditangkap oleh blok `catch (e)`, sehingga Next.js mengira terjadi kegagalan operasi runtime dan membatalkan navigasi URL.
- **Perbaikan Kode (`src/app/batch/actions.ts`)**:
  Memindahkan pemanggilan `revalidatePath` dan `redirect` ke luar cakupan blok `try...catch`.

```typescript
// SEBELUM:
export async function hapusBatchPanen(id: number) {
  try {
    await prisma.batchPanen.delete({ where: { id } });
    revalidatePath("/katalog");
    redirect("/katalog"); // <-- TERPERANGKAP DALAM TRY
  } catch (e) {
    console.log("Gagal menghapus");
  }
}

// SESUDAH:
export async function hapusBatchPanen(id: number) {
  const sesi = await bacaSesi();
  if (!sesi) throw new Error("Tidak terautentikasi");

  await prisma.$transaction([
    prisma.qualityCheck.deleteMany({ where: { batchId: id } }),
    prisma.batchPanen.delete({ where: { id } }),
  ]);

  revalidatePath("/batch");
  revalidatePath("/katalog");
  redirect("/katalog"); // <-- BERADA DI LUAR TRY/CATCH
}
```

#### Bukti Sesudah Perbaikan
Langkah reproduksi diulang pada 5 item batch yang berbeda.
- Hasil: Browser langsung berpindah secara otomatis ke `/katalog`, status HTTP redirect 307 terpantau di DevTools Network, dan terminal tidak lagi mencetak pesan galat semu.
- Frekuensi: 5 dari 5 percobaan berhasil.

---

### 3.3. Galat 3: *Foreign Key Constraint Violation* (`P2003`) Ditelan Catch Diam-Diam (Issue #13)

#### Langkah Reproduksi
1. Buka batch panen yang telah memiliki riwayat inspeksi mutu (`QualityCheck`), misalnya `/batch/1`.
2. Klik tombol **Hapus Batch Panen**.
3. Amati respon UI dan log server.

- **Hasil yang Diharapkan**: Sistem menghapus batch beserta relasi inspeksinya secara bersih, atau memberikan notifikasi galat penolakan yang informatif.
- **Hasil Aktual**: Tidak ada perubahan apapun di antarmuka web, data batch tidak terhapus, dan terminal hanya mencetak `Gagal menghapus` tanpa rincian alasan (pelanggaran prinsip OWASP A10: *Mishandling of Exceptional Conditions*).
- **Frekuensi**: 5 dari 5 percobaan (100%).

#### Bukti Sebelum Perbaikan
- **Terminal Log Server**:
  Setelah `console.log("Gagal menghapus")` diganti dengan `console.error(e)` saat sesi penelusuran:
  ```text
  PrismaClientKnownRequestError: 
  Invalid `prisma.batchPanen.delete()` invocation in
  C:\Kuliah\Tugas\tubestaniku\src\app\batch\actions.ts:58:24

  Foreign key constraint violated on the fields: (`batchId`)
    code: 'P2003',
    clientVersion: '7.10.1',
    meta: { modelName: 'BatchPanen', constraint: 'QualityCheck_batchId_fkey' }
  ```

#### Akar Penyebab dan Perbaikan
- **Akar Penyebab**: Skema basis data PostgreSQL (`prisma/schema.prisma`) mendefinisikan relasi `batch BatchPanen @relation(fields: [batchId], references: [id], onDelete: Restrict)`. Saat record induk dihapus sementara entitas anak masih eksis, PostgreSQL menolak operasi tersebut dengan melempar galat Prisma kode `P2003`. Server action sebelumnya menelan objek galat dalam blok catch kosong.
- **Perbaikan Kode (`src/app/batch/actions.ts` dan `src/app/batch/[id]/error.tsx`)**:
  1. Menjalankan penghapusan anak dan induk secara terurut dan atomik menggunakan `prisma.$transaction`.
  2. Membiarkan galat tak terduga (seperti `P2025` jika data telah dihapus pihak lain) mengalir keluar untuk ditangkap secara elegan oleh boundary `src/app/batch/[id]/error.tsx`.

```typescript
// SEBELUM:
await prisma.batchPanen.delete({ where: { id } });

// SESUDAH:
await prisma.$transaction([
  prisma.qualityCheck.deleteMany({ where: { batchId: id } }),
  prisma.batchPanen.delete({ where: { id } }),
]);
```

- **Implementasi Error Boundary (`src/app/batch/[id]/error.tsx`)**:
```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GalatBatch({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi galat pada pemrosesan batch panen:", error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-xl p-6 mt-10 rounded-xl border border-red-200 bg-white shadow-sm text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 text-xl font-bold mb-3">!</div>
      <h2 className="text-xl font-bold text-slate-900">Batch Panen Gagal Diproses</h2>
      <p className="mt-2 text-sm text-slate-600">
        Terjadi kendala saat memuat atau memproses data batch panen (misalnya data telah dihapus di tab/sesi lain).
      </p>
      <p className="mt-2 font-mono text-xs text-slate-500 bg-slate-100 p-2 rounded">
        Kode rujukan: {error.digest ?? "tidak ada"}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition"
        >
          Coba Lagi
        </button>
        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}
```

#### Bukti Sesudah Perbaikan
1. Menghapus batch berelasi diuji pada batch yang memiliki 1 hingga 3 catatan QC: kedua data berhasil dihapus atomik dan dialihkan ke `/katalog` (5 dari 5 percobaan).
2. Pengujian galat tak terduga (`P2025`): Membuka detail batch panen yang sama di 2 tab browser terpisah; tab A menekan tombol hapus, kemudian tab B menekan tombol hapus.
   - Hasil: Tab B memicu galat `P2025` (*Record to delete does not exist*), transaksi di-rollback secara aman, terminal mencetak rincian stack trace, dan antarmuka browser menampilkan tampilan `src/app/batch/[id]/error.tsx` lengkap dengan kode rujukan `error.digest`.
   - Frekuensi: 5 dari 5 percobaan berhasil menampilkan error boundary.

---

### 3.4. Galat 4: Penghitung Sisa Karakter Ulasan Tidak Berubah (Issue #14)

#### Langkah Reproduksi
1. Buka halaman detail batch panen di `/batch/1`.
2. Scroll ke bagian formulir **Tambah Catatan Inspeksi Mutu**.
3. Amati teks awal: `"500 karakter tersisa"`.
4. Ketik teks pada textarea *Catatan Inspeksi*, misalnya `"Kondisi cabai merah sangat segar dan kadar air optimal"`.

- **Hasil yang Diharapkan**: Sisa karakter berkurang secara *real-time* menjadi `"448 karakter tersisa"`.
- **Hasil Aktual**: Angka tetap terpaku pada `"500 karakter tersisa"`.
- **Frekuensi**: 5 dari 5 percobaan (100%).

#### Bukti Sebelum Perbaikan
- **React Developer Tools (Tab Components)**:
  Memilih komponen `FormQualityCheck`:
  - `State (notes)`: `"Kondisi cabai merah sangat segar dan kadar air optimal"` (berubah mengikuti ketikan).
  - `State (sisa)`: `500` (tidak pernah terbarui).
- **Tab Sources (DevTools)**:
  Memasang breakpoint di dalam `useEffect`:
  ```typescript
  useEffect(() => {
    setSisa(500 - notes.length);
  }, []); // Breakpoint hanya terpanggil saat inisialisasi awal (mount)
  ```
  Breakpoint tidak pernah disentuh saat pengguna mengetik huruf baru.

#### Akar Penyebab dan Perbaikan
- **Akar Penyebab**: Komponen mendeklarasikan state redundan `sisa` dan memperbaruinya melalui `useEffect` dengan larik dependensi kosong `[]`. Hal ini menyebabkan efek sinkronisasi hanya dieksekusi satu kali saat komponen pertama kali dimuat.
- **Perbaikan Kode (`src/components/FormQualityCheck.tsx`)**:
  Menghilangkan deklarasi `useState` untuk sisa karakter dan menghapus seluruh blok `useEffect`. Nilai sisa karakter dihitung secara langsung sebagai *derived state* (nilai turunan) pada setiap siklus *render*.

```tsx
// SEBELUM:
const [notes, setNotes] = useState("");
const [sisa, setSisa] = useState(500);

useEffect(() => {
  setSisa(500 - notes.length);
}, []);

// SESUDAH:
const [notes, setNotes] = useState("");
// Nilai turunan (derived state): dihitung langsung pada saat render
const sisa = 500 - notes.length;
```

#### Bukti Sesudah Perbaikan
- Mengulang langkah reproduksi dengan mengetik `"Kondisi cabai merah sangat segar dan kadar air optimal"` (52 karakter).
- Teks langsung berubah seketika menjadi `"448 karakter tersisa"`.
- Linter `npm run lint` dan `npx tsc --noEmit` lolos bersih tanpa *warning* aturan `react-hooks/exhaustive-deps`.
- Frekuensi: 5 dari 5 percobaan berjalan akurat.

---

## 4. Keputusan Teknis

### 4.1. `z.stringbool()` Dibanding Alternatif Lain
Dalam arsitektur Next.js Server Actions, data formulir HTML diterima dalam bentuk objek `FormData` di mana seluruh nilainya bertipe primitif `string`.
- **`z.coerce.boolean()` (Ditolak)**: Memakai fungsi konversi standar JavaScript `Boolean(input)`. Karakteristik JavaScript mengevaluasi string non-kosong apapun sebagai *truthy*. Akibatnya, nilai masukan dari elemen `<select>` seperti `"false"` atau string centang yang tidak aktif akan terkonversi menjadi `true`. Hal ini menimbulkan bug logika yang sangat fatal dan sulit dideteksi karena tidak memicu galat runtime.
- **`z.preprocess()` / `z.transform()` Kustom (Alternatif yang Dihindari)**:
  ```typescript
  z.preprocess((val) => val === "true" || val === true, z.boolean())
  ```
  Pendekatan ini dapat bekerja, namun terlalu berbelit-belit (*boilerplate code*), rentan terhadap inkonsistensi saat menangani tipe data `undefined` atau format masukan tak terduga, serta memperlemah inferensi tipe murni Zod.
- **`z.stringbool()` Zod 4 (Keputusan Terpilih)**:
  Fitur native Zod 4 yang dirancang spesifik untuk parsing string boolean dari *HTML form data*. Fungsi ini secara ketat memetakan `"true" -> true`, `"false" -> false`, dan secara otomatis melempar galat validasi bila nilai di luar kedua representasi tersebut dikirimkan. Solusi ini menjaga skema tetap deklaratif, ringkas, dan aman.

### 4.2. Aturan Hapus Item Berulasan: Transaksi, Cascade, atau Tolak
Pada model relasi data TubesTaniKu antara `BatchPanen` (induk) dan `QualityCheck` (anak), terdapat tiga pendekatan untuk menangani referensi integritas:
1. **`onDelete: Cascade` pada Level Database (Ditolak)**:
   Mekanisme ini mendelegasikan penghapusan otomatis data anak ke engine PostgreSQL saat parent dihapus. Pendekatan ini ditolak karena data riwayat audit mutu pertanian merupakan entitas bernilai tinggi (*audit trail*). Jika cascade diaktifkan secara implisit di level database, penghapusan batch panen dapat memusnahkan seluruh rekam jejak legalitas inspeksi mutu tanpa adanya kesadaran atau konfirmasi eksplisit dari lapisan logika bisnis aplikasi.
2. **Menolak Penghapusan / `onDelete: Restrict` Murni (Alternatif Kurang Fleksibel)**:
   Menolak aksi hapus jika masih terdapat catatan anak mengharuskan pengguna menghapus setiap catatan inspeksi mutu satu per satu secara manual sebelum dapat menghapus batch. Ini merusak pengalaman pengguna (*UX friction*) untuk skenario pembersihan data salah entri.
3. **Transaksi Aplikasi `prisma.$transaction` (Keputusan Terpilih)**:
   Aplikasi secara sadar dan eksplisit menghapus entitas anak terlebih dahulu baru kemudian entitas induk dalam satu unit kerja atomik:
   ```typescript
   await prisma.$transaction([
     prisma.qualityCheck.deleteMany({ where: { batchId: id } }),
     prisma.batchPanen.delete({ where: { id } }),
   ]);
   ```
   **Alasan**: Memenuhi prinsip ACID (Atomicity, Consistency, Isolation, Durability). Jika salah satu proses gagal, seluruh operasi dibatalkan sehingga basis data tidak pernah berada dalam status inkonsisten/korup. Operasi ini terpantau penuh dalam log audit aplikasi tanpa mengandalkan perilaku implisit basis data.

### 4.3. Nilai Turunan saat Render Dibanding `useEffect`
Mengapa menyimpan nilai turunan di dalam `useState` yang disinkronkan melalui `useEffect` merupakan pola anti-pola (*anti-pattern*) di React:
1. **Rerender Redundan**: Menyimpan `sisa` dalam state memicu dua kali siklus render untuk setiap satu ketukan tombol (*keypress*): render pertama saat teks berubah, disusul pemanggilan `useEffect` yang memicu `setState`, memicu render kedua.
2. **Desinkronisasi State**: Rentan terhadap *stale state* dan galat array dependensi, seperti yang terjadi pada Issue #14 ketika `[]` menyebabkan state membeku.
3. **Efisiensi Nilai Turunan (*Derived State*)**:
   Ekspresi `const sisa = 500 - notes.length;` berjalan dalam kompleksitas waktu $O(1)$. Komponen di-render sekali secara deterministik dengan nilai yang dijamin selalu sinkron terhadap state `notes` tanpa alokasi memori tambahan atau efek samping (*side effects*). Sesuai dengan panduan resmi React: *"You Might Not Need an Effect"*.

### 4.4. Kapan Galat Ditangani di Server Action dan Kapan Diteruskan ke `error.tsx`
- **Ditangani di Server Action (*Expected / Recoverable Errors*)**:
  Galat operasional yang dapat diantisipasi dan dapat diperbaiki langsung oleh pengguna melalui formulir. Contoh:
  - Validasi masukan gagal (skor di luar rentang 1–5, nama petani kosong) -> dikembalikan sebagai objek `{ galat: { ... } }`.
  - Pelanggaran *unique constraint* `P2002` (petani telah mendaftarkan komoditas yang sama) -> dikembalikan sebagai pesan field `{ galat: { farmerName: ["Petani sudah mendaftarkan komoditas ini."] } }`.
  - *Tujuan*: Pengguna tetap berada pada halaman aktif dan dapat memperbaiki isian tanpa kehilangan data formulir yang telah diketik.
- **Diteruskan ke `error.tsx` (*Unexpected / Systemic Errors*)**:
  Galat fatal atau kondisi perkecualian sistem yang tidak dapat diselesaikan oleh interaksi formulir biasa. Contoh:
  - Kerusakan koneksi basis data atau PostgreSQL down.
  - Record target telah dihapus oleh pengguna lain di sesi paralel (`P2025: Record to delete does not exist`).
  - Kegagalan internal runtime server.
  - *Tujuan*: Galat dilempar (*re-throw*) agar batas kesalahan (*React Error Boundary*) `error.tsx` menangkapnya. Di mode produksi, Next.js menyembunyikan detail sensitif dan hanya menampilkan kode rujukan hash `error.digest` kepada pengguna demi keamanan, sementara stack trace lengkap tetap tersimpan rapi di log server.

---

## 5. Telaah Kode

### Komentar yang Diberikan kepada Pasangan Telaah
- **Tautan Pull Request Pasangan**: `https://github.com/pasangan-praktikum/TubesTaniKu/pull/4`

| Baris | Kategori | Masalah | Perbaikan |
|:------|:---------|:--------|:----------|
| `src/app/katalog/actions.ts:22` | **Validasi** | Penggunaan `z.coerce.number()` tanpa pembatasan integer menyebabkan nilai skor desimal lolos ke database. | Tambahkan `.int().min(1).max(5)` pada skema validasi skor mutu. |
| `src/app/batch/actions.ts:45` | **Alur Kendali** | Pemanggilan `redirect()` diletakkan di dalam blok `try`, menyebabkan exception navigasi `NEXT_REDIRECT` tertelan `catch`. | Pindahkan pemanggilan `revalidatePath` dan `redirect` ke baris paling bawah di luar blok `try...catch`. |
| `src/components/FormBatchPanen.tsx:14` | **Gaya Kode** | *Nit*: Penamaan variabel `d` pada hasil penguraian formulir kurang deskriptif dan menyulitkan pembacaan kode tim. | Usulkan refaktor nama variabel menjadi `dataFormulir`. |

#### Cuplikan Komentar Telaah Berupa Suggestion Block
```suggestion
  score: z.coerce.number().int().min(1, "Skor minimal 1").max(5, "Skor maksimal 5"),
```

---

### Komentar yang Diterima dari Pasangan
1. **Komentar 1 (Diterapkan)**:
   - *Komentar*: "Pada `src/components/FormQualityCheck.tsx`, tambahkan atribut visual penanda ketika sisa karakter kurang dari 50 karakter agar pengguna sadar kuota teks hampir habis."
   - *Tanggapan & Penerapan*: **Diterapkan**. Ditambahkan kelas kondisional Tailwind `className={sisa < 50 ? "text-amber-600 font-medium" : ""}` pada elemen label sisa karakter.
2. **Komentar 2 (Ditolak dengan Alasan Teknis)**:
   - *Komentar*: "Sebaiknya penghapusan relasi `QualityCheck` diganti memakai `onDelete: Cascade` saja di berkas `schema.prisma` agar kode Server Action tidak perlu memanggil transaksi `$transaction`."
   - *Tanggapan & Alasan Teknis*: **Ditolak**. Pada domain rantai pasok pertanian dan keterlacakan mutu (*food traceability*), data inspeksi mutu merupakan dokumen legalitas audit. Mengaktifkan `onDelete: Cascade` di tingkat basis data membuka risiko hilangnya riwayat inspeksi secara tidak sengaja (*accidental silent purge*) tanpa jejak pengawasan aplikasi. Penggunaan `prisma.$transaction` di Server Action menjamin bahwa penghapusan dilakukan secara sadar, eksplisit, dan dapat dicatat dalam audit log sistem.

---

## 6. Kendala dan Penyelesaian

1. **Konflik Port Debugger Inspector (`127.0.0.1:9229: address already in use`)**:
   - *Kendala*: Saat menjalankan sesi *"Next.js: debug server-side"*, debugger gagal tersambung dan terminal menampilkan galat bahwa port `9229` sedang digunakan oleh proses lain.
   - *Penyebab*: Terdapat sesi debug Node.js terdahulu yang masih menggantung (*hanging process*) di latar belakang setelah editor ditutup paksa.
   - *Penyelesaian*: Menghentikan seluruh proses Node yang aktif melalui PowerShell:
     ```powershell
     Get-Process -Name node | Stop-Process -Force
     ```
     Kemudian menekan `F5` kembali pada VS Code Run and Debug.
2. **Breakpoint Berstatus *Unbound* (Abu-Abu) pada Server Component**:
   - *Kendala*: Breakpoint yang dipasang pada `src/app/page.tsx` berwarna abu-abu kosong dan eksekusi tidak berhenti saat halaman pertama kali dijalankan.
   - *Penyebab*: Next.js 16 mengompilasi berkas secara *on-demand* (lazy compilation). Berkas Server Component belum dikompilasi ke dalam bundle memori sebelum rute URL tersebut diakses pertama kali oleh peramban.
   - *Penyelesaian*: Membuka alamat `http://localhost:3000` di browser satu kali hingga halaman terkompilasi, setelah itu breakpoint langsung aktif berwarna merah pekat dan eksekusi berhenti tepat di baris yang ditentukan.

---

## 7. Catatan Pemanfaatan AI

- **Alat yang Digunakan**: Google Gemini (Antigravity AI Assistant).
- **Perintah Utama (Prompt)**:
  1. *"Refaktor validasi formulir batch panen agar mendukung input select/boolean dari form HTML dan perbaiki server action hapus item agar lebih ringkas."*
  2. *"Tambahkan penghitung karakter sisa pada komponen formulir ulasan/catatan mutu di React."*
- **Bagian Kode yang Dihasilkan AI**:
  1. Skema validasi awal `isOrganic: z.coerce.boolean()` pada `src/lib/skema.ts`.
  2. Fungsi `hapusBatchPanen` dengan pembungkus `try...catch` yang membungkus `redirect()`.
  3. Komponen `FormQualityCheck` yang memanfaatkan `useState` dan `useEffect` untuk penghitungan sisa karakter.
- **Galat yang Ditemukan pada Kode AI**:
  1. `z.coerce.boolean()` menghasilkan nilai `true` untuk string `"false"`, menyebabkan input form ketersediaan/organik rusak.
  2. `redirect()` di dalam `try` melempar galat `NEXT_REDIRECT` yang tertangkap blok `catch`, membatalkan pengalihan halaman.
  3. Blok `catch` menelan galat Prisma `P2003` tanpa memberikan penanganan atau pesan galat ke pengguna.
  4. `useEffect` dengan dependensi `[]` menyebabkan penghitung karakter tidak bereaksi terhadap ketikan pengguna.
- **Perubahan yang Dilakukan Pengembang**:
  1. Mengganti `z.coerce.boolean()` dengan `z.stringbool()` dari Zod 4.
  2. Mengeluarkan `redirect()` dan `revalidatePath()` ke luar blok `try...catch`.
  3. Mengimplementasikan `prisma.$transaction` untuk penghapusan atomik dan membiarkan galat tak terduga ditangkap oleh `src/app/batch/[id]/error.tsx`.
  4. Menghapus state `sisa` dan `useEffect`, menggantinya dengan nilai turunan murni (*derived state*) saat render.
- **Cara Memverifikasi**:
  - Menjalankan sesi debugging VS Code (`--inspect`) dengan conditional breakpoint dan evaluasi ekspresi di Debug Console.
  - Memeriksa payload network di Chrome DevTools serta inspeksi state di tab Components React Developer Tools.
  - Melakukan uji coba eksekusi berulang sebanyak 5 kali per skenario galat.
  - Menjalankan pemeriksaan statik melalui `npx tsc --noEmit` dan `npm run lint` untuk memastikan seluruh basis kode bebas dari galat kompilasi dan peringatan linter.
