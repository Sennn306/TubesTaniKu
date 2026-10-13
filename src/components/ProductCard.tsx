import Link from 'next/link';
import BadgeGrade from './BadgeGrade';
import { BatchItem } from '../data/mockBatches';

export default function ProductCard({ item }: { item: BatchItem }) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-900 text-lg">{item.commodityName}</h3>
          <BadgeGrade grade={item.grade} />
        </div>
        <p className="text-xs text-slate-5-00 mb-1">Petani: <span className="font-medium text-slate-700">{item.farmerName}</span></p>
        <p className="text-xs text-slate-500 mb-4">Lokasi: <span className="font-medium text-slate-700">{item.hubName}</span></p>

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">Harga</span>
            <span className="text-emerald-600 font-bold text-base">Rp {item.pricePerKg.toLocaleString('id-ID')} / kg</span>
          </div>
          <Link href={`/batch/${item.id}`} className="text-xs font-semibold text-emerald-700 hover:underline">
            Detail Batch →
          </Link>
        </div>
      </div>
    </article>
  );
}