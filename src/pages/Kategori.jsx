import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah, parseNumber } from '../utils/formatters';

export default function Kategori({ session, setCurrentPage }) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, title: '', message: '' });
  const [displayBudget, setDisplayBudget] = useState('');

  // Ref untuk Auto Focus
  const nameInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'pengeluaran',
    icon: '🍔',
    color: '#3B82F6',
    budget: 0,
  });

  const colorOptions = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: transData } = await supabase
        .from('transaction')
        .select('amount, category_id')
        .is('deleted_at', null)
        .gte('date', firstDay);

    if (error) console.error('Gagal narik data:', error.message);
    else {
        setCategories(data || []);
        setTransactions(transData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    // Validasi Nama Kosong
    if (!formData.name.trim()) {
      setShowAlert({
        show: true,
        title: 'Nama Kosong!',
        message: 'Kasih nama kategorinya dulu dong, biar nggak bingung! 🏷️'
      });
      return;
    }

    const userId = session.user.id;
    const payload = {
      user_id: userId,
      name: formData.name,
      type: formData.type,
      icon: formData.icon,
      color: formData.color,
      budget: formData.type === 'pengeluaran' ? Number(formData.budget) : 0,
    };

    if (editingId) {
      const { error } = await supabase
        .from('category')
        .update({ ...payload, updated_at: new Date() })
        .eq('id', editingId);
      if (error) alert('Gagal update: ' + error.message);
    } else {
      const { error } = await supabase
        .from('category')
        .insert([payload]);
      if (error) alert('Gagal nambah: ' + error.message);
    }

    setIsModalOpen(false);
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('category')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) alert('Gagal hapus: ' + error.message);
    else fetchCategories();
  };

  const openEditModal = (cat) => {
    setFormData({
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
      budget: cat.budget,
    });
    setDisplayBudget(formatRupiah(cat.budget));
    setEditingId(cat.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'pengeluaran', icon: '🍔', color: '#3B82F6', budget: 0 });
    setDisplayBudget('');
    setEditingId(null);
  };

  const getUsage = (catId) => {
    return transactions
      .filter(t => t.category_id === catId)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="min-h-screen pb-24 font-sans bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-12 pb-6 bg-white shadow-sm">
            <div className="flex items-center gap-3">
            <button
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center justify-center w-10 h-10 text-lg font-bold text-gray-600 transition-transform bg-gray-100 rounded-2xl active:scale-95"
            >
                ←
            </button>
            <div>
                <h1 className="text-2xl font-extrabold text-gray-800">Kategori 📂</h1>
                <p className="mt-1 text-xs font-medium text-gray-500">Atur pos-pos keuanganmu</p>
            </div>
            </div>
            <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center w-10 h-10 text-2xl font-bold text-white transition-transform bg-blue-600 shadow-md rounded-2xl shadow-blue-200 active:scale-95"
            >
            +
            </button>
        </div>

        {/* List Kategori */}
        <div className="p-4 space-y-4">
          {categories.map((cat) => {
              const used = getUsage(cat.id);
              const remaining = cat.budget - used;
              const percent = cat.budget > 0 ? Math.min((used / cat.budget) * 100, 100) : 0;
              const isOver = used > cat.budget;

              return (
                <div key={cat.id} className="relative p-5 overflow-hidden transition-all bg-white border border-gray-100 shadow-sm rounded-3xl hover:shadow-md">
                    <div className="absolute w-24 h-24 rounded-full -top-6 -right-6 opacity-10 blur-2xl" style={{ backgroundColor: cat.color }}></div>
                    <div className="relative z-10 flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 text-2xl shadow-sm rounded-2xl" style={{ backgroundColor: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                            {cat.icon}
                        </div>
                        <div>
                            <h4 className="text-sm font-black tracking-tight text-gray-800">{cat.name}</h4>
                            <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.type}</p>
                            </div>
                        </div>
                        </div>
                        <div className="flex gap-1">
                        <button onClick={() => openEditModal(cat)} className="p-2 text-gray-400 transition-colors hover:text-blue-500 hover:bg-blue-50 rounded-xl">✏️</button>
                        <button onClick={() => setDeleteId(cat.id)} className="p-2 text-gray-400 transition-colors hover:text-red-500 hover:bg-red-50 rounded-xl">🗑️</button>
                        </div>
                    </div>

                    {cat.type === 'pengeluaran' && cat.budget > 0 && (
                        <div className="relative z-10 space-y-3">
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Terpakai</span>
                            <span className="text-sm font-black text-gray-800">Rp {used.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex flex-col text-right">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Sisa</span>
                            <span className={`text-sm font-black ${isOver ? "text-red-500" : "text-gray-800"}`}>
                                {isOver ? '-' : ''}Rp {Math.abs(remaining).toLocaleString('id-ID')}
                            </span>
                            </div>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                            <div className={`h-full transition-all duration-700 ease-out rounded-full ${isOver ? 'bg-red-500' : ''}`} style={{ width: `${percent}%`, backgroundColor: !isOver ? cat.color : undefined, boxShadow: !isOver ? `0 0 10px ${cat.color}40` : 'none' }} />
                        </div>
                        {isOver && <p className="text-[9px] font-bold text-red-500 bg-red-50 p-1.5 rounded-lg text-center animate-pulse">⚠️ WADUH, BUDGET JEBOL NIH BOS!</p>}
                        </div>
                    )}
                </div>
              );
          })}
        </div>

        {/* Modal Delete */}
        {deleteId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-xs p-6 text-center duration-200 bg-white shadow-xl rounded-3xl animate-in fade-in zoom-in">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl rounded-full bg-red-50">⚠️</div>
                    <h3 className="mb-2 text-lg font-bold text-gray-800">Hapus Kategori?</h3>
                    <p className="mb-6 text-sm leading-relaxed text-gray-500 text-pretty">Tenang, data transaksi lama kamu nggak akan hilang kok.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteId(null)} className="flex-1 py-3 text-sm font-bold text-gray-500 transition-transform bg-gray-100 rounded-xl active:scale-95">Batal</button>
                        <button onClick={() => { handleDelete(deleteId); setDeleteId(null); }} className="flex-1 py-3 text-sm font-bold text-white transition-transform bg-red-500 shadow-lg rounded-xl shadow-red-100 active:scale-95">Ya, Hapus</button>
                    </div>
                </div>
            </div>
        )}

        {/* CUSTOM ALERT (SWEETALERT CLONE) */}
        {showAlert.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem] animate-in zoom-in duration-300">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-4xl rounded-full bg-orange-50 animate-bounce">🤔</div>
              <h3 className="mb-2 text-xl font-black text-gray-800">{showAlert.title}</h3>
              <p className="mb-8 text-sm font-medium leading-relaxed text-gray-500">{showAlert.message}</p>
              <button
                onClick={() => {
                  setShowAlert({ ...showAlert, show: false });
                  setTimeout(() => nameInputRef.current?.focus(), 100);
                }}
                className="w-full py-4 text-sm font-black text-white transition-transform bg-blue-600 shadow-lg rounded-2xl shadow-blue-100 active:scale-95"
              >
                Oke, Siap!
              </button>
            </div>
          </div>
        )}

        {/* MODAL FORM */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-0 transition-all bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
                <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 pb-10 sm:pb-6 shadow-2xl animate-slide-up">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">{editingId ? 'Edit Kategori 📝' : 'Kategori Baru ✨'}</h2>
                        <button onClick={() => setIsModalOpen(false)} className="flex items-center justify-center w-8 h-8 font-bold text-gray-500 bg-gray-100 rounded-full active:scale-95">✕</button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            <button type="button" onClick={() => setFormData({ ...formData, type: 'pengeluaran' })} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'pengeluaran' ? 'bg-white shadow-sm text-red-500' : 'text-gray-400'}`}>Pengeluaran</button>
                            <button type="button" onClick={() => setFormData({ ...formData, type: 'pemasukan' })} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'pemasukan' ? 'bg-white shadow-sm text-green-500' : 'text-gray-400'}`}>Pemasukan</button>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-1/4">
                                <label className="ml-1 text-xs font-bold tracking-tighter text-gray-500 uppercase">Icon</label>
                                <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full p-3 mt-1 text-2xl text-center border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none" maxLength="2" required />
                            </div>
                            <div className="w-3/4">
                                <label className="ml-1 text-xs font-bold tracking-tighter text-gray-500 uppercase">Nama Kategori</label>
                                <input
                                  ref={nameInputRef}
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  placeholder="Contoh: Jajan Kopi"
                                  className="w-full p-3 mt-1 text-sm font-bold border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="ml-1 text-xs font-bold tracking-tighter text-gray-500 uppercase">Warna Tema</label>
                            <div className="flex gap-2.5 mt-2">
                                {colorOptions.map(color => (
                                    <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'scale-125 ring-2 ring-offset-2 ring-blue-400' : 'opacity-60'}`} style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        </div>

                        {formData.type === 'pengeluaran' && (
                            <div>
                                <label className="ml-1 text-xs font-bold tracking-tighter text-gray-500 uppercase">Anggaran Bulanan</label>
                                <div className="relative mt-1">
                                    <span className="absolute text-sm font-bold text-gray-400 left-4 top-3">Rp</span>
                                    <input
                                        type="text"
                                        value={displayBudget}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const formatted = formatRupiah(val);
                                          setDisplayBudget(formatted);
                                          setFormData({ ...formData, budget: parseNumber(formatted) });
                                        }}
                                        placeholder="0"
                                        className="w-full p-3 pl-12 text-sm font-black border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full py-4 mt-2 font-black text-white transition-transform bg-blue-600 shadow-lg rounded-2xl active:scale-95 shadow-blue-100">
                            {editingId ? 'Update Data' : 'Simpan Kategori'}
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}