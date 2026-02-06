import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Get filters from URL
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sortBy') || '-createdAt';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const onSale = searchParams.get('onSale') === 'true';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/products/categories');
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (currentCategory) params.set('category', currentCategory);
        if (currentSearch) params.set('q', currentSearch);
        if (currentSort) params.set('sortBy', currentSort);
        if (onSale) params.set('onSale', 'true');
        params.set('page', currentPage.toString());
        params.set('limit', '12');

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data.products || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, currentSearch, currentSort, currentPage, onSale]);

  // Update filter
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when filters change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
  };

  // Format price in VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const sortOptions = [
    { value: '-createdAt', label: 'Newest' },
    { value: 'createdAt', label: 'Oldest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A-Z' },
    { value: '-name', label: 'Name: Z-A' },
  ];

  return (
    <Layout>
      <div className="container-wide py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-h1 text-text-primary mb-2">
            {onSale ? 'Sale' : currentCategory ? currentCategory : 'All Products'}
          </h1>
          {currentSearch && (
            <p className="text-text-secondary">
              Search results for "{currentSearch}"
            </p>
          )}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={currentSearch}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={currentCategory}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="appearance-none bg-white border-2 border-border-input rounded-md px-4 py-2 pr-10 text-sm font-medium text-text-primary cursor-pointer hover:border-primary focus:border-primary focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="appearance-none bg-white border-2 border-border-input rounded-md px-4 py-2 pr-10 text-sm font-medium text-text-primary cursor-pointer hover:border-primary focus:border-primary focus:outline-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>

            {/* Sale Toggle */}
            <button
              onClick={() => updateFilter('onSale', onSale ? '' : 'true')}
              className={`px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors cursor-pointer ${
                onSale
                  ? 'bg-cta text-white border-cta'
                  : 'bg-white text-text-primary border-border-input hover:border-cta'
              }`}
            >
              On Sale
            </button>

            {/* Clear Filters */}
            {(currentCategory || currentSearch || onSale || currentSort !== '-createdAt') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <ProductGridSkeleton count={12} />
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-error mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg mb-4">No products found</p>
            <button onClick={clearFilters} className="btn btn-outline">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Product Count */}
            <p className="text-sm text-text-muted mb-6">
              Showing {products.length} of {pagination?.total || 0} products
            </p>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  formatPrice={formatPrice}
                  isInWishlist={isInWishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => updateFilter('page', (currentPage - 1).toString())}
                  disabled={!pagination.hasPrev}
                  className="w-11 h-11 flex items-center justify-center rounded-md border-2 border-border-input hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first, last, current, and adjacent pages
                      return (
                        page === 1 ||
                        page === pagination.pages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, arr) => {
                      // Add ellipsis if there's a gap
                      const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                      return (
                        <span key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-text-muted">...</span>
                          )}
                          <button
                            onClick={() => updateFilter('page', page.toString())}
                            className={`w-11 h-11 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                              page === currentPage
                                ? 'bg-primary text-white'
                                : 'hover:bg-surface-secondary text-text-primary'
                            }`}
                          >
                            {page}
                          </button>
                        </span>
                      );
                    })}
                </div>

                <button
                  onClick={() => updateFilter('page', (currentPage + 1).toString())}
                  disabled={!pagination.hasNext}
                  className="w-11 h-11 flex items-center justify-center rounded-md border-2 border-border-input hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

// Product Card Component
const ProductCard = ({ product, formatPrice, isInWishlist, toggleWishlist }) => {
  const hasDiscount = product.discount > 0;
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
  const isOutOfStock = totalStock === 0;
  const inWishlist = isInWishlist(product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="card group overflow-hidden cursor-pointer relative"
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
          inWishlist
            ? 'bg-cta/10 text-cta'
            : 'bg-white/90 hover:bg-white text-text-muted hover:text-cta'
        }`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-cta' : ''}`} />
      </button>

      {/* Image */}
      <div className="relative aspect-square bg-surface-secondary overflow-hidden">
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
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-heading text-text-primary text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text-primary">
            {formatPrice(product.finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-text-muted line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Products;
