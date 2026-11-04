import * as Icon from '../lib/icons';

const ICONS = {
  saved: { Component: Icon.CheckCircle2, tone: 'text-pos', surface: 'bg-pos/10' },
  edited: { Component: Icon.SquarePen, tone: 'text-pos', surface: 'bg-pos/10' },
  transfer: { Component: Icon.ArrowLeftRight, tone: 'text-mut', surface: 'bg-mut/10' },
  deleted: { Component: Icon.Trash2, tone: 'text-muted', surface: 'bg-muted/10' },
  amount: { Component: Icon.Coins, tone: 'text-accent', surface: 'bg-accent/10' },
  category: { Component: Icon.LayoutGrid, tone: 'text-accent', surface: 'bg-accent/10' },
  reminder: { Component: Icon.Bell, tone: 'text-pos', surface: 'bg-pos/10' },
  reminderOff: { Component: Icon.Bell, tone: 'text-muted', surface: 'bg-muted/10' },
  error: { Component: Icon.AlertTriangle, tone: 'text-danger', surface: 'bg-danger/10' },
  info: { Component: Icon.Info, tone: 'text-mut', surface: 'bg-mut/10' },
};

const resolveIcon = (type, icon) => {
  if (icon && ICONS[icon]) return ICONS[icon];
  return type === 'success' ? ICONS.saved : ICONS.error;
};

export default function Alert({ title, message, type = 'success', icon, onConfirm }) {
  const { Component, tone, surface } = resolveIcon(type, icon);
  const buttonColor = type === 'success' ? 'btn-primary' : 'btn-danger';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-5 animate-in fade-in duration-300">
      <div className="w-full max-w-xs border border-line bg-surface p-6 text-center animate-in zoom-in-95 duration-300">
        <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${surface} ${tone}`}>
          <Component size={26} strokeWidth={1.75} />
        </div>

        <h3 className="mb-2 font-serif text-xl font-semibold tracking-tight text-ink">
          {title}
        </h3>
        <p className="mb-6 px-1 text-xs leading-relaxed text-muted">
          {message}
        </p>

        <button
          type="button"
          onClick={onConfirm}
          className={`btn w-full text-xs ${buttonColor}`}
        >
          <Icon.Check size={14} strokeWidth={2.5} />
          Mengerti
        </button>
      </div>
    </div>
  );
}
