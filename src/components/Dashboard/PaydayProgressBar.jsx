import React from 'react';
import * as Icon from '../../lib/icons';

export default function PaydayProgressBar({ payday }) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  let startCycle, endCycle;

  if (d >= payday) {
    startCycle = new Date(y, m, payday);
    endCycle = new Date(y, m + 1, payday);
  } else {
    startCycle = new Date(y, m - 1, payday);
    endCycle = new Date(y, m, payday);
  }

  const totalDays = Math.round((endCycle - startCycle) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.round((today - startCycle) / (1000 * 60 * 60 * 24));
  const daysLeft = totalDays - daysPassed;
  const progress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);

  const getStatus = () => {
    if (progress < 20) return {
      msg: 'Siklus baru dimulai. Jaga ritme pengeluaran.',
      color: 'bg-pos',
      text: 'text-pos',
      icon: <Icon.Zap size={14} strokeWidth={2.5} />
    };
    if (progress < 60) return {
      msg: 'Pertengahan siklus. Pengeluaran masih terkendali.',
      color: 'bg-focus',
      text: 'text-focus',
      icon: <Icon.TrendingUp size={14} strokeWidth={2.5} />
    };
    if (daysLeft <= 7) return {
      msg: 'Sisa anggaran menipis. Prioritaskan kebutuhan pokok.',
      color: 'bg-neg',
      text: 'text-neg',
      icon: <Icon.TrendingDown size={14} strokeWidth={2.5} />
    };
    return {
      msg: 'Tanggal gajian semakin dekat. Pertahankan pengeluaran.',
      color: 'bg-accent',
      text: 'text-accent',
      icon: <Icon.Sparkles size={14} strokeWidth={2.5} />
    };
  };

  const status = getStatus();

  return (
    <div className="mt-6 px-5">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <h3 className="section-label">Progres siklus gajian</h3>
        <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
          <Icon.Calendar size={10} strokeWidth={2} />
          Target: {endCycle.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </div>
      </div>

      <div className="panel p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`${status.text}`}>{status.icon}</span>
            <span className={`text-[10px] font-medium uppercase tracking-[0.06em] ${status.text}`}>
              {status.msg}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="font-serif text-2xl font-semibold leading-none text-ink tabular-nums">{daysLeft}</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Hari tersisa</span>
          </div>
        </div>

        <div className="relative h-2 w-full overflow-hidden rounded-full border border-line bg-surface-alt">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${status.color}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between px-0.5">
          <div className="flex flex-col">
            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-muted">Awal siklus</span>
            <span className="font-mono text-[9px] text-ink-soft">
              {startCycle.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-muted">Target gajian</span>
            <span className="font-mono text-[9px] text-ink-soft">
              {endCycle.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
