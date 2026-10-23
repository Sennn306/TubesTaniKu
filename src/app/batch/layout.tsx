import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detail Batch Panen | TaniKu',
  description: 'Informasi rincian batch panen, riwayat titik kumpul, dan status verifikasi keaslian mutu produk TaniKu.',
};

export default function BatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section aria-label="Segmen Detail Batch Panen" className="w-full">
      {children}
    </section>
  );
}