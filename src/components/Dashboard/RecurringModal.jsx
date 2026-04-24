export default function RecurringModal({ show, pending, onPay, onClose }) {
  if (!show || pending.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Tambah mb-20 supaya modal naik ke atas bottom navigation */}
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 pb-10 mb-20 animate-in slide-in-from-bottom-10 shadow-2xl border border-gray-100">
        <h2 className="text-xl font-black text-center text-gray-800">Ada Tagihan Rutin Bestie ✨</h2>

        {/* Kontainer Scroll: Biar kalau tagihan banyak bisa di-scroll tanpa ngerusak layout */}
        <div className="mt-6 space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {pending.map(rec => (
            <div key={rec.id} className="flex items-center justify-between p-4 border border-gray-100 bg-gray-50 rounded-2xl">
               <div className="flex items-center gap-3">
                 <span className="text-xl">{rec.category?.icon}</span>
                 <div>
                   <p className="text-sm font-black text-gray-800">{rec.note}</p>
                   <p className="text-[10px] font-bold text-blue-600 uppercase">Rp {rec.amount.toLocaleString('id-ID')}</p>
                 </div>
               </div>
               <button
                onClick={() => onPay(rec)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm active:scale-95 transition-transform"
               >
                 Bayar
               </button>
            </div>
          ))}
        </div>

        {/* Tombol Tutup sekarang aman terlihat karena ada mb-20 di atas */}
        <button
          onClick={onClose}
          className="w-full mt-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}