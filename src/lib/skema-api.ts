import { z } from "zod";
import { skemaBatchPanen } from "@/lib/skema";
import { Komoditas } from "../../generated/prisma/client";

/**
 * Skema validasi parameter path `id` untuk model dengan ID Int autoincrement.
 */
export const skemaIdPositif = z
  .string()
  .regex(/^\d+$/, "ID harus berupa bilangan bulat positif")
  .transform(Number)
  .pipe(
    z
      .number()
      .int("ID harus berupa bilangan bulat")
      .positive("ID harus lebih dari 0")
  );

/**
 * Skema dasar field JSON BatchPanen yang menggunakan ulang aturan validasi
 * dari `skemaBatchPanen` tanpa merusak validasi FormData eksisting.
 */
const skemaBatchPanenJsonDasar = z.object({
  farmerName: skemaBatchPanen.shape.farmerName,
  commodityName: skemaBatchPanen.shape.commodityName,
  weightKg: z
    .number({ error: "Berat panen harus berupa angka" })
    .gt(0, "Berat panen harus berupa angka lebih dari 0 kg")
    .max(10000, "Berat panen melebihi kapasitas maksimum 10.000 kg"),
  grade: skemaBatchPanen.shape.grade,
});

/**
 * Skema body JSON untuk `POST /api/v1/batch-panen`.
 */
export const skemaBatchPanenPost = skemaBatchPanenJsonDasar.extend({
  isOrganic: z
    .boolean({ error: "Status organik harus berupa boolean" })
    .default(false),
});

export type MasukanBatchPanenPost = z.infer<typeof skemaBatchPanenPost>;

/**
 * Skema body JSON untuk `PATCH /api/v1/batch-panen/[id]` (minimal satu field).
 */
export const skemaBatchPanenPatch = skemaBatchPanenJsonDasar
  .partial()
  .extend({
    isOrganic: z
      .boolean({ error: "Status organik harus berupa boolean" })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus disertakan untuk pembaruan.",
  });

export type MasukanBatchPanenPatch = z.infer<typeof skemaBatchPanenPatch>;

/**
 * Skema query string untuk `GET /api/v1/batch-panen` (paginasi & filter komoditas).
 */
export const skemaQueryBatchPanen = z.object({
  halaman: z.coerce
    .number({ error: "Parameter halaman harus berupa angka" })
    .int("Halaman harus berupa bilangan bulat")
    .min(1, "Halaman minimal 1")
    .default(1),
  batas: z.coerce
    .number({ error: "Parameter batas harus berupa angka" })
    .int("Batas harus berupa bilangan bulat")
    .min(1, "Batas minimal 1")
    .max(50, "Batas maksimal 50 item per permintaan")
    .default(10),
  komoditas: skemaBatchPanen.shape.commodityName.optional(),
});

export type QueryBatchPanen = z.infer<typeof skemaQueryBatchPanen>;

/**
 * Mengonversi nilai komoditas API ("Cabai Merah") ke enum Prisma (`Cabai_Merah`).
 */
export function keKomoditasPrisma(
  nilai: z.infer<typeof skemaBatchPanen.shape.commodityName>
): Komoditas {
  return nilai.replace(/ /g, "_") as Komoditas;
}

/**
 * Mengonversi enum Prisma (`Cabai_Merah`) ke representasi API ("Cabai Merah").
 */
export function dariKomoditasPrisma(nilai: Komoditas): string {
  return nilai.replace(/_/g, " ");
}
