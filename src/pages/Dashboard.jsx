import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange } from '../utils/formatters';

// IMPORT KOMPONEN BARU
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import WalletCards from '../components/Dashboard/WalletCards';
import SummarySection from '../components/Dashboard/SummarySection';
import AICoach from '../components/Dashboard/AICoach';
import HistoryList from '../components/Dashboard/HistoryList';
import RecurringModal from '../components/Dashboard/RecurringModal';

function Dashboard({ session, setCurrentPage, setEditData}) {
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

  const [aiAdvice, setAiAdvice] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const user = session.user;
  const userName = user.user_metadata?.full_name || user.email.split('@')[0];
  const avatarUrlDummy = `https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff&rounded=true&bold=true`;
  const avatarUrl = user.user_metadata?.avatar_url || avatarUrlDummy;

  const getAiCoachAdvice = async (budgets) => {
    try {
      setIsAiLoading(true);
      const response = await fetch('https://duitku.freepalestine.my.id/api/gemini-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgets })
      });
      const data = await response.json();
      if (data.advice) {
        setAiAdvice(data.advice);
        localStorage.setItem('ai_advice_cache', data.advice);
        localStorage.setItem('ai_budget_hash', JSON.stringify(budgets.map(b => ({ id: b.id, p: Math.round(b.percent) }))));
      }
    } catch (error) {
      console.error("AI Coach pundung:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && criticalBudgets.length > 0) {
      const cachedAdvice = localStorage.getItem('ai_advice_cache');
      const cachedHash = localStorage.getItem('ai_budget_hash');
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

    // 1. Ambil Profil (Payday)
    const { data: profile } = await supabase
      .from('profiles')
      .select('payday')
      .eq('id', session.user.id)
      .single();

    const payday = profile?.payday || 1;
    setUserPayday(payday);

    // 2. Setup Range Tanggal
    const currentRange = getFinancialRange(payday);
    const lastMonthDate = new Date(currentRange.start);
    lastMonthDate.setDate(lastMonthDate.getDate() - 1);
    const lastRange = getFinancialRange(payday, lastMonthDate);

    const options = { day: 'numeric', month: 'short' };
    setPeriodLabel(`${new Date(currentRange.start).toLocaleDateString('id-ID', options)} - ${new Date(currentRange.end).toLocaleDateString('id-ID', options)}`);

    // 3. Ambil Semua Transaksi Bulan Ini (Source of Truth)
    const { data: allTrans } = await supabase
      .from('transaction')
      .select('amount, type, date, payment_method, category_id, note')
      .eq('user_id', session.user.id) // Filter User
      .is('deleted_at', null)
      .gte('date', currentRange.start)
      .lte('date', currentRange.end);

    const thisMonthTrans = allTrans || [];

    // 4. Logic Baru Tagihan Rutin (Task 1)
    const { data: recurringList } = await supabase
      .from('recurring_transactions')
      .select('*, category(name, icon)')
      .eq('user_id', session.user.id)
      .eq('is_active', true);

    if (recurringList) {
      const now = new Date();
      // Set jam ke 00:00:00 biar bandingin tanggalnya akurat
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const pending = recurringList.filter(rec => {
        if (rec.is_active === false) return false;

        // 1. Tentukan bulan target untuk tagihan ini
        const startCycle = new Date(currentRange.start); // Misal: 23 April
        let targetYear = startCycle.getFullYear();
        let targetMonth = startCycle.getMonth();

        // Jika tanggal tagihan (2) < gajian (23), berarti itu buat bulan depan (Mei)
        if (rec.billing_date < payday) {
          targetMonth += 1;
        }

        // 2. Buat Objek Tanggal Jatuh Tempo yang nyata
        const actualDueDate = new Date(targetYear, targetMonth, rec.billing_date);

        // 3. Cek apakah hari ini sudah mencapai atau melewati tanggal tersebut
        const isDueDate = today >= actualDueDate;

        // 4. Cek apakah sudah dibayar (sama kayak kemarin)
        const alreadyPaid = thisMonthTrans.some(t =>
          t.category_id === rec.category_id &&
          t.type === 'pengeluaran'
        );

        return isDueDate && !alreadyPaid;
      });

      setPendingRecurring(pending);
      if (pending.length > 0) setShowRecurringModal(true);
    }

    // 5. Kalkulasi Summary (Income/Expense/Wallet)
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

    setSummary({ income: totalIncome, expense: totalExpense, total: totalIncome - totalExpense });
    setWallet({ dompet: cashIn - cashOut, bank: bankIn - bankOut });

    // 6. Ambil Data Tambahan (History & Budgets)
    const { data: transData } = await supabase
      .from('transaction')
      .select(`*, category (name, icon, color)`)
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);
    setTransactions(transData || []);

    const { data: todayData } = await supabase
      .from('transaction')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('date', today)
      .is('deleted_at', null)
      .limit(1);
    setHasInputToday(todayData && todayData.length > 0);

    setLoading(false);
  };

  const handlePayRecurring = async (rec) => {
    // Murni Insert, Tanpa Update Flag (Task 1)
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
      fetchDashboardData(); // Refresh akan otomatis menutup modal karena kategori terdeteksi lunas
    }
  };

  return (
    <div className="min-h-screen pb-32 font-sans bg-gray-50">
      <DashboardHeader userName={userName} avatarUrl={avatarUrl} totalBalance={summary.total} periodLabel={periodLabel} onLogout={() => supabase.auth.signOut()} />
      <WalletCards wallet={wallet} />
      <SummarySection hasInputToday={hasInputToday} loading={loading} income={summary.income} expense={summary.expense} onInputClick={() => setCurrentPage('input-pengeluaran')} />
      <AICoach aiAdvice={aiAdvice} isAiLoading={isAiLoading} />
      <HistoryList transactions={transactions} loading={loading} onSeeAll={() => setCurrentPage('laporan')} onEdit={(t) => { setEditData(t); setCurrentPage('input-transaksi'); }} />
      <RecurringModal show={showRecurringModal} pending={pendingRecurring} onPay={handlePayRecurring} onClose={() => setShowRecurringModal(false)} />
    </div>
  );
}

export default Dashboard;