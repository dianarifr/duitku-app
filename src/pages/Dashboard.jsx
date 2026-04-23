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
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [userPayday, setUserPayday] = useState(1);
  const [periodLabel, setPeriodLabel] = useState('');

  // STATE AI
  const [aiAdvice, setAiAdvice] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const user = session.user;
  const userName = user.user_metadata?.full_name || user.email.split('@')[0];
  const avatarUrlDummy = `https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff&rounded=true&bold=true`;
  const avatarUrl = user.user_metadata?.avatar_url || avatarUrlDummy;

  // FUNGSI AMBIL OMELAN AI
  const getAiCoachAdvice = async (budgets) => {
    try {
      setIsAiLoading(true);
      const response = await fetch('https://duitku.freepalestine.my.id/api/gemini-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ budgets })
      });

      const data = await response.json();
      setAiAdvice(data.advice);

      // Simpan ke cache (PENTING: Gunakan hash yang sama dengan useEffect)
      const hash = JSON.stringify(budgets.map(b => ({ id: b.id, p: Math.round(b.percent) })));
      localStorage.setItem('ai_advice_cache', data.advice);
      localStorage.setItem('ai_budget_hash', hash);
    } catch (error) {
      console.error("AI Coach pundung:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // MONITORING BUDGET KRITIS UNTUK AI
  useEffect(() => {
    if (!loading && criticalBudgets.length > 0) {
      const cachedAdvice = localStorage.getItem('ai_advice_cache');
      const cachedHash = localStorage.getItem('ai_budget_hash');

      // Buat sidik jari data sekarang
      const currentHash = JSON.stringify(criticalBudgets.map(b => ({ id: b.id, p: Math.round(b.percent) })));

      if (currentHash !== cachedHash) {
        getAiCoachAdvice(criticalBudgets);
      } else if (cachedAdvice) {
        setAiAdvice(cachedAdvice);
      }
    }
  }, [criticalBudgets, loading]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayDateNumber = now.getDate();

    const { data: profile } = await supabase
      .from('profiles')
      .select('payday')
      .eq('id', session.user.id)
      .single();

    const payday = profile?.payday || 1;
    setUserPayday(payday);

    const currentRange = getFinancialRange(payday);
    const lastMonthDate = new Date(currentRange.start);
    lastMonthDate.setDate(lastMonthDate.getDate() - 1);
    const lastRange = getFinancialRange(payday, lastMonthDate);

    const currentMonthYear = currentRange.start.substring(0, 7);

    const options = { day: 'numeric', month: 'short' };
    const startLabel = new Date(currentRange.start).toLocaleDateString('id-ID', options);
    const endLabel = new Date(currentRange.end).toLocaleDateString('id-ID', options);
    setPeriodLabel(`${startLabel} - ${endLabel}`);

    const { data: todayData } = await supabase
      .from('transaction')
      .select('id')
      .eq('date', today)
      .is('deleted_at', null)
      .limit(1);

    setHasInputToday(todayData && todayData.length > 0);

    const { data: transData } = await supabase
      .from('transaction')
      .select(`*, category (name, icon, color)`)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    setTransactions(transData || []);

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
    const { start } = getFinancialRange(userPayday);
    const currentMonthYear = start.substring(0, 7);
    const { error } = await supabase.from('transaction').insert([{
      user_id: session.user.id,
      amount: rec.amount,
      category_id: rec.category_id,
      note: `[Rutin] ${rec.note}`,
      date: new Date().toISOString().split('T')[0],
      type: 'pengeluaran',
      payment_method: rec.payment_method
    }]);

    if (!error) {
      await supabase.from('recurring_transactions').update({ last_processed_at: currentMonthYear }).eq('id', rec.id);
      fetchDashboardData();
    }
  };

  const handleSkipRecurring = async (rec) => {
    const { start } = getFinancialRange(userPayday);
    const currentMonthYear = start.substring(0, 7);
    await supabase.from('recurring_transactions').update({ last_processed_at: currentMonthYear }).eq('id', rec.id);
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen pb-32 font-sans bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 px-6 pt-12 pb-14 rounded-b-[3rem] shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={avatarUrl} alt="Profile" className="object-cover w-12 h-12 border-2 border-blue-400 rounded-full shadow-sm" />
            <div>
              <p className="text-xs font-medium tracking-widest text-blue-100 uppercase">Halo, bosku! 👋</p>
              <h2 className="text-lg font-black tracking-tight capitalize truncate w-44">{userName}</h2>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="px-3 py-1.5 bg-white/20 rounded-xl text-[10px] font-black uppercase">Logout</button>
        </div>
        <div className="relative z-10 py-2 text-center">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 opacity-80">Saldo Keseluruhan</p>
          <h1 className="text-4xl font-black tracking-tighter">Rp {summary.total.toLocaleString('id-ID')}</h1>
        </div>
        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest text-center mt-2">Periode: {periodLabel}</p>
      </div>

      {/* Ringkasan Dompet vs Bank */}
      <div className="relative z-30 grid grid-cols-2 gap-4 px-5 -mt-8">
        <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-orange-50 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs">💵</span>
            <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Dompet</span>
          </div>
          <p className="text-sm font-black text-gray-800">Rp {wallet.dompet.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-blue-50 flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs">📱</span>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Bank</span>
          </div>
          <p className="text-sm font-black text-gray-800">Rp {wallet.bank.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Banner Input & Wawasan */}
      <div className="px-5 space-y-4 mt-7">
        {!loading && !hasInputToday && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4 rounded-[2rem] shadow-xl flex items-center justify-between border border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-2xl">📝</div>
              <div>
                <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">Lupa nyatet?</p>
                <p className="text-xs font-bold text-white">Belum ada catatan hari ini.</p>
              </div>
            </div>
            <button onClick={() => setCurrentPage('input-pengeluaran')} className="bg-white text-orange-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md">Isi Sekarang</button>
          </div>
        )}
      </div>

      {/* Ringkasan In/Out */}
      <div className="grid grid-cols-2 gap-4 px-5 mt-4">
        <div className="p-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Masuk</p>
          <p className="text-sm font-black text-green-600">+ Rp {summary.income.toLocaleString('id-ID')}</p>
        </div>
        <div className="p-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Keluar</p>
          <p className="text-sm font-black text-red-600">- Rp {summary.expense.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Riwayat */}
      <div className="px-5 mt-8">
        <div className="flex items-end justify-between px-1 mb-4">
          <h3 className="text-lg font-black text-gray-800">Riwayat Cuan</h3>
          <button onClick={() => setCurrentPage('laporan')} className="text-xs font-black text-blue-600 uppercase">Semua</button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="py-10 text-xs font-black text-center text-gray-400 uppercase animate-pulse">Lagi ngitung duit dulu 🙏</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-3xl border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 text-xl rounded-2xl" style={{ backgroundColor: `${t.category?.color}15`, color: t.category?.color }}>{t.category?.icon}</div>
                  <div>
                    <p className="w-32 text-sm font-black text-gray-800 truncate">{t.note || t.category?.name}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t.category?.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${t.type === 'pengeluaran' ? 'text-red-500' : 'text-green-500'}`}>{t.type === 'pengeluaran' ? '-' : '+'} {t.amount.toLocaleString('id-ID')}</p>
                  <p className="text-[9px] font-bold text-gray-300 uppercase">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Recurring (Dipangkas singkat) */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-in slide-in-from-bottom-10">
            <h2 className="text-xl font-black text-center text-gray-800">Ada Tagihan Rutin!</h2>
            <div className="mt-6 space-y-4">
              {pendingRecurring.map(rec => (
                <div key={rec.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                   <p className="text-sm font-black">{rec.note}</p>
                   <button onClick={() => handlePayRecurring(rec)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Bayar</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowRecurringModal(false)} className="w-full mt-6 text-[10px] font-black text-gray-300 uppercase">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;