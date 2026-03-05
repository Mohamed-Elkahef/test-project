// Task ID: 1cf37973
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';

/**
 * Dashboard page with metrics and recent orders.
 * Task ID: 1cf37973
 */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.detail || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      processing: '#2196F3',
      shipped: '#9C27B0',
      delivered: '#4CAF50',
      cancelled: '#F44336'
    };
    return colors[status] || '#757575';
  };

  const getStatusBadgeStyle = (status) => ({
    ...styles.statusBadge,
    backgroundColor: `${getStatusColor(status)}20`,
    color: getStatusColor(status),
    border: `1px solid ${getStatusColor(status)}40`
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.loadingContainer}>
            <div style={styles.loader}></div>
            <p style={styles.loadingText}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.errorContainer}>
            <h2 style={styles.errorTitle}>Error Loading Dashboard</h2>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.retryButton} onClick={fetchDashboardData}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Welcome, {user?.full_name}!</h1>
        <p style={styles.subtitle}>
          Here's what's happening with your orders today.
        </p>

        {/* Stat Cards Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIcon} data-color="blue">📊</div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Total Orders</p>
              <p style={styles.statValue}>{summary?.total_orders || 0}</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon} data-color="green">📈</div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Orders Today</p>
              <p style={styles.statValue}>{summary?.orders_today || 0}</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon} data-color="purple">💰</div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Total Revenue</p>
              <p style={styles.statValue}>{formatCurrency(summary?.total_revenue || 0)}</p>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon} data-color="orange">💵</div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Revenue Today</p>
              <p style={styles.statValue}>{formatCurrency(summary?.revenue_today || 0)}</p>
            </div>
          </div>
        </div>

        {/* Status Breakdown Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Orders by Status</h2>
          <div style={styles.statusCardsRow}>
            {Object.entries(summary?.orders_by_status || {}).map(([status, count]) => (
              <div key={status} style={styles.statusCard}>
                <div
                  style={{
                    ...styles.statusCardHeader,
                    backgroundColor: getStatusColor(status)
                  }}
                />
                <div style={styles.statusCardContent}>
                  <p style={styles.statusName}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </p>
                  <p style={styles.statusCount}>{count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Orders</h2>
          <div style={styles.ordersContainer}>
            {summary?.recent_orders && summary.recent_orders.length > 0 ? (
              summary.recent_orders.map((order) => (
                <div
                  key={order.id}
                  style={styles.orderCard}
                  onClick={() => navigate(`/orders`)}
                >
                  <div style={styles.orderHeader}>
                    <div>
                      <p style={styles.orderNumber}>{order.order_number}</p>
                      <p style={styles.customerName}>{order.customer_name}</p>
                    </div>
                    <div style={getStatusBadgeStyle(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                  <div style={styles.orderFooter}>
                    <p style={styles.orderAmount}>{formatCurrency(order.total_amount)}</p>
                    <p style={styles.orderDate}>{formatDate(order.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.noOrders}>
                <p style={styles.noOrdersText}>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '2rem'
  },
  // Loading state styles
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1rem',
    minHeight: '400px'
  },
  loader: {
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '1rem',
    color: '#6b7280',
    fontSize: '1rem'
  },
  // Error state styles
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '2rem auto'
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: '1rem'
  },
  errorText: {
    color: '#6b7280',
    marginBottom: '1.5rem'
  },
  retryButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  // Stats cards row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default'
  },
  statIcon: {
    fontSize: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    borderRadius: '0.5rem',
    backgroundColor: '#f3f4f6'
  },
  statContent: {
    flex: 1
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0
  },
  // Section styles
  section: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem'
  },
  // Status cards
  statusCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem'
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s'
  },
  statusCardHeader: {
    height: '4px',
    width: '100%'
  },
  statusCardContent: {
    padding: '1.25rem',
    textAlign: 'center'
  },
  statusName: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
    fontWeight: '500'
  },
  statusCount: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0
  },
  // Orders container
  ordersContainer: {
    display: 'grid',
    gap: '1rem'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.25rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem'
  },
  orderNumber: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.25rem'
  },
  customerName: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e5e7eb'
  },
  orderAmount: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#059669',
    margin: 0
  },
  orderDate: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0
  },
  // No orders state
  noOrders: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '3rem',
    textAlign: 'center'
  },
  noOrdersText: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0
  }
};

export default Dashboard;
