import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BatchNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4 w-full">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 text-xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Batch Panen Tidak Ditemukan</h1>
          <p className="text-sm text-slate-600">
            ID batch panen yang kamu cari tidak terdaftar atau format ID yang dimasukkan tidak valid.
          </p>
          <div className="pt-4">
            <Link
              href="/"
              className="inline-block bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-slate-900 transition-colors text-sm"
            >
              Lihat Katalog Panen
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}