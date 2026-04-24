export default function TransactionList({ loading, transactions, onEdit, onDelete }) {
  if (loading) return <p className="py-10 text-xs font-black text-center text-gray-300 uppercase animate-pulse">Lagi Nyari Data...</p>;

  if (transactions.length === 0) return (
    <div className="text-center py-20 mx-6 mt-8 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 text-gray-400 font-bold uppercase text-[10px]">Kaga ada datanya ges 🕵️‍♂️</div>
  );

  return (
    <div className="px-6 pb-24 mt-8 space-y-4">
      {transactions.map((t) => (
        /* TASK 7: Tambahkan onDoubleClick pada container utama */
        <div
          key={t.id}
          onDoubleClick={() => onEdit(t)}
          className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform select-none cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-12 h-12 text-xl rounded-2xl" style={{ backgroundColor: `${t.category?.color}15`, color: t.category?.color }}>
                {t.category?.icon}
              </div>
              <div>
                <h4 className="text-sm font-black leading-tight text-gray-800 uppercase">{t.category?.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-base font-black ${t.type === 'pemasukan' ? 'text-green-500' : 'text-red-500'}`}>
                {t.type === 'pemasukan' ? '+' : '-'} {t.amount.toLocaleString('id-ID')}
              </p>
              <span className="text-[8px] font-black px-2 py-0.5 bg-gray-50 text-gray-400 rounded-lg border border-gray-100 uppercase">{t.payment_method}</span>
            </div>
          </div>

          {t.note && (
            <div className="px-4 py-3 border-l-4 border-blue-400 bg-gray-50 rounded-2xl">
              <p className="text-[11px] font-bold text-gray-600 italic leading-relaxed text-left">"{t.note}"</p>
            </div>
          )}

          {/* TASK 7: Tombol Edit Dihapus & Tombol Hapus Jadi Full Width */}
          <div className="pt-2 border-t border-gray-50">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Mencegah double click terpicu saat klik hapus
                onDelete(t.id);
              }}
              className="w-full py-3 bg-red-50 text-red-400 text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              🗑️ Hapus Transaksi
            </button>
          </div>
        </div>
      ))}

      {/* Tip kecil buat user */}
      <p className="text-center text-[8px] font-black text-gray-300 uppercase tracking-widest mt-4">
        💡 Klik 2x pada kartu untuk mengedit
      </p>
    </div>
  );
}