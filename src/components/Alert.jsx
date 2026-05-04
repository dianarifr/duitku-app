export default function Alert({ title, message, type = 'success', onConfirm }) {
  const icon = type === 'success' ? '✨' : '🤔';
  const buttonColor = type === 'success' ? 'bg-blue-600' : 'bg-red-600';
  const iconBg = type === 'success' ? 'bg-blue-50' : 'bg-red-50';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-xs p-8 text-center duration-300 bg-white shadow-2xl rounded-4xl animate-in zoom-in-95">
        {/* Icon Section */}
        <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 text-4xl rounded-full ${iconBg} shadow-inner`}>
          {icon}
        </div>

        {/* Text Section */}
        <h3 className="mb-2 text-xl italic font-black tracking-tight text-gray-800 uppercase">
          {title}
        </h3>
        <p className="px-2 mb-8 text-[11px] font-bold text-gray-400 uppercase leading-relaxed tracking-wide">
          {message}
        </p>

        {/* Action Button */}
        <button
          onClick={onConfirm}
          className={`w-full py-4 text-xs font-black text-white rounded-xl shadow-lg active:scale-95 transition-all ${buttonColor}`}
        >
          OKEEYY 👌
        </button>
      </div>
    </div>
  );
}