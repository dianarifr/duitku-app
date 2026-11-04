import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah } from '../utils/formatters';
import { useAlert } from '../context/alertStore';

export function useRecurring(session, fetchData) {
  const { showAlert } = useAlert();
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [deleteRecId, setDeleteRecId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [recFormData, setRecFormData] = useState({ category_id: '', amount: 0, note: '', billing_date: 1, payment_method: 'transfer' });
  const [displayRecAmount, setDisplayRecAmount] = useState('');
  const [recCatSearch, setRecCatSearch] = useState('');

  const openAddRecModal = () => {
    setEditingId(null);
    setRecFormData({ category_id: '', amount: 0, note: '', billing_date: 1, payment_method: 'transfer' });
    setDisplayRecAmount('');
    setRecCatSearch('');
    setIsRecModalOpen(true);
  };

  const openEditRec = (rec) => {
    setEditingId(rec.id);
    setRecFormData({ category_id: rec.category_id, amount: rec.amount, note: rec.note, billing_date: rec.billing_date, payment_method: rec.payment_method });
    setDisplayRecAmount(formatRupiah(rec.amount.toString()));
    setRecCatSearch('');
    setIsRecModalOpen(true);
  };

  const handleSaveRecurring = async (e) => {
    e.preventDefault();
    const payload = { ...recFormData, user_id: session.user.id };

    const { error } = editingId
      ? await supabase.from('recurring_transactions').update(payload).eq('id', editingId).eq('user_id', session.user.id)
      : await supabase.from('recurring_transactions').insert([payload]);

    if (!error) {
      showAlert('Tagihan rutin tersimpan', 'Pengingat tagihan rutin berhasil disimpan.', 'success', null, 'saved');
      setIsRecModalOpen(false);
      fetchData();
    } else {
      showAlert('Gagal menyimpan tagihan', 'Terjadi kesalahan pada sistem. Silakan coba lagi.', 'error', null, 'error');
    }
  };

  const handleDeleteRecurring = async () => {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', deleteRecId).eq('user_id', session.user.id);

    if (!error) {
      showAlert('Tagihan rutin dihapus', 'Pengingat tagihan rutin telah dihapus.', 'success', null, 'deleted');
      setDeleteRecId(null);
      fetchData();
    } else {
      showAlert('Gagal menghapus tagihan', 'Terjadi kesalahan pada sistem. Silakan coba lagi.', 'error', null, 'error');
    }
  };

  const handleToggleRecurringActive = async (id, currentStatus) => {
    const newStatus = currentStatus === false ? true : false;
    const { error } = await supabase.from('recurring_transactions').update({ is_active: newStatus }).eq('id', id).eq('user_id', session.user.id);

    if (!error) {
      fetchData();
      showAlert(
        newStatus ? 'Tagihan diaktifkan' : 'Tagihan dinonaktifkan',
        newStatus ? 'Pengingat tagihan rutin aktif kembali.' : 'Pengingat tagihan rutin dihentikan sementara.',
        'success',
        null,
        newStatus ? 'reminder' : 'reminderOff'
      );
    }
  };

  return {
    isRecModalOpen, setIsRecModalOpen,
    deleteRecId, setDeleteRecId,
    editingId,
    recFormData, setRecFormData,
    displayRecAmount, setDisplayRecAmount,
    recCatSearch, setRecCatSearch,
    openAddRecModal, openEditRec,
    handleSaveRecurring, handleDeleteRecurring, handleToggleRecurringActive
  };
}
