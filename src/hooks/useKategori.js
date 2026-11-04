import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah } from '../utils/formatters';
import { useAlert } from '../context/alertStore';

export function useKategori(session, fetchData) {
  const { showAlert } = useAlert();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'pengeluaran', icon: '🍔', color: '#3B82F6', budget: 0 });
  const [displayBudget, setDisplayBudget] = useState('');

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'pengeluaran', icon: '🍔', color: '#3B82F6', budget: 0 });
    setDisplayBudget('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color, budget: cat.budget || 0 });
    setDisplayBudget(cat.budget ? formatRupiah(cat.budget.toString()) : '');
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const payload = { ...formData, user_id: session.user.id, budget: formData.type === 'pengeluaran' ? Number(formData.budget) : 0 };

    const { error } = editingId
      ? await supabase.from('category').update({ ...payload, updated_at: new Date() }).eq('id', editingId).eq('user_id', session.user.id)
      : await supabase.from('category').insert([payload]);

    if (!error) {
      showAlert('Kategori tersimpan', 'Perubahan kategori berhasil disimpan.', 'success', null, 'saved');
      setIsModalOpen(false);
      fetchData();
    } else {
      showAlert('Gagal menyimpan kategori', 'Terjadi kesalahan pada sistem. Silakan coba lagi.', 'error', null, 'error');
    }
  };

  const handleDeleteCategory = async () => {
    const { error } = await supabase.from('category').update({ deleted_at: new Date() }).eq('id', deleteId).eq('user_id', session.user.id);

    if (!error) {
      showAlert('Kategori dihapus', 'Kategori telah dihapus dari daftar.', 'success', null, 'deleted');
      setDeleteId(null);
      fetchData();
    } else {
      showAlert('Gagal menghapus kategori', 'Terjadi kesalahan pada sistem. Silakan coba lagi.', 'error', null, 'error');
    }
  };

  return {
    isModalOpen, setIsModalOpen,
    deleteId, setDeleteId,
    editingId,
    formData, setFormData,
    displayBudget, setDisplayBudget,
    openAddModal, openEditModal,
    handleSaveCategory, handleDeleteCategory
  };
}
