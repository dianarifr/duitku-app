import { formatNominal } from '../../utils/formatters';
import * as Icon from '../../lib/icons';

export default function TransactionList({ loading, transactions, onEdit, hook }) {
  // Ambil confirmDelete dari hook untuk handle hapus sepasang mutasi
  const { deleteId, setDeleteId, handleDeleteTransaction, confirmDelete } = hook;

  if (loading) return <p className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted animate-pulse">Lagi nyari data...</p>;

  if (transactions.length === 0) return (
    <div className="mx-5 mt-5 flex flex-col items-center justify-center gap-3 border border-dashed border-line-strong bg-surface/60 py-16 text-center">
      <Icon.Search size={28} strokeWidth={2} className="text-muted opacity-40" />
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Kaga ada datanya ges</p>
    </div>
  );

  return (
    <>
      <div className="mt-4 space-y-3 px-5 pb-24">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
            <Icon.Zap size={10} strokeWidth={2.5} />
            <span>Double click buat edit</span>
          </div>
        </div>

        {transactions.map((t) => {
          const isMutation = t.type === 'mutasi';
          const isIncome = t.type === 'pemasukan';

          return (
            <div
              key={t.id}
              onDoubleClick={() => onEdit(t)}
              className="panel flex cursor-pointer select-none flex-col gap-3.5 p-4 transition-colors hover:border-line-strong active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div
                    className="icon-box shrink-0"
                    style={{
                      backgroundColor: isMutation ? '#4f46e515' : `${t.category?.color}15`,
                      color: isMutation ? '#4f46e5' : t.category?.color
                    }}
                  >
                    {isMutation ? <Icon.ArrowLeftRight size={18} strokeWidth={2} /> : t.category?.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold leading-tight text-ink uppercase">
                      {isMutation ? 'Mutasi saldo' : t.category?.name}
                    </h4>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <Icon.Calendar size={10} strokeWidth={2} className="text-muted" />
                      <p className="font-mono text-[9px] uppercase tracking-[0.04em] text-muted">
                        {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-mono text-base font-medium tabular-nums ${
                    isMutation ? 'text-mut' : isIncome ? 'text-pos' : 'text-neg'
                  }`}>
                    {isIncome || (isMutation && t.note?.includes('[MASUK]')) ? '+' : '-'} {formatNominal(t.amount).replace('Rp', '').trim()}
                  </p>
                  <span className={`mt-0.5 inline-block border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.06em] ${
                    isMutation ? 'border-line bg-surface-alt text-mut' : 'border-line bg-surface-alt text-muted'
                  }`}>
                    {t.payment_method}
                  </span>
                </div>
              </div>

              {t.note && (
                <div className={`rounded-xs border-l-2 px-3 py-2.5 ${isMutation ? 'border-mut bg-surface-alt/60' : 'border-accent bg-surface-alt/60'}`}>
                  <p className="text-left text-[11px] font-medium leading-relaxed text-ink-soft">"{t.note}"</p>
                </div>
              )}

              <div className="border-t border-line pt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(t); // Panggil helper dari hook untuk cek related_id
                  }}
                  className="flex w-full items-center justify-center gap-2 border border-line py-2.5 font-mono text-[9px] uppercase tracking-[0.08em] text-danger transition-colors hover:bg-surface-alt active:scale-[0.99]"
                >
                  <Icon.Trash2 size={12} strokeWidth={2.5} />
                  Hapus transaksi
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DELETE TRANSAKSI */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-5 animate-in fade-in">
          <div className="w-full max-w-xs border border-line bg-surface p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-alt text-danger">
              <Icon.Trash2 size={26} strokeWidth={2} />
            </div>
            <h3 className="mb-2 font-serif text-xl font-semibold text-ink">Hapus transaksi?</h3>
            <p className="mb-6 font-mono text-[10px] uppercase leading-relaxed tracking-[0.04em] text-muted">
              Catatan ini bakal hilang dari riwayat, ges. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setDeleteId(null)} className="btn flex-1 text-xs">Batal</button>
              <button type="button" onClick={handleDeleteTransaction} className="btn btn-danger flex-1 text-xs">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}