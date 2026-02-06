import { ChevronRight, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardQuickActionsPanel({ quickActions }) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 p-5 border-b border-border">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
      </div>
      <div className="p-4 space-y-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.link}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-secondary transition-all duration-200 group cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
              >
                <Icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary group-hover:text-primary transition-colors duration-200">
                  {action.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5 truncate">{action.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors duration-200" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
