# Catatan Pengerasan Sistem dan Container (Hardening Notes) — TaniKu Platform

- **Milestone Penanda:** `sec-0.2`
- **Mata Kuliah:** Keamanan Komputasi dan Siber (Pekan 6)
- **Komponen Penilaian:** Hardening Sistem Operasi dan Container (30 Poin) & Pemindaian Kerentanan (20 Poin)

---

## 1. Deskripsi Lingkungan Uji (*Test Environment*)

Sesuai model arsitektur pertahanan berlapis (*defense-in-depth*), pengujian dan penerapan kontrol keamanan dilakukan pada dua lapisan:
1. **Lapisan Host / VM:** Debian GNU/Linux 12 (bookworm) pada arsitektur WSL2 x86_64 dengan OpenSSH Server dan utilitas audit Lynis 3.1.4.
2. **Lapisan Container:** Docker Engine 27+ dan Docker Compose v2 yang menjalankan container aplikasi Next.js 16 berbasis Alpine Linux (`node:20-alpine`) serta basis data PostgreSQL 16 Alpine.

---

## 2. Hasil Audit dan Pengerasan Sistem Operasi (Host VM)

### A. Peningkatan Indeks Lynis (Sebelum vs Sesudah)
Audit Lynis dilakukan secara menyeluruh terhadap sistem host dengan hasil sebagai berikut:

- **Indeks Baseline Sebelum Hardening (`security/lynis-before.txt`):**
  ```text
  Hardening index : 62 [############        ]
  Tests performed : 246
  ```
- **Indeks Sesudah Hardening (`security/lynis-after.txt`):**
  ```text
  Hardening index : 76 [###############     ]
  Tests performed : 251
  ```
- **Analisis Peningkatan:** Indeks keamanan meningkat **+14 poin** (dari 62 menjadi **76**), melampaui ambang batas minimal kelulusan rubrik (indeks $\ge 70$).

### B. Konfigurasi Pengerasan SSH (*SSH Drop-in Config*)
Konfigurasi SSH diperkeras menggunakan berkas *drop-in* di `/etc/ssh/sshd_config.d/00-hardening.conf` (salinan tersedia di `security/config/00-hardening.conf`):

```text
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowUsers deploy
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
ClientAliveCountMax 2
LogLevel VERBOSE
MaxSessions 2
TCPKeepAlive no
```

### C. Bukti Verifikasi Konfigurasi Efektif SSH
Perintah verifikasi konfigurasi efektif sshd yang dieksekusi:

```bash
$ sudo sshd -T | grep -Ei "permitrootlogin|passwordauthentication|kbdinteractiveauthentication"
permitrootlogin no
passwordauthentication no
kbdinteractiveauthentication no
```

### D. Justifikasi Rekomendasi Lynis yang Tidak Diterapkan (*Documented Decisions*)
Sesuai panduan Slide 17 & 18 (Pekan 5), sebagian rekomendasi Lynis sengaja tidak diterapkan dengan alasan teknis yang valid:
1. **Layanan `auditd` tidak diaktifkan:** Kernel virtualisasi WSL2 menonaktifkan subsistem audit kernel bawaan (*kernel audit netlink socket*) untuk optimalisasi performa VM. Paket audit tetap diinstal untuk kepatuhan inspeksi statis.
2. **Partisi terpisah untuk `/tmp` dan `/var`:** Lingkungan lab berjalan di atas virtual disk tunggal; pemisahan partisi fisik dapat mengganggu stabilitas mount point virtualisasi host tanpa memberikan manfaat mitigasi risiko yang relevan pada tahap pengembangan ini.

---

## 3. Hasil Pengerasan Container (*Container Hardening*)

Pengerasan container diterapkan pada `Dockerfile` (multi-stage) dan `docker-compose.yml` dengan bukti verifikasi runtime sebagai berikut:

### A. Pengguna Non-Root (`UID 1001`)
Proses aplikasi Next.js dijalankan secara eksklusif menggunakan akun `nextjs` (UID 1001, GID 1001), bukan root.
- **Perintah Verifikasi:**
  ```bash
  $ docker compose exec app id
  uid=1001(nextjs) gid=1001(nodejs) groups=1001(nodejs)
  ```

### B. Pembatasan Linux Capabilities (`CapEff: 0`)
Seluruh kapabilitas Linux dibuang penuh menggunakan `cap_drop: - ALL` dan proteksi `no-new-privileges:true`.
- **Perintah Verifikasi:**
  ```bash
  $ docker compose exec app grep CapEff /proc/1/status
  CapEff: 0000000000000000
  ```
  Nilai `0000000000000000` membuktikan proses tidak memiliki privilege operasional tingkat kernel sama sekali.

### C. Filesystem Read-Only & Uji Negatif Penulisan
Sistem berkas root container dikonfigurasi sebagai *read-only* (`read_only: true`), dengan direktori sementara menggunakan `tmpfs: - /tmp`.
- **Uji Negatif Penulisan Filesystem:**
  ```bash
  $ docker compose exec app touch /app/uji
  touch: /app/uji: Read-only file system
  ```
  *Terbukti: Penyerang tidak dapat menyisipkan malware atau mengubah kode aplikasi di runtime.*

### D. Isolasi Port Basis Data (PostgreSQL)
Layanan PostgreSQL `db` hanya terhubung ke bridge network internal `taniku_net` tanpa mempublikasikan port ke host (`ports` ditiadakan).
- **Perintah Verifikasi di Host:**
  ```bash
  $ sudo ss -tlpn | grep 5432
  # (Tidak menghasilkan output apa pun / port 5432 tertutup dari luar)
  ```

---

## 4. Hasil Pemindaian Kerentanan & Analisis Risiko Sisa (*Residual Risk*)

### A. Ringkasan Pemindaian Image Trivy
- **Sebelum Pemindaian (`security/image-scan-before.txt`):** Menggunakan image unhardened `tubestaniku:v0.2` yang memiliki banyak temuan kerentanan sistem.
- **Sesudah Pemindaian (`security/image-scan-after.txt`):** Menggunakan image ter-hardening `tubestaniku:sec-0.2` berbasis `node:20-alpine` multi-stage build.
- **SBOM:** Berkas Software Bill of Materials lengkap format CycloneDX berhasil di-generate pada `security/sbom.cdx.json`.

### B. Analisis Risiko Sisa (*Residual Risk Note*)
Pada pemindaian akhir `image-scan-after.txt`, terdeteksi 1 kerentanan level CRITICAL:
- **Paket:** `tar` / `node-tar` (CVE-2026-59873, Denial of Service via crafted gzip bomb).
- **Status:** Ketergantungan transitif internal dari sub-paket builder tools Node.js.
- **Justifikasi Residual Risk Sesuai Rubrik:**
  1. **Paparan Runtime Rendah (*Zero Exposure*):** Aplikasi TaniKu pada tahap produksi (`server.js`) tidak menerima atau mengekstrak file arsip (`.tar`, `.tar.gz`) dari pengguna luar.
  2. **Mitigasi Kompensasi:** Sistem berkas bersifat *read-only* dan alokasi memori container dibatasi, sehingga potensi eksploitasi gzip bomb pada runtime tidak dapat mengeksekusi denial of service pada host.
  3. **Rencana Pemantauan:** Paket akan diperbarui otomatis saat base image upstream Alpine merilis pembaruan versi `tar >= 7.5.19`.

---

## 5. Pemetaan Kontrol terhadap Register Risiko Tugas 1

| ID Risiko Tugas 1 | Ancaman STRIDE | Kontrol Keamanan yang Diterapkan (Milestone `sec-0.2`) | Status Mitigasi |
| :--- | :--- | :--- | :---: |
| **R-01 (TH-01)** | **Spoofing** | Login SSH berbasis kunci Ed25519; autentikasi portal web dengan slow memory-hard hash `scrypt`. | **MITIGATED** |
| **R-02 (TH-03)** | **Tampering** | Root filesystem container diatur `read_only`; port PostgreSQL diisolasi dari interface publik. | **MITIGATED** |
| **R-03 (TH-10)** | **Elevation of Privilege** | `no-new-privileges:true`; penghapusan seluruh Linux capability (`CapEff: 0`); user non-root `UID 1001`. | **MITIGATED** |
| **R-04 (TH-06)** | **Information Disclosure** | Hak akses SSH dibatasi (`AllowUsers deploy`); izin file `.env` diatur `640/600`; SSH root login dinonaktifkan. | **MITIGATED** |
| **R-05 (TH-08)** | **Denial of Service** | Pembatasan sesi SSH (`MaxSessions 2`); `MaxAuthTries 3`; pembatasan buffer `tmpfs`. | **MITIGATED** |
