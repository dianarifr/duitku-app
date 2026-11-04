import { useRef } from 'react';
import { useInputTransaksi } from '../hooks/useInputTransaksi';
import * as Icon from '../lib/icons';

export default function InputTransaksi({ session, setCurrentPage, type: initialType, editData, setEditData }) {
  const amountInputRef = useRef(null);

  const {
    categories, loading, activeTab, setActiveTab, displayAmount,
    filteredSuggestions, setFilteredSuggestions, showSuggestions, setShowSuggestions,
    categoryFilter, setCategoryFilter, isShaking,
    formData, setFormData, handleAmountChange, handleSave, suggestions
  } = useInputTransaksi(session, editData, setEditData, setCurrentPage, initialType);

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, note: value });
    if (value.length > 1) {
      const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const isIncome = activeTab === 'pemasukan';
  const methodLabel = { cash: 'Cash', transfer: 'Transfer' };

  return (
    <div className="min-h-screen bg-paper pb-10 font-sans">
      <div className={`border-b border-line bg-surface px-5 pb-6 pt-8 transition-colors duration-300 ${isIncome ? 'border-t-2 border-t-pos' : 'border-t-2 border-t-neg'}`}>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => { if(setEditData) setEditData(null); setCurrentPage(editData ? 'laporan' : 'dashboard'); }}
              className="btn btn-icon shrink-0"
              aria-label="Kembali"
            >
              <Icon.ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <h1 className="truncate font-serif text-xl font-semibold tracking-tight text-ink">
              {editData ? 'Ubah catatan' : activeTab === 'pemasukan' ? 'Catat pemasukan' : 'Catat pengeluaran'}
            </h1>
          </div>
          {!editData && (
            <div className="relative flex h-9 w-40 shrink-0 overflow-hidden border border-line bg-surface-alt p-1">
              <div className={`absolute bottom-1 top-1 w-[calc(50%-4px)] bg-surface transition-transform duration-300 ${isIncome ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`} />
              <button type="button" onClick={() => setActiveTab('pengeluaran')} className={`relative z-10 flex flex-1 items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-[0.04em] ${!isIncome ? 'text-neg' : 'text-muted'}`}>
                <Icon.TrendingDown size={10} strokeWidth={2.5} /> Keluar
              </button>
              <button type="button" onClick={() => setActiveTab('pemasukan')} className={`relative z-10 flex flex-1 items-center justify-center gap-1 font-mono text-[9px] uppercase tracking-[0.04em] ${isIncome ? 'text-pos' : 'text-muted'}`}>
                <Icon.TrendingUp size={10} strokeWidth={2.5} /> Masuk
              </button>
            </div>
          )}
        </div>

        <div className="px-0.5">
          <p className="field-label">Nominal transaksi</p>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-semibold text-muted">Rp</span>
            <input
              ref={amountInputRef}
              type="text"
              placeholder="0"
              value={displayAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full bg-transparent font-serif text-4xl font-semibold tracking-tight text-ink outline-none placeholder:text-muted/50"
              autoFocus={!editData}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-7 p-5 pt-6">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <label className="field-label mb-0">Pilih kategori</label>
            {categories.length > 8 && (
              <div className="relative">
                <Icon.Search size={10} strokeWidth={2.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input type="text" placeholder="Cari..." value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="field min-h-8 w-28 py-1.5 pl-7 pr-2 text-[10px] focus:w-36" />
              </div>
            )}
          </div>
          <div className={`grid ${categories.length > 0 ? 'grid-cols-4' : 'grid-cols-1'} max-h-64 gap-2.5 overflow-y-auto p-0.5 custom-scrollbar`} style={isShaking ? { animation: 'shake 0.1s ease-in-out 0s 10' } : {}}>
            {categories.length > 0 ? (
              categories.filter(c => c.name.toLowerCase().includes(categoryFilter.toLowerCase())).map((cat) => (
                <button key={cat.id} type="button" onClick={() => setFormData({...formData, category_id: cat.id})} className={`flex flex-col items-center gap-2 border py-3.5 transition-all ${formData.category_id === cat.id ? (isIncome ? 'border-pos bg-pos/10' : 'border-neg bg-neg/10') : 'border-line bg-surface hover:bg-surface-alt'}`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <span className={`w-full truncate px-1.5 text-center font-mono text-[8px] uppercase tracking-[0.04em] ${formData.category_id === cat.id ? (isIncome ? 'text-pos' : 'text-neg') : 'text-muted'}`}>{cat.name}</span>
                </button>
              ))
            ) : (
              <button type="button" onClick={() => setCurrentPage('kategori')} className="flex flex-col items-center border border-dashed border-line-strong bg-surface p-8 text-center transition-colors hover:bg-surface-alt active:scale-[0.99]">
                <Icon.LayoutGrid size={30} strokeWidth={2} className="mb-2 text-muted" />
                <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.06em] text-muted">Belum ada kategori {activeTab}.<br/>Ketuk untuk membuat kategori.</p>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 text-left sm:grid-cols-2">
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
          <div>
            <label className="field-label">Metode</label>
            <div className="flex gap-2">
              {['cash', 'transfer'].map((method) => (
                <button key={method} type="button" onClick={() => setFormData({ ...formData, payment_method: method })} className={`flex flex-1 items-center justify-center gap-2 border py-3 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${formData.payment_method === method ? 'border-focus bg-surface-alt text-ink' : 'border-line bg-surface text-muted'}`}>
                  {method === 'cash' ? <Icon.Wallet size={14} strokeWidth={2} /> : <Icon.Landmark size={14} strokeWidth={2} />} {methodLabel[method]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative text-left">
          <label className="field-label">Catatan</label>
          <input type="text" placeholder="Contoh: makan siang" value={formData.note} onChange={handleNoteChange} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="field font-sans" />
          {showSuggestions && (
            <div className="absolute z-50 mt-1 w-full overflow-hidden border border-line bg-surface shadow-lg">
              {filteredSuggestions.map((suggestion, index) => (
                <button key={index} type="button" onClick={() => { setFormData({ ...formData, note: suggestion }); setShowSuggestions(false); }} className="flex w-full items-center gap-2 border-b border-line px-3 py-3 text-left font-mono text-[10px] uppercase text-muted last:border-none hover:bg-surface-alt">
                  <Icon.Sparkles size={12} strokeWidth={2} className="text-accent" /> {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <button disabled={loading} className={`btn mt-2 w-full border-0 py-4 text-base font-semibold text-accent-ink active:scale-[0.99] ${isIncome ? 'bg-pos hover:bg-pos' : 'bg-neg hover:bg-neg'} ${loading ? 'opacity-50' : ''}`}>
          {loading ? 'Menyimpan...' : (
            <>
              <Icon.CheckCircle2 size={20} strokeWidth={2.5} />
              {editData ? 'Simpan perubahan' : activeTab === 'pemasukan' ? 'Simpan pemasukan' : 'Simpan pengeluaran'}
            </>
          )}
        </button>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 50% { transform: translateX(8px); } 75% { transform: translateX(-8px); } }` }} />
    </div>
  );
}
