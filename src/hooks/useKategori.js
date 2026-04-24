import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah } from '../utils/formatters';

export function useKategori(session, fetchData, showToast) {
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
      setIsModalOpen(false);
      fetchData();
      showToast('Kategori berhasil disimpan! 🙌');
    } else {
      showToast('Gagal simpan kategori ges 😅', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    const { error } = await supabase.from('category').update({ deleted_at: new Date() }).eq('id', deleteId).eq('user_id', session.user.id);

    if (!error) {
      setDeleteId(null);
      fetchData();
      showToast('Kategori sudah dibuang ke tong sampah! 🗑️');
    } else {
      showToast('Gagal hapus kategori 😅', 'error');
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