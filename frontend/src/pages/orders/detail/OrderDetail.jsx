import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, Loader2, Package } from 'lucide-react';
import { Layout } from '../../../components/layout';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import OrderTimeline from './OrderTimeline';
import OrderItems from './OrderItems';
import OrderSidebar from './OrderSidebar';
import { STATUS_CONFIG, formatDateTimeVi } from './orderStatusConfig';

export default function OrderDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, isAuthenticated]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const { data } = await api.post(`/orders/${id}/cancel`, {
        reason: 'Cancelled by customer',
      });
      setOrder(data.order);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h1 className="text-h2 text-text-primary mb-4">Login Required</h1>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-h2 text-text-primary mb-4">{error || 'Order not found'}</h1>
          <Link to="/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <Layout>
      <div className="container-wide py-8">
        <Link to="/orders" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6">
          <ChevronLeft className="w-5 h-5" />
          Back to Orders
        </Link>

        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-text-muted">Order Number</p>
              <h1 className="text-2xl font-bold text-text-primary">{order.orderNumber}</h1>
              <p className="text-sm text-text-muted mt-1">Placed on {formatDateTimeVi(order.createdAt)}</p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg}`}>
              <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
              <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <OrderTimeline order={order} />
            <OrderItems order={order} />
          </div>
          <div className="lg:col-span-1">
            <OrderSidebar order={order} cancelling={cancelling} onCancel={handleCancelOrder} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

