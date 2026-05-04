export default function ActionHub({ show, onClose, onSelect }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-8 bg-white rounded-[3rem] shadow-2xl transform transition-all duration-300 ease-out scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar kecil (opsional, buat estetika aja) */}
        <div className="w-12 h-1.5 mx-auto mb-8 bg-gray-100 rounded-full" />

        <h3 className="mb-8 text-xl font-black tracking-tight text-center text-gray-800 uppercase">
          Pilih Transaksi
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-2">
          {/* Tombol Pengeluaran */}
          <button
            onClick={() => onSelect('input-pengeluaran')}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="flex items-center justify-center w-16 h-16 text-2xl transition-all duration-200 bg-red-50 rounded-[1.5rem] group-active:scale-90 border border-red-100 shadow-sm">
              📉
            </div>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Keluar</span>
          </button>

          {/* Tombol Pemasukan */}
          <button
            onClick={() => onSelect('input-pemasukan')}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="flex items-center justify-center w-16 h-16 text-2xl transition-all duration-200 bg-green-50 rounded-[1.5rem] group-active:scale-90 border border-green-100 shadow-sm">
              📈
            </div>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Masuk</span>
          </button>

          {/* Tombol Mutasi (Pindah Kantong) */}
          <button
            onClick={() => onSelect('input-mutasi')}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="flex items-center justify-center w-16 h-16 text-2xl transition-all duration-200 bg-blue-50 rounded-[1.5rem] group-active:scale-90 border border-blue-100 shadow-sm">
              ⇄
            </div>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Mutasi</span>
          </button>
        </div>

        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="w-full py-4 mt-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 transition-colors bg-gray-50 rounded-2xl hover:bg-gray-100"
        >
          Tutup Menu
        </button>
      </div>
    </div>
  );
}