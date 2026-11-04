import { formatNominal } from '../../utils/formatters';

export default function LaporanSummary({ income, expense, mutation = 0 }) {
  // Netto tetap Income - Expense karena Mutasi tidak mengubah kekayaan bersih
  const netto = income - expense;

  return (
    <div className="mt-5 px-5">
      <div className="panel p-6 text-center">
        <p className="section-label">Netto periode ini</p>
        <h2 className="mb-6 mt-1.5 font-serif text-3xl font-semibold tracking-tight text-ink tabular-nums">
          {formatNominal(netto)}
        </h2>

        <div className="grid grid-cols-3 gap-2 border-t border-line pt-5">
          <div>
            <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">Masuk</p>
            <p className="font-mono text-[11px] font-medium text-pos tabular-nums">
              +{formatNominal(income).replace('Rp', '').trim()}
            </p>
          </div>

          <div className="border-x border-line">
            <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">Keluar</p>
            <p className="font-mono text-[11px] font-medium text-neg tabular-nums">
              -{formatNominal(expense).replace('Rp', '').trim()}
            </p>
          </div>

          <div>
            <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">Mutasi</p>
            <p className="font-mono text-[11px] font-medium text-mut tabular-nums">
              {formatNominal(mutation).replace('Rp', '').trim()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}