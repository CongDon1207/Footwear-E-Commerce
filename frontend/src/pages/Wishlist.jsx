import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Loader2,
  ArrowRight,
} from 'lucide-react';

const Wishlist = () => {
  const { items, loading, isLoaded, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [addingToCart, setAddingToCart] = useState({});

  // Format price in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Handle add to cart (select first available size)
  const handleAddToCart = async (product) => {
    const availableSize = product.sizes?.find((s) => s.stock > 0);
    if (!availableSize) return;

    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));

    // Add to cart
    const success = addItem(product, availableSize.size, 1);

    // Brief delay for feedback
    await new Promise((r) => setTimeout(r, 300));
    setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
  };

  // Handle remove from wishlist
  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
  };

  // Handle clear all
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      await clearWishlist();
    }
  };

  if (!isLoaded) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-wide py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-h1 text-text-primary mb-2">My Wishlist</h1>
            <p className="text-text-secondary">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="btn btn-outline text-error border-error hover:bg-error hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Guest notice */}
        {!isAuthenticated && items.length > 0 && (
          <div className="bg-primary-light border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-text-primary">
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{' '}
              to save your wishlist and access it from any device.
            </p>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-secondary flex items-center justify-center">
              <Heart className="w-10 h-10 text-text-muted" />
            </div>
            <h2 className="text-h3 text-text-primary mb-2">Your wishlist is empty</h2>
            <p className="text-text-secondary mb-6">
              Browse our products and add items you love to your wishlist.
            </p>
            <Link to="/products" className="btn btn-primary">
              Start Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((item) => {
              const product = item.product;
              if (!product || !product._id) return null;

              const hasDiscount = product.discount > 0;
              const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
              const isOutOfStock = totalStock === 0;
              const isAdding = addingToCart[product._id];

              return (
                <div
                  key={product._id}
                  className="card group overflow-hidden relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                    aria-label="Remove from wishlist"
                  >
                    <Heart className="w-5 h-5 text-cta fill-cta" />
                  </button>

                  {/* Image */}
                  <Link
                    to={`/products/${product._id}`}
                    className="block relative aspect-square bg-surface-secondary overflow-hidden"
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        No Image
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {hasDiscount && (
                        <span className="badge badge-sale">-{product.discount}%</span>
                      )}
                      {isOutOfStock && (
                        <span className="badge badge-out-of-stock">Out of Stock</span>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
                      {product.category}
                    </p>
                    <Link
                      to={`/products/${product._id}`}
                      className="font-heading text-text-primary text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors block"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-semibold text-text-primary">
                        {formatPrice(product.price * (1 - (product.discount || 0) / 100))}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-text-muted line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || isAdding}
                      className="w-full btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isOutOfStock ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
