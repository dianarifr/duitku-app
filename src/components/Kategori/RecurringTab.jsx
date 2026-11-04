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
      <div className="space-y-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
            <Icon.Zap size={10} strokeWidth={2.5} />
            <span>Double click buat edit</span>
          </div>
        </div>

        {recurringData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-line-strong bg-surface/60 py-16 text-center">
            <Icon.Search size={28} strokeWidth={2} className="text-muted opacity-40" />
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Tagihan tidak ditemukan ges</p>
          </div>
        ) : (
          recurringData.map((rec) => (
            <div
              key={rec.id}
              onDoubleClick={() => openEditRec(rec)}
              className={`panel flex cursor-pointer select-none flex-col p-4 transition-colors hover:border-line-strong ${rec.is_active === false ? 'opacity-60' : ''}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="icon-box shrink-0"
                    style={{
                      backgroundColor: `${rec.category?.color || '#94a3b8'}15`,
                      color: rec.category?.color || '#64748b'
                    }}
                  >
                    {rec.category?.icon || <Icon.Repeat size={18} strokeWidth={2} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`truncate text-sm font-semibold uppercase tracking-tight ${rec.is_active === false ? 'text-muted line-through' : 'text-ink'}`}>
                      {rec.note}
                    </h4>
                    <p className="truncate font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                      Tgl {rec.billing_date} • {rec.category?.name || 'Umum'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleRecurringActive(rec.id, rec.is_active); }}
                    className={`relative h-5 w-10 rounded-full border transition-colors ${rec.is_active !== false ? 'border-accent bg-accent' : 'border-line bg-surface-alt'}`}
                    aria-label="Aktifkan / nonaktifkan tagihan rutin"
                  >
                    <div className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-paper transition-all ${rec.is_active !== false ? 'left-6' : 'left-1'}`} />
                  </button>

                  <div className="text-right">
                    <p className={`font-mono text-sm font-medium tabular-nums ${rec.is_active === false ? 'text-muted' : 'text-ink'}`}>
                      {formatNominal(rec.amount)}
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
                      {rec.is_active !== false ? 'Aktif' : 'Nonaktif'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setDeleteRecId(rec.id); }}
                className="flex w-full items-center justify-center gap-2 border border-line py-2.5 font-mono text-[9px] uppercase tracking-[0.08em] text-danger transition-colors hover:bg-surface-alt active:scale-[0.99]"
              >
                <Icon.Trash2 size={12} strokeWidth={2.5} />
                Hapus tagihan rutin
              </button>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM RECURRING */}
      {isRecModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-xs border border-line bg-surface p-6 animate-in slide-in-from-bottom-10 sm:rounded-xs">
            <div className="mb-6 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2">
                {editingId ? <Icon.Pencil size={18} strokeWidth={2} className="text-accent" /> : <Icon.Sparkles size={18} strokeWidth={2} className="text-accent" />}
                <h2 className="font-serif text-xl font-semibold text-ink">
                  {editingId ? 'Edit rutin' : 'Tagihan rutin'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRecModalOpen(false)}
                className="btn btn-icon h-9 w-9"
                aria-label="Tutup"
              >
                <Icon.X size={17} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSaveRecurring} className="space-y-5 text-left">
              <div>
                <label className="field-label">Nama tagihan</label>
                <input type="text" value={recFormData.note} onChange={(e) => setRecFormData({ ...recFormData, note: e.target.value })} placeholder="Contoh: Netflix / Internet" className="field font-sans" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Nominal</label>
                  <input type="text" value={displayRecAmount} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayRecAmount(val);
                    setRecFormData({ ...recFormData, amount: parseNumber(val) });
                  }} className="field font-sans" placeholder="Rp 0" required />
                </div>

                <div>
                  <label className="field-label">Tgl tagihan</label>
                  <div className="relative">
                    <select
                      value={recFormData.billing_date}
                      onChange={(e) => setRecFormData({ ...recFormData, billing_date: Number(e.target.value) })}
                      className="field cursor-pointer appearance-none pr-9"
                      required
                    >
                      <option value="" disabled className="text-muted">Pilih tanggal</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1} className="font-bold text-ink">
                          Tanggal {i + 1}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
                      <Icon.ChevronDown size={12} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="field-label mb-0">Kategori</label>
                  <div className="relative">
                    <Icon.Search size={10} strokeWidth={2.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={recCatSearch}
                      onChange={(e) => setRecCatSearch(e.target.value)}
                      className="field min-h-8 w-32 py-1.5 pl-7 pr-2 text-[10px]"
                    />
                  </div>
                </div>

                <div className="custom-scrollbar grid max-h-44 grid-cols-2 gap-2.5 overflow-y-auto pr-1">
                  {categories.filter(c => c.name.toLowerCase().includes(recCatSearch.toLowerCase())).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRecFormData({ ...recFormData, category_id: cat.id })}
                      className={`flex items-center gap-2.5 border p-2.5 transition-colors ${recFormData.category_id === cat.id ? 'border-accent bg-surface-alt' : 'border-line bg-surface hover:bg-surface-alt'}`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <p className="truncate text-[10px] font-semibold uppercase tracking-tight text-ink-soft">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                <Icon.CheckCircle2 size={18} strokeWidth={2.5} />
                Simpan tagihan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE RECURRING */}
      {deleteRecId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-5 animate-in fade-in">
          <div className="w-full max-w-xs border border-line bg-surface p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-danger">
              <Icon.Repeat size={26} strokeWidth={2} />
            </div>
            <h3 className="mb-2 font-serif text-xl font-semibold text-ink">Hapus rutin?</h3>
            <p className="mb-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.06em] text-muted">Gak diingetin lagi tiap bulan,<br/>ges.</p>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setDeleteRecId(null)} className="btn flex-1 text-xs">Batal</button>
              <button type="button" onClick={handleDeleteRecurring} className="btn btn-danger flex-1 text-xs">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}