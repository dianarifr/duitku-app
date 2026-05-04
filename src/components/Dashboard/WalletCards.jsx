
export default function WalletCards({ wallet, formatNominal }) {
  return (
    <div className="relative z-30 grid grid-cols-2 gap-4 px-5 -mt-8">
      <div className="flex flex-col gap-1 p-4 bg-white border shadow-xl rounded-4xl border-orange-50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs">💵</span>
          <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Dompet</span>
        </div>
        <p className="text-sm font-black text-gray-800">{formatNominal(wallet.dompet)}</p>
      </div>
      <div className="flex flex-col gap-1 p-4 bg-white border shadow-xl rounded-4xl border-blue-50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs">📱</span>
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Bank</span>
        </div>
        <p className="text-sm font-black text-gray-800">{formatNominal(wallet.bank)}</p>
      </div>
    </div>
  );
}