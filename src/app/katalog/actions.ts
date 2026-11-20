"use server";

import {
  simpanBatchPanen as simpanBatchPanenImpl,
  hapusBatchPanen as hapusBatchPanenImpl,
} from "@/app/batch/actions";
import type { StatusForm } from "@/lib/status-form";

export async function simpanBatchPanen(
  sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  return simpanBatchPanenImpl(sebelumnya, formData);
}

export async function hapusBatchPanen(id: number) {
  return hapusBatchPanenImpl(id);
}
