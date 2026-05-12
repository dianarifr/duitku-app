import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange } from '../utils/formatters';
import { formatNominal } from '../utils/formatters';
import { fetchAllDashboardData } from '../services/dashboardService';

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
    try {
      setLoading(true);
      const data = await fetchAllDashboardData(session.user.id);

      setPayday(data.payday);
      setPeriodLabel(data.periodLabel);
      setSummary(data.summary);
      setWallet(data.wallet);
      setBudgetMonitoring(data.budgetMonitoring);
      setCriticalBudgets(data.criticalBudgets);
      setHasInputToday(data.hasInputToday);
      setPendingRecurring(data.pendingRecurring);

      if (data.pendingRecurring.length > 0) setShowRecurringModal(true);
    } catch (err) {
      console.error("Gagal ambil data dashboard:", err);
    } finally {
      setLoading(false);
    }
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