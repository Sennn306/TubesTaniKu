import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main id="konten" className="flex-1 mx-auto max-w-2xl w-full p-4 py-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Tambah Batch Panen Baru</h1>
          <div className="mt-2 mb-6 flex items-center justify-between text-sm text-slate-600 border-b border-slate-100 pb-3">
            <p>
              Masuk sebagai: <strong className="text-slate-800">{sesi.email}</strong>
            </p>
            <form action={keluar}>
              <button type="submit" className="text-red-600 hover:text-red-800 font-medium underline">
                Keluar
              </button>
            </form>
          </div>
          <FormBatchPanen />
        </div>
      </main>
      <Footer />
    </div>
  );
}
