import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah } from '../utils/formatters';

export function useRecurring(session, fetchData, showToast) {
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
      setIsRecModalOpen(false);
      fetchData();
      showToast('Tagihan rutin aman tersimpan! 🙌');
    } else {
      showToast('Waduh, rutin gagal disave 😅', 'error');
    }
  };

  const handleDeleteRecurring = async () => {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', deleteRecId).eq('user_id', session.user.id);

    if (!error) {
      setDeleteRecId(null);
      fetchData();
      showToast('Tagihan rutin resmi dihapus! 🗑️');
    } else {
      showToast('Gagal hapus tagihan 😅', 'error');
    }
  };

  const handleToggleRecurringActive = async (id, currentStatus) => {
    const newStatus = currentStatus === false ? true : false;
    const { error } = await supabase.from('recurring_transactions').update({ is_active: newStatus }).eq('id', id).eq('user_id', session.user.id);

    if (!error) {
      fetchData();
      showToast(newStatus ? 'Tagihan diaktifkan kembali! 🔥' : 'Tagihan dinonaktifkan sementara 🧊');
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