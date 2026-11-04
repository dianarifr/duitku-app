import { useInputMutasi } from '../hooks/useInputMutasi';
import * as Icon from '../lib/icons';

export default function InputMutasi({ session, setCurrentPage, editData, setEditData }) {
  const {
    loading, formData, setFormData, displayAmount, categories,
    handleAmountChange, handleSave
  } = useInputMutasi(session, setCurrentPage, editData, setEditData);

  return (
    <div className="min-h-screen bg-paper pb-10 font-sans">
      <div className="border-b border-line border-t-2 border-t-focus bg-surface px-5 pb-6 pt-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (typeof setEditData === 'function') setEditData(null);
                setCurrentPage('laporan');
              }}
              className="btn btn-icon shrink-0"
              aria-label="Kembali"
            >
              <Icon.ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <Icon.ArrowLeftRight size={16} strokeWidth={2} className="shrink-0 text-mut" />
              <h1 className="truncate font-serif text-xl font-semibold tracking-tight text-ink">
                {editData ? 'Ubah mutasi' : 'Mutasi saldo'}
              </h1>
            </div>
          </div>

          <div className="relative flex h-9 w-40 shrink-0 overflow-hidden border border-line bg-surface-alt p-1">
            <div className={`absolute bottom-1 top-1 w-[calc(50%-4px)] bg-surface transition-all duration-300 ease-in-out ${formData.source === 'cash' ? 'translate-x-full' : 'translate-x-0'}`} />

            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, source: 'transfer'}))}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-[0.04em] transition-colors ${formData.source === 'transfer' ? 'text-focus' : 'text-muted'}`}
            >
              <Icon.Landmark size={10} strokeWidth={2.5} />
              Bank
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, source: 'cash'}))}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-[0.04em] transition-colors ${formData.source === 'cash' ? 'text-focus' : 'text-muted'}`}
            >
              <Icon.Wallet size={10} strokeWidth={2.5} />
              Cash
            </button>
          </div>
        </div>

        <div className="px-0.5">
          <p className="field-label">Nominal mutasi</p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-semibold text-muted">Rp</span>
            <input
              type="text"
              placeholder="0"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full bg-transparent font-serif text-4xl font-semibold tracking-tight text-ink outline-none placeholder:text-muted/50"
              autoFocus
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-7 p-5 pt-6">
        <div className="space-y-2.5">
          <label className="field-label ml-0.5">Pilih kategori</label>
          <div className="custom-scrollbar grid max-h-64 grid-cols-4 gap-2.5 overflow-y-auto p-0.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({...formData, category_id: cat.id})}
                className={`flex flex-col items-center gap-2 border py-3.5 transition-all ${formData.category_id === cat.id ? 'border-focus bg-surface-alt' : 'border-line bg-surface hover:bg-surface-alt'}`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`w-full truncate px-1.5 text-center font-mono text-[8px] uppercase tracking-[0.04em] ${formData.category_id === cat.id ? 'text-ink' : 'text-muted'}`}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label">Tanggal</label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onClick={(e) => e.target.showPicker()}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="field pr-11"
              />
              <span className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-10 items-center justify-center border-l border-line text-muted">
                <Icon.Calendar size={16} strokeWidth={2} />
              </span>
            </div>
          </div>
        </div>

        <div className="text-left">
          <label className="field-label">Catatan</label>
          <input type="text" placeholder="Contoh: tarik tunai" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="field font-sans" />
        </div>

        <button disabled={loading} className={`btn mt-2 w-full border-0 bg-focus py-4 text-base font-semibold text-accent-ink hover:bg-focus active:scale-[0.99] ${loading ? 'opacity-50' : ''}`}>
          {loading ? (
            'Memproses...'
          ) : (
            <>
              <Icon.CheckCircle2 size={20} strokeWidth={2.5} />
              {editData ? 'Simpan perubahan' : 'Konfirmasi mutasi'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
