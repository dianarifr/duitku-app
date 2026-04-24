import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange, formatDateForInput } from '../utils/formatters';

// Import Komponen
import LaporanHeader from '../components/Laporan/LaporanHeader';
import LaporanSummary from '../components/Laporan/LaporanSummary';
import TransactionList from '../components/Laporan/TransactionList';

export default function Laporan({ session, setCurrentPage, setEditData }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [filter, setFilter] = useState({ start: '', end: '' });

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

  const fetchFilteredData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('transaction').select(`*, category (name, icon, color)`)
      .eq('user_id', session.user.id).is('deleted_at', null)
      .gte('date', filter.start).lte('date', filter.end)
      .order('date', { ascending: false }).order('created_at', { ascending: false });

    if (!error) {
      const inc = data?.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0) || 0;
      const exp = data?.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0) || 0;
      setTransactions(data || []);
      setSummary({ income: inc, expense: exp });
    }
    setLoading(false);
  };

  const filteredTransactions = transactions.filter(t => {
    const s = searchTerm.toLowerCase();
    return (t.note?.toLowerCase().includes(s) || t.category?.name?.toLowerCase().includes(s)) &&
           (selectedCategory === 'all' || t.category_id === selectedCategory) &&
           (selectedMethod === 'all' || t.payment_method === selectedMethod);
  });

  return (
    <div className="min-h-screen pb-10 font-sans text-gray-900 bg-gray-50">
      <LaporanHeader
        onBack={() => setCurrentPage('dashboard')} filter={filter} setFilter={setFilter}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm} categories={categories}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        selectedMethod={selectedMethod} setSelectedMethod={setSelectedMethod}
      />

      <LaporanSummary income={summary.income} expense={summary.expense} />

      <TransactionList
        loading={loading} transactions={filteredTransactions}
        onEdit={(t) => { setEditData(t); setCurrentPage('input-transaksi'); }}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Modal Hapus Biarkan di sini dulu karena simpel */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem] animate-in zoom-in">
            <h3 className="mb-2 text-xl font-black text-gray-800 uppercase">Hapus?</h3>
            <p className="mb-8 text-xs font-bold text-gray-400">Yakin mau hapus transaksi ini, ges?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 text-[10px] font-black text-gray-400 bg-gray-50 rounded-2xl uppercase">Batal</button>
              <button onClick={async () => {
                await supabase.from('transaction').update({ deleted_at: new Date().toISOString() }).eq('id', deleteId).eq('user_id', session.user.id);
                setDeleteId(null); fetchFilteredData();
              }} className="flex-1 py-4 text-[10px] font-black text-white bg-red-500 rounded-2xl uppercase tracking-widest">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}