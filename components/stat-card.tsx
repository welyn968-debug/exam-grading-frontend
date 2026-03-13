import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  color?: 'primary' | 'secondary' | 'accent';
}

export function StatCard({ label, value, icon, trend, color = 'primary' }: StatCardProps) {
  const colorMap = {
    primary: 'bg-primary/12 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent/10 text-accent',
  };

  const trendColor = trend && trend > 0 ? 'text-green-600' : trend && trend < 0 ? 'text-red-600' : 'text-muted-foreground';

  return (
    <div className="dashboard-panel p-5 transition-transform hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon && <div className={`${colorMap[color]} rounded-xl p-2.5`}>{icon}</div>}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-3xl font-semibold tracking-tight text-foreground">{value}</h3>
          {trend !== undefined && (
            <p className={`mt-1 flex items-center gap-1 text-xs ${trendColor}`}>
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {Math.abs(trend)}% vs last cycle
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
