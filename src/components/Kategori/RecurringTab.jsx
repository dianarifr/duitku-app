export default function RecurringTab({ recurringData, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      {recurringData.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-100 font-black text-[10px] text-gray-400 uppercase">Tagihan tidak ditemukan ges 🕵️‍♂️</div>
      ) : (
        recurringData.map((rec) => (
          <div
            key={rec.id}
            onDoubleClick={() => onEdit(rec)}
            className="p-5 bg-white border border-gray-100 shadow-sm rounded-[2rem] flex flex-col active:scale-[0.98] transition-transform cursor-pointer select-none"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="flex items-center justify-center w-12 h-12 text-2xl rounded-2xl shrink-0"
                  style={{ backgroundColor: `${rec.category?.color || '#94a3b8'}15`, color: rec.category?.color || '#64748b' }}>
                  {rec.category?.icon || '🔄'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-black tracking-tight text-gray-800 uppercase truncate">{rec.note}</h4>
                  <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest truncate">Tgl {rec.billing_date} • {rec.category?.name || 'Umum'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="mb-1 text-sm font-black text-gray-800">Rp {rec.amount.toLocaleString('id-ID')}</p>
                <p className="text-[8px] font-bold text-gray-300 uppercase">{rec.payment_method}</p>
              </div>
            </div>

            {/* Task 7: Full Width Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(rec.id); }}
              className="w-full py-2.5 bg-red-50 text-red-400 text-[9px] font-black uppercase rounded-xl active:scale-95 transition-all"
            >
              🗑️ Hapus Tagihan Rutin
            </button>
          </div>
        ))
      )}
    </div>
  );
}