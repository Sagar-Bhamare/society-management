import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700/80 flex items-center space-x-4">
      <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20`}}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      <div>
        <p className="text-sm text-text-secondary dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-text-primary dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
};

export default KPICard;