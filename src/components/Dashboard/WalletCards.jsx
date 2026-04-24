export default function WalletCards({ wallet }) {
  return (
    <div className="relative z-30 grid grid-cols-2 gap-4 px-5 -mt-8">
      <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-orange-50 flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs">💵</span>
          <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Dompet</span>
        </div>
        <p className="text-sm font-black text-gray-800">Rp {wallet.dompet.toLocaleString('id-ID')}</p>
      </div>
      <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-blue-50 flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs">📱</span>
          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Bank</span>
        </div>
        <p className="text-sm font-black text-gray-800">Rp {wallet.bank.toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}