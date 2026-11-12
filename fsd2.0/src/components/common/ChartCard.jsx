import React from 'react';

export const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  className = '',
  height = 'h-64 sm:h-72',
}) => {
  return (
    <div className={`bg-wind-panel border border-wind-border p-4 flex flex-col ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-wind-border/60">
        <div>
          <h3 className="text-xs uppercase font-mono font-semibold text-wind-primary tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white inline-block"></span>
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11px] font-mono text-wind-secondary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      <div className={`w-full ${height} relative`}>
        {children}
      </div>
    </div>
  );
};
