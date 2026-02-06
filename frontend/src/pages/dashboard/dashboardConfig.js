import {
  CheckCircle,
  Clock,
  Heart,
  Package,
  ShoppingBag,
  Truck,
  XCircle,
  Edit3,
} from 'lucide-react';

export const getStatusInfo = (status) => {
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

export const getQuickStats = (stats) => {
  return [
    {
      label: 'My Orders',
      value: stats.totalOrders,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary-light',
      link: '/orders',
      linkText: 'View Orders',
    },
    {
      label: 'Wishlist',
      value: stats.wishlistCount,
      icon: Heart,
      color: 'text-cta',
      bgColor: 'bg-cta-light',
      link: '/wishlist',
      linkText: 'View Wishlist',
    },
    {
      label: 'Cart Items',
      value: stats.cartCount,
      icon: ShoppingBag,
      color: 'text-success',
      bgColor: 'bg-success-light',
      link: '/cart',
      linkText: stats.cartCount > 0 ? 'Checkout' : 'Start Shopping',
    },
  ];
};

export const quickActions = [
  {
    label: 'Edit Profile',
    icon: Edit3,
    description: 'Update your personal info',
    link: '/profile',
    color: 'text-primary',
    bgColor: 'bg-primary-light',
  },
  {
    label: 'Browse Products',
    icon: ShoppingBag,
    description: 'Discover latest collection',
    link: '/products',
    color: 'text-success',
    bgColor: 'bg-success-light',
  },
  {
    label: 'View My Orders',
    icon: Package,
    description: 'Track order history',
    link: '/orders',
    color: 'text-secondary',
    bgColor: 'bg-secondary-light',
  },
  {
    label: 'My Wishlist',
    icon: Heart,
    description: 'View saved items',
    link: '/wishlist',
    color: 'text-cta',
    bgColor: 'bg-cta-light',
  },
];
