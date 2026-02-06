import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import {
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Shield,
  ShoppingBag,
} from 'lucide-react';

// Role configuration
const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'text-error', bg: 'bg-error/10', icon: Shield },
  seller: { label: 'Seller', color: 'text-primary', bg: 'bg-primary/10', icon: ShoppingBag },
  user: { label: 'User', color: 'text-text-secondary', bg: 'bg-surface-secondary', icon: Users },
};

/**
 * AdminUsers - List and manage users
 */
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);
  const searchRef = useRef(search);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role', roleFilter);
      if (searchRef.current) params.append('search', searchRef.current);

      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter]);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (page === 1) {
      fetchUsers();
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user, newStatus) => {
    setToggling(user._id);
    try {
      const { data } = await api.patch(`/admin/users/${user._id}/status`, {
        status: newStatus,
      });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data.user : u)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="text-text-muted mt-1">Manage user accounts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-text-muted" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="user">User</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <p className="text-text-secondary">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-secondary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const roleInfo = ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                  const RoleIcon = roleInfo.icon;

                  return (
                    <tr key={user._id} className="hover:bg-surface-secondary/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-semibold">
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-text-primary truncate">
                              {user.full_name || 'No name'}
                            </p>
                            <p className="text-sm text-text-muted truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${roleInfo.bg} ${roleInfo.color}`}
                        >
                          <RoleIcon className="w-4 h-4" />
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                            user.status === 'active'
                              ? 'bg-success/10 text-success'
                              : user.status === 'banned'
                              ? 'bg-error/10 text-error'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.role !== 'admin' && (
                            <>
                              {user.status !== 'banned' ? (
                                <button
                                  onClick={() => handleToggleStatus(user, 'banned')}
                                  disabled={toggling === user._id}
                                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                                  title="Ban user"
                                >
                                  {toggling === user._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <UserX className="w-5 h-5" />
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleStatus(user, 'active')}
                                  disabled={toggling === user._id}
                                  className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors disabled:opacity-50"
                                  title="Activate user"
                                >
                                  {toggling === user._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <UserCheck className="w-5 h-5" />
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-border rounded-lg hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-border rounded-lg hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
