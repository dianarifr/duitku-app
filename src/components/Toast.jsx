import { useEffect, useState } from 'react';

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

  const bgColor = type === 'success' ? 'bg-gray-900' : 'bg-red-600';
  const icon = type === 'success' ? '✅' : '⚠️';

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

      <div className={`fixed top-10 left-1/2 z-[9999] w-max max-w-[90vw] ${visible ? 'animate-toast-in' : 'animate-toast-out'}`}>
        <div className={`${bgColor} text-white px-6 py-4 rounded-[1.8rem] shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex items-center gap-4 border border-white/10 ring-4 ring-black/10`}>
          <div className="flex items-center justify-center text-lg rounded-full shadow-inner w-9 h-9 bg-white/15">
            {icon}
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 text-white/50">
              {type === 'success' ? 'Notification' : 'Warning'}
            </p>
            <p className="text-[12px] font-black leading-tight uppercase tracking-wide">
              {message}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}