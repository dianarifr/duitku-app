export default function AICoach({ aiAdvice, isAiLoading }) {
  if (!aiAdvice && !isAiLoading) return null;
  return (
    <div className="px-5 mt-6">
      <div className="bg-white border-2 border-blue-50 p-5 rounded-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-4xl opacity-10">🤖</div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">AI Coach Duitku</span>
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
  );
}