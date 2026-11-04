import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAlert } from '../context/alertStore';

export function useLaporan(session, fetchFilteredData) {
  const { showAlert } = useAlert();
  const [deleteId, setDeleteId] = useState(null);
  const [targetRelatedId, setTargetRelatedId] = useState(null);

  const handleDeleteTransaction = async () => {
    let query = supabase
      .from('transaction')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', session.user.id);

    // Mutasi tersimpan sebagai dua baris; keduanya dihapus lewat related_id.
    if (targetRelatedId) {
      query = query.eq('related_id', targetRelatedId);
    } else {
      query = query.eq('id', deleteId);
    }

    const { error } = await query;

    if (!error) {
      showAlert(
        'Transaksi dihapus',
        targetRelatedId
          ? 'Kedua sisi transaksi mutasi telah dihapus.'
          : 'Transaksi telah dihapus dari laporan.',
        'success',
        null,
        'deleted'
      );
      setDeleteId(null);
      setTargetRelatedId(null);
      fetchFilteredData();
    } else {
      showAlert('Gagal menghapus transaksi', 'Terjadi kesalahan pada sistem. Silakan coba lagi.', 'error', null, 'error');
    }
  };

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
