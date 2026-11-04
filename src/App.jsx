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

const INPUT_PAGES = ['input', 'input-pengeluaran', 'input-pemasukan', 'input-transaksi', 'input-mutasi'];

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editData, setEditData] = useState(null);
  const [tempCategoryFilter, setTempCategoryFilter] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState(false);

  registerSW({ immediate: true });
  useRegisterSW({
    onRegistered() { console.log('SW Registered'); },
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

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.history.pushState({ page }, '', '');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        Memuat data...
      </div>
    );
  }

  const isInputPage = INPUT_PAGES.includes(currentPage);

  return (
    <AlertProvider>
      {!session ? (
        <Login />
      ) : (
        <div className="relative min-h-screen bg-paper text-ink">
          <main className="mx-auto h-full max-w-md pb-28">
            {currentPage === 'dashboard' && (
              <Dashboard
                session={session}
                setCurrentPage={navigateTo}
                onOpenActionMenu={() => setShowActionMenu(true)}
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

            {INPUT_PAGES.includes(currentPage) && currentPage !== 'input-mutasi' && (
              <InputTransaksi
                session={session}
                setCurrentPage={navigateTo}
                type={editData ? editData.type : (currentPage === 'input-pemasukan' ? 'pemasukan' : 'pengeluaran')}
                editData={editData}
                setEditData={setEditData}
              />
            )}
          </main>

          <ActionHub
            show={showActionMenu}
            onClose={() => setShowActionMenu(false)}
            onSelect={(page) => {
              navigateTo(page);
              setShowActionMenu(false);
            }}
          />

          {!isInputPage && (
            <BottomNav
              currentPage={currentPage}
              setCurrentPage={navigateTo}
              onActionClick={() => setShowActionMenu(true)}
            />
          )}
        </div>
      )}
    </AlertProvider>
  );
}

export default App;
