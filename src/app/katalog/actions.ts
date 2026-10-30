"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { skemaBatchPanen } from "@/lib/skema";
import { batchSudahAda, tambahBatch } from "@/lib/data";
import { bacaSesi } from "@/lib/sesi";
import type { StatusForm } from "@/lib/status-form";

export async function simpanBatchPanen(
  _sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  const sesi = await bacaSesi();
  if (!sesi) {
    return { pesan: "Silakan masuk terlebih dahulu." };
  }

  const mentah = Object.fromEntries(formData);
  const nilai = {
    farmerName: String(mentah.farmerName ?? ""),
    commodityName: String(mentah.commodityName ?? ""),
    weightKg: String(mentah.weightKg ?? ""),
    grade: String(mentah.grade ?? ""),
  };

  const hasil = skemaBatchPanen.safeParse(mentah);
  if (!hasil.success) {
    return {
      galat: z.flattenError(hasil.error).fieldErrors,
      pesan: "Periksa kembali isian formulir.",
      nilai,
    };
  }

  if (batchSudahAda(hasil.data.farmerName)) {
    return {
      galat: {
        farmerName: ["Nama petani ini sudah terdaftar dalam batch panen"],
      },
      nilai,
    };
  }

  let itemBaru;
  try {
    itemBaru = tambahBatch(hasil.data);
  } catch (e) {
    console.error("simpanBatchPanen gagal:", e);
    return { pesan: "Batch panen gagal disimpan. Coba lagi.", nilai };
  }

  revalidatePath("/katalog");
  redirect(`/katalog/${itemBaru.id}`);
}