import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah, parseNumber } from '../utils/formatters';
import { useAlert } from '../context/alertStore';

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

  const fetchSuggestions = async () => {
    const { data } = await supabase.from('transaction').select('note').eq('type', activeTab).eq('user_id', session.user.id).is('deleted_at', null).order('created_at', { ascending: false }).limit(50);
    if (data) setSuggestions([...new Set(data.map(t => t.note))].filter(Boolean));
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, editData]);

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
      showAlert('Nominal belum diisi', 'Lengkapi nominal transaksi terlebih dahulu.', 'error', null, 'amount');
      return;
    }
    if (!formData.category_id) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      showAlert('Kategori belum dipilih', 'Pilih salah satu kategori terlebih dahulu.', 'error', null, 'category');
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
      showAlert(
        editData ? 'Perubahan tersimpan' : 'Transaksi tersimpan',
        editData ? 'Catatan transaksi berhasil diperbarui.' : 'Transaksi berhasil disimpan.',
        'success',
        () => {
          if (setEditData) setEditData(null);
          setCurrentPage(editData ? 'laporan' : 'dashboard');
        },
        editData ? 'edited' : 'saved'
      );
    } else {
      showAlert('Gagal menyimpan transaksi', 'Terjadi kesalahan pada sistem. Silakan coba lagi.', 'error', null, 'error');
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
