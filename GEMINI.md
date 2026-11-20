# Panduan Arsitektur & Aturan Boundaries: TaniKu

Dokumen ini mendefinisikan batasan arsitektur (architectural boundaries), pola desain, stack teknologi, serta pedoman ketergantungan antar-folder untuk proyek **TaniKu** (Hyper-Local Micro-Hub Platform).

---

## 1. Ringkasan Arsitektur & Teknologi Utama

TaniKu dibangun di atas arsitektur server-driven modern berbasis Next.js App Router dengan pemisahan peran yang ketat antara komputasi server (validasi, kriptografi, akses basis data) dan interaksi klien.

### Stack Teknologi Utama:
- **Framework & Runtime**: Next.js 16 (App Router, Server Actions, Partial Prerendering, Turbopack) & React 19
- **Bahasa**: TypeScript 5
- **Basis Data & ORM**: PostgreSQL, Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`, target generate `generated/prisma`)
- **Validasi Data**: Zod v4 (Validasi skema sisi server untuk mutasi dan masukan form)
- **Kriptografi & Keamanan**:
  - Node.js `crypto` (Ed25519 digital signature untuk integritas data `BatchPanen`)
  - AES-256-GCM (AEAD Encryption & Decryption untuk keamanan payload)
  - HTTP Cookie-based Session Guard (`src/proxy.ts` / Server Actions)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`)
- **Testing**: Jest 30 & `ts-jest` (Unit testing modul kriptografi dan utilitas)

---

## 2. Pola Desain (Design Patterns)

1. **Server-Driven Architecture & Server Actions Pattern**:
   - Seluruh mutasi data dan interaksi basis data dipusatkan pada Server Actions (`actions.ts`).
   - Eksekusi database dilindungi dengan penanda runtime `import "server-only"` untuk mencegah kebocoran logika ke bundle klien.
2. **Layered Architecture & Separation of Concerns (SoC)**:
   - **Presentation Layer**: Server Components (`page.tsx`) untuk data fetching awal dan Client Components (`src/components/Form*.tsx`) untuk interaktivitas form.
   - **Action / Controller Layer**: `src/app/**/actions.ts` yang menangani form parsing, autentikasi sesi, dan orkestrasi mutasi.
   - **Validation Layer**: `src/lib/skema.ts` mendefinisikan validasi deklaratif dengan Zod.
   - **Data Access Layer (DAL)**: `src/lib/data.ts` dan `src/lib/prisma.ts` mengisolasi kueri Prisma.
   - **Cryptographic Service Layer**: `src/batchSigner.ts` dan `src/lib/aeadCipher.ts` menangani penandatanganan dan enkripsi payload.
3. **Singleton Pattern**:
   - Prisma Client diinisialisasi secara singleton pada `src/lib/prisma.ts` memanfaatkan `globalThis` guna mencegah koneksi berlebih selama siklus hot-reloading Next.js di lingkungan development.
4. **Action State Form Pattern**:
   - Client Component menggunakan hook React 19 `useActionState` bersama Server Actions untuk menangani status pending, pesan sukses, dan pemetaan galat field-level secara reaktif.
5. **Atomic Transaction Pattern**:
   - Operasi penghapusan atau mutasi relasi dependen (seperti `QualityCheck` terhadap `BatchPanen`) dikapsulasi dalam `prisma.$transaction`.

---

## 3. Batasan Arsitektur & Aturan Folder (Architecture Boundaries)

Agar integritas kode dan keamanan aplikasi terjaga, aturan dependensi antardirektori berikut wajib dipatuhi:

### Matriks Ketergantungan:

| Folder / Layer | Boleh Mengimpor Dari | Dilarang Mengimpor Dari |
| :--- | :--- | :--- |
| **`src/components/`** (`"use client"`) | `src/lib/skema.ts`, `src/lib/status-form.ts`, `src/app/**/actions.ts` (sebagai action reference) | `src/lib/prisma.ts`, `src/lib/data.ts`, `src/batchSigner.ts`, `src/lib/aeadCipher.ts`, paket `server-only`, Node.js core modules (`crypto`, `pg`, `fs`) |
| **`src/app/**/page.tsx`** (Server Components) | `src/lib/data.ts`, `src/components/*`, `src/lib/*` | `actions.ts` (tidak boleh memanggil mutasi langsung saat render) |
| **`src/app/**/actions.ts`** (`"use server"`) | `src/lib/prisma.ts`, `src/lib/skema.ts`, `src/lib/sesi.ts`, `src/batchSigner.ts`, `generated/prisma` | `src/components/*`, Browser APIs |
| **`src/lib/`** (DAL & Core Services) | `generated/prisma`, modul utilitas internal `src/lib/` | `src/app/*`, `src/components/*` |
| **`test/`** | `src/batchSigner.ts`, `src/lib/aeadCipher.ts`, modul yang diuji | Browser UI components |

### Aturan Batasan Utama (Strict Rules):
1. **Pemisahan Client/Server yang Ketat**:
   - Komponen dengan direktif `"use client"` **TIDAK BOLEH** mengimpor modul bertanda `import "server-only"` (`src/lib/prisma.ts`, `src/lib/data.ts`) atau modul kriptografi berbasis Node.js `crypto`.
   - Data dari server ke Client Component hanya boleh diteruskan melalui props serializable atau melalui return value dari Server Actions.
2. **Isolasi Akses Basis Data**:
   - Kueri Prisma hanya boleh dieksekusi di Server Components (`page.tsx`) untuk pembacaan data atau di Server Actions (`actions.ts`) untuk mutasi data.
3. **Isolasi Kunci Kriptografi & Rahasia**:
   - Modul `batchSigner.ts` dan `aeadCipher.ts` serta variabel lingkungan sensitif (`DATABASE_URL`, `ENCRYPTION_KEY`) tidak boleh diekspos ke sisi klien.
4. **Generated Client Boundary**:
   - Seluruh impor Prisma Client harus melalui `@/lib/prisma` atau tipe dari `generated/prisma/client`, bukan mengimpor berkas mentah dari direktori `prisma/`.

---

## 4. Perintah Build, Test, dan Operasional

Gunakan perintah-perintah berikut untuk pengembangan, pengujian, dan build proyek:

### Instalasi Dependensi
```bash
npm install
```

### Basis Data & Prisma
```bash
# Generate Prisma Client (ke generated/prisma)
npx prisma generate

# Jalankan migrasi basis data (lingkungan dev)
npx prisma migrate dev

# Jalankan seeding data awal
npx tsx prisma/seed.ts

# Buka antarmuka grafis Prisma Studio
npx prisma studio
```

### Pengujian (Testing)
```bash
# Menjalankan seluruh unit test (Jest)
npm test

# Menjalankan test dalam mode watch
npx jest --watch
```

### Linting & Validasi Kode
```bash
# Menjalankan linter ESLint
npm run lint
```

### Build & Menjalankan Aplikasi
```bash
# Menjalankan development server (dengan Turbopack)
npm run dev

# Kompilasi build produksi (standalone output)
npm run build

# Menjalankan build produksi
npm start
```
