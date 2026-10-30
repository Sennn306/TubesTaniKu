# Dokumen Teknis Modul 5 Formulir, Validasi, Session, dan Cookie

NIM/Nama: 105224030 / Adrenalin Syahrobby  
Repositori: TubesTaniKu

## 1. Skema Validasi

| Nama Kolom    | Aturan Zod                                      | Pesan Galat                                                      |
| ------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| farmerName    | string, trim, min(3), max(80)                   | Nama petani wajib diisi minimal 3 / maksimal 80 karakter         |
| commodityName | enum(["Cabai Merah", "Beras Organik", "Tomat"]) | Pilih salah satu jenis komoditas yang sah                        |
| weightKg      | coerce.number, gt(0), max(10000)                | Berat panen harus berupa angka lebih dari 0 kg dan max 10.000 kg |
| grade         | enum(["GRADE_A", "GRADE_B"])                    | Pilih grade mutu panen yang valid                                |
| isOrganic     | stringbool, default(false)                      | N/A                                                              |

### Aturan Semantik

Pengecekan nama petani duplikat (`batchSudahAda`) dilakukan di Server Action `simpanBatchPanen` setelah `skemaBatchPanen.safeParse` berhasil. Aturan ini tidak dapat ditangani Zod karena memerlukan verifikasi terhadap data yang tersimpan di server.

## 2. Alur Server Action

1. **Pemeriksaan Sesi**: Mengakses `bacaSesi()` untuk memastikan pengguna terautentikasi.
2. **Validasi Bentuk (Sintaksis)**: Menjalankan `skemaBatchPanen.safeParse()` dan mengekstraksi galat per kolom menggunakan `z.flattenError`.
3. **Validasi Semantik**: Memeriksa `batchSudahAda(farmerName)`.
4. **Mutasi Data**: Memanggil `tambahBatch(data)`.
5. **Revalidasi & Redireksi**: Memanggil `revalidatePath("/katalog")` dan `redirect("/katalog/[id]")` di luar blok `try-catch`.

## 3. Bukti Uji Validasi

| No  | Kasus Uji              | Masukan                                                                             | Hasil Diharapkan                   | Hasil Nyata |
| --- | ---------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- | ----------- |
| 1   | Data Sah               | farmerName: "Budi Santoso", commodityName: "Tomat", weightKg: 150, grade: "GRADE_A" | Redirect ke /katalog/[id]          | Sesuai      |
| 2   | Nama Petani Pendek     | farmerName: "Bu"                                                                    | Ditolak server (min 3 karakter)    | Sesuai      |
| 3   | Komoditas Kosong       | commodityName: ""                                                                   | Ditolak server                     | Sesuai      |
| 4   | Berat Nol / Negatif    | weightKg: 0                                                                         | Ditolak server (gt 0)              | Sesuai      |
| 5   | Duplicate Semantik     | farmerName: "Budi Santoso" (sudah ada)                                              | Galat: Nama petani sudah terdaftar | Sesuai      |
| 6   | Novalidate - Petani    | Attribute `novalidate`, farmerName: "A"                                             | Ditolak server                     | Sesuai      |
| 7   | Novalidate - Komoditas | Attribute `novalidate`, commodityName unselected                                    | Ditolak server                     | Sesuai      |
| 8   | Novalidate - Berat     | Attribute `novalidate`, weightKg: -10                                               | Ditolak server                     | Sesuai      |

## 4. Session dan Cookie

Atribut Cookie:

- `HttpOnly: true` (Mencegah pencurian cookie via JavaScript/XSS)
- `SameSite: "lax"` (Mencegah serangan CSRF pada navigasi lintas situs)
- `Path: "/"` (Berlaku untuk seluruh rute aplikasi)
- `Max-Age: 28800` (Kedaluwarsa otomatis dalam 8 jam)

## 5. Keputusan Teknis

- **Pola Session di Server**: Menggunakan Map memori server agar sesi dapat langsung dicabut saat pengguna klik Keluar (tidak seperti token JWT stateless yang sulit dicabut sebelum exp).
- **Peran `proxy.ts` vs Server Action**: `proxy.ts` hanya melakukan pengecekan optimistik keberadaan cookie di rute awal, sedangkan verifikasi keabsahan sesi dilakukan secara ketat di Server Action `bacaSesi()`.

## 6. Kendala dan Penyelesaian

- **Beda Union Enum**: Terjadi error `ts(2322)` pada properti `grade` karena perbedaan casing (`Grade A` vs `GRADE_A`). Diselesaikan dengan menyelaraskan `z.enum` pada `skema.ts` dengan tipe `BatchItem`.
- **Missing Properties on BatchItem**: Terjadi error `ts(2739)` karena `BatchItem` memerlukan properti default seperti `hubName`, `harvestDate`, dan `pricePerKg`. Diselesaikan dengan menyuntikkan nilai default saat instansiasi di `tambahBatch`.

## 7. Catatan Pemanfaatan AI

- **Alat**: Gemini AI / Antigravity Assistant.
- **Perintah Utama**: Refaktor Server Action, debugging TypeScript error `ts(2322)` & `ts(2739)`, dan pembuatan komponen formulir ber-ARIA.
- **Bagian yang Digunakan**: Penyesuaian skema Zod 4, fungsi `simpanBatchPanen`, dan draf Dokumen Teknis.
- **Cara Verifikasi**: Menjalankan `npx tsc --noEmit`, `npm run lint`, dan menguji pengiriman formulir di browser.
