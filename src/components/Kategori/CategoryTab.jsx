import React from 'react';
import { formatRupiah, parseNumber, formatNominal } from '../../utils/formatters';
import * as Icon from '../../lib/icons';

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
      <div className="mb-5">
        <div className="panel flex items-center justify-between gap-3 p-4">
          <div>
            <p className="section-label">Siklus gajian</p>
            <h3 className="mt-1 font-serif text-lg font-semibold text-ink">Tanggal {payday}</h3>
          </div>
          <div className="relative">
            <select
              value={payday}
              onChange={(e) => onUpdatePayday(Number(e.target.value))}
              className="field min-h-9 w-28 cursor-pointer appearance-none pr-8 text-[11px]"
            >
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1} className="text-ink">Tgl {i+1}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              <Icon.ChevronDown size={12} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
            <Icon.Zap size={10} strokeWidth={2.5} />
            <span>Double click buat edit</span>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-line-strong bg-surface/60 py-16 text-center">
            <Icon.Search size={28} strokeWidth={2} className="text-muted opacity-40" />
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Kategori tidak ditemukan ges</p>
          </div>
        ) : (
          categories.map((cat) => {
            const used = transactions.filter(t => t.category_id === cat.id).reduce((sum, item) => sum + item.amount, 0);
            const rawPercent = cat.budget > 0 ? (used / cat.budget) * 100 : 0;
            const barWidth = Math.min(rawPercent, 100);
            const isOver = used > cat.budget;

            return (
              <div key={cat.id} onDoubleClick={() => openEditModal(cat)} className="panel cursor-pointer select-none p-4 transition-colors hover:border-line-strong active:scale-[0.99]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="icon-box shrink-0" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                      {cat.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold uppercase tracking-tight text-ink">{cat.name}</h4>
                      <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                        Limit: {formatNominal(cat.budget)}
                      </p>
                    </div>
                  </div>
                  <span className={`badge shrink-0 border-0 px-2 py-1 text-[8px] ${cat.type === 'pemasukan' ? 'bg-pos/10 text-pos' : 'bg-neg/10 text-neg'}`}>
                    {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                  </span>
                </div>

                {cat.type === 'pengeluaran' && cat.budget > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between px-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted">Terpakai:</span>
                        <span className={`font-mono text-[10px] tabular-nums ${isOver ? 'text-neg' : 'text-ink-soft'}`}>
                          {formatNominal(used)}
                        </span>
                      </div>
                      <span className={`font-mono text-[10px] ${isOver ? 'text-neg' : 'text-muted'}`}>
                        {Math.round(rawPercent)}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full border border-line bg-surface-alt">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: isOver ? '#b34a32' : (Math.round(rawPercent) > 80 ? '#b07a2a' : cat.color)
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(cat.id); }}
                  className="mt-4 flex w-full items-center justify-center gap-2 border border-line py-2.5 font-mono text-[9px] uppercase tracking-[0.08em] text-danger transition-colors hover:bg-surface-alt active:scale-[0.99]"
                >
                  <Icon.Trash2 size={12} strokeWidth={2.5} />
                  Hapus kategori
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL FORM KATEGORI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-xs border border-line bg-surface p-6 animate-in slide-in-from-bottom-10 sm:rounded-xs">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {editingId ? <Icon.Pencil size={18} strokeWidth={2} className="text-accent" /> : <Icon.Sparkles size={18} strokeWidth={2} className="text-accent" />}
                <h2 className="font-serif text-xl font-semibold text-ink">
                  {editingId ? 'Edit kategori' : 'Kategori baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn btn-icon h-9 w-9"
                aria-label="Tutup"
              >
                <Icon.X size={17} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-5 text-left">
              <div className="flex border border-line bg-surface p-1">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'pengeluaran' })} className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${formData.type === 'pengeluaran' ? 'bg-ink text-paper' : 'text-muted'}`}>Pengeluaran</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'pemasukan' })} className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${formData.type === 'pemasukan' ? 'bg-ink text-paper' : 'text-muted'}`}>Pemasukan</button>
              </div>

              <div className="flex gap-3">
                <div className="w-1/4">
                  <label className="field-label">Ikon</label>
                  <input type="text" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="field text-center text-2xl" maxLength="2" required />
                </div>
                <div className="w-3/4">
                  <label className="field-label">Nama</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Misal: Jajan Sore" className="field font-sans" required />
                </div>
              </div>

              <div>
                <label className="field-label">Warna identitas</label>
                <div className="mt-2 grid grid-cols-7 gap-2.5">
                  {colorOptions.map(color => (
                    <button key={color} type="button" onClick={() => setFormData({ ...formData, color })} className={`aspect-square w-full rounded-full transition-all duration-300 ${formData.color === color ? 'scale-110 ring-2 ring-accent ring-offset-2 ring-offset-surface' : 'opacity-50 hover:opacity-100 hover:scale-105'}`} style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>

              {formData.type === 'pengeluaran' && (
                <div>
                  <label className="field-label">Budget bulanan</label>
                  <input type="text" value={displayBudget} onChange={(e) => {
                    const val = formatRupiah(e.target.value);
                    setDisplayBudget(val);
                    setFormData({ ...formData, budget: parseNumber(val) });
                  }} placeholder="Rp 0" className="field font-sans" />
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full">
                <Icon.CheckCircle2 size={18} strokeWidth={2.5} />
                Simpan kategori
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE KATEGORI */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-5 animate-in fade-in">
          <div className="w-full max-w-xs border border-line bg-surface p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-danger">
              <Icon.Trash2 size={26} strokeWidth={2} />
            </div>
            <h3 className="mb-2 font-serif text-xl font-semibold text-ink">Hapus kategori?</h3>
            <p className="mb-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.06em] text-muted">
              Akan disembunyikan dari daftar,<br/>ges.
            </p>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setDeleteId(null)} className="btn flex-1 text-xs">Batal</button>
              <button type="button" onClick={handleDeleteCategory} className="btn btn-danger flex-1 text-xs">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}