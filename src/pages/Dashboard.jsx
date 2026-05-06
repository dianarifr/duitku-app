import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange } from '../utils/formatters';
import { formatNominal } from '../utils/formatters';

// IMPORT KOMPONEN
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import WalletCards from '../components/Dashboard/WalletCards';
import SummarySection from '../components/Dashboard/SummarySection';
import PaydayProgressBar from '../components/Dashboard/PaydayProgressBar'; // Komponen Baru
import AICoach from '../components/Dashboard/AICoach';
import HistoryList from '../components/Dashboard/HistoryList';
import RecurringModal from '../components/Dashboard/RecurringModal';
import BudgetSection from '../components/Dashboard/BudgetCard';

function Dashboard({ session, setCurrentPage, setEditData, onCategoryDeepDive, onOpenActionMenu }) {
  const [summary, setSummary] = useState({ total: 0, income: 0, expense: 0 });
  const [wallet, setWallet] = useState({ dompet: 0, bank: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInputToday, setHasInputToday] = useState(true);
  const [criticalBudgets, setCriticalBudgets] = useState([]);
  const [pendingRecurring, setPendingRecurring] = useState([]);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [periodLabel, setPeriodLabel] = useState('');
  const [budgetMonitoring, setBudgetMonitoring] = useState([]);
  const [payday, setPayday] = useState(1); // State untuk menyimpan tanggal gajian

  const [aiAdvice, setAiAdvice] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiCoach, setShowAiCoach] = useState(() => {
    const saved = localStorage.getItem('show_ai_coach');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleAiCoach = () => {
    const newVal = !showAiCoach;
    setShowAiCoach(newVal);
    localStorage.setItem('show_ai_coach', JSON.stringify(newVal));
  };

  const user = session.user;
  const userName = user.user_metadata?.full_name || user.email.split('@')[0];
  const avatarUrl = user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff&rounded=true&bold=true`;
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const getAiCoachAdvice = async (budgets) => {
    try {
      setIsAiLoading(true);
      const response = await fetch(`${apiUrl}/gemini-coach`, {
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

    // 1. Ambil Profil (Payday)
    const { data: profile } = await supabase
      .from('profiles')
      .select('payday')
      .eq('id', session.user.id)
      .single();

    const paydayVal = profile?.payday || 1;
    setPayday(paydayVal); // Simpan ke state untuk progress bar

    // 2. Setup Range Tanggal
    const currentRange = getFinancialRange(paydayVal);
    const options = { day: 'numeric', month: 'short' };
    setPeriodLabel(`${new Date(currentRange.start).toLocaleDateString('id-ID', options)} - ${new Date(currentRange.end).toLocaleDateString('id-ID', options)}`);

    // 3. Ambil Transaksi (Source of Truth)
    const { data: allTrans } = await supabase
      .from('transaction')
      .select('amount, type, date, payment_method, category_id, note')
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .gte('date', currentRange.start)
      .lte('date', currentRange.end);

    const thisMonthTrans = allTrans || [];

    // 4. Kalkulasi Summary & Wallet (Disesuaikan untuk Mutasi)
    let cashIn = 0, cashOut = 0, bankIn = 0, bankOut = 0, totalIncome = 0, totalExpense = 0;

    thisMonthTrans.forEach(t => {
      const amt = t.amount;

      if (t.type === 'pemasukan') {
        totalIncome += amt;
        t.payment_method === 'transfer' ? bankIn += amt : cashIn += amt;
      }
      else if (t.type === 'pengeluaran') {
        totalExpense += amt;
        t.payment_method === 'transfer' ? bankOut += amt : cashOut += amt;
      }
      else if (t.type === 'mutasi') {
        // Mutasi tidak masuk Summary Income/Expense, tapi WAJIB masuk Wallet
        if (t.note.includes('[KELUAR]')) {
          t.payment_method === 'transfer' ? bankOut += amt : cashOut += amt;
        } else if (t.note.includes('[MASUK]')) {
          t.payment_method === 'transfer' ? bankIn += amt : cashIn += amt;
        }
      }
    });

    setSummary({
      income: totalIncome,
      expense: totalExpense,
      total: totalIncome - totalExpense
    });

    setWallet({
      dompet: cashIn - cashOut,
      bank: bankIn - bankOut
    });

    // 5. Monitoring Budget (Exclude Mutasi agar tidak bocor)
    const { data: catData } = await supabase
      .from('category')
      .select('id, name, icon, color, budget')
      .eq('user_id', session.user.id)
      .is('deleted_at', null);

    if (catData) {
      const budgetStatus = catData.map(cat => {
        const used = thisMonthTrans
          .filter(t => t.category_id === cat.id && t.type === 'pengeluaran')
          .reduce((sum, t) => sum + t.amount, 0);
        return { ...cat, used };
      });

      setBudgetMonitoring(budgetStatus);

      const critical = budgetStatus
        .map(b => ({ ...b, percent: (b.used / (b.budget || 1)) * 100 }))
        .filter(b => b.budget > 0 && b.percent >= 80)
        .sort((a, b) => b.percent - a.percent);

      setCriticalBudgets(critical);
    }

    // 6. Cek Input Hari Ini & Tagihan Rutin
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
    const { error } = await supabase.from('transaction').insert([{
      user_id: session.user.id,
      amount: rec.amount,
      category_id: rec.category_id,
      note: `[Rutin] ${rec.note}`,
      date: new Date().toISOString().split('T')[0],
      type: 'pengeluaran',
      payment_method: rec.payment_method
    }]);

    if (!error) fetchDashboardData();
  };

  return (
    <div className="min-h-screen pb-32 font-sans bg-gray-50">
      <DashboardHeader
        userName={userName}
        avatarUrl={avatarUrl}
        totalBalance={summary.total}
        periodLabel={periodLabel}
        onLogout={() => supabase.auth.signOut()}
        formatNominal={formatNominal}
      />

      <WalletCards
        wallet={wallet}
        formatNominal={formatNominal}
      />

      <SummarySection
        hasInputToday={hasInputToday}
        loading={loading}
        income={summary.income}
        expense={summary.expense}
        onInputClick={onOpenActionMenu}
        formatNominal={formatNominal}
      />

      {/* Payday Progress Bar disisipkan di atas AI Coach agar layout tetap simetris */}
      <PaydayProgressBar payday={payday} />

      <AICoach
        aiAdvice={aiAdvice}
        isAiLoading={isAiLoading}
        isExpanded={showAiCoach}
        onToggle={toggleAiCoach}
      />

      <BudgetSection
        loading={loading}
        budgetMonitoring={budgetMonitoring}
        setCurrentPage={setCurrentPage}
        onCategoryDeepDive={onCategoryDeepDive}
        formatNominal={formatNominal}
      />

      <RecurringModal
        show={showRecurringModal}
        pending={pendingRecurring}
        onPay={handlePayRecurring}
        onClose={() => setShowRecurringModal(false)}
      />
    </div>
  );
}

export default Dashboard;