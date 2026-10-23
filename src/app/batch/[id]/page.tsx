import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BadgeGrade from '@/components/BadgeGrade';
import { MOCK_BATCHES } from '@/data/mockBatches';

// 1. Wajib untuk prerender static shell pada Next.js 16 / Cache Components
export function generateStaticParams() {
  return MOCK_BATCHES.map((b) => ({
    id: b.id,
  }));
}

export default async function BatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // 2. Validasi format ID (wajib diawali BATCH-)
  if (!/^BATCH-[A-Za-z0-9-]+$/.test(id)) {
    notFound();
  }

  // 3. Cari data batch berdasarkan ID
  const item = MOCK_BATCHES.find((b) => b.id === id);

  // 4. Jika ID sah tapi data tidak ada di mock, tampilkan 404
  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{item.commodityName}</h1>
              <p className="text-xs text-slate-500 mt-1">ID Batch: {item.id}</p>
            </div>
            <BadgeGrade grade={item.grade} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Nama Petani</span>
              <span className="font-semibold text-slate-800">{item.farmerName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Titik Kumpul (Micro-Hub)</span>
              <span className="font-semibold text-slate-800">{item.hubName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Tanggal Panen</span>
              <span className="font-semibold text-slate-800">{item.harvestDate}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Stok Tersedia</span>
              <span className="font-semibold text-slate-800">{item.weightKg} kg</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}