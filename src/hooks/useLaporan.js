import { useState } from 'react';
import { supabase } from '../supabaseClient';

export function useLaporan(session, fetchFilteredData, showAlert) {
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteTransaction = async () => {
    const { error } = await supabase
      .from('transaction')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deleteId)
      .eq('user_id', session.user.id);

    if (!error) {
      showAlert(
        'Berhasil ges 👌',
        'Satu jejak transaksi udah resmi kita lenyapin dari laporan, ges! 🗑️',
        'success'
      );
      setDeleteId(null);
      fetchFilteredData();
    } else {
      showAlert(
        'Aduh kenapa nih 🤔',
        'Gagal hapus data, sistemnya lagi ngambek kayaknya ges! 😅',
        'error'
      );
    }
  };

  return {
    deleteId,
    setDeleteId,
    handleDeleteTransaction
  };
}