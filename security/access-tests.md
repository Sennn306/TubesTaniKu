# Matriks Hak Akses dan Laporan Uji Akses (Access Tests) — TaniKu Platform

- **Milestone Penanda:** `sec-0.2`
- **Mata Kuliah:** Keamanan Komputasi dan Siber (Pekan 6)
- **Komponen Penilaian:** Autentikasi, Otorisasi, Least Privilege, dan Pengujian Hak Akses (35 Poin)

---

## 1. Matriks Kontrol Akses Berbasis Peran (RBAC Matrix)

Sistem TaniKu menerapkan pemisahan tugas (*Separation of Duty*) dan hak akses minimum (*Least Privilege*) di tiga lapisan: Aplikasi Web, Basis Data, dan Sistem Operasi Host.

| Peran Pengguna (*Subject*) | Beranda & Katalog (`/`, `/batch/[id]`) | Form Tambah Batch (`/katalog/tambah`) | Server Action Mutasi Panen (`simpanBatchPanen`) | Entry Mutu QC (`/qc`, `simpanQualityCheck`) | Akses Langsung DB PostgreSQL (Port 5432) | Akses Shell SSH ke VM Host |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tamu / Konsumen Publik** | **BACA (Allow)** | DITOLAK (307 Redirect) | DITOLAK (Unauthorized) | DITOLAK (Unauthorized) | DITOLAK (Isolasi Jaringan) | DITOLAK (No Shell) |
| **Petani Terdaftar** | **BACA (Allow)** | DITOLAK | DITOLAK | DITOLAK | DITOLAK (Isolasi Jaringan) | DITOLAK (No Shell) |
| **Agen QC Desa** | **BACA (Allow)** | DITOLAK | DITOLAK | **TULIS / SUBMIT (Allow)** | DITOLAK (Hanya via App Net) | DITOLAK (No Shell) |
| **Pengelola / Admin Micro-Hub** | **BACA (Allow)** | **BACA & TULIS (Allow)** | **EKSEKUSI (Allow)** | **BACA & TULIS (Allow)** | DITOLAK (Hanya via App Net) | DITOLAK (No Shell) |
| **Pengelola Server VM (`deploy`)** | — | — | — | — | AKSES LOKAL (Maintenance) | **LOGIN KEY ONLY (Allow)** |

---

## 2. Bukti Penyimpanan Kata Sandi Menggunakan Fungsi Hash Lambat (*Slow Hash*)

Sesuai standar **NIST SP 800-63B-4** dan **OWASP Password Storage Cheat Sheet**, sistem tidak pernah menyimpan kata sandi dalam bentuk plaintext maupun algoritma *fast-hash* (seperti MD5 / SHA-256) yang rentan terhadap serangan akselerasi GPU / ASIC.

### A. Lapisan Aplikasi (Web Application)
- **Algoritma:** `scrypt` (Memory-Hard Password Hashing Function, RFC 7914).
- **Parameter Minimum:** $N = 16384$ (Cost), $r = 8$ (Block Size), $p = 1$ (Parallelization), panjang kunci turunan 64 bytes, dengan salt acak kriptografis 16 bytes per pengguna.
- **Implementasi:** Modul `src/lib/password.ts` menggunakan `crypto.scryptSync` dan diverifikasi dengan `crypto.timingSafeEqual` untuk mencegah *timing attack*.
- **Format String Tersimpan (PHC-like Format):**
  ```text
  scrypt$<salt_hex>$<derived_key_hex>
  ```
- **Contoh Bukti String Hash Tersimpan (Tanpa Membuka Data Pengguna Nyata):**
  ```text
  scrypt$a8f13c72b5d49e102f6a8b7c3d1e4f50$0d1836d5c67d15f638249c535561739465c2b3d32bc9b39f98099e8759dc8921418b10b2ddb76bce49690c6edb834d9f26223c2a37037b3d924a039562526d57
  ```
- **Bukti Unit Test:** Berkas `test/password.test.ts` (4/4 passed) memverifikasi format salt acak, keabsahan kata sandi, penolakan password salah, dan penolakan hash rusak.

### B. Lapisan Sistem Operasi VM (`/etc/shadow`)
- Akun administratif `deploy` di OS Debian/Ubuntu dilindungi menggunakan algoritma hash lambat standar Linux terkini, yaitu **`yescrypt`** (awalan `$y$`).
- **Bukti Format `/etc/shadow` (Redacted):**
  ```text
  deploy:$y$j9T$t7K...<salt>...$<hash>:20358:0:99999:7:::
  ```

---

## 3. Laporan Hasil Pengujian Akses (Uji Positif vs Uji Negatif)

Sesuai ketentuan rubrik, jumlah pengujian akses negatif (akses yang seharusnya ditolak) **sama banyaknya (seimbang 1:1)** dengan pengujian akses positif (6 Uji Positif vs 6 Uji Negatif).

### A. Uji Positif (Akses Sah Diizinkan)

| ID Uji | Peran / Subjek | Aksi & Sumber Daya yang Diminta | Masukan Uji | Hasil Diharapkan | Hasil Pengujian Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UJ-POS-01** | Tamu Publik | `GET /` (Katalog Publik) | HTTP Request tanpa header Cookie | Halaman beranda katalog tampil penuh (HTTP 200) | HTTP 200 OK, daftar komoditas terverifikasi dirender | **PASS** |
| **UJ-POS-02** | Tamu Publik | `GET /batch/1` (Detail Batch) | URL ID batch panen valid | Rincian panen & signature Ed25519 tampil (HTTP 200) | HTTP 200 OK, badge mutu dan status inspeksi terlihat | **PASS** |
| **UJ-POS-03** | Pengelola | `POST /masuk` (Login Kredensial Valid) | Email sah & password cocok dengan verifikasi `scrypt` | Sesi dibuat, cookie HTTP-Only terbit, redirect ke portal | HTTP 303 Redirect ke `/katalog/tambah`, cookie `sesi` terbit | **PASS** |
| **UJ-POS-04** | Pengelola | `GET /katalog/tambah` (Dengan Sesi) | Request menyertakan Cookie `sesi` sah | Formulir input batch panen dapat diakses (HTTP 200) | HTTP 200 OK, formulir pendaftaran batch panen tampil | **PASS** |
| **UJ-POS-05** | Pengelola | `POST simpanBatchPanen` (Server Action) | Payload form valid: Petani, Komoditas, Berat > 0 | Data tersimpan di basis data, revalidasi katalog | HTTP 303 Redirect ke `/katalog`, entitas tersimpan di PostgreSQL | **PASS** |
| **UJ-POS-06** | Pengelola VM | `SSH Login` ke VM Host via Key | `ssh -i id_ed25519 deploy@<ip-vm>` | Login SSH berhasil tanpa meminta password akun | Masuk ke shell session `deploy@debian:~$` tanpa password prompt | **PASS** |

---

### B. Uji Negatif (Akses Tidak Sah Wajib Ditolak)

| ID Uji | Peran / Subjek | Skenario Penetrasi / Akses Tidak Sah | Masukan Uji | Hasil Diharapkan | Hasil Pengujian Aktual | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **UJ-NEG-01** | Tamu Tanpa Sesi | Mencoba membuka rute `/katalog/tambah` via URL langsung | `GET /katalog/tambah` tanpa Cookie `sesi` | Akses dicegat middleware/proxy, dialihkan ke login | **HTTP 307 Temporary Redirect** ke `/masuk` | **PASS** |
| **UJ-NEG-02** | Tamu / Penyerang | Mencoba eksekusi Server Action `simpanBatchPanen` secara langsung | `POST` multipart/form-data tanpa Cookie `sesi` | Mutasi ditolak di tingkat server (*Unauthorized*) | Response mengembalikan pesan: *"Silakan masuk terlebih dahulu."* | **PASS** |
| **UJ-NEG-03** | Penyerang | *Credential stuffing* / tebakan password salah pada halaman masuk | `POST /masuk` dengan password salah `Admin123!` | Otentikasi `scrypt` menolak, tidak ada sesi yang terbit | Form status error: *"Email atau kata sandi salah."*, sesi tidak terbit | **PASS** |
| **UJ-NEG-04** | Penyerang Jaringan | Mencoba login SSH langsung ke akun `root` | `ssh root@<ip-vm>` | Server menolak login root secara tegas | `root@<ip-vm>: Permission denied (publickey).` | **PASS** |
| **UJ-NEG-05** | Penyerang Jaringan | Mencoba login SSH menggunakan password (*Password guessing*) | `ssh -o PubkeyAuthentication=no deploy@<ip-vm>` | Metode password ditolak oleh sshd | `deploy@<ip-vm>: Permission denied (publickey).` | **PASS** |
| **UJ-NEG-06** | Penyerang Luar | Mencoba akses langsung ke port PostgreSQL dari jaringan publik | `psql -h <ip-vm> -p 5432 -U postgres` | Port database tidak terekspos ke host / internet | `Connection refused` (port 5432 tidak listening di interface publik) | **PASS** |

---

## 4. Kesimpulan Kepatuhan Akses

1. **Seluruh akses tidak sah berhasil ditolak (100% rejection rate)** baik pada lapisan antarmuka web, server action, maupun infrastruktur OS dan basis data.
2. **Prinsip Fail-Safe Defaults & Least Privilege terpenuhi**: Seluruh mutasi data mewajibkan validasi sesi server-side, sementara container dan layanan aplikasi berjalan dengan hak pengguna non-root tanpa hak eskalasi (`no-new-privileges`).
