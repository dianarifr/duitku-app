import React from 'react';
import * as Icon from '../lib/icons';

export default function ActionHub({ show, onClose, onSelect }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-0"
      onClick={onClose}
    >
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        <div className="mb-6">
          <p className="section-label">Catat transaksi</p>
          <h3 className="mt-1 font-serif text-xl font-semibold text-ink">Pilih jenis transaksi</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onSelect('input-pengeluaran')}
            className="group flex flex-col items-center gap-2.5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xs border border-line bg-surface-alt text-neg transition-colors group-hover:border-line-strong">
              <Icon.TrendingDown size={22} strokeWidth={2} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors group-hover:text-ink">Keluar</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect('input-pemasukan')}
            className="group flex flex-col items-center gap-2.5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xs border border-line bg-surface-alt text-pos transition-colors group-hover:border-line-strong">
              <Icon.TrendingUp size={22} strokeWidth={2} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors group-hover:text-ink">Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect('input-mutasi')}
            className="group flex flex-col items-center gap-2.5"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xs border border-line bg-surface-alt text-mut transition-colors group-hover:border-line-strong">
              <Icon.ArrowLeftRight size={22} strokeWidth={2} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors group-hover:text-ink">Mutasi</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn mt-6 w-full"
        >
          <Icon.X size={14} strokeWidth={2.5} />
          Tutup menu
        </button>
      </div>
    </div>
  );
}