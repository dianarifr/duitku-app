import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah, parseNumber } from '../utils/formatters';

export default function Kategori({ session, setCurrentPage }) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recurringData, setRecurringData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State UI
  const [activeTab, setActiveTab] = useState('list'); // 'list' atau 'recurring'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteRecId, setDeleteRecId] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, title: '', message: '' });
  const [displayBudget, setDisplayBudget] = useState('');
  const [displayRecAmount, setDisplayRecAmount] = useState('');

  const nameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', type: 'pengeluaran', icon: '🍔', color: '#3B82F6', budget: 0,
  });

  const [recFormData, setRecFormData] = useState({
    category_id: '', amount: 0, note: '', billing_date: 1, payment_method: 'transfer'
  });

  const colorOptions = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  const fetchData = async () => {
    setLoading(true);
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    // Fetch Kategori
    const { data: catData } = await supabase.from('category').select('*').is('deleted_at', null).order('created_at', { ascending: false });

    // Fetch Transaksi (buat hitung budget)
    const { data: transData } = await supabase.from('transaction').select('amount, category_id').is('deleted_at', null).gte('date', firstDay);

    // Fetch Recurring
    const { data: recData } = await supabase.from('recurring_transactions').select('*, category(name, icon)').order('billing_date', { ascending: true });

    setCategories(catData || []);
    setTransactions(transData || []);
    setRecurringData(recData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIKA KATEGORI ---
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setShowAlert({ show: true, title: 'Nama Kosong!', message: 'Kasih nama kategorinya dulu dong! 🏷️' });
      return;
    }
    const payload = { ...formData, user_id: session.user.id, budget: formData.type === 'pengeluaran' ? Number(formData.budget) : 0 };

    if (editingId) {
      await supabase.from('category').update({ ...payload, updated_at: new Date() }).eq('id', editingId);
    } else {
      await supabase.from('category').insert([payload]);
    }
    setIsModalOpen(false);
    resetForm();
    fetchData();
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'pengeluaran', icon: '🍔', color: '#3B82F6', budget: 0 });
    setDisplayBudget('');
    setEditingId(null);
  };

  // --- LOGIKA RECURRING ---
  const handleSaveRecurring = async (e) => {
    e.preventDefault();
    if (!recFormData.category_id || !recFormData.note) return alert('Lengkapi data dulu ges!');

    const payload = { ...recFormData, user_id: session.user.id };

    if (editingId) {
      await supabase.from('recurring_transactions').update(payload).eq('id', editingId);
    } else {
      await supabase.from('recurring_transactions').insert([payload]);
    }
    setIsRecModalOpen(false);
    setEditingId(null);
    setRecFormData({ category_id: '', amount: 0, note: '', billing_date: 1, payment_method: 'transfer' });
    setDisplayRecAmount('');
    fetchData();
  };

  const openEditRec = (rec) => {
    setEditingId(rec.id);
    setRecFormData({
      category_id: rec.category_id,
      amount: rec.amount,
      note: rec.note,
      billing_date: rec.billing_date,
      payment_method: rec.payment_method
    });
    setDisplayRecAmount(formatRupiah(rec.amount.toString()));
    setIsRecModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-24 font-sans bg-gray-50">
      {/* HEADER & TAB FIXED */}
      <div className="sticky top-0 z-40 bg-white shadow-sm rounded-b-[2.5rem] px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('dashboard')} className="flex items-center justify-center w-10 h-10 font-bold text-gray-600 bg-gray-100 rounded-2xl active:scale-90">←</button>
            <h1 className="text-xl font-black tracking-tight text-gray-800 uppercase">Pengaturan</h1>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'list') { resetForm(); setIsModalOpen(true); }
              else { setEditingId(null); setIsRecModalOpen(true); }
            }}
            className="flex items-center justify-center w-10 h-10 text-2xl font-bold text-white bg-blue-600 shadow-md rounded-2xl active:scale-95"
          >
            +
          </button>
        </div>

        <div className="flex p-1.5 bg-gray-100 rounded-2xl">
          <button onClick={() => setActiveTab('list')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>📂 Kategori</button>
          <button onClick={() => setActiveTab('recurring')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'recurring' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>🔄 Rutin</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        {activeTab === 'list' ? (
          /* TAB KATEGORI */
          <div className="space-y-4">
            {categories.map((cat) => {
              const used = transactions.filter(t => t.category_id === cat.id).reduce((sum, item) => sum + item.amount, 0);
              const percent = cat.budget > 0 ? Math.min((used / cat.budget) * 100, 100) : 0;
              return (
                <div key={cat.id} className="p-5 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-2xl" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                      <div>
                        <h4 className="text-sm font-black tracking-tight text-gray-800">{cat.name}</h4>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{cat.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(cat)} className="p-2 text-gray-400 hover:text-blue-500">✏️</button>
                      <button onClick={() => setDeleteId(cat.id)} className="p-2 text-gray-400 hover:text-red-500">🗑️</button>
                    </div>
                  </div>
                  {cat.type === 'pengeluaran' && cat.budget > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: cat.color }} />
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                        <span>Pake: Rp {used.toLocaleString('id-ID')}</span>
                        <span>Limit: Rp {cat.budget.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* TAB RECURRING (TAGIHAN RUTIN) */
          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Daftar Pengingat Rutin</p>
            {recurringData.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                <p className="text-sm font-bold text-gray-300">Belum ada tagihan rutin ges 🍃</p>
              </div>
            ) : (
              recurringData.map((rec) => (
                <div key={rec.id} className="p-5 bg-white border border-gray-100 shadow-sm rounded-[2rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 text-2xl bg-gray-50 rounded-2xl">{rec.category?.icon}</div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight text-gray-800 uppercase">{rec.note}</h4>
                      <p className="text-[9px] font-bold text-blue-500 uppercase">Tiap Tgl {rec.billing_date} • {rec.payment_method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-800">Rp {rec.amount.toLocaleString('id-ID')}</p>
                    <div className="flex justify-end gap-2 mt-1">
                      <button onClick={() => openEditRec(rec)} className="text-[10px] font-black text-blue-400 uppercase">Edit</button>
                      <button onClick={() => setDeleteRecId(rec.id)} className="text-[10px] font-black text-red-400 uppercase">Hapus</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL FORM RECURRING (NEW) */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-8 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight text-gray-800 uppercase">{editingId ? 'Edit Rutin 🔄' : 'Tagihan Rutin ✨'}</h2>
              <button onClick={() => setIsRecModalOpen(false)} className="w-8 h-8 font-bold text-gray-500 bg-gray-100 rounded-full active:scale-95">✕</button>
            </div>
            <form onSubmit={handleSaveRecurring} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nama Tagihan</label>
                <input type="text" value={recFormData.note} onChange={(e) => setRecFormData({ ...recFormData, note: e.target.value })} placeholder="Misal: Netflix / Kos" className="w-full p-4 mt-1 text-sm font-bold border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nominal</label>
                  <input type="text" value={displayRecAmount} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayRecAmount(val);
                    setRecFormData({ ...recFormData, amount: parseNumber(val) });
                  }} className="w-full p-4 mt-1 text-sm font-black border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="Rp 0" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tgl Tagihan</label>
                  <input type="number" min="1" max="31" value={recFormData.billing_date} onChange={(e) => setRecFormData({ ...recFormData, billing_date: e.target.value })} className="w-full p-4 mt-1 text-sm font-black border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Kategori</label>
                <select value={recFormData.category_id} onChange={(e) => setRecFormData({ ...recFormData, category_id: e.target.value })} className="w-full p-4 mt-1 text-sm font-bold border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Pilih Kategori...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-4 font-black text-white uppercase transition-transform bg-blue-600 shadow-xl rounded-2xl shadow-blue-100 active:scale-95">Simpan Pengingat</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KATEGORI & LAINNYA (TETAP ADA) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 transition-all sm:items-center bg-black/40 backdrop-blur-sm sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-8 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight text-gray-800 uppercase">{editingId ? 'Edit Kategori 📝' : 'Kategori Baru ✨'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 font-bold text-gray-500 bg-gray-100 rounded-full active:scale-95">✕</button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="flex p-1 bg-gray-100 rounded-2xl">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'pengeluaran' })} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl ${formData.type === 'pengeluaran' ? 'bg-white shadow-sm text-red-500' : 'text-gray-400'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'pemasukan' })} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl ${formData.type === 'pemasukan' ? 'bg-white shadow-sm text-green-500' : 'text-gray-400'}`}>Pemasukan</button>
              </div>
              <div className="flex gap-3">
                <div className="w-1/4">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Icon</label>
                  <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full p-4 mt-1 text-2xl text-center border-none outline-none bg-gray-50 rounded-2xl" maxLength="2" required />
                </div>
                <div className="w-3/4">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nama</label>
                  <input ref={nameInputRef} type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Jajan" className="w-full p-4 mt-1 text-sm font-bold border-none outline-none bg-gray-50 rounded-2xl" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Warna</label>
                <div className="flex gap-3 mt-2">
                  {colorOptions.map(color => (
                    <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'scale-125 ring-2 ring-blue-400' : 'opacity-40'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              {formData.type === 'pengeluaran' && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Budget</label>
                  <input type="text" value={displayBudget} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayBudget(val);
                    setFormData({ ...formData, budget: parseNumber(val) });
                  }} placeholder="Rp 0" className="w-full p-4 mt-1 text-sm font-black border-none outline-none bg-gray-50 rounded-2xl" />
                </div>
              )}
              <button type="submit" className="w-full py-4 mt-2 font-black text-white uppercase bg-blue-600 shadow-xl rounded-2xl shadow-blue-100 active:scale-95">Simpan Kategori</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE RECURRING (NEW) */}
      {deleteRecId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem]">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-3xl rounded-full bg-red-50">🗑️</div>
            <h3 className="mb-2 text-xl font-black text-gray-800">Hapus Rutin?</h3>
            <p className="mb-8 text-sm font-medium leading-relaxed text-gray-400">Tagihan ini nggak bakal diingetin lagi tiap bulan ges.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRecId(null)} className="flex-1 py-4 text-xs font-black text-gray-400 bg-gray-50 rounded-2xl active:scale-95">Batal</button>
              <button onClick={async () => {
                await supabase.from('recurring_transactions').delete().eq('id', deleteRecId);
                setDeleteRecId(null);
                fetchData();
              }} className="flex-1 py-4 text-xs font-black text-white bg-red-500 shadow-lg shadow-red-100 rounded-2xl active:scale-95">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* (Modal delete kategori tetap ada, silakan sesuaikan dengan pola yang sama) */}
    </div>
  );
}