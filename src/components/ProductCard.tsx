import Link from 'next/link';
import BadgeGrade from './BadgeGrade';

export interface CardBatchItem {
  id: number | string;
  farmerName: string;
  commodityName: string;
  weightKg: number;
  grade: 'GRADE_A' | 'GRADE_B';
  hubName?: string;
  isOrganic?: boolean;
  pricePerKg?: number;
}

export default function ProductCard({ item }: { item: CardBatchItem }) {
  const namaKomoditas = item.commodityName.replace(/_/g, ' ');

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-900 text-lg">{namaKomoditas}</h3>
          <div className="flex items-center gap-1.5">
            {item.isOrganic && (
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Organik
              </span>
            )}
            <BadgeGrade grade={item.grade} />
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-1">
          Petani: <span className="font-medium text-slate-700">{item.farmerName}</span>
        </p>
        <p className="text-xs text-slate-500 mb-4">
          Berat: <span className="font-medium text-slate-700">{item.weightKg} kg</span>
          {item.hubName && <span> • Lokasi: <span className="font-medium text-slate-700">{item.hubName}</span></span>}
        </p>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div>
            {item.pricePerKg ? (
              <>
                <span className="text-xs text-slate-400 block">Harga</span>
                <span className="text-emerald-600 font-bold text-base">
                  Rp {item.pricePerKg.toLocaleString('id-ID')} / kg
                </span>
              </>
            ) : (
              <span className="text-xs text-emerald-700 font-medium">Terverifikasi Mutu</span>
            )}
          </div>
          <Link
            href={`/batch/${item.id}`}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Detail Batch →
          </Link>
        </div>
      </div>
    </article>
  );
}
