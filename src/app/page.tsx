import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { MOCK_BATCHES } from '@/data/mockBatches';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <section className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Pasokan Tani Segar Langsung dari Micro-Hub</h1>
          <p className="text-slate-600">Produk pertanian terverifikasi mutu oleh Agen QC Desa tanpa melalui rantai tengkulak.</p>
        </section>

        <section aria-labelledby="catalog-heading">
          <h2 id="catalog-heading" className="text-xl font-bold mb-4">Hasil Panen Tersedia Hari Ini</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_BATCHES.map((batch) => (
              <ProductCard key={batch.id} item={batch} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}