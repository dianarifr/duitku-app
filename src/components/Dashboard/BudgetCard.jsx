import { formatNominal } from '../../utils/formatters';

// Komponen Internal untuk tiap Kotak
const Card = ({ category, onDeepDive }) => {
  const hasBudget = category.budget > 0;
  const percentage = hasBudget ? Math.min((category.used / category.budget) * 100, 100) : 0;
  const isOverBudget = hasBudget && category.used > category.budget;

  return (
    <div
      onDoubleClick={() => onDeepDive(category.id)}
      className="flex flex-col justify-between h-full p-5 transition-all bg-white border border-gray-100 shadow-sm cursor-pointer rounded-2xl active:scale-95 hover:border-blue-300 hover:shadow-md group"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center icon-box"
          style={{ backgroundColor: `${category.color}15`, color: category.color }}
        >
          {category.icon}
        </div>

        {hasBudget ? (
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-xl uppercase tracking-tighter ${isOverBudget ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
            {isOverBudget ? 'Over' : `${Math.round(percentage)}%`}
          </span>
        ) : (
          <span className="text-[7px] font-black px-2 py-1 rounded-lg uppercase bg-gray-50 text-gray-300 tracking-widest">
            Limitless
          </span>
        )}
      </div>

      <div>
        <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-tight truncate mb-1">
          {category.name}
        </h4>

        <div className="flex flex-col mb-3">
          {/* Nominal Terpakai Menggunakan formatNominal */}
          <span className={`text-xs font-black ${hasBudget && isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
            {formatNominal(category.used)}
          </span>

          {hasBudget && (
            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
              Limit: {formatNominal(category.budget)}
            </span>
          )}

          {!hasBudget && (
            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
              Total Terpakai
            </span>
          )}
        </div>

        {hasBudget ? (
          <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
            <div
              className={`h-full transition-all duration-1000 rounded-full`}
              style={{
                width: `${percentage}%`,
                backgroundColor: isOverBudget ? '#ef4444' : (Math.round(percentage) > 80 ? '#f59e0b' : category.color)
              }}
            />
          </div>
        ) : (
          <div className="w-full h-2 bg-transparent"></div>
        )}
      </div>
    </div>
  );
};

// KOMPONEN UTAMA
export default function BudgetSection({ loading, budgetMonitoring, onCategoryDeepDive }) {
  // Filter kategori yang hanya memiliki pengeluaran (used > 0)
  const activeCategories = budgetMonitoring.filter(cat => cat.used > 0);

  return (
    <div className="px-6 mt-10">
      <div className="flex items-center justify-between px-1 mb-5">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
          Monitoring Budget
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-40 bg-white border border-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : activeCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {activeCategories.map((cat) => (
            <Card key={cat.id} category={cat} onDeepDive={onCategoryDeepDive} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-gray-200 border-dashed rounded-2xl bg-white/50">
          <div className="mb-3 text-3xl">🛡️</div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
            Belum ada pengeluaran.<br />Dompet aman terkendali!
          </p>
        </div>
      )}
    </div>
  );
}