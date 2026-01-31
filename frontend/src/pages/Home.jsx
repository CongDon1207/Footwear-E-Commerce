import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import RecentlyViewed from '../components/products/RecentlyViewed';
import api from '../services/api';
import {
  ArrowRight,
  Truck,
  RotateCcw,
  Shield,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredRes, saleRes] = await Promise.all([
          api.get('/products?limit=4&sortBy=-createdAt'),
          api.get('/products?limit=4&onSale=true'),
        ]);
        setFeaturedProducts(featuredRes.data.products || []);
        setSaleProducts(saleRes.data.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [
    { name: 'Men', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', link: '/products?category=Men' },
    { name: 'Women', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', link: '/products?category=Women' },
    { name: 'Kids', image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600', link: '/products?category=Kids' },
    { name: 'Sport', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', link: '/products?category=Sport' },
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free delivery on orders over 500K',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '30-day hassle-free returns',
    },
    {
      icon: Shield,
      title: '100% Authentic',
      description: 'Genuine products guaranteed',
    },
    {
      icon: Sparkles,
      title: 'Quality Service',
      description: '24/7 customer support',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-light via-background to-secondary-light overflow-hidden">
        <div className="container-wide py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-2 bg-cta-light text-cta text-sm font-semibold rounded-full mb-6">
                New Collection Available
              </span>
              <h1 className="text-h1 text-text-primary mb-6 text-balance">
                Step Into Style With Every Walk
              </h1>
              <p className="text-lg text-text-secondary mb-8 max-w-lg mx-auto lg:mx-0">
                Discover premium footwear for every occasion. From sporty sneakers to elegant 
                classics, find the perfect pair that matches your unique style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/products" className="btn btn-cta">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/products?onSale=true" className="btn btn-outline">
                  View Sale
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl transform rotate-3" />
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"
                alt="Featured Sneaker"
                className="relative w-full max-w-lg mx-auto rounded-3xl shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b border-border">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-text-primary mb-1">{feature.title}</h3>
                <p className="text-sm text-text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16">
        <div className="container-wide">
          <div className="text-center mb-10">
            <h2 className="text-h2 text-text-primary mb-3">Shop by Category</h2>
            <p className="text-text-secondary">Find the perfect fit for everyone</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="group relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-heading text-xl text-white mb-2">{category.name}</h3>
                  <span className="inline-flex items-center gap-1 text-sm text-white/80 group-hover:text-white transition-colors">
                    Shop Now
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-surface-secondary">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-h2 text-text-primary mb-2">New Arrivals</h2>
                <p className="text-text-secondary">Check out our latest collection</p>
              </div>
              <Link
                to="/products?sortBy=-createdAt"
                className="hidden md:inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} formatPrice={formatPrice} />
                ))}
              </div>
            )}

            <div className="md:hidden text-center mt-8">
              <Link to="/products?sortBy=-createdAt" className="btn btn-outline">
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sale Products */}
      {saleProducts.length > 0 && (
        <section className="py-16">
          <div className="container-wide">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="inline-block px-3 py-1 bg-cta text-white text-sm font-semibold rounded-full mb-2">
                  Hot Deals
                </span>
                <h2 className="text-h2 text-text-primary">On Sale Now</h2>
              </div>
              <Link
                to="/products?onSale=true"
                className="hidden md:inline-flex items-center gap-2 text-cta font-medium hover:underline"
              >
                View All Sales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {saleProducts.map((product) => (
                <ProductCard key={product._id} product={product} formatPrice={formatPrice} />
              ))}
            </div>

            <div className="md:hidden text-center mt-8">
              <Link to="/products?onSale=true" className="btn btn-cta">
                View All Sales
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      <section className="py-16 bg-surface-secondary">
        <div className="container-wide">
          <RecentlyViewed limit={8} />
        </div>
      </section>

      {/* Newsletter CTA */}
      <NewsletterSection />
    </Layout>
  );
};

// Product Card Component
const ProductCard = ({ product, formatPrice }) => {
  const hasDiscount = product.discount > 0;

  return (
    <Link to={`/products/${product._id}`} className="card group overflow-hidden cursor-pointer">
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

        {/* Badge */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 badge badge-sale">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-heading text-text-primary text-sm md:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
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

// Newsletter Section Component with validation and feedback
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate email
    if (!email.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    // Simulate API call (replace with actual API when available)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus('success');
      setEmail('');
      // Reset to idle after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-16 bg-primary">
      <div className="container-tight text-center text-white">
        <h2 className="font-heading text-2xl md:text-3xl mb-4">
          Get 10% Off Your First Order
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Subscribe to our newsletter for exclusive deals, new arrivals, and style tips.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 py-4 px-6 bg-white/20 backdrop-blur rounded-lg max-w-md mx-auto">
            <Check className="w-5 h-5 text-white" />
            <span className="font-medium">Thanks for subscribing! Check your inbox for your discount code.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Enter your email"
                  disabled={status === 'loading'}
                  className={`w-full px-4 py-3 rounded-md text-text-primary bg-white border-2 focus:ring-2 focus:ring-white/50 focus:outline-none transition-colors disabled:opacity-70 ${
                    status === 'error' ? 'border-error' : 'border-transparent'
                  }`}
                  aria-label="Email address for newsletter"
                  aria-describedby={status === 'error' ? 'newsletter-error' : undefined}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn bg-cta hover:bg-cta-hover text-white px-6 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            {status === 'error' && errorMessage && (
              <div
                id="newsletter-error"
                className="flex items-center justify-center gap-2 mt-3 text-sm text-white/90"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{errorMessage}</span>
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  );
};

export default Home;
