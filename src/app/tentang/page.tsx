import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tentang TaniKu | Hyper-Local Micro-Hub Platform",
  description: "Platform rantai pasok pertanian terintegrasi untuk menghubungkan petani langsung ke konsumen melalui verifikasi mutu berbasis kriptografi.",
};

export default function HalamanTentang() {
  return (
    <main id="konten" className="mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tentang TaniKu
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Hyper-Local Micro-Hub Platform untuk Rantai Pasok Pertanian Adil dan Transparan.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Masalah & Solusi</h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            Rantai pasok pertanian tradisional yang terfragmentasi sering kali merugikan petani akibat dominasi tengkulak dan pemotongan harga yang tinggi. Di sisi lain, konsumen kesulitan mendapatkan kepastian kualitas dan asal-usul panen yang segar.
          </p>
          <p className="mt-3 leading-relaxed text-gray-700">
            <strong>TaniKu</strong> hadir memotong jalur distribusi panjang melalui jaringan <strong>Micro-Hub Desa</strong>. Kami memadukan pencatatan mutu langsung di titik kumpul oleh Agen QC serta teknologi kriptografi <strong>Ed25519</strong> untuk memastikan keabsahan mutu hasil panen tidak dapat dimanipulasi.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Sasaran Pengguna</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
              <li><strong>Petani & Agen QC Desa:</strong> Mendaftarkan hasil panen dan memverifikasi grade mutu secara langsung.</li>
              <li><strong>Konsumen & Pelaku Bisnis:</strong> Membeli komoditas pertanian terverifikasi dengan lacak riwayat panen transparan.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Fitur Utama Platform</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
              <li>Katalog Hasil Panen Terverifikasi.</li>
              <li>Portal Entry Form Agen QC.</li>
              <li>Detail & Lacak Batch Panen Kriptografis.</li>
            </ul>
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    </main>
  );
}