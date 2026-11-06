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
  return <>{children}</>;
}
