import './globals.css';
import React from 'react';

export const metadata = {
  title: 'TaniKu — Hyper-Local Micro-Hub Platform',
  description: 'Rantai pasok pertanian terintegrasi dari petani ke konsumen langsung',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}