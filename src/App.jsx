import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kategori from './pages/Kategori';
import InputTransaksi from './pages/InputTransaksi';
import Laporan from './pages/Laporan';
import Statistik from './pages/Statistik';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { registerSW } from 'virtual:pwa-register';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Navigasi
  const [currentPage, setCurrentPage] = useState('dashboard');

  // State Kurir Data (Penting biar gak blank!)
  const [editData, setEditData] = useState(null);

  // Register PWA Service Worker
  registerSW({ immediate: true });
  useRegisterSW({
    onRegistered(r) { console.log('SW Registered: ' + r); },
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

  // ==== SISTEM NAVIGASI MULTIFUNGSI ====

  if (currentPage === 'kategori') {
    return <Kategori session={session} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'laporan') {
    return (
      <Laporan
        session={session}
        setCurrentPage={setCurrentPage}
        setEditData={setEditData} // Oper fungsi ini ke Laporan
      />
    );
  }

  if (currentPage === 'statistik') {
    return <Statistik session={session} setCurrentPage={setCurrentPage} />;
  }

  // Handle Input & Edit (Satu Pintu!)
  const isInputPage = ['input-pengeluaran', 'input-pemasukan', 'input-transaksi'].includes(currentPage);

  if (isInputPage) {
    return (
      <InputTransaksi
        session={session}
        setCurrentPage={setCurrentPage}
        // Tentukan tipe: kalau ada editData pake tipe data lama, kalau ngga pake currentPage
        type={editData ? editData.type : (currentPage === 'input-pemasukan' ? 'pemasukan' : 'pengeluaran')}
        editData={editData}
        setEditData={setEditData} // Buat reset kurir setelah simpan
      />
    );
  }

  // Default: Dashboard
  return <Dashboard session={session} setCurrentPage={setCurrentPage} />;
}

export default App;