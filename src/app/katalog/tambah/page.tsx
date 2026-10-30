import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FormBatchPanen from "@/components/FormBatchPanen";
import { bacaSesi } from "@/lib/sesi";
import { keluar } from "@/app/masuk/actions";

export const metadata: Metadata = {
  title: "Tambah Batch Panen | TubesTaniKu",
};

export default async function HalamanTambahBatch() {
  const sesi = await bacaSesi();
  if (!sesi) redirect("/masuk");

  return (
    <main id="konten" className="mx-auto max-w-2xl p-4">
      <h1 className="text-3xl font-bold">Tambah Batch Panen</h1>
      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
        <p>Masuk sebagai: <strong>{sesi.email}</strong></p>
        <form action={keluar}>
          <button type="submit" className="text-red-600 underline">
            Keluar
          </button>
        </form>
      </div>
      <FormBatchPanen />
    </main>
  );
}