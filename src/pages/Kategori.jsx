import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange, formatRupiah, parseNumber } from '../utils/formatters';

// IMPORT KOMPONEN MODULAR
import CategoryTab from '../components/Kategori/CategoryTab';
import RecurringTab from '../components/Kategori/RecurringTab';

export default function Kategori({ session, setCurrentPage }) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recurringData, setRecurringData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ payday: 1 });
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteRecId, setDeleteRecId] = useState(null);

  // Form States
  const [formData, setFormData] = useState({ name: '', type: 'pengeluaran', icon: '🍔', color: '#3B82F6', budget: 0 });
  const [recFormData, setRecFormData] = useState({ category_id: '', amount: 0, note: '', billing_date: 1, payment_method: 'transfer' });
  const [displayBudget, setDisplayBudget] = useState('');
  const [displayRecAmount, setDisplayRecAmount] = useState('');
  const [recCatSearch, setRecCatSearch] = useState('');

  const colorOptions = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    const init = async () => {
      const { data: profile } = await supabase.from('profiles').select('payday').eq('id', session.user.id).single();
      const pd = profile?.payday || 1;
      setUserProfile({ payday: pd });
      fetchData(pd);
    };
    init();
  }, []);

  const fetchData = async (pd) => {
    setLoading(true);
    const payday = pd || userProfile.payday;
    const { start } = getFinancialRange(payday);

    const [catRes, transRes, recRes] = await Promise.all([
      supabase.from('category').select('*').eq('user_id', session.user.id).is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('transaction').select('amount, category_id').eq('user_id', session.user.id).is('deleted_at', null).gte('date', start),
      supabase.from('recurring_transactions').select('*, category(*)').eq('user_id', session.user.id).order('billing_date', { ascending: true })
    ]);

    setCategories(catRes.data || []);
    setTransactions(transRes.data || []);
    setRecurringData(recRes.data || []);
    setLoading(false);
  };

  // --- HANDLERS ---

  const handleUpdatePayday = async (val) => {
    await supabase.from('profiles').update({ payday: val }).eq('id', session.user.id);
    setUserProfile({ payday: val });
    fetchData(val);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'pengeluaran', icon: '🍔', color: '#3B82F6', budget: 0 });
    setDisplayBudget('');
    setIsModalOpen(true);
  };

  const openAddRecModal = () => {
    setEditingId(null);
    setRecFormData({ category_id: '', amount: 0, note: '', billing_date: 1, payment_method: 'transfer' });
    setDisplayRecAmount('');
    setIsRecModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color, budget: cat.budget || 0 });
    setDisplayBudget(cat.budget ? formatRupiah(cat.budget.toString()) : '');
    setIsModalOpen(true);
  };

  const openEditRec = (rec) => {
    setEditingId(rec.id);
    setRecFormData({ category_id: rec.category_id, amount: rec.amount, note: rec.note, billing_date: rec.billing_date, payment_method: rec.payment_method });
    setDisplayRecAmount(formatRupiah(rec.amount.toString()));
    setIsRecModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const payload = { ...formData, user_id: session.user.id, budget: formData.type === 'pengeluaran' ? Number(formData.budget) : 0 };
    if (editingId) await supabase.from('category').update({ ...payload, updated_at: new Date() }).eq('id', editingId).eq('user_id', session.user.id);
    else await supabase.from('category').insert([payload]);
    setIsModalOpen(false); fetchData();
  };

  const handleSaveRecurring = async (e) => {
    e.preventDefault();
    const payload = { ...recFormData, user_id: session.user.id };
    if (editingId) await supabase.from('recurring_transactions').update(payload).eq('id', editingId).eq('user_id', session.user.id);
    else await supabase.from('recurring_transactions').insert([payload]);
    setIsRecModalOpen(false); fetchData();
  };

  const handleDeleteCategory = async () => {
    await supabase.from('category').update({ deleted_at: new Date() }).eq('id', deleteId).eq('user_id', session.user.id);
    setDeleteId(null); fetchData();
  };

  const handleDeleteRecurring = async () => {
    await supabase.from('recurring_transactions').delete().eq('id', deleteRecId).eq('user_id', session.user.id);
    setDeleteRecId(null); fetchData();
  };

  // Filters
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRecurring = recurringData.filter(r => r.note.toLowerCase().includes(searchTerm.toLowerCase()) || r.category?.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-900 bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white shadow-sm rounded-b-[2.5rem] px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('dashboard')} className="flex items-center justify-center w-10 h-10 text-lg font-bold text-gray-500 bg-gray-100 rounded-2xl active:scale-90">←</button>
            <h1 className="text-xl font-black tracking-tight uppercase">Pengaturan</h1>
          </div>
          <button
            onClick={() => activeTab === 'list' ? openAddModal() : openAddRecModal()}
            className="w-10 h-10 text-2xl font-bold text-white bg-blue-600 shadow-md rounded-2xl active:scale-90"
          >
            +
          </button>
        </div>

        <div className="relative mb-4">
          <input type="text" placeholder="Cari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 pl-12 text-sm font-bold bg-gray-100 border-none outline-none rounded-2xl focus:ring-2 focus:ring-blue-500" />
          <span className="absolute text-xs -translate-y-1/2 left-4 top-1/2 opacity-30">🔍</span>
        </div>

        <div className="flex p-1.5 bg-gray-100 rounded-2xl">
          <button onClick={() => setActiveTab('list')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>📂 Kategori</button>
          <button onClick={() => setActiveTab('recurring')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'recurring' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>🔄 Rutin</button>
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'list' ? (
          <CategoryTab
            payday={userProfile.payday}
            categories={filteredCategories}
            transactions={transactions}
            onUpdatePayday={handleUpdatePayday}
            onEdit={openEditModal}
            onDelete={(id) => setDeleteId(id)}
          />
        ) : (
          <RecurringTab
            recurringData={filteredRecurring}
            onEdit={openEditRec}
            onDelete={(id) => setDeleteRecId(id)}
          />
        )}
      </div>

      {/* --- MODALS --- */}

      {/* MODAL KATEGORI */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-end justify-center z-[110] bg-black/40 backdrop-blur-sm p-0 sm:items-center sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight text-gray-800 uppercase">{editingId ? 'Edit Kategori 📝' : 'Kategori Baru ✨'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 font-bold text-gray-500 bg-gray-100 rounded-full active:scale-95">✕</button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-left">
              <div className="flex p-1 bg-gray-100 rounded-2xl">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'pengeluaran' })} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl ${formData.type === 'pengeluaran' ? 'bg-white shadow-sm text-red-500' : 'text-gray-400'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'pemasukan' })} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl ${formData.type === 'pemasukan' ? 'bg-white shadow-sm text-green-500' : 'text-gray-400'}`}>Pemasukan</button>
              </div>
              <div className="flex gap-3">
                <div className="w-1/4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Icon</label>
                  <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full p-4 mt-1 text-2xl text-center border-none outline-none bg-gray-50 rounded-2xl focus:bg-gray-100" maxLength="2" required />
                </div>
                <div className="w-3/4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Jajan" className="w-full p-4 mt-1 text-sm font-bold border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warna</label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={`aspect-square w-full rounded-full transition-all ${formData.color === color ? 'scale-110 ring-2 ring-blue-400 ring-offset-2' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              {formData.type === 'pengeluaran' && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Budget Bulanan</label>
                  <input type="text" value={displayBudget} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayBudget(val);
                    setFormData({ ...formData, budget: parseNumber(val) });
                  }} placeholder="Rp 0" className="w-full p-4 mt-1 text-sm font-black border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <button type="submit" className="w-full py-4 mt-2 font-black text-white uppercase bg-blue-600 shadow-xl rounded-2xl active:scale-95">Simpan Kategori</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RECURRING */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 sm:items-center sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 text-left">
              <h2 className="text-xl font-black tracking-tight text-gray-800 uppercase">{editingId ? 'Edit Rutin 📝' : 'Tagihan Rutin ✨'}</h2>
              <button onClick={() => setIsRecModalOpen(false)} className="w-8 h-8 font-bold text-gray-500 bg-gray-100 rounded-full active:scale-95">✕</button>
            </div>
            <form onSubmit={handleSaveRecurring} className="space-y-5 text-left">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Tagihan</label>
                <input type="text" value={recFormData.note} onChange={(e) => setRecFormData({ ...recFormData, note: e.target.value })} placeholder="Netflix / Kos" className="w-full p-4 mt-1 text-sm font-bold border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nominal</label>
                  <input type="text" value={displayRecAmount} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayRecAmount(val);
                    setRecFormData({ ...recFormData, amount: parseNumber(val) });
                  }} className="w-full p-4 mt-1 text-sm font-black border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="Rp 0" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tgl Tagihan</label>
                  <input type="number" min="1" max="31" value={recFormData.billing_date} onChange={(e) => setRecFormData({ ...recFormData, billing_date: Number(e.target.value) })} className="w-full p-4 mt-1 text-sm font-black border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</label>
                  <input type="text" placeholder="Cari..." value={recCatSearch} onChange={(e) => setRecCatSearch(e.target.value)} className="text-[10px] bg-gray-100 border-none rounded-xl px-3 py-1.5 outline-none w-28 focus:bg-gray-200" />
                </div>
                <div className="grid grid-cols-2 gap-2 pr-1 overflow-y-auto max-h-48">
                  {categories.filter(c => c.name.toLowerCase().includes(recCatSearch.toLowerCase())).map((cat) => (
                    <button key={cat.id} type="button" onClick={() => setRecFormData({ ...recFormData, category_id: cat.id })} className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${recFormData.category_id === cat.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-50'}`}>
                      <span className="text-xl">{cat.icon}</span>
                      <p className="text-[9px] font-black uppercase truncate text-gray-700">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-5 font-black text-white uppercase transition-all bg-blue-600 shadow-xl rounded-2xl active:scale-95">Simpan</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE KATEGORI */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem]">
            <h3 className="mb-2 text-xl font-black text-gray-800 uppercase">Hapus Kategori?</h3>
            <p className="mb-8 text-[10px] font-bold text-gray-400 uppercase">Akan disembunyikan dari daftar, ges 🤝</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 text-[10px] font-black text-gray-400 bg-gray-50 rounded-2xl">Batal</button>
              <button onClick={handleDeleteCategory} className="flex-1 py-4 text-[10px] font-black text-white bg-red-500 rounded-2xl shadow-lg">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE RECURRING */}
      {deleteRecId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem]">
            <h3 className="mb-2 text-xl font-black text-gray-800 uppercase">Hapus Rutin?</h3>
            <p className="mb-8 text-[10px] font-bold text-gray-400 uppercase">Gak diingetin lagi tiap bulan, ges 🤏</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRecId(null)} className="flex-1 py-4 text-[10px] font-black text-gray-400 bg-gray-50 rounded-2xl">Batal</button>
              <button onClick={handleDeleteRecurring} className="flex-1 py-4 text-[10px] font-black text-white bg-red-500 rounded-2xl shadow-lg">Hapus</button>
            </div>
          </div>
        </div>
      )}

      <p className="text-center text-[8px] font-black text-gray-300 uppercase tracking-widest mt-8">
        💡 Klik 2x pada kartu untuk mengedit
      </p>
    </div>
  );
}