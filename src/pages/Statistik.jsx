import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function Statistik({ session, setCurrentPage }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('pengeluaran'); // Bisa toggle in/out

  useEffect(() => {
    fetchStatistik();
  }, [filterType]);

  const fetchStatistik = async () => {
    setLoading(true);
    // Ambil data bulan ini
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('transaction')
      .select(`amount, type, category (name, color)`)
      .is('deleted_at', null)
      .eq('type', filterType)
      .gte('date', firstDay);

    if (error) {
      console.error(error);
    } else {
      // Kelompokkan data berdasarkan kategori
      const grouped = data.reduce((acc, curr) => {
        const catName = curr.category?.name || 'Lainnya';
        const catColor = curr.category?.color || '#cbd5e1';
        if (!acc[catName]) {
          acc[catName] = { name: catName, value: 0, color: catColor };
        }
        acc[catName].value += curr.amount;
        return acc;
      }, {});

      setChartData(Object.values(grouped));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-20 font-sans bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm rounded-b-[2rem]">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center justify-center w-10 h-10 font-bold text-gray-600 bg-gray-100 rounded-2xl active:scale-90"
          >←</button>
          <h1 className="text-xl font-black tracking-tight text-gray-800 uppercase">Analisis Cuan</h1>
        </div>

        {/* Toggle Pemasukan / Pengeluaran */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilterType('pengeluaran')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${filterType === 'pengeluaran' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}
          >PENGELUARAN</button>
          <button
            onClick={() => setFilterType('pemasukan')}
            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${filterType === 'pemasukan' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-400'}`}
          >PEMASUKAN</button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="px-6 mt-8">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 min-h-[400px] flex flex-col items-center">
          <h3 className="mb-4 text-sm font-black tracking-widest text-gray-400 uppercase">Proporsi Bulan Ini</h3>

          {loading ? (
            <div className="flex items-center justify-center flex-1 font-bold text-gray-300 animate-pulse">MENGHITUNG...</div>
          ) : chartData.length > 0 ? (
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1000}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <span className="mb-2 text-4xl">🏜️</span>
              <p className="text-xs font-bold text-gray-400 uppercase">Belum ada data transaksi</p>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown List */}
      <div className="px-6 mt-8 space-y-3">
        <h3 className="ml-1 text-sm font-black tracking-widest text-gray-800 uppercase">Rincian Kategori</h3>
        {chartData.sort((a,b) => b.value - a.value).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-2xl border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <p className="text-sm font-bold text-gray-700">{item.name}</p>
            </div>
            <p className="text-sm font-black text-gray-800">Rp {item.value.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}