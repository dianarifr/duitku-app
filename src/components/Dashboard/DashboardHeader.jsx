export default function DashboardHeader({ userName, avatarUrl, totalBalance, periodLabel, onLogout }) {
  return (
    <div className="bg-blue-600 px-6 pt-12 pb-14 rounded-b-[3rem] shadow-lg text-white relative overflow-hidden">
      <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt="Profile" className="object-cover w-12 h-12 border-2 border-blue-400 rounded-full shadow-sm" />
          <div>
            <p className="text-xs font-medium tracking-widest text-blue-100 uppercase">Halo, bosku! 👋</p>
            <h2 className="text-lg font-black tracking-tight capitalize truncate w-44">{userName}</h2>
          </div>
        </div>
        <button onClick={onLogout} className="px-3 py-1.5 bg-white/20 rounded-xl text-[10px] font-black uppercase">Logout</button>
      </div>
      <div className="relative z-10 py-2 text-center">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-100 opacity-80">Saldo Keseluruhan</p>
        <h1 className="text-4xl font-black tracking-tighter">Rp {totalBalance.toLocaleString('id-ID')}</h1>
      </div>
      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest text-center mt-2">Periode: {periodLabel}</p>
    </div>
  );
}