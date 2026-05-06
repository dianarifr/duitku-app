import { formatRupiah, parseNumber, formatNominal } from '../../utils/formatters';
import * as Icon from '../../lib/icons';

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
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[8px] font-bold text-blue-400 uppercase italic animate-pulse">
            <Icon.Zap size={10} strokeWidth={3} />
            <span>Double Click buat edit</span>
          </div>
        </div>

        {recurringData.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100 font-black text-[10px] text-gray-400 uppercase tracking-widest flex flex-col items-center justify-center gap-3">
            <Icon.Search size={32} strokeWidth={3} className="opacity-20" />
            Tagihan tidak ditemukan ges
          </div>
        ) : (
          recurringData.map((rec) => (
            <div
              key={rec.id}
              onDoubleClick={() => openEditRec(rec)}
              className={`p-5 border shadow-sm rounded-2xl flex flex-col transition-all cursor-pointer select-none hover:border-blue-300 hover:shadow-md group ${rec.is_active === false ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-50'}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div
                    className="flex items-center justify-center icon-box"
                    style={{
                      backgroundColor: `${rec.category?.color || '#94a3b8'}15`,
                      color: rec.category?.color || '#64748b'
                    }}
                  >
                    {rec.category?.icon || <Icon.Repeat size={18} strokeWidth={3} />}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className={`text-sm font-black tracking-tight uppercase truncate ${rec.is_active === false ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {rec.note}
                    </h4>
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.2em] truncate">
                      Tgl {rec.billing_date} • {rec.category?.name || 'Umum'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleRecurringActive(rec.id, rec.is_active); }}
                    className={`w-10 h-5 rounded-full transition-colors relative ${rec.is_active !== false ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${rec.is_active !== false ? 'left-6' : 'left-1'}`} />
                  </button>

                  <div className="text-right">
                    <p className={`text-sm font-black italic tracking-tight ${rec.is_active === false ? 'text-gray-400' : 'text-gray-900'}`}>
                      {formatNominal(rec.amount)}
                    </p>
                    <p className="text-[7px] font-black text-gray-300 uppercase tracking-widest">
                      {rec.is_active !== false ? 'Aktif' : 'Nonaktif'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setDeleteRecId(rec.id); }}
                className="w-full py-3 bg-red-50/50 text-red-400 text-[9px] font-black uppercase rounded-xl active:scale-95 transition-all border border-red-50 flex items-center justify-center gap-2"
              >
                <Icon.Trash2 size={12} strokeWidth={3} />
                Hapus Tagihan Rutin
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM RECURRING */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 backdrop-blur-sm p-0 sm:items-center sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-4xl sm:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-1 mb-8 text-left">
              <div className="flex items-center gap-2">
                {editingId ? <Icon.Pencil size={18} strokeWidth={3} className="text-blue-500" /> : <Icon.Sparkles size={18} strokeWidth={3} className="text-blue-500" />}
                <h2 className="text-xl italic font-black tracking-tight text-gray-800 uppercase">
                  {editingId ? 'Edit Rutin' : 'Tagihan Rutin'}
                </h2>
              </div>
              <button
                onClick={() => setIsRecModalOpen(false)}
                className="flex items-center justify-center text-gray-400 transition-all rounded-full w-9 h-9 bg-gray-50 active:scale-95 hover:bg-gray-100"
              >
                <Icon.X size={18} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleSaveRecurring} className="space-y-6 text-left">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Nama Tagihan</label>
                <input type="text" value={recFormData.note} onChange={(e) => setRecFormData({ ...recFormData, note: e.target.value })} placeholder="Contoh: Netflix / Internet" className="w-full p-4 mt-2 text-sm font-black transition-all border-none outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Nominal</label>
                  <input type="text" value={displayRecAmount} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayRecAmount(val);
                    setRecFormData({ ...recFormData, amount: parseNumber(val) });
                  }} className="w-full p-4 mt-2 text-sm font-black transition-all border-none outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Rp 0" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                    Tgl Tagihan
                  </label>
                  <div className="relative mt-1">
                    <select
                      value={recFormData.billing_date}
                      onChange={(e) => setRecFormData({ ...recFormData, billing_date: Number(e.target.value) })}
                      className="w-full p-4 pr-10 text-sm font-black border-none outline-none appearance-none cursor-pointer bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="" disabled className="text-gray-400">Pilih Tanggal</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1} className="font-bold text-gray-800">
                          Tanggal {i + 1}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 flex items-center opacity-50 pointer-events-none right-4">
                      <Icon.ChevronDown size={12} strokeWidth={4} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Kategori</label>
                  <div className="relative">
                    <Icon.Search size={10} strokeWidth={3} className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={recCatSearch}
                      onChange={(e) => setRecCatSearch(e.target.value)}
                      className="text-[9px] font-bold bg-gray-50 border border-gray-100 rounded-lg pl-7 pr-3 py-1.5 outline-none w-32 focus:bg-white focus:ring-1 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pr-1 overflow-y-auto max-h-44 custom-scrollbar">
                  {categories.filter(c => c.name.toLowerCase().includes(recCatSearch.toLowerCase())).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRecFormData({ ...recFormData, category_id: cat.id })}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${recFormData.category_id === cat.id ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <p className="text-[10px] font-black uppercase truncate text-gray-700 tracking-tight">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="flex items-center justify-center w-full gap-2 py-5 font-black tracking-widest text-white uppercase transition-all bg-blue-600 shadow-xl shadow-blue-100 rounded-xl active:scale-95">
                <Icon.CheckCircle2 size={18} strokeWidth={3} />
                Simpan Tagihan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE RECURRING */}
      {deleteRecId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs p-8 text-center bg-white border border-gray-100 shadow-2xl rounded-4xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-red-500 rounded-full bg-red-50">
              <Icon.Repeat size={32} strokeWidth={2.5} />
            </div>
            <h3 className="mb-2 text-xl italic font-black tracking-tight text-gray-800 uppercase">Hapus Rutin?</h3>
            <p className="mb-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Gak diingetin lagi tiap bulan,<br/>ges. 🤝</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRecId(null)} className="flex-1 py-4 text-[10px] font-black text-gray-400 bg-gray-50 rounded-2xl active:scale-95 transition-transform">Batal</button>
              <button onClick={handleDeleteRecurring} className="flex-1 py-4 text-[10px] font-black text-white bg-red-500 rounded-2xl shadow-lg active:scale-95 transition-transform">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}