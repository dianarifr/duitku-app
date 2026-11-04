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
    <div className="min-h-screen bg-paper pb-28 font-sans text-ink">
      {/* HEADER */}
      <div className="sticky top-0 z-40 border-b border-line bg-paper px-5 pb-4 pt-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage('dashboard')}
              className="btn btn-icon shrink-0"
              aria-label="Kembali"
            >
              <Icon.ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <h1 className="truncate font-serif text-xl font-semibold tracking-tight text-ink">Pengaturan</h1>
          </div>
          <button
            type="button"
            onClick={() => activeTab === 'list' ? kategoriHook.openAddModal() : recurringHook.openAddRecModal()}
            className="btn btn-primary min-h-10 w-10 shrink-0 px-0"
            aria-label="Tambah"
          >
            <Icon.Plus size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Cari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field pl-10"
          />
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
            <Icon.Search size={16} strokeWidth={2} />
          </span>
        </div>

        <div className="mt-3 flex border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${activeTab === 'list' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
          >
            <Icon.LayoutGrid size={13} strokeWidth={2.5} />
            Kategori
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            className={`flex flex-1 items-center justify-center gap-2 py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${activeTab === 'recurring' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
          >
            <Icon.Repeat size={13} strokeWidth={2.5} />
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