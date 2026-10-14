# Asset Inventory — TaniKu Platform (v0.1)

Dokumen ini mencatat seluruh aset perangkat lunak, infrastruktur, dan data pada platform TaniKu beserta tingkat kerahasiaan, integritas, dan ketersediaannya (CIA Triad).

## 1. Perangkat Lunak & Komponen Sistem (Component Inventory)

| ID Komponen | Nama Komponen       | Deskripsi & Teknologi                                           | Lingkungan Expose       |
| :---------- | :------------------ | :-------------------------------------------------------------- | :---------------------- |
| **COMP-01** | Frontend Web App    | Aplikasi Next.js 15+ (App Router, React, Tailwind CSS)          | Public / Client Browser |
| **COMP-02** | Form QC Drop-Off    | Komponen form client-side (`/qc`) untuk input hasil panen       | Internal (Agen QC Desa) |
| **COMP-03** | Modul Cryptography  | Engine Ed25519 (`src/batchSigner.ts`) berbasis Node.js `crypto` | Client/Server Local     |
| **COMP-04** | Client LocalStorage | Penyimpanan data sementara browser (`taniku_batches`)           | Client Storage          |

---

## 2. Aset Data (Data Inventory)

| ID Aset     | Nama Aset Data             | Deskripsi Data                                                            | Klasifikasi                     | Proteksi Kriptografi                                  |
| :---------- | :------------------------- | :------------------------------------------------------------------------ | :------------------------------ | :---------------------------------------------------- |
| **DATA-01** | Pasangan Kunci QC (Keys)   | Private Key & Public Key Ed25519 milik Agen QC Desa                       | **Rahasia (Confidential)**      | Dilindungi di memori / Private Key harus dirahasiakan |
| **DATA-02** | Digital Signature Batch    | String Tanda Tangan Digital (`ed25519:hex...`) hasil _signing_ data panen | **Kritis (Integrity-Critical)** | **Tergenerasi Kriptografi (Ed25519)**                 |
| **DATA-03** | Rekam Mutu & Panen (Batch) | Data ID panen, Nama Petani, Komoditas, Berat (kg), dan Grade Mutu         | **Publik / Terverifikasi**      | **Dilindungi Hash Integrity & Digital Signature**     |
| **DATA-04** | Log Lokal Browser          | State katalog panen yang tersimpan di `localStorage`                      | **Internal**                    | Non-Kriptografi (Temporary Storage)                   |
