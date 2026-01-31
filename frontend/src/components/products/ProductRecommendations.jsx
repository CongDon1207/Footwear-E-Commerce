import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Heart, ShoppingCart, Loader2, Tag } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

/**
 * ProductRecommendations - Displays recommended products based on current product
 * @param {string} productId - Current product ID to get recommendations for
 * @param {number} limit - Number of recommendations to show (default: 8)
 */
export default function ProductRecommendations({ productId, limit = 8 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Fetch recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        const { data } = await api.get(`/products/${productId}/recommendations?limit=${limit}`);
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId, limit]);

  // Handle add to cart (add first available size)
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    // Find first size with stock
    const availableSize = product.sizes?.find((s) => s.stock > 0);
    if (availableSize) {
      addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        discount: product.discount || 0,
        image: product.images?.[0] || '',
        size: availableSize.size,
        quantity: 1,
      });
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product._id);
  };

  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-xl font-bold text-text-primary mb-6">You May Also Like</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-xl font-bold text-text-primary mb-6">You May Also Like</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => {
          const inWishlist = isInWishlist(product._id);
          const hasDiscount = product.discount > 0;
          const hasStock = product.sizes?.some((s) => s.stock > 0);

          return (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="group card overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-square bg-surface-secondary overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-text-muted" />
                  </div>
                )}

                {/* Discount badge */}
                {hasDiscount && (
                  <div className="absolute top-2 left-2 bg-error text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    -{product.discount}%
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleWishlistToggle(e, product)}
                    className={`p-2 rounded-full bg-white shadow-md transition-colors ${
                      inWishlist ? 'text-error' : 'text-text-secondary hover:text-error'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </button>
                  {hasStock && (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="p-2 rounded-full bg-white shadow-md text-text-secondary hover:text-primary transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Out of stock overlay */}
                {!hasStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-medium text-text-primary line-clamp-2 text-sm group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-text-muted mt-1">{product.category}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-text-primary">
                    {formatPrice(product.finalPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-text-muted line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
