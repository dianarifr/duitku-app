import { useState } from 'react';
import * as Icon from '../../lib/icons';

export default function LaporanHeader({
  onBack,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedMethod,
  setSelectedMethod
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper px-5 pb-4 pt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-icon shrink-0"
            aria-label="Kembali"
          >
            <Icon.ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="truncate font-serif text-xl font-semibold tracking-tight text-ink">Riwayat</h1>
        </div>

        {(selectedCategory !== 'all' || selectedMethod !== 'all') && !isExpanded && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent"></span>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <Icon.Search size={15} strokeWidth={2} />
          </span>
          <input
            type="text"
            placeholder="Cari catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field pl-10"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex h-11 w-11 shrink-0 items-center justify-center border transition-colors ${isExpanded ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-muted'}`}
          aria-label="Filter lanjutan"
        >
          {isExpanded ? (
            <Icon.X size={18} strokeWidth={2.5} />
          ) : (
            <Icon.SlidersHorizontal size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'mt-4 max-h-[320px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-4 border-t border-line pt-4">

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="field-label">Mulai</label>
              <div className="relative">
                <input
                  type="date"
                  value={filter.start}
                  onClick={(e) => e.target.showPicker()}
                  onChange={(e) => setFilter({...filter, start: e.target.value})}
                  className="field pr-10 text-[10px]"
                />
                <span className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-9 items-center justify-center border-l border-line text-muted">
                  <Icon.Calendar size={15} strokeWidth={2} />
                </span>
              </div>
            </div>
            <div>
              <label className="field-label">Sampai</label>
              <div className="relative">
                <input
                  type="date"
                  value={filter.end}
                  onClick={(e) => e.target.showPicker()}
                  onChange={(e) => setFilter({...filter, end: e.target.value})}
                  className="field pr-10 text-[10px]"
                />
                <span className="pointer-events-none absolute bottom-0 right-0 top-0 flex w-9 items-center justify-center border-l border-line text-muted">
                  <Icon.Calendar size={15} strokeWidth={2} />
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="field flex-1 cursor-pointer appearance-none text-center text-[9px] uppercase tracking-[0.04em]">
              <option value="all">Kategori: Semua</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className="field flex-1 cursor-pointer appearance-none text-center text-[9px] uppercase tracking-[0.04em]">
              <option value="all">Metode: Semua</option>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {(selectedCategory !== 'all' || selectedMethod !== 'all') && (
             <button
               type="button"
               onClick={() => { setSelectedCategory('all'); setSelectedMethod('all'); }}
               className="btn btn-quiet w-full gap-2 font-mono text-[9px] uppercase tracking-[0.06em]"
             >
               <Icon.Repeat size={10} strokeWidth={2.5} />
               Reset filter
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
