import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    description: 'Order placed, waiting for confirmation',
    color: 'text-warning',
    bg: 'bg-warning/10',
    icon: Clock,
    step: 1,
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Order confirmed by seller',
    color: 'text-primary',
    bg: 'bg-primary/10',
    icon: CheckCircle,
    step: 2,
  },
  processing: {
    label: 'Processing',
    description: 'Order is being prepared',
    color: 'text-primary',
    bg: 'bg-primary/10',
    icon: Package,
    step: 3,
  },
  shipping: {
    label: 'Shipping',
    description: 'Order is on the way',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    icon: Truck,
    step: 4,
  },
  delivered: {
    label: 'Delivered',
    description: 'Order delivered successfully',
    color: 'text-success',
    bg: 'bg-success/10',
    icon: CheckCircle,
    step: 5,
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Order was cancelled',
    color: 'text-error',
    bg: 'bg-error/10',
    icon: XCircle,
    step: -1,
  },
};

export const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'shipping', 'delivered'];

export const formatPriceVnd = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

export const formatDateTimeVi = (dateString) =>
  new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

