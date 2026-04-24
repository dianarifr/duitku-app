export default function CategoryTab({ payday, onUpdatePayday, categories, transactions, onEdit, onDelete }) {
  return (
    <>
      {/* Siklus Gajian tetap di sini */}
      <div className="mb-6">
        <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase opacity-70">Siklus Gajian</p>
              <h3 className="text-lg font-black">Tgl {payday}</h3>
            </div>
            <select
              value={payday}
              onChange={(e) => onUpdatePayday(Number(e.target.value))}
              className="px-4 py-2 text-xs font-black border-none outline-none appearance-none bg-white/20 rounded-xl"
            >
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1} className="text-gray-800">Tgl {i+1}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          const used = transactions.filter(t => t.category_id === cat.id).reduce((sum, item) => sum + item.amount, 0);
          const percent = cat.budget > 0 ? Math.min((used / cat.budget) * 100, 100) : 0;
          return (
            <div
              key={cat.id}
              onDoubleClick={() => onEdit(cat)} // Double click untuk Edit
              className="p-5 bg-white border border-gray-100 shadow-sm rounded-[2rem] active:scale-[0.98] transition-all cursor-pointer select-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-2xl" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{cat.icon}</div>
                  <div>
                    <h4 className="text-sm font-black text-gray-800 uppercase">{cat.name}</h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Limit: Rp {cat.budget?.toLocaleString('id-ID') || 0}</p>
                  </div>
                </div>
                <span className={`text-[7px] font-black px-2 py-1 rounded-md uppercase ${cat.type === 'pemasukan' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {cat.type === 'pemasukan' ? 'Masuk' : 'Keluar'}
                </span>
              </div>

              {/* Progress Bar */}
              {cat.type === 'pengeluaran' && cat.budget > 0 && (
                <div className="mt-4 w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full transition-all" style={{ width: `${percent}%`, backgroundColor: cat.color }} />
                </div>
              )}

              {/* Tombol Hapus Full Width (Task 7) */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Biar onEdit gak ikut kepicu
                  onDelete(cat.id);
                }}
                className="w-full mt-4 py-3 bg-red-50 text-red-400 text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all"
              >
                🗑️ Hapus Kategori
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}