import { supabase } from '../supabaseClient';
import { getFinancialRange } from '../utils/formatters';

export const fetchAllDashboardData = async (userId) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  const { data: profile } = await supabase
    .from('profiles')
    .select('payday')
    .eq('id', userId)
    .single();

  const payday = profile?.payday || 1;
  const currentRange = getFinancialRange(payday);
  const options = { day: 'numeric', month: 'short' };
  const periodLabel = `${new Date(currentRange.start).toLocaleDateString('id-ID', options)} - ${new Date(currentRange.end).toLocaleDateString('id-ID', options)}`;

  const { data: allTrans } = await supabase
    .from('transaction')
    .select('amount, type, date, payment_method, category_id, note')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('date', currentRange.start)
    .lte('date', currentRange.end);

  const thisMonthTrans = allTrans || [];

  let cashIn = 0, cashOut = 0, bankIn = 0, bankOut = 0, totalIncome = 0, totalExpense = 0;

  thisMonthTrans.forEach(t => {
    const amt = t.amount;
    if (t.type === 'pemasukan') {
      totalIncome += amt;
      t.payment_method === 'transfer' ? bankIn += amt : cashIn += amt;
    } else if (t.type === 'pengeluaran') {
      totalExpense += amt;
      t.payment_method === 'transfer' ? bankOut += amt : cashOut += amt;
    } else if (t.type === 'mutasi') {
      // Mutasi dicatat dari dua sisi; tiap sisi menggerakkan kantong sesuai arahnya.
      if (t.note.includes('[KELUAR]')) {
        t.payment_method === 'transfer' ? bankOut += amt : cashOut += amt;
      } else if (t.note.includes('[MASUK]')) {
        t.payment_method === 'transfer' ? bankIn += amt : cashIn += amt;
      }
    }
  });

  const { data: catData } = await supabase
    .from('category')
    .select('id, name, icon, color, budget')
    .eq('user_id', userId)
    .is('deleted_at', null);

  let budgetMonitoring = [];
  let criticalBudgets = [];

  if (catData) {
    budgetMonitoring = catData.map(cat => {
      const used = thisMonthTrans
        .filter(t => t.category_id === cat.id && t.type === 'pengeluaran')
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...cat, used };
    });

    criticalBudgets = budgetMonitoring
      .map(b => ({ ...b, percent: (b.used / (b.budget || 1)) * 100 }))
      .filter(b => b.budget > 0 && b.percent >= 80)
      .sort((a, b) => b.percent - a.percent);
  }

  const { data: todayData } = await supabase
    .from('transaction')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .is('deleted_at', null)
    .limit(1);

  const { data: recurringList } = await supabase
    .from('recurring_transactions')
    .select('*, category(name, icon)')
    .eq('user_id', userId)
    .eq('is_active', true);

  let pendingRecurring = [];
  if (recurringList) {
    const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    pendingRecurring = recurringList.filter(rec => {
      const startCycle = new Date(currentRange.start);
      let targetYear = startCycle.getFullYear();
      let targetMonth = startCycle.getMonth();

      // Tanggal tagihan sebelum tanggal gajian jatuh pada bulan berikutnya.
      if (rec.billing_date < payday) targetMonth += 1;

      const actualDueDate = new Date(targetYear, targetMonth, rec.billing_date);
      const isDueDate = todayNormalized >= actualDueDate;
      const alreadyPaid = thisMonthTrans.some(t =>
        t.category_id === rec.category_id && t.type === 'pengeluaran'
      );

      return isDueDate && !alreadyPaid;
    });
  }

  return {
    payday,
    periodLabel,
    summary: { income: totalIncome, expense: totalExpense, total: totalIncome - totalExpense },
    wallet: { dompet: cashIn - cashOut, bank: bankIn - bankOut },
    budgetMonitoring,
    criticalBudgets,
    hasInputToday: !!(todayData && todayData.length > 0),
    pendingRecurring
  };
};
