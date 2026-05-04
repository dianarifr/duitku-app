import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAlert } from '../context/AlertContext';

export function useLaporan(session, fetchFilteredData) {
  const { showAlert } = useAlert();
  const [deleteId, setDeleteId] = useState(null);
  const [targetRelatedId, setTargetRelatedId] = useState(null); // Tambahan untuk handle mutasi

  const handleDeleteTransaction = async () => {
    let query = supabase
      .from('transaction')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', session.user.id);

    // LOGIC: Jika ada related_id (Mutasi), hapus keduanya sekaligus
    if (targetRelatedId) {
      query = query.eq('related_id', targetRelatedId);
    } else {
      query = query.eq('id', deleteId);
    }

    const { error } = await query;

    if (!error) {
      showAlert(
        'Berhasil ges 👌',
        targetRelatedId
          ? 'Sepasang transaksi mutasi udah resmi kita lenyapin, ges! 🗑️'
          : 'Satu jejak transaksi udah resmi kita lenyapin dari laporan, ges! 🗑️',
        'success'
      );
      setDeleteId(null);
      setTargetRelatedId(null);
      fetchFilteredData();
    } else {
      showAlert(
        'Aduh kenapa nih 🤔',
        'Gagal hapus data, sistemnya lagi ngambek kayaknya ges! 😅',
        'error'
      );
    }
  };

  // Fungsi helper untuk set delete dengan cek related_id
  const confirmDelete = (transaction) => {
    setDeleteId(transaction.id);
    setTargetRelatedId(transaction.related_id || null);
  };

  return {
    deleteId,
    setDeleteId,
    confirmDelete,
    handleDeleteTransaction
  };
}