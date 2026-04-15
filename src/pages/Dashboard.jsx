import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function Dashboard({ session, setCurrentPage }) {
  const [summary, setSummary] = useState({ total: 0, income: 0, expense: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInputToday, setHasInputToday] = useState(true);
  const [comparison, setComparison] = useState({ diff: 0, status: 'hemat' });

  const user = session.user;
  const userName = user.user_metadata?.full_name || user.email.split('@')[0];
  const avatarUrlDummy = `https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff&rounded=true&bold=true`;
  const avatarUrl = user.user_metadata?.avatar_url || avatarUrlDummy;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const today = now.toISOString().split('T')[0];

    // 1. Cek input hari ini
    const { data: todayData } = await supabase
      .from('transaction')
      .select('id')
      .eq('date', today)
      .is('deleted_at', null)
      .limit(1);

    setHasInputToday(todayData && todayData.length > 0);

    // 2. Ambil Riwayat Terakhir
    const { data: transData, error } = await supabase
      .from('transaction')
      .select(`*, category (name, icon, color)`)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) console.error(error);
    else setTransactions(transData || []);

    // 3. Hitung Ringkasan & Perbandingan Bulan Lalu
    const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    const { data: allTrans } = await supabase
      .from('transaction')
      .select('amount, type, date')
      .is('deleted_at', null)
      .gte('date', firstLastMonth);

    const thisMonthTrans = allTrans?.filter(t => t.date >= firstDay);
    const lastMonthTrans = allTrans?.filter(t => t.date >= firstLastMonth && t.date <= endLastMonth);

    const income = thisMonthTrans?.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0) || 0;
    const expense = thisMonthTrans?.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0) || 0;

    const lastExpense = lastMonthTrans?.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0) || 0;

    if (lastExpense > 0) {
      const diffPercent = ((expense - lastExpense) / lastExpense) * 100;
      setComparison({
        diff: Math.abs(Math.round(diffPercent)),
        status: expense > lastExpense ? 'boros' : 'hemat'
      });
    }

    setSummary({ income, expense, total: income - expense });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-gray-50">
      {/* 1. Header & Profile */}
      <div className="bg-blue-600 px-6 pt-12 pb-10 rounded-b-[2.5rem] shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
                <img
                src={avatarUrl}
                alt="Profile"
                className="object-cover w-12 h-12 border-2 border-blue-400 rounded-full shadow-sm"
                // Kalau gambar error/ga muncul, ganti ke default UI-Avatars
                onError={(e) => {
                    e.target.src={avatarUrlDummy}
                }}
                referrerPolicy="no-referrer"
                />            <div>
              <p className="text-xs font-medium tracking-widest text-blue-100 uppercase">Halo, bosku! 👋</p>
              <h2 className="text-lg font-black tracking-tight capitalize truncate w-44">{userName}</h2>
            </div>
          </div>
          <button onClick={handleLogout} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-[10px] font-black uppercase backdrop-blur-sm">Logout</button>
        </div>
        <div className="relative z-10 py-2 text-center">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 opacity-80">Sisa Saldo Kamu</p>
          <h1 className="text-4xl font-black tracking-tighter">Rp {summary.total.toLocaleString('id-ID')}</h1>
        </div>
      </div>

      {/* 2. Menu Jalan Pintas */}
      <div className="relative z-20 px-5 -mt-6">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-5 grid grid-cols-5 gap-1 border border-white">
            {[
                { label: 'Keluar', icon: '💸', color: 'bg-red-50 text-red-500', page: 'input-pengeluaran' },
                { label: 'Masuk', icon: '🤑', color: 'bg-green-50 text-green-500', page: 'input-pemasukan' },
                { label: 'Riwayat', icon: '📜', color: 'bg-orange-50 text-orange-500', page: 'laporan' },
                { label: 'Analisis', icon: '📊', color: 'bg-purple-50 text-purple-500', page: 'statistik' },
                { label: 'Kategori', icon: '📂', color: 'bg-blue-50 text-blue-500', page: 'kategori' }
            ].map((item, idx) => (
            <button key={idx} onClick={() => setCurrentPage(item.page)} className="flex flex-col items-center gap-2 transition-all group active:scale-90">
              <div className={`w-11 h-11 ${item.color} rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:shadow-md transition-shadow`}>{item.icon}</div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- BANNER PENGINGAT & WAWASAN --- */}
      {!loading && (
        <div className="px-5 mt-6 space-y-4">
          {/* Banner Lupa Nyatet */}
          {!hasInputToday && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4 rounded-[2rem] shadow-xl shadow-orange-100 flex items-center justify-between border border-white/20 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 text-xl bg-white/20 rounded-2xl">📝</div>
                <div>
                  <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">Lupa nyatet?</p>
                  <p className="text-xs font-bold leading-tight text-white">Belum ada catatan hari ini.</p>
                </div>
              </div>
              <button onClick={() => setCurrentPage('input-pengeluaran')} className="bg-white text-orange-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md active:scale-95 transition-transform">Isi Sekarang</button>
            </div>
          )}

          {/* Card Wawasan Cuan */}
          <div className={`p-5 rounded-[2rem] border-2 border-dashed transition-all ${comparison.status === 'boros' ? 'border-red-100 bg-red-50/30' : 'border-green-100 bg-green-50/30'}`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{comparison.status === 'boros' ? '⚠️' : '🎉'}</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Wawasan Cuan</p>
                <p className="text-xs font-bold leading-relaxed text-gray-700">
                  {comparison.status === 'boros'
                    ? `Pengeluaranmu naik ${comparison.diff}% dibanding bulan lalu. Rem dikit ges! 🏎️`
                    : `Mantap! Kamu lebih hemat ${comparison.diff}% dari bulan lalu. Pertahankan! 🛡️`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Ringkasan In/Out Bulan Ini */}
      <div className="grid grid-cols-2 gap-4 px-5 mt-6">
        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Pemasukan</p>
          <p className="text-sm font-black text-green-600">+ Rp {summary.income.toLocaleString('id-ID')}</p>
        </div>
        <div className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Pengeluaran</p>
          <p className="text-sm font-black text-red-600">- Rp {summary.expense.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* 4. Daftar Transaksi Terakhir */}
      <div className="px-5 mt-8">
        <div className="flex items-end justify-between px-1 mb-4">
          <h3 className="text-lg font-black text-gray-800">Riwayat Cuan</h3>
          <button onClick={() => setCurrentPage('laporan')} className="text-xs font-black tracking-tighter text-blue-600 uppercase">Lihat Semua</button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-10 text-xs font-bold text-center text-gray-400 uppercase animate-pulse">Lagi ngitung duit...</div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center bg-white border-2 border-gray-100 border-dashed rounded-3xl">
              <p className="text-sm font-bold text-gray-400">Belum ada catatan nih, bos! 🍃</p>
            </div>
          ) : (
            transactions.map((t) => {
              const isToday = new Date(t.date).toDateString() === new Date().toDateString();
              return (
                <div key={t.id} className="flex items-center justify-between p-4 transition-all bg-white border shadow-sm rounded-3xl border-gray-50 active:scale-[0.98] group">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl shadow-inner rounded-2xl" style={{ backgroundColor: `${t.category?.color || '#cbd5e1'}15`, color: t.category?.color || '#64748b' }}>
                      {t.category?.icon || '❓'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="w-24 text-sm font-black text-gray-800 truncate sm:w-48">{t.note || t.category?.name || 'Tanpa Catatan'}</p>
                        {isToday && <span className="text-[7px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Baru</span>}
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border" style={{ backgroundColor: `${t.category?.color || '#64748b'}10`, borderColor: `${t.category?.color || '#64748b'}30`, color: t.category?.color || '#64748b' }}>
                        {t.category?.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-base ${t.type === 'pengeluaran' ? 'text-red-500' : 'text-green-500'}`}>{t.type === 'pengeluaran' ? '-' : '+'} {t.amount.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;