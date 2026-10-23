import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Agen QC | TaniKu',
  description: 'Panel pencatatan dan verifikasi kualitas hasil panen oleh Agen QC Desa.',
};

export default function QCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Panel Kontrol Agen QC Desa
          </h2>
        </div>
      </header>
      {children}
    </div>
  );
}