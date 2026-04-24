import { useState } from 'react';
import { supabase } from '../supabaseClient';

export function useLaporan(session, fetchFilteredData, showToast) {
  const [deleteId, setDeleteId] = useState(null);

  const handleDeleteTransaction = async () => {
    console.log("Menghapus ID:", deleteId); // Debug 1

    const { error } = await supabase
      .from('transaction')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', deleteId)
      .eq('user_id', session.user.id);

    if (!error) {
      setDeleteId(null);
      if (showToast) showToast('Transaksi Berhasil Dihapus! 🗑️');
      fetchFilteredData(); // Refresh data otomatis
    } else {
      showToast('Gagal hapus transaksi 😅', 'error');
    }
  };

  return {
    deleteId, setDeleteId,
    handleDeleteTransaction
  };
}