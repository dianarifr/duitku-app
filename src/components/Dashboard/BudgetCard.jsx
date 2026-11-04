import { formatNominal } from '../../utils/formatters';

const Card = ({ category, onDeepDive }) => {
  const hasBudget = category.budget > 0;
  const percentage = hasBudget ? Math.min((category.used / category.budget) * 100, 100) : 0;
  const isOverBudget = hasBudget && category.used > category.budget;

  return (
    <div
      onDoubleClick={() => onDeepDive(category.id)}
      className="panel flex h-full cursor-pointer flex-col justify-between p-4 transition-colors hover:border-line-strong active:scale-[0.99]"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div
          className="icon-box"
          style={{ backgroundColor: `${category.color}15`, color: category.color }}
        >
          {category.icon}
        </div>

        {hasBudget ? (
          <span className={`badge border-0 px-2 py-1 text-[9px] ${isOverBudget ? 'bg-neg/10 text-neg' : 'bg-surface-alt text-ink-soft'}`}>
            {isOverBudget ? 'Melebihi' : `${Math.round(percentage)}%`}
          </span>
        ) : (
          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
            Tanpa batas
          </span>
        )}
      </div>

      <div>
        <h4 className="mb-1 truncate text-[11px] font-semibold uppercase tracking-tight text-ink">
          {category.name}
        </h4>

        <div className="mb-3 flex flex-col">
          <span className={`font-mono text-xs font-medium tabular-nums ${isOverBudget ? 'text-neg' : 'text-ink'}`}>
            {formatNominal(category.used)}
          </span>

          {hasBudget ? (
            <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted">
              Batas: {formatNominal(category.budget)}
            </span>
          ) : (
            <span className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted">
              Total terpakai
            </span>
          )}
        </div>

        {hasBudget ? (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${percentage}%`,
                backgroundColor: isOverBudget ? '#b34a32' : (Math.round(percentage) > 80 ? '#b07a2a' : category.color)
              }}
            />
          </div>
        ) : (
          <div className="h-1.5 w-full"></div>
        )}
      </div>
    </div>
  );
};

export default function BudgetSection({ loading, budgetMonitoring, onCategoryDeepDive }) {
  const activeCategories = budgetMonitoring.filter(cat => cat.used > 0);

  return (
    <div className="mt-9 px-5">
      <div className="mb-4 flex items-center justify-between px-0.5">
        <h3 className="section-label">Monitoring budget</h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse border border-line bg-surface"></div>
          ))}
        </div>
      ) : activeCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {activeCategories.map((cat) => (
            <Card key={cat.id} category={cat} onDeepDive={onCategoryDeepDive} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-line-strong bg-surface/60 p-10 text-center">
          <div className="mb-2 font-serif text-2xl text-muted">—</div>
          <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.08em] text-muted">
            Belum ada pengeluaran.<br />Saldo aman.
          </p>
        </div>
      )}
    </div>
  );
}
