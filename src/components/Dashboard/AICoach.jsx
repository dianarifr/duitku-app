import * as Icon from '../../lib/icons';

export default function AICoach({ aiAdvice, isAiLoading, isExpanded, onToggle }) {
  if (!aiAdvice && !isAiLoading) return null;

  return (
    <div className="px-5 mt-6 transition-all duration-300">
      {isExpanded ? (
        // TAMPILAN FULL (EXPANDED)
        <div className="duration-300 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between px-1 mb-2">
            <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Financial Coach</h3>
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-[10px] font-black text-red-400 uppercase hover:text-red-500 transition-colors cursor-pointer"
            >
              Sembunyikan
              <Icon.EyeOff size={10} strokeWidth={3} />
            </button>
          </div>

          <div className="relative p-5 overflow-hidden bg-white border-2 shadow-sm border-blue-50 rounded-2xl group">
            <div className="absolute top-0 right-0 p-4 text-blue-600 transition-transform opacity-10 group-hover:rotate-12">
              <Icon.Bot size={48} strokeWidth={2} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md shadow-blue-100">AI Coach Duitku</span>
                {isAiLoading && (
                  <span className="text-[9px] font-black text-blue-400 animate-pulse uppercase tracking-widest">Lagi Mikir...</span>
                )}
              </div>
              <p className="text-sm italic font-bold leading-relaxed text-gray-700">
                "{aiAdvice || "Sabar Puh, lagi ngumpulin kata-kata pedas..."}"
              </p>
            </div>
          </div>
        </div>
      ) : (
        // TAMPILAN ONE-LINER (COLLAPSED)
        <div
          onClick={onToggle}
          className="bg-white/60 backdrop-blur-sm border border-gray-100 p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white transition-all active:scale-[0.98] shadow-sm animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center justify-center text-blue-600 shadow-inner w-7 h-7 bg-blue-50 rounded-xl shrink-0">
            <Icon.Sparkles size={14} strokeWidth={3} />
          </div>

          <div className="flex-1 overflow-hidden">
            {isAiLoading ? (
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-blue-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            ) : (
              <p className="text-[10px] font-bold text-gray-500 truncate tracking-tight uppercase">
                {aiAdvice ? `Saran: ${aiAdvice}` : "Ada bisikan cuan buat lo hari ini, Puh..."}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">Buka</span>
            <Icon.Maximize2 size={10} strokeWidth={3} className="text-blue-500 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}