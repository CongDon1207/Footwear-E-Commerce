import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import RecentlyViewed from '../components/products/RecentlyViewed';
import api from '../services/api';
import {
  User,
  Package,
  Heart,
  ShoppingBag,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Settings,
  LogOut,
  Calendar,
  ArrowRight,
  Star,
  MessageSquare,
  Edit3,
  Mail,
  Shield,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();

  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistCount: 0,
    cartCount: 0,
    reviewsCount: 0,
  });

  // API base URL for avatar
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  // Get avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar_url) {
      if (user.avatar_url.startsWith('http')) return user.avatar_url;
      return `${API_BASE}${user.avatar_url}`;
    }
    return null;
  };

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

  // Format member since date
  const getMemberSince = () => {
    if (!user?.createdAt) return 'New Member';
    return new Date(user.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
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

  // Fetch recent orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const { data } = await api.get('/orders/my?limit=3');
        setRecentOrders(data.orders || []);
        setStats((prev) => ({
          ...prev,
          totalOrders: data.pagination?.total || data.orders?.length || 0,
        }));
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchRecentOrders();
  }, []);

  // Fetch user reviews
  useEffect(() => {
    const fetchMyReviews = async () => {
      try {
        const { data } = await api.get('/reviews/my?limit=3');
        setMyReviews(data.reviews || []);
        setStats((prev) => ({
          ...prev,
          reviewsCount: data.pagination?.total || data.reviews?.length || 0,
        }));
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchMyReviews();
  }, []);

  // Update stats when cart/wishlist changes
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      wishlistCount: wishlistItems?.length || 0,
      cartCount: cartItems?.length || 0,
    }));
  }, [cartItems, wishlistItems]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Quick stats cards data
  const quickStats = [
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

  // Quick action links
  const quickActions = [
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

  const avatarUrl = getAvatarUrl();

  return (
    <Layout>
      <div className="container-wide py-6 md:py-10">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-semibold text-text-primary">
            My Account
          </h1>
          <p className="text-text-secondary mt-1 text-sm md:text-base">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}! Here's your account overview.
          </p>
        </div>

        {/* User Profile Card - Improved */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark rounded-2xl p-5 md:p-8 text-white mb-6 md:mb-8 shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/3 translate-y-1/3" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-6">
              {/* Avatar */}
              <Link
                to="/profile"
                className="group relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 cursor-pointer"
              >
                <div className="w-full h-full rounded-full ring-4 ring-white/30 overflow-hidden bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:ring-white/50">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 md:w-12 md:h-12 text-white/80" />
                    </div>
                  )}
                </div>
                {/* Edit Badge */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Edit3 className="w-4 h-4 text-primary" />
                </div>
              </Link>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-xl md:text-2xl font-semibold truncate">
                  {user?.full_name || 'Welcome!'}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-white/80">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm md:text-base truncate">{user?.email}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {getMemberSince()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/70 text-sm">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">{user?.role || 'User'}</span>
                  </div>
                </div>
              </div>

              {/* Actions - Desktop */}
              <div className="hidden sm:flex flex-col gap-2">
                <Link
                  to="/profile"
                  className="px-5 py-2.5 bg-white text-primary rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/90 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Actions - Mobile */}
            <div className="flex sm:hidden gap-3 mt-5">
              <Link
                to="/profile"
                className="flex-1 px-4 py-2.5 bg-white text-primary rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/90 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
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
                <p className="text-sm text-primary font-medium mt-2 group-hover:underline">
                  {stat.linkText}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
          {/* Recent Orders Section - 2/3 width on desktop */}
          <div className="lg:col-span-2 bg-surface rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Recent Orders
              </h2>
              <Link
                to="/orders"
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-5">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
                    <Package className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="text-text-secondary mb-4">No orders yet</p>
                  <Link to="/products" className="btn btn-primary btn-sm cursor-pointer">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <Link
                        key={order._id}
                        to={`/orders/${order._id}`}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-all duration-200 group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          {/* First Item Image */}
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-border">
                            {order.items?.[0]?.image ? (
                              <img
                                src={order.items[0].image}
                                alt={order.items[0].name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-text-muted" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-text-muted mt-0.5">
                              {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} •{' '}
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-3 sm:mt-0">
                          <p className="font-bold text-text-primary">
                            {formatPrice(order.total)}
                          </p>
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor}`}
                          >
                            <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                            <span className={`text-xs font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-text-muted hidden sm:block group-hover:text-primary transition-colors duration-200" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - 1/3 width on desktop */}
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
                    <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
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
        </div>

        {/* My Reviews Section */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden mb-6 md:mb-8">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              My Reviews
              {stats.reviewsCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-primary-light text-primary rounded-full">
                  {stats.reviewsCount}
                </span>
              )}
            </h2>
          </div>

          <div className="p-5">
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : myReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-text-secondary mb-4">You haven't written any reviews yet</p>
                <Link to="/orders" className="btn btn-primary btn-sm cursor-pointer">
                  Review Purchased Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myReviews.map((review) => (
                  <Link
                    key={review._id}
                    to={`/products/${review.productId}`}
                    className="flex flex-col p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-all duration-200 group cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-white mb-3 border border-border">
                      {review.productImage ? (
                        <img
                          src={review.productImage}
                          alt={review.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-text-muted" />
                        </div>
                      )}
                    </div>

                    {/* Review Info */}
                    <p className="font-semibold text-text-primary group-hover:text-primary transition-colors duration-200 truncate">
                      {review.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-warning text-warning'
                                : 'fill-none text-border-input'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-text-muted">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recently Viewed Products */}
        <div className="bg-surface rounded-xl border border-border p-5 md:p-6">
          <RecentlyViewed limit={4} />
        </div>
      </div>
    </Layout>
  );
}
