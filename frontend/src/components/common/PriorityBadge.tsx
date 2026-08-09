import React from 'react';

interface PriorityBadgeProps {
  priority?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '', size = 'md' }) => {
  const norm = (priority || 'P4').toUpperCase();

  let style = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  let label = norm;

  if (norm === 'P1' || norm === 'IMMEDIATE' || norm === 'CRITICAL') {
    style = 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border-rose-500/40 font-bold';
    label = 'P1 — Critical';
  } else if (norm === 'P2' || norm === 'HIGH') {
    style = 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/40 font-semibold';
    label = 'P2 — High';
  } else if (norm === 'P3' || norm === 'MEDIUM') {
    style = 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40';
    label = 'P3 — Medium';
  } else if (norm === 'P4' || norm === 'LOW') {
    style = 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30';
    label = 'P4 — Low';
  } else if (norm === 'NONE') {
    style = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    label = 'P0 — None';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-mono',
    md: 'text-xs px-2.5 py-1 font-mono',
    lg: 'text-sm px-3 py-1.5 font-mono',
  }[size];

  return (
    <span className={`inline-flex items-center rounded border ${style} ${sizeClasses} ${className}`}>
      {label}
    </span>
  );
};
