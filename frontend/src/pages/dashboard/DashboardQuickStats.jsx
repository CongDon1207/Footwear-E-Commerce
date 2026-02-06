import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardQuickStats({ quickStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8">
      {quickStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link
            key={stat.label}
            to={stat.link}
            className="group bg-surface rounded-xl p-5 border border-border hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center transition-transform duration-200 group-hover:scale-105`}
              >
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
            <p className="text-text-muted text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-text-primary mt-1 font-heading">{stat.value}</p>
            <p className="text-sm text-primary font-medium mt-2 group-hover:underline">{stat.linkText}</p>
          </Link>
        );
      })}
    </div>
  );
}
