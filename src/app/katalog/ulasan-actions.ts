"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
// Gunakan ../../../ untuk keluar sampai ke root folder proyek
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { skemaQualityCheck } from "@/lib/skema";
import type { StatusForm } from "@/lib/status-form";

export async function tambahQualityCheck(
  batchId: number,
  _prev: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  const mentah = Object.fromEntries(formData);
  const hasil = skemaQualityCheck.safeParse(mentah);

  if (!hasil.success) {
    return { galat: z.flattenError(hasil.error).fieldErrors };
  }

  try {
    await prisma.qualityCheck.create({
      data: { ...hasil.data, batchId },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return { galat: { inspectorName: ["Pemeriksa ini sudah mengulas batch ini."] } };
      }
      if (e.code === "P2003") {
        return { pesan: "Batch panen tidak ditemukan." };
      }
    }
    throw e;
  }

  revalidatePath(`/katalog/${batchId}`);
  return { pesan: "Inspeksi mutu tersimpan." };
}

export async function hapusQualityCheck(id: number, batchId: number) {
  await prisma.qualityCheck.deleteMany({ where: { id, batchId } });
  revalidatePath(`/katalog/${batchId}`);
}