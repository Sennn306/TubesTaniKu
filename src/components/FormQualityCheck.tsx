"use client";

import { useActionState, useState } from "react";
import { tambahQualityCheck } from "@/app/katalog/ulasan-actions";
import type { StatusForm } from "@/lib/status-form";

const statusAwal: StatusForm = {};

export default function FormQualityCheck({ batchId }: { batchId: number }) {
  const aksiDenganId = tambahQualityCheck.bind(null, batchId);
  const [state, formAction, isPending] = useActionState(aksiDenganId, statusAwal);

  const [notes, setNotes] = useState("");
  // Nilai turunan (derived state): dihitung langsung pada saat render tanpa useState terpisah dan tanpa useEffect
  const sisa = 500 - notes.length;

  return (
    <form action={formAction} className="mt-8 rounded-lg border p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold text-slate-900">Tambah Catatan Inspeksi Mutu</h3>

      {state.pesan && (
        <p className="mt-2 text-sm text-green-600 font-medium">{state.pesan}</p>
      )}

      {/* Input Nama Pemeriksa */}
      <div className="mt-4">
        <label htmlFor="inspectorName" className="block text-sm font-medium text-slate-700">
          Nama Pemeriksa
        </label>
        <input
          type="text"
          id="inspectorName"
          name="inspectorName"
          required
          className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm text-slate-900"
        />
        {state.galat?.inspectorName && (
          <p className="text-xs text-red-600 mt-1">{state.galat.inspectorName[0]}</p>
        )}
      </div>

      {/* Input Skor Mutu */}
      <div className="mt-4">
        <label htmlFor="score" className="block text-sm font-medium text-slate-700">
          Skor Mutu (1 - 5)
        </label>
        <input
          type="number"
          id="score"
          name="score"
          min="1"
          max="5"
          defaultValue="5"
          required
          className="mt-1 block w-24 rounded border border-slate-300 p-2 text-sm text-slate-900"
        />
        {state.galat?.score && (
          <p className="text-xs text-red-600 mt-1">{state.galat.score[0]}</p>
        )}
      </div>

      {/* Input Catatan Inspeksi dengan Penghitung Sisa Karakter */}
      <div className="mt-4">
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
          Catatan Inspeksi
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          required
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full rounded border border-slate-300 p-2 text-sm text-slate-900"
        />
        <div className="mt-1 flex justify-between items-center text-xs text-slate-500">
          <span>Maksimal 500 karakter</span>
          <span className={sisa < 50 ? "text-amber-600 font-medium" : ""}>
            {sisa} karakter tersisa
          </span>
        </div>
        {state.galat?.notes && (
          <p className="text-xs text-red-600 mt-1">{state.galat.notes[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition"
      >
        {isPending ? "Menyimpan..." : "Kirim Hasil Inspeksi"}
      </button>
    </form>
  );
}
