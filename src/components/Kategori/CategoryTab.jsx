import { formatRupiah, parseNumber, formatNominal } from '../../utils/formatters';

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
      {/* CARD SIKLUS GAJIAN */}
      <div className="mb-6">
        <div className="relative p-6 overflow-hidden text-white shadow-xl bg-gradient-to-br from-blue-600 to-blue-700 rounded-4xl">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Siklus Gajian</p>
              <h3 className="text-lg italic font-black">Tgl {payday}</h3>
            </div>
            <div className="relative">
              <select
                value={payday}
                onChange={(e) => onUpdatePayday(Number(e.target.value))}
                className="px-4 py-2 pr-8 text-xs font-black border-none outline-none appearance-none bg-white/20 rounded-xl"
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i+1} value={i+1} className="text-gray-800">Tgl {i+1}</option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px]">▼</span>
            </div>
          </div>
          {/* Ornamen */}
          <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/10 blur-2xl"></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-blue-400 uppercase italic animate-pulse">
            ⚡ Double Click buat edit
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-widest">Kategori tidak ditemukan ges 🕵️‍♂️</div>
        ) : (
          categories.map((cat) => {
            const used = transactions.filter(t => t.category_id === cat.id).reduce((sum, item) => sum + item.amount, 0);
            const rawPercent = cat.budget > 0 ? (used / cat.budget) * 100 : 0;
            const barWidth = Math.min(rawPercent, 100);
            const isOver = used > cat.budget;

            return (
              <div key={cat.id} onDoubleClick={() => openEditModal(cat)} className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl active:scale-[0.98] transition-all cursor-pointer select-none hover:border-blue-300 hover:shadow-md group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="icon-box" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight text-gray-800 uppercase">{cat.name}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {/* Menggunakan formatNominal */}
                        Limit: {formatNominal(cat.budget)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[7px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${cat.type === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                  </span>
                </div>

                {cat.type === 'pengeluaran' && cat.budget > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2 px-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest opacity-60">Terpakai:</span>
                        <span className={`text-[10px] font-black ${isOver ? 'text-red-500' : 'text-gray-700'}`}>
                          {/* Menggunakan formatNominal */}
                          {formatNominal(used)}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black italic ${isOver ? 'text-red-500' : 'text-blue-500'}`}>
                        {Math.round(rawPercent)}%
                      </span>
                    </div>

                    <div className="w-full h-2 overflow-hidden border border-gray-100 rounded-full bg-gray-50">
                      <div
                        className="h-full transition-all duration-1000 rounded-full"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: isOver ? '#EF4444' : (Math.round(rawPercent) > 80 ? '#f59e0b' : cat.color)
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(cat.id); }}
                  className="w-full mt-5 py-3 bg-red-50/50 text-red-400 text-[9px] font-black uppercase rounded-xl active:scale-95 transition-all border border-red-50"
                >
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
          <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-t-4xl sm:rounded-3xl animate-in slide-in-from-bottom-10">
            <div className="flex items-center justify-between px-1 mb-6">
              <h2 className="text-xl italic font-black tracking-tight text-gray-800 uppercase">
                {editingId ? 'Edit Kategori 📝' : 'Kategori Baru ✨'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="flex items-center justify-center font-bold text-gray-400 transition-all rounded-full w-9 h-9 bg-gray-50 active:scale-95">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-5 text-left">
              <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'pengeluaran' })} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${formData.type === 'pengeluaran' ? 'bg-white shadow-sm text-red-500' : 'text-gray-400'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'pemasukan' })} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${formData.type === 'pemasukan' ? 'bg-white shadow-sm text-green-500' : 'text-gray-400'}`}>Pemasukan</button>
              </div>

              <div className="flex gap-4">
                <div className="w-1/4">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Icon</label>
                  <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="w-full p-4 mt-2 text-2xl text-center transition-colors border-none outline-none bg-gray-50 rounded-2xl focus:bg-gray-100" maxLength="2" required />
                </div>
                <div className="w-3/4">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Nama</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Misal: Jajan Sore" className="w-full p-4 mt-2 text-sm font-black transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Warna Identitas</label>
                <div className="grid grid-cols-7 gap-3 px-1 mt-3">
                  {colorOptions.map(color => (
                    <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={`aspect-square w-full rounded-full transition-all duration-300 ${formData.color === color ? 'scale-125 ring-4 ring-blue-100' : 'opacity-40 hover:opacity-100 hover:scale-110'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              {formData.type === 'pengeluaran' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Budget Bulanan</label>
                  <div className="relative">
                    <input type="text" value={displayBudget} onChange={(e) => {
                      const val = formatRupiah(e.target.value);
                      setDisplayBudget(val);
                      setFormData({ ...formData, budget: parseNumber(val) });
                    }} placeholder="Rp 0" className="w-full p-4 mt-2 text-sm font-black transition-all border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-5 mt-4 font-black tracking-widest text-white uppercase transition-all bg-blue-600 shadow-xl shadow-blue-100 rounded-2xl active:scale-95">
                Simpan Kategori
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE KATEGORI */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-4xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl text-red-500 rounded-full bg-red-50">🗑️</div>
            <h3 className="mb-2 text-xl italic font-black text-gray-800 uppercase">Hapus Kategori?</h3>
            <p className="mb-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Akan disembunyikan dari daftar,<br/>ges 🤝</p>
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