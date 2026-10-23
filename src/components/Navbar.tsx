import { Suspense } from 'react';
import Link from 'next/link';
import TautanNav, { type Tautan } from '@/components/TautanNav';

const daftarTautan: Tautan[] = [
  { href: '/', label: 'Katalog' },
  { href: '/qc', label: 'Portal Agen QC' },
  { href: '/tentang', label: 'Tentang' },
];

export default function Navbar() {
  return (
    <header className="bg-emerald-700 text-white shadow-md">
      <nav
        className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center"
        aria-label="Navigasi Utama"
      >
        <Link href="/" className="text-xl font-bold tracking-wide">
          Tani<span className="text-amber-300">Ku</span>
        </Link>

        {/* Menggunakan TautanNav berbasis Client Component di dalam Suspense */}
        <Suspense fallback={<TautanPolos tautan={daftarTautan} />}>
          <TautanNav tautan={daftarTautan} />
        </Suspense>
      </nav>
    </header>
  );
}

// Fallback tampilan statis saat komponen TautanNav dimuat di server
function TautanPolos({ tautan }: { tautan: Tautan[] }) {
  return (
    <ul className="flex gap-4 text-sm font-medium">
      {tautan.map((t) => (
        <li key={t.href}>
          <Link href={t.href} className="hover:text-amber-200 transition">
            {t.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}