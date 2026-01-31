import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    total,
    updateQuantity,
    removeItem,
  } = useCart();

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-wide py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-secondary flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-h2 text-text-primary mb-4">Your cart is empty</h1>
          <p className="text-text-secondary mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-wide py-8">
        <h1 className="text-h1 text-text-primary mb-8">
          Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}`}
                className="card p-4 md:p-6"
              >
                <div className="flex gap-4 md:gap-6">
                  {/* Image */}
                  <Link
                    to={`/products/${item.productId}`}
                    className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden bg-surface-secondary"
                  >
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
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-heading text-text-primary hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>

                    <p className="text-sm text-text-muted mt-1">
                      Size: <span className="font-medium">{item.size}</span>
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold text-text-primary">
                        {formatPrice(item.finalPrice)}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-sm text-text-muted line-through">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border-2 border-border-input rounded-md">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity - 1)
                          }
                          className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-surface-secondary cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.size, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId, item.size)}
                        className="p-2 text-text-muted hover:text-error transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total (desktop) */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm text-text-muted">Subtotal</p>
                    <p className="font-semibold text-text-primary">
                      {formatPrice(item.finalPrice * item.quantity)}
                    </p>
                  </div>
                </div>

                {/* Item Total (mobile) */}
                <div className="md:hidden flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <span className="text-sm text-text-muted">Subtotal</span>
                  <span className="font-semibold text-text-primary">
                    {formatPrice(item.finalPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-heading text-lg text-text-primary mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm">
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
                {shippingFee > 0 && (
                  <p className="text-xs text-text-muted">
                    Free shipping for orders over {formatPrice(500000)}
                  </p>
                )}
                <hr className="border-border" />
                <div className="flex justify-between text-base">
                  <span className="font-medium text-text-primary">Total</span>
                  <span className="font-bold text-text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn btn-cta w-full mt-6 justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/products"
                className="block text-center text-sm text-primary hover:underline mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
