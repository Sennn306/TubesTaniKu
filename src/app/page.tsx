import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ambilDaftarBatch } from '@/lib/data';

export default async function Home() {
  let daftarBatch: Awaited<ReturnType<typeof ambilDaftarBatch>> = [];
  try {
    daftarBatch = await ambilDaftarBatch();
  } catch (err) {
    console.error('Gagal memuat batch dari database:', err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <section className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              Pasokan Tani Segar Langsung dari Micro-Hub
            </h1>
            <p className="text-slate-600">
              Produk pertanian terverifikasi mutu oleh Agen QC Desa tanpa melalui rantai tengkulak.
            </p>
          </div>
          <Link
            href="/katalog/tambah"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition shadow-sm"
          >
            + Tambah Batch Panen
          </Link>
        </section>

        <section aria-labelledby="catalog-heading">
          <h2 id="catalog-heading" className="text-xl font-bold mb-4">
            Hasil Panen Tersedia Hari Ini
          </h2>
          {daftarBatch.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-white">
              <p className="text-slate-500 mb-3">Belum ada data batch panen yang tersimpan di sistem.</p>
              <Link
                href="/katalog/tambah"
                className="text-sm font-semibold text-emerald-700 underline"
              >
                Tambah Batch Panen Pertama
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {daftarBatch.map((batch) => (
                <ProductCard key={batch.id} item={batch} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
