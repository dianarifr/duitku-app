import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAlert } from '../context/AlertContext';

export const useInputMutasi = (session, setCurrentPage, editData, setEditData) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [displayAmount, setDisplayAmount] = useState('');

  const [formData, setFormData] = useState({
    amount: 0,
    category_id: null,
    note: '',
    source: 'transfer', // Default: Dari Bank
    date: new Date().toISOString().split('T')[0]
  });

  // SINKRONISASI EDIT DATA
  useEffect(() => {
    if (editData && editData.type === 'mutasi') {
      // 1. Normalisasi string biar aman dari typo huruf besar/kecil
      const note = editData.note || '';
      const method = (editData.payment_method || 'transfer').toLowerCase();

      // 2. Logika Penentuan Source (DARI MANA duitnya berasal)
      const isKeluar = note.includes('[KELUAR]');

      let finalSource = 'transfer';
      if (isKeluar) {
        // Kalau yang diklik adalah sisi KELUAR, maka payment_method itu adalah ASAL-nya
        finalSource = method === 'cash' ? 'cash' : 'transfer';
      } else {
        // Kalau yang diklik sisi MASUK (misal masuk ke Cash), berarti ASAL-nya dari BANK (transfer)
        finalSource = method === 'cash' ? 'transfer' : 'cash';
      }

      // 3. Bersihkan Note
      const cleanNote = note.replace('[KELUAR]', '').replace('[MASUK]', '').trim();

      // 4. Update SEKALIGUS (Satu kali setFormData untuk semua field)
      setFormData({
        amount: editData.amount,
        category_id: editData.category_id,
        note: cleanNote,
        source: finalSource,
        date: editData.date
      });

      // 5. Update tampilan nominal (tanpa memicu setFormData lagi di sini)
      setDisplayAmount(editData.amount.toLocaleString('id-ID'));
    }
  }, [editData]);

  // FETCH KATEGORI
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

  // HANDLE NOMINAL SAAT KETIK MANUAL
  const handleAmountChange = (value) => {
    const rawValue = value.replace(/\D/g, '');
    const numValue = parseFloat(rawValue) || 0;

    // Gunakan functional update (prev) agar tidak menimpa field source/note
    setFormData(prev => ({ ...prev, amount: numValue }));
    setDisplayAmount(rawValue ? numValue.toLocaleString('id-ID') : '');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (formData.amount <= 0) return showAlert("Nominal jangan kosong, Puh!", "error");
    if (!formData.category_id) return showAlert("Pilih kategorinya dulu, Puh!", "error");

    setLoading(true);

    try {
      const mutationId = editData?.related_id || crypto.randomUUID();
      const destination = formData.source === 'cash' ? 'transfer' : 'cash';

      // Hapus data lama jika mode edit
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

      showAlert(editData ? "Koreksi mutasi berhasil!" : "Saldo berhasil dipindahkan!", "success");

      if (setEditData) setEditData(null);
      setCurrentPage('dashboard');

    } catch (error) {
      showAlert("Gagal: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading, formData, setFormData, displayAmount, categories,
    handleAmountChange, handleSave
  };
};