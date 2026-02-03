import { useEffect, useState } from 'react';
import api from '../../../services/api';
import OrdersTable from './OrdersTable';
import OrderStatusModal from './OrderStatusModal';
import OrderPaymentModal from './OrderPaymentModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);

  const fetchOrders = async (nextPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: '10',
      });
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders(1);
  };

  const handleOrderUpdated = (updated) => {
    if (!updated?._id) return;
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
        <p className="text-text-muted mt-1">Manage and track all orders</p>
      </div>

      <OrdersTable
        orders={orders}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        statusFilter={statusFilter}
        search={search}
        onSearchChange={setSearch}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onSearchSubmit={handleSearchSubmit}
        onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
        onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
        onOpenStatusModal={setStatusModalOrder}
        onOpenPaymentModal={setPaymentModalOrder}
      />

      {statusModalOrder && (
        <OrderStatusModal
          order={statusModalOrder}
          onClose={() => setStatusModalOrder(null)}
          onUpdated={(o) => {
            handleOrderUpdated(o);
            setStatusModalOrder(null);
          }}
        />
      )}

      {paymentModalOrder && (
        <OrderPaymentModal
          order={paymentModalOrder}
          onClose={() => setPaymentModalOrder(null)}
          onUpdated={(o) => {
            handleOrderUpdated(o);
            setPaymentModalOrder(null);
          }}
        />
      )}
    </div>
  );
}

