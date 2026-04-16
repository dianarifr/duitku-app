import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Statistik({ session, setCurrentPage }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('pengeluaran');

  // Logic Perhitungan
  const totalValue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const today = new Date();
  const daysPassed = today.getDate();
  const dailyAvg = totalValue / daysPassed;

  // Ambil Kategori Tertinggi lengkap dengan icon dan color-nya
  const topCategory = chartData.length > 0
    ? [...chartData].sort((a, b) => b.value - a.value)[0]
    : null;

  useEffect(() => {
    fetchStatistik();
  }, [filterType]);

  const fetchStatistik = async () => {
    setLoading(true);
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('transaction')
      .select(`amount, type, category (name, color, icon)`)
      .is('deleted_at', null)
      .eq('type', filterType)
      .gte('date', firstDay);

    if (error) {
      console.error(error);
    } else {
      const grouped = data.reduce((acc, curr) => {
        const catName = curr.category?.name || 'Lainnya';
        const catColor = curr.category?.color || '#cbd5e1';
        const catIcon = curr.category?.icon || '❓';
        if (!acc[catName]) {
          acc[catName] = { name: catName, value: 0, color: catColor, icon: catIcon };
        }
        acc[catName].value += curr.amount;
        return acc;
      }, {});
      setChartData(Object.values(grouped));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-24 font-sans bg-gray-50">
      {/* Header Sticky */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm rounded-b-[2rem] sticky top-0 z-20">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center justify-center w-10 h-10 font-bold text-gray-600 transition-transform bg-gray-100 rounded-2xl active:scale-90"
          >←</button>
          <h1 className="flex-1 mr-10 text-xl font-black tracking-tight text-center text-gray-800 uppercase">Analisis Cuan</h1>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilterType('pengeluaran')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${filterType === 'pengeluaran' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}
          >PENGELUARAN</button>
          <button
            onClick={() => setFilterType('pemasukan')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${filterType === 'pemasukan' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-400'}`}
          >PEMASUKAN</button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="px-6 mt-8">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col items-center relative">
          <h3 className="mb-2 text-[10px] font-black tracking-widest text-gray-300 uppercase">Proporsi {filterType}</h3>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center font-black text-gray-200 animate-pulse uppercase tracking-tighter">Calculating...</div>
          ) : chartData.length > 0 ? (
            <div className="w-full h-[320px] relative">
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Bulan Ini</span>
                <span className={`text-xl font-black ${filterType === 'pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                  {totalValue > 1000000 ? `${(totalValue / 1000000).toFixed(1)}jt` : totalValue.toLocaleString('id-ID')}
                </span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1200}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={12} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ fontWeight: '900', fontSize: '10px', textTransform: 'uppercase' }}
                    formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center">
              <span className="mb-2 text-4xl">🏜️</span>
              <p className="text-[10px] font-black text-gray-400 uppercase">Nggak ada transaksi ges</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Insight Cards */}
      <div className="grid grid-cols-2 gap-3 px-6 mt-4">
        <div className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col justify-center">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Rata-rata / Hari</p>
          <p className="text-sm font-black tracking-tighter text-gray-800 uppercase">
            Rp {Math.round(dailyAvg).toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-3">
          {/* ICON TOP CATEGORY (NEW) */}
          <div
            className="flex items-center justify-center w-10 h-10 text-xl rounded-xl shrink-0"
            style={{
              backgroundColor: topCategory ? `${topCategory.color}15` : '#f3f4f6',
              color: topCategory ? topCategory.color : '#9ca3af'
            }}
          >
            {topCategory ? topCategory.icon : '✨'}
          </div>
          <div className="overflow-hidden">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Top {filterType}</p>
            <p className="text-[11px] font-black text-blue-600 uppercase tracking-tighter truncate">
              {topCategory ? topCategory.name : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Intensity Bar */}
      {chartData.length > 0 && (
        <div className="px-6 mt-8">
          <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Intensitas Kategori</h3>
            <span className="text-[10px] font-black text-gray-800 uppercase">{chartData.length} Jenis</span>
          </div>
          <div className="flex w-full h-4 overflow-hidden bg-gray-200 rounded-full shadow-inner">
            {chartData.sort((a,b) => b.value - a.value).map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${(item.value / totalValue) * 100}%`, backgroundColor: item.color }}
                className="h-full transition-all duration-1000 border-r border-white/20 last:border-none"
              />
            ))}
          </div>
        </div>
      )}

      {/* Breakdown List */}
      <div className="px-6 mt-8 space-y-3">
        <div className="flex items-end justify-between px-1 mb-2">
            <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Rincian Per Kategori</h3>
            <span className="text-[10px] font-black text-gray-800 uppercase">Rp {totalValue.toLocaleString('id-ID')}</span>
        </div>

        {chartData.sort((a,b) => b.value - a.value).map((item, idx) => {
          const percent = ((item.value / totalValue) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center justify-between p-5 transition-transform bg-white border shadow-sm rounded-[1.5rem] border-gray-50 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 text-lg shadow-inner rounded-xl" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                  {item.icon}
                </div>
                <div>
                    <p className="mb-1 text-sm font-black leading-none tracking-tighter text-gray-800 uppercase">{item.name}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{percent}% Dari Total</p>
                </div>
              </div>
              <p className="text-sm font-black tracking-tighter text-gray-700">Rp {item.value.toLocaleString('id-ID')}</p>
            </div>
          )
        })}
      </div>
    </div>
  );
}