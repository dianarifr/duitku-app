import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange } from '../utils/formatters';

export function useStatistik(session) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('pengeluaran');

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
    const { start, end } = getFinancialRange(payday);

    const { data, error } = await supabase
      .from('transaction')
      .select(`amount, type, date, category (name, color, icon)`)
      .is('deleted_at', null)
      .eq('type', filterType)
      .gte('date', start)
      .lte('date', end);

    if (!error && data) {
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
        // Hindari mutasi langsung yang ekstrim, gunakan assignment biasa
        acc[catName].value = acc[catName].value + curr.amount;
        return acc;
      }, {});

      setChartData(Object.values(grouped));
    }
    setLoading(false);
  };

  // Derived States (Calculations)
  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const today = new Date();
  const daysPassed = today.getDate() || 1;
  const dailyAvg = totalValue / daysPassed;

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