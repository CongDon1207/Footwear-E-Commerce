import { useMemo, useState } from 'react';
import api from '../../../services/api';
import { Loader2, X } from 'lucide-react';
import { PAYMENT_STATUS_CONFIG } from './orderUiConfig';

const PAYMENT_TRANSITIONS = {
  pending: ['paid', 'failed'],
  failed: ['pending', 'paid'],
  paid: [],
};

export default function OrderPaymentModal({ order, onClose, onUpdated }) {
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const current = order.paymentStatus || 'pending';
  const allowed = useMemo(() => PAYMENT_TRANSITIONS[current] || [], [current]);

  const handleUpdate = async () => {
    if (!newPaymentStatus || updating) return;

    setUpdating(true);
    try {
      const { data } = await api.patch(`/admin/orders/${order._id}/payment-status`, {
        paymentStatus: newPaymentStatus,
        note: note || undefined,
      });
      onUpdated?.(data.order);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const currentCfg = PAYMENT_STATUS_CONFIG[current];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Payment for #{order.orderNumber}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Method</span>
            <span className="font-medium text-text-primary">{order.paymentMethod}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Current Payment Status
            </label>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${currentCfg?.bg} ${currentCfg?.color}`}>
              {currentCfg?.label || current}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              New Payment Status
            </label>
            <select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select status</option>
              {allowed.map((s) => (
                <option key={s} value={s}>
                  {PAYMENT_STATUS_CONFIG[s]?.label || s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note about this payment change..."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 px-4 border border-border rounded-lg hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={!newPaymentStatus || updating}
            className="flex-1 h-11 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {updating && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Payment
          </button>
        </div>
      </div>
    </div>
  );
}

