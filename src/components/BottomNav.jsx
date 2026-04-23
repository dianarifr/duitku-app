import React from 'react';

export default function BottomNav({ currentPage, setCurrentPage }) {
  const menus = [
    { id: 'dashboard', icon: '🏠', label: 'Home' },
    { id: 'laporan', icon: '📊', label: 'Laporan' },
    { id: 'input', icon: '✨', label: 'Catat', primary: true }, // Icon Kece: Sparkles
    { id: 'statistik', icon: '📈', label: 'Stats' },
    { id: 'kategori', icon: '⚙️', label: 'Set' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
      <div className="flex items-center gap-1 p-2 bg-white/70 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] pointer-events-auto">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setCurrentPage(menu.id)}
            className={`relative flex flex-col items-center justify-center transition-all duration-500 ${
              menu.primary
                ? 'w-16 h-16 bg-gradient-to-br from-orange-400 via-rose-500 to-purple-600 rounded-full shadow-[0_10px_25px_rgba(244,63,94,0.4)] -translate-y-6 border-4 border-white'
                : 'w-12 h-12 rounded-2xl'
            } ${
              currentPage === menu.id && !menu.primary
                ? 'bg-gray-900 text-white scale-110 shadow-lg'
                : 'text-gray-400'
            } active:scale-95`}
          >
            <span className={`${menu.primary ? 'text-2xl text-white drop-shadow-md animate-pulse' : 'text-xl'}`}>
              {menu.icon}
            </span>

            {currentPage === menu.id && !menu.primary && (
              <span className="absolute w-1 h-1 bg-gray-900 rounded-full -bottom-1"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}