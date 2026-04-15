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

  // State baru untuk ngatur halaman aktif
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Register service worker untuk handle offline & update
  registerSW({ immediate: true });

  // Panggil ini biar PWA-nya aktif nge-cache
  useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  // ==== SISTEM NAVIGASI SIMPLE ====
  if (currentPage === 'kategori') {
    return <Kategori session={session} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'laporan') {
    return <Laporan session={session} setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'statistik') {
    return <Statistik session={session} setCurrentPage={setCurrentPage} />;
  }

  // Di dalam switch atau conditional rendering App.jsx
  if (currentPage === 'input-pengeluaran' || currentPage === 'input-pemasukan') {
    return (
      <InputTransaksi
        session={session}
        setCurrentPage={setCurrentPage}
        type={currentPage === 'input-pemasukan' ? 'pemasukan' : 'pengeluaran'}
      />
    );
  }


  // Default-nya ke Dashboard
  return <Dashboard session={session} setCurrentPage={setCurrentPage} />;
}

export default App;