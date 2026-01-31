import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

/**
 * AdminDashboard - Overview metrics and quick stats
 */
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/admin/metrics');
        setMetrics(data.metrics);
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        setError(err.response?.data?.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-text-secondary">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatPrice(metrics?.totalRevenue),
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Total Orders',
      value: metrics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Products',
      value: metrics?.totalProducts || 0,
      icon: Package,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      label: 'Total Users',
      value: metrics?.totalUsers || 0,
      icon: Users,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted mt-1">Overview of your store performance</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <p className="text-text-muted text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Orders by status */}
      {metrics?.ordersByStatus && (
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Orders by Status</h2>
            <Link
              to="/admin/orders"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(metrics.ordersByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-surface-secondary rounded-lg">
                <p className="text-2xl font-bold text-text-primary">{count}</p>
                <p className="text-sm text-text-muted capitalize mt-1">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/orders"
          className="bg-white rounded-xl p-6 border border-border hover:border-primary transition-colors group"
        >
          <ShoppingCart className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text-primary group-hover:text-primary">
            Manage Orders
          </h3>
          <p className="text-sm text-text-muted mt-1">View and update order statuses</p>
        </Link>
        <Link
          to="/admin/products"
          className="bg-white rounded-xl p-6 border border-border hover:border-primary transition-colors group"
        >
          <Package className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text-primary group-hover:text-primary">
            Manage Products
          </h3>
          <p className="text-sm text-text-muted mt-1">Add, edit or disable products</p>
        </Link>
        <Link
          to="/admin/users"
          className="bg-white rounded-xl p-6 border border-border hover:border-primary transition-colors group"
        >
          <Users className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold text-text-primary group-hover:text-primary">
            Manage Users
          </h3>
          <p className="text-sm text-text-muted mt-1">View and manage user accounts</p>
        </Link>
      </div>
    </div>
  );
}
