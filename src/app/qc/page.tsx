'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';

export default function QCPage() {
  const [farmerName, setFarmerName] = useState('');
  const [commodityName, setCommodityName] = useState('Cabai Merah Keriting');
  const [weightKg, setWeightKg] = useState('');
  const [grade, setGrade] = useState<'GRADE_A' | 'GRADE_B'>('GRADE_A');

  const [errors, setErrors] = useState<{ farmerName?: string; weightKg?: string }>({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { farmerName?: string; weightKg?: string } = {};

    if (!farmerName.trim()) {
      newErrors.farmerName = 'Nama petani wajib diisi.';
    }
    if (!weightKg || parseFloat(weightKg) <= 0) {
      newErrors.weightKg = 'Berat panen harus berupa angka lebih dari 0 kg.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMsg('');
      return;
    }

    setErrors({});
    setSuccessMsg(`Berhasil menambahkan batch panen ${commodityName} (${weightKg} kg) dari ${farmerName}.`);
    setFarmerName('');
    setWeightKg('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Portal Agen QC — Entry Batch Panen</h1>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5" noValidate>
          <div>
            <label htmlFor="farmerName" className="block text-sm font-semibold text-slate-700 mb-1">
              Nama Petani
            </label>
            <input
              id="farmerName"
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: Pak Joko"
            />
            {errors.farmerName && <p className="text-xs text-red-600 mt-1">{errors.farmerName}</p>}
          </div>

          <div>
            <label htmlFor="commodityName" className="block text-sm font-semibold text-slate-700 mb-1">
              Komoditas
            </label>
            <select
              id="commodityName"
              value={commodityName}
              onChange={(e) => setCommodityName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Cabai Merah Keriting">Cabai Merah Keriting</option>
              <option value="Tomat Merah Super">Tomat Merah Super</option>
              <option value="Bawang Merah">Bawang Merah</option>
            </select>
          </div>

          <div>
            <label htmlFor="weightKg" className="block text-sm font-semibold text-slate-700 mb-1">
              Berat Hasil QC (kg)
            </label>
            <input
              id="weightKg"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Contoh: 15"
            />
            {errors.weightKg && <p className="text-xs text-red-600 mt-1">{errors.weightKg}</p>}
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-semibold text-slate-700 mb-1">
              Hasil Grading QC
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value as 'GRADE_A' | 'GRADE_B')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="GRADE_A">Grade A (Super / Retail)</option>
              <option value="GRADE_B">Grade B (Standar / Olahan)</option>
            </select>
          </div>

          <Button type="submit">Verifikasi & Tambahkan Batch</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}