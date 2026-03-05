// Task ID: 88cca822, 93b9969c
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Navbar component showing logged-in user name with logout button.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <Link to="/" style={styles.titleLink}>
            <h2 style={styles.title}>Order Management</h2>
          </Link>
        </div>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>
            Dashboard
          </Link>
          <Link to="/orders" style={styles.navLink}>
            Orders
          </Link>
          <Link to="/orders/create" style={styles.navLink}>
            Create Order
          </Link>
          <Link to="/inventory" style={styles.navLink}>
            Inventory
          </Link>
        </div>
        <div style={styles.userSection}>
          <span style={styles.userName}>{user.full_name}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center'
  },
  titleLink: {
    textDecoration: 'none',
    color: 'white'
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  userName: {
    fontSize: '1rem'
  },
  logoutButton: {
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};

export default Navbar;
