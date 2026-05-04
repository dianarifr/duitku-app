import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange, formatDateForInput } from '../utils/formatters';

import LaporanHeader from '../components/Laporan/LaporanHeader';
import LaporanSummary from '../components/Laporan/LaporanSummary';
import TransactionList from '../components/Laporan/TransactionList';

import { useLaporan } from '../hooks/useLaporan';

export default function Laporan({ session, setCurrentPage, setEditData, tempCategoryFilter, setTempCategoryFilter }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');

  // State summary sekarang menampung mutation untuk sinkronisasi LaporanSummary
  const [summary, setSummary] = useState({ income: 0, expense: 0, mutation: 0 });
  const [filter, setFilter] = useState({ start: '', end: '' });

  const fetchFilteredData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('transaction').select(`*, category (name, icon, color)`)
      .eq('user_id', session.user.id).is('deleted_at', null)
      .gte('date', filter.start).lte('date', filter.end)
      .order('date', { ascending: false }).order('created_at', { ascending: false });

    if (!error) {
      // Hitung pemasukan
      const inc = data?.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0) || 0;

      // Hitung pengeluaran
      const exp = data?.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0) || 0;

      // Hitung mutasi (ambil satu sisi saja agar total nominal tidak double)
      const mut = data?.filter(t => t.type === 'mutasi' && t.note?.includes('[KELUAR]'))
                       .reduce((sum, t) => sum + t.amount, 0) || 0;

      setTransactions(data || []);
      setSummary({ income: inc, expense: exp, mutation: mut });
    }
    setLoading(false);
  };

  // Alert sudah dihandle di dalam useLaporan sesuai request lo, Puh
  const laporanHook = useLaporan(session, fetchFilteredData);

  useEffect(() => {
    if (tempCategoryFilter !== 'all') {
      setSelectedCategory(tempCategoryFilter);
      setTempCategoryFilter('all');
    }
  }, [tempCategoryFilter]);

  useEffect(() => {
    const initFilter = async () => {
      const { data: profile } = await supabase.from('profiles').select('payday').eq('id', session.user.id).single();
      const payday = profile?.payday || 1;
      const range = getFinancialRange(payday);
      setFilter({ start: formatDateForInput(range.start), end: formatDateForInput(range.end) });
    };
    initFilter();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (filter.start && filter.end) fetchFilteredData();
  }, [filter]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('category').select('*').eq('user_id', session.user.id).is('deleted_at', null);
    setCategories(data || []);
  };

  const filteredTransactions = transactions.filter(t => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (t.note?.toLowerCase().includes(s) || t.category?.name?.toLowerCase().includes(s));
    const matchesCategory = (selectedCategory === 'all' || t.category_id === selectedCategory);
    const matchesMethod = (selectedMethod === 'all' || t.payment_method === selectedMethod);

    return matchesSearch && matchesCategory && matchesMethod;
  });

  return (
    <div className="min-h-screen pb-10 font-sans text-gray-900 bg-gray-50">
      <LaporanHeader
        onBack={() => setCurrentPage('dashboard')}
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
      />

      {/* LaporanSummary sekarang menerima prop mutation agar ringkasan di atas akurat */}
      <LaporanSummary
        income={summary.income}
        expense={summary.expense}
        mutation={summary.mutation}
      />

      <TransactionList
        loading={loading}
        transactions={filteredTransactions}
        onEdit={(t) => {
            setEditData(t);
            // Jika mutasi, dilempar ke page mutasi, jika jajan biasa ke input-transaksi
            setCurrentPage(t.type === 'mutasi' ? 'input-mutasi' : 'input-transaksi');
        }}
        hook={laporanHook}
      />
    </div>
  );
}