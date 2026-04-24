import { formatRupiah, parseNumber } from '../../utils/formatters';

export default function RecurringTab({ recurringData, categories, hook }) {
  const {
    isRecModalOpen, setIsRecModalOpen,
    deleteRecId, setDeleteRecId,
    editingId,
    recFormData, setRecFormData,
    displayRecAmount, setDisplayRecAmount,
    recCatSearch, setRecCatSearch,
    openEditRec,
    handleSaveRecurring, handleDeleteRecurring, handleToggleRecurringActive
  } = hook;

  return (
    <>
      <div className="space-y-4">
        {recurringData.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 font-black text-[10px] text-gray-400 uppercase">Tagihan tidak ditemukan ges 🕵️‍♂️</div>
        ) : (
          recurringData.map((rec) => (
            <div key={rec.id} onDoubleClick={() => openEditRec(rec)} className={`p-5 border shadow-sm rounded-[2rem] flex flex-col transition-all cursor-pointer select-none ${rec.is_active === false ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-2xl shrink-0" style={{ backgroundColor: `${rec.category?.color || '#94a3b8'}15`, color: rec.category?.color || '#64748b' }}>
                    {rec.category?.icon || '🔄'}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className={`text-sm font-black tracking-tight uppercase truncate ${rec.is_active === false ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{rec.note}</h4>
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest truncate">Tgl {rec.billing_date} • {rec.category?.name || 'Umum'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleToggleRecurringActive(rec.id, rec.is_active); }} className={`w-10 h-5 rounded-full transition-colors relative ${rec.is_active !== false ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rec.is_active !== false ? 'left-6' : 'left-1'}`} />
                  </button>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-800">Rp {rec.amount.toLocaleString('id-ID')}</p>
                    <p className="text-[7px] font-black text-gray-300 uppercase tracking-tighter">{rec.is_active !== false ? 'Aktif' : 'Nonaktif'}</p>
                  </div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setDeleteRecId(rec.id); }} className="w-full py-2.5 bg-red-50 text-red-400 text-[9px] font-black uppercase rounded-xl active:scale-95 transition-all">
                🗑️ Hapus Tagihan Rutin
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM RECURRING */}
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
    </>
  );
}