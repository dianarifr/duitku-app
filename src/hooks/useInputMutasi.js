import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAlert } from '../context/alertStore';

export const useInputMutasi = (session, setCurrentPage, editData, setEditData) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [displayAmount, setDisplayAmount] = useState('');

  const [formData, setFormData] = useState({
    amount: 0,
    category_id: null,
    note: '',
    source: 'transfer',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (editData && editData.type === 'mutasi') {
      const note = editData.note || '';
      const method = (editData.payment_method || 'transfer').toLowerCase();

      // Sisi [KELUAR] menyimpan kantong asal; sisi [MASUK] menyimpan kantong tujuan.
      const finalSource = note.includes('[KELUAR]')
        ? (method === 'cash' ? 'cash' : 'transfer')
        : (method === 'cash' ? 'transfer' : 'cash');

      setFormData({
        amount: editData.amount,
        category_id: editData.category_id,
        note: note.replace('[KELUAR]', '').replace('[MASUK]', '').trim(),
        source: finalSource,
        date: editData.date
      });

      setDisplayAmount(editData.amount.toLocaleString('id-ID'));
    }
  }, [editData]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('category')
        .select('*')
        .eq('type', 'pemasukan')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (!error) setCategories(data);
    };
    fetchCategories();
  }, [session.user.id]);

  const handleAmountChange = (value) => {
    const rawValue = value.replace(/\D/g, '');
    const numValue = parseFloat(rawValue) || 0;

    // Functional update agar source dan note tidak tertimpa.
    setFormData(prev => ({ ...prev, amount: numValue }));
    setDisplayAmount(rawValue ? numValue.toLocaleString('id-ID') : '');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (formData.amount <= 0) {
      return showAlert('Nominal belum diisi', 'Lengkapi nominal mutasi terlebih dahulu.', 'error', null, 'amount');
    }
    if (!formData.category_id) {
      return showAlert('Kategori belum dipilih', 'Pilih kategori mutasi terlebih dahulu.', 'error', null, 'category');
    }

    setLoading(true);

    try {
      const mutationId = editData?.related_id || crypto.randomUUID();
      const destination = formData.source === 'cash' ? 'transfer' : 'cash';

      if (editData?.related_id) {
        const { error: delError } = await supabase
          .from('transaction')
          .delete()
          .eq('related_id', editData.related_id);
        if (delError) throw delError;
      }

      const entries = [
        {
          user_id: session.user.id,
          amount: formData.amount,
          category_id: formData.category_id,
          type: 'mutasi',
          payment_method: formData.source,
          note: `[KELUAR] ${formData.note}`.trim(),
          date: formData.date,
          related_id: mutationId
        },
        {
          user_id: session.user.id,
          amount: formData.amount,
          category_id: formData.category_id,
          type: 'mutasi',
          payment_method: destination,
          note: `[MASUK] ${formData.note}`.trim(),
          date: formData.date,
          related_id: mutationId
        }
      ];

      const { error: insError } = await supabase.from('transaction').insert(entries);
      if (insError) throw insError;

      showAlert(
        editData ? 'Perubahan tersimpan' : 'Mutasi berhasil',
        editData ? 'Data mutasi berhasil diperbarui.' : 'Saldo berhasil dipindahkan antar kantong.',
        'success',
        null,
        editData ? 'edited' : 'transfer'
      );

      if (setEditData) setEditData(null);
      setCurrentPage('dashboard');

    } catch (error) {
      showAlert('Gagal menyimpan mutasi', error.message, 'error', null, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading, formData, setFormData, displayAmount, categories,
    handleAmountChange, handleSave
  };
};
