import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p role="status" className="text-sm font-medium text-slate-600 animate-pulse">
            Memuat halaman TaniKu...
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}