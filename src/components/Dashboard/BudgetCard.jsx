// Komponen Internal untuk tiap Kotak
const Card = ({ category }) => {
  const hasBudget = category.budget > 0;
  const percentage = hasBudget ? Math.min((category.used / category.budget) * 100, 100) : 0;
  const isOverBudget = hasBudget && category.used > category.budget;

  return (
    <div className="bg-white p-4 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col justify-between h-full active:scale-95 transition-all hover:border-blue-300 hover:shadow-md group cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center justify-center text-lg w-9 h-9 rounded-2xl"
          style={{ backgroundColor: `${category.color}15`, color: category.color }}
        >
          {category.icon}
        </div>

        {hasBudget ? (
          <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase ${isOverBudget ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
            {isOverBudget ? 'Over' : `${Math.round(percentage)}%`}
          </span>
        ) : (
          <span className="text-[7px] font-black px-2 py-1 rounded-lg uppercase bg-gray-50 text-gray-300 tracking-tighter">
            No Limit
          </span>
        )}
      </div>

      <div>
        <h4 className="text-[10px] font-black text-gray-800 uppercase truncate mb-1">
          {category.name}
        </h4>

        <div className="flex items-end gap-1 mb-2">
          <span className={`text-[11px] font-black ${hasBudget ? 'text-gray-900' : 'text-blue-600'}`}>
            {category.used >= 1000000 ? `${(category.used / 1000000).toFixed(1)}jt` : (category.used / 1000).toFixed(0) + 'rb'}
          </span>

          {hasBudget && (
            <span className="text-[8px] font-bold text-gray-300 uppercase mb-0.5">
              / {category.budget >= 1000000 ? `${(category.budget / 1000000).toFixed(1)}jt` : (category.budget / 1000).toFixed(0) + 'rb'}
            </span>
          )}

          {!hasBudget && (
            <span className="text-[8px] font-bold text-gray-300 uppercase mb-0.5">
              Terpakai
            </span>
          )}
        </div>

        {hasBudget ? (
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full`}
              style={{
                width: `${percentage}%`,
                backgroundColor: isOverBudget ? '#ef4444' : category.color
              }}
            />
          </div>
        ) : (
          <div className="h-1.5 w-full bg-transparent"></div>
        )}
      </div>
    </div>
  );
};

// KOMPONEN UTAMA
export default function BudgetSection({ loading, budgetMonitoring, setCurrentPage }) {
  // Filter kategori yang hanya memiliki pengeluaran (used > 0)
  const activeCategories = budgetMonitoring.filter(cat => cat.used > 0);

  return (
    <div className="px-5 mt-8">
      <div className="flex items-center justify-between px-1 mb-4">
        <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
          Monitoring Pengeluaran
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-[2rem] animate-pulse"></div>
          ))}
        </div>
      ) : activeCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {activeCategories.map((cat) => (
            <Card key={cat.id} category={cat} />
          ))}
        </div>
      ) : (
        // Tampilan jika belum ada transaksi sama sekali di bulan ini
        <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white">
          <p className="text-[9px] font-black text-gray-400 uppercase leading-relaxed">
            Belum ada pengeluaran bulan ini ges.<br />Dompet aman terkendali! 🛡️
          </p>
        </div>
      )}
    </div>
  );
}