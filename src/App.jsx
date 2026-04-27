import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kategori from './pages/Kategori';
import InputTransaksi from './pages/InputTransaksi';
import Laporan from './pages/Laporan';
import Statistik from './pages/Statistik';
import BottomNav from './components/BottomNav';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { registerSW } from 'virtual:pwa-register';
import { AlertProvider } from './context/AlertContext'; // Kantor Pusat Alert

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editData, setEditData] = useState(null);
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');

  // Register PWA Service Worker
  registerSW({ immediate: true });
  useRegisterSW({
    onRegistered(r) { console.log('SW Registered'); },
    onRegisterError(error) { console.log('SW registration error', error); },
  });

  useEffect(() => {
    // --- 1. LOGIKA AUTH (Supabase) ---
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // --- 2. LOGIKA NAVIGASI (Fix Back Gesture) ---
    const handlePopState = (event) => {
      // Jika ada state halaman di history, pindah ke halaman tersebut
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      } else {
        // Jika balik ke paling awal, default ke dashboard
        setCurrentPage('dashboard');
      }
    };

    // Pasang listener tombol back/gesture
    window.addEventListener('popstate', handlePopState);

    // Inisialisasi history awal jika baru buka aplikasi
    if (!window.history.state) {
      window.history.replaceState({ page: 'dashboard' }, '', '');
    }

    // --- 3. CLEANUP (Bersih-bersih saat komponen unmount) ---
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // --- 4. FUNGSI NAVIGASI BARU (Gunakan ini untuk ganti halaman) ---
  const navigateTo = (page) => {
    setCurrentPage(page);
    // Simpan halaman baru ke dalam history browser
    window.history.pushState({ page }, '', '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xs font-black tracking-widest text-gray-400 uppercase bg-gray-50">
        Memuat Duit... 💸
      </div>
    );
  }

  // Bungkus seluruh aplikasi dengan AlertProvider
  return (
    <AlertProvider>
      {!session ? (
        <Login />
      ) : (
        <div className="relative min-h-screen bg-gray-50">
          {/* AREA KONTEN UTAMA */}
          <main className="h-full max-w-md pb-10 mx-auto">
            {/* Navigasi Halaman */}
            {currentPage === 'dashboard' && (
              <Dashboard
                session={session}
                setCurrentPage={navigateTo}
                setEditData={setEditData}
                onCategoryDeepDive={(catId) => { setTempCategoryFilter(catId); setCurrentPage('laporan'); }}
              />
            )}

            {currentPage === 'kategori' && (
              <Kategori session={session} setCurrentPage={navigateTo} />
            )}

            {currentPage === 'laporan' && (
              <Laporan
                session={session}
                setCurrentPage={navigateTo}
                setEditData={setEditData}
                tempCategoryFilter={tempCategoryFilter}
                setTempCategoryFilter={setTempCategoryFilter}
              />
            )}

            {currentPage === 'statistik' && (
              <Statistik session={session} setCurrentPage={navigateTo} />
            )}

            {['input', 'input-pengeluaran', 'input-pemasukan', 'input-transaksi'].includes(currentPage) && (
              <InputTransaksi
                session={session}
                setCurrentPage={navigateTo}
                type={editData ? editData.type : (currentPage === 'input-pemasukan' ? 'pemasukan' : 'pengeluaran')}
                editData={editData}
                setEditData={setEditData}
              />
            )}
          </main>

          {/* NAVIGASI MELAYANG */}
          {!['input', 'input-pengeluaran', 'input-pemasukan', 'input-transaksi'].includes(currentPage) && (
            <BottomNav
              currentPage={currentPage}
              setCurrentPage={navigateTo}
            />
          )}

          {/* Ornamen Background */}
          <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
        </div>
      )}
    </AlertProvider>
  );
}

export default App;