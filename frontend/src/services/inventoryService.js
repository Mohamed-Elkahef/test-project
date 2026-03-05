// Task ID: 93b9969c
import axios from 'axios';
import authService from './authService';

const API_URL = '/api/inventory/';

/**
 * Inventory service for handling inventory-related API calls.
 */
class InventoryService {
  /**
   * Get authorization headers with access token.
   * @private
   * @returns {Object} Headers object with authorization
   * @throws {Error} If no access token is available
   */
  _getAuthHeaders() {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error('No authentication token available. Please login.');
    }
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Get all inventory items.
   * @param {number} [skip=0] - Number of records to skip
   * @param {number} [limit=100] - Maximum number of records
   * @returns {Promise<Object>} Inventory list response with items and total
   */
  async getInventory(skip = 0, limit = 100) {
    try {
      const response = await axios.get(
        `${API_URL}?skip=${skip}&limit=${limit}`,
        this._getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await authService.refreshToken();
        const retryResponse = await axios.get(
          `${API_URL}?skip=${skip}&limit=${limit}`,
          this._getAuthHeaders()
        );
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to fetch inventory' };
    }
  }

  /**
   * Get a specific inventory item by ID.
   * @param {number} itemId - Inventory item ID
   * @returns {Promise<Object>} Inventory item details
   */
  async getInventoryItem(itemId) {
    try {
      const response = await axios.get(
        `${API_URL}${itemId}`,
        this._getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await authService.refreshToken();
        const retryResponse = await axios.get(
          `${API_URL}${itemId}`,
          this._getAuthHeaders()
        );
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to fetch inventory item' };
    }
  }

  /**
   * Create a new inventory item.
   * @param {Object} itemData - Item creation data
   * @param {string} itemData.name - Product name
   * @param {string} itemData.sku - Unique product SKU
   * @param {number} [itemData.quantity=0] - Initial quantity
   * @returns {Promise<Object>} Created inventory item
   */
  async createInventoryItem(itemData) {
    try {
      const response = await axios.post(API_URL, itemData, this._getAuthHeaders());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await authService.refreshToken();
        const retryResponse = await axios.post(API_URL, itemData, this._getAuthHeaders());
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to create inventory item' };
    }
  }

  /**
   * Adjust stock level for an inventory item.
   * @param {number} itemId - Inventory item ID
   * @param {number} adjustment - Amount to adjust (positive to add, negative to remove)
   * @returns {Promise<Object>} Updated inventory item
   */
  async adjustStock(itemId, adjustment) {
    try {
      const response = await axios.patch(
        `${API_URL}${itemId}/stock`,
        { adjustment },
        this._getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        await authService.refreshToken();
        const retryResponse = await axios.patch(
          `${API_URL}${itemId}/stock`,
          { adjustment },
          this._getAuthHeaders()
        );
        return retryResponse.data;
      }
      throw error.response?.data || { detail: 'Failed to adjust stock' };
    }
  }
}

export default new InventoryService();
