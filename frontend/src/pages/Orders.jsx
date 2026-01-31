import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Package,
  ChevronRight,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: 'text-warning',
        bgColor: 'bg-warning-light',
        icon: Clock,
      },
      confirmed: {
        label: 'Confirmed',
        color: 'text-primary',
        bgColor: 'bg-primary-light',
        icon: CheckCircle,
      },
      processing: {
        label: 'Processing',
        color: 'text-primary',
        bgColor: 'bg-primary-light',
        icon: Package,
      },
      shipping: {
        label: 'Shipping',
        color: 'text-secondary',
        bgColor: 'bg-secondary-light',
        icon: Truck,
      },
      delivered: {
        label: 'Delivered',
        color: 'text-success',
        bgColor: 'bg-success-light',
        icon: CheckCircle,
      },
      cancelled: {
        label: 'Cancelled',
        color: 'text-error',
        bgColor: 'bg-error-light',
        icon: XCircle,
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-secondary flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-warning" />
          </div>
          <h1 className="text-h2 text-text-primary mb-4">Login Required</h1>
          <p className="text-text-secondary mb-8">
            Please login to view your orders.
          </p>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-wide py-8">
        <h1 className="text-h1 text-text-primary mb-8">My Orders</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-error mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-secondary flex items-center justify-center">
              <Package className="w-10 h-10 text-text-muted" />
            </div>
            <h2 className="text-h2 text-text-primary mb-4">No orders yet</h2>
            <p className="text-text-secondary mb-8">
              You haven't placed any orders yet.
            </p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="card p-4 md:p-6 block hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-4">
                      {/* First Item Image */}
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden bg-surface-secondary flex-shrink-0">
                        {order.items?.[0]?.image ? (
                          <img
                            src={order.items[0].image}
                            alt={order.items[0].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-text-muted" />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-text-muted">
                          Order #{order.orderNumber}
                        </p>
                        <p className="font-medium text-text-primary mt-1">
                          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                        </p>
                        <p className="text-sm text-text-muted mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Status & Total */}
                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-sm text-text-muted">Total</p>
                        <p className="font-bold text-text-primary">
                          {formatPrice(order.total)}
                        </p>
                      </div>

                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor}`}
                      >
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <ChevronRight className="w-5 h-5 text-text-muted hidden md:block" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
