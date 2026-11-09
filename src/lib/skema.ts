import { z } from "zod";

export const skemaBatchPanen = z.object({
  farmerName: z
    .string()
    .trim()
    .min(3, "Nama petani wajib diisi minimal 3 karakter")
    .max(80, "Nama petani maksimal 80 karakter"),
  commodityName: z.enum(["Cabai Merah", "Beras Organik", "Tomat"], {
    error: "Pilih salah satu jenis komoditas yang sah",
  }),
  weightKg: z.coerce
    .number()
    .gt(0, "Berat panen harus berupa angka lebih dari 0 kg")
    .max(10000, "Berat panen melebihi kapasitas maksimum 10.000 kg"),
  grade: z.enum(["GRADE_A", "GRADE_B"], {
    error: "Pilih grade mutu panen yang valid",
  }),
  isOrganic: z.stringbool().default(false),
});

export type MasukanBatchPanen = z.infer<typeof skemaBatchPanen>;

export const skemaMasuk = z.object({
  email: z.email("Format email tidak valid"),
  kataSandi: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export const skemaQualityCheck = z.object({
  inspectorName: z
    .string()
    .min(2, "Nama pemeriksa minimal 2 karakter")
    .max(60, "Nama pemeriksa maksimal 60 karakter"),
  score: z.coerce
    .number()
    .int()
    .min(1, "Skor minimal 1")
    .max(5, "Skor maksimal 5"),
  notes: z
    .string()
    .min(5, "Catatan minimal 5 karakter")
    .max(500, "Catatan maksimal 500 karakter"),
});