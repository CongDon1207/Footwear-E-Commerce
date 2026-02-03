import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Flame, 
  Clock, 
  ArrowRight, 
  Zap,
  TrendingUp,
  Star,
  AlertCircle,
} from 'lucide-react';

// Countdown Timer Hook
const useCountdown = (targetDate) => {
  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    
    const difference = new Date(targetDate) - new Date();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false,
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
};

// Time Unit Component
const TimeUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[3.5rem]">
      <span className="text-2xl md:text-3xl font-bold font-heading text-white tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-xs text-white/80 mt-1 uppercase tracking-wide">{label}</span>
  </div>
);

// Countdown Timer Component
const CountdownTimer = ({ endDate }) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endDate);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-white/90">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">Deal has ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 md:gap-3">
      {days > 0 && (
        <>
          <TimeUnit value={days} label="Days" />
          <span className="text-2xl font-bold text-white/60 -mt-4">:</span>
        </>
      )}
      <TimeUnit value={hours} label="Hours" />
      <span className="text-2xl font-bold text-white/60 -mt-4">:</span>
      <TimeUnit value={minutes} label="Mins" />
      <span className="text-2xl font-bold text-white/60 -mt-4">:</span>
      <TimeUnit value={seconds} label="Secs" />
    </div>
  );
};

// Badge Component
const DealBadge = ({ badge }) => {
  const badges = {
    hot: { icon: Flame, text: 'Hot', className: 'bg-red-500' },
    new: { icon: Zap, text: 'New', className: 'bg-green-500' },
    limited: { icon: Clock, text: 'Limited', className: 'bg-yellow-500' },
    bestseller: { icon: TrendingUp, text: 'Bestseller', className: 'bg-purple-500' },
    exclusive: { icon: Star, text: 'Exclusive', className: 'bg-blue-500' },
  };

  const config = badges[badge];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold text-white ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  );
};

// Progress Bar for Stock
const StockProgress = ({ soldCount, stockLimit }) => {
  if (!stockLimit) return null;
  
  const percentage = Math.round((soldCount / stockLimit) * 100);
  const remaining = stockLimit - soldCount;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-text-muted mb-1">
        <span>{soldCount} sold</span>
        <span className={remaining <= 5 ? 'text-error font-medium' : ''}>
          {remaining} left
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-orange-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Deal Card Component
const DealCard = ({ deal, formatPrice }) => {
  const product = deal.product;
  const savings = deal.originalPrice - deal.dealPrice;

  return (
    <Link 
      to={`/products/${product._id}`} 
      className="card group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-surface-secondary overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            No Image
          </div>
        )}

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-cta text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
            -{deal.discountPercentage}%
          </span>
          {deal.badge && <DealBadge badge={deal.badge} />}
        </div>

        {/* Flash Sale Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center gap-1 text-white text-sm font-medium">
            <Zap className="w-4 h-4" />
            Flash Sale Price
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-heading text-text-primary text-sm md:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-text-secondary">
              {product.rating.toFixed(1)}
            </span>
            {product.reviewCount > 0 && (
              <span className="text-xs text-text-muted">
                ({product.reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-2 mb-1">
          <span className="text-lg font-bold text-cta">
            {formatPrice(deal.dealPrice)}
          </span>
          <span className="text-sm text-text-muted line-through">
            {formatPrice(deal.originalPrice)}
          </span>
        </div>
        <p className="text-xs text-green-600 font-medium">
          Save {formatPrice(savings)}
        </p>

        {/* Stock Progress */}
        <StockProgress soldCount={deal.soldCount} stockLimit={deal.stockLimit} />
      </div>
    </Link>
  );
};

// Loading Skeleton
const DealCardSkeleton = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-5 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

// Main FlashDeals Component
const FlashDeals = ({ limit = 4 }) => {
  const [deals, setDeals] = useState([]);
  const [endsAt, setEndsAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format price in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/deals/flash?limit=${limit}`);
        setDeals(response.data.deals || []);
        setEndsAt(response.data.endsAt);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch flash deals:', err);
        setError('Failed to load deals');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashDeals();
  }, [limit]);

  // Don't render if no deals
  if (!loading && deals.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-cta via-orange-500 to-red-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full" />
      </div>

      <div className="container-wide relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
                Limited Time Offer
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              Flash Sale ⚡
            </h2>
            <p className="text-white/80 mt-2">
              Grab these deals before they&apos;re gone!
            </p>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-white/90 text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Ends in:
            </span>
            <CountdownTimer endDate={endsAt} />
          </div>
        </div>

        {/* Deals Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(limit)].map((_, i) => (
              <DealCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-white">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-80" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {deals.map((deal) => (
              <DealCard key={deal._id} deal={deal} formatPrice={formatPrice} />
            ))}
          </div>
        )}

        {/* View All Link */}
        {deals.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 bg-white text-cta px-8 py-3 rounded-full font-semibold hover:bg-white/90 hover:scale-105 transition-all duration-200 shadow-lg"
            >
              View All Deals
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashDeals;
