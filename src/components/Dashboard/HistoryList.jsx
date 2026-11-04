export default function HistoryList({ transactions, loading, onSeeAll, onEdit }) {
  return (
    <div className="mt-8 px-5">
      <div className="mb-3 flex items-end justify-between px-0.5">
        <div className="flex flex-col">
          <h3 className="font-serif text-lg font-semibold leading-none text-ink">Riwayat cuan</h3>
          <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">
            Double click buat edit
          </span>
        </div>
        <button type="button" onClick={onSeeAll} className="btn btn-quiet min-h-7 px-1 font-mono text-[10px] uppercase tracking-[0.08em]">
          Semua
        </button>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <div className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted animate-pulse">
            Lagi ngitung duit dulu
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((t) => (
            <div
              key={t.id}
              onDoubleClick={() => onEdit(t)}
              className="panel flex cursor-pointer items-center justify-between p-4 transition-colors hover:border-line-strong active:scale-[0.99]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xs text-xl"
                  style={{ backgroundColor: `${t.category?.color}15`, color: t.category?.color }}
                >
                  {t.category?.icon}
                </div>
                <div className="min-w-0">
                  <p className="w-32 truncate text-sm font-semibold uppercase text-ink">
                    {t.note || t.category?.name}
                  </p>
                  <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">
                    {t.category?.name}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-mono text-sm font-medium tabular-nums ${t.type === 'pengeluaran' ? 'text-neg' : 'text-pos'}`}>
                  {t.type === 'pengeluaran' ? '-' : '+'} {t.amount.toLocaleString('id-ID')}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">
                  {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            Belum ada cuan masuk/keluar ges
          </div>
        )}
      </div>
    </div>
  );
}