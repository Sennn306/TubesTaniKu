# Spesifikasi Kebutuhan Perangkat Lunak — TaniKu (`tubestaniku`)

Dokumen ini mendefinisikan **Kebutuhan Fungsional (FR)** dan **Kebutuhan Non-Fungsional (NFR)** untuk platform **TaniKu** (*Hyper-Local Micro-Hub Platform*), yang menjadi acuan implementasi antarmuka web, basis data relasional, serta RESTful API (`/api/v1`).

---

## 1. Kebutuhan Fungsional (Functional Requirements)

| ID | Nama Kebutuhan | Deskripsi | Aktor |
| :--- | :--- | :--- | :--- |
| **FR-01** | Daftar & Filter Batch Panen | Sistem menyediakan daftar seluruh `BatchPanen` dengan dukungan paginasi (`halaman`, `batas`) serta penyaringan berdasarkan jenis `Komoditas` (`Cabai Merah`, `Beras Organik`, `Tomat`). | Konsumen, Pembeli Bisnis, Petani, Agen QC |
| **FR-02** | Detail Batch Panen | Sistem menampilkan informasi rinci satu `BatchPanen` berdasarkan `id` (nama petani, komoditas, berat dalam kg, grade mutu, status organik, dan waktu pembuatan). | Konsumen, Pembeli Bisnis, Petani, Agen QC |
| **FR-03** | Penambahan Batch Panen | Sistem memungkinkan pencatatan `BatchPanen` baru dengan validasi masukan di sisi server serta menolak duplikasi kombinasi `farmerName` dan `commodityName`. | Petani, Pengelola Micro-Hub |
| **FR-04** | Pembaruan Batch Panen | Sistem memungkinkan pembaruan sebagian data `BatchPanen` (seperti `weightKg`, `grade`, atau `isOrganic`) berdasarkan `id` secara tervalidasi. | Pengelola Micro-Hub, Agen QC |
| **FR-05** | Penghapusan Batch Panen | Sistem memungkinkan penghapusan `BatchPanen` berdasarkan `id`. Pada API, penghapusan ditolak (`409 Conflict`) jika batch masih memiliki data relasi `QualityCheck` guna menjaga integritas audit mutu. | Pengelola Micro-Hub |
| **FR-06** | Pengelolaan & Riwayat Inspeksi Mutu (`QualityCheck`) | Sistem memungkinkan Agen QC menambahkan catatan inspeksi mutu (nama pemeriksa, skor 1–5, dan catatan) serta melihat daftar riwayat `QualityCheck` untuk suatu `BatchPanen`. | Agen QC, Konsumen, Pembeli Bisnis |
| **FR-07** | Autentikasi Pengelola | Sistem menyediakan mekanisme masuk (`/masuk`) dan keluar menggunakan sesi berbasis cookie HTTP-only untuk melindungi halaman/aksi pengelolaan tertentu. | Pengelola Micro-Hub |
| **FR-08** | Verifikasi Integritas Data Kriptografis | Sistem mendukung penandatanganan digital (`Ed25519`) pada data `BatchPanen` dan enkripsi payload sensitif (`AES-256-GCM`) untuk menjamin keaslian dan integritas data. | Sistem, Agen QC |

---

## 2. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| ID | Kategori | Deskripsi |
| :--- | :--- | :--- |
| **NFR-01** | Validasi & Keamanan Masukan | Seluruh masukan formulir, parameter path, parameter kueri, dan body JSON wajib divalidasi di sisi server menggunakan skema Zod (`src/lib/skema.ts`) sebelum diproses ke basis data. |
| **NFR-02** | Integritas Data Relasional | Relasi 1:N antara `BatchPanen` dan `QualityCheck` menggunakan aturan `onDelete: Restrict` serta constraint unik untuk mencegah duplikasi dan penghapusan riwayat inspeksi secara tidak sengaja. |
| **NFR-03** | Standar Kontrak RESTful API & Galat | Endpoint di bawah `/api/v1` mematuhi semantik metode HTTP (RFC 9110), mengembalikan kode status yang tepat (`200`, `201`, `204`, `400`, `404`, `405`, `409`, `422`), menggunakan format galat **Problem Details (RFC 9457)** (`application/problem+json`), serta terdokumentasi dalam OpenAPI 3.1. |
| **NFR-04** | Keamanan Informasi Galat | Respons galat API maupun antarmuka tidak boleh mengekspos *stack trace*, kueri SQL, atau pesan galat internal Prisma kepada klien. |
| **NFR-05** | Kinerja & Pembatasan Kueri | Endpoint koleksi menerapkan paginasi dengan batas maksimum (maksimal 50 item per permintaan) serta menjalankan kueri daftar dan hitung total dalam satu transaksi (`prisma.$transaction`) agar konsisten dan tidak membebani basis data. |
| **NFR-06** | Keamanan Kriptografi & Rahasia | Hashing kata sandi menggunakan `scrypt`, kunci kriptografi serta `DATABASE_URL` hanya diakses di sisi server, dan modul sensitif diisolasi dengan `server-only`. |
| **NFR-07** | Responsivitas & Aksesibilitas UI | Antarmuka web dapat digunakan dengan baik pada ukuran layar mobile hingga desktop (640px, 768px, 1024px+) dan memenuhi standar aksesibilitas serta kinerja dasar (Lighthouse). |
