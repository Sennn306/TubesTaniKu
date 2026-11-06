import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ambilBatch } from "@/lib/data";
import { hapusBatchPanen } from "@/app/batch/actions";
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

  const namaKomoditas = batch.commodityName.replace(/_/g, " ");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main id="konten" className="flex-1 mx-auto max-w-3xl w-full p-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:underline mb-4"
        >
          ← Kembali ke Katalog
        </Link>

        {/* Header Detail Batch Panen */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{batch.farmerName}</h1>
              <p className="mt-1 text-slate-600">
                Komoditas: <span className="font-semibold text-slate-800">{namaKomoditas}</span>
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              ID: #{batch.id}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded bg-green-100 px-2.5 py-1 text-green-800 font-medium">
              Berat: {batch.weightKg} kg
            </span>
            <span className="rounded bg-blue-100 px-2.5 py-1 text-blue-800 font-medium">
              Grade: {batch.grade.replace(/_/g, " ")}
            </span>
            {batch.isOrganic && (
              <span className="rounded bg-emerald-100 px-2.5 py-1 text-emerald-800 font-medium">
                Organik
              </span>
            )}
          </div>
        </div>

        {/* 2. Daftar Riwayat Inspeksi QualityCheck */}
        <h2 className="mt-8 text-xl font-bold text-slate-900">
          Riwayat Inspeksi Mutu ({batch.qualityChecks.length})
        </h2>

        {batch.qualityChecks.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 italic">
            Belum ada catatan inspeksi mutu untuk batch ini.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {batch.qualityChecks.map((qc) => (
              <li key={qc.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex justify-between font-medium text-slate-900">
                  <span>{qc.inspectorName}</span>
                  <span className="text-emerald-700 font-bold">Skor: {qc.score}/5</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{qc.notes}</p>
                <div className="mt-3 flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-2">
                  <span>{new Date(qc.checkedAt).toLocaleString("id-ID")}</span>
                  {/* Hapus Catatan Quality Check */}
                  <form action={hapusQualityCheck.bind(null, qc.id, batch.id)}>
                    <button type="submit" className="text-red-600 hover:text-red-800 font-medium underline">
                      Hapus Inspeksi
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 3. Formulir Tambah QualityCheck Baru */}
        <FormQualityCheck batchId={batch.id} />

        {/* 4. Tombol Hapus Batch Panen (Transaksional RESTRICT) */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          <form action={hapusBatchPanen.bind(null, batch.id)}>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Hapus Batch Panen (Transaksional)
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            * Menghapus batch panen akan menghapus seluruh catatan QualityCheck terkait secara atomik.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
