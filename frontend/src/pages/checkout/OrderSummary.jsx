import { AlertCircle, ShoppingBag } from 'lucide-react';

export default function OrderSummary({ items, subtotal, shippingFee, total, error, loading, formatPrice }) {
  return (
    <div className="card p-6 sticky top-24">
      <h2 className="font-heading text-lg text-text-primary mb-6 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5" />
        Order Summary
      </h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-3">
            <div className="w-16 h-16 rounded-md overflow-hidden bg-surface-secondary flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary line-clamp-1">{item.name}</p>
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

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Subtotal</span>
          <span className="font-medium text-text-primary">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Shipping</span>
          <span className="font-medium text-text-primary">
            {shippingFee === 0 ? <span className="text-success">Free</span> : formatPrice(shippingFee)}
          </span>
        </div>
        <hr className="border-border" />
        <div className="flex justify-between text-base">
          <span className="font-medium text-text-primary">Total</span>
          <span className="font-bold text-cta text-lg">{formatPrice(total)}</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-error-light text-error text-sm rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && <div className="sr-only">Processing order</div>}
    </div>
  );
}

