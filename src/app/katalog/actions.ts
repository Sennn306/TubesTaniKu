"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// 1. Tambahkan 1 level ../ untuk keluar dari src/
import { Prisma, Komoditas } from "../../../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { skemaBatchPanen } from "@/lib/skema";
import { bacaSesi } from "@/lib/sesi";
import type { StatusForm } from "@/lib/status-form";

export async function simpanBatchPanen(
  _sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  const sesi = await bacaSesi();
  if (!sesi) return { pesan: "Silakan masuk terlebih dahulu." };

  const mentah = Object.fromEntries(formData);
  const hasil = skemaBatchPanen.safeParse(mentah);

  if (!hasil.success) {
    return {
      galat: z.flattenError(hasil.error).fieldErrors,
      pesan: "Periksa kembali isian formulir.",
    };
  }

  // 2. Petakan spasi ke underscore agar sesuai dengan enum Prisma Client
  const commodityEnum = hasil.data.commodityName.replace(/ /g, "_") as Komoditas;

  try {
    await prisma.batchPanen.create({
      data: {
        ...hasil.data,
        commodityName: commodityEnum,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        galat: { farmerName: ["Petani sudah mendaftarkan komoditas ini."] },
      };
    }
    throw e;
  }

  revalidatePath("/katalog");
  redirect("/katalog");
}

export async function hapusBatchPanen(id: number) {
  const sesi = await bacaSesi();
  if (!sesi) throw new Error("Tidak terautentikasi");

  await prisma.$transaction([
    prisma.qualityCheck.deleteMany({ where: { batchId: id } }),
    prisma.batchPanen.delete({ where: { id } }),
  ]);

  revalidatePath("/katalog");
  redirect("/katalog");
}