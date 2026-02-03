import { useMemo, useState } from 'react';
import api from '../../../services/api';
import { Loader2, X } from 'lucide-react';
import { ORDER_STATUS_CONFIG, VALID_STATUS_TRANSITIONS } from './orderUiConfig';

export default function OrderStatusModal({ order, onClose, onUpdated }) {
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const allowed = useMemo(() => VALID_STATUS_TRANSITIONS[order.status] || [], [order.status]);

  const handleUpdate = async () => {
    if (!newStatus || updating) return;

    setUpdating(true);
    try {
      const { data } = await api.patch(`/admin/orders/${order._id}/status`, {
        status: newStatus,
        note: note || undefined,
      });
      onUpdated?.(data.order);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const currentCfg = ORDER_STATUS_CONFIG[order.status];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Update Order #{order.orderNumber}
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
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Current Status
            </label>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${currentCfg?.bg} ${currentCfg?.color}`}>
              {currentCfg?.label || order.status}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select new status</option>
              {allowed.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_CONFIG[s]?.label || s}
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
              placeholder="Add a note about this status change..."
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
            disabled={!newStatus || updating}
            className="flex-1 h-11 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {updating && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}

