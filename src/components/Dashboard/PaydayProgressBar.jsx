import React from 'react';
import * as Icon from '../../lib/icons';

export default function PaydayProgressBar({ payday }) {
  // 1. Logika Perhitungan Siklus
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  let startCycle, endCycle;

  if (d >= payday) {
    startCycle = new Date(y, m, payday);
    endCycle = new Date(y, m + 1, payday);
  } else {
    startCycle = new Date(y, m - 1, payday);
    endCycle = new Date(y, m, payday);
  }

  const totalDays = Math.round((endCycle - startCycle) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.round((today - startCycle) / (1000 * 60 * 60 * 24));
  const daysLeft = totalDays - daysPassed;
  const progress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);

  // 2. Status & Pesan Survival
  const getStatus = () => {
    if (progress < 20) return {
      msg: "Bensin full, Puh! Gaspol tapi rem dijaga. 🔥",
      color: "bg-green-500",
      text: "text-green-500",
      icon: <Icon.Zap size={14} strokeWidth={3} />
    };
    if (progress < 60) return {
      msg: "Setengah jalan. Ritme jajan jangan kendor! ☕",
      color: "bg-blue-500",
      text: "text-blue-500",
      icon: <Icon.TrendingUp size={14} strokeWidth={3} />
    };
    if (daysLeft <= 7) return {
      msg: "Mode Survival! Hawa Inunaki mulai terasa... 💀",
      color: "bg-red-500",
      text: "text-red-500",
      icon: <Icon.TrendingDown size={14} strokeWidth={3} />
    };
    return {
      msg: "Dikit lagi gajian, Puh. Bertahanlah! 🏁",
      color: "bg-yellow-500",
      text: "text-yellow-500",
      icon: <Icon.Sparkles size={14} strokeWidth={3} />
    };
  };

  const status = getStatus();

  return (
    <div className="px-5 mt-6 transition-all duration-300">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Survival Gauge</h3>
        <div className="flex items-center gap-1 text-[8px] font-black text-blue-400 uppercase tracking-tighter italic">
          <Icon.Calendar size={10} strokeWidth={3} />
          Target: {endCycle.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="relative p-5 overflow-hidden bg-white border-2 shadow-sm border-blue-50 rounded-2xl group">
        <div className="absolute top-0 right-0 p-4 text-blue-600 transition-transform opacity-10 group-hover:rotate-12">
          <Icon.Calendar size={48} strokeWidth={2} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-widest italic ${status.text}`}>
                {status.msg}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-black leading-none text-gray-800">{daysLeft}</span>
              <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">Hari Lagi</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 overflow-hidden border border-gray-100 rounded-full shadow-inner bg-gray-50">
            <div
              className={`h-full transition-all duration-1000 ease-out rounded-full ${status.color}`}
              style={{ width: `${progress}%` }}
            />
            {/* Glow effect on the tip */}
            <div
              className="absolute top-0 bottom-0 flex items-center justify-center transition-all duration-1000"
              style={{ left: `calc(${progress}% - 10px)` }}
            >
              <Icon.Sparkles size={8} className="text-white/60 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between mt-3 px-0.5">
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest">Start Cycle</span>
              <span className="text-[8px] font-bold text-gray-500">
                {startCycle.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest">Payday Goal</span>
              <span className="text-[8px] font-bold text-gray-500">
                {endCycle.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}