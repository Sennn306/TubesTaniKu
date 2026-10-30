import "server-only";
import { MOCK_BATCHES, type BatchItem } from "@/data/mockBatches";
import type { MasukanBatchPanen } from "./skema";

export type { BatchItem };

export const daftarBatchPanen: BatchItem[] = [...MOCK_BATCHES];

export function cariBatch(id: string): BatchItem | undefined {
  return daftarBatchPanen.find((batch) => batch.id === id);
}

export function batchSudahAda(farmerName: string): boolean {
  const dicari = farmerName.toLowerCase();
  return daftarBatchPanen.some(
    (batch) => batch.farmerName.toLowerCase() === dicari
  );
}

export function tambahBatch(masukan: MasukanBatchPanen): BatchItem {
  const id = `batch-${Date.now()}`;
  const item: BatchItem = {
    id,
    ...masukan,
    hubName: "Hub Utama",
    harvestDate: new Date().toISOString().split("T")[0],
    pricePerKg: 15000,
    imageUrl: "/images/placeholder.jpg",
  };
  daftarBatchPanen.push(item);
  return item;
}