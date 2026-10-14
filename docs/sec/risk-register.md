# Risk Register & Control Plan — TaniKu Platform

## 1. Penilaian Risiko Produk (Likelihood & Impact)

Skala: 1 (Sangat Rendah) hingga 5 (Sangat Tinggi).

| ID Threat | Likelihood (1-5) | Impact (1-5) | Risk Score | Alasan Khusus Kondisi Produk TaniKu v0.1                                                                                                |
| :-------- | :--------------: | :----------: | :--------: | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **TH-01** |        4         |      4       |   **16**   | **Tinggi:** Sistem v0.1 belum memiliki fitur autentikasi login; siapapun yang membuka `/qc` bisa menginput data.                        |
| **TH-03** |        5         |      3       |   **15**   | **Tinggi:** Data disimpan murni di `localStorage` tanpa proteksi server, sangat mudah diedit via F12 Application Tab.                   |
| **TH-10** |        3         |      5       |   **15**   | **Tinggi:** Input teks dari form QC dirender langsung ke UI; jika sanitasi kurang, skrip XSS dapat mencuri session/data.                |
| **TH-06** |        2         |      5       |   **10**   | **Sedang:** Kunci kriptografi Ed25519 saat ini diproses di memori, namun jika salah di-persist ke `localStorage` dampaknya fatal.       |
| **TH-08** |        4         |      2       |   **8**    | **Sedang:** Validasi form saat ini baru mengecek string kosong (`!farmerName.trim()`), belum membatasi panjang karakter (_max length_). |
| **TH-04** |        2         |      4       |   **8**    | Sedang: Sudah ada verifikasi Ed25519 (`verifyBatchSignature`), tetapi UI belum menampilkan badge _INVALID_ jika disabotase.             |
| **TH-05** |        3         |      2       |     6      | Rendah: Belum ada multi-user Agen QC, penyangkalan masih diatasi secara manual.                                                         |
| **TH-07** |        2         |      3       |     6      | Rendah: Mock data saat ini hanya memuat nama umum petani, belum ada alamat sensitif.                                                    |
| **TH-09** |        3         |      2       |     6      | Rendah: Dampak hanya terbatas pada browser lokal pengguna bersangkutan.                                                                 |
| **TH-02** |        1         |      4       |     4      | Rendah: Public key terdistribusi di kode internal.                                                                                      |

---

## 2. Lima Risiko Prioritas Terpilih

1. **R-01 (TH-01 - Spoofing Agen QC):** Akses tanpa autentikasi ke Portal QC.
2. **R-02 (TH-03 - Tampering LocalStorage):** Manipulasi lokal data panen & grade mutu.
3. **R-03 (TH-10 - Elevation of Privilege / XSS):** Injeksi script pada input teks form.
4. **R-04 (TH-06 - Info Disclosure Private Key):** Potensi kebocoran Kunci Privat Kriptografi.
5. **R-05 (TH-08 - DoS Form Input Payload):** Unbounded string input pada form panen.

---

## 3. Rencana Kontrol (Control Plan)\*\*

| ID Risiko | Risiko Prioritas              | Rencana Kontrol Keamanan (Mitigasi)                                                                                                              | Pemetaan Tugas                              |
| :-------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------ |
| **R-01**  | Spoofing Agen QC              | Mengimplementasikan sistem autentikasi pengguna berbasis JWT / NextAuth dan Role-Based Access Control (RBAC) khusus role `QC_AGENT`.             | **Tugas 2 (Autentikasi & Otorisasi)**       |
| **R-02**  | Tampering Data Panen          | Memindahkan penyimpanan data dari `localStorage` ke Database Server (PostgreSQL/Prisma) dan memverifikasi Ed25519 Signature di Server Actions.   | **Tugas 2 (Database & Server Security)**    |
| **R-03**  | Stored XSS via Form Input     | Menerapkan sanitasi input ketat (DOMPurify/Zod schema validation) dan memasang HTTP Header `Content-Security-Policy` (CSP).                      | **Tugas 3 (Web Security & Headers)**        |
| **R-04**  | Kebocoran Private Key Ed25519 | Mengisolasi proses penandatanganan di Server-Side / Environment Variable aman dan tidak pernah mengikutsertakan Private Key ke Bundle Client JS. | **Tugas 2 (Secure Key Management)**         |
| **R-05**  | DoS Payload Input Form        | Menambahkan validasi skema input Zod dengan pembatasan panjang string (`max(100)`) dan _rate limiting_ pada request API form submission.         | **Tugas 3 (Input Validation & Rate Limit)** |
