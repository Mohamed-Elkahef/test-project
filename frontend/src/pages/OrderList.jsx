// Task ID: 88cca822
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';

/**
 * OrderList page component for displaying paginated orders with filters.
 * Shows orders in a table with status badges, pagination, and filtering options.
 */
const OrderList = () => {
  const navigate = useNavigate();

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Data state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Fetch orders from API with current filters and pagination.
   */
  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        per_page: perPage,
        status: statusFilter || null,
        start_date: startDate || null,
        end_date: endDate || null
      };

      const response = await orderService.getOrdersPaginated(params);
      setOrders(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError(err.detail || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount and when filters/pagination change
  useEffect(() => {
    fetchOrders();
  }, [currentPage, perPage, statusFilter, startDate, endDate]);

  /**
   * Handle filter application.
   */
  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchOrders();
  };

  /**
   * Clear all filters.
   */
  const handleClearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  /**
   * Navigate to previous page.
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Navigate to next page.
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Get color-coded badge style for order status.
   * @param {string} status - Order status
   * @returns {Object} Style object for badge
   */
  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'capitalize'
    };

    switch (status.toLowerCase()) {
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'completed':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
      case 'shipped':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { ...baseStyle, backgroundColor: '#e5e7eb', color: '#374151' };
    }
  };

  /**
   * Format date string to readable format.
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Format currency amount.
   * @param {number|string} amount - Amount to format
   * @returns {string} Formatted currency
   */
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Orders</h1>
            <p style={styles.subtitle}>
              Manage and track all customer orders
            </p>
          </div>
          <button
            onClick={() => navigate('/orders/create')}
            style={styles.createButton}
          >
            + Create Order
          </button>
        </div>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <label htmlFor="statusFilter" style={styles.filterLabel}>
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="shipped">Shipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label htmlFor="startDate" style={styles.filterLabel}>
              From Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.filterInput}
            />
          </div>

          <div style={styles.filterGroup}>
            <label htmlFor="endDate" style={styles.filterLabel}>
              To Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.filterInput}
            />
          </div>

          <div style={styles.filterActions}>
            <button
              onClick={handleApplyFilters}
              style={styles.applyButton}
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              style={styles.clearButton}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Orders Table */}
        <div style={styles.tableContainer}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <p style={styles.loadingText}>Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={styles.emptyContainer}>
              <p style={styles.emptyText}>No orders found</p>
              <p style={styles.emptySubtext}>
                {statusFilter || startDate || endDate
                  ? 'Try adjusting your filters'
                  : 'Create your first order to get started'}
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>Order Number</th>
                  <th style={styles.tableHeader}>Customer</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Items</th>
                  <th style={styles.tableHeader}>Total Amount</th>
                  <th style={styles.tableHeader}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    style={styles.tableRow}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td style={styles.tableCell}>
                      <span style={styles.orderNumber}>{order.order_number}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <div>
                        <div style={styles.customerName}>{order.customer_name}</div>
                        <div style={styles.customerEmail}>{order.customer_email}</div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={getStatusBadgeStyle(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.itemCount}>
                        {order.item_count} {order.item_count === 1 ? 'item' : 'items'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.totalAmount}>
                        {formatCurrency(order.total_amount)}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.dateText}>
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && orders.length > 0 && (
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Showing {((currentPage - 1) * perPage) + 1} to{' '}
              {Math.min(currentPage * perPage, total)} of {total} orders
            </div>

            <div style={styles.paginationControls}>
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                style={{
                  ...styles.paginationButton,
                  ...(currentPage === 1 ? styles.paginationButtonDisabled : {})
                }}
              >
                Previous
              </button>

              <div style={styles.pageNumbers}>
                <span style={styles.pageNumber}>
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.paginationButton,
                  ...(currentPage === totalPages ? styles.paginationButtonDisabled : {})
                }}
              >
                Next
              </button>
            </div>

            <div style={styles.perPageControl}>
              <label htmlFor="perPage" style={styles.perPageLabel}>
                Per page:
              </label>
              <select
                id="perPage"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={styles.perPageSelect}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    paddingBottom: '2rem'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.25rem'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0
  },
  createButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '150px'
  },
  filterLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  filterSelect: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem'
  },
  filterInput: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem'
  },
  filterActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'flex-end'
  },
  applyButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  clearButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
    marginBottom: '1rem'
  },
  errorText: {
    color: '#991b1b',
    fontSize: '0.875rem',
    margin: 0
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    marginBottom: '1.5rem'
  },
  loadingContainer: {
    padding: '3rem',
    textAlign: 'center'
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '1rem'
  },
  emptyContainer: {
    padding: '3rem',
    textAlign: 'center'
  },
  emptyText: {
    color: '#374151',
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '0.5rem'
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: '0.875rem',
    margin: 0
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeaderRow: {
    borderBottom: '2px solid #e5e7eb'
  },
  tableHeader: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    backgroundColor: '#f9fafb'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.15s'
  },
  tableCell: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#111827'
  },
  orderNumber: {
    fontWeight: '600',
    color: '#3b82f6'
  },
  customerName: {
    fontWeight: '500',
    marginBottom: '0.25rem'
  },
  customerEmail: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  itemCount: {
    color: '#6b7280'
  },
  totalAmount: {
    fontWeight: '600',
    color: '#10b981'
  },
  dateText: {
    color: '#6b7280'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  paginationInfo: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  paginationControls: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  paginationButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  paginationButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  pageNumbers: {
    padding: '0 1rem'
  },
  pageNumber: {
    fontSize: '0.875rem',
    color: '#374151',
    fontWeight: '500'
  },
  perPageControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  perPageLabel: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  perPageSelect: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem'
  }
};

export default OrderList;
