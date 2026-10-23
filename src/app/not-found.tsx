import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4 w-full">
          <span className="text-5xl font-extrabold text-green-600 block">404</span>
          <h1 className="text-2xl font-bold text-slate-900">Halaman Tidak Ditemukan</h1>
          <p className="text-sm text-slate-600">
            Maaf, alamat URL yang kamu tuju tidak ditemukan atau telah dipindahkan.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block bg-green-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}