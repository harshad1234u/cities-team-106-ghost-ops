import React from 'react';
import { Clock, Cpu, CheckCircle2, UserCheck, Wrench, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const normalized = (status || '').toLowerCase().replace(/ /g, '_');

  let bg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  let label = status || 'Unknown';
  let Icon = Clock;

  switch (normalized) {
    case 'submitted':
    case 'pending':
      bg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      label = 'Submitted';
      Icon = Clock;
      break;
    case 'ai_processing':
    case 'processing':
      bg = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 animate-pulse';
      label = 'AI Processing';
      Icon = Cpu;
      break;
    case 'ai_verified':
    case 'verified':
      bg = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      label = 'AI Verified';
      Icon = CheckCircle2;
      break;
    case 'engineer_verified':
    case 'awaiting_engineer':
    case 'in_review':
      bg = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      label = 'Engineer Review';
      Icon = UserCheck;
      break;
    case 'in_progress':
    case 'repair_scheduled':
      bg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      label = 'In Progress';
      Icon = Wrench;
      break;
    case 'resolved':
    case 'completed':
    case 'repaired':
      bg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      label = 'Resolved';
      Icon = CheckCircle2;
      break;
    case 'rejected':
    case 'removed':
    case 'deleted':
      bg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      label = 'Rejected';
      Icon = ShieldAlert;
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses} ${className} transition-colors`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span className="tracking-wide">{label}</span>
    </span>
  );
};
