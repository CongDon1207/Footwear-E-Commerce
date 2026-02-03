import {
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';

export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-primary', bg: 'bg-primary/10', icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-primary', bg: 'bg-primary/10', icon: Package },
  shipping: { label: 'Shipping', color: 'text-secondary', bg: 'bg-secondary/10', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-error', bg: 'bg-error/10', icon: XCircle },
};

export const VALID_STATUS_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle },
  paid: { label: 'Paid', color: 'text-success', bg: 'bg-success/10', icon: CreditCard },
  failed: { label: 'Failed', color: 'text-error', bg: 'bg-error/10', icon: XCircle },
};

export const formatPriceVnd = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

export const formatDateVi = (dateString) =>
  new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });

