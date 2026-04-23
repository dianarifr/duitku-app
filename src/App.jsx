import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kategori from './pages/Kategori';
import InputTransaksi from './pages/InputTransaksi';
import Laporan from './pages/Laporan';
import Statistik from './pages/Statistik';
import BottomNav from './components/BottomNav'; // Shortcut baru kita
import { useRegisterSW } from 'virtual:pwa-register/react';
import { registerSW } from 'virtual:pwa-register';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editData, setEditData] = useState(null);

  // Register PWA Service Worker
  registerSW({ immediate: true });
  useRegisterSW({
    onRegistered(r) { console.log('SW Registered'); },
    onRegisterError(error) { console.log('SW registration error', error); },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xs font-black tracking-widest text-gray-400 uppercase bg-gray-50">
        Memuat Duit... 💸
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  // Cek apakah sedang di halaman input (termasuk trigger dari BottomNav)
  const isInputPage = ['input', 'input-pengeluaran', 'input-pemasukan', 'input-transaksi'].includes(currentPage);

  return (
    <div className="relative min-h-screen bg-gray-50">

      {/* AREA KONTEN UTAMA */}
      <main className="h-full max-w-md pb-10 mx-auto">
        {/* Render Dashboard */}
        {currentPage === 'dashboard' && (
          <Dashboard session={session} setCurrentPage={setCurrentPage} />
        )}

        {/* Render Kategori */}
        {currentPage === 'kategori' && (
          <Kategori session={session} setCurrentPage={setCurrentPage} />
        )}

        {/* Render Laporan */}
        {currentPage === 'laporan' && (
          <Laporan
            session={session}
            setCurrentPage={setCurrentPage}
            setEditData={setEditData}
          />
        )}

        {/* Render Statistik */}
        {currentPage === 'statistik' && (
          <Statistik session={session} setCurrentPage={setCurrentPage} />
        )}

        {/* Render Input & Edit */}
        {isInputPage && (
          <InputTransaksi
            session={session}
            setCurrentPage={setCurrentPage}
            type={editData ? editData.type : (currentPage === 'input-pemasukan' ? 'pemasukan' : 'pengeluaran')}
            editData={editData}
            setEditData={setEditData}
          />
        )}
      </main>

      {/* NAVIGASI MELAYANG (Floating Island) */}
      {/* Sembunyikan Nav saat di halaman input biar ga nutupin keyboard/form */}
      {!isInputPage && (
        <BottomNav
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Ornamen Background (Opsional buat kesan mewah) */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
    </div>
  );
}

export default App;