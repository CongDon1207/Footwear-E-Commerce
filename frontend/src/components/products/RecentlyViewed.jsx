import { Link } from 'react-router-dom';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { Clock, ChevronRight } from 'lucide-react';

/**
 * Recently Viewed Products Section
 * Shows products the user has recently viewed
 */
const RecentlyViewed = ({ excludeProductId = null, limit = 8, title = 'Recently Viewed' }) => {
  const { getItems, isLoaded } = useRecentlyViewed();

  const items = getItems(excludeProductId, limit);

  // Don't render if no items or not loaded
  if (!isLoaded || items.length === 0) {
    return null;
  }

  // Format price in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-text-muted" />
          <h2 className="text-h3 text-text-primary">{title}</h2>
        </div>
        <Link
          to="/products"
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {items.map((item) => {
            const hasDiscount = item.discount > 0;
            const finalPrice = item.price * (1 - item.discount / 100);

            return (
              <Link
                key={item._id}
                to={`/products/${item._id}`}
                className="group flex-shrink-0 w-44 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-square bg-surface-secondary overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
                      No Image
                    </div>
                  )}

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 badge badge-sale text-xs">
                      -{item.discount}%
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs text-text-muted uppercase tracking-wide mb-1 truncate">
                    {item.category}
                  </p>
                  <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-text-primary">
                      {formatPrice(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-text-muted line-through">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
