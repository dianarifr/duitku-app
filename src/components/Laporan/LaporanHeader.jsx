import { useState } from 'react';

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
    <div className="sticky top-0 z-30 px-6 pt-12 pb-5 transition-all duration-300 bg-white border-b shadow-sm rounded-b-4xl border-gray-50">
      {/* Baris 1: Judul & Back */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center justify-center font-bold transition-all bg-gray-100 w-9 h-9 rounded-xl active:scale-90">←</button>
          <h1 className="text-lg font-black tracking-tight text-gray-800 uppercase">Riwayat</h1>
        </div>

        {/* Indikator Filter Aktif (Opsional, muncul kalau ada filter selain 'all') */}
        {(selectedCategory !== 'all' || selectedMethod !== 'all') && !isExpanded && (
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        )}
      </div>

      {/* Baris 2: Search & Toggle Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute text-xs -translate-y-1/2 left-4 top-1/2 opacity-30">🔍</span>
          <input
            type="text"
            placeholder="Cari catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3.5 text-[11px] font-bold transition-all border-none outline-none pl-11 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 rounded-2xl transition-all flex items-center justify-center ${isExpanded ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
        >
          <span className="text-xs">{isExpanded ? '✕' : '⚙️'}</span>
        </button>
      </div>

      {/* Baris 3: Advanced Filters (Collapsible) */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[300px] mt-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pt-4 space-y-4 border-t border-gray-50">

          {/* Filter Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[7px] font-black text-gray-400 uppercase ml-3 mb-1 block tracking-widest">Mulai</label>
              <input
                type="date"
                value={filter.start}
                onClick={(e) => e.target.showPicker()}
                onChange={(e) => setFilter({...filter, start: e.target.value})}
                className="w-full p-3 bg-gray-50 border-none rounded-xl text-[10px] font-black text-gray-700 outline-none"
              />
            </div>
            <div>
              <label className="text-[7px] font-black text-gray-400 uppercase ml-3 mb-1 block tracking-widest">Sampai</label>
              <input
                type="date"
                value={filter.end}
                onClick={(e) => e.target.showPicker()}
                onChange={(e) => setFilter({...filter, end: e.target.value})}
                className="w-full p-3 bg-gray-50 border-none rounded-xl text-[10px] font-black text-gray-700 outline-none"
              />
            </div>
          </div>

          {/* Kategori & Metode */}
          <div className="flex gap-2">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 p-3 bg-gray-50 border-none rounded-xl text-[9px] font-black uppercase text-gray-700 outline-none appearance-none text-center">
              <option value="all">Kategori: Semua</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className="flex-1 p-3 bg-gray-50 border-none rounded-xl text-[9px] font-black uppercase text-gray-700 outline-none appearance-none text-center">
              <option value="all">Metode: Semua</option>
              <option value="cash">💵 Cash</option>
              <option value="transfer">📱 Transfer</option>
            </select>
          </div>

          {/* Reset Action */}
          {(selectedCategory !== 'all' || selectedMethod !== 'all') && (
             <button
               onClick={() => { setSelectedCategory('all'); setSelectedMethod('all'); }}
               className="w-full py-2 text-[8px] font-black text-blue-500 uppercase tracking-tighter"
             >
               Clear Advanced Filters
             </button>
          )}
        </div>
      </div>
    </div>
  );
}