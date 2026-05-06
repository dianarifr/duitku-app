import * as Icon from '../../lib/icons';

export default function RecurringModal({ show, pending, onPay, onClose }) {
  if (!show || pending.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Tambah mb-20 supaya modal naik ke atas bottom navigation */}
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 pb-10 mb-20 animate-in slide-in-from-bottom-10 shadow-2xl border border-gray-100">

        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 mb-3 text-blue-600 bg-blue-50 rounded-2xl">
            <Icon.Bell size={24} strokeWidth={3} className="animate-bounce" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-center text-gray-800 uppercase">
            Tagihan Rutin Tersedia
          </h2>
        </div>

        {/* Kontainer Scroll: Biar kalau tagihan banyak bisa di-scroll tanpa ngerusak layout */}
        <div className="mt-6 space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          {pending.map(rec => (
            <div key={rec.id} className="flex items-center justify-between p-4 transition-colors border border-gray-100 bg-gray-50 rounded-2xl group hover:border-blue-200">
               <div className="flex items-center gap-3">
                 <div className="flex items-center justify-center w-10 h-10 text-xl bg-white shadow-sm rounded-xl">
                   {rec.category?.icon}
                 </div>
                 <div>
                   <p className="text-sm font-black text-gray-800">{rec.note}</p>
                   <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                     Rp {rec.amount.toLocaleString('id-ID')}
                   </p>
                 </div>
               </div>
               <button
                onClick={() => onPay(rec)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-sm active:scale-95 transition-all hover:bg-blue-700"
               >
                 <Icon.CreditCard size={12} strokeWidth={3} />
                 Bayar
               </button>
            </div>
          ))}
        </div>

        {/* Tombol Tutup sekarang aman terlihat karena ada mb-20 di atas */}
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full mt-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
        >
          <Icon.X size={14} strokeWidth={3} />
          Tutup
        </button>
      </div>
    </div>
  );
}