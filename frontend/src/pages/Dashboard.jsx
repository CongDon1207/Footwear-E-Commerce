import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Layout } from '../components/layout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import RecentlyViewed from '../components/products/RecentlyViewed';
import api from '../services/api';
import DashboardOrdersSection from './dashboard/DashboardOrdersSection';
import DashboardProfileHeader from './dashboard/DashboardProfileHeader';
import DashboardQuickActionsPanel from './dashboard/DashboardQuickActionsPanel';
import DashboardQuickStats from './dashboard/DashboardQuickStats';
import DashboardReviewsSection from './dashboard/DashboardReviewsSection';
import { getQuickStats, getStatusInfo, quickActions } from './dashboard/dashboardConfig';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

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

  const getAvatarUrl = () => {
    if (!user?.avatar_url) return null;
    if (user.avatar_url.startsWith('http')) return user.avatar_url;
    return `${API_BASE}${user.avatar_url}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMemberSince = () => {
    if (!user?.createdAt) return 'New Member';
    return new Date(user.createdAt).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
    });
  };

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

  return (
    <Layout>
      <div className="container-wide py-6 md:py-10">
        <DashboardProfileHeader
          avatarUrl={getAvatarUrl()}
          getMemberSince={getMemberSince}
          onLogout={handleLogout}
          user={user}
        />

        <DashboardQuickStats quickStats={getQuickStats(stats)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
          <DashboardOrdersSection
            formatDate={formatDate}
            formatPrice={formatPrice}
            getStatusInfo={getStatusInfo}
            ordersLoading={ordersLoading}
            recentOrders={recentOrders}
          />
          <DashboardQuickActionsPanel quickActions={quickActions} />
        </div>

        <DashboardReviewsSection
          formatDate={formatDate}
          myReviews={myReviews}
          reviewsCount={stats.reviewsCount}
          reviewsLoading={reviewsLoading}
        />

        <div className="bg-surface rounded-xl border border-border p-5 md:p-6">
          <RecentlyViewed limit={4} />
        </div>
      </div>
    </Layout>
  );
}
