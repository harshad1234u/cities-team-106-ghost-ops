import React from 'react';

interface LoadingSkeletonProps {
  type?: 'table' | 'card' | 'detail';
  rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'table', rows = 4 }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-800/80 border border-slate-700/60 p-4" />
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-8 w-1/3 bg-slate-800 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-800 rounded-xl" />
          <div className="h-80 bg-slate-800 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 w-full rounded-lg bg-slate-800/60 border border-slate-700/40" />
      ))}
    </div>
  );
};
