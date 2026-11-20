"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GalatKatalogItem({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi galat pada pemrosesan item katalog:", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto max-w-xl p-6 mt-10 rounded-xl border border-red-200 bg-white shadow-sm text-center"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 text-xl font-bold mb-3">
        !
      </div>
      <h2 className="text-xl font-bold text-slate-900">Item Gagal Diproses</h2>
      <p className="mt-2 text-sm text-slate-600">
        Terjadi kendala saat memuat atau memproses item katalog (misalnya record telah dihapus).
      </p>
      <p className="mt-2 font-mono text-xs text-slate-500 bg-slate-100 p-2 rounded">
        Kode rujukan: {error.digest ?? "tidak ada"}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition"
        >
          Coba Lagi
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
