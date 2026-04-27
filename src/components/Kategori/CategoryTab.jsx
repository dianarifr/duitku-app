import { formatRupiah, parseNumber } from '../../utils/formatters';

const colorOptions = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function CategoryTab({
  payday, onUpdatePayday, categories, transactions, hook
}) {
  const {
    isModalOpen, setIsModalOpen,
    deleteId, setDeleteId,
    editingId,
    formData, setFormData,
    displayBudget, setDisplayBudget,
    openEditModal,
    handleSaveCategory, handleDeleteCategory
  } = hook;

  return (
    <>
      <div className="mb-6">
        <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase opacity-70">Siklus Gajian</p>
              <h3 className="text-lg font-black">Tgl {payday}</h3>
            </div>
            <select
              value={payday}
              onChange={(e) => onUpdatePayday(Number(e.target.value))}
              className="px-4 py-2 text-xs font-black border-none outline-none appearance-none bg-white/20 rounded-xl"
            >
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1} className="text-gray-800">Tgl {i+1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-blue-400 uppercase italic animate-pulse">
            ⚡ Double Click buat edit
          </span>
        </div>
        {categories.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 font-black text-[10px] text-gray-400 uppercase">Kategori tidak ditemukan ges 🕵️‍♂️</div>
        ) : (
          categories.map((cat) => {
            // Hitung total terpakai
            const used = transactions.filter(t => t.category_id === cat.id).reduce((sum, item) => sum + item.amount, 0);

            // Hitung persentase asli (bisa lebih dari 100)
            const rawPercent = cat.budget > 0 ? (used / cat.budget) * 100 : 0;

            // Limit persentase untuk lebar bar (maks 100)
            const barWidth = Math.min(rawPercent, 100);
            const isOver = used > cat.budget;
            return (
              <div key={cat.id} onDoubleClick={() => openEditModal(cat)} className="p-5 bg-white border border-gray-100 shadow-sm rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer select-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-2xl" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                    <div>
                      <h4 className="text-sm font-black text-gray-800 uppercase">{cat.name}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Limit: Rp {cat.budget?.toLocaleString('id-ID') || 0}</p>
                    </div>
                  </div>
                  <span className={`text-[7px] font-black px-2 py-1 rounded-md uppercase ${cat.type === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                  </span>
                </div>
                {cat.type === 'pengeluaran' && cat.budget > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Terpakai:</span>
                        <span className="text-[10px] font-black text-gray-700">
                          Rp {used.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black italic ${isOver ? 'text-red-500' : 'text-blue-500'}`}>
                        {Math.round(rawPercent)}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: isOver ? '#EF4444' : cat.color
                        }}
                      />
                    </div>
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(cat.id); }} className="w-full mt-4 py-3 bg-red-50 text-red-400 text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all">
                  🗑️ Hapus Kategori
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL FORM KATEGORI */}
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
    </>
  );
}