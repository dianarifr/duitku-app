import { useInputMutasi } from '../hooks/useInputMutasi';
import * as Icon from '../lib/icons';

// Tambahkan prop editData dan setEditData
export default function InputMutasi({ session, setCurrentPage, editData, setEditData }) {
  const {
    loading, formData, setFormData, displayAmount, categories,
    handleAmountChange, handleSave
  } = useInputMutasi(session, setCurrentPage, editData, setEditData); // Kirim ke hook

  return (
    <div className="min-h-screen pb-10 font-sans bg-white">
      {/* HEADER & NOMINAL SECTION */}
      <div className="p-6 pt-12 text-white bg-indigo-600 shadow-lg rounded-b-4xl shadow-indigo-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
                onClick={() => {
                if (typeof setEditData === 'function') setEditData(null); // Proteksi biar gak crash
                  setCurrentPage('laporan');
                }}
                className="flex items-center justify-center w-10 h-10 font-bold bg-white/20 rounded-2xl active:scale-90"
            >
                <Icon.ArrowLeft size={20} strokeWidth={3} />
            </button>
            <div className="flex items-center gap-2">
              <Icon.ArrowLeftRight size={18} strokeWidth={3} className="text-indigo-200" />
              <h1 className="text-xl italic font-black tracking-tight uppercase">
                  {editData ? 'Koreksi Mutasi' : 'Pindah Kantong'}
              </h1>
            </div>
          </div>

          {/* Toggle Button: Sekarang otomatis terpilih kalau mode edit */}
          <div className="relative flex h-10 p-1 overflow-hidden border bg-white/20 backdrop-blur-md rounded-xl w-44 border-white/10">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-in-out ${
                formData.source === 'cash' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />

            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, source: 'transfer'}))}
              className={`flex-1 text-[9px] font-black z-10 transition-colors flex items-center justify-center gap-1 ${
                formData.source === 'transfer' ? 'text-indigo-600' : 'text-white'
              }`}
            >
              <Icon.Landmark size={10} strokeWidth={3} />
              BANK
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, source: 'cash'}))}
              className={`flex-1 text-[9px] font-black z-10 transition-colors flex items-center justify-center gap-1 ${
                formData.source === 'cash' ? 'text-indigo-600' : 'text-white'
              }`}
            >
              <Icon.Wallet size={10} strokeWidth={3} />
              CASH
            </button>
          </div>
        </div>

        <div className="px-2 mt-4">
          <p className="mb-1 text-[10px] font-black tracking-widest uppercase text-white/70">Nominal Pindah</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black opacity-80">Rp</span>
            <input
                type="text"
                placeholder="0"
                value={displayAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full text-4xl font-black bg-transparent outline-none placeholder:text-white/40"
                autoFocus
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-8 space-y-8">
        {/* CATEGORY SELECTOR */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Kategori</label>
          <div className="grid grid-cols-4 gap-3 p-1 overflow-y-auto max-h-64 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({...formData, category_id: cat.id})}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl transition-all border-2 ${formData.category_id === cat.id ? 'border-indigo-500 bg-indigo-50 scale-[1.05]' : 'border-transparent bg-gray-50'}`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-[8px] font-black uppercase truncate w-full px-2 text-center ${formData.category_id === cat.id ? 'text-indigo-600' : 'text-gray-500'}`}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DATE & NOTE SECTION */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal</label>
            <div className="relative mt-1">
              <input
                type="date"
                value={formData.date}
                onClick={(e) => e.target.showPicker()}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-4 font-bold text-gray-700 border-none outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute top-0 bottom-0 right-0 flex items-center justify-center w-12 text-indigo-400 pointer-events-none bg-gray-50 rounded-r-xl">
                <Icon.Calendar size={18} strokeWidth={3} />
              </span>
            </div>
          </div>
        </div>

        <div className="relative text-left">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catatan</label>
          <input type="text" placeholder="Setor tunai / Tarik tunai?" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full p-4 mt-1 text-sm font-bold text-gray-700 border-none outline-none bg-gray-50 rounded-xl focus:ring-2 focus:ring-indigo-500" />
        </div>

        <button disabled={loading} className={`w-full py-5 rounded-xl text-white font-black text-lg shadow-xl active:scale-95 transition-all mt-6 bg-indigo-600 shadow-indigo-100 flex items-center justify-center gap-3 ${loading ? 'opacity-50' : ''}`}>
          {loading ? (
            'MEMPROSES...'
          ) : (
            <>
              <Icon.CheckCircle2 size={20} strokeWidth={3} />
              {editData ? 'UPDATE MUTASI' : 'KONFIRMASI MUTASI'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}