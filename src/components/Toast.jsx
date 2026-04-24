import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Hilangkan "/90" biar warna solid 100%
  const bgColor = type === 'success' ? 'bg-gray-900' : 'bg-red-600';
  const icon = type === 'success' ? '✅' : '⚠️';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-in-out {
          0% { transform: translate(-50%, -120%); opacity: 0; }
          10% { transform: translate(-50%, 20px); opacity: 1; }
          15% { transform: translate(-50%, 0); opacity: 1; }
          90% { transform: translate(-50%, 0); opacity: 1; }
          100% { transform: translate(-50%, -120%); opacity: 0; }
        }
        .animate-toast {
          animation: toast-in-out 3s ease-in-out forwards;
        }
      ` }} />

      <div className={`fixed top-10 left-1/2 z-[9999] w-max max-w-[90vw] animate-toast`}>
        {/* Hapus backdrop-blur biar gak transparan sama sekali */}
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