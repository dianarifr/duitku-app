import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange } from '../utils/formatters';

function Dashboard({ session, setCurrentPage }) {
  const [summary, setSummary] = useState({ total: 0, income: 0, expense: 0 });
  const [wallet, setWallet] = useState({ dompet: 0, bank: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInputToday, setHasInputToday] = useState(true);
  const [comparison, setComparison] = useState({ diff: 0, status: 'hemat' });
  const [criticalBudgets, setCriticalBudgets] = useState([]);
  const [pendingRecurring, setPendingRecurring] = useState([]);
  // State untuk kontrol Modal Pop-up
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [userPayday, setUserPayday] = useState(1)
  const [periodLabel, setPeriodLabel] = useState('');

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
    const today = now.toISOString().split('T')[0];
    const todayDateNumber = now.getDate();

    // 1. Ambil Payday User dari Profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('payday')
      .eq('id', session.user.id)
      .single();

    const payday = profile?.payday || 1;
    setUserPayday(payday); // Simpan ke state untuk dipake fungsi lain

    // 2. Dapatkan Range Finansial (Bulan Ini & Bulan Lalu)
    const currentRange = getFinancialRange(payday);

    // Hitung range bulan lalu: sehari sebelum awal periode ini
    const lastMonthDate = new Date(currentRange.start);
    lastMonthDate.setDate(lastMonthDate.getDate() - 1);
    const lastRange = getFinancialRange(payday, lastMonthDate);

    // Penanda periode (YYYY-MM) berdasarkan awal siklus gajian
    const currentMonthYear = currentRange.start.substring(0, 7);

    // Set label periode untuk ditampilkan di UI
    const options = { day: 'numeric', month: 'short' };
    const startLabel = new Date(currentRange.start).toLocaleDateString('id-ID', options);
    const endLabel = new Date(currentRange.end).toLocaleDateString('id-ID', options);
    setPeriodLabel(`${startLabel} - ${endLabel}`);

    // 3. Cek input hari ini
    const { data: todayData } = await supabase
      .from('transaction')
      .select('id')
      .eq('date', today)
      .is('deleted_at', null)
      .limit(1);

    setHasInputToday(todayData && todayData.length > 0);

    // 4. Ambil Riwayat Terakhir (Global)
    const { data: transData } = await supabase
      .from('transaction')
      .select(`*, category (name, icon, color)`)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    setTransactions(transData || []);

    // 5. Ambil data transaksi dalam range finansial (Siklus Ini + Siklus Lalu)
    const { data: allTrans } = await supabase
      .from('transaction')
      .select('amount, type, date, payment_method, category_id')
      .is('deleted_at', null)
      .gte('date', lastRange.start)
      .lte('date', currentRange.end);

    const thisMonthTrans = allTrans?.filter(t => t.date >= currentRange.start && t.date <= currentRange.end) || [];
    const lastMonthTrans = allTrans?.filter(t => t.date >= lastRange.start && t.date <= lastRange.end) || [];

    let cashIn = 0, cashOut = 0, bankIn = 0, bankOut = 0, totalIncome = 0, totalExpense = 0;

    thisMonthTrans.forEach(t => {
      const amt = t.amount;
      if (t.type === 'pemasukan') {
        totalIncome += amt;
        t.payment_method === 'transfer' ? bankIn += amt : cashIn += amt;
      } else {
        totalExpense += amt;
        t.payment_method === 'transfer' ? bankOut += amt : cashOut += amt;
      }
    });

    // 6. Pantauan Budget (Filter tgl gajian)
    const { data: categoriesWithBudget } = await supabase
      .from('category')
      .select('id, name, icon, budget')
      .gt('budget', 0)
      .is('deleted_at', null);

    if (categoriesWithBudget) {
      const filtered = categoriesWithBudget.map(cat => {
        const used = thisMonthTrans
          .filter(t => t.category_id === cat.id && t.type === 'pengeluaran')
          .reduce((sum, t) => sum + t.amount, 0);
        const percent = (used / cat.budget) * 100;
        return { id: cat.id, amount: cat.budget, used, percent, category: { name: cat.name, icon: cat.icon } };
      }).filter(b => b.percent > 70);
      setCriticalBudgets(filtered);
    }

    // 7. Recurring Catch-up
    const { data: recurringList } = await supabase
      .from('recurring_transactions')
      .select('*, category(name, icon)')
      .eq('is_active', true);

    if (recurringList) {
      const pending = recurringList.filter(rec => {
        const hasProcessed = rec.last_processed_at === currentMonthYear;
        const isDueDate = todayDateNumber >= rec.billing_date;
        return !hasProcessed && isDueDate;
      });
      setPendingRecurring(pending);
      if (pending.length > 0) setShowRecurringModal(true);
    }

    // Perbandingan Siklus
    const lastExpense = lastMonthTrans?.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0) || 0;
    if (lastExpense > 0) {
      const diffPercent = ((totalExpense - lastExpense) / lastExpense) * 100;
      setComparison({
        diff: Math.abs(Math.round(diffPercent)),
        status: totalExpense > lastExpense ? 'boros' : 'hemat'
      });
    }

    setSummary({ income: totalIncome, expense: totalExpense, total: totalIncome - totalExpense });
    setWallet({ dompet: cashIn - cashOut, bank: bankIn - bankOut });
    setLoading(false);
  };

  const handlePayRecurring = async (rec) => {
    const now = new Date();

    // Tentukan periode berdasarkan state userPayday
    const { start } = getFinancialRange(userPayday);
    const currentMonthYear = start.substring(0, 7);

    const { error } = await supabase.from('transaction').insert([{
      user_id: session.user.id,
      amount: rec.amount,
      category_id: rec.category_id,
      note: `[Rutin] ${rec.note}`,
      date: now.toISOString().split('T')[0],
      type: 'pengeluaran',
      payment_method: rec.payment_method
    }]);

    if (!error) {
      await supabase.from('recurring_transactions')
        .update({ last_processed_at: currentMonthYear })
        .eq('id', rec.id);
      fetchDashboardData();
    }
  };

  const handleSkipRecurring = async (rec) => {
    // Tentukan periode berdasarkan state userPayday
    const { start } = getFinancialRange(userPayday);
    const currentMonthYear = start.substring(0, 7);

    const { error } = await supabase.from('recurring_transactions')
      .update({ last_processed_at: currentMonthYear })
      .eq('id', rec.id);

    if (!error) fetchDashboardData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen pb-32 font-sans bg-gray-50">
      {/* Header & Profile */}
      <div className="bg-blue-600 px-6 pt-12 pb-14 rounded-b-[3rem] shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={avatarUrl} alt="Profile" className="object-cover w-12 h-12 border-2 border-blue-400 rounded-full shadow-sm" onError={(e) => { e.target.src = avatarUrlDummy }} referrerPolicy="no-referrer" />
            <div>
              <p className="text-xs font-medium tracking-widest text-blue-100 uppercase">Halo, bosku! 👋</p>
              <h2 className="text-lg font-black tracking-tight capitalize truncate w-44">{userName}</h2>
            </div>
          </div>
          <button onClick={handleLogout} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-[10px] font-black uppercase backdrop-blur-sm">Logout</button>
        </div>
        <div className="relative z-10 py-2 text-center">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 opacity-80">Saldo Keseluruhan</p>
          <h1 className="text-4xl font-black tracking-tighter">Rp {summary.total.toLocaleString('id-ID')}</h1>
        </div>
        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest text-center mt-2">
          Periode: {periodLabel}
        </p>
      </div>

      {/* RINGKASAN DOMPET VS BANK */}
      <div className="relative z-30 grid grid-cols-2 gap-4 px-5 -mt-8">
        <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-orange-900/5 border border-orange-50 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-6 h-6 text-xs bg-orange-100 rounded-lg">💵</span>
            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Sisa Dompet</span>
          </div>
          <p className="text-sm font-black text-gray-800">Rp {wallet.dompet.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-4 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-50 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-6 h-6 text-xs bg-blue-100 rounded-lg">📱</span>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Saldo Bank</span>
          </div>
          <p className="text-sm font-black text-gray-800">Rp {wallet.bank.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* PANTAUAN BUDGET KRITIS */}
      {!loading && criticalBudgets.length > 0 && (
        <div className="px-5 mt-6 duration-500 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">Limit Budget ⚠️</h3>
          </div>
          <div className="space-y-3">
            {criticalBudgets.map((b) => (
              <div key={b.id} className="p-4 bg-white border shadow-sm border-red-50 rounded-3xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{b.category?.icon}</span>
                    <span className="text-[10px] font-black text-gray-700 uppercase">{b.category?.name}</span>
                  </div>
                  <span className={`text-[10px] font-black ${b.percent >= 100 ? 'text-red-600' : 'text-orange-600'}`}>
                    {Math.round(b.percent)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${b.percent >= 100 ? 'bg-red-600' : 'bg-orange-500'}`} style={{ width: `${Math.min(b.percent, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                    <p className="text-[9px] font-bold text-gray-400">{b.percent >= 100 ? 'Habis bos! 😱' : `Sisa Rp ${(b.amount - b.used).toLocaleString('id-ID')}`}</p>
                    <p className="text-[9px] font-bold text-gray-200 uppercase">Limit: Rp {b.amount.toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BANNER & WAWASAN */}
      {!loading && (
        <div className="px-5 space-y-4 mt-7">
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

          {comparison.diff > 0 && (
            <div className={`p-5 rounded-[2rem] border-2 border-dashed transition-all ${comparison.status === 'boros' ? 'border-red-100 bg-red-50/30' : 'border-green-100 bg-green-50/30'}`}>
              <div className="flex items-center gap-3 text-2xl">{comparison.status === 'boros' ? '⚠️' : '🎉'}</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Wawasan Cuan</p>
                <p className="text-xs font-bold leading-relaxed text-gray-700">{comparison.status === 'boros' ? `Pengeluaranmu naik ${comparison.diff}% dibanding bulan lalu. Rem dikit ges! 🏎️` : `Mantap! Kamu lebih hemat ${comparison.diff}% dari bulan lalu. Pertahankan! 🛡️`}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ringkasan In/Out */}
      <div className="grid grid-cols-2 gap-4 px-5 mt-2">
        <div className="p-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Masuk</p>
          <p className="text-sm font-black text-green-600">+ Rp {summary.income.toLocaleString('id-ID')}</p>
        </div>
        <div className="p-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Keluar</p>
          <p className="text-sm font-black text-red-600">- Rp {summary.expense.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Daftar Transaksi */}
      <div className="px-5 mt-8">
        <div className="flex items-end justify-between px-1 mb-4">
          <h3 className="text-lg font-black text-gray-800">Riwayat Cuan</h3>
          <button onClick={() => setCurrentPage('laporan')} className="text-xs font-black tracking-tighter text-blue-600 uppercase">Lihat Semua</button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="py-10 text-xs font-bold text-center text-gray-400 uppercase animate-pulse">Lagi ngitung duit 🙏</div>
          ) : transactions.length === 0 ? (
            <div className="py-10 text-center bg-white border-2 border-gray-100 border-dashed rounded-3xl"><p className="text-sm font-bold text-gray-400">Belum ada catatan nih, bos! 🍃</p></div>
          ) : (
            transactions.map((t) => {
              const isToday = new Date(t.date).toDateString() === new Date().toDateString();
              return (
                <div key={t.id} className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-3xl border-gray-50 active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl shadow-inner rounded-2xl" style={{ backgroundColor: `${t.category?.color || '#cbd5e1'}15`, color: t.category?.color || '#64748b' }}>{t.category?.icon || '❓'}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="w-24 text-sm font-black text-gray-800 truncate sm:w-48">{t.note || t.category?.name || 'Tanpa Catatan'}</p>
                        {isToday && <span className="text-[7px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Baru</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border" style={{ backgroundColor: `${t.category?.color || '#64748b'}10`, borderColor: `${t.category?.color || '#64748b'}30`, color: t.category?.color || '#64748b' }}>{t.category?.name}</span>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">{t.payment_method === 'transfer' ? '📱 Transfer' : '💵 Cash'}</span>
                      </div>
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

      {/* MODAL POP-UP RECURRING */}
      {showRecurringModal && pendingRecurring.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-4xl rounded-full shadow-inner bg-blue-50">🔔</div>
              <h2 className="text-xl font-black tracking-tight text-gray-800">Ada Tagihan Rutin!</h2>
              <p className="mt-2 text-xs font-bold text-gray-400">Jangan sampai kelupaan nyatet ya bosku.</p>
            </div>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto px-1 mb-8 custom-scrollbar">
              {pendingRecurring.map((rec) => (
                <div key={rec.id} className="p-4 border border-gray-100 bg-gray-50 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-3 text-left">
                      <span className="text-2xl">{rec.category?.icon}</span>
                      <div>
                        <p className="text-[10px] font-black text-gray-800 uppercase leading-none mb-1">{rec.note}</p>
                        <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Jatuh Tempo: Tgl {rec.billing_date}</p>
                      </div>
                    </div>
                    <p className="font-black text-gray-800">Rp {rec.amount.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePayRecurring(rec)} className="flex-1 py-3 bg-blue-600 text-white text-[9px] font-black uppercase rounded-xl shadow-lg shadow-blue-100 active:scale-95 transition-all">✅ Sudah Bayar</button>
                    <button onClick={() => handleSkipRecurring(rec)} className="flex-1 py-3 bg-white text-gray-400 border border-gray-200 text-[9px] font-black uppercase rounded-xl active:scale-95 transition-all">⏭️ Skip</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowRecurringModal(false)} className="w-full py-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-gray-500 transition-colors">Nanti Saja</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;