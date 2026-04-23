import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah, parseNumber, getFinancialRange } from '../utils/formatters';

export default function Kategori({ session, setCurrentPage }) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recurringData, setRecurringData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Profile (Payday)
  const [userProfile, setUserProfile] = useState({ payday: 1 });

  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteRecId, setDeleteRecId] = useState(null);
  const [displayBudget, setDisplayBudget] = useState('');
  const [displayRecAmount, setDisplayRecAmount] = useState('');

  // Search States
  const [catListSearch, setCatListSearch] = useState(''); // Search di tab Kategori
  const [recListSearch, setRecListSearch] = useState(''); // Search di tab Rutin
  const [recCatSearch, setRecCatSearch] = useState('');   // Search di modal pilih kategori

  const [formData, setFormData] = useState({
    name: '', type: 'pengeluaran', icon: '🍔', color: '#3B82F6', budget: 0,
  });

  const [recFormData, setRecFormData] = useState({
    category_id: '', amount: 0, note: '', billing_date: 1, payment_method: 'transfer'
  });

  const colorOptions = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('payday')
      .eq('id', session.user.id)
      .single();

    if (data) return data.payday;

    const { data: newData } = await supabase
      .from('profiles')
      .upsert({ id: session.user.id, payday: 1 })
      .select()
      .single();
    return newData?.payday || 1;
  };

  const fetchData = async (currentPayday) => {
    setLoading(true);
    const { start } = getFinancialRange(currentPayday || userProfile.payday);

    const { data: catData } = await supabase.from('category').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    const { data: transData } = await supabase.from('transaction').select('amount, category_id').is('deleted_at', null).gte('date', start);
    const { data: recData } = await supabase.from('recurring_transactions').select('*, category(*)').order('billing_date', { ascending: true });

    setCategories(catData || []);
    setTransactions(transData || []);
    setRecurringData(recData || []);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const payday = await fetchUserProfile();
      setUserProfile({ payday });
      fetchData(payday);
    };
    init();
  }, []);

  const handleUpdatePayday = async (newPayday) => {
    const { error } = await supabase
      .from('profiles')
      .update({ payday: newPayday })
      .eq('id', session.user.id);

    if (!error) {
      setUserProfile({ payday: newPayday });
      fetchData(newPayday);
    }
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name, type: cat.type, icon: cat.icon, color: cat.color, budget: cat.budget || 0
    });
    setDisplayBudget(cat.budget ? formatRupiah(cat.budget.toString()) : '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Nama kategori wajib diisi!');
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
    setRecCatSearch('');
    setIsRecModalOpen(true);
  };

  // Logic Filtering untuk List
  const filteredCategoryList = categories.filter(cat =>
    cat.name.toLowerCase().includes(catListSearch.toLowerCase())
  );

  const filteredRecurringList = recurringData.filter(rec =>
    rec.note.toLowerCase().includes(recListSearch.toLowerCase()) ||
    rec.category?.name.toLowerCase().includes(recListSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-900 bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white shadow-sm rounded-b-[2.5rem] px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage('dashboard')} className="flex items-center justify-center w-10 h-10 font-bold text-gray-600 transition-transform bg-gray-100 rounded-2xl active:scale-90">←</button>
            <h1 className="text-xl font-black tracking-tight text-gray-800 uppercase">Pengaturan</h1>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'list') { resetForm(); setIsModalOpen(true); }
              else { setEditingId(null); setRecCatSearch(''); setIsRecModalOpen(true); }
            }}
            className="flex items-center justify-center w-10 h-10 text-2xl font-bold text-white transition-all bg-blue-600 shadow-md rounded-2xl active:scale-95"
          >
            +
          </button>
        </div>

        {/* SEARCH BAR DINAMIS */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder={activeTab === 'list' ? "Cari kategori..." : "Cari tagihan rutin..."}
            value={activeTab === 'list' ? catListSearch : recListSearch}
            onChange={(e) => activeTab === 'list' ? setCatListSearch(e.target.value) : setRecListSearch(e.target.value)}
            className="w-full p-4 pl-12 text-sm font-bold transition-all bg-gray-100 border-none outline-none rounded-2xl focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
          />
          <span className="absolute text-lg -translate-y-1/2 left-4 top-1/2 opacity-30">🔍</span>
        </div>

        <div className="flex p-1.5 bg-gray-100 rounded-2xl">
          <button onClick={() => setActiveTab('list')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>📂 Kategori</button>
          <button onClick={() => setActiveTab('recurring')} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'recurring' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>🔄 Rutin</button>
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'list' ? (
          <>
            {/* CARD SIKLUS GAJIAN */}
            <div className="mb-6">
                <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 transition-all">
                    <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase opacity-70 tracking-[0.2em]">Siklus Gajian</p>
                            <h3 className="text-lg font-black leading-tight">Mulai Tiap Tgl {userProfile.payday}</h3>
                            <p className="text-[9px] font-medium opacity-60">Budget direset otomatis setiap tanggal ini.</p>
                        </div>
                        <div className="relative">
                            <select
                                value={userProfile.payday}
                                onChange={(e) => handleUpdatePayday(Number(e.target.value))}
                                className="px-5 py-3 pr-10 text-xs font-black transition-all border-none outline-none appearance-none cursor-pointer bg-white/20 hover:bg-white/30 rounded-2xl backdrop-blur-md"
                            >
                                {[...Array(31)].map((_, i) => (
                                    <option key={i+1} value={i+1} className="font-bold text-gray-800">Tgl {i+1}</option>
                                ))}
                            </select>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-[10px]">▼</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredCategoryList.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-widest">Kategori tidak ditemukan ges 🕵️‍♂️</div>
                ) : (
                filteredCategoryList.map((cat) => {
                    const used = transactions.filter(t => t.category_id === cat.id).reduce((sum, item) => sum + item.amount, 0);
                    const percent = cat.budget > 0 ? Math.min((used / cat.budget) * 100, 100) : 0;
                    return (
                    <div key={cat.id} className="p-5 bg-white border border-gray-100 shadow-sm rounded-[2rem] relative overflow-hidden active:scale-[0.98] transition-transform">
                        <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-2xl" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-black tracking-tight">{cat.name}</h4>
                                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                                    cat.type === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                                    </span>
                                </div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Limit: Rp {cat.budget?.toLocaleString('id-ID') || 0}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => openEditModal(cat)} className="p-2 text-gray-400 transition-colors hover:text-blue-500">✏️</button>
                            <button onClick={() => setDeleteId(cat.id)} className="p-2 text-gray-400 transition-colors hover:text-red-500">🗑️</button>
                        </div>
                        </div>
                        {cat.type === 'pengeluaran' && cat.budget > 0 && (
                        <div className="mt-4 space-y-2">
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full transition-all duration-700" style={{ width: `${percent}%`, backgroundColor: cat.color }} />
                            </div>
                            <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                            <span>Pake: Rp {used.toLocaleString('id-ID')}</span>
                            <span className={percent >= 90 ? 'text-red-500 font-black' : ''}>{percent.toFixed(0)}%</span>
                            </div>
                        </div>
                        )}
                    </div>
                    );
                })
                )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {filteredRecurringList.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-widest">Tagihan tidak ditemukan ges 🕵️‍♂️</div>
            ) : (
                filteredRecurringList.map((rec) => (
                    <div key={rec.id} className="p-5 bg-white border border-gray-100 shadow-sm rounded-[2rem] flex items-center justify-between active:scale-[0.98] transition-transform">
                        <div className="flex items-center gap-4 overflow-hidden">
                        <div
                            className="flex items-center justify-center w-12 h-12 text-2xl rounded-2xl shrink-0"
                            style={{
                            backgroundColor: `${rec.category?.color || '#94a3b8'}15`,
                            color: rec.category?.color || '#64748b'
                            }}
                        >
                            {rec.category?.icon || '🔄'}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-black tracking-tight text-gray-800 uppercase truncate">{rec.note}</h4>
                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest truncate">Tgl {rec.billing_date} • {rec.category?.name || 'Umum'}</p>
                        </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                            <p className="mb-1 text-sm font-black leading-none text-gray-800">Rp {rec.amount.toLocaleString('id-ID')}</p>
                            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">{rec.payment_method}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button onClick={() => openEditRec(rec)} className="p-2 text-xs text-gray-400 transition-colors rounded-lg bg-gray-50 hover:text-blue-500">✏️</button>
                            <button onClick={() => setDeleteRecId(rec.id)} className="p-2 text-xs text-gray-400 transition-colors rounded-lg bg-gray-50 hover:text-red-500">🗑️</button>
                        </div>
                        </div>
                    </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* MODAL KATEGORI */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-end justify-center p-0 transition-all z-[110] sm:items-center bg-black/40 backdrop-blur-sm sm:p-4">
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
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Icon</label>
                  <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full p-4 mt-1 text-2xl text-center transition-colors border-none outline-none bg-gray-50 rounded-2xl focus:bg-gray-100" maxLength="2" required />
                </div>
                <div className="w-3/4">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nama</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Jajan" className="w-full p-4 mt-1 text-sm font-bold transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Warna</label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`aspect-square w-full rounded-full transition-all ${formData.color === color ? 'scale-110 ring-2 ring-blue-400 ring-offset-2' : 'opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              {formData.type === 'pengeluaran' && (
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Budget Bulanan</label>
                  <input type="text" value={displayBudget} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayBudget(val);
                    setFormData({ ...formData, budget: parseNumber(val) });
                  }} placeholder="Rp 0" className="w-full p-4 mt-1 text-sm font-black transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              <button type="submit" className="w-full py-4 mt-2 font-black text-white uppercase transition-all bg-blue-600 shadow-xl rounded-2xl active:scale-95">Simpan Kategori</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RECURRING */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-8 shadow-2xl animate-slide-up max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight text-gray-800 uppercase">{editingId ? 'Edit Rutin 🔄' : 'Tagihan Rutin ✨'}</h2>
              <button onClick={() => setIsRecModalOpen(false)} className="w-8 h-8 font-bold text-gray-500 transition-transform bg-gray-100 rounded-full active:scale-95">✕</button>
            </div>
            <form onSubmit={handleSaveRecurring} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nama Tagihan</label>
                <input type="text" value={recFormData.note} onChange={(e) => setRecFormData({ ...recFormData, note: e.target.value })} placeholder="Misal: Netflix / Kos" className="w-full p-4 mt-1 text-sm font-bold transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Nominal</label>
                  <input type="text" value={displayRecAmount} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayRecAmount(val);
                    setRecFormData({ ...recFormData, amount: parseNumber(val) });
                  }} className="w-full p-4 mt-1 text-sm font-black transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="Rp 0" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Tgl Tagihan</label>
                  <input type="number" min="1" max="31" value={recFormData.billing_date} onChange={(e) => setRecFormData({ ...recFormData, billing_date: Number(e.target.value) })} className="w-full p-4 mt-1 text-sm font-black transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</label>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={recCatSearch}
                    onChange={(e) => setRecCatSearch(e.target.value)}
                    className="text-[10px] bg-gray-100 border-none rounded-xl px-3 py-1.5 outline-none w-28 focus:w-36 focus:bg-gray-200 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 overflow-y-auto max-h-48 custom-scrollbar">
                  {categories
                    .filter(c => c.name.toLowerCase().includes(recCatSearch.toLowerCase()))
                    .map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setRecFormData({ ...recFormData, category_id: cat.id })}
                        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                          recFormData.category_id === cat.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-transparent bg-gray-50'
                        }`}
                      >
                        <span className="flex-shrink-0 text-xl">{cat.icon}</span>
                        <div className="overflow-hidden text-ellipsis">
                          <p className="text-[9px] font-black uppercase truncate leading-tight mb-1 text-gray-700">{cat.name}</p>
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                            cat.type === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <button type="submit" className="w-full py-5 font-black text-white uppercase bg-blue-600 shadow-xl rounded-[1.5rem] active:scale-95 transition-all mt-4">
                {editingId ? 'Simpan Perubahan' : 'Simpan Pengingat'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE KATEGORI */}
      {deleteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem]">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-3xl rounded-full bg-red-50">🗑️</div>
            <h3 className="mb-2 text-xl font-black tracking-tight text-gray-800">Hapus Kategori?</h3>
            <p className="px-2 mb-8 text-sm font-medium leading-relaxed text-gray-400">Kategori ini bakal disembunyiin dari daftar transaksi ges.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 text-xs font-black text-gray-400 bg-gray-50 rounded-2xl active:scale-95">Batal</button>
              <button onClick={async () => {
                await supabase.from('category').update({ deleted_at: new Date() }).eq('id', deleteId);
                setDeleteId(null);
                fetchData();
              }} className="flex-1 py-4 text-xs font-black text-white transition-all bg-red-500 shadow-lg rounded-2xl active:scale-95">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE RECURRING */}
      {deleteRecId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem]">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-3xl rounded-full bg-red-50">🗑️</div>
            <h3 className="mb-2 text-xl font-black tracking-tight text-gray-800">Hapus Rutin?</h3>
            <p className="mb-8 text-sm font-medium leading-relaxed text-gray-400 text-gray-500">Tagihan ini nggak bakal diingetin lagi tiap bulan ges.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRecId(null)} className="flex-1 py-4 text-xs font-black text-gray-400 transition-transform bg-gray-50 rounded-2xl active:scale-95">Batal</button>
              <button onClick={async () => {
                await supabase.from('recurring_transactions').delete().eq('id', deleteRecId);
                setDeleteRecId(null);
                fetchData();
              }} className="flex-1 py-4 text-xs font-black text-white transition-all bg-red-500 shadow-lg rounded-2xl active:scale-95">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      ` }} />
    </div>
  );
}