export default function HistoryList({ transactions, loading, onSeeAll, onEdit }) {
  return (
    <div className="px-5 mt-8">
      <div className="flex items-end justify-between px-1 mb-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-black leading-none text-gray-800">Riwayat Cuan</h3>
          <span className="text-[8px] font-bold text-blue-400 uppercase italic mt-1 animate-pulse">
            ⚡ Double Click buat edit
          </span>
        </div>
        <button onClick={onSeeAll} className="text-xs font-black text-blue-600 uppercase transition-transform active:scale-90">
          Semua
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-10 text-xs font-black text-center text-gray-400 uppercase animate-pulse">
            Lagi ngitung duit dulu 🙏
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((t) => (
            <div
              key={t.id}
              // JURUS SAKTI DOUBLE CLICK
              onDoubleClick={() => onEdit(t)}
              className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-3xl border-gray-50 active:scale-[0.98] transition-all cursor-pointer hover:border-blue-100 group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center w-12 h-12 text-xl transition-transform rounded-2xl group-hover:scale-110"
                  style={{ backgroundColor: `${t.category?.color}15`, color: t.category?.color }}
                >
                  {t.category?.icon}
                </div>
                <div>
                  <p className="w-32 text-sm font-black text-gray-800 uppercase truncate">
                    {t.note || t.category?.name}
                  </p>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    {t.category?.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black ${t.type === 'pengeluaran' ? 'text-red-500' : 'text-green-500'}`}>
                  {t.type === 'pengeluaran' ? '-' : '+'} {t.amount.toLocaleString('id-ID')}
                </p>
                <p className="text-[9px] font-bold text-gray-300 uppercase italic">
                  {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-xs font-black text-center text-gray-300 uppercase">
            Belum ada cuan masuk/keluar ges 😶
          </div>
        )}
      </div>
    </div>
  );
}