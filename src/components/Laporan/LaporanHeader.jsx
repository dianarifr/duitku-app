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
  return (
    <div className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-30 rounded-b-[2.5rem]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 font-bold transition-all bg-gray-100 rounded-2xl active:scale-90">←</button>
          <h1 className="text-xl font-black tracking-tight text-gray-800 uppercase">Riwayat</h1>
        </div>
      </div>

      {/* Filter Tanggal */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-[8px] font-black text-gray-400 uppercase ml-4 mb-1 block tracking-widest">Mulai</label>
          <div className="relative mt-1">
            <input
              type="date"
              value={filter.start}
              onClick={(e) => e.target.showPicker()}
              onChange={(e) => setFilter({...filter, start: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-[1.5rem] text-sm font-black text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            />
            <span className="absolute text-lg -translate-y-1/2 pointer-events-none right-4 top-1/2">📅</span>
          </div>
        </div>
        <div>
          <label className="text-[8px] font-black text-gray-400 uppercase ml-4 mb-1 block tracking-widest">Sampai</label>
          <div className="relative mt-1">
            <input
              type="date"
              value={filter.end}
              onClick={(e) => e.target.showPicker()}
              onChange={(e) => setFilter({...filter, end: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-[1.5rem] text-sm font-black text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
            />
            <span className="absolute text-lg -translate-y-1/2 pointer-events-none right-4 top-1/2">📅</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <span className="absolute text-xs -translate-y-1/2 left-4 top-1/2 opacity-30">🔍</span>
          <input
            type="text"
            placeholder="Cari catatan seblak, gaji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 text-sm font-bold transition-all border-none outline-none pl-11 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 p-3 bg-gray-50 border-none rounded-xl text-[9px] font-black uppercase text-gray-400 outline-none">
            <option value="all">Semua Kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className="flex-1 p-3 bg-gray-50 border-none rounded-xl text-[9px] font-black uppercase text-gray-400 outline-none">
            <option value="all">Semua Metode</option>
            <option value="cash">💵 Cash</option>
            <option value="transfer">📱 Transfer</option>
          </select>
        </div>
      </div>
    </div>
  );
}