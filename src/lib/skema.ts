import { z } from "zod";

export const skemaBatchPanen = z.object({
  farmerName: z.string().trim()
    .min(3, "Nama petani wajib diisi minimal 3 karakter")
    .max(80, "Nama petani maksimal 80 karakter"),
  commodityName: z.enum(["Cabai Merah", "Beras Organik", "Tomat"], {
    error: "Pilih salah satu jenis komoditas yang sah",
  }),
  weightKg: z.coerce.number()
    .gt(0, "Berat panen harus berupa angka lebih dari 0 kg")
    .max(10000, "Berat panen melebihi kapasitas maksimum 10.000 kg"),
  grade: z.enum(["Grade A", "Grade B", "Grade C"], {
    error: "Pilih grade mutu panen yang valid",
  }),
  isOrganic: z.stringbool().default(false),
});

export type MasukanBatchPanen = z.infer<typeof skemaBatchPanen>;