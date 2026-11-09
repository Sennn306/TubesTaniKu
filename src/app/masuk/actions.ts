"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { skemaMasuk } from "@/lib/skema";
import { buatSesi, hapusSesi } from "@/lib/sesi";
import { verifikasiKataSandi, hashKataSandi } from "@/lib/password";
import type { StatusForm } from "@/lib/status-form";

// Hash slow memory-hard bawaan (scrypt) untuk akun demo: 'tubestaniku123'
const HASH_BAWAAN =
  "scrypt$a8f13c72b5d49e102f6a8b7c3d1e4f50$0d1836d5c67d15f638249c535561739465c2b3d32bc9b39f98099e8759dc8921418b10b2ddb76bce49690c6edb834d9f26223c2a37037b3d924a039562526d57";

export async function masuk(
  _sebelumnya: StatusForm,
  formData: FormData
): Promise<StatusForm> {
  const mentah = Object.fromEntries(formData);
  const hasil = skemaMasuk.safeParse(mentah);

  if (!hasil.success) {
    return { galat: z.flattenError(hasil.error).fieldErrors };
  }

  const { email, kataSandi } = hasil.data;
  const targetEmail = process.env.DEMO_EMAIL || "pengelola@tubestaniku.com";
  const storedHash =
    process.env.DEMO_KATA_SANDI_HASH ||
    (process.env.DEMO_KATA_SANDI
      ? hashKataSandi(process.env.DEMO_KATA_SANDI)
      : HASH_BAWAAN);

  const kataSandiCocok = verifikasiKataSandi(kataSandi, storedHash);

  if (email !== targetEmail || !kataSandiCocok) {
    return { pesan: "Email atau kata sandi salah." };
  }

  await buatSesi(email);
  redirect("/katalog/tambah");
}

export async function keluar() {
  await hapusSesi();
  redirect("/");
}
