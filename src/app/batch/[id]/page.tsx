import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BadgeGrade from '@/components/BadgeGrade';
import { MOCK_BATCHES } from '@/data/mockBatches';

export default async function BatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = MOCK_BATCHES.find((b) => b.id === resolvedParams.id) || MOCK_BATCHES[0];

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