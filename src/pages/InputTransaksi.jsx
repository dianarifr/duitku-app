import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah, parseNumber } from '../utils/formatters';

export default function InputTransaksi({ session, setCurrentPage, type }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const amountInputRef = useRef(null);
  const [isShaking, setIsShaking] = useState(false);
  const [displayAmount, setDisplayAmount] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    amount: 0,
    category_id: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [showAlert, setShowAlert] = useState({ show: false, title: '', message: '' });

  useEffect(() => {
    const fetchSuggestions = async () => {
        const { data } = await supabase
        .from('transaction')
        .select('note')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50); // Ambil 50 data terakhir aja biar enteng

        if (data) {
        // Ambil yang unik dan bukan string kosong
        const uniqueNotes = [...new Set(data.map(t => t.note))].filter(Boolean);
        setSuggestions(uniqueNotes);
        }
    };
    fetchSuggestions();
    fetchCategories();
  }, []);

  const handleNoteChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, note: value });

    if (value.length > 1) {
        const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase()) && s !== value
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
    } else {
        setShowSuggestions(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('category')
      .select('*')
      .eq('type', type)
      .is('deleted_at', null);
    setCategories(data || []);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const formatted = formatRupiah(value);
    setDisplayAmount(formatted);
    setFormData({ ...formData, amount: parseNumber(formatted) });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      setShowAlert({
        show: true,
        title: 'Kosong Nih?',
        message: 'Masukin nominalnya dulu dong, masa catat nol rupiah? 💸'
      });
      return;
    }

    if (!formData.category_id) {
        setIsShaking(false);

        setTimeout(() => {
            setShowAlert({
                show: true,
                title: 'Kategorinya Mana?',
                message: 'Pilih salah satu ikon kategori di bawah ini ya, ges! 📂'
            });
            setIsShaking(true);
        }, 10);

        return;
    }

    setLoading(true);
    const { error } = await supabase.from('transaction').insert([{
      user_id: session.user.id,
      amount: formData.amount,
      category_id: formData.category_id,
      note: formData.note,
      date: formData.date,
      type: type
    }]);

    if (error) {
      alert('Waduh, gagal simpan: ' + error.message);
    } else {
      setCurrentPage('dashboard');
    }
    setLoading(false);
  };

  return (
    <> {/* 1. Dibungkus Fragment biar nggak error */}
      <div className="min-h-screen font-sans bg-white">
        {/* Header Statis */}
        <div className={`p-6 pt-12 text-white rounded-b-[2.5rem] shadow-lg transition-colors duration-500 ${type === 'pemasukan' ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="flex items-center gap-4 mb-4">
            <button
              type="button"
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center justify-center w-10 h-10 font-bold transition-transform bg-white/20 rounded-2xl active:scale-90"
            >
              ←
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase">Catat {type}</h1>
          </div>

          <div className="mt-4">
            <p className="mb-1 text-xs font-bold tracking-widest uppercase text-white/80">Nominal {type}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black opacity-80">Rp</span>
              <input
                ref={amountInputRef}
                type="text"
                placeholder="0"
                value={displayAmount}
                onChange={handleAmountChange}
                className="w-full text-4xl font-black bg-transparent outline-none placeholder:text-white/40"
                autoFocus
              />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pilih Kategori</label>
            {/* 2. Style animasi getar */}
            <div
              className="grid grid-cols-4 gap-3 mt-2"
              style={isShaking ? { animation: 'shake 0.1s ease-in-out 0s 10' } : {}}
            >
              {categories.length === 0 ? (
                <p className="col-span-4 p-4 text-xs italic text-center text-gray-400 bg-gray-50 rounded-2xl">Belum ada kategori {type} nih...</p>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({...formData, category_id: cat.id})}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${
                      formData.category_id === cat.id
                      ? 'border-blue-500 bg-blue-50 scale-105 shadow-sm'
                      : 'border-transparent bg-gray-50 opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[9px] font-bold text-gray-600 truncate w-full text-center uppercase tracking-tighter">{cat.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kapan?</label>
            <div className="relative mt-1">
              <input
                type="date"
                value={formData.date}
                onClick={(e) => e.target.showPicker()}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-4 font-bold text-gray-700 border-none appearance-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500"
                style={{ colorScheme: 'light' }}
              />
              <span className="absolute text-lg -translate-y-1/2 pointer-events-none right-4 top-1/2">📅</span>
            </div>
          </div>

          {/* Catatan Singkat dengan Auto-Complete */}
            <div className="relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Catatan Singkat</label>
            <input
                type="text"
                placeholder="Misal: Beli seblak mercon..."
                value={formData.note}
                onChange={handleNoteChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay biar klik saran ke-detect
                className="w-full p-4 mt-1 font-medium text-gray-700 border-none outline-none bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
            />

            {/* Daftar Saran Popup */}
            {showSuggestions && (
                <div className="absolute z-50 w-full mt-1 overflow-hidden duration-200 bg-white border border-gray-100 shadow-xl rounded-2xl animate-in fade-in zoom-in">
                {filteredSuggestions.map((suggestion, index) => (
                    <button
                    key={index}
                    type="button"
                    onClick={() => {
                        setFormData({ ...formData, note: suggestion });
                        setShowSuggestions(false);
                    }}
                    className="w-full p-4 text-sm font-bold text-left text-gray-600 transition-colors border-b border-gray-50 last:border-none hover:bg-blue-50 active:bg-blue-100"
                    >
                    ✨ {suggestion}
                    </button>
                ))}
                </div>
            )}
            </div>

          <button
            disabled={loading}
            className={`w-full py-4 rounded-3xl text-white font-black text-lg shadow-xl active:scale-95 transition-all mt-4 ${
              type === 'pemasukan' ? 'bg-green-500 shadow-green-100' : 'bg-red-500 shadow-red-100'
            } ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Sabar, lagi nyatet...' : `Simpan ${type}`}
          </button>
        </form>

        {/* Modal Alert */}
        {showAlert.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xs p-8 text-center bg-white shadow-2xl rounded-[2.5rem] animate-in zoom-in duration-300">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 text-4xl rounded-full bg-orange-50 animate-bounce">🤔</div>
              <h3 className="mb-2 text-xl font-black text-gray-800">{showAlert.title}</h3>
              <p className="mb-8 text-sm font-medium leading-relaxed text-gray-500">{showAlert.message}</p>
              <button
                onClick={() => {
                  setShowAlert({ ...showAlert, show: false });
                  if (formData.amount > 0) {
                    // Jika kategori yang kosong, scroll ke grid
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  } else {
                    // Jika nominal yang kosong, focus ke input
                    setTimeout(() => amountInputRef.current?.focus(), 100);
                  }
                }}
                className="w-full py-4 text-sm font-black text-white transition-transform bg-blue-600 shadow-lg rounded-2xl shadow-blue-100 active:scale-95"
              >
                Oke, Siap!
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Style Keyframes ditaruh di sini, dijamin aman dalam Fragment */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
          100% { transform: translateX(0); }
        }
      ` }} />
    </>
  );
}