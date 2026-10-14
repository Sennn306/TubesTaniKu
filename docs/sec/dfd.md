# Data Flow Diagram (DFD) — TaniKu Platform

Dokumen ini menjelaskan batas kepercayaan (_trust boundary_) dan aliran data pada arsitektur TaniKu v0.1.

## 1. Daftar Elemen DFD

- **External Entities (Aktor):**
  - `EE-01`: Agen QC Desa (User yang menguji & menginput panen)
  - `EE-02`: Konsumen / Pembeli Public (User yang melihat katalog & melacak batch)
- **Processes (Proses):**
  - `P-01`: Client-Side Validation & Batch Structuring (`/qc/page.tsx`)
  - `P-02`: Ed25519 Cryptographic Signer Engine (`src/batchSigner.ts`)
  - `P-03`: Catalog Rendering & Verification (`src/app/page.tsx` & `/batch/[id]`)
- **Data Stores (Penyimpanan Data):**
  - `DS-01`: Browser `localStorage` (`taniku_batches`)
- **Data Flows (Aliran Data):**
  - `DF-01`: Form Input Panen (Nama Petani, Berat, Grade)
  - `DF-02`: Unsigned Batch Payload
  - `DF-03`: Private Key & Payload untuk Penandatanganan
  - `DF-04`: **Signed Batch Data (Dilindungi Kriptografi Ed25519)**
  - `DF-05`: Batch Data & Signature dipersistensikan
  - `DF-06`: Pembacaan Katalog & Status Verifikasi Panen

---

## 2. Diagram DFD (Mermaid Syntax)

```mermaid
graph TD
    subgraph TB1 [Trust Boundary 1: Untrusted Public Client Environment]
        EE02[EE-02: Konsumen / Publik]
        EE01[EE-01: Agen QC Desa]
    end

    subgraph TB2 [Trust Boundary 2: TaniKu Application Execution Environment]
        P01[P-01: Form QC Validation Engine]
        P02[P-02: Ed25519 Crypto Signer Engine]
        P03[P-03: Catalog & Verification Renderer]
        DS01[(DS-01: Client LocalStorage)]
    end

    EE01 -->|DF-01: Form Input Panen| P01
    P01 -->|DF-02: Unsigned Batch Payload| P02
    P02 -->|DF-03: Sign via Private Key| P02
    P02 -->|DF-04: Signed Batch Data - KRIPTOGRAFI Ed25519| DS01
    DS01 -->|DF-05: Stored Batches & Signatures| P03
    P03 -->|DF-06: Verified Catalog & Batch Details| EE02

    style DF-04 fill:#22c55e,stroke:#15803d,color:#fff,stroke-width:2px
    style P02 fill:#0284c7,stroke:#0369a1,color:#fff
```
