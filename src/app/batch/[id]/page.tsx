import { notFound } from "next/navigation";
import { ambilBatch } from "@/lib/data";
import { hapusBatchPanen } from "@/app/katalog/actions";
import { hapusQualityCheck } from "@/app/katalog/ulasan-actions";
import FormQualityCheck from "@/components/FormQualityCheck";

export default async function DetailBatchPanen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  // 1. Ambil data BatchPanen beserta relasi QualityCheck dari PostgreSQL
  const batch = await ambilBatch(id);
  if (!batch) notFound();

  return (
    <main id="konten" className="mx-auto max-w-3xl p-4">
      {/* Header Detail Batch Panen */}
      <div className="rounded-lg border p-6 shadow-sm">
        <h1 className="text-3xl font-bold">{batch.farmerName}</h1>
        <p className="mt-1 text-gray-600">
          Komoditas: <span className="font-semibold">{batch.commodityName}</span>
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <span className="rounded bg-green-100 px-2 py-1 text-green-800">
            Berat: {batch.weightKg} kg
          </span>
          <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">
            Grade: {batch.grade}
          </span>
          {batch.isOrganic && (
            <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-800">
              Organik
            </span>
          )}
        </div>
      </div>

      {/* 2. Daftar Riwayat Inspeksi QualityCheck */}
      <h2 className="mt-8 text-xl font-semibold">
        Riwayat Inspeksi Mutu ({batch.qualityChecks.length})
      </h2>
      <ul className="mt-4 space-y-3">
        {batch.qualityChecks.map((qc) => (
          <li key={qc.id} className="rounded border p-3">
            <div className="flex justify-between font-medium">
              <span>{qc.inspectorName}</span>
              <span>Skor: {qc.score}/5</span>
            </div>
            <p className="mt-1 text-sm text-gray-700">{qc.notes}</p>
            
            {/* Hapus Catatan Quality Check */}
            <form action={hapusQualityCheck.bind(null, qc.id, batch.id)} className="mt-2">
              <button type="submit" className="text-xs text-red-700 underline">
                Hapus Inspeksi
              </button>
            </form>
          </li>
        ))}
      </ul>

      {/* 3. Formulir Tambah QualityCheck Baru */}
      <FormQualityCheck batchId={batch.id} />

      {/* 4. Tombol Hapus Batch Panen (Transaksional RESTRICT) */}
      <form action={hapusBatchPanen.bind(null, batch.id)} className="mt-8 border-t pt-4">
        <button
          type="submit"
          className="rounded bg-red-700 px-4 py-2 text-white hover:bg-red-800"
        >
          Hapus Batch Panen
        </button>
      </form>
    </main>
  );
}