// Task ID: c0c28f55
import { useAuth } from '../contexts/AuthContext';

/**
 * Dashboard page - placeholder for main app content.
 * This will be enhanced in F005 feature.
 */
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Welcome, {user?.full_name}!</h1>
        <p style={styles.subtitle}>
          You have successfully logged in to the Order Management System.
        </p>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Dashboard</h2>
          <p style={styles.cardText}>
            This is the main dashboard. More features will be added in upcoming releases.
          </p>
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
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem'
  },
  cardText: {
    color: '#6b7280',
    lineHeight: '1.6'
  }
};

export default Dashboard;
