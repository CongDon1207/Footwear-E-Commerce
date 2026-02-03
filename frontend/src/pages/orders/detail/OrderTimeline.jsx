import { STATUS_CONFIG, TIMELINE_STEPS, formatDateTimeVi } from './orderStatusConfig';

export default function OrderTimeline({ order }) {
  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStep = statusInfo.step;
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Order Progress</h2>

      {isCancelled ? (
        <div className="p-4 rounded-lg bg-error-light text-error">
          <p className="font-medium">This order has been cancelled.</p>
          {order.cancelReason && <p className="text-sm mt-1">Reason: {order.cancelReason}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {TIMELINE_STEPS.map((key) => {
            const cfg = STATUS_CONFIG[key];
            const Icon = cfg.icon;
            const isDone = cfg.step < currentStep;
            const isCurrent = cfg.step === currentStep;

            return (
              <div key={key} className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDone || isCurrent ? cfg.bg : 'bg-surface-secondary'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isDone || isCurrent ? cfg.color : 'text-text-muted'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDone || isCurrent ? 'text-text-primary' : 'text-text-muted'}`}>
                    {cfg.label}
                  </p>
                  <p className="text-sm text-text-muted">{cfg.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Status Timeline</h3>
          <div className="space-y-3">
            {order.statusHistory
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((item, idx) => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                const Icon = cfg.icon;
                return (
                  <div key={`${item.status}-${item.createdAt}-${idx}`} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-text-primary">{cfg.label}</p>
                        <p className="text-xs text-text-muted">{formatDateTimeVi(item.createdAt)}</p>
                      </div>
                      {item.note && <p className="text-sm text-text-secondary mt-1">{item.note}</p>}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

