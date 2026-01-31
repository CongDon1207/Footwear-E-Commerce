import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Package,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  Phone,
  User,
  CreditCard,
  FileText,
  Box,
} from 'lucide-react';

// Status configuration
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    description: 'Order placed, waiting for confirmation',
    color: 'text-warning',
    bgColor: 'bg-warning',
    lightBg: 'bg-warning-light',
    icon: Clock,
    step: 1,
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Order confirmed by seller',
    color: 'text-primary',
    bgColor: 'bg-primary',
    lightBg: 'bg-primary-light',
    icon: CheckCircle,
    step: 2,
  },
  processing: {
    label: 'Processing',
    description: 'Order is being prepared',
    color: 'text-primary',
    bgColor: 'bg-primary',
    lightBg: 'bg-primary-light',
    icon: Package,
    step: 3,
  },
  shipping: {
    label: 'Shipping',
    description: 'Order is on the way',
    color: 'text-secondary',
    bgColor: 'bg-secondary',
    lightBg: 'bg-secondary-light',
    icon: Truck,
    step: 4,
  },
  delivered: {
    label: 'Delivered',
    description: 'Order delivered successfully',
    color: 'text-success',
    bgColor: 'bg-success',
    lightBg: 'bg-success-light',
    icon: CheckCircle,
    step: 5,
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order was cancelled',
    color: 'text-error',
    bgColor: 'bg-error',
    lightBg: 'bg-error-light',
    icon: XCircle,
    step: -1,
  },
};

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'shipping', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch order
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

  // Cancel order
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

  // Not authenticated
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
  const currentStep = statusInfo.step;
  const isCancelled = order.status === 'cancelled';

  return (
    <Layout>
      <div className="container-wide py-8">
        {/* Back Button */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-h2 text-text-primary">Order #{order.orderNumber}</h1>
            <p className="text-text-muted mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.lightBg}`}
          >
            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
            <span className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Order Timeline */}
        {!isCancelled && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">Order Status</h2>

            {/* Progress Steps */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-5 right-5 h-1 bg-border rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStep - 1) / (TIMELINE_STEPS.length - 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {TIMELINE_STEPS.map((stepStatus, index) => {
                  const stepConfig = STATUS_CONFIG[stepStatus];
                  const StepIcon = stepConfig.icon;
                  const stepNum = index + 1;
                  const isActive = stepNum <= currentStep;
                  const isCurrent = stepNum === currentStep;

                  return (
                    <div key={stepStatus} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isActive
                            ? `${stepConfig.bgColor} border-transparent text-white`
                            : 'bg-white border-border text-text-muted'
                        } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          isActive ? 'text-text-primary' : 'text-text-muted'
                        }`}
                      >
                        {stepConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">
                  Status History
                </h3>
                <div className="space-y-4">
                  {order.statusHistory
                    .slice()
                    .reverse()
                    .map((entry, index) => {
                      const entryConfig = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                      const EntryIcon = entryConfig.icon;

                      return (
                        <div key={index} className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${entryConfig.lightBg}`}
                          >
                            <EntryIcon className={`w-4 h-4 ${entryConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary">
                              {entryConfig.label}
                            </p>
                            {entry.note && (
                              <p className="text-sm text-text-muted mt-0.5">
                                {entry.note}
                              </p>
                            )}
                            <p className="text-xs text-text-muted mt-1">
                              {formatDate(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancelled Notice */}
        {isCancelled && (
          <div className="card p-6 mb-6 bg-error-light border-error/20">
            <div className="flex items-start gap-4">
              <XCircle className="w-8 h-8 text-error flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-error">Order Cancelled</h2>
                <p className="text-text-secondary mt-1">
                  {order.cancelReason || 'This order was cancelled.'}
                </p>
                {order.cancelledAt && (
                  <p className="text-sm text-text-muted mt-2">
                    Cancelled on {formatDate(order.cancelledAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Box className="w-5 h-5" />
                Order Items ({order.itemCount})
              </h2>
              <div className="divide-y divide-border">
                {order.items.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-surface-secondary flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.product_id}`}
                        className="font-medium text-text-primary hover:text-primary line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-text-muted mt-1">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-semibold text-text-primary">
                          {formatPrice(item.finalPrice)}
                        </span>
                        {item.discount > 0 && (
                          <span className="text-sm text-text-muted line-through">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-text-primary">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h2>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-muted" />
                  <span className="font-medium">{order.shippingAddress.fullName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-text-muted" />
                  {order.shippingAddress.phone}
                </p>
                <p className="text-text-secondary pl-6">
                  {order.shippingAddress.address}
                  {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                  {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                  {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
                </p>
                {order.shippingAddress.note && (
                  <p className="text-text-muted pl-6 italic">
                    Note: {order.shippingAddress.note}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </h2>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-text-muted">Method</span>
                  <span className="font-medium capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <span
                    className={`font-medium capitalize ${
                      order.paymentStatus === 'paid'
                        ? 'text-success'
                        : order.paymentStatus === 'failed'
                        ? 'text-error'
                        : 'text-warning'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Summary
              </h2>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-text-muted">Shipping</span>
                  <span>
                    {order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}
                  </span>
                </p>
                {order.discount > 0 && (
                  <p className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </p>
                )}
                <hr className="my-2 border-border" />
                <p className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </p>
              </div>
            </div>

            {/* Cancel Button (only for pending orders) */}
            {order.status === 'pending' && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="w-full btn btn-outline text-error border-error hover:bg-error hover:text-white disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetail;
