import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange } from '../utils/formatters';

export function useStatistik(session) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('pengeluaran');
  const [paydayDate, setPaydayDate] = useState(1);

  useEffect(() => {
    fetchStatistik();
  }, [filterType]);

  const fetchStatistik = async () => {
    setLoading(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('payday')
      .eq('id', session.user.id)
      .single();

    const payday = profile?.payday || 1;
    setPaydayDate(payday);
    const { start, end } = getFinancialRange(payday);

    const { data, error } = await supabase
      .from('transaction')
      .select(`amount, type, date, category (name, color, icon)`)
      .is('deleted_at', null)
      .eq('type', filterType) // Filter strictly by 'pengeluaran' or 'pemasukan'
      .gte('date', start)
      .lte('date', end);

    if (!error && data) {
      // Logic: Mutasi otomatis terfilter karena query hanya mengambil filterType
      const grouped = data.reduce((acc, curr) => {
        const catName = curr.category?.name || 'Lainnya';
        if (!acc[catName]) {
          acc[catName] = {
            name: catName,
            value: 0,
            color: curr.category?.color || '#cbd5e1',
            icon: curr.category?.icon || '❓'
          };
        }
        acc[catName].value = acc[catName].value + curr.amount;
        return acc;
      }, {});

      setChartData(Object.values(grouped));
    }
    setLoading(false);
  };

  // Derived States (Calculations)
  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  // Perbaikan Logika Rata-rata Harian:
  // Menghitung hari yang sudah berlalu sejak tanggal gajian di periode ini
  const calculateDaysPassed = () => {
    const today = new Date();
    const { start } = getFinancialRange(paydayDate);
    const startDate = new Date(start);

    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Jangan sampai pembagi lebih dari 31 atau kurang dari 1
    return Math.min(Math.max(diffDays, 1), 31);
  };

  const dailyAvg = totalValue / calculateDaysPassed();

  const topCategory = chartData.length > 0
    ? [...chartData].sort((a, b) => b.value - a.value)[0]
    : null;

  return {
    chartData,
    loading,
    filterType,
    setFilterType,
    totalValue,
    dailyAvg,
    topCategory
  };
}