import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStatistik } from '../hooks/useStatistik';
import { formatNominal } from '../utils/formatters';

export default function Statistik({ session, setCurrentPage }) {
  const {
    chartData,
    loading,
    filterType,
    setFilterType,
    totalValue,
    dailyAvg,
    topCategory
  } = useStatistik(session);

  return (
    <div className="min-h-screen bg-paper pb-28 font-sans">
      {/* Header Sticky */}
      <div className="sticky top-0 z-20 border-b border-line bg-paper px-5 pb-4 pt-8">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="btn btn-icon shrink-0"
            aria-label="Kembali"
          >
            <span className="text-base leading-none">←</span>
          </button>
          <h1 className="flex-1 truncate font-serif text-xl font-semibold tracking-tight text-ink">Analisis cuan</h1>
        </div>

        <div className="flex border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setFilterType('pengeluaran')}
            className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${filterType === 'pengeluaran' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
          >Pengeluaran</button>
          <button
            type="button"
            onClick={() => setFilterType('pemasukan')}
            className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${filterType === 'pemasukan' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
          >Pemasukan</button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="mt-5 px-5">
        <div className="panel flex flex-col items-center overflow-hidden p-6">
          <h3 className="section-label mb-2">Proporsi {filterType}</h3>

          {loading ? (
            <div className="flex h-[300px] items-center justify-center font-mono text-[10px] uppercase tracking-[0.1em] text-muted animate-pulse">Menghitung data...</div>
          ) : chartData.length > 0 ? (
            <div className="relative h-[320px] w-full">
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                <span className="mb-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">Bulan ini</span>
                <span className={`font-serif text-xl font-semibold tracking-tight tabular-nums ${filterType === 'pemasukan' ? 'text-pos' : 'text-neg'}`}>
                    {formatNominal(totalValue)}
                </span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1200}
                    animationBegin={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '2px',
                      border: '1px solid var(--color-line)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-ink)',
                      boxShadow: '0 12px 30px -20px rgba(0,0,0,0.5)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}
                    cursor={{ fill: 'transparent' }}
                    formatter={(value) => formatNominal(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <span className="mb-3 font-serif text-3xl text-muted">—</span>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Belum ada jejak transaksi, Puh</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Insight Cards */}
      <div className="mt-3 grid grid-cols-2 gap-3 px-5">
        <div className="panel flex flex-col justify-center p-5">
          <p className="section-label mb-1.5">Rata-rata / hari</p>
          <p className="font-mono text-sm font-medium uppercase tracking-tight text-ink tabular-nums">
            {formatNominal(Math.round(dailyAvg || 0))}
          </p>
        </div>

        <div className="panel flex items-center gap-3 p-4">
          <div
            className="icon-box shrink-0"
            style={{
              backgroundColor: topCategory ? `${topCategory.color}15` : 'var(--color-surface-alt)',
              color: topCategory ? topCategory.color : 'var(--color-muted)'
            }}
          >
            {topCategory ? topCategory.icon : '—'}
          </div>
          <div className="min-w-0">
            <p className="section-label mb-0.5">Top {filterType}</p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-tight text-ink">
              {topCategory ? topCategory.name : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Intensity Bar & Breakdown List */}
      {chartData.length > 0 && (
        <div>
            <div className="mt-9 px-5">
                <div className="mb-3 flex items-center justify-between px-0.5">
                    <h3 className="section-label">Intensitas kategori</h3>
                    <span className="badge">{chartData.length} jenis</span>
                </div>
                <div className="flex h-4 w-full overflow-hidden rounded-full border border-line bg-surface-alt">
                    {[...chartData].sort((a,b) => b.value - a.value).map((item, idx) => (
                    <div
                        key={idx}
                        style={{ width: `${(item.value / (totalValue || 1)) * 100}%`, backgroundColor: item.color }}
                        className="h-full border-r border-surface last:border-none"
                    />
                    ))}
                </div>
            </div>

            <div className="mt-9 space-y-3 px-5">
                <div className="mb-2 flex items-end justify-between px-0.5">
                    <h3 className="section-label">Rincian per kategori</h3>
                    <span className="font-mono text-[11px] font-medium text-ink tabular-nums">
                        {formatNominal(totalValue)}
                    </span>
                </div>

                {[...chartData].sort((a,b) => b.value - a.value).map((item, idx) => {
                    const percent = ((item.value / (totalValue || 1)) * 100).toFixed(1);
                    return (
                        <div key={idx} className="panel flex items-center justify-between gap-3 p-4 transition-colors hover:border-line-strong active:scale-[0.99]">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="icon-box shrink-0" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                    {item.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="mb-0.5 truncate text-sm font-semibold leading-none tracking-tight text-ink uppercase">{item.name}</p>
                                    <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted">{percent}% dari total</p>
                                </div>
                            </div>
                            <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-ink-soft">
                                {formatNominal(item.value)}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
      )}
    </div>
  );
}