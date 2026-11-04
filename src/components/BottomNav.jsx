import React from 'react';
import * as Icon from '../lib/icons';

export default function BottomNav({ currentPage, setCurrentPage, onActionClick }) {
  const menus = [
    { id: 'dashboard', icon: Icon.Home, label: 'Home' },
    { id: 'laporan', icon: Icon.FileText, label: 'Laporan' },
    { id: 'input', icon: Icon.Plus, label: 'Catat', primary: true },
    { id: 'kategori', icon: Icon.LayoutGrid, label: 'Set' },
    { id: 'statistik', icon: Icon.TrendingUp, label: 'Stats' },
  ];

  return (
    <nav className="dock" aria-label="Navigasi utama">
      <div className="dock-inner">
        {menus.map((menu) => {
          const IconComponent = menu.icon;
          const isActive = currentPage === menu.id && !menu.primary;

          if (menu.primary) {
            return (
              <button
                key={menu.id}
                type="button"
                onClick={onActionClick}
                className="dock-primary"
                aria-label={menu.label}
              >
                <span className="dock-primary-box">
                  <IconComponent size={22} strokeWidth={2.5} />
                </span>
                <span className="dock-label">{menu.label}</span>
              </button>
            );
          }

          return (
            <button
              key={menu.id}
              type="button"
              onClick={() => setCurrentPage(menu.id)}
              className={`dock-item ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent size={20} strokeWidth={2} />
              <span className="dock-label">{menu.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}