import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useStatistik } from '../hooks/useStatistik';
import { formatNominal } from '../utils/formatters'; // Import formatter sakti

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
    <div className="min-h-screen pb-24 font-sans bg-gray-50">
      {/* Header Sticky */}
      <div className="sticky top-0 z-20 px-6 pt-12 pb-6 bg-white shadow-sm rounded-b-4xl">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center justify-center w-10 h-10 font-bold text-gray-500 transition-transform bg-gray-100 rounded-2xl active:scale-90"
          >←</button>
          <h1 className="flex-1 mr-10 text-xl italic font-black tracking-tight text-center text-gray-800 uppercase">Analisis Cuan</h1>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilterType('pengeluaran')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === 'pengeluaran' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}
          >PENGELUARAN</button>
          <button
            onClick={() => setFilterType('pemasukan')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === 'pemasukan' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-400'}`}
          >PEMASUKAN</button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="px-6 mt-8">
        <div className="relative flex flex-col items-center p-8 overflow-hidden bg-white border shadow-sm rounded-3xl border-gray-50">
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-24 h-24 -mt-12 -mr-12 rounded-full bg-gray-50"></div>

          <h3 className="mb-2 text-[9px] font-black tracking-[0.3em] text-gray-300 uppercase relative z-10">Proporsi {filterType}</h3>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center font-black text-gray-200 animate-pulse uppercase tracking-widest text-xs">Menghitung Data...</div>
          ) : chartData.length > 0 ? (
            <div className="w-full h-[320px] relative">
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Bulan Ini</span>
                <span className={`text-xl font-black italic tracking-tighter ${filterType === 'pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
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
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                    animationBegin={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={12} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }}
                    itemStyle={{ fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', tracking: '0.1em' }}
                    cursor={{ fill: 'transparent' }}
                    formatter={(value) => formatNominal(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center">
              <span className="mb-4 text-5xl">🕵️‍♂️</span>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Belum ada jejak transaksi, Puh</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Insight Cards */}
      <div className="grid grid-cols-2 gap-4 px-6 mt-6">
        <div className="relative flex flex-col justify-center p-6 overflow-hidden bg-white border shadow-sm rounded-4xl border-gray-50">
          <div className="absolute top-0 right-0 w-12 h-12 -mt-6 -mr-6 rounded-full bg-blue-50/50"></div>
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 relative z-10">Rata-rata / Hari</p>
          <p className="text-sm italic font-black tracking-tighter text-gray-800 uppercase">
            {formatNominal(Math.round(dailyAvg || 0))}
          </p>
        </div>

        <div className="flex items-center gap-3 p-5 bg-white border shadow-sm rounded-4xl border-gray-50">
          <div
            className="flex items-center icon-box"
            style={{
              backgroundColor: topCategory ? `${topCategory.color}15` : '#f3f4f6',
              color: topCategory ? topCategory.color : '#9ca3af'
            }}
          >
            {topCategory ? topCategory.icon : '✨'}
          </div>
          <div className="overflow-hidden">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Top {filterType}</p>
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-tighter truncate italic">
              {topCategory ? topCategory.name : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Intensity Bar & Breakdown List */}
      {chartData.length > 0 && (
        <div className="duration-700 animate-in fade-in slide-in-from-bottom-4">
            <div className="px-6 mt-10">
                <div className="flex items-center justify-between px-1 mb-4">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Intensitas Kategori</h3>
                    <span className="text-[9px] font-black text-gray-800 uppercase bg-gray-100 px-2.5 py-1 rounded-full">{chartData.length} Jenis</span>
                </div>
                <div className="flex w-full h-5 overflow-hidden bg-gray-100 border rounded-full shadow-inner border-gray-50">
                    {[...chartData].sort((a,b) => b.value - a.value).map((item, idx) => (
                    <div
                        key={idx}
                        style={{ width: `${(item.value / (totalValue || 1)) * 100}%`, backgroundColor: item.color }}
                        className="h-full transition-all duration-1000 border-r border-white/30 last:border-none first:rounded-l-full last:rounded-r-full"
                    />
                    ))}
                </div>
            </div>

            <div className="px-6 mt-10 space-y-4">
                <div className="flex items-end justify-between px-1 mb-3">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">Rincian Per Kategori</h3>
                    <span className="text-[11px] font-black text-gray-800 uppercase italic underline decoration-blue-500 decoration-2 underline-offset-4">
                        {formatNominal(totalValue)}
                    </span>
                </div>

                {[...chartData].sort((a,b) => b.value - a.value).map((item, idx) => {
                    const percent = ((item.value / (totalValue || 1)) * 100).toFixed(1);
                    return (
                        <div key={idx} className="flex items-center justify-between p-5 transition-all bg-white border shadow-sm rounded-2xl border-gray-50 active:scale-[0.98] hover:border-blue-100">
                            <div className="flex items-center gap-4">
                                <div className="icon-box" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="mb-0.5 text-sm font-black leading-none tracking-tight text-gray-800 uppercase">{item.name}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{percent}% Dari Total</p>
                                </div>
                            </div>
                            <p className="text-sm italic font-black tracking-tighter text-gray-700">
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