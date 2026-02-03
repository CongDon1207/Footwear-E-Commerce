import { useLocation, Link, useParams } from 'react-router-dom';
import { Layout } from '../components/layout';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Layout>
      <div className="container-tight py-12 md:py-20">
        <div className="text-center mb-10">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-light flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>

          <h1 className="text-h1 text-text-primary mb-4">Order Placed Successfully!</h1>
          <p className="text-text-secondary text-lg">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="card p-6 md:p-8 max-w-lg mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-text-muted">Order Number</p>
              <p className="text-lg font-bold text-primary">{orderNumber}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>

          {order && (
            <>
              <div className="space-y-3 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className="font-medium text-warning capitalize">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Payment</span>
                  <span className="font-medium text-text-primary capitalize">
                    {order.paymentMethod === 'cod'
                      ? 'Cash on Delivery'
                      : order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Amount</span>
                  <span className="font-bold text-text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>

              {order.payment?.method === 'bank_transfer' && order.paymentStatus === 'pending' && (
                <div className="mt-6 p-4 bg-primary-light rounded-md">
                  <p className="text-sm font-medium text-text-primary mb-3">
                    Bank Transfer Instructions
                  </p>
                  {order.payment.bank ? (
                    <div className="space-y-1 text-sm text-text-secondary">
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
                        <span className="font-semibold text-text-primary">
                          {order.payment.transferNote || orderNumber}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">
                      Bank details are not available. Please check Order Details or contact support.
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="mt-6 p-4 bg-surface-secondary rounded-md">
            <p className="text-sm text-text-secondary">
              You can track your order status and payment updates in your account.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
