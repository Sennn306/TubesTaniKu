"use client";

import { useActionState } from "react";
import { tambahQualityCheck } from "@/app/katalog/ulasan-actions";
import type { StatusForm } from "@/lib/status-form";

const statusAwal: StatusForm = {};

export default function FormQualityCheck({ batchId }: { batchId: number }) {
  const aksiDenganId = tambahQualityCheck.bind(null, batchId);
  const [state, formAction, isPending] = useActionState(aksiDenganId, statusAwal);

  return (
    <form action={formAction} className="mt-8 rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Tambah Catatan Inspeksi Mutu</h3>

      {state.pesan && (
        <p className="mt-2 text-sm text-green-600 font-medium">{state.pesan}</p>
      )}

      {/* Input Nama Pemeriksa */}
      <div className="mt-4">
        <label htmlFor="inspectorName" className="block text-sm font-medium">
          Nama Pemeriksa
        </label>
        <input
          type="text"
          id="inspectorName"
          name="inspectorName"
          required
          className="mt-1 block w-full rounded border p-2 text-sm"
        />
        {state.galat?.inspectorName && (
          <p className="text-xs text-red-600">{state.galat.inspectorName[0]}</p>
        )}
      </div>

      {/* Input Skor Mutu */}
      <div className="mt-4">
        <label htmlFor="score" className="block text-sm font-medium">
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
          className="mt-1 block w-full rounded border p-2 text-sm"
        />
        {state.galat?.score && (
          <p className="text-xs text-red-600">{state.galat.score[0]}</p>
        )}
      </div>

      {/* Input Catatan Inspeksi */}
      <div className="mt-4">
        <label htmlFor="notes" className="block text-sm font-medium">
          Catatan Inspeksi
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          required
          className="mt-1 block w-full rounded border p-2 text-sm"
        />
        {state.galat?.notes && (
          <p className="text-xs text-red-600">{state.galat.notes[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {isPending ? "Menyimpan..." : "Kirim Hasil Inspeksi"}
      </button>
    </form>
  );
}