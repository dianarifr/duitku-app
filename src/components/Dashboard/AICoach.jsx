import * as Icon from '../../lib/icons';

export default function AICoach({ aiAdvice, isAiLoading, isExpanded, onToggle }) {
  if (!aiAdvice && !isAiLoading) return null;

  return (
    <div className="mt-6 px-5">
      {isExpanded ? (
        <div>
          <div className="mb-2 flex items-center justify-between px-0.5">
            <h3 className="section-label">Financial coach</h3>
            <button
              type="button"
              onClick={onToggle}
              className="btn btn-quiet min-h-7 gap-1 px-1 font-mono text-[9px] uppercase tracking-[0.06em] text-muted"
            >
              Sembunyikan
              <Icon.EyeOff size={10} strokeWidth={2.5} />
            </button>
          </div>

          <div className="panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-accent px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-accent-ink">
                <Icon.Bot size={11} strokeWidth={2.5} />
                AI Coach Duitku
              </span>
              {isAiLoading && (
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">Lagi mikir...</span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-ink-soft">
              "{aiAdvice || 'Sabar Puh, lagi ngumpulin kata-kata pedas...'}"
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="panel flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:border-line-strong"
        >
          <div className="icon-box h-8 w-8 shrink-0">
            <Icon.Sparkles size={14} strokeWidth={2} className="text-accent" />
          </div>

          <div className="flex-1 overflow-hidden">
            {isAiLoading ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Lagi mikir...</span>
            ) : (
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
                {aiAdvice ? `Saran: ${aiAdvice}` : 'Ada bisikan cuan buat lo hari ini, Puh...'}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 font-mono text-[8px] uppercase tracking-[0.06em] text-accent">
            Buka
            <Icon.Maximize2 size={10} strokeWidth={2.5} />
          </div>
        </button>
      )}
    </div>
  );
}