import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Laporan({ session, setCurrentPage, setEditData }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');

  const [filter, setFilter] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [summary, setSummary] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    fetchFilteredData();
    fetchCategories();
  }, [filter]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('category').select('*').is('deleted_at', null);
    setCategories(data || []);
  };

  const fetchFilteredData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transaction')
      .select(`*, category (name, icon, color)`)
      .is('deleted_at', null)
      .gte('date', filter.start)
      .lte('date', filter.end)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error) {
      setTransactions(data || []);
      const inc = data?.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0) || 0;
      const exp = data?.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0) || 0;
      setSummary({ income: inc, expense: exp });
    }
    setLoading(false);
  };

  // FUNGSI PRESET TANGGAL PRO
  const setDatePreset = (preset) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === '7days') {
      start.setDate(now.getDate() - 7);
    } else if (preset === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (preset === 'lastMonth') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    setFilter({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  // LOGIKA PENCARIAN & FILTER MULTI-DIMENSI
  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      t.note?.toLowerCase().includes(searchLower) ||
      t.category?.name?.toLowerCase().includes(searchLower);

    const matchesCategory = selectedCategory === 'all' || t.category_id === selectedCategory;
    const matchesMethod = selectedMethod === 'all' || t.payment_method === selectedMethod;

    return matchesSearch && matchesCategory && matchesMethod;
  });

  const handleDelete = async (id) => {
    await supabase.from('transaction').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    fetchFilteredData();
  };

  const handleOpenEdit = (t) => {
    setEditData(t);
    setCurrentPage('input-transaksi');
  };

  return (
    <div className="min-h-screen pb-10 font-sans text-gray-900 bg-gray-50">
      {/* Header & Filter Sticky */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-30 rounded-b-[2.5rem]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage('dashboard')} className="flex items-center justify-center w-10 h-10 font-bold transition-all bg-gray-100 rounded-2xl active:scale-90">←</button>
            <h1 className="text-xl font-black tracking-tight uppercase">Riwayat</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDatePreset('7days')} className="px-3 py-2 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-xl">7 Hari</button>
            <button onClick={() => setDatePreset('thisMonth')} className="px-3 py-2 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-xl">Bulan Ini</button>
          </div>
        </div>

        {/* Search & Select Filter */}
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute -translate-y-1/2 left-4 top-1/2 opacity-30">🔍</span>
            <input
              type="text"
              placeholder="Cari catatan seblak, kopi, gaji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 text-sm font-bold transition-all border-none outline-none pl-11 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 p-3 bg-gray-50 border-none rounded-xl text-[9px] font-black uppercase text-gray-400 outline-none">
              <option value="all">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className="flex-1 p-3 bg-gray-50 border-none rounded-xl text-[9px] font-black uppercase text-gray-400 outline-none">
              <option value="all">Semua Metode</option>
              <option value="cash">💵 Cash</option>
              <option value="transfer">📱 Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="px-6 mt-6">
        <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-xl text-white text-center">
            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Netto Periode Ini</p>
            <h2 className="mb-4 text-3xl font-black">Rp {(summary.income - summary.expense).toLocaleString('id-ID')}</h2>
            <div className="flex justify-center gap-8 pt-4 border-t border-white/10">
              <div>
                <p className="text-[9px] font-black uppercase opacity-60">Masuk</p>
                <p className="text-sm font-black text-green-300">+{summary.income.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase opacity-60">Keluar</p>
                <p className="text-sm font-black text-red-300">-{summary.expense.toLocaleString('id-ID')}</p>
              </div>
            </div>
        </div>
      </div>

      {/* List Transaksi */}
      <div className="px-6 mt-8 space-y-4 pb-15">
        {loading ? (
          <p className="py-10 text-xs font-black text-center text-gray-300 uppercase animate-pulse">Lagi Nyari Data...</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 text-gray-400 font-bold">Kaga ada datanya ges 🕵️‍♂️</div>
        ) : (
          filteredTransactions.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-12 h-12 text-xl rounded-2xl" style={{ backgroundColor: `${t.category?.color}15`, color: t.category?.color }}>
                    {t.category?.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black leading-tight text-gray-800 uppercase">{t.category?.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-black ${t.type === 'pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'pemasukan' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                  </p>
                  <span className="text-[8px] font-black px-2 py-0.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100 uppercase">{t.payment_method}</span>
                </div>
              </div>

              {/* DISPLAY CATATAN (NEW) */}
              {t.note && (
                <div className="px-4 py-3 border-l-4 border-blue-400 bg-gray-50 rounded-2xl">
                  <p className="text-[11px] font-bold text-gray-600 italic leading-relaxed">"{t.note}"</p>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button onClick={() => handleOpenEdit(t)} className="flex-1 py-3 bg-gray-100 text-gray-500 text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all">✏️ Edit</button>
                <button onClick={() => setDeleteId(t.id)} className="flex-1 py-3 bg-red-50 text-red-400 text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all">🗑️ Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Hapus Tetap Sama */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem] animate-in zoom-in duration-300">
            <h3 className="mb-2 text-xl font-black text-gray-800">Hapus?</h3>
            <p className="mb-8 text-sm font-bold text-gray-400">Yakin mau hapus transaksi ini, ges?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 text-xs font-black text-gray-400 bg-gray-50 rounded-2xl">Batal</button>
              <button onClick={() => { handleDelete(deleteId); setDeleteId(null); }} className="flex-1 py-4 text-xs font-black text-white bg-red-500 rounded-2xl">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}