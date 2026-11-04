import { useEffect, useState } from 'react';
import * as Icon from '../lib/icons';

const readTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('duitku.theme', theme);
    }
    const meta = document.getElementById('theme-color-meta');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#14130f' : '#f6f3ec');
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap'}
      aria-pressed={isDark}
      title={isDark ? 'Tema terang' : 'Tema gelap'}
      className="btn btn-quiet min-h-9 gap-2 px-2.5"
    >
      {isDark ? <Icon.Sun size={16} strokeWidth={2} /> : <Icon.Moon size={16} strokeWidth={2} />}
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.08em] sm:inline">
        {isDark ? 'Terang' : 'Gelap'}
      </span>
    </button>
  );
}