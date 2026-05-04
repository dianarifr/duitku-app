import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kategori from './pages/Kategori';
import InputTransaksi from './pages/InputTransaksi';
import InputMutasi from './pages/InputMutasi';
import Laporan from './pages/Laporan';
import Statistik from './pages/Statistik';
import BottomNav from './components/BottomNav';
import ActionHub from './components/ActionHub';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { registerSW } from 'virtual:pwa-register';
import { AlertProvider } from './context/AlertContext';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editData, setEditData] = useState(null);
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');

  // State untuk kontrol Menu Hub (Pilihan Masuk/Keluar/Mutasi)
  const [showActionMenu, setShowActionMenu] = useState(false);

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
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
      } else {
        setCurrentPage('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);

    if (!window.history.state) {
      window.history.replaceState({ page: 'dashboard' }, '', '');
    }

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // --- 3. FUNGSI NAVIGASI ---
  const navigateTo = (page) => {
    setCurrentPage(page);
    window.history.pushState({ page }, '', '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xs font-black tracking-widest text-gray-400 uppercase bg-gray-50">
        Memuat Duit... 💸
      </div>
    );
  }

  // Tentukan apakah halaman saat ini adalah form input (untuk menyembunyikan Navigasi Bawah)
  const isInputPage = ['input', 'input-pengeluaran', 'input-pemasukan', 'input-transaksi', 'input-mutasi'].includes(currentPage);

  return (
    <AlertProvider>
      {!session ? (
        <Login />
      ) : (
        <div className="relative min-h-screen bg-gray-50">

          {/* AREA KONTEN UTAMA */}
          <main className="h-full max-w-md pb-10 mx-auto">

            {currentPage === 'dashboard' && (
              <Dashboard
                session={session}
                setCurrentPage={navigateTo}
                setEditData={setEditData}
                onOpenActionMenu={() => setShowActionMenu(true)} // Biar tombol orange bisa buka ActionHub
                onCategoryDeepDive={(catId) => { setTempCategoryFilter(catId); setCurrentPage('laporan'); }}
              />
            )}

            {currentPage === 'input-mutasi' && (
              <InputMutasi
                session={session}
                setCurrentPage={navigateTo}
                editData={editData}
                setEditData={setEditData}
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

          {/* 4. ACTION HUB (Overlay Pilihan Transaksi) */}
          <ActionHub
            show={showActionMenu}
            onClose={() => setShowActionMenu(false)}
            onSelect={(page) => {
              navigateTo(page);
              setShowActionMenu(false);
            }}
          />

          {/* 5. NAVIGASI MELAYANG */}
          {!isInputPage && (
            <BottomNav
              currentPage={currentPage}
              setCurrentPage={navigateTo}
              onActionClick={() => setShowActionMenu(true)}
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