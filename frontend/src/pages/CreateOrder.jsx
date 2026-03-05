// Task ID: 6c269a18
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';

/**
 * CreateOrder page component for creating new orders.
 * Allows users to add customer information and dynamic line items.
 */
const CreateOrder = () => {
  const navigate = useNavigate();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { product_name: '', quantity: 1, unit_price: '' }
  ]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Calculate subtotal for a single item.
   * @param {Object} item - Order item
   * @returns {number} Calculated subtotal
   */
  const calculateItemSubtotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return quantity * price;
  };

  /**
   * Calculate grand total for all items.
   * @returns {number} Grand total
   */
  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + calculateItemSubtotal(item), 0);
  };

  /**
   * Add a new empty line item.
   */
  const addLineItem = () => {
    setItems([...items, { product_name: '', quantity: 1, unit_price: '' }]);
  };

  /**
   * Remove a line item at specific index.
   * @param {number} index - Index of item to remove
   */
  const removeLineItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  /**
   * Update a line item field.
   * @param {number} index - Index of item to update
   * @param {string} field - Field name to update
   * @param {any} value - New value
   */
  const updateLineItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  /**
   * Validate form data.
   * @returns {boolean} True if valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};

    // Validate customer info
    if (!customerName.trim()) {
      errors.customerName = 'Customer name is required';
    }

    if (!customerEmail.trim()) {
      errors.customerEmail = 'Customer email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errors.customerEmail = 'Invalid email format';
    }

    // Validate items
    if (items.length === 0) {
      errors.items = 'At least one item is required';
    } else {
      items.forEach((item, index) => {
        if (!item.product_name.trim()) {
          errors[`item_${index}_name`] = 'Product name is required';
        }
        if (!item.quantity || item.quantity <= 0) {
          errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
        }
        if (!item.unit_price || item.unit_price <= 0) {
          errors[`item_${index}_price`] = 'Unit price must be greater than 0';
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission.
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        notes: notes || null,
        items: items.map(item => ({
          product_name: item.product_name,
          quantity: parseInt(item.quantity, 10),
          unit_price: parseFloat(item.unit_price)
        }))
      };

      // Create order
      const createdOrder = await orderService.createOrder(orderData);

      // Redirect to order detail (for now, redirect to dashboard)
      navigate('/', {
        state: {
          message: `Order ${createdOrder.order_number} created successfully!`
        }
      });
    } catch (err) {
      setError(err.detail || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Order</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Customer Information Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Customer Information</h2>

            <div style={styles.formGroup}>
              <label htmlFor="customerName" style={styles.label}>
                Customer Name <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  ...styles.input,
                  ...(validationErrors.customerName ? styles.inputError : {})
                }}
                placeholder="Enter customer name"
              />
              {validationErrors.customerName && (
                <p style={styles.errorText}>{validationErrors.customerName}</p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="customerEmail" style={styles.label}>
                Customer Email <span style={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                style={{
                  ...styles.input,
                  ...(validationErrors.customerEmail ? styles.inputError : {})
                }}
                placeholder="customer@example.com"
              />
              {validationErrors.customerEmail && (
                <p style={styles.errorText}>{validationErrors.customerEmail}</p>
              )}
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="notes" style={styles.label}>
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={styles.textarea}
                placeholder="Add any special instructions or notes..."
                rows="3"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Order Items</h2>
              <button
                type="button"
                onClick={addLineItem}
                style={styles.addButton}
              >
                + Add Item
              </button>
            </div>

            {validationErrors.items && (
              <p style={styles.errorText}>{validationErrors.items}</p>
            )}

            <div style={styles.itemsContainer}>
              {items.map((item, index) => (
                <div key={index} style={styles.lineItem}>
                  <div style={styles.lineItemHeader}>
                    <span style={styles.lineItemNumber}>Item #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        style={styles.removeButton}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={styles.lineItemFields}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Product Name <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => updateLineItem(index, 'product_name', e.target.value)}
                        style={{
                          ...styles.input,
                          ...(validationErrors[`item_${index}_name`] ? styles.inputError : {})
                        }}
                        placeholder="Enter product name"
                      />
                      {validationErrors[`item_${index}_name`] && (
                        <p style={styles.errorText}>{validationErrors[`item_${index}_name`]}</p>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Quantity <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                        style={{
                          ...styles.input,
                          ...(validationErrors[`item_${index}_quantity`] ? styles.inputError : {})
                        }}
                      />
                      {validationErrors[`item_${index}_quantity`] && (
                        <p style={styles.errorText}>{validationErrors[`item_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Unit Price ($) <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, 'unit_price', e.target.value)}
                        style={{
                          ...styles.input,
                          ...(validationErrors[`item_${index}_price`] ? styles.inputError : {})
                        }}
                        placeholder="0.00"
                      />
                      {validationErrors[`item_${index}_price`] && (
                        <p style={styles.errorText}>{validationErrors[`item_${index}_price`]}</p>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Subtotal</label>
                      <div style={styles.subtotalDisplay}>
                        ${calculateItemSubtotal(item).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Section */}
          <div style={styles.totalSection}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Grand Total:</span>
              <span style={styles.totalAmount}>${calculateGrandTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <p style={styles.errorBoxText}>{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div style={styles.submitSection}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
            >
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </form>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827'
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '2rem'
  },
  section: {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem'
  },
  formGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  required: {
    color: '#ef4444'
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  textarea: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    marginBottom: 0
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  lineItem: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
    border: '1px solid #e5e7eb'
  },
  lineItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  lineItemNumber: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280'
  },
  removeButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  lineItemFields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  subtotalDisplay: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#e5e7eb',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    display: 'flex',
    alignItems: 'center'
  },
  totalSection: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '2px solid #e5e7eb'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '2rem'
  },
  totalLabel: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#374151'
  },
  totalAmount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#10b981'
  },
  errorBox: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem'
  },
  errorBoxText: {
    color: '#991b1b',
    fontSize: '0.875rem',
    margin: 0
  },
  submitSection: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600'
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  }
};

export default CreateOrder;
