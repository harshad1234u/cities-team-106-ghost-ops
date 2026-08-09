import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, Shield } from 'lucide-react';

interface SeverityBadgeProps {
  severity?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '', size = 'md' }) => {
  const norm = (severity || 'UNKNOWN').toUpperCase();

  let bg = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  let Icon = Info;
  let label = norm;

  if (norm === 'CRITICAL' || norm === 'EXTREME') {
    bg = 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40 shadow-sm shadow-red-500/10';
    Icon = AlertOctagon;
  } else if (norm === 'HIGH') {
    bg = 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/40';
    Icon = AlertTriangle;
  } else if (norm === 'MEDIUM' || norm === 'MODERATE') {
    bg = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40';
    Icon = AlertTriangle;
  } else if (norm === 'LOW') {
    bg = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40';
    Icon = CheckCircle2;
  } else if (norm === 'NONE' || norm === 'SAFE') {
    bg = 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    Icon = Shield;
    label = 'NONE';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-mono gap-1',
    md: 'text-xs px-2.5 py-1 font-mono font-semibold gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-mono font-bold gap-2',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-md border ${bg} ${sizeClasses} ${className}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
    </span>
  );
};
