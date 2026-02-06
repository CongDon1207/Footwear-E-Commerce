import { ArrowRight, ChevronRight, Loader2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardOrdersSection({
  formatDate,
  formatPrice,
  getStatusInfo,
  ordersLoading,
  recentOrders,
}) {
  return (
    <div className="lg:col-span-2 bg-surface rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Recent Orders
        </h2>
        <Link
          to="/orders"
          className="text-sm text-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="p-5">
        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-secondary flex items-center justify-center">
              <Package className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-secondary mb-4">No orders yet</p>
            <Link to="/products" className="btn btn-primary btn-sm cursor-pointer">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Link
                  key={order._id}
                  to={`/orders/${order._id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-secondary rounded-xl hover:bg-surface-tertiary transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-border">
                      {order.items?.[0]?.image ? (
                        <img
                          src={order.items[0].image}
                          alt={order.items[0].name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">
                        Order #{order.orderNumber}
                      </p>
                      <p className="text-sm text-text-muted mt-0.5">
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} -{' '}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 sm:mt-0">
                    <p className="font-bold text-text-primary">{formatPrice(order.total)}</p>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusInfo.bgColor}`}
                    >
                      <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                      <span className={`text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted hidden sm:block group-hover:text-primary transition-colors duration-200" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
