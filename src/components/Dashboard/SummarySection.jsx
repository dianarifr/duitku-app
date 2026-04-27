export default function SummarySection({ hasInputToday, loading, income, expense, onInputClick }) {
  return (
    <>
      <div className="px-5 space-y-4 mt-7">
        {!loading && !hasInputToday && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4 rounded-[2rem] shadow-xl flex items-center justify-between border border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-2xl">📝</div>
              <div>
                <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">Lupa nyatet?</p>
                <p className="text-xs font-bold text-white">Belum ada catatan hari ini.</p>
              </div>
            </div>
            <button onClick={onInputClick} className="bg-white text-orange-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md cursor-pointer">Isi Sekarang</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 px-5 mt-4">
        <div className="p-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Masuk</p>
          <p className="text-sm font-black text-green-600">+ Rp {income.toLocaleString('id-ID')}</p>
        </div>
        <div className="p-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Keluar</p>
          <p className="text-sm font-black text-red-600">- Rp {expense.toLocaleString('id-ID')}</p>
        </div>
      </div>
    </>
  );
}