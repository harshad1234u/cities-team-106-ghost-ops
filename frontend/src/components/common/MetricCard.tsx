import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'navy' | 'red' | 'orange' | 'amber' | 'emerald' | 'indigo' | 'cyan';
  loading?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'navy',
  loading = false,
  onClick,
}) => {
  const variantStyles = {
    navy: 'bg-slate-800/90 border-slate-700/80 text-slate-100 hover:border-slate-600',
    red: 'bg-slate-900/90 border-red-500/30 text-red-100 hover:border-red-500/60 shadow-red-950/20',
    orange: 'bg-slate-900/90 border-orange-500/30 text-orange-100 hover:border-orange-500/60',
    amber: 'bg-slate-900/90 border-amber-500/30 text-amber-100 hover:border-amber-500/60',
    emerald: 'bg-slate-900/90 border-emerald-500/30 text-emerald-100 hover:border-emerald-500/60',
    indigo: 'bg-slate-900/90 border-indigo-500/30 text-indigo-100 hover:border-indigo-500/60',
    cyan: 'bg-slate-900/90 border-cyan-500/30 text-cyan-100 hover:border-cyan-500/60',
  }[variant];

  const iconStyles = {
    navy: 'bg-slate-700/50 text-slate-300',
    red: 'bg-red-500/20 text-red-400',
    orange: 'bg-orange-500/20 text-orange-400',
    amber: 'bg-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    indigo: 'bg-indigo-500/20 text-indigo-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-5 backdrop-blur-md transition-all duration-200 shadow-lg ${variantStyles} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-slate-700/50" />
          ) : (
            <h3 className="mt-1 font-mono text-3xl font-bold tracking-tight text-white">{value}</h3>
          )}
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-3 ${iconStyles}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {/* Subtle bottom highlight glow */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
    </div>
  );
};
