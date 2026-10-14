```markdown
# Threat Model (STRIDE) — TaniKu Platform

Analisis ancaman menggunakan metodologi STRIDE berdasarkan DFD dan Aset TaniKu v0.1.

| ID Threat | Kategori STRIDE            | Elemen DFD Terdampak      | Aset Terdampak            | Deskripsi Ancaman Spesifik                                                                                                      |
| :-------- | :------------------------- | :------------------------ | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------ |
| **TH-01** | **Spoofing**               | `EE-01` (Agen QC)         | `DATA-01` (Identity)      | Pihak tidak berwenang berpura-pura menjadi Agen QC Desa sah untuk menginput data panen palsu.                                   |
| **TH-02** | **Spoofing**               | `P-02` (Crypto Engine)    | `DATA-01` (Keys)          | Penyerang memalsukan Public Key Agen QC saat verifikasi batch panen di client-side.                                             |
| **TH-03** | **Tampering**              | `DS-01` (`localStorage`)  | `DATA-03` (Grade Panen)   | Pengguna/Penyerang memanipulasi nilai `grade` atau `weightKg` secara langsung lewat DevTools Browser pada `localStorage`.       |
| **TH-04** | **Tampering**              | `DF-04` (Signed Data)     | `DATA-02` (Signature)     | Penyerang mengubah isi payload batch panen tetapi tetap menggunakan signature lama agar seolah-olah sah.                        |
| **TH-05** | **Repudiation**            | `P-01` (Form QC)          | `DATA-03` (Batch Record)  | Agen QC menyangkal telah memasukkan data panen yang salah/rusak karena sistem v0.1 belum mencatat _audit log_ identitas login.  |
| **TH-06** | **Information Disclosure** | `DS-01` (`localStorage`)  | `DATA-01` (Private Key)   | Pengembang keliru menyimpan Ed25519 Private Key Agen QC ke dalam `localStorage` yang bisa dibaca skrip XSS.                     |
| **TH-07** | **Information Disclosure** | `EE-02` (Public Catalog)  | `DATA-03` (Detail Petani) | Expose data sensitif pribadi petani (nomor HP / alamat rumah) secara mentah pada katalog publik tanpa _masking_.                |
| **TH-08** | **Denial of Service**      | `P-01` (Form Validation)  | `COMP-01` (Web App)       | Pengirim memasukkan string ukuran mega-byte pada kolom `farmerName` sehingga menyebabkan browser client _hang/freeze_.          |
| **TH-09** | **Denial of Service**      | `DS-01` (`localStorage`)  | `DS-01` (Storage Limit)   | Penyerang membuat ribuan data dummy via console hingga melebihi kuota 5MB `localStorage` browser.                               |
| **TH-10** | **Elevation of Privilege** | `P-03` (Catalog Renderer) | `COMP-01` (UI DOM)        | Penyerang menyisipkan skrip `script` (Stored XSS) pada input `farmerName` untuk mengeksekusi kode berbahaya di browser pembeli. |
```
