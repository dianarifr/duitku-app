import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getFinancialRange } from '../utils/formatters';
import * as Icon from '../lib/icons';

import CategoryTab from '../components/Kategori/CategoryTab';
import RecurringTab from '../components/Kategori/RecurringTab';

import { useKategori } from '../hooks/useKategori';
import { useRecurring } from '../hooks/useRecurring';

export default function Kategori({ session, setCurrentPage }) {
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [recurringData, setRecurringData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ payday: 1 });

  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchData = async (pd) => {
    setLoading(true);
    const payday = pd || userProfile.payday;
    const { start } = getFinancialRange(payday);

    const [catRes, transRes, recRes] = await Promise.all([
      supabase.from('category').select('*').eq('user_id', session.user.id).is('deleted_at', null).order('created_at', { ascending: false }),
      supabase.from('transaction').select('amount, category_id').eq('user_id', session.user.id).is('deleted_at', null).gte('date', start),
      supabase.from('recurring_transactions').select('*, category(*)').eq('user_id', session.user.id).order('billing_date', { ascending: true })
    ]);

    setCategories(catRes.data || []);
    setTransactions(transRes.data || []);
    setRecurringData(recRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: profile } = await supabase.from('profiles').select('payday').eq('id', session.user.id).single();
      const pd = profile?.payday || 1;
      setUserProfile({ payday: pd });
      fetchData(pd);
    };
    init();
  }, []);

  const handleUpdatePayday = async (val) => {
    await supabase.from('profiles').update({ payday: val }).eq('id', session.user.id);
    setUserProfile({ payday: val });
    fetchData(val);
  };

  // INIT CUSTOM HOOKS
  const kategoriHook = useKategori(session, fetchData);
  const recurringHook = useRecurring(session, fetchData);

  // Filters
  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRecurring = recurringData.filter(r => r.note.toLowerCase().includes(searchTerm.toLowerCase()) || r.category?.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen pb-24 font-sans text-gray-900 bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-40 px-6 pt-12 pb-4 bg-white shadow-sm rounded-b-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center justify-center w-10 h-10 text-gray-500 bg-gray-100 rounded-2xl active:scale-90"
            >
              <Icon.ArrowLeft size={20} strokeWidth={3} />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase">Pengaturan</h1>
          </div>
          <button
            onClick={() => activeTab === 'list' ? kategoriHook.openAddModal() : recurringHook.openAddRecModal()}
            className="flex items-center justify-center w-10 h-10 text-white bg-blue-600 shadow-md rounded-xl active:scale-90"
          >
            <Icon.Plus size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 text-sm font-bold bg-gray-100 border-none outline-none rounded-xl focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute text-gray-900 -translate-y-1/2 left-4 top-1/2 opacity-30">
            <Icon.Search size={18} strokeWidth={3} />
          </span>
        </div>

        <div className="flex p-1.5 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            <Icon.LayoutGrid size={14} strokeWidth={3} />
            Kategori
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'recurring' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
          >
            <Icon.Repeat size={14} strokeWidth={3} />
            Rutin
          </button>
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'list' ? (
          <CategoryTab
            payday={userProfile.payday}
            categories={filteredCategories}
            transactions={transactions}
            onUpdatePayday={handleUpdatePayday}
            hook={kategoriHook}
          />
        ) : (
          <RecurringTab
            recurringData={filteredRecurring}
            categories={categories}
            hook={recurringHook}
          />
        )}
      </div>
    </div>
  );
}