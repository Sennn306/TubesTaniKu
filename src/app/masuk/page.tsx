import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormMasuk from "@/components/FormMasuk";

export const metadata: Metadata = {
  title: "Masuk | TubesTaniKu",
};

export default function HalamanMasuk() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main id="konten" className="flex-1 mx-auto max-w-md w-full p-4 py-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Masuk ke TaniKu</h1>
          <p className="text-sm text-slate-500 mb-6">Gunakan akun pengelola atau agen QC desa Anda.</p>
          <FormMasuk />
        </div>
      </main>
      <Footer />
    </div>
  );
}
