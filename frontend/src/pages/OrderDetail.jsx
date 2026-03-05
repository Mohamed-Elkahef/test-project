// Task ID: 09f4a7e6
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';

/**
 * OrderDetail page component for displaying order details and managing status.
 * Shows order information, items, status update controls, and status history timeline.
 */
const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Order state
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update state
  const [validStatuses, setValidStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Status history state
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  /**
   * Fetch order details.
   */
  const fetchOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);

      // Fetch valid next statuses
      const statuses = await orderService.getValidNextStatuses(orderId);
      setValidStatuses(statuses);
      setSelectedStatus(statuses[0] || ''); // Pre-select first valid status
    } catch (err) {
      setError(err.detail || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch order status history.
   */
  const fetchStatusHistory = async () => {
    setLoadingHistory(true);

    try {
      const history = await orderService.getOrderStatusHistory(orderId);
      setStatusHistory(history);
    } catch (err) {
      console.error('Failed to fetch status history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch order and history on component mount
  useEffect(() => {
    fetchOrder();
    fetchStatusHistory();
  }, [orderId]);

  /**
   * Handle status update.
   */
  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      setUpdateError('Please select a status');
      return;
    }

    setUpdatingStatus(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      await orderService.updateOrderStatus(orderId, selectedStatus, statusNotes || null);

      // Show success message
      setUpdateSuccess(true);
      setStatusNotes('');

      // Refresh order and history
      await fetchOrder();
      await fetchStatusHistory();

      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setUpdateError(err.detail || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  /**
   * Get color-coded badge style for order status.
   * @param {string} status - Order status
   * @returns {Object} Style object for badge
   */
  const getStatusBadgeStyle = (status) => {
    const baseStyle = {
      padding: '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-block'
    };

    switch (status?.toLowerCase()) {
      case 'pending':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'processing':
        return { ...baseStyle, backgroundColor: '#ddd6fe', color: '#5b21b6' };
      case 'shipped':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'delivered':
        return { ...baseStyle, backgroundColor: '#d1fae5', color: '#065f46' };
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
            <button onClick={() => navigate('/orders')} style={styles.backButton}>
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <p>Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <button onClick={() => navigate('/orders')} style={styles.backLink}>
              ← Back to Orders
            </button>
            <h1 style={styles.title}>Order Details</h1>
            <p style={styles.subtitle}>{order.order_number}</p>
          </div>
          <div style={getStatusBadgeStyle(order.status)}>
            {order.status}
          </div>
        </div>

        {/* Order Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Order Information</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Customer Name</span>
              <span style={styles.infoValue}>{order.customer_name}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Customer Email</span>
              <span style={styles.infoValue}>{order.customer_email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Total Amount</span>
              <span style={styles.infoValue}>{formatCurrency(order.total_amount)}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Created At</span>
              <span style={styles.infoValue}>{formatDate(order.created_at)}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Updated At</span>
              <span style={styles.infoValue}>{formatDate(order.updated_at)}</span>
            </div>
            {order.notes && (
              <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
                <span style={styles.infoLabel}>Notes</span>
                <span style={styles.infoValue}>{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Order Items</h2>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>Product Name</th>
                <th style={styles.tableHeader}>Quantity</th>
                <th style={styles.tableHeader}>Unit Price</th>
                <th style={styles.tableHeader}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{item.product_name}</td>
                  <td style={styles.tableCell}>{item.quantity}</td>
                  <td style={styles.tableCell}>{formatCurrency(item.unit_price)}</td>
                  <td style={styles.tableCell}>{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status Update Section */}
        {validStatuses.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Update Order Status</h2>

            {updateSuccess && (
              <div style={styles.successBox}>
                <p style={styles.successText}>Status updated successfully!</p>
              </div>
            )}

            {updateError && (
              <div style={styles.errorBox}>
                <p style={styles.errorText}>{updateError}</p>
              </div>
            )}

            <form onSubmit={handleStatusUpdate} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label htmlFor="status" style={styles.label}>
                    New Status <span style={styles.required}>*</span>
                  </label>
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    style={styles.select}
                    required
                  >
                    <option value="">Select status</option>
                    {validStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label htmlFor="notes" style={styles.label}>
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    style={styles.textarea}
                    rows="3"
                    placeholder="Add notes about this status change..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingStatus || !selectedStatus}
                style={{
                  ...styles.submitButton,
                  ...(updatingStatus || !selectedStatus ? styles.submitButtonDisabled : {})
                }}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>
        )}

        {/* Status History Timeline */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Status History</h2>

          {loadingHistory ? (
            <p style={styles.loadingText}>Loading history...</p>
          ) : statusHistory.length === 0 ? (
            <p style={styles.emptyText}>No status changes recorded yet.</p>
          ) : (
            <div style={styles.timeline}>
              {statusHistory.map((entry, index) => (
                <div key={entry.id} style={styles.timelineItem}>
                  <div style={styles.timelineMarker}>
                    <div style={styles.timelineDot} />
                    {index < statusHistory.length - 1 && <div style={styles.timelineLine} />}
                  </div>
                  <div style={styles.timelineContent}>
                    <div style={styles.timelineHeader}>
                      <div style={styles.statusChange}>
                        {entry.old_status && (
                          <>
                            <span style={getStatusBadgeStyle(entry.old_status)}>
                              {entry.old_status}
                            </span>
                            <span style={styles.arrow}>→</span>
                          </>
                        )}
                        <span style={getStatusBadgeStyle(entry.new_status)}>
                          {entry.new_status}
                        </span>
                      </div>
                      <span style={styles.timelineDate}>{formatDate(entry.created_at)}</span>
                    </div>
                    <div style={styles.timelineDetails}>
                      <span style={styles.timelineUser}>Changed by: {entry.changed_by_name}</span>
                      {entry.notes && (
                        <div style={styles.timelineNotes}>
                          <span style={styles.notesLabel}>Notes: </span>
                          <span style={styles.notesText}>{entry.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  loadingContainer: {
    padding: '3rem',
    textAlign: 'center'
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '1rem'
  },
  errorBox: {
    padding: '1.5rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    textAlign: 'center'
  },
  errorText: {
    color: '#991b1b',
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },
  successBox: {
    padding: '1rem',
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    borderRadius: '0.5rem',
    marginBottom: '1rem'
  },
  successText: {
    color: '#065f46',
    fontSize: '0.875rem',
    margin: 0
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem'
  },
  backLink: {
    color: '#3b82f6',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    textDecoration: 'none'
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.25rem'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: 0
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  infoLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  infoValue: {
    fontSize: '0.875rem',
    color: '#111827',
    fontWeight: '500'
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
    borderBottom: '1px solid #e5e7eb'
  },
  tableCell: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#111827'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  required: {
    color: '#dc2626'
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    backgroundColor: 'white'
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    alignSelf: 'flex-start'
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem'
  },
  timelineMarker: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative'
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    border: '2px solid white',
    boxShadow: '0 0 0 2px #3b82f6',
    flexShrink: 0
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginTop: '0.5rem'
  },
  timelineContent: {
    flex: 1,
    paddingBottom: '0.5rem'
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  statusChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  arrow: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: 'bold'
  },
  timelineDate: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  timelineDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  timelineUser: {
    fontSize: '0.875rem',
    color: '#374151',
    fontWeight: '500'
  },
  timelineNotes: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
    fontSize: '0.875rem'
  },
  notesLabel: {
    fontWeight: '500',
    color: '#374151'
  },
  notesText: {
    color: '#6b7280'
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    textAlign: 'center',
    padding: '2rem'
  }
};

export default OrderDetail;
