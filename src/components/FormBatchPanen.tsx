"use client";

import { useActionState } from "react";
import { simpanBatchPanen } from "@/app/katalog/actions";
import type { StatusForm } from "@/lib/status-form";

const awal: StatusForm = {};
const kelasKolom = "mt-1 block w-full rounded border px-3 py-2";

export default function FormBatchPanen() {
  const [status, aksi, pending] = useActionState(simpanBatchPanen, awal);
  const g = status.galat;
  const n = status.nilai;

  return (
    <form action={aksi} className="mt-6 space-y-4">
      <div>
        <label htmlFor="farmerName" className="font-medium">
          Nama Petani
        </label>
        <input
          id="farmerName"
          name="farmerName"
          required
          minLength={3}
          maxLength={80}
          defaultValue={n?.farmerName}
          className={kelasKolom}
          aria-invalid={!!g?.farmerName}
          aria-describedby="galat-farmerName"
        />
        <p id="galat-farmerName" className="text-sm text-red-700">
          {g?.farmerName?.[0]}
        </p>
      </div>

      <div>
        <label htmlFor="commodityName" className="font-medium">
          Komoditas
        </label>
        <select
          id="commodityName"
          name="commodityName"
          required
          key={n?.commodityName ?? "awal"}
          defaultValue={n?.commodityName ?? ""}
          className={kelasKolom}
          aria-invalid={!!g?.commodityName}
          aria-describedby="galat-commodityName"
        >
          <option value="" disabled>
            Pilih jenis komoditas
          </option>
          <option value="Cabai Merah">Cabai Merah</option>
          <option value="Beras Organik">Beras Organik</option>
          <option value="Tomat">Tomat</option>
        </select>
        <p id="galat-commodityName" className="text-sm text-red-700">
          {g?.commodityName?.[0]}
        </p>
      </div>

      <div>
        <label htmlFor="weightKg" className="font-medium">
          Berat Panen (kg)
        </label>
        <input
          id="weightKg"
          name="weightKg"
          type="number"
          step="0.1"
          required
          min={0.1}
          max={10000}
          defaultValue={n?.weightKg}
          className={kelasKolom}
          aria-invalid={!!g?.weightKg}
          aria-describedby="galat-weightKg"
        />
        <p id="galat-weightKg" className="text-sm text-red-700">
          {g?.weightKg?.[0]}
        </p>
      </div>

<div>
  <label htmlFor="grade" className="font-medium">
    Grade Mutu
  </label>
  <select
    id="grade"
    name="grade"
    required
    key={n?.grade ?? "awal"}
    defaultValue={n?.grade ?? ""}
    className={kelasKolom}
    aria-invalid={!!g?.grade}
    aria-describedby="galat-grade"
  >
    <option value="" disabled>
      Pilih grade
    </option>
    <option value="GRADE_A">Grade A</option>
    <option value="GRADE_B">Grade B</option>
  </select>
  <p id="galat-grade" className="text-sm text-red-700">
    {g?.grade?.[0]}
  </p>
</div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isOrganic" defaultChecked />
        Produk Organik
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Batch Panen"}
      </button>

      <p role="status" aria-live="polite">
        {status.pesan}
      </p>
    </form>
  );
}