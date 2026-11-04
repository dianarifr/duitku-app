import * as Icon from '../../lib/icons';

export default function RecurringModal({ show, pending, onPay, onClose }) {
  if (!show || pending.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-0">
      <div className="sheet">
        <div className="sheet-handle" />

        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="section-label">Pengingat rutin</p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-ink">Tagihan rutin tersedia</h2>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xs border border-line bg-surface-alt text-accent">
            <Icon.Bell size={18} strokeWidth={2} />
          </div>
        </div>

        <div className="custom-scrollbar mt-4 max-h-[40vh] space-y-2.5 overflow-y-auto pr-1">
          {pending.map(rec => (
            <div key={rec.id} className="flex items-center justify-between gap-3 border border-line bg-surface-alt/40 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs border border-line bg-surface text-xl">
                  {rec.category?.icon}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{rec.note}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
                    Rp {rec.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onPay(rec)}
                className="btn btn-primary min-h-9 shrink-0 px-3 text-xs"
              >
                <Icon.CreditCard size={12} strokeWidth={2.5} />
                Bayar
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn mt-5 w-full"
        >
          <Icon.X size={14} strokeWidth={2.5} />
          Tutup
        </button>
      </div>
    </div>
  );
}
