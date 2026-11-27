# Dokumentasi Teknis Modul 8 — RESTful API & OpenAPI 3.1 (`tubestaniku`)

Dokumen ini merangkum implementasi RESTful API di bawah `/api/v1` untuk resource utama **`BatchPanen`** beserta relasi **`QualityCheck`**, validasi Zod, format galat **Problem Details (RFC 9457)**, spesifikasi **OpenAPI 3.1**, serta hasil pengujian.

---

## 1. Ringkasan Implementasi

* **Skema Zod API** ([src/lib/skema-api.ts](file:///c:/Kuliah/Tugas/tubestaniku/src/lib/skema-api.ts)):
  * Menggunakan ulang aturan field dari `skemaBatchPanen` ([src/lib/skema.ts](file:///c:/Kuliah/Tugas/tubestaniku/src/lib/skema.ts)) tanpa mengganggu validasi `FormData` pada form web eksisting.
  * `skemaIdPositif`: Validasi path `id` sebagai bilangan bulat positif (`Int`).
  * `skemaQueryBatchPanen`: Validasi `halaman` (≥ 1, default `1`), `batas` (1–50, default `10`), dan `komoditas` opsional (`"Cabai Merah" | "Beras Organik" | "Tomat"`).
  * `skemaBatchPanenPost` & `skemaBatchPanenPatch` (parsial, minimal 1 field).
* **Helper Problem Details RFC 9457** ([src/lib/api-problem.ts](file:///c:/Kuliah/Tugas/tubestaniku/src/lib/api-problem.ts)):
  * Seluruh respons galat menggunakan header `Content-Type: application/problem+json; charset=utf-8` tanpa membocorkan stack trace atau kueri SQL.
  * Menangani JSON rusak (`400`), parameter path/query tidak valid (`400`), validasi isi Zod (`422` beserta `errors`), resource tidak ditemukan (`404`), dan konflik integritas (`409`).
* **Enam Operasi Route Handler**:
  * `GET /api/v1/batch-panen` & `POST /api/v1/batch-panen` ([src/app/api/v1/batch-panen/route.ts](file:///c:/Kuliah/Tugas/tubestaniku/src/app/api/v1/batch-panen/route.ts))
  * `GET /api/v1/batch-panen/[id]`, `PATCH /api/v1/batch-panen/[id]`, `DELETE /api/v1/batch-panen/[id]` ([src/app/api/v1/batch-panen/[id]/route.ts](file:///c:/Kuliah/Tugas/tubestaniku/src/app/api/v1/batch-panen/%5Bid%5D/route.ts)) — `PUT` tidak diimplementasikan (`405`).
  * `GET /api/v1/batch-panen/[id]/quality-checks` ([src/app/api/v1/batch-panen/%5Bid%5D/quality-checks/route.ts](file:///c:/Kuliah/Tugas/tubestaniku/src/app/api/v1/batch-panen/%5Bid%5D/quality-checks/route.ts))
* **OpenAPI 3.1 & Redocly**:
  * Spesifikasi: [docs/api/openapi.yaml](file:///c:/Kuliah/Tugas/tubestaniku/docs/api/openapi.yaml)
  * Konfigurasi lint: [redocly.yaml](file:///c:/Kuliah/Tugas/tubestaniku/redocly.yaml)
  * Dokumentasi HTML statis: [docs/api/index.html](file:///c:/Kuliah/Tugas/tubestaniku/docs/api/index.html)

---

## 2. Pemeriksaan Statis & Lint

| Perintah | Hasil | Keterangan |
| :--- | :--- | :--- |
| `npx tsc --noEmit` | Lulus (exit code `0`) | Tidak ada galat tipe TypeScript. |
| `npm run lint` | Lulus (exit code `0`) | ESLint bersih tanpa error. |
| `npx --yes @redocly/cli lint docs/api/openapi.yaml` | Lulus (exit code `0`) | 0 error, 0 warning. |
| `npx --yes @redocly/cli build-docs docs/api/openapi.yaml -o docs/api/index.html` | Lulus (exit code `0`) | Menghasilkan `docs/api/index.html` (`300 KiB`). |

---

## 3. Hasil Pengujian `curl` (Database Dummy Lokal)

Pengujian dijalankan terhadap server lokal Next.js dengan database PostgreSQL dummy lokal (data awal `id: 2` memiliki relasi `QualityCheck`; data uji baru `id: 4` dibuat pada `TC-05` dan dihapus bersih pada `TC-16`).

| No | Skenario | Perintah `curl` | Expected | Actual | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | GET koleksi dengan paginasi `batas=2` | `curl -i "http://localhost:3000/api/v1/batch-panen?halaman=1&batas=2"` | `200 OK`, JSON `{ data, meta }` | `200 OK`, `meta: { halaman: 1, batas: 2, total: 1, totalHalaman: 1 }` | **Pass** |
| **TC-02** | GET koleksi filter `komoditas=Beras Organik` | `curl -i "http://localhost:3000/api/v1/batch-panen?komoditas=Beras%20Organik"` | `200 OK`, hanya `Beras Organik` | `200 OK`, 1 item `Beras Organik` (`id: 2`) | **Pass** |
| **TC-03** | GET koleksi dengan `batas=500` (> 50) | `curl -i "http://localhost:3000/api/v1/batch-panen?batas=500"` | `400 Bad Request` (`application/problem+json`) | `400`, `errors.batas`: `"Batas maksimal 50 item per permintaan"` | **Pass** |
| **TC-04** | GET koleksi dengan `komoditas=Mangga` (tidak valid) | `curl -i "http://localhost:3000/api/v1/batch-panen?komoditas=Mangga"` | `400 Bad Request` (`application/problem+json`) | `400`, `errors.komoditas`: `"Pilih salah satu jenis komoditas yang sah"` | **Pass** |
| **TC-05** | POST membuat `BatchPanen` valid | `curl -i -X POST "http://localhost:3000/api/v1/batch-panen" -H "Content-Type: application/json" -d '{"farmerName":"Petani Uji Modul 8","commodityName":"Tomat","weightKg":35.5,"grade":"GRADE_A","isOrganic":true}'` | `201 Created`, header `Location` | `201 Created`, `Location: /api/v1/batch-panen/4`, `id: 4` | **Pass** |
| **TC-06** | POST duplikasi `(farmerName, commodityName)` | `curl -i -X POST "http://localhost:3000/api/v1/batch-panen" -H "Content-Type: application/json" -d '{"farmerName":"Petani Uji Modul 8","commodityName":"Tomat","weightKg":35.5,"grade":"GRADE_A","isOrganic":true}'` | `409 Conflict` (`application/problem+json`) | `409`, `type: .../conflict` | **Pass** |
| **TC-07** | POST dengan body JSON rusak | `curl -i -X POST "http://localhost:3000/api/v1/batch-panen" -H "Content-Type: application/json" -d '{bad json'` | `400 Bad Request` (`invalid-json`) | `400`, `type: .../invalid-json` | **Pass** |
| **TC-08** | POST dengan isi tidak valid (`weightKg: -5`, `farmerName: "A"`) | `curl -i -X POST "http://localhost:3000/api/v1/batch-panen" -H "Content-Type: application/json" -d '{"farmerName":"A","commodityName":"Tomat","weightKg":-5,"grade":"GRADE_A"}'` | `422 Unprocessable Content`, `errors` field | `422`, `errors.farmerName` & `errors.weightKg` | **Pass** |
| **TC-09** | GET detail `BatchPanen` yang baru dibuat (`<ID_BARU>` = `4`) | `curl -i "http://localhost:3000/api/v1/batch-panen/4"` | `200 OK`, detail batch `id: 4` | `200 OK`, `farmerName: "Petani Uji Modul 8"` | **Pass** |
| **TC-10** | GET detail dengan ID bukan bilangan bulat (`abc`) | `curl -i "http://localhost:3000/api/v1/batch-panen/abc"` | `400 Bad Request` (`bad-request`) | `400`, `errors.id`: `"ID harus berupa bilangan bulat positif"` | **Pass** |
| **TC-11** | GET detail dengan ID tidak ada (`99999`) | `curl -i "http://localhost:3000/api/v1/batch-panen/99999"` | `404 Not Found` (`not-found`) | `404`, `"Batch panen dengan ID 99999 tidak ditemukan."` | **Pass** |
| **TC-12** | PATCH parsial valid pada `<ID_BARU>` (`4`) | `curl -i -X PATCH "http://localhost:3000/api/v1/batch-panen/4" -H "Content-Type: application/json" -d '{"weightKg":60,"isOrganic":false}'` | `200 OK`, field terbarui | `200 OK`, `weightKg: 60`, `isOrganic: false` | **Pass** |
| **TC-13** | PATCH dengan body kosong `{}` | `curl -i -X PATCH "http://localhost:3000/api/v1/batch-panen/4" -H "Content-Type: application/json" -d '{}'` | `422 Unprocessable Content` | `422`, `errors._form`: `"Minimal satu field harus disertakan untuk pembaruan."` | **Pass** |
| **TC-14** | GET relasi `QualityCheck` untuk batch `id: 2` | `curl -i "http://localhost:3000/api/v1/batch-panen/2/quality-checks"` | `200 OK`, daftar `QualityCheck` | `200 OK`, 2 item (`id: 3`, `id: 2`) | **Pass** |
| **TC-15** | DELETE batch `id: 2` yang masih memiliki `QualityCheck` (`onDelete: Restrict`) | `curl -i -X DELETE "http://localhost:3000/api/v1/batch-panen/2"` | `409 Conflict` | `409`, `"Batch panen tidak dapat dihapus karena masih memiliki catatan QualityCheck terkait."` | **Pass** |
| **TC-16** | DELETE batch `<ID_BARU>` (`4`) tanpa relasi `QualityCheck` | `curl -i -X DELETE "http://localhost:3000/api/v1/batch-panen/4"` | `204 No Content` tanpa body | `204 No Content` tanpa body | **Pass** |
| **TC-17** | PUT pada `/api/v1/batch-panen/2` (tidak diimplementasikan) | `curl -i -X PUT "http://localhost:3000/api/v1/batch-panen/2" -H "Content-Type: application/json" -d '{"weightKg":60}'` | `405 Method Not Allowed` | `405` | **Pass** |

**Ringkasan Uji `curl`**: **17 / 17 lulus (100%)** — melampaui target minimal 12 kasus dan 90% lulus.

---

## 4. Rencana Kasus Uji Bruno / Thunder Client

Enam kasus uji koleksi Bruno / Thunder Client berikut disiapkan untuk verifikasi GUI klien HTTP (kolom `Actual` dikosongkan karena eksekusi dilakukan melalui `curl`, bukan aplikasi GUI Bruno/Thunder Client):

| No | Request | URL & Body | Assertion Status & Kontrak | Expected | Actual | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BC-01** | List Batch Panen | `GET http://localhost:3000/api/v1/batch-panen?halaman=1&batas=10` | `res.status === 200`, `res.body.data` array, `res.body.meta.batas === 10` | `200` | | Belum Diuji |
| **BC-02** | Create Batch Panen Valid | `POST http://localhost:3000/api/v1/batch-panen` (`{"farmerName":"Petani Bruno","commodityName":"Cabai Merah","weightKg":25,"grade":"GRADE_A","isOrganic":false}`) | `res.status === 201`, header `location` terisi | `201` | | Belum Diuji |
| **BC-03** | Detail Batch Panen | `GET http://localhost:3000/api/v1/batch-panen/{{batchId}}` | `res.status === 200`, `res.body.data.id` cocok | `200` | | Belum Diuji |
| **BC-04** | Update Parsial Invalid (Body Kosong) | `PATCH http://localhost:3000/api/v1/batch-panen/{{batchId}}` (`{}`) | `res.status === 422`, `res.headers['content-type']` mengandung `application/problem+json` | `422` | | Belum Diuji |
| **BC-05** | Riwayat Quality Check Batch | `GET http://localhost:3000/api/v1/batch-panen/2/quality-checks` | `res.status === 200`, `res.body.data` array | `200` | | Belum Diuji |
| **BC-06** | Delete Batch Terkait QualityCheck | `DELETE http://localhost:3000/api/v1/batch-panen/2` | `res.status === 409`, `res.body.status === 409` | `409` | | Belum Diuji |
