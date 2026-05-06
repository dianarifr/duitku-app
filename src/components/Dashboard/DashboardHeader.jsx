import * as Icon from '../../lib/icons';

export default function DashboardHeader({ userName, avatarUrl, totalBalance, periodLabel, onLogout, formatNominal }) {
  return (
    <div className="relative px-6 pt-12 overflow-hidden text-white bg-blue-600 shadow-lg pb-14 rounded-b-4xl">
      {/* Ornamen */}
      <div className="absolute w-40 h-40 rounded-full -top-5 -right-5 bg-white/10 blur-3xl"></div>

      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt="Profile" className="object-cover w-12 h-12 border-2 border-blue-400 rounded-full shadow-sm" />
          <div>
            <div className="flex items-center gap-1 opacity-80">
              <Icon.UserCircle size={10} strokeWidth={3} className="text-blue-100" />
              <p className="text-[10px] font-black tracking-[0.2em] text-blue-100 uppercase">Halo, bosku!</p>
            </div>
            <h2 className="text-lg font-black tracking-tight capitalize truncate w-44">{userName}</h2>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
        >
          <Icon.LogOut size={12} strokeWidth={3} />
          Logout
        </button>
      </div>

      <div className="relative z-10 py-2 text-center">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-blue-100 opacity-70">Saldo Keseluruhan</p>
        {/* Nominal besar dengan format standard */}
        <h1 className="text-4xl font-black tracking-tighter">
          {formatNominal(totalBalance)}
        </h1>
      </div>

      <div className="flex justify-center mt-3">
        <div className="flex items-center gap-2 px-3 py-1 border rounded-full bg-black/10 border-white/5">
          <Icon.Calendar size={10} strokeWidth={3} className="text-white/70" />
          <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">
            Periode: {periodLabel}
          </p>
        </div>
      </div>
    </div>
  );
}