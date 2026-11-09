# Risk Register & Control Plan — TaniKu Platform

## 1. Penilaian Risiko Produk (Likelihood & Impact)

Skala: 1 (Sangat Rendah) hingga 5 (Sangat Tinggi).

| ID Threat | Likelihood (1-5) | Impact (1-5) | Risk Score | Alasan Khusus Kondisi Produk TaniKu v0.1 |
| :-------- | :--------------: | :----------: | :--------: | :--------------------------------------- |
| **TH-01** | 4 | 4 | **16** | **Tinggi:** Sistem v0.1 belum memiliki fitur autentikasi login; siapapun yang membuka `/qc` bisa menginput data. |
| **TH-03** | 5 | 3 | **15** | **Tinggi:** Data disimpan murni di `localStorage` tanpa proteksi server, sangat mudah diedit via F12 Application Tab. |
| **TH-10** | 3 | 5 | **15** | **Tinggi:** Input teks dari form QC dirender langsung ke UI; jika sanitasi kurang, skrip XSS dapat mencuri session/data. |
| **TH-06** | 2 | 5 | **10** | **Sedang:** Kunci kriptografi Ed25519 saat ini diproses di memori, namun jika salah di-persist ke `localStorage` dampaknya fatal. |
| **TH-08** | 4 | 2 | **8** | **Sedang:** Validasi form saat ini baru mengecek string kosong (`!farmerName.trim()`), belum membatasi panjang karakter (_max length_). |
| **TH-04** | 2 | 4 | **8** | Sedang: Sudah ada verifikasi Ed25519 (`verifyBatchSignature`), tetapi UI belum menampilkan badge _INVALID_ jika disabotase. |
| **TH-05** | 3 | 2 | 6 | Rendah: Belum ada multi-user Agen QC, penyangkalan masih diatasi secara manual. |
| **TH-07** | 2 | 3 | 6 | Rendah: Mock data saat ini hanya memuat nama umum petani, belum ada alamat sensitif. |
| **TH-09** | 3 | 2 | 6 | Rendah: Dampak hanya terbatas pada browser lokal pengguna bersangkutan. |
| **TH-02** | 1 | 4 | 4 | Rendah: Public key terdistribusi di kode internal. |

---

## 2. Lima Risiko Prioritas Terpilih

1. **R-01 (TH-01 - Spoofing Agen QC):** Akses tanpa autentikasi ke Portal QC.
2. **R-02 (TH-03 - Tampering LocalStorage):** Manipulasi lokal data panen & grade mutu.
3. **R-03 (TH-10 - Elevation of Privilege / XSS):** Injeksi script pada input teks form.
4. **R-04 (TH-06 - Info Disclosure Private Key):** Potensi kebocoran Kunci Privat Kriptografi.
5. **R-05 (TH-08 - DoS Form Input Payload):** Unbounded string input pada form panen.

---

## 3. Rencana Kontrol (Control Plan)

| ID Risiko | Risiko Prioritas | Rencana Kontrol Keamanan (Mitigasi) | Pemetaan Tugas |
| :--- | :--- | :--- | :--- |
| **R-01** | Spoofing Agen QC | Mengimplementasikan sistem autentikasi pengguna berbasis Session/RBAC dan pengerasan SSH host. | **Tugas 2 (Autentikasi & Otorisasi)** |
| **R-02** | Tampering Data Panen | Memindahkan penyimpanan data ke PostgreSQL/Prisma, isolasi jaringan container db, dan read-only filesystem. | **Tugas 2 (Database & Server Security)** |
| **R-03** | Stored XSS via Form Input | Menerapkan sanitasi input ketat (Zod schema validation) dan pembatasan hak container (`cap_drop: ALL`, `no-new-privileges`). | **Tugas 2 & Tugas 3** |
| **R-04** | Kebocoran Private Key Ed25519 | Mengisolasi kunci di server-side, hak akses file ketat (640/600), dan user non-root (UID 1001). | **Tugas 2 (Secure Key Management)** |
| **R-05** | DoS Payload Input Form | Pembatasan sesi SSH (`MaxSessions 2`), rate-limiting form input, dan validasi Zod max length. | **Tugas 2 & Tugas 3** |

---

## 4. Status Implementasi Kontrol Keamanan (Milestone `sec-0.2` — Tugas 2)

Seluruh kontrol keamanan prioritas pada Tugas 2 telah diimplementasikan dan diverifikasi pada milestone **`sec-0.2`**:

| ID Kontrol | Merujuk ID Risiko | Kategori STRIDE | Kontrol Keamanan yang Diterapkan di `sec-0.2` | Bukti Verifikasi / Lokasi Berkas | Status Akhir |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **CTRL-01** | **R-01 (TH-01)** | **Spoofing** | • Autentikasi portal berbasis sesi cookie HttpOnly & validasi password lambat (`scrypt` salt unik)<br>• Login SSH host VM hanya dengan kunci Ed25519 (`PasswordAuthentication no`, `PermitRootLogin no`) | • `src/lib/password.ts`<br>• `security/access-tests.md`<br>• `security/config/00-hardening.conf` | **TERPASANG & TERVERIFIKASI** |
| **CTRL-02** | **R-02 (TH-03)** | **Tampering** | • Penyimpanan persisten PostgreSQL via Prisma ORM<br>• Root filesystem container dikunci `read_only: true`<br>• Port database 5432 tidak diekspos ke host / internet | • `docker-compose.yml`<br>• `security/hardening-notes.md`<br>• `prisma/schema.prisma` | **TERPASANG & TERVERIFIKASI** |
| **CTRL-03** | **R-03 (TH-10)** | **Elevation of Privilege** | • Container berjalan sebagai user non-root `nextjs` (UID 1001)<br>• Linux capabilities dibuang habis (`cap_drop: ALL`, `CapEff: 0000000000000000`)<br>• Pencegahan eskalasi via `no-new-privileges:true` | • `Dockerfile`<br>• `docker-compose.yml`<br>• `security/hardening-notes.md` | **TERPASANG & TERVERIFIKASI** |
| **CTRL-04** | **R-04 (TH-06)** | **Information Disclosure** | • Pembatasan login SSH hanya user `deploy` (`AllowUsers deploy`)<br>• Izin berkas konfigurasi sistem diperketat (`chmod 600`)<br>• Audit sistem host menggunakan Lynis mencapai indeks **76** ($\ge 70$) | • `security/lynis-after.txt`<br>• `security/config/00-hardening.conf` | **TERPASANG & TERVERIFIKASI** |
| **CTRL-05** | **R-05 (TH-08)** | **Denial of Service** | • Pembatasan koneksi SSH (`MaxAuthTries 3`, `LoginGraceTime 30`, `MaxSessions 2`)<br>• Validasi masukan formulir deklaratif ketat menggunakan Zod v4<br>• Pemindaian kerentanan image Trivy & penerbitan SBOM CycloneDX | • `src/lib/skema.ts`<br>• `security/image-scan-after.txt`<br>• `security/sbom.cdx.json` | **TERPASANG & TERVERIFIKASI** |
