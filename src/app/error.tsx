'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log galat ke konsol server/klien untuk keperluan debugging
    console.error('Terjadi kesalahan pada aplikasi TaniKu:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div
          role="alert"
          className="bg-white p-8 rounded-xl border border-red-200 shadow-sm space-y-4 w-full"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 text-xl font-bold">
            !
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Terjadi Kesalahan Sistem</h1>
          <p className="text-sm text-slate-600">
            Aplikasi mengalami kendala saat memuat halaman ini. Silakan coba memuat ulang halaman.
          </p>

          {error.digest && (
            <p className="text-xs font-mono text-slate-400 bg-slate-100 p-2 rounded">
              Kode Galat: {error.digest}
            </p>
          )}

          <div className="pt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="bg-emerald-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}