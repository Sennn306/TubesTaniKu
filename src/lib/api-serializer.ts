import type { BatchPanen, QualityCheck } from "../../generated/prisma/client";
import { dariKomoditasPrisma } from "@/lib/skema-api";

export function serialisasiBatch(batch: BatchPanen) {
  return {
    id: batch.id,
    farmerName: batch.farmerName,
    commodityName: dariKomoditasPrisma(batch.commodityName),
    weightKg: batch.weightKg,
    grade: batch.grade,
    isOrganic: batch.isOrganic,
    createdAt: batch.createdAt.toISOString(),
  };
}

export function serialisasiQualityCheck(qc: QualityCheck) {
  return {
    id: qc.id,
    batchId: qc.batchId,
    inspectorName: qc.inspectorName,
    score: qc.score,
    notes: qc.notes,
    checkedAt: qc.checkedAt.toISOString(),
  };
}
