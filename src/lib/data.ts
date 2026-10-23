import "server-only";
import { MOCK_BATCHES, type BatchItem } from "@/data/mockBatches";

// Re-export tipe agar terpusat
export type { BatchItem };

// Gunakan MOCK_BATCHES sebagai data awal di memori server
export const daftarBatchPanen: BatchItem[] = [...MOCK_BATCHES];

/**
 * Mencari detail batch panen berdasarkan ID batch.
 */
export function cariBatch(id: string): BatchItem | undefined {
  return daftarBatchPanen.find((batch) => batch.id === id);
}

/**
 * Memeriksa apakah ID batch sudah pernah terdaftar.
 */
export function batchSudahAda(id: string): boolean {
  return daftarBatchPanen.some((batch) => batch.id === id);
}

/**
 * Menambahkan data batch panen baru ke memori server.
 */
export function tambahBatch(
  masukan: Omit<BatchItem, "id" | "imageUrl" | "pricePerKg"> & {
    id?: string;
    pricePerKg?: number;
    imageUrl?: string;
  }
): BatchItem {
  const id = masukan.id || `BATCH-${Date.now().toString().slice(-6)}`;
  const batchBaru: BatchItem = {
    id,
    pricePerKg: masukan.pricePerKg ?? 25000,
    imageUrl:
      masukan.imageUrl ??
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&q=80&w=400",
    ...masukan,
  };
  daftarBatchPanen.unshift(batchBaru);
  return batchBaru;
}