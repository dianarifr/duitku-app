import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { formatRupiah } from '../utils/formatters';
import { useAlert } from '../context/AlertContext';

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
      showAlert(
        'Berhasil ges 👌',
        'Kategori berhasil disimpan! 🙌',
        'success',
      );
      setIsModalOpen(false);
      fetchData();
    } else {
      showAlert(
        'Aduh kenapa nih 🤔',
        'Gagal simpan kategori, sistemnya lagi ngambek kayaknya ges! 😅',
        'error'
      );
    }
  };

  const handleDeleteCategory = async () => {
    const { error } = await supabase.from('category').update({ deleted_at: new Date() }).eq('id', deleteId).eq('user_id', session.user.id);

    if (!error) {
      showAlert(
        'Berhasil ges 👌',
        'Kategori sudah dibuang ke tong sampah! 🗑️',
        'success'
      );
      setDeleteId(null);
      fetchData();
    } else {
      showAlert(
        'Aduh kenapa nih 🤔',
        'Gagal hapus kategori, sistemnya lagi ngambek kayaknya ges! 😅',
        'error'
      );
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