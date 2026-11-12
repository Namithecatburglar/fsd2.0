import React from 'react';

export const KpiCard = ({
  title,
  value,
  subvalue,
  unit,
  icon: Icon,
  status = 'neutral',
  trend,
  className = '',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'positive':
        return 'text-white border-b-2 border-white';
      case 'warning':
        return 'text-amber-300 border-b-2 border-amber-500/50';
      case 'critical':
        return 'text-red-400 border-b-2 border-red-500';
      default:
        return 'text-neutral-400 border-b-2 border-neutral-700';
    }
  };

  return (
    <div
      className={`bg-wind-panel border border-wind-border hover:border-wind-borderLight transition-all p-5 flex flex-col justify-between relative overflow-hidden group ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase tracking-widest text-wind-secondary font-mono font-medium">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 bg-wind-surface border border-wind-border text-neutral-300 group-hover:text-white transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl lg:text-4xl font-mono font-bold tracking-tight text-wind-primary">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-mono text-wind-secondary font-medium">
              {unit}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-wind-border/50 flex items-center justify-between text-xs font-mono text-wind-secondary">
        <div>{subvalue}</div>
        {trend && (
          <span className={`text-[11px] px-1.5 py-0.5 rounded-sm border ${
            trend.startsWith('+') ? 'border-neutral-700 text-neutral-300' : 'border-neutral-700 text-neutral-400'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {/* Industrial micro-indicator line at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] ${getStatusColor()}`} />
    </div>
  );
};
