import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'email-row' | 'card' | 'thread' | 'analytics';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 5,
  type = 'email-row',
}) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-800/40 border border-slate-800 p-4">
            <div className="w-8 h-8 rounded-xl bg-slate-700/50 mb-3"></div>
            <div className="w-24 h-4 rounded bg-slate-700/50 mb-2"></div>
            <div className="w-16 h-6 rounded bg-slate-700/50"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'thread') {
    return (
      <div className="space-y-4 p-6 animate-pulse">
        <div className="w-3/4 h-8 rounded-xl bg-slate-800/60 mb-6"></div>
        <div className="h-48 rounded-2xl bg-slate-800/40 border border-slate-800 p-6 space-y-3">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700/50"></div>
            <div className="space-y-1.5">
              <div className="w-32 h-4 rounded bg-slate-700/50"></div>
              <div className="w-48 h-3 rounded bg-slate-700/40"></div>
            </div>
          </div>
          <div className="w-full h-3 rounded bg-slate-700/40"></div>
          <div className="w-5/6 h-3 rounded bg-slate-700/40"></div>
          <div className="w-2/3 h-3 rounded bg-slate-700/40"></div>
        </div>
      </div>
    );
  }

  // Default: email-row
  return (
    <div className="divide-y divide-slate-800/60 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="flex items-center space-x-4 px-6 py-4 bg-slate-900/20">
          <div className="w-4 h-4 rounded bg-slate-800/80 shrink-0"></div>
          <div className="w-4 h-4 rounded bg-slate-800/80 shrink-0"></div>
          <div className="w-36 h-4 rounded bg-slate-700/60 shrink-0"></div>
          <div className="flex-1 space-y-1">
            <div className="w-2/3 h-4 rounded bg-slate-700/50"></div>
          </div>
          <div className="w-16 h-3 rounded bg-slate-800/80 shrink-0"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
