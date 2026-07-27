import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  status: 'success' | 'warning' | 'error' | 'info';
  badgeText?: string;
  fullWidth?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  status,
  badgeText,
  fullWidth = false,
}) => {
  const statusStyles = {
    success: {
      border: 'border-emerald-500/30 dark:border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    },
    warning: {
      border: 'border-amber-500/30 dark:border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    },
    error: {
      border: 'border-rose-500/30 dark:border-rose-500/30',
      iconBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
      badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    },
    info: {
      border: 'border-brand-500/30 dark:border-brand-500/30',
      iconBg: 'bg-brand-500/10 text-brand-700 dark:text-brand-400',
      badge: 'bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-500/30',
    },
  };

  const currentStyle = statusStyles[status];

  return (
    <div
      className={`glass-card p-5 rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] hover:shadow-xl ${
        currentStyle.border
      } ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`p-3 rounded-xl ${currentStyle.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        {badgeText && (
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${currentStyle.badge}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
          {value}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
