export default function SummarySection({ hasInputToday, loading, income, expense, onInputClick, formatNominal }) {
  return (
    <>
      <div className="px-6 mt-6">
        {!loading && !hasInputToday && (
          <div className="relative flex items-center justify-between p-4 transition-all duration-1000 ease-out bg-white border-2 shadow-xl group rounded-2xl border-indigo-50 animate-in fade-in slide-in-from-right-8 hover:shadow-indigo-100/50 animate-mini-jump">

            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-indigo-500 rounded-l-2xl animate-pulse"></div>

            <div className="flex items-center gap-4 ml-2">
              <div className="flex items-center transition-transform icon-box bg-indigo-50 rounded-xl group-hover:rotate-12">
                ✍️
              </div>
              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">
                  Self-Check
                </p>
                <p className="text-xs italic font-black tracking-tight text-slate-700">
                  Belum ada catatan hari ini, ges.
                </p>
              </div>
            </div>

            <button
              onClick={onInputClick}
              className="px-4 py-2 text-[10px] font-black text-white uppercase transition-all bg-indigo-600 shadow-lg rounded-xl
                        active:scale-90 hover:bg-indigo-700 shadow-indigo-100"
            >
              Catat 🚀
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 px-5 mt-4">
        <div className="p-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Masuk</p>
          <p className="text-sm font-black text-green-600">+ {formatNominal(income)}</p>
        </div>
        <div className="p-4 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
          <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Keluar</p>
          <p className="text-sm font-black text-red-600">- {formatNominal(expense)}</p>
        </div>
      </div>
    </>
  );
}