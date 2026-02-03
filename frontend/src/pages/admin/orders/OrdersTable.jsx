import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  Search,
  Settings,
  CreditCard,
} from 'lucide-react';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, formatDateVi, formatPriceVnd } from './orderUiConfig';

export default function OrdersTable({
  orders,
  loading,
  error,
  page,
  totalPages,
  statusFilter,
  search,
  onSearchChange,
  onStatusFilterChange,
  onSearchSubmit,
  onPrevPage,
  onNextPage,
  onOpenStatusModal,
  onOpenPaymentModal,
}) {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
        <form onSubmit={onSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by order number, name, phone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-light text-error text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-10 flex items-center justify-center text-text-muted gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-10 text-center text-text-muted">No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary text-text-secondary">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                const statusCfg = ORDER_STATUS_CONFIG[order.status];
                const StatusIcon = statusCfg?.icon;
                const paymentCfg = PAYMENT_STATUS_CONFIG[order.paymentStatus || 'pending'];
                const PaymentIcon = paymentCfg?.icon;

                return (
                  <tr key={order._id} className="hover:bg-surface-secondary/60">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{order.orderNumber}</p>
                      <p className="text-xs text-text-muted">{order.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-text-primary">{order.shippingAddress?.fullName || '—'}</p>
                      <p className="text-xs text-text-muted">{order.shippingAddress?.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-text-primary">{formatPriceVnd(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusCfg?.bg} ${statusCfg?.color}`}>
                        {StatusIcon && <StatusIcon className="w-4 h-4" />}
                        {statusCfg?.label || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${paymentCfg?.bg} ${paymentCfg?.color}`}>
                        {PaymentIcon && <PaymentIcon className="w-4 h-4" />}
                        {paymentCfg?.label || order.paymentStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{formatDateVi(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenStatusModal(order)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
                          aria-label="Update order status"
                          title="Update status"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenPaymentModal(order)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
                          aria-label="Update payment status"
                          title="Update payment"
                        >
                          <CreditCard className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrevPage}
              disabled={page === 1}
              className="h-10 w-10 inline-flex items-center justify-center border border-border rounded-lg hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onNextPage}
              disabled={page === totalPages}
              className="h-10 w-10 inline-flex items-center justify-center border border-border rounded-lg hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

