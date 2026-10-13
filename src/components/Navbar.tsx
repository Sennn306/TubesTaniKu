import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-emerald-700 text-white shadow-md">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center" aria-label="Navigasi Utama">
        <Link href="/" className="text-xl font-bold tracking-wide">
          Tani<span className="text-amber-300">Ku</span>
        </Link>
        <div className="flex gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-amber-200 transition">Katalog</Link>
          <Link href="/qc" className="hover:text-amber-200 transition">Portal Agen QC</Link>
        </div>
      </nav>
    </header>
  );
}