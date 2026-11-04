import * as Icon from '../../lib/icons';

export default function WalletCards({ wallet, formatNominal }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-5 pt-5">
      <div className="panel flex flex-col gap-1 p-4">
        <div className="mb-1 flex items-center gap-2">
          <Icon.Wallet size={14} strokeWidth={2} className="text-accent" />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Cash</span>
        </div>
        <p className="font-mono text-sm font-medium text-ink tabular-nums">{formatNominal(wallet.dompet)}</p>
      </div>

      <div className="panel flex flex-col gap-1 p-4">
        <div className="mb-1 flex items-center gap-2">
          <Icon.Landmark size={14} strokeWidth={2} className="text-focus" />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Bank</span>
        </div>
        <p className="font-mono text-sm font-medium text-ink tabular-nums">{formatNominal(wallet.bank)}</p>
      </div>
    </div>
  );
}