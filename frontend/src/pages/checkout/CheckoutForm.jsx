import { CreditCard, MapPin, Truck } from 'lucide-react';

export default function CheckoutForm({ formData, formErrors, onChange }) {
  return (
    <>
      <div className="card p-6">
        <h2 className="font-heading text-lg text-text-primary mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Shipping Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={onChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                formErrors.fullName ? 'border-error' : 'border-border'
              }`}
            />
            {formErrors.fullName && <p className="text-error text-sm mt-1">{formErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                formErrors.phone ? 'border-error' : 'border-border'
              }`}
            />
            {formErrors.phone && <p className="text-error text-sm mt-1">{formErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={onChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                formErrors.city ? 'border-error' : 'border-border'
              }`}
            />
            {formErrors.city && <p className="text-error text-sm mt-1">{formErrors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={onChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                formErrors.district ? 'border-error' : 'border-border'
              }`}
            />
            {formErrors.district && <p className="text-error text-sm mt-1">{formErrors.district}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={onChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                formErrors.address ? 'border-error' : 'border-border'
              }`}
            />
            {formErrors.address && <p className="text-error text-sm mt-1">{formErrors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Ward (optional)</label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={onChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Note (optional)</label>
            <input
              type="text"
              name="note"
              value={formData.note}
              onChange={onChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-heading text-lg text-text-primary mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Method
        </h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-secondary">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={formData.paymentMethod === 'cod'}
              onChange={onChange}
              className="w-4 h-4 text-primary"
            />
            <div className="flex-1">
              <p className="font-medium text-text-primary">Cash on Delivery</p>
              <p className="text-sm text-text-muted">Pay when the package arrives</p>
            </div>
            <Truck className="w-6 h-6 text-text-muted" />
          </label>

          <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-surface-secondary">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={formData.paymentMethod === 'bank_transfer'}
              onChange={onChange}
              className="w-4 h-4 text-primary"
            />
            <div className="flex-1">
              <p className="font-medium text-text-primary">Bank Transfer</p>
              <p className="text-sm text-text-muted">Transfer after placing the order</p>
            </div>
            <CreditCard className="w-6 h-6 text-text-muted" />
          </label>
        </div>
      </div>
    </>
  );
}

