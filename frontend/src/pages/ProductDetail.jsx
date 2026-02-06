import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import RecentlyViewed from '../components/products/RecentlyViewed';
import ProductRecommendations from '../components/products/ProductRecommendations';
import ProductReviews from '../components/products/ProductReviews';
import api from '../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  RotateCcw,
  Shield,
  Loader2,
  Check,
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addProduct: addToRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        // Auto-select first available size
        const availableSize = data.product.sizes?.find((s) => s.stock > 0);
        if (availableSize) {
          setSelectedSize(availableSize.size);
        }
        // Track recently viewed
        addToRecentlyViewed(data.product);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, addToRecentlyViewed]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Get selected size info
  const selectedSizeInfo = product?.sizes?.find((s) => s.size === selectedSize);
  const maxQuantity = selectedSizeInfo?.stock || 0;
  const isOutOfStock = !product?.sizes?.some((s) => s.stock > 0);

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= maxQuantity) {
      setQuantity(newQty);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!selectedSize || quantity < 1) return;

    const success = addItem(product, selectedSize, quantity);
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!selectedSize || quantity < 1) return;

    addItem(product, selectedSize, quantity);
    navigate('/checkout');
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async () => {
    if (!product) return;
    setWishlistLoading(true);
    await toggleWishlist(product);
    setWishlistLoading(false);
  };

  // Image navigation
  const nextImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + product.images.length) % product.images.length
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <h1 className="text-h2 text-text-primary mb-4">Product Not Found</h1>
          <p className="text-text-secondary mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </Layout>
    );
  }

  const hasDiscount = product.discount > 0;

  return (
    <Layout>
      <div className="container-wide py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">
            Products
          </Link>
          <span>/</span>
          <span className="text-text-primary">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-surface-secondary rounded-lg overflow-hidden">
              {product.images?.[currentImageIndex] ? (
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  No Image
                </div>
              )}

              {/* Image Navigation */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="badge badge-sale">-{product.discount}%</span>
                )}
                {isOutOfStock && (
                  <span className="badge badge-out-of-stock">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors cursor-pointer ${
                      index === currentImageIndex
                        ? 'border-primary'
                        : 'border-transparent hover:border-border'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <p className="text-sm text-text-muted uppercase tracking-wide">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="text-h1 text-text-primary">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-text-primary">
                {formatPrice(product.finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-text-muted line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-text-secondary leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-medium text-text-primary">Size</label>
                <button className="text-sm text-primary hover:underline cursor-pointer">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((sizeInfo) => {
                  const isAvailable = sizeInfo.stock > 0;
                  const isSelected = selectedSize === sizeInfo.size;

                  return (
                    <button
                      key={sizeInfo.size}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSize(sizeInfo.size);
                          setQuantity(1);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`min-w-[48px] h-12 px-4 rounded-md border-2 font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : isAvailable
                          ? 'bg-white text-text-primary border-border-input hover:border-primary'
                          : 'bg-surface-secondary text-text-muted border-transparent cursor-not-allowed line-through'
                      }`}
                    >
                      {sizeInfo.size}
                    </button>
                  );
                })}
              </div>
              {selectedSizeInfo && (
                <p className="mt-2 text-sm text-text-muted">
                  {selectedSizeInfo.stock} items available
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="font-medium text-text-primary mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-border-input rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 flex items-center justify-center text-text-primary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxQuantity}
                    className="w-12 h-12 flex items-center justify-center text-text-primary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || !selectedSize}
                className={`flex-1 btn ${
                  addedToCart ? 'bg-success hover:bg-success' : 'btn-outline'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || !selectedSize}
                className="flex-1 btn btn-cta disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`w-12 h-12 sm:w-auto sm:px-4 flex items-center justify-center rounded-md border-2 transition-colors cursor-pointer ${
                  isInWishlist(product._id)
                    ? 'bg-cta/10 border-cta text-cta'
                    : 'border-border-input text-text-primary hover:border-cta hover:text-cta'
                } disabled:opacity-50`}
                aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishlistLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart
                    className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-cta' : ''}`}
                  />
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Free Shipping</p>
                  <p className="text-text-muted">Orders over 500K</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Easy Returns</p>
                  <p className="text-text-muted">30 days return</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Authentic</p>
                  <p className="text-text-muted">100% genuine</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviews productId={product._id} />

        {/* Product Recommendations */}
        <ProductRecommendations productId={product._id} limit={8} />

        {/* Recently Viewed Section */}
        <RecentlyViewed excludeProductId={product._id} limit={8} />
      </div>
    </Layout>
  );
};

export default ProductDetail;
