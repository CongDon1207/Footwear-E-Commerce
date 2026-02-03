import { Box } from 'lucide-react';
import { formatPriceVnd } from './orderStatusConfig';

export default function OrderItems({ order }) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <Box className="w-5 h-5" />
        Items
      </h2>

      <div className="space-y-4">
        {order.items.map((item, idx) => (
          <div key={`${item.product_id}-${item.size}-${idx}`} className="flex gap-4 p-4 bg-surface-secondary rounded-lg">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary line-clamp-1">{item.name}</p>
              <p className="text-sm text-text-muted">
                Size: {item.size} • Qty: {item.quantity}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {formatPriceVnd(item.finalPrice)} each
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-text-muted">Subtotal</p>
              <p className="font-semibold text-text-primary">{formatPriceVnd(item.subtotal)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

