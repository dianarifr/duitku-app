export default function LaporanSummary({ income, expense }) {
  return (
    <div className="px-6 mt-6">
      <div className="bg-blue-600 rounded-[2.5rem] p-8 shadow-xl text-white text-center">
        <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Netto Periode Ini</p>
        <h2 className="mb-4 text-3xl font-black">Rp {(income - expense).toLocaleString('id-ID')}</h2>
        <div className="flex justify-center gap-8 pt-4 border-t border-white/10">
          <div>
            <p className="text-[9px] font-black uppercase opacity-60">Masuk</p>
            <p className="text-sm font-black text-green-300">+{income.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase opacity-60">Keluar</p>
            <p className="text-sm font-black text-red-300">-{expense.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}