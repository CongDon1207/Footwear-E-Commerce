import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Truck,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, shippingFee, total, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
    paymentMethod: 'cod',
  });

  const [formErrors, setFormErrors] = useState({});

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid phone number';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.district.trim()) {
      errors.district = 'District is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          note: formData.note,
        },
        paymentMethod: formData.paymentMethod,
      };

      const { data } = await api.post('/orders', orderData);

      // Clear cart on success
      clearCart();

      // Navigate to success page
      navigate(`/order-success/${data.order.orderNumber}`, {
        state: { order: data.order },
      });
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-secondary flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-h2 text-text-primary mb-4">Your cart is empty</h1>
          <p className="text-text-secondary mb-8">
            Add some products to your cart before checkout.
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </Layout>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-secondary flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-warning" />
          </div>
          <h1 className="text-h2 text-text-primary mb-4">Login Required</h1>
          <p className="text-text-secondary mb-8">
            Please login to complete your purchase.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline">
              Create Account
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-wide py-8">
        <h1 className="text-h1 text-text-primary mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-heading text-lg text-text-primary">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`input ${
                        formErrors.fullName ? 'border-error' : ''
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.fullName && (
                      <p className="text-sm text-error mt-1">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input ${
                        formErrors.phone ? 'border-error' : ''
                      }`}
                      placeholder="0912 345 678"
                    />
                    {formErrors.phone && (
                      <p className="text-sm text-error mt-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`input ${
                        formErrors.address ? 'border-error' : ''
                      }`}
                      placeholder="123 Street Name"
                    />
                    {formErrors.address && (
                      <p className="text-sm text-error mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      City/Province *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`input ${
                        formErrors.city ? 'border-error' : ''
                      }`}
                      placeholder="Ho Chi Minh City"
                    />
                    {formErrors.city && (
                      <p className="text-sm text-error mt-1">
                        {formErrors.city}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className={`input ${
                        formErrors.district ? 'border-error' : ''
                      }`}
                      placeholder="District 1"
                    />
                    {formErrors.district && (
                      <p className="text-sm text-error mt-1">
                        {formErrors.district}
                      </p>
                    )}
                  </div>

                  {/* Ward */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Ward (Optional)
                    </label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      className="input"
                      placeholder="Ward name"
                    />
                  </div>

                  {/* Note */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows={3}
                      className="input resize-none"
                      placeholder="Special delivery instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-heading text-lg text-text-primary">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border-2 border-border-input rounded-md cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-sm text-text-muted">
                        Pay when you receive your order
                      </p>
                    </div>
                    <Truck className="w-6 h-6 text-text-muted" />
                  </label>

                  <label className="flex items-center gap-4 p-4 border-2 border-border-input rounded-md cursor-pointer hover:border-primary transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      disabled
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">
                        Bank Transfer
                      </p>
                      <p className="text-sm text-text-muted">Coming soon</p>
                    </div>
                    <CreditCard className="w-6 h-6 text-text-muted" />
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h2 className="font-heading text-lg text-text-primary mb-6">
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-3"
                    >
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-surface-secondary flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-text-muted">
                          Size: {item.size} x {item.quantity}
                        </p>
                        <p className="text-sm font-medium text-text-primary mt-1">
                          {formatPrice(item.finalPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-border mb-4" />

                {/* Totals */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-medium text-text-primary">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="font-medium text-text-primary">
                      {shippingFee === 0 ? (
                        <span className="text-success">Free</span>
                      ) : (
                        formatPrice(shippingFee)
                      )}
                    </span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-base">
                    <span className="font-medium text-text-primary">Total</span>
                    <span className="font-bold text-cta text-lg">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-3 bg-error-light text-error text-sm rounded-md flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-cta w-full mt-6 justify-center disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>

                <p className="text-xs text-text-muted text-center mt-4">
                  By placing this order, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
