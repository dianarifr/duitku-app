import React from 'react';
import * as Icon from '../lib/icons';

export default function Alert({ title, message, type = 'success', onConfirm }) {
  // Memilih ikon berdasarkan tipe dari referensi centralized
  const renderIcon = type === 'success' ? (
    <Icon.CheckCircle2 size={34} strokeWidth={2} className="text-pos" />
  ) : (
    <Icon.Zap size={34} strokeWidth={2} className="text-danger" />
  );

  const buttonColor = type === 'success' ? 'btn-primary' : 'btn-danger';
  const iconBg = type === 'success' ? 'text-pos' : 'text-danger';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-5 animate-in fade-in duration-300">
      <div className="w-full max-w-xs border border-line bg-surface p-6 text-center animate-in zoom-in-95 duration-300">
        {/* Icon Section */}
        <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-surface-alt ${iconBg}`}>
          {renderIcon}
        </div>

        {/* Text Section */}
        <h3 className="mb-2 font-serif text-xl font-semibold tracking-tight text-ink">
          {title}
        </h3>
        <p className="mb-6 px-1 font-mono text-[10px] uppercase leading-relaxed tracking-[0.04em] text-muted">
          {message}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onConfirm}
          className={`btn w-full text-xs ${buttonColor}`}
        >
          <Icon.CheckCircle2 size={14} strokeWidth={2.5} />
          OKEEYY 👌
        </button>
      </div>
    </div>
  );
}