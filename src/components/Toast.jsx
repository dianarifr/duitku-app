import { useEffect, useState } from 'react';
import * as Icon from '../lib/icons';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 1. Timer buat mulai animasi keluar (di detik ke 2.7)
    const exitTimer = setTimeout(() => {
      setVisible(false);
    }, 2700);

    // 2. Timer buat bener-bener nge-close komponen (di detik ke 3)
    const closeTimer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-ink text-paper' : 'bg-danger text-danger-ink';

  // Memilih ikon berdasarkan tipe dari referensi centralized
  const renderIcon = type === 'success' ? (
    <Icon.CheckCircle2 size={18} strokeWidth={2.5} className="text-pos" />
  ) : (
    <Icon.Zap size={18} strokeWidth={2.5} className="text-danger-ink" />
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-in {
          0% { transform: translate(-50%, -150%); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes toast-out {
          0% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -150%); opacity: 0; }
        }
        .animate-toast-in { animation: toast-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards; }
        .animate-toast-out { animation: toast-out 0.3s ease-in forwards; }
      ` }} />

      <div className={`fixed left-1/2 top-8 z-[9999] w-max max-w-[90vw] ${visible ? 'animate-toast-in' : 'animate-toast-out'}`}>
        <div className={`${bgColor} flex items-center gap-3 border border-line px-5 py-3.5 shadow-lg`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-paper/10">
            {renderIcon}
          </div>
          <div className="flex flex-col text-left">
            <p className="mb-0.5 font-mono text-[9px] uppercase leading-none tracking-[0.14em] opacity-50">
              {type === 'success' ? 'Notification' : 'Warning'}
            </p>
            <p className="text-[11px] font-semibold leading-tight uppercase tracking-wide">
              {message}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}