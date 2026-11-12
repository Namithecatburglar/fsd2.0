import React from 'react';

export const StatusBadge = ({ status, size = 'sm', showDot = true }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let styles = 'bg-zinc-900 text-zinc-400 border-zinc-700';
  let dotColor = 'bg-zinc-500';

  if (normalized === 'ONLINE' || normalized === 'ACTIVE' || normalized === 'SAFE' || normalized === 'COMPLETED' || normalized === 'OPERATIONAL') {
    styles = 'bg-white/10 text-white border-white/40 shadow-sm';
    dotColor = 'bg-white animate-pulse';
  } else if (normalized === 'WARNING' || normalized === 'MARGINAL' || normalized === 'HIGH' || normalized === 'IN PROGRESS') {
    styles = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (normalized === 'CRITICAL' || normalized === 'OVERDUE' || normalized === 'RESTRICTED' || normalized === 'EXCEEDED') {
    styles = 'bg-red-500/15 text-red-300 border-red-500/40 font-semibold';
    dotColor = 'bg-red-400 animate-ping';
  } else if (normalized === 'MAINTENANCE' || normalized === 'EN ROUTE' || normalized === 'SCHEDULED' || normalized === 'MEDIUM') {
    styles = 'bg-neutral-800 text-neutral-300 border-neutral-600';
    dotColor = 'bg-neutral-400';
  } else if (normalized === 'OFFLINE' || normalized === 'AT PORT' || normalized === 'LOW') {
    styles = 'bg-zinc-900 text-zinc-500 border-zinc-800';
    dotColor = 'bg-zinc-600';
  }

  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-1.5 py-0.5 tracking-wider' 
    : size === 'md' 
    ? 'text-xs px-3 py-1 tracking-widest' 
    : 'text-[11px] px-2 py-0.5 tracking-wider';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase border rounded-none font-medium whitespace-nowrap ${sizeClasses} ${styles}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor}`} />
      )}
      <span>{status}</span>
    </span>
  );
};
