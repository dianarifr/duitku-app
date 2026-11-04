import * as Icon from '../../lib/icons';
import ThemeToggle from '../ThemeToggle';

export default function DashboardHeader({ userName, avatarUrl, totalBalance, periodLabel, onLogout, formatNominal }) {
  return (
    <header className="border-b border-line px-5 pb-6 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-[21px] font-semibold tracking-tight text-ink">Duitku</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">arus kas</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <img
              src={avatarUrl}
              alt="Foto profil"
              className="h-9 w-9 rounded-full border border-line object-cover"
            />
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Halo,</p>
              <p className="max-w-44 truncate text-sm font-semibold capitalize text-ink">{userName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={onLogout}
            className="btn btn-quiet min-h-9 gap-1.5 px-2.5"
            title="Keluar"
          >
            <Icon.LogOut size={15} strokeWidth={2} />
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.08em] sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      <div className="mt-7">
        <p className="section-label">Saldo keseluruhan</p>
        <h1 className="mt-1.5 font-serif text-4xl font-semibold tracking-tight text-ink tabular-nums">
          {formatNominal(totalBalance)}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="badge">
            <Icon.Calendar size={11} strokeWidth={2} />
            Periode: {periodLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
