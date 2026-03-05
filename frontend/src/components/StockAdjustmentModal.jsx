// Task ID: 93b9969c
import { useState } from 'react';

/**
 * Modal component for adjusting stock levels of inventory items.
 * Allows users to add or remove stock with a simple form.
 */
const StockAdjustmentModal = ({ item, onClose, onSubmit, isLoading }) => {
  const [adjustment, setAdjustment] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (adjustment === 0) {
      setError('Please enter a non-zero adjustment value');
      return;
    }

    // Check if removing more than available
    if (adjustment < 0 && Math.abs(adjustment) > item.quantity) {
      setError(`Cannot remove more than available stock (${item.quantity})`);
      return;
    }

    onSubmit(item.id, adjustment);
  };

  const handleAdjustmentChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setAdjustment(isNaN(value) ? 0 : value);
    setError('');
  };

  const newQuantity = item.quantity + adjustment;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Adjust Stock</h2>
          <button onClick={onClose} style={styles.closeButton} disabled={isLoading}>
            &times;
          </button>
        </div>

        <div style={styles.itemInfo}>
          <p style={styles.itemName}>{item.name}</p>
          <p style={styles.itemSku}>SKU: {item.sku}</p>
          <p style={styles.currentStock}>
            Current Stock: <strong>{item.quantity}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="adjustment" style={styles.label}>
              Adjustment Amount
            </label>
            <div style={styles.inputWrapper}>
              <button
                type="button"
                onClick={() => setAdjustment(adjustment - 1)}
                style={styles.adjustButton}
                disabled={isLoading}
              >
                -
              </button>
              <input
                type="number"
                id="adjustment"
                value={adjustment}
                onChange={handleAdjustmentChange}
                style={styles.input}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setAdjustment(adjustment + 1)}
                style={styles.adjustButton}
                disabled={isLoading}
              >
                +
              </button>
            </div>
            <p style={styles.hint}>
              Use positive values to add stock, negative to remove
            </p>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.preview}>
            <span>New Stock Level: </span>
            <strong style={newQuantity < 0 ? styles.invalidQuantity : styles.validQuantity}>
              {newQuantity < 0 ? 'Invalid' : newQuantity}
            </strong>
            {newQuantity > 0 && newQuantity <= 10 && (
              <span style={styles.restockWarning}> (Will need restock)</span>
            )}
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isLoading || adjustment === 0 || newQuantity < 0}
            >
              {isLoading ? 'Saving...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    width: '100%',
    maxWidth: '420px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.25rem',
    lineHeight: 1
  },
  itemInfo: {
    padding: '1rem 1.5rem',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  itemName: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#1f2937'
  },
  itemSku: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  currentStock: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#374151'
  },
  form: {
    padding: '1.5rem'
  },
  inputGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  adjustButton: {
    width: '40px',
    height: '40px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#f9fafb',
    fontSize: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151'
  },
  input: {
    flex: 1,
    height: '40px',
    padding: '0 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
    textAlign: 'center'
  },
  hint: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  error: {
    margin: '0 0 1rem 0',
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    color: '#dc2626',
    fontSize: '0.875rem'
  },
  preview: {
    padding: '1rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    color: '#374151'
  },
  validQuantity: {
    color: '#059669'
  },
  invalidQuantity: {
    color: '#dc2626'
  },
  restockWarning: {
    color: '#d97706',
    fontSize: '0.85rem'
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    color: '#374151',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  submitButton: {
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default StockAdjustmentModal;
