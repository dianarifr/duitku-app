import React from 'react';
import { formatNominal } from '../../utils/formatters';

export default function TransactionList({ loading, transactions, onEdit, hook }) {
  // Ambil confirmDelete dari hook untuk handle hapus sepasang mutasi
  const { deleteId, setDeleteId, handleDeleteTransaction, confirmDelete } = hook;

  if (loading) return <p className="py-10 text-xs font-black text-center text-gray-300 uppercase animate-pulse">Lagi Nyari Data...</p>;

  if (transactions.length === 0) return (
    <div className="text-center py-20 mx-6 mt-8 bg-white rounded-2xl border-2 border-dashed border-gray-100 text-gray-400 font-bold uppercase text-[10px]">Kaga ada datanya ges 🕵️‍♂️</div>
  );

  return (
    <>
      <div className="px-6 pb-24 mt-4 space-y-4">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-blue-400 uppercase italic animate-pulse">
            ⚡ Double Click buat edit
          </span>
        </div>

        {transactions.map((t) => {
          const isMutation = t.type === 'mutasi';
          const isIncome = t.type === 'pemasukan';

          return (
            <div
              key={t.id}
              onDoubleClick={() => onEdit(t)}
              className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform select-none cursor-pointer hover:border-blue-300 hover:shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Gunakan class .icon-box dan warna Indigo jika Mutasi */}
                  <div
                    className="icon-box"
                    style={{
                      backgroundColor: isMutation ? '#4f46e515' : `${t.category?.color}15`,
                      color: isMutation ? '#4f46e5' : t.category?.color
                    }}
                  >
                    {isMutation ? '⇄' : t.category?.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black leading-tight text-gray-800 uppercase">
                      {isMutation ? 'Mutasi Saldo' : t.category?.name}
                    </h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {/* Nominal dengan warna Indigo untuk mutasi */}
                  <p className={`text-base font-black ${
                    isMutation ? 'text-indigo-600' : isIncome ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isIncome || (isMutation && t.note?.includes('[MASUK]')) ? '+' : '-'} {formatNominal(t.amount).replace('Rp', '').trim()}
                  </p>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase ${
                    isMutation ? 'bg-indigo-50 text-indigo-400 border-indigo-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    {t.payment_method}
                  </span>
                </div>
              </div>

              {t.note && (
                <div className={`px-4 py-3 border-l-4 rounded-2xl ${isMutation ? 'border-indigo-400 bg-indigo-50/30' : 'border-blue-400 bg-gray-50'}`}>
                  <p className="text-[11px] font-bold text-gray-600 italic leading-relaxed text-left">"{t.note}"</p>
                </div>
              )}

              <div className="pt-2 border-t border-gray-50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete(t); // Panggil helper dari hook untuk cek related_id
                  }}
                  className="w-full py-3 bg-red-50 text-red-400 text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  🗑️ Hapus Transaksi
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DELETE TRANSAKSI */}
      {deleteId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem]">
            <h3 className="mb-2 text-xl font-black text-gray-800 uppercase">Hapus Transaksi?</h3>
            <p className="mb-8 text-[10px] font-bold text-gray-400 uppercase">
              Catatan ini bakal hilang dari riwayat, ges 🤝
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-4 text-[10px] font-black text-gray-400 bg-gray-50 rounded-2xl">Batal</button>
              <button onClick={handleDeleteTransaction} className="flex-1 py-4 text-[10px] font-black text-white bg-red-500 rounded-2xl shadow-lg">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}