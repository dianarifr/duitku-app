import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah, parseNumber } from '../utils/formatters';
import { useAlert } from '../context/AlertContext';

export function useInputTransaksi(session, editData, setEditData, setCurrentPage, initialType) {
  const { showAlert } = useAlert();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialType === 'pemasukan' ? 'pemasukan' : 'pengeluaran');
  const [displayAmount, setDisplayAmount] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const [formData, setFormData] = useState({
    amount: 0,
    category_id: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        amount: editData.amount,
        category_id: editData.category_id,
        note: editData.note || '',
        date: editData.date,
        payment_method: editData.payment_method || 'cash',
      });
      setDisplayAmount(formatRupiah(editData.amount.toString()));
      setActiveTab(editData.type);
    }
    fetchCategories();
    fetchSuggestions();
  }, [activeTab, editData]);

  const fetchSuggestions = async () => {
    const { data } = await supabase.from('transaction').select('note').eq('type', activeTab).eq('user_id', session.user.id).is('deleted_at', null).order('created_at', { ascending: false }).limit(50);
    if (data) setSuggestions([...new Set(data.map(t => t.note))].filter(Boolean));
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('category').select('*').eq('type', activeTab).is('deleted_at', null);
    setCategories(data || []);
  };

  const handleAmountChange = (val) => {
    const formatted = formatRupiah(val);
    setDisplayAmount(formatted);
    setFormData(prev => ({ ...prev, amount: parseNumber(formatted) }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      showAlert('Kosong Nih?', 'Masukin nominalnya dulu dong! 💸', 'error');
      return;
    }
    if (!formData.category_id) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        showAlert('Kategorinya Mana?', 'Pilih salah satu ikon kategori dulu ya! 📂', 'error');
        return;
    }

    setLoading(true);
    const payload = {
      user_id: session.user.id,
      ...formData,
      type: activeTab,
      ...(editData && { updated_at: new Date().toISOString() })
    };

    const { error } = editData
      ? await supabase.from('transaction').update(payload).eq('id', editData.id)
      : await supabase.from('transaction').insert([payload]);

    if (!error) {
      // Kita pakai argument ke-4 (onConfirmExtra) untuk pindah halaman
      showAlert(
        'Berhasil ges 👌',
        editData ? 'Catatan berhasil diupdate! ✨' : 'Transaksi berhasil disimpan! 🚀',
        'success',
        () => {
          if (setEditData) setEditData(null);
          setCurrentPage(editData ? 'laporan' : 'dashboard');
        }
      );
    } else {
      showAlert(
        'Aduh kenapa nih 🤔',
        'Gagal simpan data, sistemnya lagi ngambek kayaknya ges! 😅',
        'error'
      );
    }
    setLoading(false);
  };

  return {
    categories, loading, activeTab, setActiveTab, displayAmount,
    filteredSuggestions, setFilteredSuggestions, showSuggestions, setShowSuggestions,
    categoryFilter, setCategoryFilter, isShaking,
    formData, setFormData, handleAmountChange, handleSave, suggestions
  };
}