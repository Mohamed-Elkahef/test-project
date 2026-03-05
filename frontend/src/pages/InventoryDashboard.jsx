// Task ID: 93b9969c
import { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryService';
import StockAdjustmentModal from '../components/StockAdjustmentModal';

/**
 * Inventory Dashboard page displaying all inventory items in a table.
 * Shows restock badges for items with quantity <= 10.
 * Allows stock adjustment through a modal interface.
 */
const InventoryDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // New item form state
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', sku: '', quantity: 0 });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryService.getInventory();
      setInventory(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err.detail || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setSuccessMessage('');
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleAdjustStock = async (itemId, adjustment) => {
    try {
      setIsAdjusting(true);
      const updatedItem = await inventoryService.adjustStock(itemId, adjustment);

      // Update the inventory list with the updated item
      setInventory(prev =>
        prev.map(item => item.id === itemId ? updatedItem : item)
      );

      setSuccessMessage(`Stock adjusted successfully for ${updatedItem.name}`);
      handleModalClose();
    } catch (err) {
      setError(err.detail || 'Failed to adjust stock');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      setError(null);
      const createdItem = await inventoryService.createInventoryItem(newItem);
      setInventory(prev => [...prev, createdItem]);
      setTotal(prev => prev + 1);
      setNewItem({ name: '', sku: '', quantity: 0 });
      setShowNewItemForm(false);
      setSuccessMessage(`Item "${createdItem.name}" created successfully`);
    } catch (err) {
      setError(err.detail || 'Failed to create inventory item');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading inventory...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Inventory Dashboard</h1>
          <p style={styles.subtitle}>
            Total Items: {total} |
            Needs Restock: {inventory.filter(i => i.needs_restock).length}
          </p>
        </div>
        <button
          onClick={() => setShowNewItemForm(!showNewItemForm)}
          style={styles.addButton}
        >
          {showNewItemForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {successMessage && (
        <div style={styles.success}>
          {successMessage}
          <button
            onClick={() => setSuccessMessage('')}
            style={styles.dismissButton}
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError(null)} style={styles.dismissButton}>
            &times;
          </button>
        </div>
      )}

      {showNewItemForm && (
        <form onSubmit={handleCreateItem} style={styles.newItemForm}>
          <h3 style={styles.formTitle}>Add New Inventory Item</h3>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>Product Name</label>
              <input
                type="text"
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
                style={styles.input}
                placeholder="Enter product name"
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="sku" style={styles.label}>SKU</label>
              <input
                type="text"
                id="sku"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                required
                style={styles.input}
                placeholder="Enter unique SKU"
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="quantity" style={styles.label}>Initial Quantity</label>
              <input
                type="number"
                id="quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value, 10) || 0 })}
                min="0"
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.submitButton} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Item'}
            </button>
          </div>
        </form>
      )}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Last Updated</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyCell}>
                  No inventory items found. Add your first item above.
                </td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id} style={styles.row}>
                  <td style={styles.td}>
                    <span style={styles.itemName}>{item.name}</span>
                  </td>
                  <td style={styles.td}>
                    <code style={styles.sku}>{item.sku}</code>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.quantity,
                      color: item.quantity === 0 ? '#dc2626' :
                             item.needs_restock ? '#d97706' : '#059669'
                    }}>
                      {item.quantity}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {item.needs_restock ? (
                      <span style={styles.restockBadge}>Restock</span>
                    ) : (
                      <span style={styles.inStockBadge}>In Stock</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.date}>{formatDate(item.updated_at)}</span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleAdjustClick(item)}
                      style={styles.adjustButton}
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onClose={handleModalClose}
          onSubmit={handleAdjustStock}
          isLoading={isAdjusting}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },
  title: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  subtitle: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#6b7280'
  },
  addButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
    fontSize: '1.1rem'
  },
  success: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    color: '#065f46',
    marginBottom: '1rem'
  },
  error: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    marginBottom: '1rem'
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: 'inherit',
    padding: '0 0.5rem'
  },
  newItemForm: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  },
  formTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    flexWrap: 'wrap'
  },
  formGroup: {
    flex: '1',
    minWidth: '150px'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    boxSizing: 'border-box'
  },
  submitButton: {
    padding: '0.625rem 1.5rem',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  headerRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  th: {
    padding: '0.875rem 1rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  row: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#374151'
  },
  emptyCell: {
    padding: '3rem 1rem',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.95rem'
  },
  itemName: {
    fontWeight: '500',
    color: '#1f2937'
  },
  sku: {
    backgroundColor: '#f3f4f6',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: '#4b5563'
  },
  quantity: {
    fontWeight: '600',
    fontSize: '0.95rem'
  },
  restockBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  inStockBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  date: {
    color: '#6b7280',
    fontSize: '0.8rem'
  },
  adjustButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    color: '#2563eb',
    border: '1px solid #2563eb',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default InventoryDashboard;
