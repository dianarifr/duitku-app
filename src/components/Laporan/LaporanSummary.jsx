import React from 'react';
import { formatNominal } from '../../utils/formatters';

export default function LaporanSummary({ income, expense, mutation = 0 }) {
  // Netto tetap Income - Expense karena Mutasi tidak mengubah kekayaan bersih
  const netto = income - expense;

  return (
    <div className="px-6 mt-6">
      <div className="relative p-8 overflow-hidden text-center text-white bg-blue-600 shadow-xl shadow-blue-100/50 rounded-4xl">
        {/* Ornamen Latar */}
        <div className="absolute top-0 right-0 w-32 h-32 -mt-16 -mr-16 rounded-full bg-white/5 blur-2xl"></div>

        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase opacity-70 tracking-[0.3em] mb-1">
            Netto Periode Ini
          </p>
          <h2 className="mb-6 text-3xl font-black tracking-tighter">
            {formatNominal(netto)}
          </h2>

          <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/10">
            <div>
              <p className="text-[8px] font-black uppercase opacity-60 tracking-widest mb-1">Masuk</p>
              <p className="text-[11px] font-black text-green-300 italic">
                +{formatNominal(income).replace('Rp', '').trim()}
              </p>
            </div>

            {/* Divider Virtual */}
            <div className="border-x border-white/10">
              <p className="text-[8px] font-black uppercase opacity-60 tracking-widest mb-1">Keluar</p>
              <p className="text-[11px] font-black text-red-300 italic">
                -{formatNominal(expense).replace('Rp', '').trim()}
              </p>
            </div>

            <div>
              <p className="text-[8px] font-black uppercase opacity-60 tracking-widest mb-1">Mutasi</p>
              <p className="text-[11px] font-black text-indigo-200 italic">
                {formatNominal(mutation).replace('Rp', '').trim()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}