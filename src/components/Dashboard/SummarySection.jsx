import * as Icon from '../../lib/icons';

export default function SummarySection({ hasInputToday, loading, income, expense, onInputClick, formatNominal }) {
  return (
    <>
      <div className="mt-4 px-5">
        {!loading && !hasInputToday && (
          <div className="panel animate-mini-jump relative flex items-center justify-between gap-3 overflow-hidden p-4 motion-reduce:animate-none">
            <span
              aria-hidden="true"
              className="animate-pulse absolute inset-y-0 left-0 w-0.5 bg-accent motion-reduce:animate-none"
            />
            <div className="flex min-w-0 items-center gap-3">
              <div className="icon-box h-10 w-10 shrink-0">
                <Icon.SquarePen size={18} strokeWidth={2} className="text-accent" />
              </div>
              <div className="min-w-0">
                <p className="section-label leading-none">Pengingat</p>
                <p className="mt-1 truncate text-xs font-medium text-ink-soft">
                  Belum ada catatan untuk hari ini.
                </p>
              </div>
            </div>

            <button type="button" onClick={onInputClick} className="btn btn-primary min-h-9 shrink-0 px-3 text-xs">
              Catat
              <Icon.Plus size={13} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 px-5">
        <div className="panel p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <Icon.ArrowDownLeft size={12} strokeWidth={2.5} className="text-pos" />
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Masuk</p>
          </div>
          <p className="font-mono text-sm font-medium text-pos tabular-nums">+ {formatNominal(income)}</p>
        </div>
        <div className="panel p-4">
          <div className="mb-1 flex items-center gap-1.5">
            <Icon.ArrowUpRight size={12} strokeWidth={2.5} className="text-neg" />
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Keluar</p>
          </div>
          <p className="font-mono text-sm font-medium text-neg tabular-nums">- {formatNominal(expense)}</p>
        </div>
      </div>
    </>
  );
}
