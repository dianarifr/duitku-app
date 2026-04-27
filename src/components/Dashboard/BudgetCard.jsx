// Komponen Internal untuk tiap Kotak Budget
const Card = ({ category }) => {
  const percentage = Math.min((category.used / (category.budget || 1)) * 100, 100);
  const isOverBudget = category.used > category.budget;

  return (
    <div className="bg-white p-4 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col justify-between h-full active:scale-95 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex items-center justify-center text-lg w-9 h-9 rounded-2xl"
          style={{ backgroundColor: `${category.color}15`, color: category.color }}
        >
          {category.icon}
        </div>
        <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase ${isOverBudget ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
          {isOverBudget ? 'Over' : `${Math.round(percentage)}%`}
        </span>
      </div>

      <div>
        <h4 className="text-[10px] font-black text-gray-800 uppercase truncate mb-1">
          {category.name}
        </h4>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-[11px] font-black text-gray-900">
            {category.used >= 1000000 ? `${(category.used / 1000000).toFixed(1)}jt` : (category.used / 1000).toFixed(0) + 'k'}
          </span>
          <span className="text-[8px] font-bold text-gray-300 uppercase mb-0.5">
            / {category.budget >= 1000000 ? `${(category.budget / 1000000).toFixed(1)}jt` : (category.budget / 1000).toFixed(0) + 'k'}
          </span>
        </div>

        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full`}
            style={{
              width: `${percentage}%`,
              backgroundColor: isOverBudget ? '#ef4444' : category.color
            }}
          />
        </div>
      </div>
    </div>
  );
};

// KOMPONEN UTAMA (YANG DI-EXPORT KE DASHBOARD)
export default function BudgetSection({ loading, budgetMonitoring, setCurrentPage }) {
  return (
    <div className="px-5 mt-8">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1 mb-4">
        <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
          Monitoring Budget
        </h3>
        <button
          onClick={() => setCurrentPage('kategori')}
          className="text-[10px] font-black text-blue-600 uppercase italic active:scale-90 transition-transform"
        >
          Atur Budget 📂
        </button>
      </div>

      {/* Logic Tampilan */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-[2rem] animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded-[2rem] animate-pulse"></div>
        </div>
      ) : budgetMonitoring.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {budgetMonitoring.map((cat) => (
            <Card key={cat.id} category={cat} />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-white">
          <p className="text-[9px] font-black text-gray-400 uppercase leading-relaxed">
            Belum ada budget diatur ges.<br />Setting di menu Kategori ya!
          </p>
        </div>
      )}
    </div>
  );
}