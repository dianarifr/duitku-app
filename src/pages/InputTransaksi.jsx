import { useRef } from 'react';
import { useInputTransaksi } from '../hooks/useInputTransaksi';

export default function InputTransaksi({ session, setCurrentPage, type: initialType, editData, setEditData }) {
  const amountInputRef = useRef(null);

  // Ambil semua dari Hook (termasuk state alert)
  const {
    categories, loading, activeTab, setActiveTab, displayAmount,
    filteredSuggestions, setFilteredSuggestions, showSuggestions, setShowSuggestions,
    categoryFilter, setCategoryFilter, isShaking,
    formData, setFormData, handleAmountChange, handleSave, suggestions
  } = useInputTransaksi(session, editData, setEditData, setCurrentPage, initialType);

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, note: value });
    if (value.length > 1) {
      const filtered = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()) && s !== value);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="min-h-screen pb-10 font-sans bg-white">
      {/* HEADER & NOMINAL SECTION */}
      <div className={`p-6 pt-12 text-white rounded-b-[2.5rem] shadow-lg transition-colors duration-500 ${activeTab === 'pemasukan' ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { if(setEditData) setEditData(null); setCurrentPage(editData ? 'laporan' : 'dashboard'); }}
              className="flex items-center justify-center w-10 h-10 font-bold bg-white/20 rounded-2xl active:scale-90"
            >
              ←
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase">{editData ? 'Ubah Catatan' : `Catat ${activeTab}`}</h1>
          </div>
          {!editData && (
            <div className="relative flex h-10 p-1 overflow-hidden bg-white/20 backdrop-blur-md rounded-2xl w-44">
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-transform duration-300 ${activeTab === 'pemasukan' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`} />
              <button onClick={() => setActiveTab('pengeluaran')} className={`flex-1 text-[10px] font-black z-10 ${activeTab === 'pengeluaran' ? 'text-red-500' : 'text-white'}`}>KELUAR</button>
              <button onClick={() => setActiveTab('pemasukan')} className={`flex-1 text-[10px] font-black z-10 ${activeTab === 'pemasukan' ? 'text-green-500' : 'text-white'}`}>MASUK</button>
            </div>
          )}
        </div>
        <div className="px-2 mt-4">
          <p className="mb-1 text-[10px] font-black tracking-widest uppercase text-white/70">Nominal Transaksi</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black opacity-80">Rp</span>
            <input ref={amountInputRef} type="text" placeholder="0" value={displayAmount} onChange={(e) => handleAmountChange(e.target.value)} className="w-full text-4xl font-black bg-transparent outline-none placeholder:text-white/40" autoFocus={!editData} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-8 space-y-8">
        {/* CATEGORY SELECTOR */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih Kategori</label>
            {categories.length > 8 && (
              <input type="text" placeholder="Cari..." value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-[10px] font-bold bg-gray-100 border-none rounded-xl px-3 py-1.5 outline-none w-28 focus:w-36 transition-all" />
            )}
          </div>
          <div className={`grid ${categories.length > 0 ? 'grid-cols-4' : 'grid-cols-1'} gap-3 p-1 overflow-y-auto max-h-64 custom-scrollbar`} style={isShaking ? { animation: 'shake 0.1s ease-in-out 0s 10' } : {}}>
            {categories.length > 0 ? (
              categories.filter(c => c.name.toLowerCase().includes(categoryFilter.toLowerCase())).map((cat) => (
                <button key={cat.id} type="button" onClick={() => setFormData({...formData, category_id: cat.id})} className={`flex flex-col items-center gap-2 py-4 rounded-[1.5rem] transition-all border-2 ${formData.category_id === cat.id ? (activeTab === 'pemasukan' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') + ' scale-[1.05]' : 'border-transparent bg-gray-50'}`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <span className={`text-[8px] font-black uppercase truncate w-full px-2 text-center ${formData.category_id === cat.id ? (activeTab === 'pemasukan' ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}`}>{cat.name}</span>
                </button>
              ))
            ) : (
              <button type="button" onClick={() => setCurrentPage('kategori')} className="p-8 text-center bg-blue-50 border-2 border-dashed border-blue-200 rounded-[2rem] group active:scale-95 transition-all">
                <div className="mb-2 text-3xl transition-transform group-hover:scale-110">📂</div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-relaxed">Belum ada kategori {activeTab}.<br/>Klik di sini untuk buat dulu!</p>
              </button>
            )}
          </div>
        </div>

        {/* DATE & METHOD */}
        <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tanggal</label>
            <div className="relative mt-1">
              <input type="date" value={formData.date} onClick={(e) => e.target.showPicker()} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-4 font-bold text-gray-700 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" />
              <span className="absolute text-lg -translate-y-1/2 pointer-events-none right-4 top-1/2">📅</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Metode</label>
            <div className="flex gap-2 mt-1">
              {['cash', 'transfer'].map((method) => (
                <button key={method} type="button" onClick={() => setFormData({ ...formData, payment_method: method })} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase border-2 flex items-center justify-center gap-2 ${formData.payment_method === method ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' : 'border-transparent bg-gray-50 text-gray-400'}`}>
                  <span>{method === 'cash' ? '💵' : '📱'}</span> {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NOTE & SUGGESTIONS */}
        <div className="relative text-left">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catatan</label>
          <input type="text" placeholder="Beli apa ges?" value={formData.note} onChange={handleNoteChange} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="w-full p-4 mt-1 text-sm font-bold text-gray-700 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500" />
          {showSuggestions && (
            <div className="absolute z-50 w-full mt-2 overflow-hidden bg-white border border-gray-100 shadow-2xl rounded-[1.5rem]">
              {filteredSuggestions.map((suggestion, index) => (
                <button key={index} type="button" onClick={() => { setFormData({ ...formData, note: suggestion }); setShowSuggestions(false); }} className="w-full p-4 text-xs font-black text-left text-gray-500 uppercase border-b border-gray-50 last:border-none hover:bg-gray-50">✨ {suggestion}</button>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button disabled={loading} className={`w-full py-5 rounded-[2rem] text-white font-black text-lg shadow-xl active:scale-95 transition-all mt-6 ${activeTab === 'pemasukan' ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'} ${loading ? 'opacity-50' : ''}`}>
          {loading ? 'MENYIMPAN...' : editData ? `UPDATE ${activeTab.toUpperCase()}` : `SIMPAN ${activeTab.toUpperCase()}`}
        </button>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 50% { transform: translateX(8px); } 75% { transform: translateX(-8px); } } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }` }} />
    </div>
  );
}