import { CreditCard, FileText, Loader2, MapPin, Phone, User } from 'lucide-react';
import { formatPriceVnd } from './orderStatusConfig';

export default function OrderSidebar({ order, cancelling, onCancel }) {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Shipping Address
        </h2>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <User className="w-4 h-4 text-text-muted" />
            <span className="font-medium">{order.shippingAddress.fullName}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-text-muted" />
            {order.shippingAddress.phone}
          </p>
          <p className="text-text-secondary pl-6">
            {order.shippingAddress.address}
            {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
            {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
            {order.shippingAddress.city && `, ${order.shippingAddress.city}`}
          </p>
          {order.shippingAddress.note && <p className="text-text-muted pl-6 italic">Note: {order.shippingAddress.note}</p>}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment
        </h2>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between">
            <span className="text-text-muted">Method</span>
            <span className="font-medium capitalize">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-text-muted">Status</span>
            <span
              className={`font-medium capitalize ${
                order.paymentStatus === 'paid'
                  ? 'text-success'
                  : order.paymentStatus === 'failed'
                  ? 'text-error'
                  : 'text-warning'
              }`}
            >
              {order.paymentStatus}
            </span>
          </p>
        </div>

        {order.payment?.method === 'bank_transfer' && order.paymentStatus === 'pending' && (
          <div className="mt-5 p-4 rounded-lg bg-primary-light">
            <p className="text-sm font-semibold text-text-primary mb-2">Bank Transfer Instructions</p>
            {order.payment.bank ? (
              <div className="text-sm text-text-secondary space-y-1">
                <p>
                  <span className="text-text-muted">Bank:</span> {order.payment.bank.name}
                </p>
                <p>
                  <span className="text-text-muted">Account Name:</span> {order.payment.bank.accountName}
                </p>
                <p>
                  <span className="text-text-muted">Account Number:</span> {order.payment.bank.accountNumber}
                </p>
                <p className="pt-2">
                  <span className="text-text-muted">Transfer Note:</span>{' '}
                  <span className="font-semibold text-text-primary">{order.payment.transferNote}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                Bank details are not available. Please contact support.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Summary
        </h2>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between">
            <span className="text-text-muted">Subtotal</span>
            <span>{formatPriceVnd(order.subtotal)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-text-muted">Shipping</span>
            <span>{order.shippingFee === 0 ? 'Free' : formatPriceVnd(order.shippingFee)}</span>
          </p>
          {order.discount > 0 && (
            <p className="flex justify-between text-success">
              <span>Discount</span>
              <span>-{formatPriceVnd(order.discount)}</span>
            </p>
          )}
          <hr className="my-2 border-border" />
          <p className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPriceVnd(order.total)}</span>
          </p>
        </div>
      </div>

      {order.status === 'pending' && (
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelling}
          className="w-full btn btn-outline text-error border-error hover:bg-error hover:text-white disabled:opacity-50"
        >
          {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Order'}
        </button>
      )}
    </div>
  );
}

