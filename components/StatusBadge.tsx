import React from 'react';

type BadgeType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  text: string;
  type: BadgeType;
}

const colorClasses = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const dotColorClasses = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ text, type }) => {
  return (
    <span className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${colorClasses[type]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColorClasses[type]}`}></span>
      {text}
    </span>
  );
};

export default StatusBadge;