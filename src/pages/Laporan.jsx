import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah, parseNumber } from '../utils/formatters';

export default function Laporan({ session, setCurrentPage }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [displayEditAmount, setDisplayEditAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Auto-Complete
  const [allNotes, setAllNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filter, setFilter] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [summary, setSummary] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    fetchFilteredData();
    fetchCategories();
    fetchUniqueNotes(); // Ambil riwayat catatan buat auto-complete
  }, [filter]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('category')
      .select('*')
      .is('deleted_at', null);
    setCategories(data || []);
  };

  const fetchUniqueNotes = async () => {
    const { data } = await supabase
      .from('transaction')
      .select('note')
      .is('deleted_at', null)
      .limit(100);

    if (data) {
      const unique = [...new Set(data.map(t => t.note))].filter(Boolean);
      setAllNotes(unique);
    }
  };

  const fetchFilteredData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transaction')
      .select(`
        *,
        category (name, icon, color)
      `)
      .is('deleted_at', null)
      .gte('date', filter.start)
      .lte('date', filter.end)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else {
      setTransactions(data || []);
      const inc = data?.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0) || 0;
      const exp = data?.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0) || 0;
      setSummary({ income: inc, expense: exp });
    }
    setLoading(false);
  };

  const handleNoteChange = (val) => {
    setEditingTransaction({ ...editingTransaction, note: val });
    if (val.length > 1) {
      const filtered = allNotes.filter(n =>
        n.toLowerCase().includes(val.toLowerCase()) && n !== val
      );
      setFilteredNotes(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    return (
      t.note?.toLowerCase().includes(searchLower) ||
      t.category?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('transaction')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) alert('Gagal hapus transaksi: ' + error.message);
    else fetchFilteredData();
  };

  const openEditModal = (t) => {
    setEditingTransaction({
        ...t,
        category_id: t.category_id || ''
    });
    setDisplayEditAmount(formatRupiah(t.amount.toString()));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTransaction.category_id) return alert('Pilih kategori dulu, ges!');

    setLoading(true);
    const { error } = await supabase
      .from('transaction')
      .update({
        amount: parseNumber(displayEditAmount),
        category_id: editingTransaction.category_id,
        note: editingTransaction.note,
        date: editingTransaction.date,
        updated_at: new Date()
      })
      .eq('id', editingTransaction.id);

    if (error) {
      alert('Gagal update: ' + error.message);
    } else {
      setEditingTransaction(null);
      fetchFilteredData();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-10 font-sans text-gray-900 bg-gray-50">
      {/* Header Fixed */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-30 rounded-b-[2rem]">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center justify-center w-10 h-10 font-bold text-gray-600 transition-all bg-gray-100 rounded-2xl active:scale-90"
          >
            ←
          </button>
          <h1 className="text-xl font-black tracking-tight text-gray-800 uppercase">Riwayat Cuan</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <p className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1">Mulai</p>
            <input
              type="date"
              value={filter.start}
              onClick={(e) => e.target.showPicker()}
              onChange={(e) => setFilter({...filter, start: e.target.value})}
              className="w-full p-3 text-xs font-bold border-none outline-none appearance-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'light' }}
            />
            <span className="absolute text-xs pointer-events-none right-3 bottom-3">📅</span>
          </div>
          <div className="mt-5 font-black text-gray-300">➔</div>
          <div className="relative flex-1">
            <p className="text-[10px] font-black text-gray-400 uppercase ml-1 mb-1">Sampai</p>
            <input
              type="date"
              value={filter.end}
              onClick={(e) => e.target.showPicker()}
              onChange={(e) => setFilter({...filter, end: e.target.value})}
              className="w-full p-3 text-xs font-bold border-none outline-none appearance-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
              style={{ colorScheme: 'light' }}
            />
            <span className="absolute text-xs pointer-events-none right-3 bottom-3">📅</span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="px-6 mt-6">
        <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-xl shadow-blue-100 text-white text-center relative overflow-hidden">
          <div className="absolute w-40 h-40 rounded-full -top-10 -left-10 bg-white/10 blur-3xl"></div>
          <div className="absolute w-40 h-40 rounded-full -bottom-10 -right-10 bg-blue-400/20 blur-3xl"></div>

          <div className="relative z-10">
            <p className="mb-2 text-xs font-bold tracking-widest uppercase opacity-80">Total Netto Periode Ini</p>
            <h2 className="mb-4 text-3xl font-black">
              Rp {(summary.income - summary.expense).toLocaleString('id-ID')}
            </h2>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] font-black text-blue-200 uppercase mb-1">Pemasukan</p>
                <p className="text-sm font-black text-green-300">+ Rp {summary.income.toLocaleString('id-ID')}</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div>
                <p className="text-[10px] font-black text-blue-200 uppercase mb-1">Pengeluaran</p>
                <p className="text-sm font-black text-red-300">- Rp {summary.expense.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH BAR */}
      <div className="px-6 mt-6">
        <div className="relative group">
          <span className="absolute text-lg -translate-y-1/2 left-4 top-1/2 opacity-40">🔍</span>
          <input
            type="text"
            placeholder="Cari seblak, gaji, atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 text-sm font-bold text-gray-700 transition-all bg-white border-none shadow-sm outline-none rounded-2xl focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300 placeholder:font-normal"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-[10px] text-gray-400 font-black"
            >✕</button>
          )}
        </div>
      </div>

      {/* List Transaksi */}
      <div className="px-6 mt-8 space-y-3">
        <div className="flex items-center justify-between px-1 mb-4">
            <h3 className="text-lg font-black text-gray-800">Detail Transaksi</h3>
            <span className="bg-gray-200 text-gray-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                {filteredTransactions.length} Data
            </span>
        </div>

        {loading ? (
          <div className="py-20 text-xs font-bold tracking-widest text-center text-gray-400 uppercase animate-pulse">Sedang Memuat...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
            <p className="text-sm font-bold text-gray-400">
              {searchTerm ? 'Duh, kaga ketemu transaksinya ges 🕵️‍♂️' : 'Nggak ada riwayat di tanggal ini ges 🍃'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const isToday = new Date(t.date).toDateString() === new Date().toDateString();

            return (
                <div key={t.id} className="flex items-center justify-between p-4 transition-all bg-white border shadow-sm rounded-3xl border-gray-50 active:scale-[0.98] group relative">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl shadow-inner rounded-2xl"
                            style={{ backgroundColor: `${t.category?.color || '#3b82f6'}15`, color: t.category?.color || '#3b82f6' }}>
                            {t.category?.icon || '❓'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="w-24 text-sm font-black text-gray-800 truncate sm:w-48">
                                    {t.note || t.category?.name || 'Tanpa Catatan'}
                                </p>
                                {isToday && (
                                    <span className="text-[7px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Baru</span>
                                )}
                            </div>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border"
                                style={{
                                    backgroundColor: `${t.category?.color || '#3b82f6'}10`,
                                    borderColor: `${t.category?.color || '#3b82f6'}30`,
                                    color: t.category?.color || '#3b82f6'
                                }}>
                                {t.category?.name || t.type}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className={`font-black text-base ${t.type === 'pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                                {t.type === 'pemasukan' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => openEditModal(t)} className="flex items-center justify-center w-8 h-8 text-[10px] bg-gray-50 rounded-lg active:bg-blue-50 transition-colors">✏️</button>
                            <button onClick={() => setDeleteId(t.id)} className="flex items-center justify-center w-8 h-8 text-[10px] bg-gray-50 rounded-lg active:bg-red-50 transition-colors">🗑️</button>
                        </div>
                    </div>
                </div>
            );
          })
        )}
      </div>

      {/* MODAL EDIT TRANSAKSI */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 transition-all bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-6 pb-10 sm:pb-6 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between pt-2 pb-4 mb-2 bg-white">
                    <h2 className="text-xl font-black text-gray-800">Edit Catatan 📝</h2>
                    <button onClick={() => setEditingTransaction(null)} className="flex items-center justify-center font-bold text-gray-500 transition-transform bg-gray-100 rounded-full w-9 h-9 active:scale-95">✕</button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Nominal */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nominal</label>
                        <div className="relative mt-1">
                            <span className="absolute text-lg font-black text-gray-400 -translate-y-1/2 left-4 top-1/2">Rp</span>
                            <input
                                type="text"
                                value={displayEditAmount}
                                onChange={(e) => setDisplayEditAmount(formatRupiah(e.target.value))}
                                className="w-full p-4 pl-12 text-2xl font-black text-gray-700 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Pilih Kategori */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Kategori</label>
                        <div className="grid grid-cols-4 gap-3 p-1 mt-2 overflow-y-auto max-h-48">
                            {categories
                                .filter(c => c.type === editingTransaction.type)
                                .map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setEditingTransaction({...editingTransaction, category_id: cat.id})}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${
                                            editingTransaction.category_id === cat.id
                                            ? 'border-blue-500 bg-blue-50 scale-105 shadow-sm'
                                            : 'border-transparent bg-gray-50 opacity-60'
                                        }`}
                                    >
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="text-[9px] font-bold text-gray-600 truncate w-full text-center uppercase tracking-tighter">{cat.name}</span>
                                    </button>
                                ))
                            }
                        </div>
                    </div>

                    {/* Baris Tanggal & Note */}
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kapan?</label>
                            <input
                                type="date"
                                value={editingTransaction.date}
                                onClick={(e) => e.target.showPicker()}
                                onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
                                className="w-full p-4 mt-1 font-bold text-gray-700 border-none outline-none appearance-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
                                style={{ colorScheme: 'light' }}
                            />
                            <span className="absolute right-4 top-[2.4rem] pointer-events-none text-lg">📅</span>
                        </div>

                        {/* CATATAN DENGAN AUTO-COMPLETE */}
                        <div className="relative">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catatan</label>
                            <input
                                type="text"
                                value={editingTransaction.note || ''}
                                onChange={(e) => handleNoteChange(e.target.value)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                placeholder="Misal: Beli seblak mercon..."
                                className="w-full p-4 mt-1 font-medium text-gray-700 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
                            />
                            {showSuggestions && (
                                <div className="absolute left-0 right-0 z-[60] mt-1 overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-200">
                                    {filteredNotes.map((note, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setEditingTransaction({ ...editingTransaction, note: note });
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full p-4 text-xs font-bold text-left text-gray-600 border-b border-gray-50 last:border-none hover:bg-blue-50 active:bg-blue-100"
                                        >
                                            ✨ {note}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className={`w-full py-4 mt-2 font-black text-white transition-all rounded-2xl active:scale-95 shadow-xl ${
                            editingTransaction.type === 'pemasukan' ? 'bg-green-500 shadow-green-100' : 'bg-red-500 shadow-red-100'
                        }`}
                    >
                        {loading ? 'Sabar, lagi nyimpen...' : `Update ${editingTransaction.type}`}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem] animate-in zoom-in duration-300">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-4xl rounded-full bg-red-50">🗑️</div>
                <h3 className="mb-2 text-xl font-black text-gray-800">Hapus Catatan?</h3>
                <p className="mb-8 text-sm font-medium leading-relaxed text-gray-500">
                    Data transaksi ini bakal dihapus permanen dari riwayat kamu ges. Yakin?
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteId(null)} className="flex-1 py-4 text-xs font-black text-gray-400 transition-transform bg-gray-100 rounded-2xl active:scale-95">Batal</button>
                    <button onClick={() => { handleDelete(deleteId); setDeleteId(null); }} className="flex-1 py-4 text-xs font-black text-white transition-transform bg-red-500 shadow-lg shadow-red-100 rounded-2xl active:scale-95">Ya, Hapus</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}